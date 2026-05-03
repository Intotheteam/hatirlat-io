import type { AuthRequest, AuthResponse, User } from "@/types";

/**
 * AuthService — Secure Auth Layer for the Next.js Web Frontend.
 *
 * SECURITY:
 * - JWT tokens are stored ONLY as HttpOnly cookies (set by the backend).
 * - This file NO LONGER uses localStorage for tokens.
 * - Non-sensitive user metadata (username, role, email) is kept in localStorage
 *   only to avoid an extra API round-trip on page load. Sensitive tokens stay in cookies.
 * - The browser automatically includes the cookie on every request to the same origin
 *   (handled transparently by the browser's cookie jar).
 */
class AuthService {
  private userKey = "currentUser";

  async login(credentials: AuthRequest): Promise<AuthResponse> {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      // credentials: "include" ensures the browser sends/stores cookies
      credentials: "include",
      body: JSON.stringify(credentials),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err?.message || `Login failed: ${res.status}`);
    }

    const json = await res.json();
    const authData: AuthResponse = json.data ?? json;

    // Store only non-sensitive user metadata in localStorage
    if (authData.user) {
      this.setCurrentUser(authData.user);
    }

    // NOTE: token is NOT stored here. Backend sets it as an HttpOnly cookie.
    return authData;
  }

  async register(userData: { username: string; password: string; email: string }): Promise<AuthResponse> {
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(userData),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err?.message || `Registration failed: ${res.status}`);
    }

    const json = await res.json();
    const authData: AuthResponse = json.data ?? json;

    if (authData.user) {
      this.setCurrentUser(authData.user);
    }

    return authData;
  }

  async logout(): Promise<void> {
    try {
      // Tell the backend to blacklist the token & clear the HttpOnly cookie
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch {
      // Proceed with client-side cleanup even if backend call fails
    } finally {
      this.removeCurrentUser();
    }
  }

  // ─── Token ─────────────────────────────────────────────────────────────────
  // getToken() is kept for backward compat (e.g., admin service calling it).
  // It now returns null because the token is in an HttpOnly cookie.
  // The backend reads the cookie automatically; no explicit header needed.
  getToken(): string | null {
    return null;
  }

  // ─── User Metadata ─────────────────────────────────────────────────────────
  getCurrentUser(): User | null {
    if (typeof window !== "undefined") {
      const userData = localStorage.getItem(this.userKey);
      return userData ? JSON.parse(userData) : null;
    }
    return null;
  }

  setCurrentUser(user: User): void {
    if (typeof window !== "undefined") {
      localStorage.setItem(this.userKey, JSON.stringify(user));
    }
  }

  removeCurrentUser(): void {
    if (typeof window !== "undefined") {
      localStorage.removeItem(this.userKey);
    }
  }

  isAuthenticated(): boolean {
    // Check if we have cached user metadata (non-sensitive)
    return !!this.getCurrentUser();
  }

  // Legacy shims — kept to avoid breaking other call sites
  setToken(_token: string): void { /* no-op: token is an HttpOnly cookie */ }
  setRefreshToken(_token: string): void { /* no-op */ }
  getRefreshToken(): string | null { return null; }
  removeToken(): void { /* no-op */ }
  removeRefreshToken(): void { /* no-op */ }
}

export const authService = new AuthService();