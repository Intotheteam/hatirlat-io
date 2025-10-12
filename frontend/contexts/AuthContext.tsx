"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { authService } from "@/services/auth/authService";
import type { User } from "@/types";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (credentials: { username: string; password: string }) => Promise<void>;
  register: (userData: { username: string; password: string; email: string }) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check if user is already authenticated on app load
    const token = authService.getToken();
    const currentUser = authService.getCurrentUser();
    
    if (token && currentUser) {
      setUser(currentUser);
      setIsAuthenticated(true);
    }
  }, []);

  const login = async (credentials: { username: string; password: string }) => {
    try {
      const response = await authService.login(credentials);
      setUser(response.user);
      setIsAuthenticated(true);
    } catch (error) {
      // Re-throw error to be handled by the calling component
      throw error;
    }
  };

  const register = async (userData: { username: string; password: string; email: string }) => {
    try {
      const user = await authService.register(userData);
      // After successful registration, the user needs to log in
    } catch (error) {
      // Re-throw error to be handled by the calling component
      throw error;
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}