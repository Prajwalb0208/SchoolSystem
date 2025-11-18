import React from 'react';
import { useNavigate } from 'react-router-dom';
import soundEffects from '../utils/soundEffects';
import './GameSelection.css';

const GameSelection = () => {
  const navigate = useNavigate();

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

  const handleGameSelect = (gameId) => {
    soundEffects.playClick();
    navigate(`/game/${gameId}`);
  };

  return (
    <div className="game-selection-page">
      <div className="game-selection-container">
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
      </div>
    </div>
  );
};

export default GameSelection;

