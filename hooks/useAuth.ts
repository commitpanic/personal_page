"use client";

import { useState, useEffect } from 'react';
import { authAPI } from '@/services/api';

export function useAuth() {
  const [user, setUser] = useState<{ id: number; username: string; email: string; role: 'user' | 'admin' } | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const checkAuth = () => {
    if (typeof window !== 'undefined') {
      const currentUser = authAPI.getUser();
      const hasToken = authAPI.isAuthenticated();
      console.log('useAuth checkAuth:', { currentUser, hasToken });
      setUser(currentUser);
      setIsAuthenticated(hasToken);
    }
  };

  useEffect(() => {
    // Check auth on mount
    checkAuth();

    // Listen for storage changes (for multi-tab sync)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'user' || e.key === 'auth_token') {
        checkAuth();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Custom event for same-tab updates
    const handleAuthChange = () => {
      console.log('auth-changed event received');
      checkAuth();
    };
    
    window.addEventListener('auth-changed', handleAuthChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('auth-changed', handleAuthChange);
    };
  }, []);

  return {
    user,
    isAuthenticated,
    username: user?.username || 'visitor',
    isAdmin: user?.role === 'admin',
    refreshAuth: checkAuth
  };
}
