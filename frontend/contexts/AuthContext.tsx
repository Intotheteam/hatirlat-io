"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { authService } from "@/services/auth/authService";
import { creditService } from "@/services/auth/creditService";
import type { User } from "@/types";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: { username: string; password: string }) => Promise<void>;
  register: (userData: { username: string; password: string; email: string }) => Promise<void>;
  logout: () => Promise<void>;
  updateCredits: (newCredits: number) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Restore non-sensitive user metadata from localStorage (token stays in HttpOnly cookie)
    const currentUser = authService.getCurrentUser();

    if (currentUser) {
      setUser(currentUser);
      setIsAuthenticated(true);

      // Fetch latest credit balance on load
      creditService.getBalance().then((balance) => {
        updateCredits(balance);
      }).catch(err => console.error("Could not fetch credits on load", err));
    }

    setIsLoading(false);
  }, []);

  const login = async (credentials: { username: string; password: string }) => {
    try {
      const response = await authService.login(credentials);
      setUser(response.user);
      setIsAuthenticated(true);
    } catch (error) {
      throw error;
    }
  };

  const register = async (userData: { username: string; password: string; email: string }) => {
    try {
      const response = await authService.register(userData);
      setUser(response.user);
      setIsAuthenticated(true);
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    // Call backend to blacklist token and clear HttpOnly cookie
    await authService.logout();
    setUser(null);
    setIsAuthenticated(false);
  };

  const updateCredits = (newCredits: number) => {
    setUser(prev => {
      if (!prev) return null;
      const updated = { ...prev, credits: newCredits };
      // Update non-sensitive user cache
      authService.setCurrentUser(updated);
      return updated;
    });
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, isLoading, login, register, logout, updateCredits }}>
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