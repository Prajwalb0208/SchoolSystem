import React, { useState, useEffect, useRef, useCallback } from 'react';
import './CarRacingGame.css';

const ROAD_WIDTH = 400;
const ROAD_LANES = 3;
const LANE_WIDTH = ROAD_WIDTH / ROAD_LANES;
const CAR_WIDTH = 60;
const CAR_HEIGHT = 100;
const OBSTACLE_SPEED = 3;
const INITIAL_PLAYER_X = ROAD_WIDTH / 2 - CAR_WIDTH / 2;

const CarRacingGame = ({ gameRunning, onScoreChange, isPaused, level = 1, onLevelComplete }) => {
  const [playerX, setPlayerX] = useState(INITIAL_PLAYER_X);
  const [obstacles, setObstacles] = useState([]);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [speed, setSpeed] = useState(OBSTACLE_SPEED + level * 0.5);
  const [particles, setParticles] = useState([]);
  const gameLoopRef = useRef(null);
  const roadOffsetRef = useRef(0);
  const keysRef = useRef({ left: false, right: false });

  const generateObstacle = useCallback(() => {
    const lane = Math.floor(Math.random() * ROAD_LANES);
    return {
      id: Date.now() + Math.random(),
      x: lane * LANE_WIDTH + (LANE_WIDTH - CAR_WIDTH) / 2,
      y: -CAR_HEIGHT,
      lane
    };
  }, []);

  const createParticles = (x, y) => {
    const newParticles = [];
    for (let i = 0; i < 10; i++) {
      newParticles.push({
        id: Date.now() + i,
        x: x + CAR_WIDTH / 2,
        y: y + CAR_HEIGHT / 2,
        vx: (Math.random() - 0.5) * 10,
        vy: (Math.random() - 0.5) * 10,
        life: 30
      });
    }
    setParticles(prev => [...prev, ...newParticles]);
  };

  const checkCollision = (playerX, obstacle) => {
    const playerLane = Math.floor(playerX / LANE_WIDTH);
    const obstacleLane = obstacle.lane;
    const playerY = 500 - CAR_HEIGHT - 20;
    const obstacleY = obstacle.y;
    
    return (
      playerLane === obstacleLane &&
      obstacleY > playerY - CAR_HEIGHT &&
      obstacleY < playerY + CAR_HEIGHT
    );
  };

  useEffect(() => {
    if (!gameRunning || gameOver || isPaused) return;

    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        keysRef.current.left = true;
      }
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        keysRef.current.right = true;
      }
    };

    const handleKeyUp = (e) => {
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        keysRef.current.left = false;
      }
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        keysRef.current.right = false;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [gameRunning, gameOver, isPaused]);

  useEffect(() => {
    if (!gameRunning || gameOver || isPaused) {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
        gameLoopRef.current = null;
      }
      return;
    }

    let lastObstacleTime = Date.now();
    const obstacleInterval = 2000 - (level * 100);

    const gameLoop = () => {
      // Move player
      setPlayerX(prev => {
        let newX = prev;
        if (keysRef.current.left && newX > 0) {
          newX = Math.max(0, newX - 8);
        }
        if (keysRef.current.right && newX < ROAD_WIDTH - CAR_WIDTH) {
          newX = Math.min(ROAD_WIDTH - CAR_WIDTH, newX + 8);
        }
        return newX;
      });

      // Move road
      roadOffsetRef.current = (roadOffsetRef.current + speed) % 40;

      // Generate obstacles
      const now = Date.now();
      if (now - lastObstacleTime > obstacleInterval) {
        setObstacles(prev => [...prev, generateObstacle()]);
        lastObstacleTime = now;
      }

      // Update obstacles
      setObstacles(prev => {
        const updated = prev
          .map(obs => ({ ...obs, y: obs.y + speed }))
          .filter(obs => {
            if (obs.y > 600) {
              setScore(s => {
                const newScore = s + 10;
                onScoreChange(newScore);
                return newScore;
              });
              return false;
            }
            return true;
          });

        // Check collisions
        const playerLane = Math.floor(playerX / LANE_WIDTH);
        updated.forEach(obs => {
          if (checkCollision(playerX, obs)) {
            createParticles(playerX, 500 - CAR_HEIGHT - 20);
            setGameOver(true);
            onScoreChange(score);
          }
        });

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

      // Check level completion
      if (score >= level * 100) {
        onLevelComplete();
      }

      gameLoopRef.current = requestAnimationFrame(gameLoop);
    };

    gameLoopRef.current = requestAnimationFrame(gameLoop);

    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, [gameRunning, gameOver, isPaused, level, speed, playerX, score, onScoreChange, onLevelComplete, generateObstacle]);

  const handleRetry = () => {
    setPlayerX(INITIAL_PLAYER_X);
    setObstacles([]);
    setScore(0);
    setGameOver(false);
    setParticles([]);
    setSpeed(OBSTACLE_SPEED + level * 0.5);
    onScoreChange(0);
  };

  const getLaneColor = (lane) => {
    return lane % 2 === 0 ? '#2a2a2a' : '#1a1a1a';
  };

  return (
    <div className="car-racing-game">
      <div className="racing-stats">
        <div className="stat">Score: {score}</div>
        <div className="stat">Level: {level}</div>
        <div className="stat">Speed: {Math.round(speed * 10)}</div>
      </div>

      {gameOver && (
        <div className="game-over-overlay">
          <h2>💥 Crash!</h2>
          <p>Final Score: {score}</p>
          <button onClick={handleRetry} className="retry-btn">Retry</button>
        </div>
      )}

      <div className="road-container">
        <div 
          className="road" 
          style={{ 
            backgroundPositionY: `${roadOffsetRef.current}px`,
            width: ROAD_WIDTH
          }}
        >
          {/* Road lanes */}
          {Array.from({ length: ROAD_LANES }).map((_, i) => (
            <div
              key={i}
              className="lane"
              style={{
                left: i * LANE_WIDTH,
                width: LANE_WIDTH,
                backgroundColor: getLaneColor(i)
              }}
            />
          ))}

          {/* Lane dividers */}
          {Array.from({ length: ROAD_LANES - 1 }).map((_, i) => (
            <div
              key={`divider-${i}`}
              className="lane-divider"
              style={{ left: (i + 1) * LANE_WIDTH - 2 }}
            />
          ))}

          {/* Player car */}
          <div
            className="player-car"
            style={{
              left: playerX,
              bottom: 20
            }}
          >
            <div className="car-body">
              <div className="car-window"></div>
              <div className="car-wheels">
                <div className="wheel wheel-left"></div>
                <div className="wheel wheel-right"></div>
              </div>
            </div>
          </div>

          {/* Obstacles */}
          {obstacles.map(obs => (
            <div
              key={obs.id}
              className="obstacle-car"
              style={{
                left: obs.x,
                top: obs.y
              }}
            >
              <div className="car-body obstacle">
                <div className="car-window"></div>
                <div className="car-wheels">
                  <div className="wheel wheel-left"></div>
                  <div className="wheel wheel-right"></div>
                </div>
              </div>
            </div>
          ))}

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
        <p>← → Arrow Keys or A/D to move</p>
      </div>
    </div>
  );
};

export default CarRacingGame;

