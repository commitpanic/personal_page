export interface User {
  id: string;
  email: string;
  username: string;
  createdAt: Date;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
}
