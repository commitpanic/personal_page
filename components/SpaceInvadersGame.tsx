"use client";

import { useState, useEffect, useCallback, useRef } from 'react';

interface Position {
  x: number;
  y: number;
}

interface Bullet extends Position {
  id: number;
}

interface Alien extends Position {
  id: number;
  alive: boolean;
}

interface SpaceInvadersGameProps {
  onGameOver?: (score: number) => void;
  onClose?: () => void;
}

const GAME_WIDTH = 400;
const GAME_HEIGHT = 500;
const PLAYER_WIDTH = 30;
const PLAYER_HEIGHT = 20;
const ALIEN_WIDTH = 25;
const ALIEN_HEIGHT = 20;
const ALIEN_ROWS = 4;
const ALIEN_COLS = 8;
const BULLET_SPEED = 5;
const ALIEN_SPEED = 1;

export default function SpaceInvadersGame({ onGameOver, onClose }: SpaceInvadersGameProps) {
  const [playerX, setPlayerX] = useState(GAME_WIDTH / 2 - PLAYER_WIDTH / 2);
  const [bullets, setBullets] = useState<Bullet[]>([]);
  const [aliens, setAliens] = useState<Alien[]>([]);
  const [alienDirection, setAlienDirection] = useState(1);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [level, setLevel] = useState(1);
  const [isPaused, setIsPaused] = useState(false);
  
  const keysPressed = useRef<Set<string>>(new Set());
  const gameLoopRef = useRef<NodeJS.Timeout | null>(null);
  const nextBulletId = useRef(0);
  const alienMoveCounter = useRef(0);

  useEffect(() => {
    const saved = localStorage.getItem('spaceInvadersHighScore');
    if (saved) setHighScore(parseInt(saved));
    initAliens();
  }, []);

  const initAliens = useCallback(() => {
    const newAliens: Alien[] = [];
    let id = 0;
    for (let row = 0; row < ALIEN_ROWS; row++) {
      for (let col = 0; col < ALIEN_COLS; col++) {
        newAliens.push({
          id: id++,
          x: col * (ALIEN_WIDTH + 15) + 40,
          y: row * (ALIEN_HEIGHT + 15) + 50,
          alive: true
        });
      }
    }
    setAliens(newAliens);
  }, []);

  const shoot = useCallback(() => {
    if (gameOver || isPaused) return;
    setBullets(prev => [...prev, {
      id: nextBulletId.current++,
      x: playerX + PLAYER_WIDTH / 2 - 2,
      y: GAME_HEIGHT - PLAYER_HEIGHT - 20
    }]);
  }, [playerX, gameOver, isPaused]);

  const gameLoop = useCallback(() => {
    if (gameOver || isPaused) return;

    // Move player
    if (keysPressed.current.has('ArrowLeft') || keysPressed.current.has('a')) {
      setPlayerX(prev => Math.max(0, prev - 5));
    }
    if (keysPressed.current.has('ArrowRight') || keysPressed.current.has('d')) {
      setPlayerX(prev => Math.min(GAME_WIDTH - PLAYER_WIDTH, prev + 5));
    }

    // Move bullets
    setBullets(prev => {
      const newBullets = prev
        .map(b => ({ ...b, y: b.y - BULLET_SPEED }))
        .filter(b => b.y > 0);
      return newBullets;
    });

    // Move aliens
    alienMoveCounter.current++;
    if (alienMoveCounter.current >= Math.max(3, 8 - level)) {
      alienMoveCounter.current = 0;
      setAliens(prev => {
        const alive = prev.filter(a => a.alive);
        if (alive.length === 0) return prev;

        const leftmost = Math.min(...alive.map(a => a.x));
        const rightmost = Math.max(...alive.map(a => a.x + ALIEN_WIDTH));
        let newDirection = alienDirection;
        let moveDown = false;

        if (rightmost >= GAME_WIDTH - 10 && alienDirection === 1) {
          newDirection = -1;
          moveDown = true;
          setAlienDirection(-1);
        } else if (leftmost <= 10 && alienDirection === -1) {
          newDirection = 1;
          moveDown = true;
          setAlienDirection(1);
        }

        return prev.map(alien => ({
          ...alien,
          x: alien.alive ? alien.x + newDirection * ALIEN_SPEED * 10 : alien.x,
          y: alien.alive ? (moveDown ? alien.y + 20 : alien.y) : alien.y
        }));
      });
    }

    // Check collisions
    setBullets(prevBullets => {
      const remainingBullets = [...prevBullets];
      setAliens(prevAliens => {
        let newAliens = [...prevAliens];
        let scoreIncrease = 0;

        remainingBullets.forEach((bullet, bulletIndex) => {
          newAliens.forEach((alien, alienIndex) => {
            if (alien.alive &&
                bullet.x >= alien.x &&
                bullet.x <= alien.x + ALIEN_WIDTH &&
                bullet.y >= alien.y &&
                bullet.y <= alien.y + ALIEN_HEIGHT) {
              newAliens[alienIndex] = { ...alien, alive: false };
              remainingBullets.splice(bulletIndex, 1);
              scoreIncrease += 10;
            }
          });
        });

        if (scoreIncrease > 0) {
          setScore(prev => {
            const newScore = prev + scoreIncrease;
            if (newScore > highScore) {
              localStorage.setItem('spaceInvadersHighScore', newScore.toString());
              setHighScore(newScore);
            }
            return newScore;
          });
        }

        // Check if all aliens dead
        if (newAliens.every(a => !a.alive)) {
          setLevel(l => l + 1);
          setTimeout(() => initAliens(), 500);
        }

        // Check if aliens reached bottom
        const lowestAlien = Math.max(...newAliens.filter(a => a.alive).map(a => a.y));
        if (lowestAlien >= GAME_HEIGHT - PLAYER_HEIGHT - 40) {
          setGameOver(true);
          if (onGameOver) onGameOver(score);
        }

        return newAliens;
      });

      return remainingBullets;
    });
  }, [gameOver, isPaused, alienDirection, level, score, highScore, initAliens, onGameOver]);

  useEffect(() => {
    if (!gameOver && !isPaused) {
      gameLoopRef.current = setInterval(gameLoop, 1000 / 60);
    }
    return () => {
      if (gameLoopRef.current) clearInterval(gameLoopRef.current);
    };
  }, [gameLoop, gameOver, isPaused]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      keysPressed.current.add(e.key);
      keysPressed.current.add(key);

      if (e.key === ' ' || key === ' ') {
        e.preventDefault();
        if (!isPaused && !gameOver) shoot();
      } else if (key === 'p') {
        e.preventDefault();
        setIsPaused(p => !p);
      } else if (e.key === 'Escape') {
        e.preventDefault();
        if (onClose) onClose();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressed.current.delete(e.key);
      keysPressed.current.delete(e.key.toLowerCase());
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [shoot, isPaused, gameOver, onClose]);

  const resetGame = () => {
    setPlayerX(GAME_WIDTH / 2 - PLAYER_WIDTH / 2);
    setBullets([]);
    setScore(0);
    setLevel(1);
    setGameOver(false);
    setIsPaused(false);
    setAlienDirection(1);
    initAliens();
  };

  return (
    <div className="inline-block">
      <div className="mb-2 text-green-400 font-mono">
        <div className="flex justify-between items-center mb-2">
          <div className="text-yellow-400 font-bold">SPACE INVADERS</div>
          <div className="text-sm">
            Score: {score} | High: {highScore} | Level: {level}
          </div>
          <div className="text-xs">
            {isPaused && <span className="text-yellow-400">[PAUSED]</span>}
            {gameOver && <span className="text-red-400">[GAME OVER]</span>}
          </div>
        </div>

        <div 
          className="border-2 border-green-400 bg-black relative overflow-hidden"
          style={{ width: `${GAME_WIDTH}px`, height: `${GAME_HEIGHT}px` }}
        >
          {/* Player */}
          <div
            className="absolute bg-green-400"
            style={{
              left: `${playerX}px`,
              bottom: '20px',
              width: `${PLAYER_WIDTH}px`,
              height: `${PLAYER_HEIGHT}px`,
              clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)'
            }}
          />

          {/* Bullets */}
          {bullets.map(bullet => (
            <div
              key={bullet.id}
              className="absolute bg-yellow-400"
              style={{
                left: `${bullet.x}px`,
                top: `${bullet.y}px`,
                width: '4px',
                height: '12px'
              }}
            />
          ))}

          {/* Aliens */}
          {aliens.map(alien => alien.alive && (
            <div
              key={alien.id}
              className="absolute bg-red-400"
              style={{
                left: `${alien.x}px`,
                top: `${alien.y}px`,
                width: `${ALIEN_WIDTH}px`,
                height: `${ALIEN_HEIGHT}px`,
                clipPath: 'polygon(20% 0%, 80% 0%, 100% 30%, 80% 100%, 20% 100%, 0% 30%)'
              }}
            />
          ))}
        </div>

        <div className="mt-2 text-xs">
          <div>← → or A/D: Move | Space: Shoot</div>
          <div>P: Pause | ESC: Quit</div>
          {gameOver && (
            <button
              onClick={resetGame}
              className="mt-2 px-3 py-1 bg-green-400 text-black hover:bg-green-300"
            >
              Play Again
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
