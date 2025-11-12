import React, { useState } from 'react';
import './LevelComplete.css';

const LevelComplete = ({ level, score, onNextLevel, onContinue }) => {
  const [showAnimation, setShowAnimation] = useState(true);

  React.useEffect(() => {
    const timer = setTimeout(() => setShowAnimation(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="level-complete-overlay">
      <div className={`level-complete-card ${showAnimation ? 'animate' : ''}`}>
        <div className="celebration-animation">
          <div className="confetti confetti-1">🎉</div>
          <div className="confetti confetti-2">⭐</div>
          <div className="confetti confetti-3">🎊</div>
          <div className="confetti confetti-4">🏆</div>
          <div className="confetti confetti-5">💎</div>
        </div>
        <div className="level-complete-content">
          <div className="level-complete-icon">🎯</div>
          <h2>Level {level} Complete!</h2>
          <p className="completion-message">Congratulations! You've mastered this level!</p>
          <div className="completion-stats">
            <div className="stat-badge">
              <span className="stat-icon">⭐</span>
              <span className="stat-text">Score: {score}</span>
            </div>
            <div className="stat-badge">
              <span className="stat-icon">🎮</span>
              <span className="stat-text">Level {level}/5</span>
            </div>
          </div>
          {level < 5 ? (
            <div className="level-complete-actions">
              <button 
                className="next-level-btn"
                onClick={onNextLevel}
              >
                🚀 Next Level
              </button>
              <button 
                className="continue-btn"
                onClick={onContinue}
              >
                Continue Current Level
              </button>
            </div>
          ) : (
            <div className="level-complete-actions">
              <div className="max-level-badge">🏆 Maximum Level Reached!</div>
              <button 
                className="continue-btn"
                onClick={onContinue}
              >
                Continue Playing
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LevelComplete;




