"use client";

import { useState, useEffect, useCallback } from 'react';

interface Game2048Props {
  onGameOver?: (score: number) => void;
  onClose?: () => void;
}

type Board = number[][];

const SIZE = 4;
const CELL_SIZE = 80;

const COLORS: Record<number, string> = {
  2: 'bg-slate-200 text-gray-800',
  4: 'bg-slate-300 text-gray-800',
  8: 'bg-orange-400 text-white',
  16: 'bg-orange-500 text-white',
  32: 'bg-orange-600 text-white',
  64: 'bg-red-500 text-white',
  128: 'bg-yellow-400 text-white',
  256: 'bg-yellow-500 text-white',
  512: 'bg-yellow-600 text-white',
  1024: 'bg-yellow-300 text-white',
  2048: 'bg-yellow-200 text-white',
  4096: 'bg-gray-800 text-white',
};

export default function Game2048({ onGameOver, onClose }: Game2048Props) {
  const [board, setBoard] = useState<Board>([]);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('2048HighScore');
    if (saved) setHighScore(parseInt(saved));
    initBoard();
  }, []);

  const initBoard = () => {
    const newBoard = Array(SIZE).fill(0).map(() => Array(SIZE).fill(0));
    addRandomTile(newBoard);
    addRandomTile(newBoard);
    setBoard(newBoard);
    setScore(0);
    setGameOver(false);
    setWon(false);
  };

  const addRandomTile = (board: Board) => {
    const empty: [number, number][] = [];
    board.forEach((row, i) => {
      row.forEach((cell, j) => {
        if (cell === 0) empty.push([i, j]);
      });
    });
    if (empty.length > 0) {
      const [i, j] = empty[Math.floor(Math.random() * empty.length)];
      board[i][j] = Math.random() < 0.9 ? 2 : 4;
    }
  };

  const moveLeft = (board: Board): { board: Board; moved: boolean; scoreAdd: number } => {
    let moved = false;
    let scoreAdd = 0;
    const newBoard = board.map(row => {
      const filtered = row.filter(cell => cell !== 0);
      const merged: number[] = [];
      let skip = false;
      
      for (let i = 0; i < filtered.length; i++) {
        if (skip) {
          skip = false;
          continue;
        }
        if (i < filtered.length - 1 && filtered[i] === filtered[i + 1]) {
          const value = filtered[i] * 2;
          merged.push(value);
          scoreAdd += value;
          skip = true;
          moved = true;
        } else {
          merged.push(filtered[i]);
        }
      }
      
      while (merged.length < SIZE) merged.push(0);
      if (JSON.stringify(row) !== JSON.stringify(merged)) moved = true;
      return merged;
    });
    return { board: newBoard, moved, scoreAdd };
  };

  const rotateBoard = (board: Board): Board => {
    return board[0].map((_, i) => board.map(row => row[i]).reverse());
  };

  const move = useCallback((direction: 'left' | 'right' | 'up' | 'down') => {
    if (gameOver) return;

    let workBoard = board.map(row => [...row]);
    let rotations = 0;

    switch (direction) {
      case 'right':
        rotations = 2;
        break;
      case 'up':
        rotations = 3;
        break;
      case 'down':
        rotations = 1;
        break;
    }

    for (let i = 0; i < rotations; i++) {
      workBoard = rotateBoard(workBoard);
    }

    let { board: movedBoard, moved, scoreAdd } = moveLeft(workBoard);

    for (let i = 0; i < (4 - rotations) % 4; i++) {
      movedBoard = rotateBoard(movedBoard);
    }

    if (moved) {
      addRandomTile(movedBoard);
      setBoard(movedBoard);
      setScore(s => {
        const newScore = s + scoreAdd;
        if (newScore > highScore) {
          localStorage.setItem('2048HighScore', newScore.toString());
          setHighScore(newScore);
        }
        return newScore;
      });

      // Check for 2048
      if (!won && movedBoard.some(row => row.some(cell => cell === 2048))) {
        setWon(true);
      }

      // Check game over
      if (isGameOver(movedBoard)) {
        setGameOver(true);
        if (onGameOver) onGameOver(score + scoreAdd);
      }
    }
  }, [board, gameOver, score, highScore, won, onGameOver]);

  const isGameOver = (board: Board): boolean => {
    // Check for empty cells
    if (board.some(row => row.some(cell => cell === 0))) return false;
    
    // Check for possible merges
    for (let i = 0; i < SIZE; i++) {
      for (let j = 0; j < SIZE; j++) {
        if (j < SIZE - 1 && board[i][j] === board[i][j + 1]) return false;
        if (i < SIZE - 1 && board[i][j] === board[i + 1][j]) return false;
      }
    }
    return true;
  };

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowLeft':
        case 'a':
        case 'A':
          e.preventDefault();
          move('left');
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          e.preventDefault();
          move('right');
          break;
        case 'ArrowUp':
        case 'w':
        case 'W':
          e.preventDefault();
          move('up');
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          e.preventDefault();
          move('down');
          break;
        case 'Escape':
          e.preventDefault();
          if (onClose) onClose();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [move, onClose]);

  return (
    <div className="inline-block">
      <div className="mb-2 text-green-400 font-mono">
        <div className="flex justify-between items-center mb-2">
          <div className="text-yellow-400 font-bold text-2xl">2048</div>
          <div className="text-right">
            <div>Score: {score}</div>
            <div className="text-xs">Best: {highScore}</div>
          </div>
        </div>

        {won && !gameOver && (
          <div className="mb-2 p-2 bg-yellow-400 text-black text-center font-bold">
            🎉 You Win! Keep playing to reach higher scores!
          </div>
        )}

        {gameOver && (
          <div className="mb-2 p-2 bg-red-400 text-white text-center font-bold">
            Game Over! Final Score: {score}
          </div>
        )}

        <div className="bg-gray-700 p-2 inline-block rounded">
          {board.map((row, i) => (
            <div key={i} className="flex gap-2 mb-2 last:mb-0">
              {row.map((cell, j) => (
                <div
                  key={`${i}-${j}`}
                  className={`${cell ? COLORS[cell] || 'bg-gray-900 text-white' : 'bg-gray-600'} 
                    flex items-center justify-center font-bold rounded text-xl transition-all`}
                  style={{ width: `${CELL_SIZE}px`, height: `${CELL_SIZE}px` }}
                >
                  {cell || ''}
                </div>
              ))}
            </div>
          ))}
        </div>

        <div className="mt-2 text-xs">
          <div>Arrow keys or WASD to move tiles</div>
          <div>ESC to quit</div>
          {gameOver && (
            <button
              onClick={initBoard}
              className="mt-2 px-3 py-1 bg-green-400 text-black hover:bg-green-300"
            >
              New Game
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
