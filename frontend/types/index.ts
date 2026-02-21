export type ReminderStatus = "scheduled" | "sent" | "paused" | "failed"
export type ReminderType = "personal" | "group"
export type Channel = "email" | "sms" | "whatsapp" | "push"

export interface Contact {
  id?: string
  name: string
  phone: string
  email: string
}

export interface Group {
  id: string
  name: string
  description?: string
  memberCount?: number
  createdAt?: string
  inviteCode?: string
}

export interface CustomRepeatConfig {
  interval: number
  frequency: "day" | "week" | "month"
  daysOfWeek?: ("mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun")[]
}

export interface Reminder {
  id: string
  title: string
  type: ReminderType
  message: string
  dateTime: string
  status: ReminderStatus
  contact?: Contact | null
  group?: Group | null
  channels: Channel[]
  channel?: Channel // For backward compatibility
  repeat: "none" | "hourly" | "daily" | "weekly" | "custom"
  customRepeat?: CustomRepeatConfig
}

export interface User {
  id: string
  username: string
  email: string
  role: string
  credits: number
}

export type TransactionType = "ADD" | "DEDUCT"

export interface CreditTransaction {
  id: number
  amount: number
  transactionType: TransactionType
  description: string
  createdAt: string
}

export interface AuthRequest {
  username: string
  password: string
}

export interface AuthResponse {
  token: string
  refreshToken: string
  type: string
  expiresIn: number
  user: User
}

export interface BaseResponse<T> {
  success: boolean
  data: T
  message?: string
}

export type { Member } from "@/core/domain/entities/member"

export type View = "dashboard" | "schedule-form" | "groups" | "manage-members" | "schedules"