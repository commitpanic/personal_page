const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Helper function to handle API responses
async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'An error occurred' }));
    console.error('API Error Details:', { 
      status: response.status, 
      statusText: response.statusText,
      error,
      url: response.url 
    });
    
    // Handle validation errors
    if (error.errors && Array.isArray(error.errors)) {
      const messages = error.errors.map((e: any) => e.msg || e.message).join('; ');
      throw new Error(`Validation failed: ${messages}`);
    }
    
    throw new Error(error.message || error.error || `HTTP ${response.status}: ${response.statusText}`);
  }
  return response.json();
}

// Authentication
export const authAPI = {
  register: async (username: string, password: string, email: string, role?: 'user' | 'admin') => {
    const body: any = { username, password, email };
    if (role) body.role = role;
    
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    const result = await handleResponse<{ success: boolean; message: string; data: { token: string; user: { id: number; username: string; email: string; role: 'user' | 'admin' } } }>(response);
    
    // Extract token and user from the data property
    const token = result.data?.token;
    const user = result.data?.user;
    
    if (token && user && typeof window !== 'undefined') {
      localStorage.setItem('auth_token', token);
      localStorage.setItem('user', JSON.stringify(user));
      console.log('Saved to localStorage:', { token, user });
      // Dispatch custom event to notify components
      window.dispatchEvent(new Event('auth-changed'));
    }
    
    // Return in expected format
    return {
      message: result.message,
      token: token!,
      user: user!
    };
  },

  login: async (username: string, password: string) => {
    try {
      console.log('Login API call:', { username, password, url: `${API_BASE_URL}/auth/login` });
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      console.log('Login response:', { status: response.status, ok: response.ok });
      const result = await handleResponse<{ success: boolean; message: string; data: { token: string; user: { id: number; username: string; email: string; role: 'user' | 'admin' } } }>(response);
      console.log('Login data:', result);
      
      // Extract token and user from the data property
      const token = result.data?.token;
      const user = result.data?.user;
      
      if (token && user && typeof window !== 'undefined') {
        localStorage.setItem('auth_token', token);
        localStorage.setItem('user', JSON.stringify(user));
        console.log('Saved to localStorage:', { token, user });
        // Dispatch custom event to notify components
        window.dispatchEvent(new Event('auth-changed'));
      }
      
      // Return in the expected format
      return {
        message: result.message,
        token: token!,
        user: user!
      };
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      // Dispatch custom event to notify components
      window.dispatchEvent(new Event('auth-changed'));
    }
  },

  getToken: (): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('auth_token');
  },

  getUser: () => {
    if (typeof window === 'undefined') return null;
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  isAuthenticated: (): boolean => {
    if (typeof window === 'undefined') return false;
    return !!localStorage.getItem('auth_token');
  },

  forgotPassword: async (email: string) => {
    const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    return handleResponse<{ message: string }>(response);
  },

  resetPassword: async (token: string, newPassword: string) => {
    const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, newPassword })
    });
    return handleResponse<{ message: string }>(response);
  }
};

// Contact
export const contactAPI = {
  submit: async (name: string, email: string, message: string) => {
    const response = await fetch(`${API_BASE_URL}/contact`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, message })
    });
    return handleResponse<{ message: string }>(response);
  },

  getMessages: async (status?: string) => {
    const token = authAPI.getToken();
    if (!token) {
      throw new Error('Authentication required. Please login as admin.');
    }
    
    const url = status 
      ? `${API_BASE_URL}/contact?status=${status}` 
      : `${API_BASE_URL}/contact`;
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    const result = await handleResponse<{ success: boolean; data: { messages: any[] } }>(response);
    return { messages: result.data?.messages || [] };
  },

  updateMessageStatus: async (id: number, status: 'read' | 'archived') => {
    const token = authAPI.getToken();
    if (!token) {
      throw new Error('Authentication required. Please login as admin.');
    }
    
    const response = await fetch(`${API_BASE_URL}/contact/${id}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ status })
    });
    return handleResponse<{ message: string }>(response);
  }
};

// Logging
export const logsAPI = {
  logVisit: async (ipAddress: string, userAgent: string) => {
    const response = await fetch(`${API_BASE_URL}/logs/visit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ip_address: ipAddress, user_agent: userAgent })
    });
    return handleResponse<{ message: string }>(response);
  },

  logCommand: async (command: string, userId?: number) => {
    const response = await fetch(`${API_BASE_URL}/logs/command`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ command, user_id: userId })
    });
    return handleResponse<{ message: string }>(response);
  }
};

// Blog
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

