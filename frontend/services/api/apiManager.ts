import { apiService } from "@/services/api/apiService";
import type { Reminder, Group, Member, Contact } from "@/types";

export class ApiManager {
  // Reminder methods
  async getReminders(): Promise<Reminder[]> {
    const response = await apiService.get<{ success: boolean; data: Reminder[] }>("/api/reminders");
    return response.data || [];
  }

  async getReminderById(id: string): Promise<Reminder> {
    const response = await apiService.get<{ success: boolean; data: Reminder }>(`/api/reminders/${id}`);
    return response.data;
  }

  async createReminder(reminder: Omit<Reminder, "id">): Promise<Reminder> {
    const response = await apiService.post<{ success: boolean; data: Reminder }>("/api/reminders", reminder);
    return response.data;
  }

  async updateReminder(id: string, reminder: Partial<Reminder>): Promise<Reminder> {
    const response = await apiService.put<{ success: boolean; data: Reminder }>(`/api/reminders/${id}`, reminder);
    return response.data;
  }

  async deleteReminder(id: string): Promise<void> {
    await apiService.delete(`/api/reminders/${id}`);
  }

  async updateReminderStatus(id: string, status: string): Promise<Reminder> {
    const response = await apiService.put<{ success: boolean; data: Reminder }>(`/api/reminders/${id}/status`, { status });
    return response.data;
  }

  // Group methods
  async getGroups(): Promise<Group[]> {
    const response = await apiService.get<{ success: boolean; data: Group[] }>("/api/groups");
    return response.data || [];
  }

  async getGroupById(id: string): Promise<Group> {
    const response = await apiService.get<{ success: boolean; data: Group }>(`/api/groups/${id}`);
    return response.data;
  }

  async createGroup(group: Omit<Group, "id">): Promise<Group> {
    const response = await apiService.post<{ success: boolean; data: Group }>("/api/groups", group);
    return response.data;
  }

  async updateGroup(id: string, group: Partial<Group>): Promise<Group> {
    const response = await apiService.put<{ success: boolean; data: Group }>(`/api/groups/${id}`, group);
    return response.data;
  }

  async deleteGroup(id: string): Promise<void> {
    await apiService.delete(`/api/groups/${id}`);
  }

  // Member methods
  async getGroupMembers(groupId: string): Promise<Member[]> {
    const response = await apiService.get<{ success: boolean; data: Member[] }>(`/api/groups/${groupId}/members`);
    return response.data || [];
  }

  async getMemberById(groupId: string, memberId: string): Promise<Member> {
    const response = await apiService.get<{ success: boolean; data: Member }>(`/api/groups/${groupId}/members/${memberId}`);
    return response.data;
  }

  async addMemberToGroup(groupId: string, member: Omit<Member, "id">): Promise<Member> {
    const response = await apiService.post<{ success: boolean; data: Member }>(`/api/groups/${groupId}/members`, member);
    return response.data;
  }

  async updateMember(groupId: string, memberId: string, member: Partial<Member>): Promise<Member> {
    const response = await apiService.put<{ success: boolean; data: Member }>(`/api/groups/${groupId}/members/${memberId}`, member);
    return response.data;
  }

  async removeMemberFromGroup(groupId: string, memberId: string): Promise<void> {
    await apiService.delete(`/api/groups/${groupId}/members/${memberId}`);
  }

  // Contact methods
  async getContacts(): Promise<Contact[]> {
    const response = await apiService.get<{ success: boolean; data: Contact[] }>("/api/contacts");
    return response.data || [];
  }

  async getContactById(id: string): Promise<Contact> {
    const response = await apiService.get<{ success: boolean; data: Contact }>(`/api/contacts/${id}`);
    return response.data;
  }

  async createContact(contact: Omit<Contact, "id">): Promise<Contact> {
    const response = await apiService.post<{ success: boolean; data: Contact }>("/api/contacts", contact);
    return response.data;
  }

  async updateContact(id: string, contact: Partial<Contact>): Promise<Contact> {
    const response = await apiService.put<{ success: boolean; data: Contact }>(`/api/contacts/${id}`, contact);
    return response.data;
  }

  async deleteContact(id: string): Promise<void> {
    await apiService.delete(`/api/contacts/${id}`);
  }

  // Additional utility methods
  async searchReminders(query: string): Promise<Reminder[]> {
    const response = await apiService.get<{ success: boolean; data: Reminder[] }>(`/api/reminders?q=${encodeURIComponent(query)}`);
    return response.data || [];
  }
}

// Create a singleton instance
export const apiManager = new ApiManager();