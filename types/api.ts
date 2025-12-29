export interface User {
  id: number;
  username: string;
  email: string;
  role: 'user' | 'admin';
}

export interface AuthResponse {
  message: string;
  token?: string;
  user: User;
}

export interface Article {
  id: number;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  author_id: number;
  tags: string[];
  published: boolean;
  published_at: string;
  created_at: string;
  updated_at: string;
  view_count?: number;
}

export interface Comment {
  id: number;
  article_id: number;
  author_name: string;
  author_email: string;
  content: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}

export interface Reaction {
  id: number;
  article_id: number;
  user_id?: number;
  session_id?: string;
  reaction_type: string;
  created_at: string;
}

export interface ContactSubmission {
  name: string;
  email: string;
  message: string;
}

export interface ApiError {
  message: string;
  error?: string;
}
