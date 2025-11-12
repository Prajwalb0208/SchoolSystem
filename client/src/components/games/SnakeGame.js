import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import './SnakeGame.css';
import '../Game.css';

const API_URL = process.env.REACT_APP_API_URL || 'https://schoolsystem-lyl7.onrender.com/api';
const GAME_TYPE = 'snake';

const GRID_SIZE = 20;
const INITIAL_SNAKE = [{ x: 10, y: 10 }];
const INITIAL_DIRECTION = { x: 1, y: 0 };

const SnakeGame = ({ gameRunning, onScoreChange, isPaused, level = 1, onLevelComplete }) => {
  const [snake, setSnake] = useState(INITIAL_SNAKE);
  const [food, setFood] = useState({ x: 15, y: 15 });
  const [direction, setDirection] = useState(INITIAL_DIRECTION);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const gameLoopRef = useRef(null);

  const saveCheckpoint = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const gameState = { snake, food, direction, score };
      await axios.post(
        `${API_URL}/games/checkpoint/save`,
        { gameType: GAME_TYPE, gameState, score, level },
        { headers: token ? { 'Authorization': `Bearer ${token}` } : {} }
      );
      alert('Checkpoint saved!');
    } catch (error) {
      console.error('Error saving checkpoint:', error);
    }
  }, [snake, food, direction, score, level]);

  const loadCheckpoint = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${API_URL}/games/checkpoint/${GAME_TYPE}`,
        { headers: token ? { 'Authorization': `Bearer ${token}` } : {} }
      );
      const { gameState, score: savedScore } = response.data;
      setSnake(gameState.snake || INITIAL_SNAKE);
      setFood(gameState.food || { x: 15, y: 15 });
      setDirection(gameState.direction || INITIAL_DIRECTION);
      setScore(savedScore || 0);
      setGameOver(false);
      onScoreChange(savedScore || 0);
      return true;
    } catch (error) {
      return false;
    }
  }, [onScoreChange]);

  const handleRetry = () => {
    setSnake(INITIAL_SNAKE);
    setFood({ x: 15, y: 15 });
    setDirection(INITIAL_DIRECTION);
    setScore(0);
    setGameOver(false);
    onScoreChange(0);
  };

  useEffect(() => {
    if (gameRunning && !gameOver && !isPaused) {
      loadCheckpoint();
    }
  }, [gameRunning, isPaused, gameOver, loadCheckpoint]);

  useEffect(() => {
    if (!gameRunning || gameOver || isPaused) return;
    const autoSaveInterval = setInterval(() => {
      saveCheckpoint();
    }, 30000);
    return () => clearInterval(autoSaveInterval);
  }, [gameRunning, gameOver, isPaused, saveCheckpoint]);

  const generateFood = useCallback(() => {
    return {
      x: Math.floor(Math.random() * GRID_SIZE),
      y: Math.floor(Math.random() * GRID_SIZE)
    };
  }, []);

  useEffect(() => {
    if (!gameRunning || gameOver || isPaused) return;
    
    const moveSnake = () => {
      setSnake(prevSnake => {
        const head = { ...prevSnake[0] };
        head.x += direction.x;
        head.y += direction.y;

        if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
          setGameOver(true);
          return prevSnake;
        }

        if (prevSnake.some(segment => segment.x === head.x && segment.y === head.y)) {
          setGameOver(true);
          return prevSnake;
        }

        const newSnake = [head, ...prevSnake];

        if (head.x === food.x && head.y === food.y) {
          setFood(generateFood());
          setScore(prev => {
            const newScore = prev + 10 * level;
            onScoreChange(newScore);
            // Check if level threshold reached (200 points per level)
            const LEVEL_THRESHOLD = 200 * level;
            if (newScore >= LEVEL_THRESHOLD && onLevelComplete) {
              setTimeout(() => {
                if (onLevelComplete) onLevelComplete();
              }, 1500);
            }
            return newScore;
          });
        } else {
          newSnake.pop();
        }

        return newSnake;
      });
    };

    const speed = Math.max(100, 300 - (level - 1) * 50);
    gameLoopRef.current = setInterval(moveSnake, speed);
    return () => {
      if (gameLoopRef.current) clearInterval(gameLoopRef.current);
    };
  }, [gameRunning, gameOver, isPaused, direction, food, generateFood, onScoreChange, level, onLevelComplete]);

  useEffect(() => {
    if (!gameRunning || gameOver || isPaused) return;
    
    const handleKeyPress = (e) => {
      switch(e.key) {
        case 'ArrowUp':
          e.preventDefault();
          if (direction.y === 0) setDirection({ x: 0, y: -1 });
          break;
        case 'ArrowDown':
          e.preventDefault();
          if (direction.y === 0) setDirection({ x: 0, y: 1 });
          break;
        case 'ArrowLeft':
          e.preventDefault();
          if (direction.x === 0) setDirection({ x: -1, y: 0 });
          break;
        case 'ArrowRight':
          e.preventDefault();
          if (direction.x === 0) setDirection({ x: 1, y: 0 });
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [gameRunning, gameOver, isPaused, direction]);

  return (
    <div className="snake-game-container">
      <div className="snake-game-board">
        {Array.from({ length: GRID_SIZE }).map((_, row) =>
          Array.from({ length: GRID_SIZE }).map((_, col) => {
            const isSnake = snake.some(seg => seg.x === col && seg.y === row);
            const isHead = snake[0]?.x === col && snake[0]?.y === row;
            const isFood = food.x === col && food.y === row;
            
            return (
              <div
                key={`${row}-${col}`}
                className={`snake-cell ${isSnake ? 'snake' : ''} ${isHead ? 'head' : ''} ${isFood ? 'food' : ''}`}
              />
            );
          })
        )}
      </div>
      {gameOver && (
        <div className="game-over-overlay">
          <h2>Game Over!</h2>
          <p>Final Score: {score}</p>
          <div className="game-over-buttons">
            <button className="retry-btn" onClick={handleRetry}>🔄 Retry</button>
            <button className="checkpoint-btn" onClick={async () => {
              const loaded = await loadCheckpoint();
              if (loaded) {
                setGameOver(false);
              } else {
                alert('No checkpoint available');
              }
            }}>💾 Load Checkpoint</button>
          </div>
        </div>
      )}
      <div className="snake-controls">
        <div className="game-stats-display">
          <div className="stat-display">Score: {score}</div>
          <div className="stat-display">Length: {snake.length}</div>
        </div>
        <div className="controls-info">
          <h3>Controls</h3>
          <div className="control-item">Use Arrow Keys to move</div>
        </div>
        <div className="checkpoint-controls">
          <button className="save-checkpoint-btn" onClick={saveCheckpoint} disabled={!gameRunning || gameOver}>
            💾 Save Checkpoint
          </button>
        </div>
      </div>
    </div>
  );
};

export default SnakeGame;
