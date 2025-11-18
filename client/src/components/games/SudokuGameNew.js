import React, { useEffect, useRef, useState } from 'react';
import './SudokuGameNew.css';

const SudokuGameNew = ({ gameRunning, onScoreChange, isPaused, level = 1, onLevelComplete }) => {
  const gameContainerRef = useRef(null);
  const scriptsLoadedRef = useRef(false);
  const gameInitializedRef = useRef(false);
  const [currentScore, setCurrentScore] = useState(0);

  useEffect(() => {
    if (!gameRunning || isPaused || scriptsLoadedRef.current) return;

    const loadScript = (src) => {
      return new Promise((resolve, reject) => {
        const existing = document.querySelector(`script[src="${src}"]`);
        if (existing) {
          resolve();
          return;
        }
        const script = document.createElement('script');
        script.src = src;
        script.onload = resolve;
        script.onerror = reject;
        document.body.appendChild(script);
      });
    };

    const loadStyles = (href) => {
      return new Promise((resolve) => {
        const existing = document.querySelector(`link[href="${href}"]`);
        if (existing) {
          resolve();
          return;
        }
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = href;
        link.onload = resolve;
        document.head.appendChild(link);
      });
    };

    const initializeGame = async () => {
      try {
        // Load Google Fonts
        const fontLink = document.createElement('link');
        fontLink.href = 'https://fonts.googleapis.com/css2?family=Potta+One&display=swap';
        fontLink.rel = 'stylesheet';
        document.head.appendChild(fontLink);

        // Load Box Icons
        const boxIconsLink = document.createElement('link');
        boxIconsLink.href = 'https://unpkg.com/boxicons@2.0.9/css/boxicons.min.css';
        boxIconsLink.rel = 'stylesheet';
        document.head.appendChild(boxIconsLink);

        // Load styles
        await loadStyles('/sudoku-styles.css');

        // Load scripts in order
        await loadScript('/sudoku-assets/js/constant.js');
        await loadScript('/sudoku-assets/js/sudoku.js');
        await loadScript('/sudoku-assets/js/app.js');

        scriptsLoadedRef.current = true;

        // Create game HTML structure
        if (gameContainerRef.current && !gameInitializedRef.current) {
          gameContainerRef.current.innerHTML = `
            <div class="sudoku-wrapper">
              <nav>
                <div class="nav-container">
                  <a href="#" class="nav-logo">Sudoku</a>
                  <div class="dark-mode-toggle" id="dark-mode-toggle">
                    <i class="bx bxs-sun"></i>
                    <i class="bx bxs-moon"></i>
                  </div>
                </div>
              </nav>
              
              <div class="main">
                <div class="screen">
                  <div class="start-screen active" id="start-screen">
                    <input type="text" placeholder="Your name" maxlength="11" class="input-name" id="input-name" value="Player">
                    <div class="btn" id="btn-level">Easy</div>
                    <div class="btn" id="btn-continue">Continue</div>
                    <div class="btn btn-blue" id="btn-play">New game</div>
                  </div>
                  
                  <div class="main-game" id="game-screen">
                    <div class="main-sudoku-grid" id="sudoku-grid">
                      ${Array(81).fill(0).map(() => '<div class="main-grid-cell"></div>').join('')}
                    </div>
                    
                    <div class="main-game-info">
                      <div class="main-game-info-box main-game-info-name">
                        <span id="player-name">Player</span>
                      </div>
                      <div class="main-game-info-box main-game-info-level">
                        <span id="game-level">Easy</span>
                      </div>
                    </div>
                    
                    <div class="main-game-info-box main-game-info-time">
                      <span id="game-time">00:00</span>
                      <div class="pause-btn" id="btn-pause">
                        <i class="bx bx-pause"></i>
                      </div>
                    </div>
                    
                    <div class="numbers">
                      ${Array(9).fill(0).map((_, i) => `<div class="number">${i + 1}</div>`).join('')}
                      <div class="delete" id="btn-delete">X</div>
                    </div>
                  </div>
                  
                  <div class="pause-screen" id="pause-screen">
                    <div class="btn btn-blue" id="btn-resume">Resume</div>
                    <div class="btn" id="btn-new-game">New game</div>
                  </div>
                  
                  <div class="result-screen" id="result-screen">
                    <div class="congrate">Completed</div>
                    <div class="info">Time</div>
                    <div id="result-time"></div>
                    <div class="btn" id="btn-new-game-2">New game</div>
                  </div>
                </div>
              </div>
            </div>
          `;

          // Initialize game grid spacing
          setTimeout(() => {
            const cells = gameContainerRef.current.querySelectorAll('.main-grid-cell');
            for (let i = 0; i < 81; i++) {
              const row = Math.floor(i / 9);
              const col = i % 9;
              if (row === 2 || row === 5) cells[i].style.marginBottom = '10px';
              if (col === 2 || col === 5) cells[i].style.marginRight = '10px';
            }
          }, 100);

          gameInitializedRef.current = true;
        }
      } catch (error) {
        console.error('Error loading Sudoku game:', error);
      }
    };

    initializeGame();
  }, [gameRunning, isPaused]);

  // Track score from game completion
  useEffect(() => {
    if (!gameRunning || !gameInitializedRef.current) return;

    const checkGameComplete = setInterval(() => {
      const resultScreen = gameContainerRef.current?.querySelector('#result-screen');
      if (resultScreen && resultScreen.classList.contains('active')) {
        const timeEl = resultScreen.querySelector('#result-time');
        if (timeEl && timeEl.textContent) {
          // Calculate score based on completion time
          const timeText = timeEl.textContent;
          const [minutes, seconds] = timeText.split(':').map(Number);
          const totalSeconds = minutes * 60 + seconds;
          const score = Math.max(0, 1000 - totalSeconds * 2);
          if (score !== currentScore) {
            setCurrentScore(score);
            onScoreChange(score);
          }
        }
      }
    }, 1000);

    return () => clearInterval(checkGameComplete);
  }, [gameRunning, currentScore, onScoreChange]);

  return (
    <div className="sudoku-game-new">
      <div ref={gameContainerRef} className="sudoku-container"></div>
    </div>
  );
};

export default SudokuGameNew;

