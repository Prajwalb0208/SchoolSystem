import React, { useState, useEffect, useRef, useCallback } from 'react';
import './WordConnectGame.css';

const WORDS = [
  ['CAT', 'DOG', 'BIRD', 'FISH'],
  ['SUN', 'MOON', 'STAR', 'SKY'],
  ['TREE', 'FLOWER', 'GRASS', 'LEAF'],
  ['BOOK', 'PEN', 'PAPER', 'READ'],
  ['CAR', 'BUS', 'BIKE', 'ROAD'],
  ['HOUSE', 'DOOR', 'WINDOW', 'ROOF'],
  ['WATER', 'FIRE', 'EARTH', 'AIR'],
  ['RED', 'BLUE', 'GREEN', 'YELLOW'],
  ['APPLE', 'BANANA', 'ORANGE', 'GRAPE'],
  ['HAPPY', 'SAD', 'ANGRY', 'CALM']
];

const WordConnectGame = ({ gameRunning, onScoreChange, isPaused, level = 1, onLevelComplete }) => {
  const [currentWordSet, setCurrentWordSet] = useState([]);
  const [selectedLetters, setSelectedLetters] = useState([]);
  const [foundWords, setFoundWords] = useState([]);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [gameOver, setGameOver] = useState(false);
  const [shuffledLetters, setShuffledLetters] = useState([]);
  const [hint, setHint] = useState('');
  const [animations, setAnimations] = useState([]);

  const generateWordSet = useCallback(() => {
    const wordSetIndex = (level - 1) % WORDS.length;
    return WORDS[wordSetIndex];
  }, [level]);

  useEffect(() => {
    if (!gameRunning || isPaused) return;

    const wordSet = generateWordSet();
    setCurrentWordSet(wordSet);
    setFoundWords([]);
    setSelectedLetters([]);
    setScore(0);
    setTimeLeft(60);
    setGameOver(false);
    onScoreChange(0);

    // Create shuffled letters from all words
    const allLetters = wordSet.join('').split('').filter(l => l !== ' ');
    const shuffled = allLetters.sort(() => Math.random() - 0.5);
    setShuffledLetters(shuffled);

    // Set hint
    setHint(`Find ${wordSet.length} words related to a theme`);
  }, [gameRunning, isPaused, level, generateWordSet, onScoreChange]);

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

  const handleLetterClick = (letter, index) => {
    if (gameOver || isPaused || !gameRunning) return;

    setSelectedLetters(prev => {
      const newSelection = [...prev, { letter, index }];
      
      // Check if selected letters form a word
      const word = newSelection.map(s => s.letter).join('');
      const foundWord = currentWordSet.find(w => w === word);
      
      if (foundWord && !foundWords.includes(foundWord)) {
        // Word found!
        setFoundWords(prev => [...prev, foundWord]);
        setScore(prev => {
          const newScore = prev + 100 * level;
          onScoreChange(newScore);
          
          // Check level completion
          if (prev + 100 * level >= level * 400) {
            onLevelComplete();
          }
          
          return newScore;
        });
        
        // Create success animation
        setAnimations(prev => [...prev, {
          id: Date.now(),
          type: 'success',
          text: `Found: ${foundWord}!`,
          x: 400,
          y: 300
        }]);

        // Remove used letters
        const usedIndices = newSelection.map(s => s.index);
        setShuffledLetters(prev => 
          prev.filter((_, i) => !usedIndices.includes(i))
        );
        
        return [];
      } else if (newSelection.length > 10) {
        // Too many letters, reset
        setAnimations(prev => [...prev, {
          id: Date.now(),
          type: 'error',
          text: 'Not a word!',
          x: 400,
          y: 300
        }]);
        return [];
      }
      
      return newSelection;
    });
  };

  const handleClear = () => {
    setSelectedLetters([]);
  };

  const getSelectedWord = () => {
    return selectedLetters.map(s => s.letter).join('');
  };

  useEffect(() => {
    // Remove animations after they finish
    const timer = setInterval(() => {
      setAnimations(prev => prev.filter(a => Date.now() - a.id < 2000));
    }, 100);

    return () => clearInterval(timer);
  }, []);

  const handleRetry = () => {
    const wordSet = generateWordSet();
    setCurrentWordSet(wordSet);
    setFoundWords([]);
    setSelectedLetters([]);
    setScore(0);
    setTimeLeft(60);
    setGameOver(false);
    onScoreChange(0);
    
    const allLetters = wordSet.join('').split('').filter(l => l !== ' ');
    const shuffled = allLetters.sort(() => Math.random() - 0.5);
    setShuffledLetters(shuffled);
  };

  return (
    <div className="word-connect-game">
      <div className="word-stats">
        <div className="stat">Score: {score}</div>
        <div className="stat">Level: {level}</div>
        <div className="stat">Time: {timeLeft}s</div>
        <div className="stat">Found: {foundWords.length}/{currentWordSet.length}</div>
      </div>

      {gameOver && (
        <div className="game-over-overlay">
          <h2>{foundWords.length === currentWordSet.length ? '🎉 Perfect!' : '⏰ Time Up!'}</h2>
          <p>Final Score: {score}</p>
          <p>Words Found: {foundWords.length}/{currentWordSet.length}</p>
          <button onClick={handleRetry} className="retry-btn">Retry</button>
        </div>
      )}

      <div className="word-game-container">
        <div className="hint-box">
          <p>{hint}</p>
          <div className="found-words">
            {foundWords.map((word, i) => (
              <span key={i} className="found-word">{word}</span>
            ))}
          </div>
        </div>

        <div className="selected-word-display">
          <div className="selected-letters">
            {selectedLetters.map((sel, i) => (
              <span key={i} className="selected-letter">{sel.letter}</span>
            ))}
          </div>
          {selectedLetters.length > 0 && (
            <button onClick={handleClear} className="clear-btn">Clear</button>
          )}
        </div>

        <div className="letters-grid">
          {shuffledLetters.map((letter, index) => {
            const isSelected = selectedLetters.some(s => s.index === index);
            return (
              <button
                key={index}
                className={`letter-tile ${isSelected ? 'selected' : ''}`}
                onClick={() => handleLetterClick(letter, index)}
                disabled={isSelected || gameOver || isPaused}
              >
                {letter}
              </button>
            );
          })}
        </div>

        <div className="target-words">
          <h3>Find these words:</h3>
          <div className="target-words-list">
            {currentWordSet.map((word, i) => (
              <div
                key={i}
                className={`target-word ${foundWords.includes(word) ? 'found' : ''}`}
              >
                {foundWords.includes(word) ? '✓ ' : ''}{word}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Animations */}
      {animations.map(anim => (
        <div
          key={anim.id}
          className={`animation-popup ${anim.type}`}
          style={{
            left: anim.x,
            top: anim.y
          }}
        >
          {anim.text}
        </div>
      ))}

      <div className="controls-hint">
        <p>Click letters to form words. Find all words to complete the level!</p>
      </div>
    </div>
  );
};

export default WordConnectGame;

