const API_BASE = ""

async function req<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    credentials: "include", // send HttpOnly cookie automatically
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  })
  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText)
    throw new Error(`Admin API error ${res.status}: ${text}`)
  }
  if (res.status === 204) return null as T
  const json = await res.json()
  return (json.data ?? json) as T
}

// ─── Types ───────────────────────────────────────────────────────────────────

export interface AdminUser {
  id: string
  username: string
  email: string
  role: string
  banned: boolean
  banReason?: string
  createdAt: string
  updatedAt: string
  totalReminders: number
  activeReminders: number
  totalNotifications: number
  failedNotifications: number
}

export interface DashboardStats {
  totalUsers: number
  premiumUsers: number
  totalReminders: number
  activeReminders: number
  totalGroups: number
  todayStats?: {
    newUsersToday: number
    sentToday: number
    failedToday: number
    creditsConsumedToday: number
    smsCount: number
    emailCount: number
    whatsappCount: number
  }
  userGrowth7d: number
  reminderGrowth7d: number
  weeklyNotifications: number
  weeklyFailed: number
  last7Days: DayStats[]
}

export interface DayStats {
  date: string
  totalUsers: number
  newUsersToday: number
  sentToday: number
  failedToday: number
  smsCount: number
  emailCount: number
  whatsappCount: number
}

export interface AuditLog {
  id: string
  adminUsername: string
  action: string
  targetEntity: string
  targetId: string
  details: string
  ipAddress: string
  timestamp: string
}

export interface SystemConfig {
  id: string
  configKey: string
  configValue: string
  type: string
  encrypted: boolean
  active: boolean
  description: string
  createdAt: string
  updatedAt: string
}

export interface PagedResponse<T> {
  content: T[]
  totalElements: number
  totalPages: number
  number: number
  size: number
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

export const adminDashboard = {
  getStats: () => req<DashboardStats>("/api/admin/dashboard/stats"),
  recalculate: () => req<void>("/api/admin/dashboard/stats/recalculate", { method: "POST" }),
}

// ─── Users ────────────────────────────────────────────────────────────────────

export const adminUsers = {
  list: (page = 0, size = 20) =>
    req<PagedResponse<AdminUser>>(`/api/admin/users?page=${page}&size=${size}&sort=createdAt,desc`),

  search: (q: string) =>
    req<AdminUser[]>(`/api/admin/users/search?q=${encodeURIComponent(q)}`),

  get: (userId: string) =>
    req<AdminUser>(`/api/admin/users/${userId}`),

  ban: (userId: string, reason: string) =>
    req<void>("/api/admin/users/ban", {
      method: "POST",
      body: JSON.stringify({ userId, reason, banned: true }),
    }),

  unban: (userId: string) =>
    req<void>(`/api/admin/users/unban/${userId}`, { method: "POST" }),

  delete: (userId: string) =>
    req<void>(`/api/admin/users/${userId}`, { method: "DELETE" }),
}

// ─── Audit Logs ───────────────────────────────────────────────────────────────

export const adminAuditLogs = {
  list: (page = 0, size = 50) =>
    req<PagedResponse<AuditLog>>(`/api/admin/audit-logs?page=${page}&size=${size}`),

  recent: () =>
    req<AuditLog[]>("/api/admin/audit-logs/recent"),

  byAction: (action: string, page = 0) =>
    req<PagedResponse<AuditLog>>(`/api/admin/audit-logs/action/${encodeURIComponent(action)}?page=${page}`),

  actionStats: () =>
    req<Record<string, number>>("/api/admin/audit-logs/stats/actions"),
}

// ─── Billing ─────────────────────────────────────────────────────────────────

export interface ProviderStats {
  provider: string
  displayName: string
  channel: string
  totalRequests: number
  successCount: number
  failedCount: number
  disabledCount: number
  successRate: number
  totalCost: string
  currency: string
  avgDurationMs: number
}

export interface DailyBillingStats {
  date: string
  provider: string
  count: number
  cost: string
}

export interface BillingOverview {
  totalRequests: number
  totalSuccessful: number
  totalFailed: number
  totalCostTry: string
  totalCostUsd: string
  monthCostTry: string
  monthCostUsd: string
  providers: ProviderStats[]
  dailyStats: DailyBillingStats[]
}

export interface IntegrationLog {
  id: number
  provider: string
  channel: string
  status: string
  costAmount: string
  costCurrency: string
  userId: number | null
  reminderId: number | null
  recipientMasked: string
  errorCode: string | null
  errorMessage: string | null
  durationMs: number | null
  providerMessageId: string | null
  createdAt: string
}

export const adminBilling = {
  overview: () =>
    req<BillingOverview>("/api/admin/billing/overview"),

  providers: () =>
    req<ProviderStats[]>("/api/admin/billing/providers"),

  logs: (page = 0, size = 50, provider?: string, status?: string) => {
    const params = new URLSearchParams({ page: String(page), size: String(size) })
    if (provider) params.set("provider", provider)
    if (status) params.set("status", status)
    return req<PagedResponse<IntegrationLog>>(`/api/admin/billing/logs?${params}`)
  },
}

// ─── System Config ────────────────────────────────────────────────────────────

export const adminConfig = {
  list: () => req<SystemConfig[]>("/api/admin/config"),

  get: (key: string) => req<SystemConfig>(`/api/admin/config/${encodeURIComponent(key)}`),

  byPrefix: (prefix: string) =>
    req<SystemConfig[]>(`/api/admin/config/prefix/${encodeURIComponent(prefix)}`),

  set: (payload: { configKey: string; configValue: string; type: string; encrypted?: boolean; active?: boolean; description?: string }) =>
    req<SystemConfig>("/api/admin/config", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  bulkSet: (configs: Array<{ configKey: string; configValue: string; type: string; encrypted?: boolean; active?: boolean; description?: string }>) =>
    req<number>("/api/admin/config/bulk", {
      method: "POST",
      body: JSON.stringify(configs),
    }),

  toggleFeature: (key: string, enabled: boolean) =>
    req<void>(`/api/admin/config/feature/${encodeURIComponent(key)}/toggle?enabled=${enabled}`, { method: "POST" }),

  delete: (key: string) =>
    req<void>(`/api/admin/config/${encodeURIComponent(key)}`, { method: "DELETE" }),
}
