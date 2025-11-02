# Quick Start Guide

## One-Command Setup (After Installing Dependencies)

### Backend Setup
```bash
cd server
npm install
npm run setup
```

This will:
1. Create necessary directories
2. Generate PDF notes
3. Seed database with questions

Then start server:
```bash
npm run dev
```

### Frontend Setup
```bash
cd client
npm install
npm start
```

## First Steps After Starting

1. **Create a Student Account**
   - Go to http://localhost:3000
   - Click "Sign up as student"
   - Fill in all required fields (username, email, password, name, phone, USN, DOB)
   - Choose an avatar or upload profile picture
   - Complete signup

2. **Create a Teacher Account**
   - Go to http://localhost:3000
   - Click "Sign up as teacher"
   - Fill in required fields
   - Upload profile picture (gallery only)

3. **As Student:**
   - Go to Games section
   - Start with Easy Level 1
   - Answer MCQ questions
   - Progress through levels
   - View leaderboard

4. **As Teacher:**
   - Go to Assignments section
   - Create new assignment
   - Add questions
   - Go to Student Progress
   - Search by USN

## Important Notes

- Questions appear every 5 minutes in Easy and Intermediate levels
- Hard level requires spinning wheel to select programming language
- Only first 5 students to complete Hard level correctly pass
- Maintain 30 minutes daily playtime to keep streak
- Gold badge earned for 5 consecutive intermediate questions in 45 seconds each

## Default Credentials

None - You must create your own accounts. The system doesn't include default users for security.

## Environment Variables Required

### server/.env
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/schoolsystem
JWT_SECRET=change_this_to_a_random_string
JWT_EXPIRE=7d
```

### client/.env
```
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_SOCKET_URL=http://localhost:5000
```

