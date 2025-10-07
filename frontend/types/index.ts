export type ReminderStatus = "scheduled" | "sent" | "paused" | "failed"
export type ReminderType = "personal" | "group"
export type Channel = "email" | "sms" | "whatsapp" | "push"

export interface Contact {
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
  contact: Contact
  group: Group
  channels: Channel[]
  channel?: Channel // For backward compatibility
  repeat: "none" | "hourly" | "daily" | "weekly" | "custom"
  customRepeat?: CustomRepeatConfig
}

export type View = "dashboard" | "schedule-form" | "groups" | "manage-members" | "schedules"
