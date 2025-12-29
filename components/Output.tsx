"use client";

import type { CommandOutput } from '@/types/command';

type ColorTheme = 'green' | 'white' | 'red' | 'yellow';

interface OutputProps {
  output: CommandOutput;
  username: string;
  colorTheme?: ColorTheme;
}

export default function Output({ output, username, colorTheme = 'green' }: OutputProps) {
  const getThemeColor = () => {
    const colors = {
      green: 'text-green-400',
      white: 'text-white',
      red: 'text-red-400',
      yellow: 'text-yellow-400'
    };
    return colors[colorTheme];
  };

  const getTextColor = () => {
    switch (output.type) {
      case 'error':
        return 'text-red-400';
      case 'info':
        return 'text-blue-400';
      default:
        return getThemeColor();
    }
  };

  return (
    <div className="space-y-1">
      {output.command && (
        <div className="flex items-center gap-2">
          <span className={getThemeColor()}>
            {username}@terminal:~$
          </span>
          <span className="text-gray-300">{output.command}</span>
        </div>
      )}
      {output.output && (
        <pre className={`whitespace-pre-wrap ${getTextColor()} leading-relaxed`}>
          {output.output}
        </pre>
      )}
    </div>
  );
}
