import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './TypingGame.css';
import '../Game.css';
import API_URL from '../../config';
const GAME_TYPE = 'typing';

const codeSnippets = [
  { code: `function calculateSum(a, b) {
  return a + b;
}`, language: 'JavaScript' },
  { code: `def factorial(n):
  if n == 0:
    return 1
  return n * factorial(n - 1)`, language: 'Python' },
  { code: `public class Hello {
  public static void main(String[] args) {
    System.out.println("Hello World");
  }
}`, language: 'Java' },
  { code: `#include <stdio.h>
int main() {
  printf("Hello World");
  return 0;
}`, language: 'C' },
  { code: `const arr = [1, 2, 3, 4, 5];
const doubled = arr.map(x => x * 2);
console.log(doubled);`, language: 'JavaScript' }
];

const TypingGame = ({ gameRunning, onScoreChange }) => {
  const [currentSnippet, setCurrentSnippet] = useState(0);
  const [userInput, setUserInput] = useState('');
  const [score, setScore] = useState(0);
  const [wpm, setWpm] = useState(0);
  const [startTime, setStartTime] = useState(Date.now());
  const [charactersTyped, setCharactersTyped] = useState(0);
  const [errors, setErrors] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const inputRef = useRef(null);

  const currentCode = codeSnippets[currentSnippet].code;
  const currentLanguage = codeSnippets[currentSnippet].language;

  const saveCheckpoint = async () => {
    try {
      const token = localStorage.getItem('token');
      const gameState = { currentSnippet, userInput, score, wpm, startTime, charactersTyped, errors };
      await axios.post(
        `${API_URL}/games/checkpoint/save`,
        { gameType: GAME_TYPE, gameState, score, level: currentSnippet + 1 },
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
      const { gameState, score: savedScore } = response.data;
      setCurrentSnippet(gameState.currentSnippet || 0);
      setUserInput(gameState.userInput || '');
      setScore(savedScore || 0);
      setWpm(gameState.wpm || 0);
      setStartTime(gameState.startTime || Date.now());
      setCharactersTyped(gameState.charactersTyped || 0);
      setErrors(gameState.errors || 0);
      onScoreChange(savedScore || 0);
      return true;
    } catch (error) {
      return false;
    }
  };

  const handleRetry = () => {
    setCurrentSnippet(0);
    setUserInput('');
    setScore(0);
    setWpm(0);
    setStartTime(Date.now());
    setCharactersTyped(0);
    setErrors(0);
    setIsComplete(false);
    onScoreChange(0);
    inputRef.current?.focus();
  };

  useEffect(() => {
    if (gameRunning) {
      loadCheckpoint().then(loaded => {
        if (!loaded) {
          setCurrentSnippet(0);
          setUserInput('');
          setScore(0);
          setStartTime(Date.now());
        }
        inputRef.current?.focus();
      });
    }
  }, [gameRunning]);

  useEffect(() => {
    if (!gameRunning) return;
    const autoSaveInterval = setInterval(() => {
      saveCheckpoint();
    }, 30000);
    return () => clearInterval(autoSaveInterval);
  }, [gameRunning, currentSnippet, userInput, score, wpm, startTime, charactersTyped, errors]);

  useEffect(() => {
    if (!gameRunning) return;
    const wpmTimer = setInterval(() => {
      const timeElapsed = (Date.now() - startTime) / 60000;
      if (timeElapsed > 0) {
        setWpm(Math.round(charactersTyped / 5 / timeElapsed));
      }
    }, 1000);
    return () => clearInterval(wpmTimer);
  }, [gameRunning, charactersTyped, startTime]);

  const handleInputChange = (e) => {
    if (!gameRunning) return;
    const value = e.target.value;
    setUserInput(value);
    setCharactersTyped(prev => prev + 1);

    const expectedChar = currentCode[value.length - 1];
    const actualChar = value[value.length - 1];
    if (expectedChar !== actualChar && value.length > 0) {
      setErrors(prev => prev + 1);
    }

    if (value === currentCode) {
      setIsComplete(true);
      const timeTaken = (Date.now() - startTime) / 1000;
      const newScore = Math.round((currentCode.length / timeTaken) * 100 - errors * 10);
      setScore(prev => {
        const totalScore = prev + Math.max(0, newScore);
        onScoreChange(totalScore);
        return totalScore;
      });
      setTimeout(() => {
        setCurrentSnippet((prev) => (prev + 1) % codeSnippets.length);
        setUserInput('');
        setIsComplete(false);
        setStartTime(Date.now());
        setErrors(0);
      }, 1500);
    }
  };

  const getCharClass = (index) => {
    if (index >= userInput.length) return '';
    if (userInput[index] === currentCode[index]) return 'correct';
    return 'incorrect';
  };

  return (
    <div className="typing-game-area">
      <div className="game-info">
        <div className="language-badge">{currentLanguage}</div>
        <div className="snippet-info">Snippet {currentSnippet + 1} of {codeSnippets.length}</div>
      </div>
      <div className="code-display">
        <div className="code-preview">
          {currentCode.split('').map((char, index) => (
            <span
              key={index}
              className={`char ${getCharClass(index)} ${index === userInput.length ? 'current' : ''}`}
            >
              {char === ' ' ? '\u00A0' : char}
            </span>
          ))}
        </div>
      </div>
      <div className="input-area">
        <textarea
          ref={inputRef}
          className="code-input"
          value={userInput}
          onChange={handleInputChange}
          placeholder="Start typing the code above..."
          disabled={!gameRunning}
          autoFocus
        />
      </div>
      {isComplete && (
        <div className="completion-message">✅ Great! Moving to next snippet...</div>
      )}
      <div className="typing-stats">
        <div className="stat-display">Score: {score}</div>
        <div className="stat-display">WPM: {wpm}</div>
        <div className="stat-display">Errors: {errors}</div>
      </div>
      <div className="checkpoint-controls">
        <button className="save-checkpoint-btn" onClick={saveCheckpoint} disabled={!gameRunning}>
          💾 Save Checkpoint
        </button>
        <button className="retry-btn" onClick={handleRetry} style={{ marginTop: '10px' }}>
          🔄 Retry
        </button>
      </div>
    </div>
  );
};

export default TypingGame;
