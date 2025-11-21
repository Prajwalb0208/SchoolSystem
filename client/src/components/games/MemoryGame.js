import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import './MemoryGame.css';
import '../Game.css';

const API_URL = process.env.REACT_APP_API_URL || 'https://schoolsystem-lyl7.onrender.com/api';
const GAME_TYPE = 'memory';

const SYMBOLS = ['💻', '🔧', '📝', '🎯', '⚡', '🚀', '⭐', '🎮', '🎨', '📱', '💡', '🔍', '🎪', '🎭', '🎬', '🎤', '🎧', '🎵', '🎸', '🎹'];

const MemoryGame = ({ gameRunning, onScoreChange, isPaused, level = 1, onLevelComplete }) => {
  // Made easier: Fewer cards at each level (must be even for pairs)
  // Level 1: 4 cards (2 pairs), Level 2: 6 cards (3 pairs), Level 3: 8 cards (4 pairs), Level 4: 10 cards (5 pairs), Level 5: 12 cards (6 pairs)
  const CARD_COUNT = 2 + (level * 2);
  const [cards, setCards] = useState([]);
  const [flipped, setFlipped] = useState([]);
  const [matched, setMatched] = useState([]);
  const [score, setScore] = useState(0);
  const [moves, setMoves] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  const saveCheckpoint = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const gameState = { cards, flipped, matched, score, moves };
      await axios.post(
        `${API_URL}/games/checkpoint/save`,
        { gameType: GAME_TYPE, gameState, score, level: 1 },
        { headers: token ? { 'Authorization': `Bearer ${token}` } : {} }
      );
      alert('Checkpoint saved!');
    } catch (error) {
      console.error('Error saving checkpoint:', error);
    }
  }, [cards, flipped, matched, score, moves]);

  const loadCheckpoint = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${API_URL}/games/checkpoint/${GAME_TYPE}`,
        { headers: token ? { 'Authorization': `Bearer ${token}` } : {} }
      );
      const { gameState, score: savedScore } = response.data;
      setCards(gameState.cards || []);
      setFlipped(gameState.flipped || []);
      setMatched(gameState.matched || []);
      setScore(savedScore || 0);
      setMoves(gameState.moves || 0);
      setGameOver(false);
      onScoreChange(savedScore || 0);
      return true;
    } catch (error) {
      return false;
    }
  }, [onScoreChange]);

  const handleRetry = () => {
    initializeCards();
    setFlipped([]);
    setMatched([]);
    setScore(0);
    setMoves(0);
    setGameOver(false);
    onScoreChange(0);
  };

  const initializeCards = useCallback(() => {
    const symbolsToUse = SYMBOLS.slice(0, CARD_COUNT / 2);
    const cardPairs = [...symbolsToUse, ...symbolsToUse];
    const shuffled = cardPairs.sort(() => Math.random() - 0.5);
    return shuffled.map((symbol, index) => ({
      id: index,
      symbol,
      isFlipped: false,
      isMatched: false
    }));
  }, [CARD_COUNT]);

  useEffect(() => {
    if (gameRunning && !isPaused) {
      loadCheckpoint().then(loaded => {
        if (!loaded) {
          setCards(initializeCards());
          setFlipped([]);
          setMatched([]);
          setScore(0);
          setMoves(0);
        }
      });
    }
  }, [gameRunning, initializeCards, isPaused, level, loadCheckpoint]);

  useEffect(() => {
    if (!gameRunning || gameOver) return;
    const autoSaveInterval = setInterval(() => {
      saveCheckpoint();
    }, 30000);
    return () => clearInterval(autoSaveInterval);
  }, [gameRunning, gameOver, saveCheckpoint]);

  useEffect(() => {
    if (matched.length === CARD_COUNT && gameRunning && onLevelComplete) {
      setGameOver(true);
      onScoreChange(score + 50 * level);
      // Trigger level complete after a short delay
      setTimeout(() => {
        if (onLevelComplete) onLevelComplete();
      }, 1000);
    }
  }, [matched, CARD_COUNT, gameRunning, score, level, onScoreChange, onLevelComplete]);

  const handleCardClick = (cardId) => {
    if (!gameRunning || gameOver || isPaused || flipped.length >= 2 || matched.includes(cardId) || flipped.includes(cardId)) return;

    const newFlipped = [...flipped, cardId];
    setFlipped(newFlipped);

    if (newFlipped.length === 2) {
      setMoves(prev => prev + 1);
      const [first, second] = newFlipped;
      if (cards[first].symbol === cards[second].symbol) {
        setMatched(prev => [...prev, first, second]);
        setScore(prev => {
          const newScore = prev + 10 * level;
          onScoreChange(newScore);
          return newScore;
        });
        setTimeout(() => setFlipped([]), 500);
      } else {
        setTimeout(() => setFlipped([]), 1000);
      }
    }
  };

  return (
    <div className="memory-game-container">
      <div className="memory-board" data-cards={CARD_COUNT}>
        {cards.map((card) => (
          <div
            key={card.id}
            className={`memory-card ${flipped.includes(card.id) || matched.includes(card.id) ? 'flipped' : ''}`}
            onClick={() => handleCardClick(card.id)}
          >
            <div className="card-front">?</div>
            <div className="card-back">{card.symbol}</div>
          </div>
        ))}
      </div>
      {gameOver && (
        <div className="game-over-overlay">
          <h2>Congratulations!</h2>
          <p>You matched all pairs!</p>
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
      <div className="memory-stats">
        <div className="stat-display">Score: {score}</div>
        <div className="stat-display">Level: {level}</div>
        <div className="stat-display">Cards: {CARD_COUNT}</div>
        <div className="stat-display">Matched: {matched.length / 2}</div>
      </div>
      <div className="checkpoint-controls">
        <button className="save-checkpoint-btn" onClick={saveCheckpoint} disabled={!gameRunning || gameOver}>
          💾 Save Checkpoint
        </button>
      </div>
    </div>
  );
};

export default MemoryGame;
