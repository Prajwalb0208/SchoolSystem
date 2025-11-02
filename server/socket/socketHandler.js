const GameSession = require('../models/GameSession');
const Leaderboard = require('../models/Leaderboard');
const Student = require('../models/Student');

module.exports = (io) => {
  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // Join game room for a specific level
    socket.on('join-game', async ({ difficulty, level, studentId }) => {
      const roomName = `game-${difficulty}-${level}`;
      socket.join(roomName);
      
      // Emit current leaderboard to the user
      try {
        let leaderboard = await Leaderboard.findOne({ difficulty, level });
        if (leaderboard) {
          leaderboard.entries.sort((a, b) => {
            if (b.score !== a.score) return b.score - a.score;
            return a.timeTaken - b.timeTaken;
          });

          const populatedEntries = await Promise.all(
            leaderboard.entries.slice(0, 20).map(async (entry) => {
              const student = await Student.findById(entry.studentId).select('name usn profilePicture');
              return {
                ...entry.toObject(),
                studentName: student?.name || 'Unknown',
                studentUSN: student?.usn || 'N/A',
                studentProfilePic: student?.profilePicture || ''
              };
            })
          );

          socket.emit('leaderboard-update', {
            difficulty,
            level,
            entries: populatedEntries
          });
        }
      } catch (error) {
        console.error('Error fetching leaderboard:', error);
      }
    });

    // Handle answer submission and broadcast to room
    socket.on('submit-answer', async ({ difficulty, level, studentId, score, timeTaken }) => {
      const roomName = `game-${difficulty}-${level}`;
      
      try {
        const student = await Student.findById(studentId).select('name usn profilePicture');
        
        if (!student) return;

        let leaderboard = await Leaderboard.findOne({ difficulty, level });
        
        if (!leaderboard) {
          leaderboard = new Leaderboard({
            difficulty,
            level,
            entries: []
          });
        }

        // Check if student already has an entry
        const existingIndex = leaderboard.entries.findIndex(
          e => e.studentId.toString() === studentId.toString()
        );

        const entry = {
          studentId,
          studentName: student.name,
          studentUSN: student.usn,
          studentProfilePic: student.profilePicture,
          score,
          timeTaken,
          completedAt: new Date()
        };

        if (existingIndex >= 0) {
          leaderboard.entries[existingIndex] = entry;
        } else {
          leaderboard.entries.push(entry);
        }

        // Sort entries
        leaderboard.entries.sort((a, b) => {
          if (b.score !== a.score) return b.score - a.score;
          return a.timeTaken - b.timeTaken;
        });

        // For hard level, keep only top 5
        if (difficulty === 'hard') {
          leaderboard.entries = leaderboard.entries.slice(0, 5);
        }

        await leaderboard.save();

        // Broadcast updated leaderboard to all in room
        const populatedEntries = await Promise.all(
          leaderboard.entries.slice(0, 20).map(async (entry) => {
            const student = await Student.findById(entry.studentId).select('name usn profilePicture');
            return {
              ...entry.toObject(),
              studentName: student?.name || 'Unknown',
              studentUSN: student?.usn || 'N/A',
              studentProfilePic: student?.profilePicture || ''
            };
          })
        );

        io.to(roomName).emit('leaderboard-update', {
          difficulty,
          level,
          entries: populatedEntries
        });
      } catch (error) {
        console.error('Error updating leaderboard:', error);
      }
    });

    // Handle notification for assignments
    socket.on('assignment-created', ({ assignmentId, title }) => {
      io.emit('new-assignment', {
        assignmentId,
        title,
        message: `New assignment: ${title}`
      });
    });

    // Handle streak reminder
    socket.on('request-streak-reminder', ({ studentId }) => {
      // This would typically check if student hasn't played today
      // For now, just acknowledge
      socket.emit('streak-reminder', {
        message: 'Remember to maintain your streak! Play for 30 minutes today.'
      });
    });

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
    });
  });
};

