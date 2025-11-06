import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import './Game2048.css';
import '../Game.css';

const API_URL = process.env.REACT_APP_API_URL || 'https://schoolsystem-lyl7.onrender.com/api';
const GAME_TYPE = '2048';

const GRID_SIZE = 4;

const Game2048 = ({ gameRunning, onScoreChange, isPaused, level = 1, onLevelComplete }) => {
  const TARGET_TILE = level === 1 ? 64 : level === 2 ? 128 : level === 3 ? 256 : level === 4 ? 512 : 2048;
  const [grid, setGrid] = useState(Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(0)));
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);

  const addRandomTile = useCallback((board) => {
    const empty = [];
    board.forEach((row, r) => row.forEach((cell, c) => {
      if (cell === 0) empty.push({ r, c });
    }));
    if (empty.length) {
      const { r, c } = empty[Math.floor(Math.random() * empty.length)];
      board[r][c] = Math.random() < 0.9 ? 2 : 4;
    }
    return board;
  }, []);

  const initializeGrid = useCallback(() => {
    let newGrid = Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(0));
    newGrid = addRandomTile(addRandomTile(newGrid));
    setGrid(newGrid);
    setScore(0);
    setGameOver(false);
    setWon(false);
    onScoreChange(0);
  }, [addRandomTile, onScoreChange]);

  const saveCheckpoint = async () => {
    try {
      const token = localStorage.getItem('token');
      const gameState = { grid, score };
      await axios.post(
        `${API_URL}/games/checkpoint/save`,
        { gameType: GAME_TYPE, gameState, score, level },
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
      setGrid(gameState.grid || Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(0)));
      setScore(savedScore || 0);
      setGameOver(false);
      setWon(false);
      onScoreChange(savedScore || 0);
      return true;
    } catch (error) {
      return false;
    }
  };

  const handleRetry = () => {
    initializeGrid();
  };

  useEffect(() => {
    if (gameRunning && !isPaused) {
      loadCheckpoint().then(loaded => {
        if (!loaded) initializeGrid();
      });
    }
  }, [gameRunning, initializeGrid, isPaused, level]);

  const move = (direction) => {
    if (!gameRunning || gameOver || isPaused) return;
    
    let newGrid = grid.map(row => [...row]);
    let moved = false;
    let newScore = score;

    const rotate = (board) => {
      const rotated = Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(0));
      for (let r = 0; r < GRID_SIZE; r++) {
        for (let c = 0; c < GRID_SIZE; c++) {
          rotated[c][GRID_SIZE - 1 - r] = board[r][c];
        }
      }
      return rotated;
    };

    if (direction === 'right') newGrid = rotate(rotate(newGrid));
    if (direction === 'up') newGrid = rotate(rotate(rotate(newGrid)));
    if (direction === 'down') newGrid = rotate(newGrid);

    for (let r = 0; r < GRID_SIZE; r++) {
      const row = newGrid[r].filter(cell => cell !== 0);
      const merged = [];
      for (let i = 0; i < row.length; i++) {
        if (i < row.length - 1 && row[i] === row[i + 1]) {
          merged.push(row[i] * 2);
          newScore += row[i] * 2;
          if (row[i] * 2 === TARGET_TILE && !won) {
            setWon(true);
            // Trigger level complete after a short delay
            setTimeout(() => {
              if (onLevelComplete) onLevelComplete();
            }, 1000);
          }
          i++;
        } else {
          merged.push(row[i]);
        }
      }
      while (merged.length < GRID_SIZE) merged.push(0);
      if (JSON.stringify(newGrid[r]) !== JSON.stringify(merged)) moved = true;
      newGrid[r] = merged;
    }

    if (direction === 'right') newGrid = rotate(rotate(newGrid));
    if (direction === 'up') newGrid = rotate(newGrid);
    if (direction === 'down') newGrid = rotate(rotate(rotate(newGrid)));

    if (moved) {
      newGrid = addRandomTile(newGrid);
      setGrid(newGrid);
      setScore(newScore);
      onScoreChange(newScore);
    }

    // Check game over
    const canMove = newGrid.some((row, r) => 
      row.some((cell, c) => {
        if (cell === 0) return true;
        return (r < GRID_SIZE - 1 && newGrid[r + 1][c] === cell) ||
               (c < GRID_SIZE - 1 && newGrid[r][c + 1] === cell);
      })
    );
    if (!canMove) setGameOver(true);
  };

  useEffect(() => {
    if (!gameRunning || gameOver || isPaused) return;
    
    const handleKeyPress = (e) => {
      if (e.key === 'ArrowLeft') move('left');
      if (e.key === 'ArrowRight') move('right');
      if (e.key === 'ArrowUp') move('up');
      if (e.key === 'ArrowDown') move('down');
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [gameRunning, gameOver, grid, isPaused]);

  return (
    <div className="game2048-container">
      <div className="game2048-grid">
        {grid.map((row, r) =>
          row.map((cell, c) => (
            <div key={`${r}-${c}`} className={`game2048-cell ${cell ? `tile-${cell}` : ''}`}>
              {cell || ''}
            </div>
          ))
        )}
      </div>
      {(gameOver || won) && (
        <div className="game-over-overlay">
          <h2>{won ? '🎉 You Won!' : 'Game Over!'}</h2>
          <p>Final Score: {score}</p>
          <div className="game-over-buttons">
            <button className="retry-btn" onClick={handleRetry}>🔄 Retry</button>
            <button className="checkpoint-btn" onClick={async () => {
              const loaded = await loadCheckpoint();
              if (loaded) {
                setGameOver(false);
                setWon(false);
              }
            }}>💾 Load Checkpoint</button>
          </div>
        </div>
      )}
      <div className="game2048-stats">
        <div className="stat-display">Score: {score}</div>
        <div className="stat-display">Target: {TARGET_TILE}</div>
      </div>
      <div className="checkpoint-controls">
        <button className="save-checkpoint-btn" onClick={saveCheckpoint} disabled={!gameRunning || gameOver || isPaused}>
          💾 Save Checkpoint
        </button>
      </div>
    </div>
  );
};

export default Game2048;

