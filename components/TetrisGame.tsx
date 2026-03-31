"use client";

import { useState, useEffect, useCallback, useRef } from 'react';

interface Position {
  x: number;
  y: number;
}

type Tetromino = number[][];

interface TetrisGameProps {
  onGameOver?: (score: number) => void;
  onClose?: () => void;
}

const BOARD_WIDTH = 10;
const BOARD_HEIGHT = 20;
const CELL_SIZE = 20;

const TETROMINOS: Record<string, { shape: Tetromino; color: string }> = {
  I: { shape: [[1, 1, 1, 1]], color: 'bg-cyan-400' },
  O: { shape: [[1, 1], [1, 1]], color: 'bg-yellow-400' },
  T: { shape: [[0, 1, 0], [1, 1, 1]], color: 'bg-purple-400' },
  S: { shape: [[0, 1, 1], [1, 1, 0]], color: 'bg-green-400' },
  Z: { shape: [[1, 1, 0], [0, 1, 1]], color: 'bg-red-400' },
  J: { shape: [[1, 0, 0], [1, 1, 1]], color: 'bg-blue-400' },
  L: { shape: [[0, 0, 1], [1, 1, 1]], color: 'bg-orange-400' }
};

const TETROMINO_KEYS = Object.keys(TETROMINOS);

