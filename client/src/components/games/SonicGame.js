import React, { useState, useEffect, useRef, useCallback } from 'react';
import './SonicGame.css';

const GAME_WIDTH = 640;
const GAME_HEIGHT = 448;
const FLOOR_Y = 369;
const GRAVITY = 0.3;
const JUMP_FORCE = -10;
const PLAYER_WIDTH = 42;
const PLAYER_HEIGHT = 47;
const RING_SIZE = 20;

const SonicGame = ({ gameRunning, onScoreChange, isPaused, level = 1, onLevelComplete }) => {
  const canvasRef = useRef(null);
  const animationFrameRef = useRef(null);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  
  const playerRef = useRef({
    x: 60,
    y: 322,
    velocityX: 0,
    velocityY: 0,
    isGrounded: true,
    currentFrame: 0,
    animationTimer: 0
  });
  
  const gameStateRef = useRef({
    gameSpeed: 1.0,
    scoreMultiplier: 1,
    rings: [],
    enemies: [],
    backgroundX: 0,
    groundX: 0,
    isNight: false,
    nightTransition: 0
  });
  
  const keysRef = useRef({ jump: false });
  const imagesRef = useRef({});
  const lastTimeRef = useRef(0);

  // Load images
  useEffect(() => {
    const loadImages = async () => {
      const imagePaths = {
        sonic: '/sonic-assets/sprites/sonic/sonic.png',
        ring: '/sonic-assets/sprites/items/ring.png',
        enemy: '/sonic-assets/sprites/enemies/motobug.png',
        bgDay: '/sonic-assets/bg/bg1.png',
        bgNight: '/sonic-assets/bg/bg3.png',
        ground: '/sonic-assets/bg/bg2.png'
      };
      
      for (const [key, path] of Object.entries(imagePaths)) {
        const img = new Image();
        img.src = path;
        imagesRef.current[key] = img;
      }
    };
    
    loadImages();
    
    // Initialize game state
    gameStateRef.current.rings = [
      { x: 182, y: 326, collected: false },
      { x: 340, y: 326, collected: false },
      { x: 486, y: 326, collected: false }
    ];
    
    gameStateRef.current.enemies = [
      { x: 640, y: 337, width: 53, height: 32, speed: 1.9, alive: true, frame: 0, frameTimer: 0 },
      { x: 815, y: 337, width: 53, height: 32, speed: 1.9, alive: true, frame: 0, frameTimer: 0 },
      { x: 990, y: 337, width: 53, height: 32, speed: 1.9, alive: true, frame: 0, frameTimer: 0 }
    ];
  }, []);

  const handleKeyDown = useCallback((e) => {
    if (e.code === 'Space' || e.key === ' ') {
      e.preventDefault();
      keysRef.current.jump = true;
    }
  }, []);

  const handleKeyUp = useCallback((e) => {
    if (e.code === 'Space' || e.key === ' ') {
      keysRef.current.jump = false;
    }
  }, []);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [handleKeyDown, handleKeyUp]);

  const checkCollision = (obj1, obj2, size1, size2) => {
    return (
      obj1.x < obj2.x + size2.width &&
      obj1.x + size1.width > obj2.x &&
      obj1.y < obj2.y + size2.height &&
      obj1.y + size1.height > obj2.y
    );
  };

  const respawnRing = (ring) => {
    ring.x = 640 + 50 + (Math.random() * 400);
    ring.collected = false;
  };

  const respawnEnemy = (enemy) => {
    enemy.x = 900 + Math.random() * 200;
    enemy.alive = true;
  };

  const gameLoop = useCallback((currentTime) => {
    if (!gameRunning || isPaused || gameOver || !gameStarted) {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      return;
    }

    const deltaTime = currentTime - lastTimeRef.current;
    lastTimeRef.current = currentTime;

    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const player = playerRef.current;
    const gameState = gameStateRef.current;

    // Handle jumping
    if (keysRef.current.jump && player.isGrounded && player.y + PLAYER_HEIGHT >= FLOOR_Y) {
      player.velocityY = JUMP_FORCE;
      player.isGrounded = false;
    }

    // Update player physics
    player.velocityY += GRAVITY;
    player.y += player.velocityY;

    // Ground collision
    if (player.y + PLAYER_HEIGHT > FLOOR_Y) {
      player.y = FLOOR_Y - PLAYER_HEIGHT;
      player.velocityY = 0;
      player.isGrounded = true;
    } else {
      player.isGrounded = false;
    }

    // Update animations
    player.animationTimer += deltaTime;
    if (player.animationTimer > 50) {
      player.currentFrame = (player.currentFrame + 1) % 8;
      player.animationTimer = 0;
    }

    // Update background
    gameState.backgroundX -= 0.5 * gameState.gameSpeed;
    if (gameState.backgroundX < -1163) gameState.backgroundX = 0;
    
    gameState.groundX -= 1.5 * gameState.gameSpeed;
    if (gameState.groundX < -790) gameState.groundX = 0;

    // Update rings
    gameState.rings.forEach(ring => {
      if (!ring.collected) {
        ring.x -= 1.5 * gameState.gameSpeed;
        
        if (checkCollision(
          player,
          ring,
          { width: PLAYER_WIDTH, height: PLAYER_HEIGHT },
          { width: RING_SIZE, height: RING_SIZE }
        )) {
          ring.collected = true;
          const newScore = score + 1;
          setScore(newScore);
          onScoreChange(newScore);
          respawnRing(ring);
        }
        
        if (ring.x < -20) {
          respawnRing(ring);
        }
      }
    });

    // Update enemies
    gameState.enemies.forEach(enemy => {
      if (enemy.alive) {
        enemy.x -= enemy.speed * gameState.gameSpeed;
        enemy.frameTimer += deltaTime;
        if (enemy.frameTimer > 100) {
          enemy.frame = (enemy.frame + 1) % 5;
          enemy.frameTimer = 0;
        }
        
        if (enemy.x < -50) {
          enemy.alive = false;
          respawnEnemy(enemy);
        }
        
        // Check collision
        if (checkCollision(
          player,
          enemy,
          { width: PLAYER_WIDTH, height: PLAYER_HEIGHT },
          { width: enemy.width, height: enemy.height }
        )) {
          if (player.y + PLAYER_HEIGHT - 10 < enemy.y) {
            // Jump on enemy
            const newScore = score + 10;
            setScore(newScore);
            onScoreChange(newScore);
            enemy.alive = false;
            player.velocityY = JUMP_FORCE * 0.9;
            respawnEnemy(enemy);
          } else {
            // Game over
            setGameOver(true);
            onScoreChange(score);
          }
        }
      }
    });

    // Increase difficulty
    if (score > 0 && score % 10 === 0 && gameState.gameSpeed < 3) {
      gameState.gameSpeed += 0.1;
      gameState.scoreMultiplier += 0.1;
      gameState.enemies.forEach(enemy => {
        enemy.speed = 1.8 * gameState.gameSpeed;
      });
    }

    // Draw everything
    ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    
    // Draw background
    const bgImg = gameState.isNight ? imagesRef.current.bgNight : imagesRef.current.bgDay;
    if (bgImg && bgImg.complete) {
      ctx.drawImage(bgImg, gameState.backgroundX, 0, 1163, 448);
      ctx.drawImage(bgImg, gameState.backgroundX + 1163, 0, 1163, 448);
    }
    
    // Draw ground
    const groundImg = imagesRef.current.ground;
    if (groundImg && groundImg.complete) {
      ctx.drawImage(groundImg, gameState.groundX, FLOOR_Y, 790, 79);
      ctx.drawImage(groundImg, gameState.groundX + 790, FLOOR_Y, 790, 79);
    }
    
    // Draw rings
    const ringImg = imagesRef.current.ring;
    if (ringImg && ringImg.complete) {
      gameState.rings.forEach(ring => {
        if (!ring.collected) {
          const ringFrame = Math.floor((currentTime / 50) % 16);
          const sx = ringFrame * 17;
          ctx.drawImage(ringImg, sx, 0, 17, 16, ring.x, ring.y, RING_SIZE, RING_SIZE);
        }
      });
    }
    
    // Draw enemies
    const enemyImg = imagesRef.current.enemy;
    if (enemyImg && enemyImg.complete) {
      gameState.enemies.forEach(enemy => {
        if (enemy.alive) {
          const sx = enemy.frame * 48;
          ctx.drawImage(enemyImg, sx, 1, 48, 29, enemy.x, enemy.y, enemy.width, enemy.height);
        }
      });
    }
    
    // Draw player
    const sonicImg = imagesRef.current.sonic;
    if (sonicImg && sonicImg.complete) {
      if (player.isGrounded) {
        // Running animation
        const sx = player.currentFrame * 32;
        ctx.drawImage(sonicImg, sx, 8, 32, 36, player.x, player.y, PLAYER_WIDTH, PLAYER_HEIGHT);
      } else {
        // Jumping animation
        const jumpFrame = Math.min(7, Math.floor((currentTime / 50) % 8));
        const sx = jumpFrame * 32;
        ctx.drawImage(sonicImg, sx, 53, 32, 31, player.x, player.y, PLAYER_WIDTH, 42);
      }
    }
    
    // Draw score
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 20px Arial';
    ctx.fillText(`SCORE: ${score}`, 10, 30);

    animationFrameRef.current = requestAnimationFrame(gameLoop);
  }, [gameRunning, isPaused, gameOver, gameStarted, score, onScoreChange]);

  useEffect(() => {
    if (gameRunning && !isPaused && !gameOver && gameStarted) {
      lastTimeRef.current = performance.now();
      animationFrameRef.current = requestAnimationFrame(gameLoop);
    } else {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    }
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [gameRunning, isPaused, gameOver, gameStarted, gameLoop]);

  const handleRetry = () => {
    playerRef.current = {
      x: 60,
      y: 322,
      velocityX: 0,
      velocityY: 0,
      isGrounded: true,
      currentFrame: 0,
      animationTimer: 0
    };
    
    gameStateRef.current = {
      gameSpeed: 1.0,
      scoreMultiplier: 1,
      rings: [
        { x: 182, y: 326, collected: false },
        { x: 340, y: 326, collected: false },
        { x: 486, y: 326, collected: false }
      ],
      enemies: [
        { x: 640, y: 337, width: 53, height: 32, speed: 1.9, alive: true, frame: 0, frameTimer: 0 },
        { x: 815, y: 337, width: 53, height: 32, speed: 1.9, alive: true, frame: 0, frameTimer: 0 },
        { x: 990, y: 337, width: 53, height: 32, speed: 1.9, alive: true, frame: 0, frameTimer: 0 }
      ],
      backgroundX: 0,
      groundX: 0,
      isNight: false,
      nightTransition: 0
    };
    
    setScore(0);
    setGameOver(false);
    setGameStarted(true);
    onScoreChange(0);
  };

  const handleStart = () => {
    setGameStarted(true);
  };

  if (!gameStarted) {
    return (
      <div className="sonic-game">
        <div className="sonic-start-screen">
          <h2>SONIC RING RUN</h2>
          <p>Press SPACE to Jump</p>
          <button onClick={handleStart} className="start-btn">Start Game</button>
        </div>
      </div>
    );
  }

  return (
    <div className="sonic-game">
      <canvas
        ref={canvasRef}
        width={GAME_WIDTH}
        height={GAME_HEIGHT}
        className="sonic-canvas"
      />
      
      {gameOver && (
        <div className="game-over-overlay">
          <h2>GAME OVER</h2>
          <p>Final Score: {score}</p>
          <button onClick={handleRetry} className="retry-btn">Retry</button>
        </div>
      )}
      
      <div className="controls-hint">
        <p>Press SPACE to Jump</p>
      </div>
    </div>
  );
};

export default SonicGame;

