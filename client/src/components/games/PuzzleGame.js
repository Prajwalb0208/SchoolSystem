import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import './PuzzleGame.css';
import '../Game.css';

const API_URL = process.env.REACT_APP_API_URL || 'https://schoolsystem-lyl7.onrender.com/api';
const GAME_TYPE = 'puzzle';

const codeBlocks = [
  { id: 1, code: 'function calculateSum(a, b) {', order: 1 },
  { id: 2, code: '  return a + b;', order: 2 },
  { id: 3, code: '}', order: 3 }
];

const PuzzleGame = ({ gameRunning, onScoreChange }) => {
  const [blocks, setBlocks] = useState([]);
  const [selectedBlocks, setSelectedBlocks] = useState([]);
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [gameOver, setGameOver] = useState(false);

  const saveCheckpoint = async () => {
    try {
      const token = localStorage.getItem('token');
      const gameState = { blocks, selectedBlocks, score, level };
      await axios.post(
        `${API_URL}/games/checkpoint/save`,
        { gameType: GAME_TYPE, gameState, score, level },
        { headers: token ? { 'Authorization': `Bearer ${token}` } : {} }
      );
      alert('Checkpoint saved!');
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
      const { gameState, score: savedScore, level: savedLevel } = response.data;
      setBlocks(gameState.blocks || []);
      setSelectedBlocks(gameState.selectedBlocks || []);
      setScore(savedScore || 0);
      setLevel(savedLevel || 1);
      setGameOver(false);
      onScoreChange(savedScore || 0);
      return true;
    } catch (error) {
      return false;
    }
  };

  const handleRetry = () => {
    generatePuzzle();
    setScore(0);
    setLevel(1);
    setGameOver(false);
    onScoreChange(0);
  };

  const generatePuzzle = useCallback(() => {
    const shuffled = [...codeBlocks].sort(() => Math.random() - 0.5);
    setBlocks(shuffled);
    setSelectedBlocks([]);
  }, []);

  useEffect(() => {
    if (gameRunning) {
      loadCheckpoint().then(loaded => {
        if (!loaded) {
          generatePuzzle();
          setScore(0);
          setLevel(1);
        }
      });
    }
  }, [gameRunning, generatePuzzle]);

  useEffect(() => {
    if (!gameRunning || gameOver) return;
    const autoSaveInterval = setInterval(() => {
      saveCheckpoint();
    }, 30000);
    return () => clearInterval(autoSaveInterval);
  }, [gameRunning, gameOver, blocks, selectedBlocks, score, level]);

  const handleBlockClick = (block) => {
    if (!gameRunning || gameOver || selectedBlocks.includes(block.id)) return;
    
    const newSelected = [...selectedBlocks, block.id];
    setSelectedBlocks(newSelected);

    if (newSelected.length === blocks.length) {
      const isCorrect = newSelected.every((id, idx) => {
        const block = blocks.find(b => b.id === id);
        return block.order === idx + 1;
      });

      if (isCorrect) {
        setScore(prev => {
          const newScore = prev + 50;
          onScoreChange(newScore);
          return newScore;
        });
        setTimeout(() => {
          generatePuzzle();
          setLevel(prev => prev + 1);
        }, 1000);
      } else {
        setTimeout(() => setSelectedBlocks([]), 1000);
      }
    }
  };

  return (
    <div className="puzzle-game-container">
      <div className="puzzle-instructions">
        <h3>Arrange code blocks in correct order</h3>
        <p>Click blocks to select them in order</p>
      </div>
      {gameOver && (
        <div className="game-over-overlay">
          <h2>Level Complete!</h2>
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
      <div className="puzzle-blocks">
        {blocks.map((block) => (
          <div
            key={block.id}
            className={`puzzle-block ${selectedBlocks.includes(block.id) ? 'selected' : ''}`}
            onClick={() => handleBlockClick(block)}
          >
            <pre>{block.code}</pre>
          </div>
        ))}
      </div>
      <div className="puzzle-stats">
        <div className="stat-display">Score: {score}</div>
        <div className="stat-display">Level: {level}</div>
      </div>
      <div className="checkpoint-controls">
        <button className="save-checkpoint-btn" onClick={saveCheckpoint} disabled={!gameRunning || gameOver}>
          💾 Save Checkpoint
        </button>
      </div>
    </div>
  );
};

export default PuzzleGame;