export default function TetrisGame({ onGameOver, onClose }: TetrisGameProps) {
  const [board, setBoard] = useState<(string | null)[][]>(
    Array(BOARD_HEIGHT).fill(null).map(() => Array(BOARD_WIDTH).fill(null))
  );
  const [currentPiece, setCurrentPiece] = useState<{ shape: Tetromino; color: string; pos: Position } | null>(null);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [lines, setLines] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [highScore, setHighScore] = useState(0);
  const [nextPiece, setNextPiece] = useState<{ shape: Tetromino; color: string } | null>(null);
  
  const gameLoopRef = useRef<NodeJS.Timeout | null>(null);
  const dropSpeed = Math.max(100, 800 - (level - 1) * 100);

  useEffect(() => {
    const saved = localStorage.getItem('tetrisHighScore');
    if (saved) setHighScore(parseInt(saved));
  }, []);

  const getRandomTetromino = useCallback(() => {
    const key = TETROMINO_KEYS[Math.floor(Math.random() * TETROMINO_KEYS.length)];
    return { ...TETROMINOS[key] };
  }, []);

  const spawnPiece = useCallback(() => {
    const piece = nextPiece || getRandomTetromino();
    setNextPiece(getRandomTetromino());
    return {
      ...piece,
      pos: { x: Math.floor(BOARD_WIDTH / 2) - Math.floor(piece.shape[0].length / 2), y: 0 }
    };
  }, [nextPiece, getRandomTetromino]);

  useEffect(() => {
    if (!currentPiece && !gameOver) {
      const piece = spawnPiece();
      if (checkCollision(piece.shape, piece.pos, board)) {
        setGameOver(true);
        if (onGameOver) onGameOver(score);
        if (score > highScore) {
          localStorage.setItem('tetrisHighScore', score.toString());
          setHighScore(score);
        }
      } else {
        setCurrentPiece(piece);
      }
    }
  }, [currentPiece, gameOver, spawnPiece, board, score, highScore, onGameOver]);

  const checkCollision = (shape: Tetromino, pos: Position, board: (string | null)[][]): boolean => {
    for (let y = 0; y < shape.length; y++) {
      for (let x = 0; x < shape[y].length; x++) {
        if (shape[y][x]) {
          const newX = pos.x + x;
          const newY = pos.y + y;
          if (newX < 0 || newX >= BOARD_WIDTH || newY >= BOARD_HEIGHT) return true;
          if (newY >= 0 && board[newY][newX]) return true;
        }
      }
    }
    return false;
  };

  const mergePiece = useCallback(() => {
    if (!currentPiece) return;
    
    const newBoard = board.map(row => [...row]);
    currentPiece.shape.forEach((row, y) => {
      row.forEach((cell, x) => {
        if (cell) {
          const boardY = currentPiece.pos.y + y;
          const boardX = currentPiece.pos.x + x;
          if (boardY >= 0) {
            newBoard[boardY][boardX] = currentPiece.color;
          }
        }
      });
    });

    let linesCleared = 0;
    const clearedBoard = newBoard.filter(row => {
      if (row.every(cell => cell !== null)) {
        linesCleared++;
        return false;
      }
      return true;
    });

    while (clearedBoard.length < BOARD_HEIGHT) {
      clearedBoard.unshift(Array(BOARD_WIDTH).fill(null));
    }

    if (linesCleared > 0) {
      const points = [0, 40, 100, 300, 1200][linesCleared] * level;
      setScore(s => s + points);
      setLines(l => {
        const newLines = l + linesCleared;
        setLevel(Math.floor(newLines / 10) + 1);
        return newLines;
      });
    }

    setBoard(clearedBoard);
    setCurrentPiece(null);
  }, [currentPiece, board, level]);

  const movePiece = useCallback((dx: number, dy: number) => {
    if (!currentPiece || gameOver || isPaused) return false;
    
    const newPos = { x: currentPiece.pos.x + dx, y: currentPiece.pos.y + dy };
    if (!checkCollision(currentPiece.shape, newPos, board)) {
      setCurrentPiece({ ...currentPiece, pos: newPos });
      return true;
    } else if (dy > 0) {
      mergePiece();
    }
    return false;
  }, [currentPiece, gameOver, isPaused, board, mergePiece]);

  const rotatePiece = useCallback(() => {
    if (!currentPiece || gameOver || isPaused) return;
    
    const rotated = currentPiece.shape[0].map((_, i) =>
      currentPiece.shape.map(row => row[i]).reverse()
    );
    
    if (!checkCollision(rotated, currentPiece.pos, board)) {
      setCurrentPiece({ ...currentPiece, shape: rotated });
    }
  }, [currentPiece, gameOver, isPaused, board]);

  const hardDrop = useCallback(() => {
    if (!currentPiece || gameOver || isPaused) return;
    
    let newY = currentPiece.pos.y;
    while (!checkCollision(currentPiece.shape, { x: currentPiece.pos.x, y: newY + 1 }, board)) {
      newY++;
    }
    setCurrentPiece({ ...currentPiece, pos: { ...currentPiece.pos, y: newY } });
    mergePiece();
  }, [currentPiece, gameOver, isPaused, board, mergePiece]);

  useEffect(() => {
    if (!gameOver && !isPaused && currentPiece) {
      gameLoopRef.current = setInterval(() => {
        movePiece(0, 1);
      }, dropSpeed);
    }
    return () => {
      if (gameLoopRef.current) clearInterval(gameLoopRef.current);
    };
  }, [movePiece, gameOver, isPaused, dropSpeed, currentPiece]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (gameOver) return;

      switch (e.key) {
        case 'ArrowLeft':
        case 'a':
        case 'A':
          e.preventDefault();
          movePiece(-1, 0);
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          e.preventDefault();
          movePiece(1, 0);
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          e.preventDefault();
          movePiece(0, 1);
          break;
        case 'ArrowUp':
        case 'w':
        case 'W':
          e.preventDefault();
          rotatePiece();
          break;
        case ' ':
          e.preventDefault();
          if (e.ctrlKey || e.shiftKey) {
            hardDrop();
          } else {
            setIsPaused(p => !p);
          }
          break;
        case 'p':
        case 'P':
          e.preventDefault();
          setIsPaused(p => !p);
          break;
        case 'Escape':
          e.preventDefault();
          if (onClose) onClose();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [movePiece, rotatePiece, hardDrop, gameOver, onClose]);

  const resetGame = () => {
    setBoard(Array(BOARD_HEIGHT).fill(null).map(() => Array(BOARD_WIDTH).fill(null)));
    setCurrentPiece(null);
    setNextPiece(null);
    setScore(0);
    setLevel(1);
    setLines(0);
    setGameOver(false);
    setIsPaused(false);
  };

  const renderCell = (color: string | null, isGhost = false) => (
    <div
      className={`${color || 'bg-gray-900'} ${isGhost ? 'opacity-30' : ''} border border-gray-800`}
      style={{ width: `${CELL_SIZE}px`, height: `${CELL_SIZE}px` }}
    />
  );

  const displayBoard = board.map(row => [...row]);
  
  if (currentPiece) {
    currentPiece.shape.forEach((row, y) => {
      row.forEach((cell, x) => {
        if (cell) {
          const boardY = currentPiece.pos.y + y;
          const boardX = currentPiece.pos.x + x;
          if (boardY >= 0 && boardY < BOARD_HEIGHT && boardX >= 0 && boardX < BOARD_WIDTH) {
            displayBoard[boardY][boardX] = currentPiece.color;
          }
        }
      });
    });
  }

  return (
    <div className="inline-block">
      <div className="mb-2 text-green-400 font-mono">
        <div className="flex justify-between items-center mb-2">
          <div className="text-yellow-400 font-bold">TETRIS</div>
          <div className="text-xs">
            {isPaused && <span className="text-yellow-400">[PAUSED]</span>}
            {gameOver && <span className="text-red-400">[GAME OVER]</span>}
          </div>
        </div>
        
        <div className="flex gap-4">
          <div className="border-2 border-green-400 bg-black" style={{ width: `${BOARD_WIDTH * CELL_SIZE}px` }}>
            {displayBoard.map((row, y) => (
              <div key={y} className="flex">
                {row.map((cell, x) => (
                  <div key={x}>{renderCell(cell)}</div>
                ))}
              </div>
            ))}
          </div>
          
          <div className="space-y-3 text-xs">
            <div className="border border-green-400 p-2">
              <div>Score: {score}</div>
              <div>High: {highScore}</div>
              <div>Level: {level}</div>
              <div>Lines: {lines}</div>
            </div>
            
            {nextPiece && (
              <div className="border border-green-400 p-2">
                <div className="mb-1">Next:</div>
                <div className="bg-black p-1">
                  {nextPiece.shape.map((row, y) => (
                    <div key={y} className="flex">
                      {row.map((cell, x) => (
                        <div
                          key={x}
                          className={`${cell ? nextPiece.color : 'bg-transparent'} border border-gray-800`}
                          style={{ width: '15px', height: '15px' }}
                        />
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div className="mt-2 text-xs">
          <div>← → or A/D: Move | ↑ or W: Rotate</div>
          <div>↓ or S: Soft drop | Space: Hard drop</div>
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
