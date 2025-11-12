import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import './BlockRush.css';
import '../Game.css';

const API_URL = process.env.REACT_APP_API_URL || 'https://schoolsystem-lyl7.onrender.com/api';
const GAME_TYPE = 'blockrush';

const SHAPES = [
  [[1, 1, 1, 1]], // I
  [[1, 1], [1, 1]], // O
  [[0, 1, 0], [1, 1, 1]], // T
  [[0, 1, 1], [1, 1, 0]], // S
  [[1, 1, 0], [0, 1, 1]], // Z
  [[1, 0, 0], [1, 1, 1]], // L
  [[0, 0, 1], [1, 1, 1]]  // J
];

const COLORS = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F', '#BB8FCE'];
const BOARD_WIDTH = 10;
const BOARD_HEIGHT = 20;

const BlockRush = ({ gameRunning, onScoreChange, isPaused, level = 1, onLevelComplete }) => {
  const [board, setBoard] = useState(Array(BOARD_HEIGHT).fill(null).map(() => Array(BOARD_WIDTH).fill(0)));
  const [currentBlock, setCurrentBlock] = useState(null);
  const [currentX, setCurrentX] = useState(0);
  const [currentY, setCurrentY] = useState(0);
  const [score, setScore] = useState(0);
  const [lines, setLines] = useState(0);
  const [gameLevel, setGameLevel] = useState(level);
  const [gameOver, setGameOver] = useState(false);
  const gameLoopRef = useRef(null);

  const saveCheckpoint = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${API_URL}/games/checkpoint/save`,
        { gameType: GAME_TYPE, gameState: { board, currentBlock, currentX, currentY, score, lines, level: gameLevel }, score, level: gameLevel },
        { headers: token ? { 'Authorization': `Bearer ${token}` } : {} }
      );
      alert('Checkpoint saved!');
    } catch (error) {
      console.error('Error saving checkpoint:', error);
    }
  }, [board, currentBlock, currentX, currentY, score, lines, gameLevel]);

  const loadCheckpoint = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${API_URL}/games/checkpoint/${GAME_TYPE}`,
        { headers: token ? { 'Authorization': `Bearer ${token}` } : {} }
      );
      const { gameState, score: savedScore, level: savedLevel } = response.data;
      setBoard(gameState.board || Array(BOARD_HEIGHT).fill(null).map(() => Array(BOARD_WIDTH).fill(0)));
      setCurrentBlock(gameState.currentBlock || null);
      setCurrentX(gameState.currentX || 0);
      setCurrentY(gameState.currentY || 0);
      setScore(savedScore || 0);
      setLines(gameState.lines || 0);
      setGameLevel(savedLevel || level);
      setGameOver(false);
      onScoreChange(savedScore || 0);
      return true;
    } catch (error) {
      console.error('Error loading checkpoint:', error);
      return false;
    }
  }, [level, onScoreChange]);

  const handleRetry = () => {
    setBoard(Array(BOARD_HEIGHT).fill(null).map(() => Array(BOARD_WIDTH).fill(0)));
    setCurrentBlock(null);
    setCurrentX(0);
    setCurrentY(0);
    setScore(0);
    setLines(0);
    setGameLevel(level);
    setGameOver(false);
    onScoreChange(0);
  };

  useEffect(() => {
    if (gameRunning && !gameOver) {
      loadCheckpoint();
    }
  }, [gameRunning, gameOver, loadCheckpoint]);

  // Auto-save checkpoint every 30 seconds
  useEffect(() => {
    if (!gameRunning || gameOver) return;
    const autoSaveInterval = setInterval(() => {
      saveCheckpoint();
    }, 30000);
    return () => clearInterval(autoSaveInterval);
  }, [gameRunning, gameOver, board, score, lines, level, saveCheckpoint]);

  const createBlock = useCallback(() => {
    const shapeIndex = Math.floor(Math.random() * SHAPES.length);
    return {
      shape: SHAPES[shapeIndex],
      color: COLORS[shapeIndex],
      x: Math.floor(BOARD_WIDTH / 2) - Math.floor(SHAPES[shapeIndex][0].length / 2),
      y: 0
    };
  }, []);

  const checkCollision = useCallback((block, x, y, board) => {
    for (let row = 0; row < block.shape.length; row++) {
      for (let col = 0; col < block.shape[row].length; col++) {
        if (block.shape[row][col]) {
          const newX = x + col;
          const newY = y + row;
          if (newX < 0 || newX >= BOARD_WIDTH || newY >= BOARD_HEIGHT) return true;
          if (newY >= 0 && board[newY][newX]) return true;
        }
      }
    }
    return false;
  }, []);

  const placeBlock = useCallback((block, x, y, board) => {
    const newBoard = board.map(row => [...row]);
    for (let row = 0; row < block.shape.length; row++) {
      for (let col = 0; col < block.shape[row].length; col++) {
        if (block.shape[row][col]) {
          const newY = y + row;
          const newX = x + col;
          if (newY >= 0) newBoard[newY][newX] = block.color;
        }
      }
    }
    return newBoard;
  }, []);

  const clearLines = useCallback((board) => {
    let newBoard = [...board];
    let linesCleared = 0;
    for (let row = BOARD_HEIGHT - 1; row >= 0; row--) {
      if (newBoard[row].every(cell => cell !== 0)) {
        newBoard.splice(row, 1);
        newBoard.unshift(Array(BOARD_WIDTH).fill(0));
        linesCleared++;
        row++;
      }
    }
    return { board: newBoard, linesCleared };
  }, []);

  const rotateBlock = useCallback((shape) => {
    const rows = shape.length;
    const cols = shape[0].length;
    const rotated = Array(cols).fill(null).map(() => Array(rows).fill(0));
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        rotated[col][rows - 1 - row] = shape[row][col];
      }
    }
    return rotated;
  }, []);

  useEffect(() => {
    if (!gameRunning || gameOver) return;
    if (!currentBlock) {
      const newBlock = createBlock();
      setCurrentBlock(newBlock);
      setCurrentX(newBlock.x);
      setCurrentY(newBlock.y);
    }
    const dropSpeed = Math.max(50, 1000 - (level - 1) * 150 - (gameLevel - 1) * 100);
    gameLoopRef.current = setInterval(() => {
      setCurrentY(prevY => {
        if (!currentBlock) return prevY;
        if (!checkCollision(currentBlock, currentX, prevY + 1, board)) {
          return prevY + 1;
        } else {
          const newBoard = placeBlock(currentBlock, currentX, prevY, board);
          const { board: clearedBoard, linesCleared } = clearLines(newBoard);
          if (linesCleared > 0) {
            setScore(prev => {
              const newScore = prev + linesCleared * 100 * level * gameLevel;
              onScoreChange(newScore);
              return newScore;
            });
            setLines(prev => {
              const newLines = prev + linesCleared;
              setGameLevel(Math.floor(newLines / (10 / level)) + 1);
              // Check if level threshold reached (10 lines per level)
              const LEVEL_THRESHOLD = 10 * level;
              if (newLines >= LEVEL_THRESHOLD && onLevelComplete) {
                setTimeout(() => {
                  if (onLevelComplete) onLevelComplete();
                }, 1500);
              }
              return newLines;
            });
          }
          setBoard(clearedBoard);
          if (prevY <= 1) {
            setGameOver(true);
            return prevY;
          }
          const newBlock = createBlock();
          setCurrentBlock(newBlock);
          setCurrentX(newBlock.x);
          return newBlock.y;
        }
      });
    }, dropSpeed);
    return () => {
      if (gameLoopRef.current) clearInterval(gameLoopRef.current);
    };
  }, [gameRunning, gameOver, currentBlock, currentX, board, level, gameLevel, createBlock, checkCollision, placeBlock, clearLines, onScoreChange, onLevelComplete]);

  useEffect(() => {
    if (!gameRunning || gameOver) return;
    const handleKeyPress = (e) => {
      if (!currentBlock) return;
      switch(e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          setCurrentX(prevX => checkCollision(currentBlock, prevX - 1, currentY, board) ? prevX : prevX - 1);
          break;
        case 'ArrowRight':
          e.preventDefault();
          setCurrentX(prevX => checkCollision(currentBlock, prevX + 1, currentY, board) ? prevX : prevX + 1);
          break;
        case 'ArrowDown':
          e.preventDefault();
          setCurrentY(prevY => checkCollision(currentBlock, currentX, prevY + 1, board) ? prevY : prevY + 1);
          break;
        case 'ArrowUp':
        case ' ':
          e.preventDefault();
          const rotatedShape = rotateBlock(currentBlock.shape);
          const rotatedBlock = { ...currentBlock, shape: rotatedShape };
          if (!checkCollision(rotatedBlock, currentX, currentY, board)) {
            setCurrentBlock(rotatedBlock);
          }
          break;
        default:
          break;
      }
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [gameRunning, gameOver, currentBlock, currentX, currentY, board, checkCollision, rotateBlock]);

  const renderBoard = () => {
    const displayBoard = board.map(row => [...row]);
    if (currentBlock && !gameOver) {
      for (let row = 0; row < currentBlock.shape.length; row++) {
        for (let col = 0; col < currentBlock.shape[row].length; col++) {
          if (currentBlock.shape[row][col]) {
            const y = currentY + row;
            const x = currentX + col;
            if (y >= 0 && y < BOARD_HEIGHT && x >= 0 && x < BOARD_WIDTH) {
              displayBoard[y][x] = currentBlock.color;
            }
          }
        }
      }
    }
    return displayBoard;
  };

  const displayBoard = renderBoard();

  return (
    <div className="block-rush-game">
      <div className="game-board-container">
        <div className="game-board">
          {displayBoard.map((row, rowIndex) => (
            <div key={rowIndex} className="board-row">
              {row.map((cell, colIndex) => (
                <div
                  key={colIndex}
                  className="board-cell"
                  style={{
                    backgroundColor: cell || '#1a1a2e',
                    border: cell ? 'none' : '1px solid rgba(255, 255, 255, 0.1)'
                  }}
                />
              ))}
            </div>
          ))}
        </div>
      {gameOver && (
        <div className="game-over-overlay">
          <h2>Game Over!</h2>
          <p>Final Score: {score}</p>
          <p>Lines Cleared: {lines}</p>
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
      </div>
      <div className="game-controls">
        <div className="controls-info">
          <h3>Controls</h3>
          <div className="control-item">
            <kbd>←</kbd> <kbd>→</kbd> Move
          </div>
          <div className="control-item">
            <kbd>↓</kbd> Drop Faster
          </div>
          <div className="control-item">
            <kbd>↑</kbd> or <kbd>Space</kbd> Rotate
          </div>
          <div className="game-stats-display">
            <div className="stat-display">
              <span>Score: {score}</span>
            </div>
            <div className="stat-display">
              <span>Lines: {lines}</span>
            </div>
            <div className="stat-display">
              <span>Level: {level}</span>
            </div>
          </div>
          <div className="checkpoint-controls">
            <button className="save-checkpoint-btn" onClick={saveCheckpoint} disabled={!gameRunning || gameOver}>
              💾 Save Checkpoint
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlockRush;

