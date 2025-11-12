import React, { useState, useEffect, useRef, useCallback } from 'react';
import './StumbleGuysGame.css';

const GAME_WIDTH = 800;
const GAME_HEIGHT = 600;
const PLAYER_SIZE = 40;
const GRAVITY = 0.8;
const JUMP_STRENGTH = -15;
const MOVE_SPEED = 5;

const StumbleGuysGame = ({ gameRunning, onScoreChange, isPaused, level = 1, onLevelComplete }) => {
  const [player, setPlayer] = useState({ x: 100, y: 100, vx: 0, vy: 0, onGround: false });
  const [obstacles, setObstacles] = useState([]);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [finishLine, setFinishLine] = useState(GAME_WIDTH - 200);
  const [particles, setParticles] = useState([]);
  const keysRef = useRef({ left: false, right: false, jump: false });
  const gameLoopRef = useRef(null);

  const generateObstacle = useCallback((x, type) => {
    const types = ['spinner', 'hammer', 'barrier', 'movingPlatform'];
    const obstacleType = type || types[Math.floor(Math.random() * types.length)];
    
    switch (obstacleType) {
      case 'spinner':
        return {
          id: Date.now() + Math.random(),
          type: 'spinner',
          x,
          y: GAME_HEIGHT - 100,
          width: 60,
          height: 60,
          rotation: 0,
          speed: 3
        };
      case 'hammer':
        return {
          id: Date.now() + Math.random(),
          type: 'hammer',
          x,
          y: GAME_HEIGHT - 150,
          width: 80,
          height: 100,
          angle: 0,
          swingSpeed: 0.05
        };
      case 'barrier':
        return {
          id: Date.now() + Math.random(),
          type: 'barrier',
          x,
          y: GAME_HEIGHT - 80,
          width: 100,
          height: 80
        };
      case 'movingPlatform':
        return {
          id: Date.now() + Math.random(),
          type: 'movingPlatform',
          x,
          y: GAME_HEIGHT - 200,
          width: 120,
          height: 20,
          vx: 2,
          minX: x - 100,
          maxX: x + 100
        };
      default:
        return null;
    }
  }, []);

  useEffect(() => {
    // Generate initial obstacles
    const initialObstacles = [];
    for (let i = 0; i < 10; i++) {
      const obstacle = generateObstacle(300 + i * 200);
      if (obstacle) initialObstacles.push(obstacle);
    }
    setObstacles(initialObstacles);
  }, [level, generateObstacle]);

  useEffect(() => {
    if (!gameRunning || gameOver || isPaused) return;

    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        keysRef.current.left = true;
      }
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        keysRef.current.right = true;
      }
      if (e.key === ' ' || e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
        e.preventDefault();
        if (!keysRef.current.jump) {
          keysRef.current.jump = true;
        }
      }
    };

    const handleKeyUp = (e) => {
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        keysRef.current.left = false;
      }
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        keysRef.current.right = false;
      }
      if (e.key === ' ' || e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
        keysRef.current.jump = false;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [gameRunning, gameOver, isPaused]);

  const checkCollision = (player, obstacle) => {
    return (
      player.x < obstacle.x + obstacle.width &&
      player.x + PLAYER_SIZE > obstacle.x &&
      player.y < obstacle.y + obstacle.height &&
      player.y + PLAYER_SIZE > obstacle.y
    );
  };

  const createParticles = (x, y) => {
    const newParticles = [];
    for (let i = 0; i < 8; i++) {
      newParticles.push({
        id: Date.now() + i,
        x,
        y,
        vx: (Math.random() - 0.5) * 8,
        vy: (Math.random() - 0.5) * 8,
        life: 20
      });
    }
    setParticles(prev => [...prev, ...newParticles]);
  };

  useEffect(() => {
    if (!gameRunning || gameOver || isPaused) {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
        gameLoopRef.current = null;
      }
      return;
    }

    const gameLoop = () => {
      setPlayer(prev => {
        let newPlayer = { ...prev };

        // Horizontal movement
        if (keysRef.current.left && newPlayer.x > 0) {
          newPlayer.vx = -MOVE_SPEED;
        } else if (keysRef.current.right && newPlayer.x < GAME_WIDTH - PLAYER_SIZE) {
          newPlayer.vx = MOVE_SPEED;
        } else {
          newPlayer.vx *= 0.8; // Friction
        }

        // Jump
        if (keysRef.current.jump && newPlayer.onGround) {
          newPlayer.vy = JUMP_STRENGTH;
          newPlayer.onGround = false;
        }

        // Apply gravity
        newPlayer.vy += GRAVITY;

        // Update position
        newPlayer.x += newPlayer.vx;
        newPlayer.y += newPlayer.vy;

        // Ground collision
        const groundY = GAME_HEIGHT - 50;
        if (newPlayer.y + PLAYER_SIZE >= groundY) {
          newPlayer.y = groundY - PLAYER_SIZE;
          newPlayer.vy = 0;
          newPlayer.onGround = true;
        } else {
          newPlayer.onGround = false;
        }

        // Wall collision
        if (newPlayer.x < 0) newPlayer.x = 0;
        if (newPlayer.x > GAME_WIDTH - PLAYER_SIZE) {
          newPlayer.x = GAME_WIDTH - PLAYER_SIZE;
        }

        // Check finish line
        if (newPlayer.x >= finishLine) {
          setScore(s => {
            const newScore = s + 100 * level;
            onScoreChange(newScore);
            if (newScore >= level * 500) {
              onLevelComplete();
            }
            return newScore;
          });
          setFinishLine(prev => prev + GAME_WIDTH);
        }

        return newPlayer;
      });

      // Update obstacles
      setObstacles(prev => {
        return prev.map(obs => {
          const updated = { ...obs };

          if (obs.type === 'spinner') {
            updated.rotation += obs.speed;
          } else if (obs.type === 'hammer') {
            updated.angle += obs.swingSpeed;
            if (updated.angle > Math.PI * 2) updated.angle = 0;
          } else if (obs.type === 'movingPlatform') {
            updated.x += updated.vx;
            if (updated.x <= updated.minX || updated.x >= updated.maxX) {
              updated.vx *= -1;
            }
          }

          // Check collision with player
          if (checkCollision(player, updated)) {
            createParticles(player.x, player.y);
            setGameOver(true);
          }

          return updated;
        });
      });

      // Update particles
      setParticles(prev =>
        prev
          .map(p => ({
            ...p,
            x: p.x + p.vx,
            y: p.y + p.vy,
            life: p.life - 1
          }))
          .filter(p => p.life > 0)
      );

      gameLoopRef.current = requestAnimationFrame(gameLoop);
    };

    gameLoopRef.current = requestAnimationFrame(gameLoop);

    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, [gameRunning, gameOver, isPaused, level, finishLine, player, onScoreChange, onLevelComplete]);

  const handleRetry = () => {
    setPlayer({ x: 100, y: 100, vx: 0, vy: 0, onGround: false });
    setScore(0);
    setGameOver(false);
    setFinishLine(GAME_WIDTH - 200);
    setParticles([]);
    onScoreChange(0);
  };

  return (
    <div className="stumble-guys-game">
      <div className="stumble-stats">
        <div className="stat">Score: {score}</div>
        <div className="stat">Level: {level}</div>
        <div className="stat">Distance: {Math.floor(player.x)}m</div>
      </div>

      {gameOver && (
        <div className="game-over-overlay">
          <h2>💥 Eliminated!</h2>
          <p>Final Score: {score}</p>
          <p>Distance: {Math.floor(player.x)}m</p>
          <button onClick={handleRetry} className="retry-btn">Retry</button>
        </div>
      )}

      <div className="game-area" style={{ width: GAME_WIDTH, height: GAME_HEIGHT }}>
        {/* Ground */}
        <div className="ground" style={{ top: GAME_HEIGHT - 50 }} />

        {/* Finish line */}
        <div
          className="finish-line"
          style={{
            left: finishLine,
            top: 0,
            height: GAME_HEIGHT
          }}
        >
          <div className="finish-flag">🏁</div>
        </div>

        {/* Obstacles */}
        {obstacles.map(obs => {
          if (obs.type === 'spinner') {
            return (
              <div
                key={obs.id}
                className="obstacle spinner"
                style={{
                  left: obs.x,
                  top: obs.y,
                  width: obs.width,
                  height: obs.height,
                  transform: `rotate(${obs.rotation}deg)`
                }}
              >
                <div className="spinner-blade"></div>
                <div className="spinner-blade"></div>
                <div className="spinner-blade"></div>
                <div className="spinner-blade"></div>
              </div>
            );
          } else if (obs.type === 'hammer') {
            const hammerX = obs.x + obs.width / 2;
            const hammerY = obs.y;
            const handleLength = 60;
            const headRadius = 20;
            const angle = obs.angle;
            const headX = hammerX + Math.cos(angle) * handleLength;
            const headY = hammerY + Math.sin(angle) * handleLength;

            return (
              <div key={obs.id} className="obstacle-container">
                <div
                  className="hammer-handle"
                  style={{
                    left: hammerX,
                    top: hammerY,
                    transform: `rotate(${angle * (180 / Math.PI)}deg)`,
                    transformOrigin: 'center top'
                  }}
                />
                <div
                  className="hammer-head"
                  style={{
                    left: headX - headRadius,
                    top: headY - headRadius,
                    width: headRadius * 2,
                    height: headRadius * 2
                  }}
                />
              </div>
            );
          } else if (obs.type === 'barrier') {
            return (
              <div
                key={obs.id}
                className="obstacle barrier"
                style={{
                  left: obs.x,
                  top: obs.y,
                  width: obs.width,
                  height: obs.height
                }}
              />
            );
          } else if (obs.type === 'movingPlatform') {
            return (
              <div
                key={obs.id}
                className="obstacle platform"
                style={{
                  left: obs.x,
                  top: obs.y,
                  width: obs.width,
                  height: obs.height
                }}
              />
            );
          }
          return null;
        })}

        {/* Player */}
        <div
          className="player-character"
          style={{
            left: player.x,
            top: player.y,
            width: PLAYER_SIZE,
            height: PLAYER_SIZE
          }}
        >
          <div className="character-body">
            <div className="character-face">😊</div>
          </div>
        </div>

        {/* Particles */}
        {particles.map(p => (
          <div
            key={p.id}
            className="particle"
            style={{
              left: p.x,
              top: p.y,
              opacity: p.life / 20
            }}
          />
        ))}
      </div>

      <div className="controls-hint">
        <p>← → Arrow Keys or A/D to move | Space or W to jump</p>
      </div>
    </div>
  );
};

export default StumbleGuysGame;

