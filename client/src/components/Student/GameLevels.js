import React from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import EasyGame from './games/EasyGame';
import IntermediateGame from './games/IntermediateGame';
import HardGame from './games/HardGame';
import soundEffects from '../../utils/soundEffects';
import './GameLevels.css';

const GameLevels = () => {
  return (
    <div className="game-levels">
      <Routes>
        <Route path="/" element={<GameLevelsHome />} />
        <Route path="/easy/:level" element={<EasyGame />} />
        <Route path="/intermediate/:level" element={<IntermediateGame />} />
        <Route path="/hard/:level" element={<HardGame />} />
      </Routes>
    </div>
  );
};

const GameLevelsHome = () => {
  const navigate = useNavigate();

  const games = [
    {
      id: 'blockrush',
      name: 'Block Rush',
      icon: '🧱',
      description: 'Classic Tetris-style game. Clear lines by arranging falling blocks.',
      color: '#FF6B6B',
      difficulty: 'Easy'
    },
    {
      id: 'snake',
      name: 'Snake Game',
      icon: '🐍',
      description: 'Control a snake, eat food, and grow longer. Avoid hitting walls or yourself!',
      color: '#4ECDC4',
      difficulty: 'Easy'
    },
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
      difficulty: 'Hard'
    },
    {
      id: '2048',
      name: '2048 Game',
      icon: '🔢',
      description: 'Slide tiles to combine numbers and reach 2048!',
      color: '#FFC107',
      difficulty: 'Medium'
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
      name: 'Car Racing',
      icon: '🏎️',
      description: 'Race through traffic! Avoid obstacles and reach the finish line.',
      color: '#FF4444',
      difficulty: 'Medium'
    },
    {
      id: 'stumbleguys',
      name: 'Stumble Guys',
      icon: '🏃',
      description: 'Navigate through obstacle courses! Jump, dodge, and reach the finish.',
      color: '#FF6B9D',
      difficulty: 'Hard'
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

  const difficulties = [
    {
      name: 'Easy',
      totalLevels: 50,
      description: 'Multiple Choice Questions (MCQ) with basic coding concepts',
      color: '#28a745'
    },
    {
      name: 'Intermediate',
      totalLevels: 100,
      description: 'Arrange jumbled code blocks in correct order',
      color: '#ffc107',
      locked: false // Should check if easy levels completed
    },
    {
      name: 'Hard',
      totalLevels: 50,
      description: 'Write code - First 5 to complete correctly pass',
      color: '#dc3545',
      locked: false // Should check if intermediate levels completed
    }
  ];

  const handleGameSelect = (gameId) => {
    soundEffects.playClick();
    navigate(`/game/${gameId}`);
  };

  return (
    <div className="game-levels-home">
      <h1>🎮 Choose Your Game</h1>
      <p className="subtitle">Select a game to play. Quiz will appear after 2 minutes!</p>
      
      <div className="games-section">
        <h2>Fun Games</h2>
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
              <h3>{game.name}</h3>
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
      </div>

      <div className="difficulties-section">
        <h2>Quiz Levels</h2>
        <div className="difficulties-grid">
          {difficulties.map((diff) => (
            <div key={diff.name} className="difficulty-card" style={{ borderColor: diff.color }}>
              <h2 style={{ color: diff.color }}>{diff.name}</h2>
              <p>{diff.description}</p>
              <p className="level-count">{diff.totalLevels} Levels</p>
              {diff.locked ? (
                <button className="btn btn-secondary" disabled>
                  Locked
                </button>
              ) : (
                <Link 
                  to={`/student/games/${diff.name.toLowerCase()}/1`} 
                  className="btn"
                  style={{ background: diff.color, color: 'white' }}
                  onClick={() => soundEffects.playClick()}
                  onMouseEnter={() => soundEffects.playHover()}
                >
                  Start Playing
                </Link>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="game-info-box">
        <h3>📋 How It Works</h3>
        <ul>
          <li>Play any game for 2 minutes</li>
          <li>A quiz with coding questions will appear automatically</li>
          <li>Answer at least 3 out of 5 questions correctly to continue</li>
          <li>Your progress is tracked for each game</li>
        </ul>
      </div>
    </div>
  );
};

export default GameLevels;

