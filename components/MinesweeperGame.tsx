"use client";

import { useState, useEffect, useCallback } from 'react';

interface Cell {
  isMine: boolean;
  isRevealed: boolean;
  isFlagged: boolean;
  neighborMines: number;
}

interface MinesweeperGameProps {
  onGameOver?: (score: number) => void;
  onClose?: () => void;
}

const ROWS = 10;
const COLS = 10;
const MINES = 15;
const CELL_SIZE = 30;

export default function MinesweeperGame({ onGameOver, onClose }: MinesweeperGameProps) {
  const [board, setBoard] = useState<Cell[][]>([]);
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);
  const [flagCount, setFlagCount] = useState(0);
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);

  const initBoard = useCallback(() => {
    const newBoard: Cell[][] = Array(ROWS).fill(null).map(() =>
      Array(COLS).fill(null).map(() => ({
        isMine: false,
        isRevealed: false,
        isFlagged: false,
        neighborMines: 0
      }))
    );

    // Place mines
    let minesPlaced = 0;
    while (minesPlaced < MINES) {
      const row = Math.floor(Math.random() * ROWS);
      const col = Math.floor(Math.random() * COLS);
      if (!newBoard[row][col].isMine) {
        newBoard[row][col].isMine = true;
        minesPlaced++;
      }
    }

    // Calculate neighbor mines
    for (let row = 0; row < ROWS; row++) {
      for (let col = 0; col < COLS; col++) {
        if (!newBoard[row][col].isMine) {
          let count = 0;
          for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
              const newRow = row + dr;
              const newCol = col + dc;
              if (newRow >= 0 && newRow < ROWS && newCol >= 0 && newCol < COLS) {
                if (newBoard[newRow][newCol].isMine) count++;
              }
            }
          }
          newBoard[row][col].neighborMines = count;
        }
      }
    }

    setBoard(newBoard);
    setGameOver(false);
    setWon(false);
    setFlagCount(0);
    setTime(0);
    setIsRunning(false);
  }, []);

  useEffect(() => {
    initBoard();
  }, [initBoard]);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isRunning && !gameOver && !won) {
      interval = setInterval(() => setTime(t => t + 1), 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, gameOver, won]);

  const revealCell = useCallback((row: number, col: number) => {
    if (gameOver || won) return;
    
    if (!isRunning) setIsRunning(true);

    const newBoard = board.map(r => r.map(c => ({ ...c })));
    
    if (newBoard[row][col].isFlagged || newBoard[row][col].isRevealed) return;

    if (newBoard[row][col].isMine) {
      newBoard[row][col].isRevealed = true;
      setBoard(newBoard);
      setGameOver(true);
      setIsRunning(false);
      if (onGameOver) onGameOver(time);
      return;
    }

    const reveal = (r: number, c: number) => {
      if (r < 0 || r >= ROWS || c < 0 || c >= COLS) return;
      if (newBoard[r][c].isRevealed || newBoard[r][c].isFlagged) return;
      
      newBoard[r][c].isRevealed = true;
      
      if (newBoard[r][c].neighborMines === 0) {
        for (let dr = -1; dr <= 1; dr++) {
          for (let dc = -1; dc <= 1; dc++) {
            reveal(r + dr, c + dc);
          }
        }
      }
    };

    reveal(row, col);

    // Check win
    const allRevealed = newBoard.every((row, r) =>
      row.every((cell, c) => cell.isMine || cell.isRevealed)
    );

    if (allRevealed) {
      setWon(true);
      setIsRunning(false);
    }

    setBoard(newBoard);
  }, [board, gameOver, won, isRunning, time, onGameOver]);

  const toggleFlag = useCallback((row: number, col: number, e: React.MouseEvent) => {
    e.preventDefault();
    if (gameOver || won || board[row][col].isRevealed) return;

    if (!isRunning) setIsRunning(true);

    const newBoard = board.map(r => r.map(c => ({ ...c })));
    newBoard[row][col].isFlagged = !newBoard[row][col].isFlagged;
    setFlagCount(prev => newBoard[row][col].isFlagged ? prev + 1 : prev - 1);
    setBoard(newBoard);
  }, [board, gameOver, won, isRunning]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        if (onClose) onClose();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [onClose]);

  const getCellColor = (cell: Cell) => {
    if (!cell.isRevealed) {
      return cell.isFlagged ? 'bg-yellow-400' : 'bg-gray-500 hover:bg-gray-400';
    }
    if (cell.isMine) return 'bg-red-500';
    return 'bg-gray-200';
  };

  const getCellContent = (cell: Cell) => {
    if (!cell.isRevealed) return cell.isFlagged ? '🚩' : '';
    if (cell.isMine) return '💣';
    return cell.neighborMines > 0 ? cell.neighborMines : '';
  };

  const numberColors = [
    '',
    'text-blue-600',
    'text-green-600',
    'text-red-600',
    'text-purple-600',
    'text-yellow-700',
    'text-cyan-600',
    'text-black',
    'text-gray-600'
  ];

  return (
    <div className="inline-block">
      <div className="mb-2 text-green-400 font-mono">
        <div className="flex justify-between items-center mb-2">
          <div className="text-yellow-400 font-bold">MINESWEEPER</div>
          <div className="flex gap-4 text-sm">
            <div>💣 {MINES - flagCount}</div>
            <div>⏱️ {time}s</div>
          </div>
        </div>

        {won && (
          <div className="mb-2 p-2 bg-green-400 text-black text-center font-bold">
            🎉 You Won! Time: {time}s
          </div>
        )}

        {gameOver && (
          <div className="mb-2 p-2 bg-red-400 text-white text-center font-bold">
            💥 Game Over! You hit a mine!
          </div>
        )}

        <div className="border-2 border-green-400 bg-gray-700 p-1 inline-block">
          {board.map((row, r) => (
            <div key={r} className="flex">
              {row.map((cell, c) => (
                <button
                  key={`${r}-${c}`}
                  className={`${getCellColor(cell)} border border-gray-600 font-bold
                    ${cell.isRevealed && cell.neighborMines ? numberColors[cell.neighborMines] : 'text-black'}
                    flex items-center justify-center text-sm transition-colors cursor-pointer`}
                  style={{ width: `${CELL_SIZE}px`, height: `${CELL_SIZE}px` }}
                  onClick={() => revealCell(r, c)}
                  onContextMenu={(e) => toggleFlag(r, c, e)}
                >
                  {getCellContent(cell)}
                </button>
              ))}
            </div>
          ))}
        </div>

        <div className="mt-2 text-xs">
          <div>Left click to reveal | Right click to flag</div>
          <div>ESC to quit</div>
          {(gameOver || won) && (
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
