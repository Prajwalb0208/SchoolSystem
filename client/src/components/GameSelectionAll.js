import React from 'react';
import { useNavigate } from 'react-router-dom';
import soundEffects from '../utils/soundEffects';
import './GameSelection.css';

const GameSelection = () => {
  const navigate = useNavigate();

  const games = [
    // Original games
    {
      id: 'memory',
      name: 'Memory Match',
      icon: '🧠',
      description: 'Match pairs of cards. Test your memory and concentration skills.',
      color: '#45B7D1',
      difficulty: 'Medium'
    },
    {
      id: 'minesweeper',
      name: 'Minesweeper',
      icon: '💣',
      description: 'Find all mines without detonating them! Use logic and strategy.',
      color: '#795548',
      difficulty: 'Hard'
    },
    {
      id: '2048',
      name: '2048 Game',
      icon: '🔢',
      description: 'Slide tiles to combine numbers and reach 2048!',
      color: '#FFC107',
      difficulty: 'Medium'
    },
    {
      id: 'sudoku',
      name: 'Sudoku',
      icon: '🔢',
      description: 'Fill the 9x9 grid with numbers 1-9. No repeats in rows, columns, or boxes!',
      color: '#607D8B',
      difficulty: 'Hard'
    },
    {
      id: 'carracing',
      name: 'Infinite Cars',
      icon: '🏎️',
      description: 'Race through traffic! Avoid obstacles and reach the finish line.',
      color: '#FF4444',
      difficulty: 'Medium'
    },
    {
      id: 'sonic',
      name: 'Sonic Runner',
      icon: '💨',
      description: 'Run as Sonic! Jump over enemies and collect rings in this endless runner.',
      color: '#00FFFF',
      difficulty: 'Medium'
    },
    {
      id: 'monopoly',
      name: 'Monopoly',
      icon: '🏰',
      description: 'Multiplayer board game! Buy properties, collect rent, and become the richest!',
      color: '#2c3e50',
      difficulty: 'Medium'
    },
    // 30 HTML Games
    {
      id: 'candycrush',
      name: 'Candy Crush',
      icon: '🍬',
      description: 'Match three candies to clear the board!',
      color: '#FF69B4',
      difficulty: 'Easy'
    },
    {
      id: 'archery',
      name: 'Archery',
      icon: '🏹',
      description: 'Test your aim and hit the bullseye!',
      color: '#8B4513',
      difficulty: 'Medium'
    },
    {
      id: 'speedtyping',
      name: 'Speed Typing',
      icon: '⌨️',
      description: 'Type words as fast as you can!',
      color: '#4CAF50',
      difficulty: 'Easy'
    },
    {
      id: 'breakout',
      name: 'Breakout',
      icon: '🎮',
      description: 'Break all the bricks with your paddle!',
      color: '#FF9800',
      difficulty: 'Medium'
    },
    {
      id: 'towerblocks',
      name: 'Tower Blocks',
      icon: '🏗️',
      description: 'Stack blocks as high as possible!',
      color: '#9C27B0',
      difficulty: 'Hard'
    },
    {
      id: 'pingpong',
      name: 'Ping Pong',
      icon: '🏓',
      description: 'Classic table tennis game!',
      color: '#00BCD4',
      difficulty: 'Medium'
    },
    {
      id: 'tetris',
      name: 'Tetris',
      icon: '🧱',
      description: 'Arrange falling blocks to clear lines!',
      color: '#F44336',
      difficulty: 'Hard'
    },
    {
      id: 'tiltingmaze',
      name: 'Tilting Maze',
      icon: '🌀',
      description: 'Navigate the ball through the maze!',
      color: '#3F51B5',
      difficulty: 'Hard'
    },
    {
      id: 'memorycard',
      name: 'Memory Card',
      icon: '🃏',
      description: 'Match pairs of cards!',
      color: '#E91E63',
      difficulty: 'Easy'
    },
    {
      id: 'rockpaperscissors',
      name: 'Rock Paper Scissors',
      icon: '✂️',
      description: 'Play the classic hand game!',
      color: '#795548',
      difficulty: 'Easy'
    },
    {
      id: 'numberguessing',
      name: 'Number Guessing',
      icon: '🔢',
      description: 'Guess the hidden number!',
      color: '#607D8B',
      difficulty: 'Easy'
    },
    {
      id: 'tictactoe',
      name: 'Tic Tac Toe',
      icon: '⭕',
      description: 'Classic X and O game!',
      color: '#FF5722',
      difficulty: 'Easy'
    },
    {
      id: 'snake',
      name: 'Snake',
      icon: '🐍',
      description: 'Control the snake and eat food!',
      color: '#4CAF50',
      difficulty: 'Medium'
    },
    {
      id: 'connectfour',
      name: 'Connect Four',
      icon: '🔵',
      description: 'Connect four in a row!',
      color: '#2196F3',
      difficulty: 'Medium'
    },
    {
      id: 'insectcatch',
      name: 'Insect Catch',
      icon: '🐞',
      description: 'Catch insects before they disappear!',
      color: '#FFC107',
      difficulty: 'Easy'
    },
    {
      id: 'typing',
      name: 'Typing Game',
      icon: '⌨️',
      description: 'Improve your typing speed!',
      color: '#009688',
      difficulty: 'Easy'
    },
    {
      id: 'hangman',
      name: 'Hangman',
      icon: '🎩',
      description: 'Guess the word before it\'s too late!',
      color: '#9E9E9E',
      difficulty: 'Medium'
    },
    {
      id: 'flappybird',
      name: 'Flappy Bird',
      icon: '🐦',
      description: 'Guide the bird through pipes!',
      color: '#FFEB3B',
      difficulty: 'Hard'
    },
    {
      id: 'crossyroad',
      name: 'Crossy Road',
      icon: '🚦',
      description: 'Cross roads and avoid obstacles!',
      color: '#8BC34A',
      difficulty: 'Medium'
    },
    {
      id: 'diceroll',
      name: 'Dice Roll',
      icon: '🎲',
      description: 'Roll the dice and see your luck!',
      color: '#FF9800',
      difficulty: 'Easy'
    },
    {
      id: 'shapeclicker',
      name: 'Shape Clicker',
      icon: '🔷',
      description: 'Click shapes to score points!',
      color: '#E91E63',
      difficulty: 'Easy'
    },
    {
      id: 'typing2',
      name: 'Typing Challenge',
      icon: '⌨️',
      description: 'Another typing challenge!',
      color: '#00BCD4',
      difficulty: 'Medium'
    },
    {
      id: 'speaknumber',
      name: 'Speak Number',
      icon: '🗣️',
      description: 'Guess numbers by speaking!',
      color: '#9C27B0',
      difficulty: 'Medium'
    },
    {
      id: 'fruitslicer',
      name: 'Fruit Slicer',
      icon: '🍉',
      description: 'Slice fruits and avoid bombs!',
      color: '#FF5722',
      difficulty: 'Medium'
    },
    {
      id: 'quiz',
      name: 'Quiz Game',
      icon: '🧠',
      description: 'Test your knowledge!',
      color: '#3F51B5',
      difficulty: 'Medium'
    },
    {
      id: 'emojicatcher',
      name: 'Emoji Catcher',
      icon: '😄',
      description: 'Catch falling emojis!',
      color: '#FFC107',
      difficulty: 'Easy'
    },
    {
      id: 'whackamole',
      name: 'Whack A Mole',
      icon: '🕹️',
      description: 'Hit the moles as they appear!',
      color: '#8B4513',
      difficulty: 'Easy'
    },
    {
      id: 'simonsays',
      name: 'Simon Says',
      icon: '💡',
      description: 'Follow the color sequence!',
      color: '#FF6B6B',
      difficulty: 'Hard'
    }
  ];

  const handleGameSelect = (gameId) => {
    soundEffects.playClick();
    navigate(`/game/${gameId}`);
  };

  return (
    <div className="game-selection-page">
      <div className="game-selection-container">
        <h1>🎮 Choose Your Game</h1>
        <p className="subtitle">Select a game to play. Quiz will appear after 2 minutes!</p>
        
        <div className="games-grid">
          {games.map((game) => (
            <div
              key={game.id}
              className="game-card"
              onClick={() => handleGameSelect(game.id)}
              style={{ borderColor: game.color }}
            >
              <div className="game-icon" style={{ color: game.color }}>
                {game.icon}
              </div>
              <h2>{game.name}</h2>
              <p className="game-description">{game.description}</p>
              <div className="game-meta">
                <span className="difficulty-badge" style={{ background: game.color }}>
                  {game.difficulty}
                </span>
              </div>
              <button 
                className="play-btn"
                style={{ background: game.color }}
                onClick={(e) => {
                  e.stopPropagation();
                  handleGameSelect(game.id);
                }}
              >
                Play Now →
              </button>
            </div>
          ))}
        </div>

        <div className="game-info-box">
          <h3>📋 How It Works</h3>
          <ul>
            <li>Play any game for 2 minutes</li>
            <li>A quiz with coding questions will appear automatically</li>
            <li>Answer at least 60% of questions correctly to continue</li>
            <li>Your progress is tracked for each game</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default GameSelection;

