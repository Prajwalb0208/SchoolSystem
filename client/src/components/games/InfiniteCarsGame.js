import React, { useEffect, useRef, useState } from 'react';
import './InfiniteCarsGame.css';

const InfiniteCarsGame = ({ gameRunning, onScoreChange, isPaused, level = 1, onLevelComplete }) => {
  const gameContainerRef = useRef(null);
  const iframeRef = useRef(null);
  const currentGameRef = useRef(null);
  const [gameLoaded, setGameLoaded] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!gameRunning || isPaused) return;

    // Create a wrapper HTML file for the game
    if (gameContainerRef.current && !currentGameRef.current) {
      currentGameRef.current = true;
      
      // Clear any existing content
      gameContainerRef.current.innerHTML = '';
      
      const iframe = document.createElement('iframe');
      iframe.src = '/infinite-cars-game.html';
      iframe.style.width = '100%';
      iframe.style.height = '100%';
      iframe.style.border = 'none';
      iframe.style.background = '#000';
      iframe.setAttribute('allowfullscreen', 'true');
      
      let loadTimeout;
      let scoreInterval;
      
      iframe.onload = () => {
        clearTimeout(loadTimeout);
        setGameLoaded(true);
        setError(null);
        console.log('Infinite Cars game loaded successfully');
        
        // Track score from game
        scoreInterval = setInterval(() => {
          try {
            if (iframe.contentWindow && iframe.contentDocument) {
              const scoreEl = iframe.contentDocument.querySelector('#score, .score, [id*="score"]');
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
            }
          } catch (e) {
            // Cross-origin restrictions may prevent access
          }
        }, 500);
      };

      iframe.onerror = (e) => {
        clearTimeout(loadTimeout);
        console.error('Failed to load Infinite Cars game:', e);
        setError('Failed to load game. Please refresh the page.');
        setGameLoaded(false);
      };

      loadTimeout = setTimeout(() => {
        if (!gameLoaded) {
          setGameLoaded(true); // Mark as loaded anyway
        }
      }, 3000);

      gameContainerRef.current.appendChild(iframe);
      iframeRef.current = iframe;

      // Handle pause/resume
      const handlePause = () => {
        try {
          if (iframe.contentWindow && iframe.contentWindow.game) {
            iframe.contentWindow.game.scene.scenes.forEach(scene => {
              if (scene.scene.key === 'Game') {
                scene.physics.world.pause();
              }
            });
          }
        } catch (e) {
          console.log('Could not pause game:', e);
        }
      };

      const handleResume = () => {
        try {
          if (iframe.contentWindow && iframe.contentWindow.game) {
            iframe.contentWindow.game.scene.scenes.forEach(scene => {
              if (scene.scene.key === 'Game') {
                scene.physics.world.resume();
              }
            });
          }
        } catch (e) {
          console.log('Could not resume game:', e);
        }
      };

      // Sync pause/resume with parent
      if (isPaused) {
        handlePause();
      } else {
        handleResume();
      }

      return () => {
        clearTimeout(loadTimeout);
        if (scoreInterval) {
          clearInterval(scoreInterval);
        }
        if (gameContainerRef.current && iframeRef.current) {
          try {
            gameContainerRef.current.removeChild(iframeRef.current);
          } catch (e) {
            // Ignore errors during cleanup
          }
        }
        currentGameRef.current = null;
      };
    }
  }, [gameRunning, isPaused, gameLoaded, onScoreChange]);

  // Handle pause/resume changes
  useEffect(() => {
    if (iframeRef.current && iframeRef.current.contentWindow) {
      try {
        const game = iframeRef.current.contentWindow.game;
        if (game && game.scene) {
          game.scene.scenes.forEach(scene => {
            if (scene.scene && scene.scene.key === 'Game') {
              if (isPaused) {
                scene.physics.world.pause();
              } else {
                scene.physics.world.resume();
              }
            }
          });
        }
      } catch (e) {
        // Can't access iframe content
      }
    }
  }, [isPaused]);

  if (error) {
    return (
      <div className="infinite-cars-game error">
        <div className="error-message">
          <h2>Error Loading Game</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="infinite-cars-game">
      {!gameLoaded && (
        <div className="loading-overlay">
          <div className="loading-spinner"></div>
          <p>Loading game...</p>
        </div>
      )}
      <div ref={gameContainerRef} className="infinite-cars-container"></div>
    </div>
  );
};

export default InfiniteCarsGame;

