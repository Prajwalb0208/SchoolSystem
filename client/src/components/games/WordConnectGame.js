import React, { useState, useEffect, useCallback } from 'react';
import './WordConnectGame.css';

// Word Search Game - Find words in a grid
const WORD_LISTS = [
  {
    category: 'Animals',
    words: ['CAT', 'DOG', 'BIRD', 'FISH', 'LION', 'TIGER'],
    grid: [
      ['C', 'A', 'T', 'X', 'Y', 'Z'],
      ['D', 'O', 'G', 'A', 'B', 'C'],
      ['B', 'I', 'R', 'D', 'E', 'F'],
      ['F', 'I', 'S', 'H', 'G', 'H'],
      ['L', 'I', 'O', 'N', 'I', 'J'],
      ['T', 'I', 'G', 'E', 'R', 'K']
    ]
  },
  {
    category: 'Colors',
    words: ['RED', 'BLUE', 'GREEN', 'YELLOW', 'PINK', 'BLACK'],
    grid: [
      ['R', 'E', 'D', 'X', 'Y', 'Z'],
      ['B', 'L', 'U', 'E', 'A', 'B'],
      ['G', 'R', 'E', 'E', 'N', 'C'],
      ['Y', 'E', 'L', 'L', 'O', 'W'],
      ['P', 'I', 'N', 'K', 'D', 'E'],
      ['B', 'L', 'A', 'C', 'K', 'F']
    ]
  },
  {
    category: 'Fruits',
    words: ['APPLE', 'BANANA', 'ORANGE', 'GRAPE', 'MANGO', 'KIWI'],
    grid: [
      ['A', 'P', 'P', 'L', 'E', 'X'],
      ['B', 'A', 'N', 'A', 'N', 'A'],
      ['O', 'R', 'A', 'N', 'G', 'E'],
      ['G', 'R', 'A', 'P', 'E', 'Y'],
      ['M', 'A', 'N', 'G', 'O', 'Z'],
      ['K', 'I', 'W', 'I', 'A', 'B']
    ]
  },
  {
    category: 'Sports',
    words: ['FOOTBALL', 'BASKETBALL', 'TENNIS', 'SOCCER', 'SWIM', 'RUN'],
    grid: [
      ['F', 'O', 'O', 'T', 'B', 'A', 'L', 'L'],
      ['B', 'A', 'S', 'K', 'E', 'T', 'B', 'A'],
      ['T', 'E', 'N', 'N', 'I', 'S', 'L', 'L'],
      ['S', 'O', 'C', 'C', 'E', 'R', 'X', 'Y'],
      ['S', 'W', 'I', 'M', 'Z', 'A', 'B', 'C'],
      ['R', 'U', 'N', 'D', 'E', 'F', 'G', 'H']
    ]
  },
  {
    category: 'School',
    words: ['BOOK', 'PEN', 'PAPER', 'DESK', 'TEACHER', 'STUDENT'],
    grid: [
      ['B', 'O', 'O', 'K', 'X', 'Y'],
      ['P', 'E', 'N', 'Z', 'A', 'B'],
      ['P', 'A', 'P', 'E', 'R', 'C'],
      ['D', 'E', 'S', 'K', 'D', 'E'],
      ['T', 'E', 'A', 'C', 'H', 'E'],
      ['S', 'T', 'U', 'D', 'E', 'N']
    ]
  }
];

const GRID_SIZE = 8;

