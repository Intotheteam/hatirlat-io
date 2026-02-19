import type { IMemberRepository } from "@/core/domain/repositories/IMemberRepository"
import type { Member } from "@/core/domain/entities/member"
import { apiService } from "@/services/api/apiService"

export class MemberRepository implements IMemberRepository {
  async getMembersByGroupId(groupId: string): Promise<Member[]> {
    const response = await apiService.get<{ success: boolean; data: Member[] }>(
      `/api/groups/${groupId}/members`
    )
    return response.data || []
  }

  async addMemberToGroup(groupId: string, email: string, name?: string): Promise<Member> {
    const response = await apiService.post<{ success: boolean; data: Member }>(
      `/api/groups/${groupId}/members`,
      {
        name: name || email.split("@")[0],
        email,
        role: "MEMBER",
      }
    )
    return response.data
  }

  async updateMember(groupId: string, memberId: string, data: Partial<Member>): Promise<Member> {
    const response = await apiService.put<{ success: boolean; data: Member }>(
      `/api/groups/${groupId}/members/${memberId}`,
      data
    )
    return response.data
  }

  async removeMemberFromGroup(groupId: string, memberId: string): Promise<void> {
    await apiService.delete(`/api/groups/${groupId}/members/${memberId}`)
  }

  async inviteMember(email: string, groupId: string): Promise<string> {
    const response = await apiService.post<{ success: boolean; data: string }>(
      "/api/members/invite",
      { email, groupId }
    )
    return response.data
  }
}
