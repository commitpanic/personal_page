"use client";

import { useState, useEffect, useCallback, useRef } from 'react';

interface Position {
  x: number;
  y: number;
}

type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

interface SnakeGameProps {
  onGameOver?: (score: number) => void;
  onClose?: () => void;
}

const GRID_SIZE = 20;
const CELL_SIZE = 20;
const INITIAL_SNAKE: Position[] = [{ x: 10, y: 10 }];
const INITIAL_DIRECTION: Direction = 'RIGHT';
const GAME_SPEED = 150; // milliseconds per frame

export default function SnakeGame({ onGameOver, onClose }: SnakeGameProps) {
  const [snake, setSnake] = useState<Position[]>(INITIAL_SNAKE);
  const [food, setFood] = useState<Position>({ x: 15, y: 10 });
  const [direction, setDirection] = useState<Direction>(INITIAL_DIRECTION);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [highScore, setHighScore] = useState(0);
  
  const directionRef = useRef(direction);
  const gameLoopRef = useRef<NodeJS.Timeout | null>(null);

  // Load high score from localStorage
  useEffect(() => {
    const savedHighScore = localStorage.getItem('snakeHighScore');
    if (savedHighScore) {
      setHighScore(parseInt(savedHighScore));
    }
  }, []);

  // Generate random food position
  const generateFood = useCallback((currentSnake: Position[]): Position => {
    let newFood: Position;
    do {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE)
      };
    } while (currentSnake.some(segment => segment.x === newFood.x && segment.y === newFood.y));
    return newFood;
  }, []);

  // Check collision with walls or self
  const checkCollision = useCallback((head: Position, body: Position[]): boolean => {
    // Wall collision
    if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
      return true;
    }
    // Self collision
    return body.some(segment => segment.x === head.x && segment.y === head.y);
  }, []);

  // Game loop
  const moveSnake = useCallback(() => {
    if (gameOver || isPaused) return;

    setSnake(prevSnake => {
      const head = { ...prevSnake[0] };
      const currentDirection = directionRef.current;

      // Move head based on direction
      switch (currentDirection) {
        case 'UP':
          head.y -= 1;
          break;
        case 'DOWN':
          head.y += 1;
          break;
        case 'LEFT':
          head.x -= 1;
          break;
        case 'RIGHT':
          head.x += 1;
          break;
      }

      // Check collision
      if (checkCollision(head, prevSnake)) {
        setGameOver(true);
        if (onGameOver) onGameOver(score);
        // Update high score
        if (score > highScore) {
          localStorage.setItem('snakeHighScore', score.toString());
          setHighScore(score);
        }
        return prevSnake;
      }

      const newSnake = [head, ...prevSnake];

      // Check if food is eaten
      if (head.x === food.x && head.y === food.y) {
        setScore(prev => prev + 10);
        setFood(generateFood(newSnake));
        return newSnake; // Snake grows
      }

      // Remove tail if no food eaten
      newSnake.pop();
      return newSnake;
    });
  }, [gameOver, isPaused, food, score, checkCollision, generateFood, onGameOver, highScore]);

  // Start game loop
  useEffect(() => {
    if (!gameOver && !isPaused) {
      gameLoopRef.current = setInterval(moveSnake, GAME_SPEED);
    }
    return () => {
      if (gameLoopRef.current) clearInterval(gameLoopRef.current);
    };
  }, [moveSnake, gameOver, isPaused]);

  // Handle keyboard input
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      const currentDirection = directionRef.current;

      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          e.preventDefault();
          if (currentDirection !== 'DOWN') {
            directionRef.current = 'UP';
            setDirection('UP');
          }
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          e.preventDefault();
          if (currentDirection !== 'UP') {
            directionRef.current = 'DOWN';
            setDirection('DOWN');
          }
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          e.preventDefault();
          if (currentDirection !== 'RIGHT') {
            directionRef.current = 'LEFT';
            setDirection('LEFT');
          }
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          e.preventDefault();
          if (currentDirection !== 'LEFT') {
            directionRef.current = 'RIGHT';
            setDirection('RIGHT');
          }
          break;
        case 'p':
        case 'P':
        case ' ':
          e.preventDefault();
          setIsPaused(prev => !prev);
          break;
        case 'Escape':
          e.preventDefault();
          if (onClose) onClose();
          break;
        case 'r':
        case 'R':
          e.preventDefault();
          if (gameOver) {
            resetGame();
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [onClose]);

  const resetGame = () => {
    setSnake(INITIAL_SNAKE);
    setDirection(INITIAL_DIRECTION);
    directionRef.current = INITIAL_DIRECTION;
    setFood({ x: 15, y: 10 });
    setScore(0);
    setGameOver(false);
    setIsPaused(false);
  };

  return (
    <div className="inline-block">
      <div className="mb-2 text-green-400 font-mono">
        <div className="flex justify-between items-center mb-2">
          <div>
            <span className="text-yellow-400">SNAKE</span> - Score: {score} | High: {highScore}
          </div>
          <div className="text-xs">
            {isPaused && <span className="text-yellow-400">[PAUSED]</span>}
            {gameOver && <span className="text-red-400">[GAME OVER]</span>}
          </div>
        </div>
        <div 
          className="border-2 border-green-400 bg-black relative"
          style={{
            width: `${GRID_SIZE * CELL_SIZE}px`,
            height: `${GRID_SIZE * CELL_SIZE}px`
          }}
        >
          {/* Snake */}
          {snake.map((segment, index) => (
            <div
              key={index}
              className={index === 0 ? 'bg-yellow-400' : 'bg-green-400'}
              style={{
                position: 'absolute',
                left: `${segment.x * CELL_SIZE}px`,
                top: `${segment.y * CELL_SIZE}px`,
                width: `${CELL_SIZE - 2}px`,
                height: `${CELL_SIZE - 2}px`,
                border: '1px solid black'
              }}
            />
          ))}
          
          {/* Food */}
          <div
            className="bg-red-400"
            style={{
              position: 'absolute',
              left: `${food.x * CELL_SIZE}px`,
              top: `${food.y * CELL_SIZE}px`,
              width: `${CELL_SIZE - 2}px`,
              height: `${CELL_SIZE - 2}px`,
              border: '1px solid black'
            }}
          />
        </div>
        
        <div className="mt-2 text-xs">
          <div>Controls: Arrow Keys or WASD to move</div>
          <div>P or Space to pause | ESC to quit</div>
          {gameOver && (
            <div className="mt-2">
              <button
                onClick={resetGame}
                className="px-3 py-1 bg-green-400 text-black hover:bg-green-300 transition-colors"
              >
                Play Again (R)
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
