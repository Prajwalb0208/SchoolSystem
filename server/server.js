import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import http from 'http';
import { Server as socketIo } from 'socket.io';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import dotenv from 'dotenv';
import socketHandler from './socket/socketHandler.js';
import authRoutes from './routes/auth.js';
import studentsRoutes from './routes/students.js';
import teachersRoutes from './routes/teachers.js';
import gamesRoutes from './routes/games.js';
import assignmentsRoutes from './routes/assignments.js';
import progressRoutes from './routes/progress.js';
import notesRoutes from './routes/notes.js';
import settingsRoutes from './routes/settings.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const server = http.createServer(app);
// Allow all origins for CORS (no filters)
const allowedOrigins = ['*']; // Allow all origins

// Log allowed origins for debugging
console.log('CORS: Allowing all origins');

const io = new socketIo(server, {
  cors: {
    origin: function(origin, callback) {
      callback(null, true); // Allow all origins
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true
  }
});

// Middleware - CORS configuration (ALLOW ALL ORIGINS)
// Add CORS headers to all responses - allow everything
app.use((req, res, next) => {
  const origin = req.headers.origin;
  
  // Allow all origins
  if (origin) {
    res.header('Access-Control-Allow-Origin', origin);
  } else {
    res.header('Access-Control-Allow-Origin', '*');
  }
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin');
  res.header('Access-Control-Expose-Headers', 'Content-Type, Authorization');
  
  next();
});

// Handle preflight OPTIONS requests explicitly - allow all
app.options('*', (req, res) => {
  const origin = req.headers.origin;
  
  if (origin) {
    res.header('Access-Control-Allow-Origin', origin);
  } else {
    res.header('Access-Control-Allow-Origin', '*');
  }
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Max-Age', '86400'); // 24 hours
  return res.sendStatus(200);
});

// Also use cors middleware as backup - allow all
app.use(cors({
  origin: function(origin, callback) {
    callback(null, true); // Allow all origins
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/notes', express.static(path.join(__dirname, 'notes')));

// Database Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/schoolsystem', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB Connected'))
.catch(err => console.error('MongoDB connection error:', err));

// Socket.io for real-time game competition
socketHandler(io);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/students', studentsRoutes);
app.use('/api/teachers', teachersRoutes);
app.use('/api/games', gamesRoutes);
app.use('/api/assignments', assignmentsRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/notes', notesRoutes);
app.use('/api/settings', settingsRoutes);

// Serve static files from React app build
const buildPath = path.join(__dirname, '../client/build');
if (fs.existsSync(buildPath)) {
  app.use(express.static(buildPath));
  
  // Catch all handler: send back React's index.html file for any non-API routes
  app.get('*', (req, res) => {
    if (!req.path.startsWith('/api')) {
      res.sendFile(path.join(buildPath, 'index.html'));
    }
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!', error: err.message });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
