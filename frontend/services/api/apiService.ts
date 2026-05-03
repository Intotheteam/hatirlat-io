import { ApiError } from "./apiError"
import type { Group } from "@/core/domain/entities/group"
import type { Member } from "@/core/domain/entities/member"
import type { Reminder } from "@/types"
import { authService } from "../auth/authService"

// --- API CONFIGURATION ---
// Use empty string to leverage Next.js proxy rewrites (next.config.mjs)
// Requests go to localhost:3000/api/... -> proxied to localhost:8080/api/...
// This avoids CORS issues entirely since browser sees same-origin requests
const API_BASE_URL = ""

// Add authentication token to requests if available
// NOTE: Token is now stored as an HttpOnly cookie — browser sends it automatically.
// No Authorization header needed for same-origin requests.

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`

  // Add authentication headers for all requests except login/register
  const config: RequestInit = {
    ...options,
    credentials: "include", // HttpOnly cookie is sent automatically
    headers: {
      "Content-Type": "application/json",
      ...options.headers
    },
  }

  try {
    const response = await fetch(url, config)

    // Handle 204 No Content responses
    if (response.status === 204) {
      return null as T
    }

    // Handle 401 Unauthorized - redirect to login (skip for auth endpoints)
    if (response.status === 401 && !endpoint.startsWith("/api/auth/")) {
      authService.logout() // fire-and-forget async
      if (typeof window !== "undefined") {
        window.location.href = "/login"
      }
      throw new ApiError(401, "Session expired. Please log in again.")
    }

    // Handle error responses
    if (!response.ok) {
      let errorMessage = `Request failed with status ${response.status}`

      try {
        const errorData = await response.json()
        if (errorData.validationErrors && Array.isArray(errorData.validationErrors)) {
          errorMessage = errorData.validationErrors
            .map((e: { field: string; message: string }) => `${e.field}: ${e.message}`)
            .join(", ")
        } else {
          errorMessage = errorData.message || errorData.error || errorMessage
        }
      } catch (e) {
        // If we can't parse the error response, use the status text
        errorMessage = response.statusText || errorMessage
      }

      throw new ApiError(response.status, errorMessage)
    }

    // Parse successful responses
    return await response.json()
  } catch (error) {
    if (error instanceof ApiError) throw error
    console.error("Network or other error:", error)
    throw new Error("A network error occurred. Please try again.")
  }
}

export const apiService = {
  get: <T>(endpoint: string, options?: RequestInit) => request<T>(endpoint, { ...options, method: "GET" }),
  post: <T>(endpoint: string, body: any, options?: RequestInit) =>
    request<T>(endpoint, { ...options, method: "POST", body: JSON.stringify(body) }),
  put: <T>(endpoint: string, body: any, options?: RequestInit) =>
    request<T>(endpoint, { ...options, method: "PUT", body: JSON.stringify(body) }),
  patch: <T>(endpoint: string, body?: any, options?: RequestInit) =>
    request<T>(endpoint, { ...options, method: "PATCH", body: body ? JSON.stringify(body) : undefined }),
  delete: <T>(endpoint: string, options?: RequestInit) => request<T>(endpoint, { ...options, method: "DELETE" }),
}