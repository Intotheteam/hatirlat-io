import type { Member } from "../entities/member"

export interface IMemberRepository {
  getMembersByGroupId(groupId: string): Promise<Member[]>
  addMemberToGroup(groupId: string, email: string, name?: string): Promise<Member>
  updateMember(groupId: string, memberId: string, data: Partial<Member>): Promise<Member>
  toggleMemberStatus(groupId: string, memberId: string): Promise<Member>
  removeMemberFromGroup(groupId: string, memberId: string): Promise<void>
  inviteMember(email: string, groupId: string): Promise<string>
}
