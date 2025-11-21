import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import QuizPopup from './QuizPopup';
import GameControls from './GameControls';
import LevelComplete from './LevelComplete';
import HowToPlay from './HowToPlay';
import soundEffects from '../utils/soundEffects';
import MemoryGame from './games/MemoryGame';
import MinesweeperGame from './games/MinesweeperGame';
import Game2048 from './games/Game2048';
import SudokuGame from './games/SudokuGameNew';
import InfiniteCarsGame from './games/InfiniteCarsGame';
import SonicGame from './games/SonicGame';
import MonopolyGame from './games/MonopolyGame';
import './Game.css';

const API_URL = process.env.REACT_APP_API_URL || 'https://schoolsystem-lyl7.onrender.com/api';

const Game = () => {
  const { gameType } = useParams();
  const navigate = useNavigate();
  const [gameTimeLimit, setGameTimeLimit] = useState(120); // Default 2 minutes, will be fetched from settings
  const [gameTime, setGameTime] = useState(120); // Current time remaining
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizData, setQuizData] = useState(null);
  const [quizPassed, setQuizPassed] = useState(false);
  const [gameRunning, setGameRunning] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [gameScore, setGameScore] = useState(0);
  const [currentLevel, setCurrentLevel] = useState(1);
  const [progress, setProgress] = useState(0); // 0-100 for progress bar
  const [levelCompleted, setLevelCompleted] = useState(false);
  const [levelCompleteScore, setLevelCompleteScore] = useState(0);
  const [showHowToPlay, setShowHowToPlay] = useState(false);
  const lastWarningTimeRef = useRef(0);
  const startTimeRef = useRef(Date.now());

  // Fetch game settings on mount
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await axios.get(`${API_URL}/settings`);
        const timeLimit = response.data.gameTimeLimit || 120;
        setGameTimeLimit(timeLimit);
        setGameTime(timeLimit);
      } catch (error) {
        console.error('Error fetching settings:', error);
        // Use default if fetch fails
      }
    };
    fetchSettings();
  }, []);

  const handleTimeUp = useCallback(async () => {
    if (showQuiz) return; // Prevent multiple triggers
    
    setGameRunning(false);
    setIsPaused(true);
    soundEffects.playTimeWarning();
    
    try {
      const token = localStorage.getItem('token');
      const usn = localStorage.getItem('studentUSN');
      
      if (!usn) {
        alert('Please enter your USN first. Redirecting to home...');
        navigate('/');
        return;
      }
      
      const response = await axios.get(`${API_URL}/games/quiz/${gameType}`, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {},
        params: { usn }
      });
      
      if (response.data && response.data.questions && response.data.questions.length > 0) {
        setQuizData({ ...response.data, gameScore, level: currentLevel });
        setShowQuiz(true);
      } else {
        alert('No quiz questions available. Please try again later.');
        setGameRunning(true);
        setIsPaused(false);
      }
    } catch (error) {
      console.error('Error fetching quiz:', error);
      const errorMsg = error.response?.data?.message || error.message || 'Failed to load quiz';
      alert(`Error loading quiz: ${errorMsg}. Please try again.`);
      // Reset game state on error
      setGameRunning(true);
      setIsPaused(false);
    }
  }, [gameType, gameScore, currentLevel, showQuiz, navigate]);

  useEffect(() => {
    soundEffects.updateSettings();
    
    let timer;
    if (gameRunning && !showQuiz && !isPaused) {
      timer = setInterval(() => {
        setGameTime((prev) => {
          if (prev <= 1) {
            handleTimeUp();
            return 0;
          }
          if (prev <= 60 && prev % 10 === 0 && Date.now() - lastWarningTimeRef.current > 9000) {
            soundEffects.playTimeWarning();
            lastWarningTimeRef.current = Date.now();
          }
          const elapsed = gameTimeLimit - prev;
          setProgress((elapsed / gameTimeLimit) * 100);
          return prev - 1;
        });
      }, 1000);
    }

    return () => clearInterval(timer);
  }, [gameRunning, showQuiz, isPaused, handleTimeUp, gameTimeLimit]);

  const handleQuizComplete = async (passed, quizAnswers) => {
    setQuizPassed(passed);
    
    if (passed) {
      soundEffects.playSuccess();
      // Reset timer for next session but keep game paused
      setGameTime(gameTimeLimit);
      setProgress(0);
      // Keep game paused - don't advance level or reset score
      setGameRunning(false);
      setIsPaused(true);
      setShowQuiz(false);
      setQuizData(null);
      startTimeRef.current = Date.now();
    } else {
      soundEffects.playError();
      // Keep game paused if quiz failed
      setGameRunning(false);
      setIsPaused(true);
      setShowQuiz(false);
      setQuizData(null);
    }
  };

  const handleRetry = () => {
    setShowQuiz(false);
    setQuizData(null);
    setQuizPassed(false);
    // Reset timer and allow game to continue - quiz will appear again after 2 minutes
    setGameTime(gameTimeLimit);
    setProgress(0);
    setIsPaused(false);
    setGameRunning(true);
    startTimeRef.current = Date.now();
    // Don't fetch quiz immediately - let timer count down naturally
  };

  const handlePause = () => {
    if (!showQuiz && !levelCompleted) {
      setIsPaused(true);
      setGameRunning(false);
      soundEffects.playClick();
    }
  };

  const handleResume = useCallback(() => {
    if (!showQuiz && !levelCompleted) {
      setIsPaused(false);
      setGameRunning(true);
      soundEffects.playClick();
    }
  }, []);

  // Handle spacebar for resume
  useEffect(() => {
    const handleKeyPress = (e) => {
      // Only handle spacebar if game is paused and not in quiz or level complete
      if (e.code === 'Space' && isPaused && !showQuiz && !levelCompleted) {
        e.preventDefault();
        handleResume();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [isPaused, showQuiz, levelCompleted, handleResume]);

  const handleRestart = () => {
    if (window.confirm('Are you sure you want to restart? All progress will be lost.')) {
      setGameTime(gameTimeLimit);
      setGameRunning(true);
      setIsPaused(false);
      setShowQuiz(false);
      setQuizData(null);
      setQuizPassed(false);
      setGameScore(0);
      setProgress(0);
      setCurrentLevel(1);
      setLevelCompleted(false);
      setLevelCompleteScore(0);
      startTimeRef.current = Date.now();
      soundEffects.playClick();
    }
  };

  const handleQuit = () => {
    if (window.confirm('Are you sure you want to quit? All progress will be lost.')) {
      navigate('/games');
      soundEffects.playClick();
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleLevelComplete = () => {
    setLevelCompleteScore(gameScore);
    setLevelCompleted(true);
    setGameRunning(false);
    setIsPaused(true);
    soundEffects.playSuccess();
  };

  const handleNextLevel = () => {
    if (currentLevel < 5) {
      setCurrentLevel(prev => prev + 1);
      setGameScore(0);
      setProgress(0);
      setLevelCompleted(false);
      setGameRunning(true);
      setIsPaused(false);
      setGameTime(gameTimeLimit);
      startTimeRef.current = Date.now();
      soundEffects.playClick();
    }
  };

  const handleContinueCurrentLevel = () => {
    setLevelCompleted(false);
    setGameRunning(true);
    setIsPaused(false);
    soundEffects.playClick();
  };

  const renderGame = () => {
    const gameProps = { 
      gameRunning: gameRunning && !isPaused && !levelCompleted, 
      onScoreChange: setGameScore,
      isPaused: isPaused || levelCompleted,
      level: currentLevel,
      onLevelComplete: handleLevelComplete
    };
    
    switch(gameType) {
      case 'memory':
        return <MemoryGame {...gameProps} />;
      case 'minesweeper':
        return <MinesweeperGame {...gameProps} />;
      case '2048':
        return <Game2048 {...gameProps} />;
      case 'sudoku':
        return <SudokuGame {...gameProps} />;
      case 'carracing':
        return <InfiniteCarsGame {...gameProps} />;
      case 'sonic':
        return <SonicGame {...gameProps} />;
      case 'monopoly':
        return <MonopolyGame {...gameProps} />;
      default:
        return <div>Game not found: {gameType}</div>;
    }
  };

  const gameNames = {
    memory: 'Memory Match',
    minesweeper: 'Minesweeper',
    2048: '2048 Game',
    sudoku: 'Sudoku',
    carracing: 'Infinite Cars',
    sonic: 'Sonic Runner',
    monopoly: 'Monopoly'
  };

  return (
    <div className="game-container">
      {/* Top Header - Title and How to Play */}
      <div className="game-top-header">
        <h1 className="game-title">🎮 {gameNames[gameType] || 'Game'}</h1>
        <button 
          className="how-to-play-btn"
          onClick={() => setShowHowToPlay(true)}
          title="How to Play"
        >
          ❓ How to Play
        </button>
      </div>

      {/* Game Area with Side Stats */}
      <div className="game-layout-wrapper">
        {/* Left Side - Score */}
        <div className="game-side-stats left-stats">
          <div className="side-stat-card">
            <div className="side-stat-label">SCORE</div>
            <div className="side-stat-value">{gameScore}</div>
          </div>
          <div className="side-stat-card">
            <div className="side-stat-label">LEVEL</div>
            <div className="side-stat-value">{currentLevel}/5</div>
          </div>
        </div>

        {/* Center - Game Content */}
        <div className="game-content-wrapper">
          <div className="game-content">
            {gameRunning && !showQuiz && !isPaused && !levelCompleted ? (
              renderGame()
            ) : null}
          </div>
        </div>

        {/* Right Side - Time */}
        <div className="game-side-stats right-stats">
          <div className={`side-stat-card timer-card ${gameTime < 60 ? 'warning' : ''}`}>
            <div className="side-stat-label">TIME</div>
            <div className="side-stat-value timer-value">{formatTime(gameTime)}</div>
          </div>
        </div>
      </div>

      {/* Controls */}
      {!showQuiz && !levelCompleted && (
        <GameControls
          isPaused={isPaused}
          onPause={handlePause}
          onResume={handleResume}
          onRestart={handleRestart}
          onQuit={handleQuit}
        />
      )}

      {isPaused && !showQuiz && !levelCompleted && (
        <div className="pause-overlay">
          <h2>⏸️ Game Paused</h2>
          <p>{quizPassed ? 'Quiz completed! Press SPACEBAR or click Resume to continue playing at the same level.' : 'Press SPACEBAR or click Resume to continue playing'}</p>
          {quizPassed && (
            <div className="current-stats" style={{ marginTop: '20px' }}>
              <div className="stat-box">
                <span className="stat-label">Score</span>
                <span className="stat-value-large">{gameScore}</span>
              </div>
              <div className="stat-box">
                <span className="stat-label">Level</span>
                <span className="stat-value-large">{currentLevel}/5</span>
              </div>
            </div>
          )}
        </div>
      )}

      {showQuiz && quizData && (
        <QuizPopup
          quiz={quizData}
          onComplete={handleQuizComplete}
          onRetry={handleRetry}
          passed={quizPassed}
        />
      )}

      {levelCompleted && (
        <LevelComplete
          level={currentLevel}
          score={levelCompleteScore}
          onNextLevel={handleNextLevel}
          onContinue={handleContinueCurrentLevel}
        />
      )}

      {showHowToPlay && (
        <HowToPlay 
          gameType={gameType} 
          onClose={() => setShowHowToPlay(false)} 
        />
      )}
    </div>
  );
};

export default Game;
