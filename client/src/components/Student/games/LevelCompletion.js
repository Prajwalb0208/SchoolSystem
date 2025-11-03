import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import soundEffects from '../../../utils/soundEffects';
import './LevelCompletion.css';

const LevelCompletion = ({ 
  isCorrect, 
  score, 
  level, 
  difficulty, 
  maxLevel, 
  explanation,
  timeTaken,
  nextLevelPath,
  onClose,
  specialAchievement = null
}) => {
  const navigate = useNavigate();
  const [showCelebration, setShowCelebration] = useState(false);
  const [stars, setStars] = useState([]);

  useEffect(() => {
    soundEffects.updateSettings();
    
    if (isCorrect) {
      soundEffects.playLevelUp();
      setShowCelebration(true);
      generateStars();
    } else {
      soundEffects.playError();
    }
  }, [isCorrect]);

  const generateStars = () => {
    const newStars = [];
    for (let i = 0; i < 50; i++) {
      newStars.push({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        delay: Math.random() * 1,
        duration: 1 + Math.random() * 2
      });
    }
    setStars(newStars);
  };

  const handleNext = () => {
    soundEffects.playClick();
    if (onClose) {
      onClose();
    } else if (nextLevelPath) {
      navigate(nextLevelPath);
    } else {
      navigate('/student/games');
    }
  };

  const difficultyColors = {
    easy: '#28a745',
    intermediate: '#ffc107',
    hard: '#dc3545'
  };

  const color = difficultyColors[difficulty] || '#667eea';

  return (
    <div className={`level-completion-overlay ${showCelebration ? 'celebrating' : ''}`}>
      <div className="completion-backdrop" onClick={handleNext}></div>
      
      <div className={`completion-card ${isCorrect ? 'success' : 'error'}`}>
        {/* Celebration stars */}
        {showCelebration && (
          <div className="stars-container">
            {stars.map(star => (
              <div
                key={star.id}
                className="celebration-star"
                style={{
                  left: `${star.x}%`,
                  top: `${star.y}%`,
                  animationDelay: `${star.delay}s`,
                  animationDuration: `${star.duration}s`
                }}
              >
                ⭐
              </div>
            ))}
          </div>
        )}

        {/* Main content */}
        <div className="completion-icon">
          {isCorrect ? (
            <div className="success-icon">
              <svg viewBox="0 0 100 100" className="checkmark">
                <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="4" className="circle" />
                <path d="M30 50 L45 65 L70 35" fill="none" stroke="currentColor" strokeWidth="6" className="check" />
              </svg>
            </div>
          ) : (
            <div className="error-icon">❌</div>
          )}
        </div>

        <h1 className="completion-title">
          {isCorrect ? '🎉 Level Complete!' : 'Try Again'}
        </h1>

        {isCorrect && (
          <>
            <div className="score-display-large">
              <div className="score-label">Score</div>
              <div className="score-number">{Math.round(score || 0)}</div>
            </div>

            <div className="stats-grid">
              <div className="stat-item">
                <div className="stat-icon">⏱️</div>
                <div className="stat-value">{timeTaken || 0}s</div>
                <div className="stat-label">Time Taken</div>
              </div>
              <div className="stat-item">
                <div className="stat-icon">📊</div>
                <div className="stat-value">Level {level}</div>
                <div className="stat-label">Completed</div>
              </div>
            </div>

            {specialAchievement && (
              <div className="achievement-badge">
                <div className="achievement-icon">🏆</div>
                <div className="achievement-text">{specialAchievement}</div>
              </div>
            )}
          </>
        )}

        {explanation && (
          <div className="explanation-section">
            <h3>Explanation</h3>
            <p>{explanation}</p>
          </div>
        )}

        <div className="completion-actions">
          {isCorrect ? (
            <button 
              onClick={handleNext}
              className="btn-next-level"
              style={{ background: color }}
            >
              {level >= maxLevel ? '🎮 Back to Games' : 'Next Level →'}
            </button>
          ) : (
            <button 
              onClick={handleNext}
              className="btn-retry"
            >
              🔄 Try Again
            </button>
          )}
        </div>

        {/* Progress visualization */}
        {isCorrect && (
          <div className="progress-visualization">
            <div className="progress-bar-container">
              <div 
                className="progress-bar-fill"
                style={{ 
                  width: `${(level / maxLevel) * 100}%`,
                  background: color
                }}
              />
            </div>
            <div className="progress-text">
              Progress: {level} / {maxLevel} levels
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LevelCompletion;

