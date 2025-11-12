# Coding Habit Builder - A1 Problem Code

A comprehensive MERN stack application for building coding habits through gamified learning.

## Features

### Student Features
- **Authentication**: Student signup and login with bcrypt encryption
- **Profile Management**: Complete profile with avatars and gallery uploads
- **Game Levels**:
  - **Easy**: 50 levels with MCQ questions (basic coding concepts)
  - **Intermediate**: 100 levels with jumbled code blocks to arrange
  - **Hard**: 50 levels with coding challenges (first 5 to complete pass)
- **Streak System**: Maintain 30 minutes daily playtime to keep streak
- **Badges**: Earn gold badges for speed and accuracy
- **Leaderboard**: Real-time competition with other students
- **Assignments**: View assignments created by teachers
- **Notes**: Download PDF notes for C, C++, Java, Python
- **Settings**: Sound control, notifications, streak reminders

### Teacher Features
- **Authentication**: Teacher signup and login
- **Profile Management**: Update profile with gallery image upload
- **Assignment Management**: Create, read, update, and delete assignments
- **Student Progress Tracking**: Search students by USN to view detailed progress reports
- **Notifications**: Notify students when assignments are created/updated

## Technology Stack

- **Frontend**: React.js
- **Backend**: Node.js, Express.js
- **Database**: MongoDB, Mongoose
- **Real-time**: Socket.io
- **Authentication**: JWT, bcryptjs
- **File Upload**: Multer

## Installation

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or Atlas)

### Backend Setup

1. Navigate to server directory:
```bash
cd server
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the server directory:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/schoolsystem
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRE=7d
```

4. Seed the database with questions:
```bash
node scripts/seedQuestions.js
```

5. Start the server:
```bash
npm run dev
```

### Frontend Setup

1. Navigate to client directory:
```bash
cd client
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the client directory:
```
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_SOCKET_URL=http://localhost:5000
```

4. Start the development server:
```bash
npm start
```

## Project Structure

```
SchoolSystem/
├── server/
│   ├── models/          # MongoDB models
│   ├── routes/          # API routes
│   ├── middleware/      # Auth middleware
│   ├── socket/          # Socket.io handlers
│   ├── scripts/         # Database seeding scripts
│   ├── uploads/         # Uploaded files
│   └── notes/           # PDF notes
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Auth/    # Login/Signup components
│   │   │   ├── Student/ # Student components
│   │   │   └── Teacher/ # Teacher components
│   │   ├── context/     # React context
│   │   └── App.js
│   └── public/
└── README.md
```

## API Endpoints

### Authentication
- `POST /api/auth/student/signup` - Student signup
- `POST /api/auth/student/login` - Student login
- `POST /api/auth/teacher/signup` - Teacher signup
- `POST /api/auth/teacher/login` - Teacher login

### Students
- `GET /api/students/profile` - Get student profile
- `PUT /api/students/profile` - Update student profile
- `POST /api/students/update-streak` - Update streak

### Games
- `GET /api/games/question/:difficulty/:level` - Get question
- `POST /api/games/submit-answer` - Submit answer
- `GET /api/games/leaderboard/:difficulty/:level` - Get leaderboard
- `POST /api/games/leaderboard/add` - Add to leaderboard
- `POST /api/games/check-badge` - Check badge eligibility

### Assignments
- `GET /api/assignments` - Get all assignments
- `POST /api/assignments` - Create assignment (Teacher only)
- `PUT /api/assignments/:id` - Update assignment (Teacher only)
- `DELETE /api/assignments/:id` - Delete assignment (Teacher only)

### Progress
- `GET /api/progress/student/:usn` - Get student progress by USN (Teacher only)

### Notes
- `GET /api/notes` - List available notes
- `GET /api/notes/:language` - Download notes PDF

## Game Mechanics

### Easy Level
- 50 levels
- Multiple choice questions
- Questions trigger every 2 minutes
- Basic coding concepts

### Intermediate Level
- 100 levels
- Code blocks (2-3 lines each) that need to be arranged
- Questions trigger every 2 minutes
- Gold badge for 5 consecutive questions in 45 seconds each

### Hard Level
- 50 levels
- Spinning wheel to select programming language (C, C++, Java, Python)
- Write complete code (15-20 lines)
- Only first 5 students to complete correctly pass
- Others must retry

## Notes

1. Create PDF notes for each programming language and place them in `server/notes/`:
   - `C.pdf`
   - `Cpp.pdf`
   - `Java.pdf`
   - `Python.pdf`

2. The system uses Socket.io for real-time leaderboard updates and notifications.

3. Profile pictures are stored in `server/uploads/profiles/`.

4. Students must complete all easy levels before accessing intermediate, and all intermediate before hard.

## License

This project is created for educational purposes.

