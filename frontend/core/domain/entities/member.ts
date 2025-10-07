export interface Member {
  id: string
  name: string
  email: string
  role: "Admin" | "Member"
  status: "Active" | "Pending"
  joinedAt: string
  phone?: string
  lastActivity?: string
}