const WordConnectGame = ({ gameRunning, onScoreChange, isPaused, level = 1, onLevelComplete }) => {
  const [grid, setGrid] = useState([]);
  const [targetWords, setTargetWords] = useState([]);
  const [foundWords, setFoundWords] = useState([]);
  const [selectedCells, setSelectedCells] = useState([]);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(120);
  const [gameOver, setGameOver] = useState(false);
  const [category, setCategory] = useState('');
  const [isSelecting, setIsSelecting] = useState(false);

  const generateGrid = useCallback(() => {
    const wordSetIndex = (level - 1) % WORD_LISTS.length;
    const wordData = WORD_LISTS[wordSetIndex];
    
    setCategory(wordData.category);
    setTargetWords(wordData.words);
    setFoundWords([]);
    setSelectedCells([]);
    setScore(0);
    setTimeLeft(120);
    setGameOver(false);
    onScoreChange(0);

    // Create a larger grid and place words
    const newGrid = Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(''));
    
    // Place words in grid (simplified - in real game, words would be placed algorithmically)
    // For now, use the predefined grid or generate randomly
    if (wordData.grid && wordData.grid.length > 0) {
      for (let i = 0; i < Math.min(GRID_SIZE, wordData.grid.length); i++) {
        for (let j = 0; j < Math.min(GRID_SIZE, wordData.grid[i].length); j++) {
          newGrid[i][j] = wordData.grid[i][j];
        }
      }
    } else {
      // Fill with random letters
      for (let i = 0; i < GRID_SIZE; i++) {
        for (let j = 0; j < GRID_SIZE; j++) {
          newGrid[i][j] = String.fromCharCode(65 + Math.floor(Math.random() * 26));
        }
      }
    }
    
    setGrid(newGrid);
  }, [level, onScoreChange]);

  useEffect(() => {
    if (!gameRunning || isPaused) return;
    generateGrid();
  }, [gameRunning, isPaused, generateGrid]);

  useEffect(() => {
    if (!gameRunning || gameOver || isPaused) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setGameOver(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameRunning, gameOver, isPaused]);

  const getCellKey = (row, col) => `${row}-${col}`;

  const isAdjacent = (cell1, cell2) => {
    const [r1, c1] = cell1.split('-').map(Number);
    const [r2, c2] = cell2.split('-').map(Number);
    return Math.abs(r1 - r2) <= 1 && Math.abs(c1 - c2) <= 1;
  };

  const handleCellMouseDown = (row, col) => {
    if (gameOver || isPaused || !gameRunning) return;
    setIsSelecting(true);
    setSelectedCells([getCellKey(row, col)]);
  };

  const handleCellMouseEnter = (row, col) => {
    if (!isSelecting || gameOver || isPaused || !gameRunning) return;
    
    const cellKey = getCellKey(row, col);
    const lastCell = selectedCells[selectedCells.length - 1];
    
    if (!selectedCells.includes(cellKey) && lastCell && isAdjacent(cellKey, lastCell)) {
      setSelectedCells(prev => [...prev, cellKey]);
    }
  };

  const handleCellMouseUp = () => {
    if (!isSelecting) return;
    setIsSelecting(false);
    
    // Check if selected cells form a word
    if (selectedCells.length >= 3) {
      const word = selectedCells
        .map(key => {
          const [row, col] = key.split('-').map(Number);
          return grid[row][col];
        })
        .join('');
      
      // Check if word matches any target word
      const foundWord = targetWords.find(w => w === word || w === word.split('').reverse().join(''));
      
      if (foundWord && !foundWords.includes(foundWord)) {
        setFoundWords(prev => [...prev, foundWord]);
        setScore(prev => {
          const newScore = prev + 100 * level;
          onScoreChange(newScore);
          
          // Check if all words found
          if (prev + 100 * level >= targetWords.length * 100 * level) {
            onLevelComplete();
          }
          
          return newScore;
        });
      }
    }
    
    setSelectedCells([]);
  };

  const handleRetry = () => {
    generateGrid();
  };

  return (
    <div className="word-connect-game">
      <div className="word-stats">
        <div className="stat">Category: {category}</div>
        <div className="stat">Score: {score}</div>
        <div className="stat">Level: {level}</div>
        <div className="stat">Time: {timeLeft}s</div>
        <div className="stat">Found: {foundWords.length}/{targetWords.length}</div>
      </div>

      {gameOver && (
        <div className="game-over-overlay">
          <h2>{foundWords.length === targetWords.length ? '🎉 Perfect!' : '⏰ Time Up!'}</h2>
          <p>Final Score: {score}</p>
          <p>Words Found: {foundWords.length}/{targetWords.length}</p>
          <button onClick={handleRetry} className="retry-btn">Retry</button>
        </div>
      )}

      <div className="word-game-container">
        <div className="target-words-panel">
          <h3>Find these words:</h3>
          <div className="target-words-list">
            {targetWords.map((word, i) => (
              <span
                key={i}
                className={`target-word ${foundWords.includes(word) ? 'found' : ''}`}
              >
                {word}
              </span>
            ))}
          </div>
        </div>

        <div 
          className="word-grid"
          onMouseUp={handleCellMouseUp}
          onMouseLeave={handleCellMouseUp}
        >
          {grid.map((row, rowIndex) => (
            <div key={rowIndex} className="grid-row">
              {row.map((cell, colIndex) => {
                const cellKey = getCellKey(rowIndex, colIndex);
                const isSelected = selectedCells.includes(cellKey);
                const isLastSelected = selectedCells[selectedCells.length - 1] === cellKey;
                
                return (
                  <div
                    key={colIndex}
                    className={`grid-cell ${isSelected ? 'selected' : ''} ${isLastSelected ? 'last-selected' : ''}`}
                    onMouseDown={() => handleCellMouseDown(rowIndex, colIndex)}
                    onMouseEnter={() => handleCellMouseEnter(rowIndex, colIndex)}
                  >
                    {cell}
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        <div className="instructions">
          <p>Click and drag to select words horizontally, vertically, or diagonally!</p>
        </div>
      </div>
    </div>
  );
};

export default WordConnectGame;
