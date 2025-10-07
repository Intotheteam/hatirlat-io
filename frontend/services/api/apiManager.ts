import { apiService } from "./apiService";
import type { Reminder, Group, Member } from "@/types";

export class ApiManager {
  // Reminder methods
  async getReminders(): Promise<Reminder[]> {
    return await apiService.get<Reminder[]>("/reminders");
  }

  async getReminderById(id: string): Promise<Reminder> {
    return await apiService.get<Reminder>(`/reminders/${id}`);
  }

  async createReminder(reminder: Omit<Reminder, "id">): Promise<Reminder> {
    return await apiService.post<Reminder>("/reminders", reminder);
  }

  async updateReminder(id: string, reminder: Partial<Reminder>): Promise<Reminder> {
    return await apiService.put<Reminder>(`/reminders/${id}`, reminder);
  }

  async deleteReminder(id: string): Promise<void> {
    await apiService.delete(`/reminders/${id}`);
  }

  // Group methods
  async getGroups(): Promise<Group[]> {
    return await apiService.get<Group[]>("/groups");
  }

  async getGroupById(id: string): Promise<Group> {
    return await apiService.get<Group>(`/groups/${id}`);
  }

  async createGroup(group: Omit<Group, "id">): Promise<Group> {
    return await apiService.post<Group>("/groups", group);
  }

  async updateGroup(id: string, group: Partial<Group>): Promise<Group> {
    return await apiService.put<Group>(`/groups/${id}`, group);
  }

  async deleteGroup(id: string): Promise<void> {
    await apiService.delete(`/groups/${id}`);
  }

  // Member methods
  async getGroupMembers(groupId: string): Promise<Member[]> {
    return await apiService.get<Member[]>(`/groups/${groupId}/members`);
  }

  async getMemberById(groupId: string, memberId: string): Promise<Member> {
    return await apiService.get<Member>(`/groups/${groupId}/members/${memberId}`);
  }

  async addMemberToGroup(groupId: string, member: Omit<Member, "id">): Promise<Member> {
    return await apiService.post<Member>(`/groups/${groupId}/members`, member);
  }

  async updateMember(groupId: string, memberId: string, member: Partial<Member>): Promise<Member> {
    return await apiService.put<Member>(`/groups/${groupId}/members/${memberId}`, member);
  }

  async removeMemberFromGroup(groupId: string, memberId: string): Promise<void> {
    await apiService.delete(`/groups/${groupId}/members/${memberId}`);
  }

  // Additional utility methods
  async searchReminders(query: string): Promise<Reminder[]> {
    return await apiService.get<Reminder[]>(`/reminders?q=${encodeURIComponent(query)}`);
  }
}

// Create a singleton instance
export const apiManager = new ApiManager();