import React, { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { User, AuthState } from '../types';

// Define the shape of our Context
interface AuthContextType extends AuthState {
  checkAuth: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true,
    isAuthenticated: false,
  });

  // Function to check if user is logged in
  const checkAuth = async () => {
    try {
      // We will create this backend route endpoint in a moment if it doesn't exist
      const res = await axios.get('/api/auth/current_user'); 
      setState({
        user: res.data,
        isAuthenticated: !!res.data,
        loading: false,
      });
    } catch (error) {
      setState({
        user: null,
        isAuthenticated: false,
        loading: false,
      });
    }
  };

  // Function to logout
  const logout = async () => {
    await axios.get('/api/auth/logout');
    window.location.href = '/login'; // Hard refresh to clear everything
  };

  // Check auth on app start
  useEffect(() => {
    checkAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, checkAuth, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the context easily
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};