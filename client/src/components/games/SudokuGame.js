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

  // Helper function for validation (used in generation)
  const isValidPlacementHelper = useCallback((grid, row, col, num) => {
    // Check row
    for (let c = 0; c < 9; c++) {
      if (grid[row][c] === num) return false;
    }
    // Check column
    for (let r = 0; r < 9; r++) {
      if (grid[r][col] === num) return false;
    }
    // Check 3x3 box
    const boxRow = Math.floor(row / 3) * 3;
    const boxCol = Math.floor(col / 3) * 3;
    for (let r = boxRow; r < boxRow + 3; r++) {
      for (let c = boxCol; c < boxCol + 3; c++) {
        if (grid[r][c] === num) return false;
      }
    }
    return true;
  }, []);

  // Generate a valid Sudoku puzzle
  const generateSudoku = useCallback(() => {
    // Create a solved Sudoku grid
    const solvedGrid = Array(9).fill(null).map(() => Array(9).fill(0));
    
    // Fill diagonal 3x3 boxes first (they are independent)
    for (let box = 0; box < 3; box++) {
      const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9].sort(() => Math.random() - 0.5);
      let idx = 0;
      for (let r = box * 3; r < box * 3 + 3; r++) {
        for (let c = box * 3; c < box * 3 + 3; c++) {
          solvedGrid[r][c] = numbers[idx++];
        }
      }
    }
    
    // Simple solver to fill rest (backtracking)
    const solveSudoku = (grid) => {
      for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
          if (grid[row][col] === 0) {
            const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9].sort(() => Math.random() - 0.5);
            for (const num of numbers) {
              if (isValidPlacementHelper(grid, row, col, num)) {
                grid[row][col] = num;
                if (solveSudoku(grid)) return true;
                grid[row][col] = 0;
              }
            }
            return false;
          }
        }
      }
      return true;
    };
    
    solveSudoku(solvedGrid);
    
    // Now remove cells based on difficulty level
    const newGrid = solvedGrid.map(row => [...row]);
    const cellsToRemove = level === 1 ? 35 : level === 2 ? 40 : level === 3 ? 45 : level === 4 ? 50 : 55;
    const cellsToKeep = 81 - cellsToRemove;
    let filled = 81;
    
    while (filled > cellsToKeep) {
      const r = Math.floor(Math.random() * 9);
      const c = Math.floor(Math.random() * 9);
      if (newGrid[r][c] !== 0) {
        newGrid[r][c] = 0;
        filled--;
      }
    }
    
    setGrid(newGrid);
    setInitialGrid(newGrid.map(row => [...row]));
    setSelectedCell(null);
    setCompleted(false);
  }, [level, isValidPlacementHelper]);

  const saveCheckpoint = async () => {
    try {
      const token = localStorage.getItem('token');
      const gameState = { grid, initialGrid, selectedCell, score };
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

  // Validate if number can be placed (Sudoku rules)
  const isValidPlacement = useCallback((grid, row, col, num) => {
    if (num === 0) return true;
    
    // Check row
    for (let c = 0; c < 9; c++) {
      if (c !== col && grid[row][c] === num) return false;
    }
    
    // Check column
    for (let r = 0; r < 9; r++) {
      if (r !== row && grid[r][col] === num) return false;
    }
    
    // Check 3x3 box
    const boxRow = Math.floor(row / 3) * 3;
    const boxCol = Math.floor(col / 3) * 3;
    for (let r = boxRow; r < boxRow + 3; r++) {
      for (let c = boxCol; c < boxCol + 3; c++) {
        if (r !== row && c !== col && grid[r][c] === num) return false;
      }
    }
    
    return true;
  }, []);

  // Check if puzzle is complete
  const checkCompletion = useCallback((grid) => {
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (grid[r][c] === 0) return false;
        if (!isValidPlacement(grid, r, c, grid[r][c])) return false;
      }
    }
    return true;
  }, [isValidPlacement]);

  const handleNumberInput = useCallback((num) => {
    if (!selectedCell || !gameRunning || isPaused || completed) return;
    const { row, col } = selectedCell;
    if (initialGrid[row][col] !== 0) return;
    
    const newGrid = grid.map(r => [...r]);
    const prevValue = newGrid[row][col];
    
    // If same number, clear it (set to 0)
    if (prevValue === num) {
      newGrid[row][col] = 0;
    } else {
      // Validate placement
      if (isValidPlacement(newGrid, row, col, num)) {
        newGrid[row][col] = num;
      } else {
        // Invalid placement - show error but don't place
        alert('Invalid placement! This number conflicts with Sudoku rules.');
        return;
      }
    }
    
    setGrid(newGrid);
    
    // Update score only on valid placement
    if (newGrid[row][col] !== 0 && newGrid[row][col] !== prevValue) {
      setScore(prev => {
        const newScore = prev + 5 * level;
        onScoreChange(newScore);
        return newScore;
      });
    }
    
    // Check if puzzle is complete
    if (checkCompletion(newGrid)) {
      setCompleted(true);
      setScore(prev => {
        const finalScore = prev + 100 * level;
        onScoreChange(finalScore);
        return finalScore;
      });
    }
  }, [selectedCell, gameRunning, isPaused, completed, grid, initialGrid, isValidPlacement, checkCompletion, level, onScoreChange]);

  useEffect(() => {
    if (!gameRunning || isPaused || completed) return;
    const handleKeyPress = (e) => {
      if (e.key >= '1' && e.key <= '9') {
        handleNumberInput(parseInt(e.key));
      } else if (e.key === '0' || e.key === 'Delete' || e.key === 'Backspace') {
        handleNumberInput(0);
      }
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [selectedCell, gameRunning, isPaused, completed, handleNumberInput]);

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
      {completed && (
        <div className="game-over-overlay">
          <h2>🎉 Puzzle Solved!</h2>
          <p>Congratulations! You completed the Sudoku puzzle!</p>
          <p>Final Score: {score}</p>
          <div className="game-over-buttons">
            <button className="retry-btn" onClick={handleRetry}>🔄 Play Again</button>
            <button className="checkpoint-btn" onClick={async () => {
              const loaded = await loadCheckpoint();
              if (loaded) {
                setCompleted(false);
              }
            }}>💾 Load Checkpoint</button>
          </div>
        </div>
      )}
      <div className="sudoku-controls">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
          <button 
            key={num} 
            className="number-btn" 
            onClick={() => handleNumberInput(num)} 
            disabled={!selectedCell || isPaused || completed}
          >
            {num}
          </button>
        ))}
        <button 
          className="number-btn clear-btn" 
          onClick={() => handleNumberInput(0)} 
          disabled={!selectedCell || isPaused || completed}
        >
          Clear
        </button>
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

