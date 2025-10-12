import { ApiError } from "./apiError"
import type { Group } from "@/core/domain/entities/group"
import type { Member } from "@/core/domain/entities/member"
import type { Reminder } from "@/types"
import { authService } from "../auth/authService"

// --- API CONFIGURATION ---
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"

// Add authentication token to requests if available
function getAuthHeaders(): HeadersInit {
  const token = authService.getToken()
  return token ? { "Authorization": `Bearer ${token}` } : {}
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`
  
  // Add authentication headers for all requests except login/register
  const authHeaders = getAuthHeaders()
  
  const config: RequestInit = {
    ...options,
    headers: { 
      "Content-Type": "application/json", 
      ...authHeaders,
      ...options.headers 
    },
  }

  try {
    const response = await fetch(url, config)
    
    // Handle 204 No Content responses
    if (response.status === 204) {
      return null as T
    }
    
    // Handle error responses
    if (!response.ok) {
      let errorMessage = `Request failed with status ${response.status}`
      
      try {
        const errorData = await response.json()
        errorMessage = errorData.message || errorData.error || errorMessage
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
  get: (endpoint: string, options?: RequestInit) => request(endpoint, { ...options, method: "GET" }),
  post: (endpoint: string, body: any, options?: RequestInit) =>
    request(endpoint, { ...options, method: "POST", body: JSON.stringify(body) }),
  put: (endpoint: string, body: any, options?: RequestInit) =>
    request(endpoint, { ...options, method: "PUT", body: JSON.stringify(body) }),
  delete: (endpoint: string, options?: RequestInit) => request(endpoint, { ...options, method: "DELETE" }),
}