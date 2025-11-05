import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import './SudokuGame.css';
import '../Game.css';

const API_URL = process.env.REACT_APP_API_URL || 'https://schoolsystem-lyl7.onrender.com/api';
const GAME_TYPE = 'sudoku';

const SudokuGame = ({ gameRunning, onScoreChange, isPaused, level = 1 }) => {
  const [grid, setGrid] = useState(Array(9).fill(null).map(() => Array(9).fill(0)));
  const [initialGrid, setInitialGrid] = useState(Array(9).fill(null).map(() => Array(9).fill(0)));
  const [selectedCell, setSelectedCell] = useState(null);
  const [score, setScore] = useState(0);
  const [completed, setCompleted] = useState(false);

  const generateSudoku = useCallback(() => {
    const newGrid = Array(9).fill(null).map(() => Array(9).fill(0));
    // More cells filled for easier levels, fewer for harder levels
    const cellsToFill = level === 1 ? 40 : level === 2 ? 35 : level === 3 ? 30 : level === 4 ? 25 : 20;
    for (let i = 0; i < cellsToFill; i++) {
      const r = Math.floor(Math.random() * 9);
      const c = Math.floor(Math.random() * 9);
      const num = Math.floor(Math.random() * 9) + 1;
      newGrid[r][c] = num;
    }
    setGrid(newGrid);
    setInitialGrid(newGrid.map(row => [...row]));
    setSelectedCell(null);
    setCompleted(false);
  }, [level]);

  const saveCheckpoint = async () => {
    try {
      const token = localStorage.getItem('token');
      const gameState = { grid, initialGrid, selectedCell, score };
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
      setGrid(gameState.grid || Array(9).fill(null).map(() => Array(9).fill(0)));
      setInitialGrid(gameState.initialGrid || Array(9).fill(null).map(() => Array(9).fill(0)));
      setSelectedCell(gameState.selectedCell || null);
      setScore(savedScore || 0);
      setCompleted(false);
      onScoreChange(savedScore || 0);
      return true;
    } catch (error) {
      return false;
    }
  };

  const handleRetry = () => {
    generateSudoku();
    setScore(0);
    onScoreChange(0);
  };

  useEffect(() => {
    if (gameRunning && !isPaused) {
      loadCheckpoint().then(loaded => {
        if (!loaded) generateSudoku();
      });
    }
  }, [gameRunning, generateSudoku, isPaused, level]);

  const handleCellClick = (row, col) => {
    if (!gameRunning || isPaused || completed) return;
    if (initialGrid[row][col] !== 0) return;
    setSelectedCell({ row, col });
  };

  const handleNumberInput = (num) => {
    if (!selectedCell || !gameRunning || isPaused) return;
    const { row, col } = selectedCell;
    if (initialGrid[row][col] !== 0) return;
    
    const newGrid = grid.map(r => [...r]);
    newGrid[row][col] = num;
    setGrid(newGrid);
    
    setScore(prev => {
      const newScore = prev + 1 * level;
      onScoreChange(newScore);
      return newScore;
    });
  };

  useEffect(() => {
    if (!gameRunning || isPaused) return;
    const handleKeyPress = (e) => {
      if (e.key >= '1' && e.key <= '9') {
        handleNumberInput(parseInt(e.key));
      }
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [selectedCell, gameRunning, isPaused]);

  return (
    <div className="sudoku-game-container">
      <div className="sudoku-grid">
        {grid.map((row, r) =>
          row.map((cell, c) => {
            const isInitial = initialGrid[r][c] !== 0;
            const isSelected = selectedCell?.row === r && selectedCell?.col === c;
            const boxRow = Math.floor(r / 3);
            const boxCol = Math.floor(c / 3);
            
            return (
              <div
                key={`${r}-${c}`}
                className={`sudoku-cell ${isSelected ? 'selected' : ''} ${isInitial ? 'initial' : ''} ${boxRow % 2 === boxCol % 2 ? 'dark-box' : ''}`}
                onClick={() => handleCellClick(r, c)}
              >
                {cell || ''}
              </div>
            );
          })
        )}
      </div>
      <div className="sudoku-controls">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
          <button key={num} className="number-btn" onClick={() => handleNumberInput(num)} disabled={!selectedCell || isPaused}>
            {num}
          </button>
        ))}
      </div>
      <div className="sudoku-stats">
        <div className="stat-display">Score: {score}</div>
      </div>
      <div className="checkpoint-controls">
        <button className="save-checkpoint-btn" onClick={saveCheckpoint} disabled={!gameRunning || isPaused}>
          💾 Save Checkpoint
        </button>
        <button className="retry-btn" onClick={handleRetry} style={{ marginTop: '10px' }}>
          🔄 Retry
        </button>
      </div>
    </div>
  );
};

export default SudokuGame;

