import React, { useState, useEffect, useRef, useCallback } from 'react';
import './StumbleGuysGame.css';

const GAME_WIDTH = 800;
const GAME_HEIGHT = 600;
const PLAYER_SIZE = 40;
const GRAVITY = 0.8;
const JUMP_STRENGTH = -15;
const MOVE_SPEED = 5;
const CAMERA_OFFSET = 200; // Camera follows player

const StumbleGuysGame = ({ gameRunning, onScoreChange, isPaused, level = 1, onLevelComplete }) => {
  const [player, setPlayer] = useState({ x: 100, y: 100, vx: 0, vy: 0, onGround: false });
  const [obstacles, setObstacles] = useState([]);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [distance, setDistance] = useState(0);
  const [particles, setParticles] = useState([]);
  const [cameraX, setCameraX] = useState(0);
  const keysRef = useRef({ left: false, right: false, jump: false });
  const gameLoopRef = useRef(null);
  const lastObstacleX = useRef(300);
  const obstacleIdCounter = useRef(0);

  const generateObstacle = useCallback((x, type) => {
    const types = ['spinner', 'hammer', 'barrier', 'movingPlatform', 'spikes', 'pendulum', 'rotatingBar'];
    const obstacleType = type || types[Math.floor(Math.random() * types.length)];
    
    switch (obstacleType) {
      case 'spinner':
        return {
          id: `obs-${obstacleIdCounter.current++}`,
          type: 'spinner',
          x,
          y: GAME_HEIGHT - 100,
          width: 60,
          height: 60,
          rotation: 0,
          speed: 3 + level * 0.5
        };
      case 'hammer':
        return {
          id: `obs-${obstacleIdCounter.current++}`,
          type: 'hammer',
          x,
          y: GAME_HEIGHT - 150,
          width: 80,
          height: 100,
          angle: 0,
          swingSpeed: 0.05 + level * 0.01
        };
      case 'barrier':
        return {
          id: `obs-${obstacleIdCounter.current++}`,
          type: 'barrier',
          x,
          y: GAME_HEIGHT - 80,
          width: 100,
          height: 80
        };
      case 'movingPlatform':
        return {
          id: `obs-${obstacleIdCounter.current++}`,
          type: 'movingPlatform',
          x,
          y: GAME_HEIGHT - 200,
          width: 120,
          height: 20,
          vx: 2 + level * 0.3,
          minX: x - 100,
          maxX: x + 100
        };
      case 'spikes':
        return {
          id: `obs-${obstacleIdCounter.current++}`,
          type: 'spikes',
          x,
          y: GAME_HEIGHT - 40,
          width: 150,
          height: 40
        };
      case 'pendulum':
        return {
          id: `obs-${obstacleIdCounter.current++}`,
          type: 'pendulum',
          x,
          y: GAME_HEIGHT - 200,
          width: 20,
          height: 100,
          angle: Math.PI / 4,
          swingSpeed: 0.03 + level * 0.005,
          length: 100
        };
      case 'rotatingBar':
        return {
          id: `obs-${obstacleIdCounter.current++}`,
          type: 'rotatingBar',
          x,
          y: GAME_HEIGHT - 150,
          width: 200,
          height: 20,
          rotation: 0,
          speed: 0.05 + level * 0.01
        };
      default:
        return null;
    }
  }, [level]);

  useEffect(() => {
    if (!gameRunning || isPaused) return;
    
    // Generate initial obstacles
    const initialObstacles = [];
    for (let i = 0; i < 15; i++) {
      const obstacle = generateObstacle(300 + i * 200);
      if (obstacle) {
        initialObstacles.push(obstacle);
        lastObstacleX.current = obstacle.x;
      }
    }
    setObstacles(initialObstacles);
    obstacleIdCounter.current = 15;
  }, [gameRunning, isPaused, level, generateObstacle]);

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
    for (let i = 0; i < 12; i++) {
      newParticles.push({
        id: `particle-${Date.now()}-${i}`,
        x,
        y,
        vx: (Math.random() - 0.5) * 10,
        vy: (Math.random() - 0.5) * 10,
        life: 30
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
        } else if (keysRef.current.right) {
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

        // Left boundary (camera follows player)
        if (newPlayer.x < CAMERA_OFFSET) {
          newPlayer.x = CAMERA_OFFSET;
        }

        // Update distance and score
        const newDistance = Math.max(distance, newPlayer.x - 100);
        setDistance(newDistance);
        setScore(prev => {
          const newScore = Math.floor(newDistance / 10);
          onScoreChange(newScore);
          if (newScore > 0 && newScore % 500 === 0) {
            onLevelComplete();
          }
          return newScore;
        });

        // Update camera to follow player
        setCameraX(Math.max(0, newPlayer.x - CAMERA_OFFSET));

        return newPlayer;
      });

      // Update obstacles and generate new ones
      setObstacles(prev => {
        let updated = prev.map(obs => {
          const obstacle = { ...obs };

          if (obstacle.type === 'spinner') {
            obstacle.rotation += obstacle.speed;
          } else if (obstacle.type === 'hammer') {
            obstacle.angle += obstacle.swingSpeed;
            if (obstacle.angle > Math.PI * 2) obstacle.angle = 0;
          } else if (obstacle.type === 'movingPlatform') {
            obstacle.x += obstacle.vx;
            if (obstacle.x <= obstacle.minX || obstacle.x >= obstacle.maxX) {
              obstacle.vx *= -1;
            }
          } else if (obstacle.type === 'pendulum') {
            obstacle.angle += obstacle.swingSpeed;
            if (obstacle.angle > Math.PI / 2 || obstacle.angle < -Math.PI / 2) {
              obstacle.swingSpeed *= -1;
            }
          } else if (obstacle.type === 'rotatingBar') {
            obstacle.rotation += obstacle.speed;
          }

          // Check collision with player
          if (checkCollision(player, obstacle)) {
            createParticles(player.x, player.y);
            setGameOver(true);
          }

          return obstacle;
        });

        // Remove obstacles that are far behind camera
        updated = updated.filter(obs => obs.x + obs.width > cameraX - 200);

        // Generate new obstacles ahead
        const playerX = player.x;
        const furthestObstacleX = updated.length > 0 
          ? Math.max(...updated.map(o => o.x))
          : lastObstacleX.current;

        while (furthestObstacleX < playerX + GAME_WIDTH + 500) {
          const newX = furthestObstacleX + 150 + Math.random() * 200;
          const newObstacle = generateObstacle(newX);
          if (newObstacle) {
            updated.push(newObstacle);
            lastObstacleX.current = newX;
          }
          break; // Add one at a time
        }

        return updated;
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
  }, [gameRunning, gameOver, isPaused, level, player, distance, cameraX, onScoreChange, onLevelComplete, generateObstacle]);

  const handleRetry = () => {
    setPlayer({ x: 100, y: 100, vx: 0, vy: 0, onGround: false });
    setScore(0);
    setDistance(0);
    setGameOver(false);
    setCameraX(0);
    setParticles([]);
    lastObstacleX.current = 300;
    obstacleIdCounter.current = 0;
    onScoreChange(0);
  };

  return (
    <div className="stumble-guys-game">
      <div className="stumble-stats">
        <div className="stat">Score: {score}</div>
        <div className="stat">Level: {level}</div>
        <div className="stat">Distance: {Math.floor(distance)}m</div>
      </div>

      {gameOver && (
        <div className="game-over-overlay">
          <h2>💥 Eliminated!</h2>
          <p>Final Score: {score}</p>
          <p>Distance: {Math.floor(distance)}m</p>
          <button onClick={handleRetry} className="retry-btn">Retry</button>
        </div>
      )}

      <div className="game-area" style={{ width: GAME_WIDTH, height: GAME_HEIGHT, overflow: 'hidden' }}>
        <div 
          className="game-world" 
          style={{ 
            transform: `translateX(-${cameraX}px)`,
            width: '10000px',
            position: 'relative'
          }}
        >
          {/* Ground - continuous */}
          <div className="ground" style={{ top: GAME_HEIGHT - 50, width: '10000px' }} />

          {/* Finish lines every 500px */}
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={`finish-${i}`}
              className="finish-line"
              style={{
                left: 500 + i * 500,
                top: 0,
                height: GAME_HEIGHT
              }}
            >
              <div className="finish-flag">🏁</div>
            </div>
          ))}

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
            } else if (obs.type === 'spikes') {
              return (
                <div
                  key={obs.id}
                  className="obstacle spikes"
                  style={{
                    left: obs.x,
                    top: obs.y,
                    width: obs.width,
                    height: obs.height
                  }}
                >
                  <div className="spike"></div>
                  <div className="spike"></div>
                  <div className="spike"></div>
                  <div className="spike"></div>
                  <div className="spike"></div>
                </div>
              );
            } else if (obs.type === 'pendulum') {
              const pendulumX = obs.x + obs.width / 2;
              const ballX = pendulumX + Math.sin(obs.angle) * obs.length;
              const ballY = obs.y + Math.cos(obs.angle) * obs.length;

              return (
                <div key={obs.id} className="obstacle-container">
                  <div
                    className="pendulum-rope"
                    style={{
                      left: pendulumX,
                      top: obs.y,
                      width: 2,
                      height: obs.length,
                      transform: `rotate(${obs.angle * (180 / Math.PI)}deg)`,
                      transformOrigin: 'top center'
                    }}
                  />
                  <div
                    className="pendulum-ball"
                    style={{
                      left: ballX - 15,
                      top: ballY - 15,
                      width: 30,
                      height: 30
                    }}
                  />
                </div>
              );
            } else if (obs.type === 'rotatingBar') {
              return (
                <div
                  key={obs.id}
                  className="obstacle rotating-bar"
                  style={{
                    left: obs.x,
                    top: obs.y,
                    width: obs.width,
                    height: obs.height,
                    transform: `rotate(${obs.rotation}deg)`,
                    transformOrigin: 'center center'
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
                opacity: p.life / 30
              }}
            />
          ))}
        </div>
      </div>

      <div className="controls-hint">
        <p>← → Arrow Keys or A/D to move | Space or W to jump</p>
        <p>Run as far as you can! Avoid obstacles!</p>
      </div>
    </div>
  );
};

export default StumbleGuysGame;
