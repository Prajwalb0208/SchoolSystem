import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import './ArrowsGame.css';
import '../Game.css';
import API_URL from '../../config';
const GAME_TYPE = 'arrows';

const ARROWS = ['↑', '↓', '←', '→'];
const ARROW_KEYS = {
  '↑': 'ArrowUp',
  '↓': 'ArrowDown',
  '←': 'ArrowLeft',
  '→': 'ArrowRight'
};

const ArrowsGame = ({ gameRunning, onScoreChange, isPaused }) => {
  const [currentArrow, setCurrentArrow] = useState(null);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [speed, setSpeed] = useState(2000);
  const [missed, setMissed] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const timerRef = useRef(null);

  const saveCheckpoint = async () => {
    try {
      const token = localStorage.getItem('token');
      const gameState = { score, combo, speed, missed };
      await axios.post(
        `${API_URL}/games/checkpoint/save`,
        { gameType: GAME_TYPE, gameState, score, level: 1 },
        { headers: token ? { 'Authorization': `Bearer ${token}` } : {} }
      );
    } catch (error) {
      console.error('Error saving checkpoint:', error);
    }
  };

  const loadCheckpoint = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${API_URL}/games/checkpoint/${GAME_TYPE}`,
        { headers: token ? { 'Authorization': `Bearer ${token}` } : {} }
      );
      const { gameState, score: savedScore } = response.data;
      setScore(savedScore || 0);
      setCombo(gameState.combo || 0);
      setSpeed(gameState.speed || 2000);
      setMissed(gameState.missed || 0);
      setGameOver(false);
      onScoreChange(savedScore || 0);
      return true;
    } catch (error) {
      return false;
    }
  };

  const handleRetry = () => {
    setScore(0);
    setCombo(0);
    setSpeed(2000);
    setMissed(0);
    setGameOver(false);
    setCurrentArrow(null);
    onScoreChange(0);
  };

  useEffect(() => {
    if (gameRunning && !isPaused) {
      loadCheckpoint();
    }
  }, [gameRunning]);

  useEffect(() => {
    if (!gameRunning || gameOver || isPaused) return;
    
    const showNextArrow = () => {
      const randomArrow = ARROWS[Math.floor(Math.random() * ARROWS.length)];
      setCurrentArrow(randomArrow);
      
      timerRef.current = setTimeout(() => {
        if (currentArrow === randomArrow) {
          setMissed(prev => {
            const newMissed = prev + 1;
            if (newMissed >= 5) {
              setGameOver(true);
            }
            return newMissed;
          });
          setCombo(0);
          setCurrentArrow(null);
        }
      }, speed);
    };

    showNextArrow();
    const interval = setInterval(showNextArrow, speed);

    return () => {
      clearInterval(interval);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [gameRunning, gameOver, speed, isPaused, currentArrow]);

  useEffect(() => {
    if (!gameRunning || gameOver || isPaused) return;
    
    const handleKeyPress = (e) => {
      if (!currentArrow) return;
      
      if (e.key === ARROW_KEYS[currentArrow]) {
        if (timerRef.current) clearTimeout(timerRef.current);
        setScore(prev => {
          const newScore = prev + 10 + combo * 2;
          onScoreChange(newScore);
          return newScore;
        });
        setCombo(prev => prev + 1);
        setSpeed(prev => Math.max(800, prev - 50));
        setCurrentArrow(null);
      } else if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        setMissed(prev => {
          const newMissed = prev + 1;
          if (newMissed >= 5) {
            setGameOver(true);
          }
          return newMissed;
        });
        setCombo(0);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [gameRunning, gameOver, currentArrow, combo, isPaused, onScoreChange]);

  return (
    <div className="arrows-game-container">
      <div className="arrows-display">
        {currentArrow && !gameOver ? (
          <div className="arrow-display">{currentArrow}</div>
        ) : (
          <div className="arrow-display">Ready!</div>
        )}
      </div>
      {gameOver && (
        <div className="game-over-overlay">
          <h2>Game Over!</h2>
          <p>Final Score: {score}</p>
          <p>Max Combo: {combo}</p>
          <div className="game-over-buttons">
            <button className="retry-btn" onClick={handleRetry}>🔄 Retry</button>
            <button className="checkpoint-btn" onClick={async () => {
              const loaded = await loadCheckpoint();
              if (loaded) setGameOver(false);
            }}>💾 Load Checkpoint</button>
          </div>
        </div>
      )}
      <div className="arrows-stats">
        <div className="stat-display">Score: {score}</div>
        <div className="stat-display">Combo: {combo}x</div>
        <div className="stat-display">Missed: {missed}/5</div>
      </div>
      <div className="checkpoint-controls">
        <button className="save-checkpoint-btn" onClick={saveCheckpoint} disabled={!gameRunning || gameOver || isPaused}>
          💾 Save Checkpoint
        </button>
      </div>
    </div>
  );
};

export default ArrowsGame;

