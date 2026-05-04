export interface PagedMembers {
  content: AdminMemberRecord[]
  totalElements: number
  totalPages: number
  number: number
  size: number
}

export interface GroupInfo {
  id: number
  name: string
  ownerUsername: string | null
  memberCount: number
}

export interface AdminMemberRecord {
  id: number
  name: string
  email: string | null
  phone: string | null
  role: string | null
  status: string | null
  joinedAt: string
  lastActivity: string | null
  groups: GroupInfo[]
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
      const j = await res.json()
      text = j.errorMessage || j.message || JSON.stringify(j)
    } catch {
      text = await res.text().catch(() => res.statusText)
    }
    throw new Error(`Admin API error ${res.status}: ${text}`)
  }
  if (res.status === 204) return null as T
  const json = await res.json()
  return (json.data ?? json) as T
}

export const adminMemberService = {
  list: (page = 0, size = 20) => {
    const params = new URLSearchParams({ page: String(page), size: String(size) })
    return req<PagedMembers>(`/api/admin/members?${params}`)
  },
}
