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
      difficulty: 'Medium'
    },
    {
      id: 'minesweeper',
      name: 'Minesweeper',
      icon: '💣',
      description: 'Find all mines without detonating them! Use logic and strategy.',
      color: '#795548',
      difficulty: 'Easy'
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

  const handleDownload = async (language) => {
    try {
      // Use localhost for local development
      const apiUrl = API_URL || process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
      const token = localStorage.getItem('token');
      
      const fileNameMap = {
        'C': 'C.pdf',
        'C++': 'Cpp.pdf',
        'Java': 'Java.pdf',
        'Python': 'Python.pdf',
        'JavaScript': 'JavaScript.pdf'
      };
      const fileName = fileNameMap[language];
      
      console.log('Downloading:', `${apiUrl}/notes/${language}`);
      const response = await axios.get(`${apiUrl}/notes/${language}`, {
        responseType: 'blob',
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      
      // Create blob and download
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading notes:', error);
      console.error('Error response:', error.response);
      
      // Fallback: use direct static file link
      const baseUrl = 'http://localhost:5000';
      const fileNameMap = {
        'C': 'C.pdf',
        'C++': 'Cpp.pdf',
        'Java': 'Java.pdf',
        'Python': 'Python.pdf',
        'JavaScript': 'JavaScript.pdf'
      };
      const fileName = fileNameMap[language];
      const staticUrl = `${baseUrl}/notes/${fileName}`;
      
      // Create download link
      const link = document.createElement('a');
      link.href = staticUrl;
      link.setAttribute('download', fileName);
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
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
            <p className="subtitle">Download or view PDF notes for programming languages</p>
            
            {notesLoading ? (
              <div className="loading-spinner">Loading notes...</div>
            ) : (
              <div className="notes-grid">
                {languages.map((lang) => {
                  // Use localhost for local development
                  const baseUrl = 'http://localhost:5000';
                  const fileNameMap = {
                    'C': 'C.pdf',
                    'C++': 'Cpp.pdf',
                    'Java': 'Java.pdf',
                    'Python': 'Python.pdf',
                    'JavaScript': 'JavaScript.pdf'
                  };
                  const fileName = fileNameMap[lang.name];
                  const staticUrl = `${baseUrl}/notes/${fileName}`;
                  
                  return (
                    <div key={lang.name} className="note-card" style={{ borderColor: lang.color }}>
                      <div className="note-icon" style={{ color: lang.color }}>
                        {lang.icon}
                      </div>
                      <h3>{lang.name}</h3>
                      <p>One-page PDF covering intermediate key concepts</p>
                      <button
                        onClick={() => handleDownload(lang.name)}
                        className="download-btn"
                        style={{ background: lang.color }}
                      >
                        Download PDF
                      </button>
                      <a
                        href={staticUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="view-link"
                        style={{ color: lang.color }}
                      >
                        View Online →
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

