import React, { useState, useEffect, useRef, useCallback } from 'react';
import './CarRacingGame.css';

const ROAD_WIDTH = 400;
const ROAD_LANES = 3;
const LANE_WIDTH = ROAD_WIDTH / ROAD_LANES;
const CAR_WIDTH = 60;
const CAR_HEIGHT = 100;
const INITIAL_PLAYER_X = ROAD_WIDTH / 2 - CAR_WIDTH / 2;
const GAME_HEIGHT = 600;

const CarRacingGame = ({ gameRunning, onScoreChange, isPaused, level = 1, onLevelComplete }) => {
  const [playerX, setPlayerX] = useState(INITIAL_PLAYER_X);
  const [obstacles, setObstacles] = useState([]);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [baseSpeed, setBaseSpeed] = useState(3 + level * 0.5);
  const [particles, setParticles] = useState([]);
  const [distance, setDistance] = useState(0);
  const gameLoopRef = useRef(null);
  const roadOffsetRef = useRef(0);
  const keysRef = useRef({ left: false, right: false });
  const obstacleIdCounter = useRef(0);

  const generateObstacle = useCallback(() => {
    const lane = Math.floor(Math.random() * ROAD_LANES);
    // More obstacle types: cars, trucks, roadblocks, barriers, oil spills, cones
    const obstacleTypes = ['car', 'truck', 'cone', 'roadblock', 'barrier', 'oilSpill', 'policeCar', 'bus'];
    const type = obstacleTypes[Math.floor(Math.random() * obstacleTypes.length)];
    
    let height, width = CAR_WIDTH;
    
    switch (type) {
      case 'truck':
        height = 120;
        width = 70;
        break;
      case 'bus':
        height = 130;
        width = 80;
        break;
      case 'cone':
        height = 40;
        width = 30;
        break;
      case 'roadblock':
        height = 80;
        width = 100;
        break;
      case 'barrier':
        height = 60;
        width = 120;
        break;
      case 'oilSpill':
        height = 50;
        width = 80;
        break;
      case 'policeCar':
        height = CAR_HEIGHT;
        width = CAR_WIDTH;
        break;
      default: // car
        height = CAR_HEIGHT;
        width = CAR_WIDTH;
    }
    
    return {
      id: `obs-${obstacleIdCounter.current++}-${Date.now()}`,
      x: lane * LANE_WIDTH + (LANE_WIDTH - width) / 2,
      y: -height,
      lane,
      type,
      height,
      width,
      vx: type === 'oilSpill' ? (Math.random() - 0.5) * 2 : 0 // Oil spills can slide
    };
  }, []);

  const createParticles = useCallback((x, y) => {
    const newParticles = [];
    for (let i = 0; i < 25; i++) {
      newParticles.push({
        id: `particle-${Date.now()}-${i}`,
        x: x + CAR_WIDTH / 2,
        y: y + CAR_HEIGHT / 2,
        vx: (Math.random() - 0.5) * 18,
        vy: (Math.random() - 0.5) * 18,
        life: 50,
        size: Math.random() * 8 + 3
      });
    }
    setParticles(prev => [...prev, ...newParticles]);
  }, []);

  const checkCollision = useCallback((playerX, obstacle) => {
    const playerLane = Math.floor(playerX / LANE_WIDTH);
    const obstacleLane = Math.floor(obstacle.x / LANE_WIDTH);
    const playerY = GAME_HEIGHT - CAR_HEIGHT - 20;
    const obstacleY = obstacle.y;
    
    // Check if in same lane or overlapping lanes
    const playerLeft = playerX;
    const playerRight = playerX + CAR_WIDTH;
    const obstacleLeft = obstacle.x;
    const obstacleRight = obstacle.x + obstacle.width;
    
    // Check horizontal overlap
    const horizontalOverlap = !(playerRight < obstacleLeft || playerLeft > obstacleRight);
    
    // Check vertical overlap
    const playerTop = playerY;
    const playerBottom = playerY + CAR_HEIGHT;
    const obstacleTop = obstacleY;
    const obstacleBottom = obstacleY + obstacle.height;
    const verticalOverlap = !(playerBottom < obstacleTop || playerTop > obstacleBottom);
    
    return horizontalOverlap && verticalOverlap;
  }, []);

  useEffect(() => {
    if (!gameRunning || gameOver || isPaused) return;

    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        e.preventDefault();
        keysRef.current.left = true;
      }
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        e.preventDefault();
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
    let lastDistanceUpdate = Date.now();
    const obstacleInterval = Math.max(600, 2000 - (level * 100));
    const currentSpeed = baseSpeed;

    const gameLoop = () => {
      const now = Date.now();

      // Move player
      setPlayerX(prev => {
        let newX = prev;
        const moveSpeed = 10;
        if (keysRef.current.left && newX > 0) {
          newX = Math.max(0, newX - moveSpeed);
        }
        if (keysRef.current.right && newX < ROAD_WIDTH - CAR_WIDTH) {
          newX = Math.min(ROAD_WIDTH - CAR_WIDTH, newX + moveSpeed);
        }
        return newX;
      });

      // Move road (endless scrolling)
      roadOffsetRef.current = (roadOffsetRef.current + currentSpeed) % 40;

      // Update distance and score
      if (now - lastDistanceUpdate > 100) {
        setDistance(prev => {
          const newDistance = prev + currentSpeed;
          setScore(prevScore => {
            const newScore = Math.floor(newDistance / 10);
            onScoreChange(newScore);
            return newScore;
          });
          return newDistance;
        });
        lastDistanceUpdate = now;
      }

      // Increase speed over time
      if (distance > 0 && distance % 1000 === 0) {
        setBaseSpeed(prev => Math.min(prev + 0.2, 15));
      }

      // Generate obstacles more frequently
      if (now - lastObstacleTime > obstacleInterval) {
        // Generate obstacle immediately - ensure at least one every interval
        const newObstacle = generateObstacle();
        setObstacles(prev => {
          // Prevent too many obstacles on screen, but ensure we always have some
          const visibleObstacles = prev.filter(obs => obs.y < GAME_HEIGHT + 100);
          return [...visibleObstacles, newObstacle];
        });
        lastObstacleTime = now;
      }

      // Update obstacles
      setObstacles(prev => {
        const updated = prev
          .map(obs => {
            const obstacle = { ...obs };
            // Move obstacle down
            obstacle.y = obstacle.y + currentSpeed;
            // Oil spills can slide horizontally
            if (obstacle.type === 'oilSpill' && obstacle.vx !== 0) {
              obstacle.x += obstacle.vx;
              if (obstacle.x < 0 || obstacle.x + obstacle.width > ROAD_WIDTH) {
                obstacle.vx *= -1;
              }
            }
            return obstacle;
          })
          .filter(obs => {
            if (obs.y > GAME_HEIGHT + 50) {
              return false;
            }
            return true;
          });

        // Check collisions
        updated.forEach(obs => {
          if (checkCollision(playerX, obs)) {
            createParticles(playerX, GAME_HEIGHT - CAR_HEIGHT - 20);
            setGameOver(true);
            setScore(prev => {
              onScoreChange(prev);
              return prev;
            });
          }
        });

        return updated;
      });

      // Update particles
      setParticles(prev => 
        prev
          .map(p => ({
            ...p,
            x: p.x + p.vx * 0.5,
            y: p.y + p.vy * 0.5,
            life: p.life - 1
          }))
          .filter(p => p.life > 0)
      );

      // Check level completion (every 500 points)
      if (score > 0 && score % 500 === 0 && score === Math.floor(distance / 10)) {
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
  }, [gameRunning, gameOver, isPaused, level, baseSpeed, playerX, score, distance, onScoreChange, onLevelComplete, generateObstacle, checkCollision, createParticles]);

  const handleRetry = () => {
    setPlayerX(INITIAL_PLAYER_X);
    setObstacles([]);
    setScore(0);
    setDistance(0);
    setGameOver(false);
    setParticles([]);
    setBaseSpeed(3 + level * 0.5);
    obstacleIdCounter.current = 0;
    onScoreChange(0);
  };

  const getLaneColor = (lane) => {
    return lane % 2 === 0 ? '#2a2a2a' : '#1a1a1a';
  };

  const getObstacleStyle = (obstacle) => {
    switch (obstacle.type) {
      case 'cone':
        return { background: 'linear-gradient(135deg, #ffaa00 0%, #ff8800 100%)' };
      case 'truck':
        return { background: 'linear-gradient(135deg, #666 0%, #333 100%)', height: '120px' };
      case 'bus':
        return { background: 'linear-gradient(135deg, #ff6600 0%, #cc4400 100%)', height: '130px' };
      case 'roadblock':
        return { background: 'linear-gradient(135deg, #ff0000 0%, #cc0000 100%)', height: '80px' };
      case 'barrier':
        return { background: 'repeating-linear-gradient(45deg, #ffff00, #ffff00 10px, #000000 10px, #000000 20px)', height: '60px' };
      case 'oilSpill':
        return { background: 'radial-gradient(circle, #333 0%, #000 100%)', opacity: 0.7, height: '50px' };
      case 'policeCar':
        return { background: 'linear-gradient(135deg, #0000ff 0%, #0000cc 100%)', height: '100px' };
      default: // car
        return { background: 'linear-gradient(135deg, #4444ff 0%, #0000cc 100%)' };
    }
  };

  return (
    <div className="car-racing-game">
      <div className="racing-stats">
        <div className="stat">Score: {score}</div>
        <div className="stat">Distance: {Math.floor(distance)}m</div>
        <div className="stat">Level: {level}</div>
        <div className="stat">Speed: {Math.round(baseSpeed * 10)}</div>
      </div>

      {gameOver && (
        <div className="game-over-overlay">
          <h2>💥 Crash!</h2>
          <p>Final Score: {score}</p>
          <p>Distance: {Math.floor(distance)}m</p>
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
              key={`lane-${i}`}
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
              className={`obstacle-car ${obs.type}`}
              style={{
                left: obs.x,
                top: obs.y,
                height: obs.height || CAR_HEIGHT,
                width: obs.width || CAR_WIDTH
              }}
            >
              {obs.type === 'cone' ? (
                <div className="cone-obstacle" style={getObstacleStyle(obs)}>
                  <div className="cone-top"></div>
                  <div className="cone-base"></div>
                </div>
              ) : obs.type === 'roadblock' ? (
                <div className="roadblock-obstacle" style={getObstacleStyle(obs)}>
                  <div className="roadblock-bar"></div>
                  <div className="roadblock-bar"></div>
                  <div className="roadblock-bar"></div>
                </div>
              ) : obs.type === 'barrier' ? (
                <div className="barrier-obstacle" style={getObstacleStyle(obs)}>
                  <div className="barrier-stripe"></div>
                  <div className="barrier-stripe"></div>
                  <div className="barrier-stripe"></div>
                </div>
              ) : obs.type === 'oilSpill' ? (
                <div className="oil-spill" style={getObstacleStyle(obs)}>
                  <div className="oil-gleam"></div>
                </div>
              ) : (
                <div className="car-body obstacle" style={getObstacleStyle(obs)}>
                  {obs.type === 'policeCar' && <div className="police-light"></div>}
                  <div className="car-window"></div>
                  <div className="car-wheels">
                    <div className="wheel wheel-left"></div>
                    <div className="wheel wheel-right"></div>
                  </div>
                </div>
              )}
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
                opacity: p.life / 50,
                width: `${p.size}px`,
                height: `${p.size}px`
              }}
            />
          ))}
        </div>
      </div>

      <div className="controls-hint">
        <p>← → Arrow Keys or A/D to move</p>
        <p>Avoid obstacles and drive as far as possible!</p>
      </div>
    </div>
  );
};

export default CarRacingGame;
