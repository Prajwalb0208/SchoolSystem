import React, { useEffect, useRef, useState } from 'react';
import './HTMLGameLoader.css';

const HTMLGameLoader = ({ gameId, gameRunning, onScoreChange, isPaused, level = 1, onLevelComplete }) => {
  const gameContainerRef = useRef(null);
  const iframeRef = useRef(null);
  const currentGameIdRef = useRef(null);
  const scoreIntervalRef = useRef(null);
  const [gameLoaded, setGameLoaded] = useState(false);
  const [error, setError] = useState(null);

  // Map game IDs to their folder names
  const gameFolderMap = {
    'candycrush': '01-Candy-Crush-Game',
    'archery': '02-Archery-Game',
    'speedtyping': '03-Speed-Typing-Game',
    'breakout': '04-Breakout-Game',
    'minesweeper': '05-Minesweeper-Game',
    'towerblocks': '06-Tower-Blocks',
    'pingpong': '07-Ping-Pong-Game',
    'tetris': '08-Tetris-Game',
    'tiltingmaze': '09-Tilting-Maze-Game',
    'memorycard': '10-Memory-Card-Game',
    'rockpaperscissors': '11-Rock-Paper-Scissors',
    'numberguessing': '12-Type-Number-Guessing-Game',
    'tictactoe': '13-Tic-Tac-Toe',
    'connectfour': '15-Connect-Four-Game',
    'insectcatch': '16-Insect-Catch-Game',
    'typing': '17-Typing-Game',
    'hangman': '18-Hangman-Game',
    'flappybird': '19-Flappy-Bird-Game',
    'crossyroad': '20-Crossy-Road-Game',
    '2048': '21-2048-Game',
    'diceroll': '22-Dice-Roll-Simulator',
    'shapeclicker': '23-Shape-Clicker-Game',
    'typing2': '24-Typing-Game',
    'speaknumber': '25-Speak-Number-Guessing-Game',
    'fruitslicer': '26-Fruit-Slicer-Game',
    'quiz': '27-Quiz-Game',
    'emojicatcher': '28-Emoji-Catcher-Game',
    'whackamole': '29-Whack-A-Mole-Game',
    'simonsays': '30-Simon-Says-Game'
  };

  // Handle pause/resume sync
  useEffect(() => {
    if (iframeRef.current && iframeRef.current.contentWindow) {
      try {
        // Try to pause/resume game by pausing timers or animations
        const iframeDoc = iframeRef.current.contentDocument || iframeRef.current.contentWindow.document;
        if (iframeDoc) {
          if (isPaused) {
            // Pause all animations and timers
            iframeDoc.querySelectorAll('*').forEach(el => {
              if (el.style) {
                el.style.animationPlayState = 'paused';
              }
            });
            // Try to pause game loop if accessible
            if (iframeRef.current.contentWindow.gameLoop) {
              clearInterval(iframeRef.current.contentWindow.gameLoop);
            }
          } else {
            // Resume animations
            iframeDoc.querySelectorAll('*').forEach(el => {
              if (el.style) {
                el.style.animationPlayState = 'running';
              }
            });
          }
        }
      } catch (e) {
        // Can't access iframe content - this is normal for some games
      }
    }
  }, [isPaused]);

  useEffect(() => {
    if (!gameRunning || !gameId) return;
    
    // Clean up previous game if gameId changed
    if (currentGameIdRef.current && currentGameIdRef.current !== gameId) {
      if (scoreIntervalRef.current) {
        clearInterval(scoreIntervalRef.current);
        scoreIntervalRef.current = null;
      }
      if (gameContainerRef.current) {
        gameContainerRef.current.innerHTML = '';
      }
      iframeRef.current = null;
      setGameLoaded(false);
      setError(null);
    }
    
    // Skip if already loading/loaded the same game
    if (currentGameIdRef.current === gameId && gameLoaded) return;
    
    currentGameIdRef.current = gameId;

    const folderName = gameFolderMap[gameId];
    if (!folderName) {
      setError(`Game ${gameId} not found`);
      return;
    }

    const gamePath = `/html-games/${folderName}/index.html`;

    // Create iframe to load the game
    if (gameContainerRef.current) {
      // Clear any existing content
      gameContainerRef.current.innerHTML = '';
      setGameLoaded(false);
      setError(null);
      
      const iframe = document.createElement('iframe');
      iframe.src = gamePath;
      iframe.style.width = '100%';
      iframe.style.height = '100%';
      iframe.style.border = 'none';
      iframe.style.background = '#fff';
      iframe.setAttribute('loading', 'eager');
      iframe.setAttribute('allowfullscreen', 'true');
      iframe.setAttribute('referrerpolicy', 'no-referrer');
      
      // Preload the iframe
      iframe.onloadstart = () => {
        console.log(`Game ${gameId} started loading...`);
      };
      
      let loadTimeout;
      
      const setupScoreTracking = () => {
        if (scoreIntervalRef.current) {
          clearInterval(scoreIntervalRef.current);
        }
        scoreIntervalRef.current = setInterval(() => {
          try {
            const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
            if (iframeDoc) {
              const scoreEl = iframeDoc.getElementById('score') || 
                            iframeDoc.querySelector('.score') ||
                            iframeDoc.querySelector('[id*="score"]');
              if (scoreEl) {
                const scoreText = scoreEl.textContent || '';
                const scoreMatch = scoreText.match(/[\d.]+/);
                if (scoreMatch) {
                  const score = parseFloat(scoreMatch[0]);
                  if (score > 0) {
                    onScoreChange(Math.floor(score));
                  }
                }
              }
              // Also try window variables
              if (iframe.contentWindow) {
                const score = iframe.contentWindow.score || 
                             iframe.contentWindow.gameScore || 
                             iframe.contentWindow.points || 0;
                if (score > 0) {
                  onScoreChange(Math.floor(score));
                }
              }
            }
          } catch (e) {
            // Cross-origin restrictions may prevent access - this is normal
          }
        }, 1000);
      };
      
      iframe.onload = () => {
        clearTimeout(loadTimeout);
        console.log(`Game ${gameId} iframe onload fired`);
        try {
          const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
          if (iframeDoc) {
            // Check if document is ready
            if (iframeDoc.readyState === 'complete' || iframeDoc.readyState === 'interactive') {
              setGameLoaded(true);
              setError(null);
              console.log(`Game ${gameId} loaded successfully`);
              setupScoreTracking();
            } else {
              // Wait for document to be ready
              const checkReady = setInterval(() => {
                try {
                  const doc = iframe.contentDocument || iframe.contentWindow?.document;
                  if (doc && (doc.readyState === 'complete' || doc.readyState === 'interactive')) {
                    clearInterval(checkReady);
                    setGameLoaded(true);
                    setError(null);
                    console.log(`Game ${gameId} loaded successfully (after wait)`);
                    setupScoreTracking();
                  }
                } catch (e) {
                  // Can't check, assume loaded
                  clearInterval(checkReady);
                  setGameLoaded(true);
                  setupScoreTracking();
                }
              }, 100);
              
              // Fallback timeout
              setTimeout(() => {
                clearInterval(checkReady);
                setGameLoaded(true);
                setupScoreTracking();
              }, 2000);
            }
          } else {
            // Can't access document, but iframe loaded - mark as loaded
            setTimeout(() => {
              setGameLoaded(true);
              setupScoreTracking();
            }, 500);
          }
        } catch (e) {
          console.log(`Game ${gameId} loaded (content access restricted):`, e.message);
          setGameLoaded(true);
          setupScoreTracking();
        }
      };

      iframe.onerror = () => {
        clearTimeout(loadTimeout);
        console.error(`Failed to load game: ${gameId}`);
        setError(`Failed to load game: ${gameId}. Please refresh the page.`);
        setGameLoaded(false);
      };

      // Set timeout to detect if game doesn't load
      loadTimeout = setTimeout(() => {
        setGameLoaded(prevLoaded => {
          if (prevLoaded) return prevLoaded;
          console.warn(`Game ${gameId} timeout - marking as loaded`);
          try {
            setupScoreTracking();
          } catch (e) {
            console.error('Error setting up score tracking:', e);
          }
          return true;
        });
      }, 5000);

      gameContainerRef.current.appendChild(iframe);
      iframeRef.current = iframe;

      return () => {
        clearTimeout(loadTimeout);
        if (scoreIntervalRef.current) {
          clearInterval(scoreIntervalRef.current);
          scoreIntervalRef.current = null;
        }
        if (gameContainerRef.current && iframeRef.current) {
          try {
            gameContainerRef.current.removeChild(iframeRef.current);
          } catch (e) {
            // Ignore errors during cleanup
          }
        }
        iframeRef.current = null;
      };
    }
  }, [gameRunning, isPaused, gameId, onScoreChange]);

  if (error) {
    return (
      <div className="html-game-loader error">
        <div className="error-message">
          <h2>Error Loading Game</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="html-game-loader">
      {!gameLoaded && (
        <div className="loading-overlay">
          <div className="loading-spinner"></div>
          <p>Loading game...</p>
        </div>
      )}
      <div ref={gameContainerRef} className="game-container"></div>
    </div>
  );
};

export default HTMLGameLoader;

