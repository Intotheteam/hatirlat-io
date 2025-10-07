import type { IMemberRepository } from "@/core/domain/repositories/IMemberRepository"
import type { Member } from "@/core/domain/entities/member"
// import { apiService } from '../api/apiService';

// --- MOCK IMPLEMENTATION ---
// API'niz hazır olana kadar bu sahte veriler kullanılacaktır.
const mockMembers: Member[] = [
  {
    id: "1",
    name: "Alice Johnson",
    email: "alice@example.com",
    role: "Admin",
    status: "Active",
    joinedAt: new Date().toISOString(),
  },
  {
    id: "2",
    name: "Bob Williams",
    email: "bob@example.com",
    role: "Member",
    status: "Active",
    joinedAt: new Date().toISOString(),
  },
  {
    id: "3",
    name: "Charlie Brown",
    email: "charlie@example.com",
    role: "Member",
    status: "Pending",
    joinedAt: new Date().toISOString(),
  },
]

export class MemberRepository implements IMemberRepository {
  async getMembersByGroupId(groupId: string): Promise<Member[]> {
    console.log(`Fetching members for group ${groupId}...`)
    // Gerçek API çağrısı:
    // return apiService.get(`/groups/${groupId}/members`);
    await new Promise((resolve) => setTimeout(resolve, 500)) // Network gecikmesini simüle et
    return Promise.resolve([...mockMembers])
  }

  async addMemberToGroup(groupId: string, email: string): Promise<Member> {
    console.log(`Adding member ${email} to group ${groupId}...`)
    // Gerçek API çağrısı:
    // return apiService.post(`/groups/${groupId}/members`, { email });
    await new Promise((resolve) => setTimeout(resolve, 500))
    const newMember: Member = {
      id: Math.random().toString(36).substring(7),
      name: email.split("@")[0],
      email: email,
      role: "Member",
      status: "Pending",
      joinedAt: new Date().toISOString(),
    }
    mockMembers.push(newMember)
    return Promise.resolve(newMember)
  }

  async removeMemberFromGroup(groupId: string, memberId: string): Promise<void> {
    console.log(`Removing member ${memberId} from group ${groupId}...`)
    // Gerçek API çağrısı:
    // return apiService.delete(`/groups/${groupId}/members/${memberId}`);
    await new Promise((resolve) => setTimeout(resolve, 500))
    const index = mockMembers.findIndex((m) => m.id === memberId)
    if (index > -1) {
      mockMembers.splice(index, 1)
    }
    return Promise.resolve()
  }
}
