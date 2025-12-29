export interface Command {
  name: string;
  description: string;
  usage: string;
  category: string;
  requiresAuth?: boolean;
  requiresAdmin?: boolean;
}

export interface CommandOutput {
  id: string;
  command: string;
  output: string | JSX.Element;
  timestamp: Date;
  type: 'success' | 'error' | 'info';
}

export interface CommandHistory {
  commands: string[];
  currentIndex: number;
}
