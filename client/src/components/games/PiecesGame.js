import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import './PiecesGame.css';
import '../Game.css';

const API_URL = process.env.REACT_APP_API_URL || 'https://schoolsystem-lyl7.onrender.com/api';
const GAME_TYPE = 'pieces';

const PiecesGame = ({ gameRunning, onScoreChange, isPaused }) => {
  const [pieces, setPieces] = useState([]);
  const [selectedPieces, setSelectedPieces] = useState([]);
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [completed, setCompleted] = useState(false);

  const generatePuzzle = useCallback(() => {
    const totalPieces = 9;
    const correctOrder = Array.from({ length: totalPieces }, (_, i) => i + 1);
    const shuffled = [...correctOrder].sort(() => Math.random() - 0.5);
    setPieces(shuffled.map((val, idx) => ({ id: idx, value: val, correctPos: val - 1 })));
    setSelectedPieces([]);
    setCompleted(false);
  }, []);

  const saveCheckpoint = async () => {
    try {
      const token = localStorage.getItem('token');
      const gameState = { pieces, selectedPieces, score, level };
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
      const { gameState, score: savedScore, level: savedLevel } = response.data;
      setPieces(gameState.pieces || []);
      setSelectedPieces(gameState.selectedPieces || []);
      setScore(savedScore || 0);
      setLevel(savedLevel || 1);
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
  };

  useEffect(() => {
    if (gameRunning && !isPaused) {
      loadCheckpoint().then(loaded => {
        if (!loaded) generatePuzzle();
      });
    }
  }, [gameRunning, generatePuzzle, isPaused]);

  useEffect(() => {
    if (!gameRunning || isPaused) return;
    const autoSaveInterval = setInterval(() => {
      saveCheckpoint();
    }, 30000);
    return () => clearInterval(autoSaveInterval);
  }, [gameRunning, isPaused, pieces, selectedPieces, score, level]);

  const handlePieceClick = (piece) => {
    if (!gameRunning || isPaused || completed || selectedPieces.includes(piece.id)) return;
    
    const newSelected = [...selectedPieces, piece.id];
    setSelectedPieces(newSelected);

    if (newSelected.length === pieces.length) {
      const isCorrect = newSelected.every((id, idx) => {
        const p = pieces.find(pi => pi.id === id);
        return p.correctPos === idx;
      });

      if (isCorrect) {
        setCompleted(true);
        setScore(prev => {
          const newScore = prev + 50 * level;
          onScoreChange(newScore);
          return newScore;
        });
        setTimeout(() => {
          generatePuzzle();
          setLevel(prev => prev + 1);
        }, 1500);
      } else {
        setTimeout(() => setSelectedPieces([]), 1000);
      }
    }
  };

  return (
    <div className="pieces-game-container">
      <div className="puzzle-grid">
        {pieces.map((piece) => (
          <div
            key={piece.id}
            className={`puzzle-piece ${selectedPieces.includes(piece.id) ? 'selected' : ''} ${completed && selectedPieces.includes(piece.id) ? 'correct' : ''}`}
            onClick={() => handlePieceClick(piece)}
          >
            {piece.value}
          </div>
        ))}
      </div>
      <div className="pieces-stats">
        <div className="stat-display">Score: {score}</div>
        <div className="stat-display">Level: {level}</div>
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

export default PiecesGame;

