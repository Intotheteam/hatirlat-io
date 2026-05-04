// Top-up request API client (user-facing).
// Uses the same fetch convention as adminService.ts (sends auth cookie + JSON).

export type TopUpStatus = "PENDING" | "PAID" | "APPROVED" | "REJECTED" | "FAILED"

export interface TopUpRequestRecord {
  id: number
  userId: number
  username: string
  userEmail: string
  amount: number
  amountTry: string | null
  currency: string | null
  paymentMethod: string | null
  paymentReference: string | null
  paymentDone: boolean
  gatewayResponse: string | null
  status: TopUpStatus
  rejectionReason: string | null
  adminNote: string | null
  reviewedBy: string | null
  requestedAt: string
  approvedAt: string | null
}

export interface TopUpCreatePayload {
  amount: number
  amountTry?: number
  currency?: string
  paymentMethod?: string
  paymentReference?: string
  paymentDone?: boolean
}

async function req<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(path, {
    ...options,
    credentials: "include",
    headers: { "Content-Type": "application/json", ...options.headers },
  })
  if (!res.ok) {
    let text = res.statusText
    try {
      const errorJson = await res.json()
      if (errorJson.errorMessage) {
        text = errorJson.errorMessage
      } else if (errorJson.message) {
        text = errorJson.message
      } else {
        text = JSON.stringify(errorJson)
      }
    } catch (e) {
      text = await res.text().catch(() => res.statusText)
    }
    throw new Error(text)
  }
  if (res.status === 204) return null as T
  const json = await res.json()
  // Backend wraps in BaseResponse: { success, data, message }
  return (json.data ?? json) as T
}

export const topupService = {
  create: (payload: TopUpCreatePayload) =>
    req<TopUpRequestRecord>("/api/topup", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  mine: () => req<TopUpRequestRecord[]>("/api/topup"),

  markPaid: (id: number, paymentReference?: string) =>
    req<TopUpRequestRecord>(`/api/topup/${id}/mark-paid`, {
      method: "POST",
      body: JSON.stringify({ paymentReference: paymentReference ?? "" }),
    }),
}

// ── Admin endpoints (used by /admin/topup) ──────────────────────────────────

export interface PagedTopUp {
  content: TopUpRequestRecord[]
  totalElements: number
  totalPages: number
  number: number
  size: number
}

export const adminTopupService = {
  list: (page = 0, size = 20, status?: TopUpStatus) => {
    const params = new URLSearchParams({ page: String(page), size: String(size) })
    if (status) params.set("status", status)
    return req<PagedTopUp>(`/api/admin/topup?${params}`)
  },

  pendingCount: () => req<{ count: number }>("/api/admin/topup/pending-count"),

  approve: (id: number, body: { adminNote?: string; gatewayResponse?: string }) =>
    req<TopUpRequestRecord>(`/api/admin/topup/${id}/approve`, {
      method: "POST",
      body: JSON.stringify(body ?? {}),
    }),

  reject: (id: number, body: { rejectionReason: string; adminNote?: string; gatewayResponse?: string }) =>
    req<TopUpRequestRecord>(`/api/admin/topup/${id}/reject`, {
      method: "POST",
      body: JSON.stringify(body),
    }),
}
