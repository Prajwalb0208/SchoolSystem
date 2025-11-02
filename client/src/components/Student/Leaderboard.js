import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import io from 'socket.io-client';
import './Leaderboard.css';

const Leaderboard = ({ difficulty, level }) => {
  const { user, API_URL } = useAuth();
  const [leaderboard, setLeaderboard] = useState(null);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    fetchLeaderboard();

    const newSocket = io(process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000');
    newSocket.on('leaderboard-update', (data) => {
      if (data.difficulty === difficulty && data.level === parseInt(level)) {
        setLeaderboard(data);
      }
    });
    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [difficulty, level]);

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

  if (!leaderboard) {
    return <div className="leaderboard-container">Loading leaderboard...</div>;
  }

  const getRankIcon = (position) => {
    if (position === 1) return '🥇';
    if (position === 2) return '🥈';
    if (position === 3) return '🥉';
    return `#${position}`;
  };

  return (
    <div className="leaderboard-container">
      <h3>Leaderboard - {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)} Level {level}</h3>
      {leaderboard.entries.length === 0 ? (
        <p>No entries yet. Be the first!</p>
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
                    src={`http://localhost:5000${entry.studentProfilePic}`}
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

