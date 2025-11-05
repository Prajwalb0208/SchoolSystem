import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import './ProgressTracking.css';

const ProgressTracking = () => {
  const { API_URL } = useAuth();
  const [usn, setUsn] = useState('');
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [autoRefresh, setAutoRefresh] = useState(false);

  const fetchProgress = async () => {
    if (!usn.trim()) return;

    setLoading(true);
    setError('');
    
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/progress/student/${usn}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setProgress(response.data);
    } catch (error) {
      setError(error.response?.data?.message || 'Student not found');
      setProgress(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    await fetchProgress();
  };

  useEffect(() => {
    if (autoRefresh && usn.trim()) {
      const interval = setInterval(() => {
        fetchProgress();
      }, 5000); // Refresh every 5 seconds
      return () => clearInterval(interval);
    }
  }, [autoRefresh, usn]);

  return (
    <div className="progress-container">
      <h1>Student Progress Tracking</h1>
      
      <form onSubmit={handleSearch} className="search-form">
        <div className="form-group">
          <label>Search by USN</label>
          <input
            type="text"
            value={usn}
            onChange={(e) => setUsn(e.target.value.toUpperCase())}
            placeholder="Enter Student USN (e.g., 1MS20CS001)"
            required
          />
        </div>
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Searching...' : 'Search'}
        </button>
        {progress && (
          <button 
            type="button" 
            className={`btn ${autoRefresh ? 'btn-danger' : 'btn-success'}`}
            onClick={() => setAutoRefresh(!autoRefresh)}
            style={{ marginLeft: '10px' }}
          >
            {autoRefresh ? '⏸️ Stop Auto-Refresh' : '▶️ Start Auto-Refresh'}
          </button>
        )}
      </form>

      {error && <div className="error-message">{error}</div>}

      {progress && (
        <div className="progress-report">
          <div className="progress-header">
            <div className="student-photo">
              {progress.profilePicture ? (
                <img
                  src={`${process.env.REACT_APP_BASE_URL || 'https://schoolsystem-lyl7.onrender.com'}${progress.profilePicture}`}
                  alt={progress.name}
                />
              ) : (
                <div className="photo-placeholder">
                  {progress.name?.[0]?.toUpperCase()}
                </div>
              )}
            </div>
            <div className="student-info">
              <h2>{progress.name || progress.usn}</h2>
              <p><strong>USN:</strong> {progress.usn}</p>
              <p><strong>Email:</strong> {progress.email || 'N/A'}</p>
              <p><strong>Phone:</strong> {progress.phone || 'N/A'}</p>
            </div>
          </div>

          <div className="progress-stats">
            <div className="stat-box">
              <h3>Streak Level</h3>
              <p className="stat-value">{progress.streakLevel || 0}</p>
              <p className="stat-label">Days</p>
            </div>

            <div className="stat-box">
              <h3>Total Badges</h3>
              <p className="stat-value">{progress.totalBadges || 0}</p>
              <p className="stat-label">Badges</p>
            </div>

            <div className="stat-box">
              <h3>Wins</h3>
              <p className="stat-value">{progress.wins || 0}</p>
              <p className="stat-label">Total Wins</p>
            </div>

            <div className="stat-box">
              <h3>Accuracy</h3>
              <p className="stat-value">{progress.accuracy || '0%'}</p>
              <p className="stat-label">Correct Answers</p>
            </div>
          </div>

          <div className="level-progress">
            <h3>Game Progress by Game Type</h3>
            {progress.gameProgress && progress.gameProgress.length > 0 ? (
              progress.gameProgress.map((game, idx) => (
                <div key={idx} className="level-item">
                  <span className="game-name">{game.gameType.charAt(0).toUpperCase() + game.gameType.slice(1)}:</span>
                  <span className="level-count">
                    Score: {game.totalScore || 0} | Games: {game.gamesPlayed || 0} | Quizzes Passed: {game.quizzesPassed || 0}
                  </span>
                  <div className="progress-bar">
                    <div
                      className="progress-fill"
                      style={{ width: `${Math.min(((game.quizzesPassed || 0) / Math.max(game.gamesPlayed || 1, 1)) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>
              ))
            ) : (
              <p>No game progress yet</p>
            )}
          </div>

          {progress.badges && progress.badges.length > 0 && (
            <div className="badges-section">
              <h3>Badges Earned</h3>
              <div className="badges-list">
                {progress.badges.map((badge, idx) => (
                  <div key={idx} className={`badge badge-${badge.type}`}>
                    <span className="badge-icon">
                      {badge.type === 'gold' ? '🥇' : badge.type === 'silver' ? '🥈' : '🥉'}
                    </span>
                    <span className="badge-text">{badge.type.toUpperCase()}</span>
                    {badge.description && (
                      <span className="badge-desc">{badge.description}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="additional-info">
            <p><strong>Last Played:</strong> {progress.lastPlayedDate ? new Date(progress.lastPlayedDate).toLocaleDateString() : 'Never'}</p>
            <p><strong>Daily Play Time:</strong> {progress.dailyPlayTime || 0} minutes</p>
            <p><strong>Total Sessions:</strong> {progress.totalSessions || 0}</p>
            <p><strong>Correct Answers:</strong> {progress.correctSessions || 0}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProgressTracking;

