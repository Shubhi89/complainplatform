import React, { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
import { AuthState } from "../types";

interface AuthContextType extends AuthState {
  checkAuth: () => Promise<void>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true,
    isAuthenticated: false,
  });

  const checkAuth = async () => {
    // 1. Retrieve token from storage
    const token = localStorage.getItem("token");

    // 2. If no token, user is not logged in
    if (!token) {
      setState({ user: null, loading: false, isAuthenticated: false });
      return;
    }

    // 3. Set the token for all Axios requests
    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

    try {
      // 4. Verify with backend
      const res = await axios.get("/api/auth/current_user");

      setState({
        user: res.data,
        isAuthenticated: !!res.data,
        loading: false,
      });
    } catch (error) {
      // If token is invalid, clear everything
      console.error("Session expired or invalid");
      localStorage.removeItem("token");
      delete axios.defaults.headers.common["Authorization"];

      setState({
        user: null,
        isAuthenticated: false,
        loading: false,
      });
    }
  };

  const logout = async () => {
    try {
      await axios.get("/api/auth/logout");
    } catch (e) {
      console.error(e);
    }
    localStorage.removeItem("token");
    delete axios.defaults.headers.common["Authorization"];
    window.location.href = "/login";
  };

  useEffect(() => {
    checkAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, checkAuth, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
