import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import './MinesweeperGame.css';
import '../Game.css';

const API_URL = process.env.REACT_APP_API_URL || 'https://schoolsystem-lyl7.onrender.com/api';
const GAME_TYPE = 'minesweeper';

const MinesweeperGame = ({ gameRunning, onScoreChange, isPaused, level = 1 }) => {
  // Calculate grid size and mine count based on level
  const GRID_SIZE = 6 + (level * 2); // Level 1: 8x8, Level 2: 10x10, Level 3: 12x12, Level 4: 14x14, Level 5: 16x16
  const MINE_COUNT = 10 + (level * 5); // Level 1: 15, Level 2: 20, Level 3: 25, Level 4: 30, Level 5: 35
  
  const [grid, setGrid] = useState([]);
  const [revealed, setRevealed] = useState(new Set());
  const [flagged, setFlagged] = useState(new Set());
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);

  const initializeGrid = useCallback(() => {
    const newGrid = Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(0));
    const mines = [];
    
    while (mines.length < MINE_COUNT) {
      const row = Math.floor(Math.random() * GRID_SIZE);
      const col = Math.floor(Math.random() * GRID_SIZE);
      if (!mines.some(m => m.row === row && m.col === col)) {
        mines.push({ row, col });
        newGrid[row][col] = -1;
      }
    }

    mines.forEach(mine => {
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          const nr = mine.row + dr;
          const nc = mine.col + dc;
          if (nr >= 0 && nr < GRID_SIZE && nc >= 0 && nc < GRID_SIZE && newGrid[nr][nc] !== -1) {
            newGrid[nr][nc]++;
          }
        }
      }
    });

    setGrid(newGrid);
    setRevealed(new Set());
    setFlagged(new Set());
    setGameOver(false);
    setWon(false);
  }, [GRID_SIZE, MINE_COUNT]);

  const saveCheckpoint = async () => {
    try {
      const token = localStorage.getItem('token');
      const gameState = { grid, revealed: Array.from(revealed), flagged: Array.from(flagged), score };
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
      if (gameState && gameState.grid && gameState.grid.length > 0) {
        setGrid(gameState.grid);
        setRevealed(new Set(gameState.revealed || []));
        setFlagged(new Set(gameState.flagged || []));
        setScore(savedScore || 0);
        setGameOver(false);
        setWon(false);
        onScoreChange(savedScore || 0);
        return true;
      }
      return false;
    } catch (error) {
      return false;
    }
  };

  const handleRetry = () => {
    initializeGrid();
    setScore(0);
    onScoreChange(0);
  };

  useEffect(() => {
    if (gameRunning && !isPaused) {
      loadCheckpoint().then(loaded => {
        if (!loaded) initializeGrid();
      });
    }
  }, [gameRunning, initializeGrid, isPaused, level]);

  const handleCellClick = (row, col, isRightClick = false) => {
    if (!gameRunning || gameOver || won || isPaused) return;
    const cellId = `${row}-${col}`;
    
    if (isRightClick) {
      if (revealed.has(cellId)) return;
      setFlagged(prev => {
        const newFlagged = new Set(prev);
        if (newFlagged.has(cellId)) {
          newFlagged.delete(cellId);
        } else {
          newFlagged.add(cellId);
        }
        return newFlagged;
      });
      return;
    }

    if (flagged.has(cellId) || revealed.has(cellId)) return;

    if (grid[row][col] === -1) {
      setGameOver(true);
      return;
    }

    const newRevealed = new Set(revealed);
    const revealCell = (r, c) => {
      const id = `${r}-${c}`;
      if (newRevealed.has(id) || r < 0 || r >= grid.length || c < 0 || c >= (grid[0]?.length || 0)) return;
      newRevealed.add(id);
      if (grid[r][c] === 0) {
        for (let dr = -1; dr <= 1; dr++) {
          for (let dc = -1; dc <= 1; dc++) {
            revealCell(r + dr, c + dc);
          }
        }
      }
    };

    revealCell(row, col);
    setRevealed(newRevealed);
    
    setScore(prev => {
      const newScore = prev + 5 * level;
      onScoreChange(newScore);
      return newScore;
    });

    if (newRevealed.size === GRID_SIZE * GRID_SIZE - MINE_COUNT) {
      setWon(true);
      setScore(prev => {
        const newScore = prev + 100 * level;
        onScoreChange(newScore);
        return newScore;
      });
    }
  };

  return (
    <div className="minesweeper-game-container">
      <div className="minesweeper-grid">
        {grid.map((row, rowIdx) =>
          row.map((cell, colIdx) => {
            const cellId = `${rowIdx}-${colIdx}`;
            const isRevealed = revealed.has(cellId);
            const isFlagged = flagged.has(cellId);
            
            return (
              <div
                key={cellId}
                className={`mine-cell ${isRevealed ? 'revealed' : ''} ${isFlagged ? 'flagged' : ''} ${cell === -1 && gameOver ? 'mine' : ''}`}
                onClick={() => handleCellClick(rowIdx, colIdx)}
                onContextMenu={(e) => {
                  e.preventDefault();
                  handleCellClick(rowIdx, colIdx, true);
                }}
              >
                {isFlagged ? '🚩' : isRevealed ? (cell === -1 ? '💣' : cell > 0 ? cell : '') : ''}
              </div>
            );
          })
        )}
      </div>
      {(gameOver || won) && (
        <div className="game-over-overlay">
          <h2>{won ? '🎉 You Won!' : '💥 Game Over!'}</h2>
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
      <div className="minesweeper-stats">
        <div className="stat-display">Score: {score}</div>
        <div className="stat-display">Revealed: {revealed.size}/{GRID_SIZE * GRID_SIZE - MINE_COUNT}</div>
      </div>
      <div className="checkpoint-controls">
        <button className="save-checkpoint-btn" onClick={saveCheckpoint} disabled={!gameRunning || gameOver || won || isPaused}>
          💾 Save Checkpoint
        </button>
      </div>
    </div>
  );
};

export default MinesweeperGame;

