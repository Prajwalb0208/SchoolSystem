import React, { useState } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
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

  return (
    <div className="game-levels-home">
      <h1>Choose Your Game Level</h1>
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
  );
};

export default GameLevels;

