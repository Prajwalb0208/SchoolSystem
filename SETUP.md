# Setup Guide - Coding Habit Builder

## Prerequisites
- Node.js (v14 or higher)
- MongoDB (local installation or MongoDB Atlas account)
- Git

## Step-by-Step Setup

### 1. Install Dependencies

#### Backend
```bash
cd server
npm install
```

#### Frontend
```bash
cd client
npm install
```

### 2. MongoDB Setup

#### Option A: Local MongoDB
1. Install MongoDB locally
2. Start MongoDB service
3. Use connection string: `mongodb://localhost:27017/schoolsystem`

#### Option B: MongoDB Atlas
1. Create a free account at https://www.mongodb.com/cloud/atlas
2. Create a cluster
3. Get your connection string
4. Replace in `.env` file

### 3. Environment Configuration

#### Backend (.env file in server folder)
Create `server/.env`:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/schoolsystem
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRE=7d
```

#### Frontend (.env file in client folder)
Create `client/.env`:
```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_SOCKET_URL=http://localhost:5000
```

### 4. Generate PDF Notes

From the server directory:
```bash
npm run generate-notes
```

This will create PDF files in `server/notes/`:
- C.pdf
- Cpp.pdf
- Java.pdf
- Python.pdf

### 5. Seed Database with Questions

From the server directory:
```bash
npm run seed
```

This creates:
- 50 Easy level questions (MCQ)
- 100 Intermediate level questions (Code blocks)
- 50 Hard level questions (10 C, 10 C++, 15 Java, 15 Python)

### 6. Create Upload Directories

The server will auto-create these directories, but you can create them manually:
```bash
mkdir -p server/uploads/profiles
mkdir -p server/notes
```

### 7. Start the Application

#### Terminal 1 - Backend Server
```bash
cd server
npm run dev
```

Server will run on http://localhost:5000

#### Terminal 2 - Frontend Client
```bash
cd client
npm start
```

Frontend will run on http://localhost:3000

### 8. Access the Application

1. Open browser: http://localhost:3000
2. Create accounts:
   - Student: Sign up as student with all required fields
   - Teacher: Sign up as teacher

## Testing the Application

### Student Flow
1. Sign up as student
2. Complete profile with all details
3. Go to Games section
4. Start with Easy level
5. Answer questions (questions appear every 2 minutes)
6. Progress through levels
7. View leaderboard
8. Check assignments
9. Download notes

### Teacher Flow
1. Sign up as teacher
2. Go to Assignments section
3. Create new assignment
4. Add questions
5. Go to Student Progress
6. Search by USN to view student progress

## Troubleshooting

### MongoDB Connection Issues
- Ensure MongoDB is running
- Check connection string in `.env`
- For Atlas, whitelist your IP address

### Port Already in Use
- Change PORT in server/.env
- Update REACT_APP_API_URL in client/.env

### CORS Issues
- Check CORS settings in server.js
- Ensure API_URL matches backend URL

### PDF Notes Not Loading
- Run `npm run generate-notes` in server directory
- Check that PDFs exist in `server/notes/`

### Socket.io Connection Issues
- Ensure backend is running
- Check REACT_APP_SOCKET_URL in client/.env
- Check CORS settings in server.js for socket.io

## Production Deployment

### Backend
1. Set NODE_ENV=production
2. Use strong JWT_SECRET
3. Configure proper MongoDB connection
4. Set up SSL/HTTPS
5. Configure CORS for production domain

### Frontend
1. Build: `npm run build`
2. Serve static files (nginx, Apache, etc.)
3. Update API URLs to production endpoints
4. Configure environment variables

## Notes

- Profile pictures are stored locally in `server/uploads/profiles/`
- For production, consider using cloud storage (AWS S3, Cloudinary, etc.)
- Questions are seeded with placeholder content - replace with actual questions
- PDF notes are generated with basic content - customize as needed

