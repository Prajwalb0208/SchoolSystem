import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import io from 'socket.io-client';
import './Leaderboard.css';

const Leaderboard = ({ difficulty, level }) => {
  const { user, API_URL } = useAuth();
  const [leaderboard, setLeaderboard] = useState(null);
  const [socketConnected, setSocketConnected] = useState(false);
  const socketRef = useRef(null);

  const fetchLeaderboard = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${API_URL}/games/leaderboard/${difficulty}/${level}`,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );
      setLeaderboard(response.data);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    }
  };

  useEffect(() => {
    fetchLeaderboard();

    // Initialize socket connection
    const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'https://schoolsystem-lyl7.onrender.com';
    const newSocket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5
    });

    socketRef.current = newSocket;

    // Handle connection events
    newSocket.on('connect', () => {
      console.log('Socket connected for leaderboard:', newSocket.id);
      setSocketConnected(true);
      
      // Join the game room to receive leaderboard updates
      newSocket.emit('join-game', {
        difficulty: difficulty,
        level: parseInt(level),
        studentId: user?.id || null
      });
    });

    newSocket.on('disconnect', () => {
      console.log('Socket disconnected from leaderboard');
      setSocketConnected(false);
    });

    newSocket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      setSocketConnected(false);
    });

    // Listen for leaderboard updates
    newSocket.on('leaderboard-update', (data) => {
      console.log('Leaderboard update received:', data);
      if (data.difficulty === difficulty && data.level === parseInt(level)) {
        // Update leaderboard with entries
        setLeaderboard(prevLeaderboard => ({
          difficulty: data.difficulty,
          level: data.level,
          entries: data.entries || prevLeaderboard?.entries || []
        }));
      }
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.emit('leave-game', {
          difficulty: difficulty,
          level: parseInt(level)
        });
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [difficulty, level, user?.id]);

  if (!leaderboard) {
    return (
      <div className="leaderboard-container">
        <div className="loading-message">
          <div className="spinner"></div>
          <p>Loading leaderboard...</p>
        </div>
      </div>
    );
  }

  const getRankIcon = (position) => {
    if (position === 1) return '🥇';
    if (position === 2) return '🥈';
    if (position === 3) return '🥉';
    return `#${position}`;
  };

  return (
    <div className="leaderboard-container">
      <div className="leaderboard-header">
        <h3>Leaderboard - {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)} Level {level}</h3>
        <div className={`socket-status ${socketConnected ? 'connected' : 'disconnected'}`}>
          <span className="status-dot"></span>
          <span>{socketConnected ? 'Live Updates' : 'Connecting...'}</span>
        </div>
      </div>
      {!leaderboard || leaderboard.entries.length === 0 ? (
        <p className="no-entries">No entries yet. Be the first!</p>
      ) : (
        <div className="leaderboard-list">
          {leaderboard.entries.slice(0, 10).map((entry, index) => (
            <div
              key={entry._id || index}
              className={`leaderboard-entry ${entry.studentId === user?.id ? 'current-user' : ''}`}
            >
              <div className="rank">{getRankIcon(index + 1)}</div>
              <div className="student-info">
                {entry.studentProfilePic ? (
                  <img
                    src={`${process.env.REACT_APP_BASE_URL || 'https://schoolsystem-lyl7.onrender.com'}${entry.studentProfilePic}`}
                    alt={entry.studentName}
                    className="profile-pic"
                  />
                ) : (
                  <div className="profile-pic-placeholder">
                    {entry.studentName?.[0]?.toUpperCase()}
                  </div>
                )}
                <div>
                  <div className="student-name">{entry.studentName}</div>
                  <div className="student-usn">{entry.studentUSN}</div>
                </div>
              </div>
              <div className="score-info">
                <div className="score">{entry.score.toFixed(0)}</div>
                <div className="time">{entry.timeTaken}s</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Leaderboard;

