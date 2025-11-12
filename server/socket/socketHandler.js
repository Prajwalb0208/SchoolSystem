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

    // Monopoly game handlers
    const monopolyRooms = new Map(); // Store game state per room

    socket.on('join-monopoly', ({ studentId, studentName, studentUSN }) => {
      const roomName = 'monopoly-game';
      socket.join(roomName);

      if (!monopolyRooms.has(roomName)) {
        // Initialize properties
        const PROPERTIES = [
          { name: 'GO', type: 'special', color: '#8B4513' },
          { name: 'Mediterranean Ave', type: 'property', color: '#8B4513', price: 60, rent: 2 },
          { name: 'Community Chest', type: 'special', color: '#DAA520' },
          { name: 'Baltic Ave', type: 'property', color: '#8B4513', price: 60, rent: 4 },
          { name: 'Income Tax', type: 'tax', color: '#FF6347', amount: 200 },
          { name: 'Reading Railroad', type: 'railroad', color: '#000000', price: 200, rent: 25 },
          { name: 'Oriental Ave', type: 'property', color: '#00CED1', price: 100, rent: 6 },
          { name: 'Chance', type: 'special', color: '#FFD700' },
          { name: 'Vermont Ave', type: 'property', color: '#00CED1', price: 100, rent: 6 },
          { name: 'Connecticut Ave', type: 'property', color: '#00CED1', price: 120, rent: 8 },
          { name: 'Jail', type: 'special', color: '#696969' },
          { name: 'St. Charles Place', type: 'property', color: '#FF1493', price: 140, rent: 10 },
          { name: 'Electric Company', type: 'utility', color: '#FFFF00', price: 150, rent: 0 },
          { name: 'States Ave', type: 'property', color: '#FF1493', price: 140, rent: 10 },
          { name: 'Virginia Ave', type: 'property', color: '#FF1493', price: 160, rent: 12 },
          { name: 'Pennsylvania Railroad', type: 'railroad', color: '#000000', price: 200, rent: 25 },
          { name: 'St. James Place', type: 'property', color: '#FF8C00', price: 180, rent: 14 },
          { name: 'Community Chest', type: 'special', color: '#DAA520' },
          { name: 'Tennessee Ave', type: 'property', color: '#FF8C00', price: 180, rent: 14 },
          { name: 'New York Ave', type: 'property', color: '#FF8C00', price: 200, rent: 16 },
          { name: 'Free Parking', type: 'special', color: '#228B22' },
          { name: 'Kentucky Ave', type: 'property', color: '#FF0000', price: 220, rent: 18 },
          { name: 'Chance', type: 'special', color: '#FFD700' },
          { name: 'Indiana Ave', type: 'property', color: '#FF0000', price: 220, rent: 18 },
          { name: 'Illinois Ave', type: 'property', color: '#FF0000', price: 240, rent: 20 },
          { name: 'B&O Railroad', type: 'railroad', color: '#000000', price: 200, rent: 25 },
          { name: 'Atlantic Ave', type: 'property', color: '#FFFF00', price: 260, rent: 22 },
          { name: 'Ventnor Ave', type: 'property', color: '#FFFF00', price: 260, rent: 22 },
          { name: 'Water Works', type: 'utility', color: '#00BFFF', price: 150, rent: 0 },
          { name: 'Marvin Gardens', type: 'property', color: '#FFFF00', price: 280, rent: 24 },
          { name: 'Go To Jail', type: 'special', color: '#8B0000' },
          { name: 'Pacific Ave', type: 'property', color: '#00FF00', price: 300, rent: 26 },
          { name: 'North Carolina Ave', type: 'property', color: '#00FF00', price: 300, rent: 26 },
          { name: 'Community Chest', type: 'special', color: '#DAA520' },
          { name: 'Pennsylvania Ave', type: 'property', color: '#00FF00', price: 320, rent: 28 },
          { name: 'Short Line', type: 'railroad', color: '#000000', price: 200, rent: 25 },
          { name: 'Chance', type: 'special', color: '#FFD700' },
          { name: 'Park Place', type: 'property', color: '#0000FF', price: 350, rent: 35 },
          { name: 'Luxury Tax', type: 'tax', color: '#FF6347', amount: 100 },
          { name: 'Boardwalk', type: 'property', color: '#0000FF', price: 400, rent: 50 }
        ];
        
        const properties = {};
        PROPERTIES.forEach((prop, index) => {
          if (prop.type === 'property' || prop.type === 'railroad' || prop.type === 'utility') {
            properties[index] = { ...prop, owner: null };
          }
        });

        monopolyRooms.set(roomName, {
          players: [],
          currentPlayerIndex: 0,
          gameState: 'waiting',
          properties: properties,
          dice: [1, 1],
          turnOrder: []
        });
      }

      const gameState = monopolyRooms.get(roomName);
      
      // Check if player already exists
      const existingPlayer = gameState.players.find(p => 
        p.id === studentId || p.usn === studentUSN
      );

      if (!existingPlayer) {
        const playerColors = ['#FF4444', '#44FF44', '#4444FF', '#FFFF44', '#FF44FF', '#44FFFF'];
        const newPlayer = {
          id: studentId || `guest-${Date.now()}`,
          name: studentName || 'Player',
          usn: studentUSN || 'GUEST',
          color: playerColors[gameState.players.length % playerColors.length],
          position: 0,
          money: 1500,
          properties: [],
          canRoll: false
        };
        gameState.players.push(newPlayer);
      }

      // Update all players
      gameState.players.forEach((player, index) => {
        player.canRoll = (index === gameState.currentPlayerIndex && gameState.gameState === 'playing');
      });

      io.to(roomName).emit('monopoly-state', gameState);
    });

    socket.on('monopoly-start-game', () => {
      const roomName = 'monopoly-game';
      const gameState = monopolyRooms.get(roomName);

      if (!gameState || gameState.players.length < 2) {
        socket.emit('monopoly-message', {
          message: 'Need at least 2 players to start',
          type: 'error'
        });
        return;
      }

      gameState.gameState = 'playing';
      gameState.currentPlayerIndex = 0;
      gameState.turnOrder = gameState.players.map((_, i) => i);
      
      // Shuffle turn order
      for (let i = gameState.turnOrder.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [gameState.turnOrder[i], gameState.turnOrder[j]] = [gameState.turnOrder[j], gameState.turnOrder[i]];
      }

      gameState.players.forEach((player, index) => {
        player.canRoll = (index === gameState.turnOrder[gameState.currentPlayerIndex]);
      });

      io.to(roomName).emit('monopoly-state', gameState);
      io.to(roomName).emit('monopoly-message', {
        message: 'Game started!',
        type: 'success'
      });
    });

    socket.on('monopoly-roll-dice', ({ studentId }) => {
      const roomName = 'monopoly-game';
      const gameState = monopolyRooms.get(roomName);

      if (!gameState || gameState.gameState !== 'playing') return;

      const currentPlayer = gameState.players[gameState.turnOrder[gameState.currentPlayerIndex]];
      if (currentPlayer.id !== studentId && currentPlayer.usn !== studentId) return;

      // Roll dice
      const dice1 = Math.floor(Math.random() * 6) + 1;
      const dice2 = Math.floor(Math.random() * 6) + 1;
      gameState.dice = [dice1, dice2];

      // Move player
      const totalMove = dice1 + dice2;
      const oldPosition = currentPlayer.position;
      currentPlayer.position = (currentPlayer.position + totalMove) % 40;

      // Check if passed GO
      if (oldPosition + totalMove >= 40) {
        currentPlayer.money += 200;
      }

      currentPlayer.canRoll = false;

      io.to(roomName).emit('monopoly-dice-rolled', {
        playerName: currentPlayer.name,
        dice: gameState.dice
      });

      io.to(roomName).emit('monopoly-player-moved', {
        playerName: currentPlayer.name,
        position: currentPlayer.position
      });

      // Check property
      const propertyIndex = currentPlayer.position;
      const property = gameState.properties[propertyIndex];
      
      if (property && property.owner && property.owner !== currentPlayer.id) {
        // Pay rent
        const rent = property.rent || 10;
        currentPlayer.money -= rent;
        const owner = gameState.players.find(p => p.id === property.owner);
        if (owner) owner.money += rent;
      } else if (property && !property.owner) {
        // Can buy property
        io.to(roomName).emit('monopoly-property-action', {
          property: {
            ...property,
            index: propertyIndex
          }
        });
      }

      io.to(roomName).emit('monopoly-state', gameState);
    });

    socket.on('monopoly-buy-property', ({ studentId, propertyIndex }) => {
      const roomName = 'monopoly-game';
      const gameState = monopolyRooms.get(roomName);

      if (!gameState) return;

      const currentPlayer = gameState.players[gameState.turnOrder[gameState.currentPlayerIndex]];
      if (currentPlayer.id !== studentId && currentPlayer.usn !== studentId) return;

      const property = gameState.properties[propertyIndex];
      if (!property || property.owner || currentPlayer.money < property.price) return;

      currentPlayer.money -= property.price;
      property.owner = currentPlayer.id;
      currentPlayer.properties.push(propertyIndex);

      io.to(roomName).emit('monopoly-message', {
        message: `${currentPlayer.name} bought ${property.name}`,
        type: 'info'
      });

      io.to(roomName).emit('monopoly-state', gameState);
    });

    socket.on('monopoly-pass-turn', ({ studentId }) => {
      const roomName = 'monopoly-game';
      const gameState = monopolyRooms.get(roomName);

      if (!gameState || gameState.gameState !== 'playing') return;

      const currentPlayer = gameState.players[gameState.turnOrder[gameState.currentPlayerIndex]];
      if (currentPlayer.id !== studentId && currentPlayer.usn !== studentId) return;

      // Next player's turn
      gameState.currentPlayerIndex = (gameState.currentPlayerIndex + 1) % gameState.turnOrder.length;
      
      gameState.players.forEach((player, index) => {
        player.canRoll = (index === gameState.turnOrder[gameState.currentPlayerIndex]);
      });

      // Check for winner (player with most money)
      const winner = gameState.players.reduce((max, p) => 
        p.money > max.money ? p : max
      , gameState.players[0]);

      // Simple win condition: player with $3000+ wins
      if (winner.money >= 3000) {
        gameState.gameState = 'finished';
        io.to(roomName).emit('monopoly-game-over', {
          winner: winner.name,
          winnerId: winner.id
        });
      }

      io.to(roomName).emit('monopoly-state', gameState);
    });

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
      
      // Clean up monopoly rooms if empty
      const roomName = 'monopoly-game';
      const gameState = monopolyRooms.get(roomName);
      if (gameState) {
        const room = io.sockets.adapter.rooms.get(roomName);
        if (!room || room.size === 0) {
          monopolyRooms.delete(roomName);
        }
      }
    });
  });
};

