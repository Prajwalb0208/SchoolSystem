import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import soundEffects from '../utils/soundEffects';
import { useAuth } from '../context/AuthContext';
import './GameSelection.css';

const GameSelection = () => {
  const navigate = useNavigate();
  const { API_URL } = useAuth();
  const [activeTab, setActiveTab] = useState('games');
  const [notes, setNotes] = useState([]);
  const [notesLoading, setNotesLoading] = useState(true);

  const games = [
    // Original games
    {
      id: 'memory',
      name: 'Memory Match',
      icon: '🧠',
      description: 'Match pairs of cards. Test your memory and concentration skills.',
      color: '#45B7D1',
      difficulty: 'Easy'
    },
    {
      id: 'minesweeper',
      name: 'Minesweeper',
      icon: '💣',
      description: 'Find all mines without detonating them! Use logic and strategy.',
      color: '#795548',
      difficulty: 'Hard'
    },
    {
      id: '2048',
      name: '2048 Game',
      icon: '🔢',
      description: 'Slide tiles to combine numbers and reach 2048!',
      color: '#FFC107',
      difficulty: 'Easy'
    },
    {
      id: 'sudoku',
      name: 'Sudoku',
      icon: '🔢',
      description: 'Fill the 9x9 grid with numbers 1-9. No repeats in rows, columns, or boxes!',
      color: '#607D8B',
      difficulty: 'Hard'
    },
    {
      id: 'carracing',
      name: 'Infinite Cars',
      icon: '🏎️',
      description: 'Race through traffic! Avoid obstacles and reach the finish line.',
      color: '#FF4444',
      difficulty: 'Medium'
    },
    {
      id: 'sonic',
      name: 'Sonic Runner',
      icon: '💨',
      description: 'Run as Sonic! Jump over enemies and collect rings in this endless runner.',
      color: '#00FFFF',
      difficulty: 'Medium'
    },
    {
      id: 'monopoly',
      name: 'Monopoly',
      icon: '🏰',
      description: 'Multiplayer board game! Buy properties, collect rent, and become the richest!',
      color: '#2c3e50',
      difficulty: 'Medium'
    }
  ];

  useEffect(() => {
    if (activeTab === 'notes') {
      fetchNotes();
    }
  }, [activeTab, API_URL]);

  const fetchNotes = async () => {
    try {
      setNotesLoading(true);
      // Use localhost for local development
      const apiUrl = API_URL || process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
      console.log('Fetching notes from:', `${apiUrl}/notes`);
      const response = await axios.get(`${apiUrl}/notes`);
      console.log('Notes response:', response.data);
      setNotes(response.data || []);
      setNotesLoading(false);
    } catch (error) {
      console.error('Error fetching notes:', error);
      console.error('Error details:', error.response?.data);
      // Even if API fails, show all languages as available since PDFs exist
      setNotes([
        { language: 'C', fileName: 'C.pdf', downloadUrl: '/api/notes/C' },
        { language: 'C++', fileName: 'Cpp.pdf', downloadUrl: '/api/notes/C++' },
        { language: 'Java', fileName: 'Java.pdf', downloadUrl: '/api/notes/Java' },
        { language: 'Python', fileName: 'Python.pdf', downloadUrl: '/api/notes/Python' },
        { language: 'JavaScript', fileName: 'JavaScript.pdf', downloadUrl: '/api/notes/JavaScript' }
      ]);
      setNotesLoading(false);
    }
  };

  const handleGameSelect = (gameId) => {
    soundEffects.playClick();
    navigate(`/game/${gameId}`);
  };


  // Google Drive file IDs
  const driveFileIds = {
    'C': '1f201e2q-VRrb7L6FkmyYGBGR5kkf8K-p',
    'C++': '1cC8mW3M9t2MQntln9kSk052mTlK9CDSy',
    'Java': '1GI7RFqNhwDYhdjf3eXMkYRxVZiwXsmqn',
    'Python': '1hWpY_BIZxuY3-QHcEDq08Sn2dewiL8_c',
    'JavaScript': '1FOdEpflFVeKavJ5pxh72pcReu2jhtMr8'
  };

  const languages = [
    { name: 'C', icon: '📘', color: '#00599c' },
    { name: 'C++', icon: '📗', color: '#00599c' },
    { name: 'Java', icon: '☕', color: '#ed8b00' },
    { name: 'Python', icon: '🐍', color: '#3776ab' },
    { name: 'JavaScript', icon: '📜', color: '#f7df1e' }
  ];

  return (
    <div className="game-selection-page">
      <div className="game-selection-container">
        {/* Tabs */}
        <div className="tabs-container">
          <button 
            className={`tab-btn ${activeTab === 'games' ? 'active' : ''}`}
            onClick={() => setActiveTab('games')}
          >
            🎮 Games
          </button>
          <button 
            className={`tab-btn ${activeTab === 'notes' ? 'active' : ''}`}
            onClick={() => setActiveTab('notes')}
          >
            📚 Notes
          </button>
        </div>

        {/* Games Section */}
        {activeTab === 'games' && (
          <>
            <h1>🎮 Choose Your Game</h1>
            <p className="subtitle">Select a game to play. Quiz will appear after 2 minutes!</p>
            
            <div className="games-grid">
          {games.map((game) => (
            <div
              key={game.id}
              className="game-card"
              onClick={() => handleGameSelect(game.id)}
              style={{ borderColor: game.color }}
            >
              <div className="game-icon" style={{ color: game.color }}>
                {game.icon}
              </div>
              <h2>{game.name}</h2>
              <p className="game-description">{game.description}</p>
              <div className="game-meta">
                <span className="difficulty-badge" style={{ background: game.color }}>
                  {game.difficulty}
                </span>
              </div>
              <button 
                className="play-btn"
                style={{ background: game.color }}
                onClick={(e) => {
                  e.stopPropagation();
                  handleGameSelect(game.id);
                }}
              >
                Play Now →
              </button>
            </div>
          ))}
        </div>

            <div className="game-info-box">
              <h3>📋 How It Works</h3>
              <ul>
                <li>Play any game for 2 minutes</li>
                <li>A quiz with coding questions will appear automatically</li>
                <li>Answer at least 60% of questions correctly to continue</li>
                <li>Your progress is tracked for each game</li>
              </ul>
            </div>
          </>
        )}

        {/* Notes Section */}
        {activeTab === 'notes' && (
          <>
            <h1>📚 Programming Notes</h1>
            <p className="subtitle">View PDF notes for programming languages</p>
            
            {notesLoading ? (
              <div className="loading-spinner">Loading notes...</div>
            ) : (
              <div className="notes-grid">
                {languages.map((lang) => {
                  const fileId = driveFileIds[lang.name];
                  // Google Drive view URL
                  const viewUrl = `https://drive.google.com/file/d/${fileId}/view?usp=sharing`;
                  
                  return (
                    <div key={lang.name} className="note-card" style={{ borderColor: lang.color }}>
                      <div className="note-icon" style={{ color: lang.color }}>
                        {lang.icon}
                      </div>
                      <h3>{lang.name}</h3>
                      <p>One-page PDF covering intermediate key concepts</p>
                      <a
                        href={viewUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="view-link"
                        style={{ 
                          color: 'white', 
                          background: lang.color, 
                          padding: '12px 24px', 
                          borderRadius: '8px', 
                          textDecoration: 'none', 
                          display: 'inline-block', 
                          marginTop: '15px', 
                          fontWeight: '600',
                          transition: 'all 0.3s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.transform = 'translateY(-2px)';
                          e.target.style.boxShadow = '0 5px 15px rgba(0,0,0,0.3)';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.transform = 'translateY(0)';
                          e.target.style.boxShadow = 'none';
                        }}
                      >
                        View PDF →
                      </a>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default GameSelection;

