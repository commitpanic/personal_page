"use client";

import { useState, useRef, useEffect, KeyboardEvent, type ReactElement } from 'react';
import { executeCommand, executeAsyncCommand } from '@/helpers/commandParser';
import { useAuth } from '@/hooks/useAuth';
import type { CommandOutput } from '@/types/command';
import Output from './Output';
import SnakeGame from './SnakeGame';
import TetrisGame from './TetrisGame';
import Game2048 from './Game2048';
import MinesweeperGame from './MinesweeperGame';
import SpaceInvadersGame from './SpaceInvadersGame';

type ColorTheme = 'green' | 'white' | 'red' | 'yellow';

export default function Terminal() {
  const [input, setInput] = useState('');
  const [outputs, setOutputs] = useState<CommandOutput[]>([]);
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const { username, refreshAuth } = useAuth();
  const [colorTheme, setColorTheme] = useState<ColorTheme>('green');
  const [activeGame, setActiveGame] = useState<string | null>(null);
  const [currentGameId, setCurrentGameId] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const terminalRef = useRef<HTMLDivElement>(null);

  const getThemeColor = () => {
    const colors = {
      green: 'text-green-400',
      white: 'text-white',
      red: 'text-red-400',
      yellow: 'text-yellow-400'
    };
    return colors[colorTheme];
  };

  const getCaretColor = () => {
    const colors = {
      green: 'caret-green-400',
      white: 'caret-white',
      red: 'caret-red-400',
      yellow: 'caret-yellow-400'
    };
    return colors[colorTheme];
  };

  useEffect(() => {
    // Show welcome message on mount
    const welcomeOutput: CommandOutput = {
      id: Date.now().toString(),
      command: '',
      output: executeCommand('home', username).output,
      timestamp: new Date(),
      type: 'success'
    };
    setOutputs([welcomeOutput]);
  }, [username]);

  useEffect(() => {
    // Scroll to bottom when new output is added
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [outputs]);

  const handleSubmit = async () => {
    if (!input.trim()) return;

    const result = executeCommand(input, username);
    
    // Helper function to create game output
    const createGameOutput = (
      gameName: string, 
      gameComponent: ReactElement
    ) => {
      const gameId = Date.now().toString();
      setActiveGame(gameName);
      setCurrentGameId(gameId);
      const newOutput: CommandOutput = {
        id: gameId,
        command: input,
        output: gameComponent,
        timestamp: new Date(),
        type: 'success'
      };
      setOutputs(prev => [...prev, newOutput]);
      setHistory(prev => [...prev, input]);
      setHistoryIndex(-1);
      setInput('');
    };

    const closeGame = (finalMessage?: string) => {
      setActiveGame(null);
      // Replace the game component with the close message
      if (currentGameId && finalMessage) {
        setOutputs(prev => prev.map(out => 
          out.id === currentGameId 
            ? { ...out, output: finalMessage }
            : out
        ));
      }
      setCurrentGameId(null);
    };
    
    // Handle snake game command
    if (result.output === '__SNAKE__') {
      createGameOutput('snake', 
        <SnakeGame 
          onGameOver={(score) => closeGame(`Game Over! Final Score: ${score}`)}
          onClose={() => closeGame('Snake game closed.')}
        />
      );
      return;
    }

    // Handle tetris game command
    if (result.output === '__TETRIS__') {
      createGameOutput('tetris',
        <TetrisGame 
          onGameOver={(score) => closeGame(`Game Over! Final Score: ${score}`)}
          onClose={() => closeGame('Tetris closed.')}
        />
      );
      return;
    }

    // Handle 2048 game command
    if (result.output === '__2048__') {
      createGameOutput('2048',
        <Game2048 
          onGameOver={(score) => closeGame(`Game Over! Final Score: ${score}`)}
          onClose={() => closeGame('2048 closed.')}
        />
      );
      return;
    }

    // Handle minesweeper game command
    if (result.output === '__MINESWEEPER__') {
      createGameOutput('minesweeper',
        <MinesweeperGame 
          onGameOver={(time) => closeGame(`Game Over! Time: ${time}s`)}
          onClose={() => closeGame('Minesweeper closed.')}
        />
      );
      return;
    }

    // Handle space invaders game command
    if (result.output === '__INVADERS__') {
      createGameOutput('invaders',
        <SpaceInvadersGame 
          onGameOver={(score) => closeGame(`Game Over! Final Score: ${score}`)}
          onClose={() => closeGame('Space Invaders closed.')}
        />
      );
      return;
    }
    
    // Handle async commands
    if (result.output.startsWith('__ASYNC__')) {
      const loadingOutput: CommandOutput = {
        id: Date.now().toString(),
        command: input,
        output: 'Processing...',
        timestamp: new Date(),
        type: 'info'
      };
      setOutputs(prev => [...prev, loadingOutput]);
      setHistory(prev => [...prev, input]);
      setHistoryIndex(-1);
      setInput('');

      try {
        const asyncResult = await executeAsyncCommand(result.output);
        setOutputs(prev => prev.map(out => 
          out.id === loadingOutput.id 
            ? { ...out, output: asyncResult.output, type: asyncResult.type }
            : out
        ));
        
        // Auth state will automatically update via the useAuth hook
        // when localStorage changes trigger the 'auth-changed' event
      } catch (error: any) {
        setOutputs(prev => prev.map(out => 
          out.id === loadingOutput.id 
            ? { ...out, output: `✗ Error: ${error.message}`, type: 'error' as const }
            : out
        ));
      }
      return;
    }
    
    // Handle color theme change
    if (result.output.startsWith('__COLOR__')) {
      const newColor = result.output.replace('__COLOR__', '') as ColorTheme;
      setColorTheme(newColor);
      const newOutput: CommandOutput = {
        id: Date.now().toString(),
        command: input,
        output: `✓ Color theme changed to ${newColor}`,
        timestamp: new Date(),
        type: 'success'
      };
      setOutputs(prev => [...prev, newOutput]);
      setHistory(prev => [...prev, input]);
      setHistoryIndex(-1);
      setInput('');
      return;
    }
    
    if (result.output === '__CLEAR__') {
      setOutputs([]);
      setInput('');
      return;
    }

    // Handle copy to clipboard
    if (result.output.startsWith('__COPY__')) {
      const textToCopy = result.output.replace('__COPY__', '');
      navigator.clipboard.writeText(textToCopy).then(() => {
        const newOutput: CommandOutput = {
          id: Date.now().toString(),
          command: input,
          output: `✓ Copied to clipboard: ${textToCopy}`,
          timestamp: new Date(),
          type: 'success'
        };
        setOutputs(prev => [...prev, newOutput]);
      }).catch(() => {
        const newOutput: CommandOutput = {
          id: Date.now().toString(),
          command: input,
          output: '✗ Failed to copy to clipboard',
          timestamp: new Date(),
          type: 'error'
        };
        setOutputs(prev => [...prev, newOutput]);
      });
      setHistory(prev => [...prev, input]);
      setHistoryIndex(-1);
      setInput('');
      return;
    }

    // Handle open URL
    if (result.output.startsWith('__OPEN__')) {
      const url = result.output.replace('__OPEN__', '');
      window.open(url, '_blank', 'noopener,noreferrer');
      const newOutput: CommandOutput = {
        id: Date.now().toString(),
        command: input,
        output: `✓ Opening ${url} in new tab...`,
        timestamp: new Date(),
        type: 'success'
      };
      setOutputs(prev => [...prev, newOutput]);
      setHistory(prev => [...prev, input]);
      setHistoryIndex(-1);
      setInput('');
      return;
    }

    const newOutput: CommandOutput = {
      id: Date.now().toString(),
      command: input,
      output: result.output,
      timestamp: new Date(),
      type: result.type
    };

    setOutputs(prev => [...prev, newOutput]);
    setHistory(prev => [...prev, input]);
    setHistoryIndex(-1);
    setInput('');
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    // Disable keyboard input when any game is active
    if (activeGame) {
      e.preventDefault();
      return;
    }
    
    if (e.key === 'Enter') {
      handleSubmit();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (history.length === 0) return;
      
      const newIndex = historyIndex === -1 
        ? history.length - 1 
        : Math.max(0, historyIndex - 1);
      
      setHistoryIndex(newIndex);
      setInput(history[newIndex]);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex === -1) return;
      
      const newIndex = historyIndex + 1;
      
      if (newIndex >= history.length) {
        setHistoryIndex(-1);
        setInput('');
      } else {
        setHistoryIndex(newIndex);
        setInput(history[newIndex]);
      }
    } else if (e.key === 'Tab') {
      e.preventDefault();
      // Tab completion can be added here later
    }
  };

  const focusInput = () => {
    inputRef.current?.focus();
  };

  return (
    <div 
      className={`flex flex-col h-full bg-gray-950 ${getThemeColor()} font-mono text-xs sm:text-sm overflow-hidden`}
      onClick={focusInput}
    >
      <div 
        ref={terminalRef}
        className="flex-1 overflow-y-auto p-2 sm:p-4 space-y-2"
      >
        {outputs.map((output) => (
          <Output key={output.id} output={output} username={username} colorTheme={colorTheme} />
        ))}
        
        <div className="flex items-center gap-2">
          <span className={getThemeColor()}>
            {username}@terminal:~$
          </span>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className={`flex-1 bg-transparent outline-none ${getThemeColor()} ${getCaretColor()}`}
            autoFocus
            spellCheck={false}
          />
          <span className="animate-pulse">█</span>
        </div>
      </div>
    </div>
  );
}
