import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import './ShooterGame.css';
import '../Game.css';

const API_URL = process.env.REACT_APP_API_URL || 'https://schoolsystem-lyl7.onrender.com/api';
const GAME_TYPE = 'shooter';

const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;

const ShooterGame = ({ gameRunning, onScoreChange, isPaused }) => {
  const canvasRef = useRef(null);
  const [score, setScore] = useState(0);
  const [playerX, setPlayerX] = useState(CANVAS_WIDTH / 2);
  const [bullets, setBullets] = useState([]);
  const [enemies, setEnemies] = useState([]);
  const [gameOver, setGameOver] = useState(false);
  const animationRef = useRef(null);

  const saveCheckpoint = async () => {
    try {
      const token = localStorage.getItem('token');
      const gameState = { playerX, bullets, enemies, score };
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
      setPlayerX(gameState.playerX || CANVAS_WIDTH / 2);
      setBullets(gameState.bullets || []);
      setEnemies(gameState.enemies || []);
      setScore(savedScore || 0);
      setGameOver(false);
      onScoreChange(savedScore || 0);
      return true;
    } catch (error) {
      return false;
    }
  };

  const handleRetry = () => {
    setScore(0);
    setPlayerX(CANVAS_WIDTH / 2);
    setBullets([]);
    setEnemies([]);
    setGameOver(false);
    onScoreChange(0);
  };

  useEffect(() => {
    if (gameRunning && !isPaused) {
      loadCheckpoint();
    }
  }, [gameRunning]);

  useEffect(() => {
    if (!gameRunning || gameOver || isPaused) return;

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;

    let currentPlayerX = playerX;
    let currentBullets = [...bullets];
    let currentEnemies = [...enemies];
    let currentScore = score;

    const gameLoop = () => {
      ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      
      // Draw player
      ctx.fillStyle = '#4ECDC4';
      ctx.fillRect(currentPlayerX - 25, CANVAS_HEIGHT - 50, 50, 30);

      // Update and draw bullets
      currentBullets = currentBullets.filter(b => {
        ctx.fillStyle = '#FF6B6B';
        ctx.fillRect(b.x, b.y, 5, 10);
        return b.y > 0;
      }).map(b => ({ ...b, y: b.y - 5 }));

      // Spawn enemies
      if (Math.random() < 0.02) {
        currentEnemies.push({ x: Math.random() * (CANVAS_WIDTH - 30), y: 0 });
      }

      // Update and draw enemies
      currentEnemies = currentEnemies.filter(e => {
        ctx.fillStyle = '#FFA07A';
        ctx.fillRect(e.x, e.y, 30, 30);
        return e.y < CANVAS_HEIGHT;
      }).map(e => {
        const newY = e.y + 2;
        if (newY >= CANVAS_HEIGHT - 50 && Math.abs(e.x - currentPlayerX) < 40) {
          setGameOver(true);
        }
        return { ...e, y: newY };
      });

      // Check collisions
      currentBullets = currentBullets.filter(bullet => {
        const hitIndex = currentEnemies.findIndex(e => 
          bullet.x >= e.x && bullet.x <= e.x + 30 &&
          bullet.y >= e.y && bullet.y <= e.y + 30
        );
        if (hitIndex !== -1) {
          currentScore += 10;
          onScoreChange(currentScore);
          setScore(currentScore);
          currentEnemies.splice(hitIndex, 1);
          return false;
        }
        return true;
      });

      // Update state periodically
      setBullets(currentBullets);
      setEnemies(currentEnemies);
      setPlayerX(currentPlayerX);

      if (!gameOver && gameRunning && !isPaused) {
        animationRef.current = requestAnimationFrame(gameLoop);
      }
    };

    gameLoop();
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [gameRunning, gameOver, isPaused, onScoreChange]);

  useEffect(() => {
    if (!gameRunning || gameOver || isPaused) return;
    
    const handleKeyPress = (e) => {
      if (e.key === 'ArrowLeft') setPlayerX(prev => Math.max(25, prev - 10));
      if (e.key === 'ArrowRight') setPlayerX(prev => Math.min(CANVAS_WIDTH - 25, prev + 10));
      if (e.key === ' ') {
        e.preventDefault();
        setBullets(prev => [...prev, { x: playerX, y: CANVAS_HEIGHT - 50 }]);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [gameRunning, gameOver, playerX, isPaused]);

  return (
    <div className="shooter-game-container">
      <canvas ref={canvasRef} width={CANVAS_WIDTH} height={CANVAS_HEIGHT} className="shooter-canvas"></canvas>
      {gameOver && (
        <div className="game-over-overlay">
          <h2>Game Over!</h2>
          <p>Final Score: {score}</p>
          <div className="game-over-buttons">
            <button className="retry-btn" onClick={handleRetry}>🔄 Retry</button>
            <button className="checkpoint-btn" onClick={async () => {
              const loaded = await loadCheckpoint();
              if (loaded) setGameOver(false);
            }}>💾 Load Checkpoint</button>
          </div>
        </div>
      )}
      <div className="shooter-stats">
        <div className="stat-display">Score: {score}</div>
      </div>
      <div className="checkpoint-controls">
        <button className="save-checkpoint-btn" onClick={saveCheckpoint} disabled={!gameRunning || gameOver || isPaused}>
          💾 Save Checkpoint
        </button>
      </div>
    </div>
  );
};

export default ShooterGame;

