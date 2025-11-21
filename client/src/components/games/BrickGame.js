import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import './BrickGame.css';
import '../Game.css';
import API_URL from '../../config';
const GAME_TYPE = 'brick';

const BRICK_ROWS = 5;
const BRICK_COLS = 10;

const BrickGame = ({ gameRunning, onScoreChange, isPaused }) => {
  const canvasRef = useRef(null);
  const [score, setScore] = useState(0);
  const [paddleX, setPaddleX] = useState(350);
  const [ball, setBall] = useState({ x: 400, y: 500, dx: 3, dy: -3 });
  const [bricks, setBricks] = useState([]);
  const [gameOver, setGameOver] = useState(false);
  const animationRef = useRef(null);

  const initBricks = useCallback(() => {
    const newBricks = [];
    for (let row = 0; row < BRICK_ROWS; row++) {
      for (let col = 0; col < BRICK_COLS; col++) {
        newBricks.push({
          x: col * 80 + 10,
          y: row * 30 + 50,
          destroyed: false
        });
      }
    }
    setBricks(newBricks);
  }, []);

  const saveCheckpoint = async () => {
    try {
      const token = localStorage.getItem('token');
      const gameState = { paddleX, ball, bricks, score };
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
      setPaddleX(gameState.paddleX || 350);
      setBall(gameState.ball || { x: 400, y: 500, dx: 3, dy: -3 });
      setBricks(gameState.bricks || []);
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
    setPaddleX(350);
    setBall({ x: 400, y: 500, dx: 3, dy: -3 });
    initBricks();
    setGameOver(false);
    onScoreChange(0);
  };

  useEffect(() => {
    if (gameRunning && !isPaused) {
      loadCheckpoint().then(loaded => {
        if (!loaded) initBricks();
      });
    }
  }, [gameRunning, initBricks, isPaused]);

  useEffect(() => {
    if (!gameRunning || gameOver || isPaused) return;

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;

    const gameLoop = () => {
      ctx.clearRect(0, 0, 800, 600);
      
      // Draw paddle
      ctx.fillStyle = '#4ECDC4';
      ctx.fillRect(paddleX, 580, 100, 10);

      // Update ball
      setBall(prev => {
        let newX = prev.x + prev.dx;
        let newY = prev.y + prev.dy;
        let newDx = prev.dx;
        let newDy = prev.dy;

        // Wall collisions
        if (newX <= 5 || newX >= 795) newDx = -newDx;
        if (newY <= 5) newDy = -newDy;

        // Paddle collision
        if (newY >= 575 && newY <= 585 && newX >= paddleX && newX <= paddleX + 100) {
          newDy = -Math.abs(newDy);
        }

        // Bottom collision
        if (newY >= 595) {
          setGameOver(true);
        }

        // Brick collisions
        setBricks(prevBricks => {
          return prevBricks.map(brick => {
            if (!brick.destroyed &&
                newX >= brick.x && newX <= brick.x + 75 &&
                newY >= brick.y && newY <= brick.y + 25) {
              newDy = -newDy;
              setScore(s => {
                const newScore = s + 10;
                onScoreChange(newScore);
                return newScore;
              });
              return { ...brick, destroyed: true };
            }
            return brick;
          });
        });

        return { x: newX, y: newY, dx: newDx, dy: newDy };
      });

      // Draw ball
      ctx.fillStyle = '#FF6B6B';
      ctx.beginPath();
      ctx.arc(ball.x, ball.y, 8, 0, Math.PI * 2);
      ctx.fill();

      // Draw bricks
      bricks.forEach(brick => {
        if (!brick.destroyed) {
          ctx.fillStyle = '#FFA07A';
          ctx.fillRect(brick.x, brick.y, 75, 25);
        }
      });

      // Check win
      if (bricks.every(b => b.destroyed)) {
        setScore(prev => {
          const newScore = prev + 100;
          onScoreChange(newScore);
          return newScore;
        });
        initBricks();
      }

      animationRef.current = requestAnimationFrame(gameLoop);
    };

    gameLoop();
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [gameRunning, gameOver, paddleX, ball, bricks, isPaused, onScoreChange, initBricks]);

  useEffect(() => {
    if (!gameRunning || gameOver || isPaused) return;
    
    const handleKeyPress = (e) => {
      if (e.key === 'ArrowLeft') setPaddleX(prev => Math.max(0, prev - 10));
      if (e.key === 'ArrowRight') setPaddleX(prev => Math.min(700, prev + 10));
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [gameRunning, gameOver, isPaused]);

  return (
    <div className="brick-game-container">
      <canvas ref={canvasRef} width={800} height={600} className="brick-canvas"></canvas>
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
      <div className="brick-stats">
        <div className="stat-display">Score: {score}</div>
        <div className="stat-display">Bricks Left: {bricks.filter(b => !b.destroyed).length}</div>
      </div>
      <div className="checkpoint-controls">
        <button className="save-checkpoint-btn" onClick={saveCheckpoint} disabled={!gameRunning || gameOver || isPaused}>
          💾 Save Checkpoint
        </button>
      </div>
    </div>
  );
};

export default BrickGame;