export const blogAPI = {
  getArticles: async () => {
    const response = await fetch(`${API_BASE_URL}/blog/articles`);
    const result = await handleResponse<{ success: boolean; data: { articles: Article[] } }>(response);
    return { articles: result.data?.articles || [] };
  },

  getArticleBySlug: async (slug: string) => {
    console.log('Fetching article by slug:', slug);
    const response = await fetch(`${API_BASE_URL}/blog/articles/${slug}`);
    console.log('Article response:', response.status);
    const result = await handleResponse<{ success: boolean; data: any }>(response);
    console.log('Article data:', result);
    
    if (!result.data) {
      throw new Error('No article data in response');
    }
    
    return { article: result.data };
  },

  createArticle: async (article: {
    title: string;
    content: string;
    excerpt: string;
    tags?: string[];
    published?: boolean;
  }) => {
    const token = authAPI.getToken();
    
    if (!token) {
      throw new Error('Authentication required. Please login first.');
    }
    
    // Convert published boolean to status string
    const { published, ...rest } = article;
    const payload = {
      ...rest,
      status: published ? 'published' : 'draft'
    };
    
    console.log('Creating article:', { payload, token: token.substring(0, 20) + '...' });
    
    const response = await fetch(`${API_BASE_URL}/blog/articles`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });
    const result = await handleResponse<{ success: boolean; message: string; data: { articleId: number; slug: string } }>(response);
    return { 
      message: result.message,
      data: result.data
    };
  },

  getTags: async () => {
    const response = await fetch(`${API_BASE_URL}/blog/tags`);
    const result = await handleResponse<{ success: boolean; data: { tags: string[] } }>(response);
    return { tags: result.data?.tags || [] };
  },

  searchArticles: async (query: string) => {
    const response = await fetch(`${API_BASE_URL}/blog/search?q=${encodeURIComponent(query)}`);
    const result = await handleResponse<{ success: boolean; data: { articles: Article[] } }>(response);
    return { articles: result.data?.articles || [] };
  },

  updateArticle: async (id: number, article: { title: string; excerpt: string; content: string; tags?: string[]; published?: boolean }) => {
    const token = authAPI.getToken();
    if (!token) {
      throw new Error('Authentication required. Please login first.');
    }
    
    // Convert published boolean to status string
    const { published, ...rest } = article;
    const payload = {
      ...rest,
      status: published ? 'published' : 'draft'
    };
    
    const response = await fetch(`${API_BASE_URL}/blog/articles/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });
    const result = await handleResponse<{ success: boolean; message: string }>(response);
    return { message: result.message };
  },

  deleteArticle: async (id: number) => {
    const token = authAPI.getToken();
    if (!token) {
      throw new Error('Authentication required. Please login first.');
    }
    
    const response = await fetch(`${API_BASE_URL}/blog/articles/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    const result = await handleResponse<{ success: boolean; message: string }>(response);
    return { message: result.message };
  }
};

// Comments
export interface Comment {
  id: number;
  article_id: number;
  author_name: string;
  author_email: string;
  content: string;
  status: string;
  created_at: string;
}

export const commentsAPI = {
  getComments: async (articleId: number) => {
    const response = await fetch(`${API_BASE_URL}/blog/articles/${articleId}/comments`);
    const result = await handleResponse<{ success: boolean; data: Comment[] }>(response);
    return { comments: result.data || [] };
  },

  createComment: async (articleId: number, authorName: string, authorEmail: string, content: string) => {
    const response = await fetch(`${API_BASE_URL}/blog/articles/${articleId}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ authorName, authorEmail, content })
    });
    return handleResponse<{ message: string; comment: Comment }>(response);
  },

  moderateComment: async (commentId: number, status: 'approved' | 'rejected') => {
    const token = authAPI.getToken();
    if (!token) {
      throw new Error('Authentication required. Please login as admin.');
    }
    
    const response = await fetch(`${API_BASE_URL}/blog/comments/${commentId}/moderate`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ status })
    });
    return handleResponse<{ message: string }>(response);
  },

  getPendingComments: async () => {
    const token = authAPI.getToken();
    if (!token) {
      throw new Error('Authentication required. Please login as admin.');
    }
    
    const response = await fetch(`${API_BASE_URL}/blog/comments?status=pending`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    const result = await handleResponse<{ success: boolean; data: { comments: Comment[] } }>(response);
    return { comments: result.data?.comments || [] };
  }
};

// Reactions
export const reactionsAPI = {
  getReactions: async (articleId: number) => {
    const response = await fetch(`${API_BASE_URL}/blog/articles/${articleId}/reactions`);
    const result = await handleResponse<{ success: boolean; data: { reactions: { type: string; count: number }[] } }>(response);
    return { reactions: result.data?.reactions || [] };
  },

  toggleReaction: async (articleId: number, reactionType: string) => {
    const token = authAPI.getToken();
    const response = await fetch(`${API_BASE_URL}/blog/articles/${articleId}/reactions`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ reactionType })
    });
    return handleResponse<{ success: boolean; message: string }>(response);
  }
};

export const qrzAPI = {
  syncNow: async () => {
    const token = authAPI.getToken();
    const response = await fetch(`${API_BASE_URL}/qrz/sync`, {
      method: 'POST',
      headers: token ? { 'Authorization': `Bearer ${token}` } : undefined
    });
    const result = await handleResponse<{ success: boolean; message: string; data: any }>(response);
    return result.data;
  },

  getStatus: async () => {
    const response = await fetch(`${API_BASE_URL}/qrz/status`);
    const result = await handleResponse<{ success: boolean; data: any }>(response);
    return result.data;
  },

  getLogs: async () => {
    const response = await fetch(`${API_BASE_URL}/qrz/logs`);
    const result = await handleResponse<{ success: boolean; data: { count: number; logs: any[] } }>(response);
    return result.data;
  },

  getEmbedCode: async () => {
    const response = await fetch(`${API_BASE_URL}/qrz/map/embed-code`);
    const result = await handleResponse<{ success: boolean; data: { iframe: string } }>(response);
    return result.data.iframe;
  },

  getMapEmbedUrl: () => `${API_BASE_URL}/qrz/map/embed`
};
