export interface Member {
  id: string
  name: string
  email: string
  role: "ADMIN" | "MEMBER"
  status: "ACTIVE" | "PENDING" | "INACTIVE"
  joinedAt: string
  phone?: string
  lastActivity?: string
}
