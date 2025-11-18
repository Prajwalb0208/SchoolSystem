import React, { useState } from 'react';
import './HowToPlay.css';

const gameInstructions = {
  memory: {
    title: 'Memory Match',
    instructions: [
      'Click on cards to flip them over',
      'Match pairs of cards with the same image',
      'Remember the positions of cards you\'ve seen',
      'Complete all matches to win!'
    ]
  },
  minesweeper: {
    title: 'Minesweeper',
    instructions: [
      'Click on cells to reveal them',
      'Numbers show how many mines are adjacent',
      'Right-click to flag suspected mines',
      'Clear all non-mine cells to win!'
    ]
  },
  '2048': {
    title: '2048',
    instructions: [
      'Use arrow keys or swipe to move tiles',
      'Tiles with the same number merge when they touch',
      'Try to create a tile with the number 2048',
      'Game ends when the board is full!'
    ]
  },
  sudoku: {
    title: 'Sudoku',
    instructions: [
      'Fill the 9x9 grid with numbers 1-9',
      'Each row must contain all numbers 1-9',
      'Each column must contain all numbers 1-9',
      'Each 3x3 box must contain all numbers 1-9',
      'No number can repeat in row, column, or box!'
    ]
  },
  carracing: {
    title: 'Infinite Cars',
    instructions: [
      'Drag the red car left and right to avoid obstacles',
      'Avoid hitting other cars and road cones',
      'Score increases as you travel further',
      'Game ends if you crash!'
    ]
  },
  sonic: {
    title: 'Sonic Runner',
    instructions: [
      'Press SPACE to jump',
      'Jump over enemies to avoid them',
      'Jump on enemies to defeat them',
      'Collect rings for points',
      'Avoid touching enemies from the side!'
    ]
  },
  monopoly: {
    title: 'Monopoly',
    instructions: [
      'Roll dice to move around the board',
      'Buy properties when you land on them',
      'Collect rent from other players',
      'Build houses and hotels to increase rent',
      'Be the last player with money to win!'
    ]
  },
  candycrush: {
    title: 'Candy Crush',
    instructions: [
      'Drag candies to swap them',
      'Match 3 or more candies of the same color',
      'Create special candies with larger matches',
      'Clear all objectives to complete the level!'
    ]
  },
  archery: {
    title: 'Archery',
    instructions: [
      'Aim and shoot arrows at targets',
      'Hit the bullseye for maximum points',
      'Time your shots carefully',
      'Score as many points as possible!'
    ]
  },
  speedtyping: {
    title: 'Speed Typing',
    instructions: [
      'Type the words that appear on screen',
      'Type as fast and accurately as possible',
      'Complete words to score points',
      'Improve your typing speed!'
    ]
  },
  breakout: {
    title: 'Breakout',
    instructions: [
      'Move the paddle left and right',
      'Bounce the ball to break bricks',
      'Don\'t let the ball fall',
      'Break all bricks to win!'
    ]
  },
  towerblocks: {
    title: 'Tower Blocks',
    instructions: [
      'Stack blocks on top of each other',
      'Time your clicks to place blocks precisely',
      'Build as high as possible',
      'Don\'t let blocks fall off!'
    ]
  },
  pingpong: {
    title: 'Ping Pong',
    instructions: [
      'Move your paddle up and down',
      'Hit the ball back to your opponent',
      'Score by making your opponent miss',
      'First to reach the target score wins!'
    ]
  },
  tetris: {
    title: 'Tetris',
    instructions: [
      'Move falling blocks left and right',
      'Rotate blocks to fit them',
      'Complete horizontal lines to clear them',
      'Don\'t let blocks reach the top!'
    ]
  },
  tiltingmaze: {
    title: 'Tilting Maze',
    instructions: [
      'Tilt your device or use arrow keys',
      'Guide the ball through the maze',
      'Avoid obstacles and traps',
      'Reach the goal to complete the level!'
    ]
  },
  memorycard: {
    title: 'Memory Card',
    instructions: [
      'Click cards to flip them',
      'Match pairs of cards',
      'Remember card positions',
      'Complete all matches with fewest moves!'
    ]
  },
  rockpaperscissors: {
    title: 'Rock Paper Scissors',
    instructions: [
      'Choose Rock, Paper, or Scissors',
      'Rock beats Scissors',
      'Paper beats Rock',
      'Scissors beats Paper',
      'Win rounds to score points!'
    ]
  },
  numberguessing: {
    title: 'Number Guessing',
    instructions: [
      'Guess the hidden number',
      'Get hints if your guess is too high or low',
      'Use logic to narrow down the range',
      'Guess correctly in as few tries as possible!'
    ]
  },
  tictactoe: {
    title: 'Tic Tac Toe',
    instructions: [
      'Take turns placing X and O',
      'Get 3 in a row to win',
      'Can be horizontal, vertical, or diagonal',
      'Block your opponent from winning!'
    ]
  },
  connectfour: {
    title: 'Connect Four',
    instructions: [
      'Drop colored discs into columns',
      'Get 4 in a row to win',
      'Can be horizontal, vertical, or diagonal',
      'Block your opponent while building your line!'
    ]
  },
  insectcatch: {
    title: 'Insect Catch',
    instructions: [
      'Click on insects as they appear',
      'Catch them before they disappear',
      'Score points for each catch',
      'Be quick and accurate!'
    ]
  },
  typing: {
    title: 'Typing Game',
    instructions: [
      'Type the words shown on screen',
      'Type accurately and quickly',
      'Complete words to score points',
      'Improve your typing skills!'
    ]
  },
  hangman: {
    title: 'Hangman',
    instructions: [
      'Guess letters to reveal the word',
      'Wrong guesses add to the hangman',
      'Guess the word before the hangman is complete',
      'Use hints wisely!'
    ]
  },
  flappybird: {
    title: 'Flappy Bird',
    instructions: [
      'Click or press space to flap',
      'Navigate through gaps in pipes',
      'Avoid hitting pipes or ground',
      'Travel as far as possible!'
    ]
  },
  crossyroad: {
    title: 'Crossy Road',
    instructions: [
      'Move forward, left, and right',
      'Cross roads and avoid traffic',
      'Navigate through obstacles',
      'Travel as far as possible!'
    ]
  },
  '2048': {
    title: '2048',
    instructions: [
      'Use arrow keys to move tiles',
      'Tiles merge when they touch',
      'Create a 2048 tile to win',
      'Plan your moves carefully!'
    ]
  },
  diceroll: {
    title: 'Dice Roll',
    instructions: [
      'Roll dice to get random numbers',
      'See different combinations',
      'Use for games or decisions',
      'Roll as many times as you want!'
    ]
  },
  shapeclicker: {
    title: 'Shape Clicker',
    instructions: [
      'Click on shapes as they appear',
      'Click quickly to score points',
      'Different shapes give different points',
      'Score as many points as possible!'
    ]
  },
  typing2: {
    title: 'Typing Challenge',
    instructions: [
      'Type the sentences shown',
      'Type accurately and quickly',
      'Complete sentences to progress',
      'Improve your typing speed!'
    ]
  },
  speaknumber: {
    title: 'Speak Number',
    instructions: [
      'Speak numbers into your microphone',
      'Guess the number the game is thinking of',
      'Get hints if you\'re close',
      'Use voice commands to play!'
    ]
  },
  fruitslicer: {
    title: 'Fruit Slicer',
    instructions: [
      'Swipe to slice fruits',
      'Avoid slicing bombs',
      'Slice fruits to score points',
      'Be quick and accurate!'
    ]
  },
  quiz: {
    title: 'Quiz Game',
    instructions: [
      'Answer multiple choice questions',
      'Select the correct answer',
      'Score points for correct answers',
      'Test your knowledge!'
    ]
  },
  emojicatcher: {
    title: 'Emoji Catcher',
    instructions: [
      'Catch falling emojis',
      'Avoid catching bombs',
      'Score points for each emoji',
      'Use your mouse or touch to move!'
    ]
  },
  whackamole: {
    title: 'Whack A Mole',
    instructions: [
      'Click on moles as they appear',
      'Hit them before they disappear',
      'Score points for each hit',
      'Be fast and accurate!'
    ]
  },
  simonsays: {
    title: 'Simon Says',
    instructions: [
      'Watch the sequence of colors',
      'Repeat the sequence in order',
      'Sequence gets longer each round',
      'Remember and repeat correctly!'
    ]
  }
};

const HowToPlay = ({ gameType, onClose }) => {
  const instructions = gameInstructions[gameType] || {
    title: 'Game Instructions',
    instructions: ['Use the controls to play the game', 'Follow on-screen prompts', 'Have fun!']
  };

  return (
    <div className="how-to-play-overlay" onClick={onClose}>
      <div className="how-to-play-modal" onClick={(e) => e.stopPropagation()}>
        <div className="how-to-play-header">
          <h2>📖 How to Play: {instructions.title}</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        <div className="how-to-play-content">
          <ul className="instructions-list">
            {instructions.instructions.map((instruction, index) => (
              <li key={index}>{instruction}</li>
            ))}
          </ul>
        </div>
        <div className="how-to-play-footer">
          <button className="got-it-btn" onClick={onClose}>Got it!</button>
        </div>
      </div>
    </div>
  );
};

export default HowToPlay;

