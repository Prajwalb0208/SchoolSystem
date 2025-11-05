import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import './FlappyGame.css';
import '../Game.css';

const API_URL = process.env.REACT_APP_API_URL || 'https://schoolsystem-lyl7.onrender.com/api';
const GAME_TYPE = 'flappy';

const FlappyGame = ({ gameRunning, onScoreChange, isPaused }) => {
  const canvasRef = useRef(null);
  const [birdY, setBirdY] = useState(300);
  const [birdVelocity, setBirdVelocity] = useState(0);
  const [pipes, setPipes] = useState([]);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const animationRef = useRef(null);

  const saveCheckpoint = async () => {
    try {
      const token = localStorage.getItem('token');
      const gameState = { birdY, birdVelocity, pipes, score };
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
      setBirdY(gameState.birdY || 300);
      setBirdVelocity(gameState.birdVelocity || 0);
      setPipes(gameState.pipes || []);
      setScore(savedScore || 0);
      setGameOver(false);
      onScoreChange(savedScore || 0);
      return true;
    } catch (error) {
      return false;
    }
  };

  const handleRetry = () => {
    setBirdY(300);
    setBirdVelocity(0);
    setPipes([]);
    setScore(0);
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

    let currentBirdY = birdY;
    let currentBirdVelocity = birdVelocity;
    let currentPipes = [...pipes];
    let currentScore = score;

    const gameLoop = () => {
      ctx.clearRect(0, 0, 400, 600);
      
      // Update bird
      currentBirdVelocity += 0.5;
      currentBirdY += currentBirdVelocity;

      if (currentBirdY <= 15 || currentBirdY >= 585) {
        setGameOver(true);
      }

      // Draw bird
      ctx.fillStyle = '#FFC107';
      ctx.beginPath();
      ctx.arc(100, currentBirdY, 15, 0, Math.PI * 2);
      ctx.fill();

      // Spawn pipes
      if (currentPipes.length === 0 || currentPipes[currentPipes.length - 1].x < 200) {
        const gap = 150;
        const topHeight = Math.random() * (400 - gap);
        currentPipes.push({ x: 400, top: topHeight, bottom: topHeight + gap, scored: false });
      }

      // Update and draw pipes
      currentPipes = currentPipes.filter(pipe => {
        ctx.fillStyle = '#4CAF50';
        ctx.fillRect(pipe.x, 0, 50, pipe.top);
        ctx.fillRect(pipe.x, pipe.bottom, 50, 600 - pipe.bottom);
        
        // Collision detection
        if (pipe.x <= 115 && pipe.x >= 85 &&
            (currentBirdY <= pipe.top + 15 || currentBirdY >= pipe.bottom - 15)) {
          setGameOver(true);
        }

        // Score
        if (pipe.x < 100 && !pipe.scored) {
          currentScore += 10;
          onScoreChange(currentScore);
          setScore(currentScore);
          pipe.scored = true;
        }

        return pipe.x > -50;
      }).map(pipe => ({ ...pipe, x: pipe.x - 2 }));

      // Update state
      setBirdY(currentBirdY);
      setBirdVelocity(currentBirdVelocity);
      setPipes(currentPipes);

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
      if (e.key === ' ' || e.key === 'ArrowUp') {
        e.preventDefault();
        setBirdVelocity(-8);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [gameRunning, gameOver, isPaused]);

  return (
    <div className="flappy-game-container">
      <canvas ref={canvasRef} width={400} height={600} className="flappy-canvas"></canvas>
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
      <div className="flappy-stats">
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

export default FlappyGame;

