import { ApiError } from "./apiError"
import type { Group } from "@/core/domain/entities/group"
import type { Member } from "@/core/domain/entities/member"
import type { Reminder } from "@/types"

// --- DUMMY DATA MODE ---
const DUMMY_MODE = !process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_URL === "https://api.hatirlat.io/v1"
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.hatirlat.io/v1"

// --- DUMMY DATA STORE ---
const dummyGroups: Group[] = [
  {
    id: "1",
    name: "Aile Grubu",
    description: "Aile üyeleri için önemli hatırlatmalar",
    memberCount: 3,
    createdAt: new Date().toISOString(),
  },
  {
    id: "2",
    name: "İş Arkadaşları",
    description: "Proje teslim tarihleri ve toplantılar",
    memberCount: 2,
    createdAt: new Date().toISOString(),
  },
]

const dummyMembers: { [groupId: string]: Member[] } = {
  "1": [
    {
      id: "101",
      name: "Ahmet Yılmaz",
      email: "ahmet@example.com",
      role: "Admin",
      status: "Active",
      joinedAt: new Date().toISOString(),
    },
    {
      id: "102",
      name: "Ayşe Kaya",
      email: "ayse@example.com",
      role: "Member",
      status: "Active",
      joinedAt: new Date().toISOString(),
    },
  ],
  "2": [
    {
      id: "201",
      name: "Mehmet Çelik",
      email: "mehmet@example.com",
      role: "Admin",
      status: "Active",
      joinedAt: new Date().toISOString(),
    },
  ],
}

let dummyReminders: Reminder[] = [
  {
    id: "rem1",
    title: "Quarterly Team Sync",
    type: "group",
    message: "Discuss Q3 goals and roadmap. Please come prepared with your updates.",
    dateTime: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), // 2 hours from now
    status: "scheduled",
    contact: { name: "", phone: "", email: "" },
    group: { id: "2", name: "İş Arkadaşları" },
    channels: ["email"],
    repeat: "custom",
    customRepeat: {
      interval: 2,
      frequency: "week",
      daysOfWeek: ["fri"],
    },
  },
  {
    id: "rem2",
    title: "Doctor's Appointment",
    type: "personal",
    message: "Annual check-up with Dr. Smith.",
    dateTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // tomorrow
    status: "scheduled",
    contact: { name: "John Doe", phone: "+15551234567", email: "john.d@example.com" },
    group: { id: "", name: "" },
    channels: ["sms", "email"],
    repeat: "none",
  },
  {
    id: "rem3",
    title: "Pay Electricity Bill",
    type: "personal",
    message: "Final day to pay the electricity bill to avoid late fees.",
    dateTime: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // yesterday
    status: "sent",
    contact: { name: "Self", phone: "", email: "my.email@example.com" },
    group: { id: "", name: "" },
    channels: ["email"],
    repeat: "none",
  },
  {
    id: "rem4",
    title: "Family Dinner",
    type: "group",
    message: "Don't forget our weekly family dinner at 7 PM tonight!",
    dateTime: new Date(Date.now() + 5 * 60 * 60 * 1000).toISOString(), // 5 hours from now
    status: "paused",
    contact: { name: "", phone: "", email: "" },
    group: { id: "1", name: "Aile Grubu" },
    channels: ["whatsapp"],
    repeat: "weekly",
  },
]
// --- END DUMMY DATA ---

async function handleDummyRequest(endpoint: string, options: RequestInit = {}): Promise<any> {
  await new Promise((resolve) => setTimeout(resolve, Math.random() * 500 + 100))
  const method = options.method || "GET"
  const body = options.body ? JSON.parse(options.body as string) : {}
  console.log(`[DUMMY API] ${method} ${endpoint}`, body)

  // Reminder Endpoints
  if (endpoint === "/reminders" && method === "GET") {
    return [...dummyReminders].sort((a, b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime())
  }
  if (endpoint === "/reminders" && method === "POST") {
    const newReminder: Reminder = { ...body, id: `rem_${Date.now()}`, status: "scheduled" }
    dummyReminders.push(newReminder)
    return newReminder
  }
  const reminderDetailMatch = endpoint.match(/^\/reminders\/(\w+)$/)
  if (reminderDetailMatch && method === "PUT") {
    const reminderId = reminderDetailMatch[1]
    const index = dummyReminders.findIndex((r) => r.id === reminderId)
    if (index !== -1) {
      dummyReminders[index] = { ...dummyReminders[index], ...body }
      return dummyReminders[index]
    }
    throw new ApiError(404, "Reminder not found")
  }
  if (reminderDetailMatch && method === "DELETE") {
    const reminderId = reminderDetailMatch[1]
    dummyReminders = dummyReminders.filter((r) => r.id !== reminderId)
    return null
  }

  // Group & Member Endpoints
  if (endpoint === "/groups" && method === "GET") {
    return dummyGroups.map((g) => ({ ...g, memberCount: dummyMembers[g.id]?.length || 0 }))
  }
  const memberListMatch = endpoint.match(/^\/groups\/(\w+)\/members$/)
  if (memberListMatch && method === "GET") {
    return dummyMembers[memberListMatch[1]] || []
  }

  console.warn(`[DUMMY API] Unhandled request: ${method} ${endpoint}`)
  return null
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  if (DUMMY_MODE) {
    return handleDummyRequest(endpoint, options) as Promise<T>
  }

  const url = `${API_BASE_URL}${endpoint}`
  const config: RequestInit = {
    ...options,
    headers: { "Content-Type": "application/json", ...options.headers },
  }

  try {
    const response = await fetch(url, config)
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new ApiError(response.status, errorData.message || `Request failed with status ${response.status}`)
    }
    return response.status === 204 ? (null as T) : await response.json()
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
