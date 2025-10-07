import type { Member } from "../entities/member"

export interface IMemberRepository {
  getMembersByGroupId(groupId: string): Promise<Member[]>
  addMemberToGroup(groupId: string, email: string): Promise<Member>
  removeMemberFromGroup(groupId: string, memberId: string): Promise<void>
}
