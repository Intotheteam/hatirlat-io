import { apiService } from "@/services/api/apiService";
import type { AuthRequest, AuthResponse, User } from "@/types";

class AuthService {
  private tokenKey = "authToken";
  private refreshTokenKey = "refreshToken";
  private userKey = "currentUser";

  async login(credentials: AuthRequest): Promise<AuthResponse> {
    try {
      const response = await apiService.post<{ success: boolean; data: AuthResponse }>("/api/auth/login", credentials);
      const authData = response.data;

      if (authData.token) {
        this.setToken(authData.token);
      }
      if (authData.refreshToken) {
        this.setRefreshToken(authData.refreshToken);
      }
      if (authData.user) {
        this.setCurrentUser(authData.user);
      }

      return authData;
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    }
  }

  async register(userData: { username: string; password: string; email: string }): Promise<AuthResponse> {
    try {
      const response = await apiService.post<{ success: boolean; data: AuthResponse }>("/api/auth/register", userData);
      const authData = response.data;

      if (authData.token) {
        this.setToken(authData.token);
      }
      if (authData.refreshToken) {
        this.setRefreshToken(authData.refreshToken);
      }
      if (authData.user) {
        this.setCurrentUser(authData.user);
      }

      return authData;
    } catch (error) {
      console.error("Registration failed:", error);
      throw error;
    }
  }

  logout(): void {
    // Clear stored tokens and user data
    this.removeToken();
    this.removeRefreshToken();
    this.removeCurrentUser();
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  getToken(): string | null {
    if (typeof window !== "undefined") {
      return localStorage.getItem(this.tokenKey);
    }
    return null;
  }

  getRefreshToken(): string | null {
    if (typeof window !== "undefined") {
      return localStorage.getItem(this.refreshTokenKey);
    }
    return null;
  }

  getCurrentUser(): User | null {
    if (typeof window !== "undefined") {
      const userData = localStorage.getItem(this.userKey);
      return userData ? JSON.parse(userData) : null;
    }
    return null;
  }

  setToken(token: string): void {
    if (typeof window !== "undefined") {
      localStorage.setItem(this.tokenKey, token);
    }
  }

  setRefreshToken(token: string): void {
    if (typeof window !== "undefined") {
      localStorage.setItem(this.refreshTokenKey, token);
    }
  }

  setCurrentUser(user: User): void {
    if (typeof window !== "undefined") {
      localStorage.setItem(this.userKey, JSON.stringify(user));
    }
  }

  removeToken(): void {
    if (typeof window !== "undefined") {
      localStorage.removeItem(this.tokenKey);
    }
  }

  removeRefreshToken(): void {
    if (typeof window !== "undefined") {
      localStorage.removeItem(this.refreshTokenKey);
    }
  }

  removeCurrentUser(): void {
    if (typeof window !== "undefined") {
      localStorage.removeItem(this.userKey);
    }
  }
}

export const authService = new AuthService();