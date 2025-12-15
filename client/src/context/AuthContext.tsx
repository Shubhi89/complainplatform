import React, { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';
import type { User, AuthState } from '../types';

interface AuthContextType extends AuthState {
  checkAuth: () => Promise<void>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true,
    isAuthenticated: false,
  });

  const checkAuth = async () => {
    // 1. Check if we have a token saved in the browser
    const token = localStorage.getItem('token');

    // 2. If no token, we are definitely not logged in
    if (!token) {
      setState({
        user: null,
        loading: false,
        isAuthenticated: false,
      });
      return;
    }

    // 3. CRITICAL: Restore the token to Axios so the backend accepts us
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

    try {
      // 4. Verify with Backend
      // (Note: We use the /api/auth prefix which the proxy handles)
      const SX = await axios.get('/api/auth/current_user'); 
      
      setState({
        user: SX.data,
        isAuthenticated: !! SX.data,
        loading: false,
      });
    } catch (error) {
      console.error("Auth Check Failed:", error);
      // If the token is invalid (expired/wrong), clear it out
      localStorage.removeItem('token');
      delete axios.defaults.headers.common['Authorization'];
      
      setState({
        user: null,
        isAuthenticated: false,
        loading: false,
      });
    }
  };

  const logout = async () => {
    try {
      await axios.get('/api/auth/logout');
    } catch (error) {
      console.error("Logout error", error);
    }
    
    // Cleanup
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    window.location.href = '/login';
  };

  // Run this check immediately when the app starts
  useEffect(() => {
    checkAuth();
  }, []);

  const value = { ...state, checkAuth, logout };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};