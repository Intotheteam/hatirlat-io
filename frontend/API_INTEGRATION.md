# Hatirlat.io Frontend API Integration Documentation

## Overview

This documentation provides guidance on how to integrate the frontend with the Hatirlat.io backend API. All API calls should be made to the base URL defined in the `NEXT_PUBLIC_API_URL` environment variable.

## Authentication

All API endpoints (except for authentication endpoints) require a valid JWT token in the Authorization header:

```
Authorization: Bearer <jwt-token>
```

### Login
```typescript
// POST /api/auth/login
const credentials = {
  username: "string",
  password: "string"
};

const response = await apiService.post<AuthResponse>("/api/auth/login", credentials);
```

### Register
```typescript
// POST /api/auth/register
const userData = {
  username: "string",
  password: "string",
  email: "string"
};

const response = await apiService.post<User>(`/api/auth/register?username=${userData.username}&password=${userData.password}&email=${userData.email}`, {});
```

## Reminders API

### Get All Reminders
```typescript
// GET /api/reminders
const reminders = await apiManager.getReminders();
```

### Get Reminder by ID
```typescript
// GET /api/reminders/{id}
const reminder = await apiManager.getReminderById("reminder-id");
```

### Create Reminder
```typescript
// POST /api/reminders
const newReminder = await apiManager.createReminder({
  title: "Meeting Reminder",
  type: "personal",
  message: "Don't forget the meeting",
  dateTime: "2023-12-31T10:00:00",
  status: "scheduled",
  contact: {
    name: "John Doe",
    phone: "+1234567890",
    email: "john@example.com"
  },
  channels: ["email", "sms"],
  repeat: "none"
});
```

### Update Reminder
```typescript
// PUT /api/reminders/{id}
const updatedReminder = await apiManager.updateReminder("reminder-id", {
  title: "Updated Meeting Reminder",
  status: "paused"
});
```

### Delete Reminder
```typescript
// DELETE /api/reminders/{id}
await apiManager.deleteReminder("reminder-id");
```

### Update Reminder Status
```typescript
// PUT /api/reminders/{id}/status
const updatedReminder = await apiManager.updateReminderStatus("reminder-id", "sent");
```

## Groups API

### Get All Groups
```typescript
// GET /api/groups
const groups = await apiManager.getGroups();
```

### Get Group by ID
```typescript
// GET /api/groups/{id}
const group = await apiManager.getGroupById("group-id");
```

### Create Group
```typescript
// POST /api/groups
const newGroup = await apiManager.createGroup({
  name: "Team Alpha",
  description: "Alpha team members"
});
```

### Update Group
```typescript
// PUT /api/groups/{id}
const updatedGroup = await apiManager.updateGroup("group-id", {
  name: "Team Beta",
  description: "Beta team members"
});
```

### Delete Group
```typescript
// DELETE /api/groups/{id}
await apiManager.deleteGroup("group-id");
```

## Members API

### Get Group Members
```typescript
// GET /api/groups/{groupId}/members
const members = await apiManager.getGroupMembers("group-id");
```

### Add Member to Group
```typescript
// POST /api/groups/{groupId}/members
const newMember = await apiManager.addMemberToGroup("group-id", {
  name: "Jane Smith",
  email: "jane@example.com",
  role: "Member"
});
```

### Remove Member from Group
```typescript
// DELETE /api/groups/{groupId}/members/{memberId}
await apiManager.removeMemberFromGroup("group-id", "member-id");
```

## Contacts API

### Get All Contacts
```typescript
// GET /api/contacts
const contacts = await apiManager.getContacts();
```

### Get Contact by ID
```typescript
// GET /api/contacts/{id}
const contact = await apiManager.getContactById("contact-id");
```

### Create Contact
```typescript
// POST /api/contacts
const newContact = await apiManager.createContact({
  name: "Alice Johnson",
  phone: "+1987654321",
  email: "alice@example.com"
});
```

### Update Contact
```typescript
// PUT /api/contacts/{id}
const updatedContact = await apiManager.updateContact("contact-id", {
  name: "Alice Johnson",
  phone: "+1122334455"
});
```

### Delete Contact
```typescript
// DELETE /api/contacts/{id}
await apiManager.deleteContact("contact-id");
```

## Error Handling

All API errors are wrapped in an ApiError class. Handle errors appropriately:

```typescript
try {
  const reminders = await apiManager.getReminders();
} catch (error) {
  if (error instanceof ApiError) {
    console.error(`API Error ${error.status}: ${error.message}`);
    // Handle specific error cases
    if (error.status === 401) {
      // Unauthorized - redirect to login
    }
  } else {
    console.error("Unexpected error:", error);
  }
}
```

## Data Models

### Reminder
```typescript
interface Reminder {
  id: string;
  title: string;
  type: "personal" | "group";
  message: string;
  dateTime: string; // ISO 8601 format
  status: "scheduled" | "sent" | "paused" | "failed";
  contact: Contact;
  group: Group;
  channels: ("email" | "sms" | "whatsapp" | "push")[];
  repeat: "none" | "hourly" | "daily" | "weekly" | "custom";
  customRepeat?: CustomRepeatConfig;
}
```

### Group
```typescript
interface Group {
  id: string;
  name: string;
  description?: string;
  memberCount?: number;
  createdAt?: string; // ISO 8601 format
}
```

### Member
```typescript
interface Member {
  id: string;
  name: string;
  email: string;
  role: "Admin" | "Member";
  status: "Active" | "Pending";
  joinedAt: string; // ISO 8601 format
  phone?: string;
  lastActivity?: string; // ISO 8601 format
}
```

### Contact
```typescript
interface Contact {
  name: string;
  phone: string;
  email: string;
}
```

### CustomRepeatConfig
```typescript
interface CustomRepeatConfig {
  interval: number;
  frequency: "day" | "week" | "month";
  daysOfWeek?: ("mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun")[];
}
```

## Best Practices

1. **Always handle errors gracefully** - Show user-friendly error messages
2. **Show loading states** - Display spinners or loading indicators during API calls
3. **Use caching** - Cache data when appropriate to reduce API calls
4. **Implement proper authentication flow** - Redirect to login when unauthorized
5. **Handle network failures** - Retry failed requests or show offline states
6. **Validate data** - Validate inputs before sending to API
7. **Use TypeScript types** - Leverage strong typing for better developer experience
8. **Follow REST conventions** - Use appropriate HTTP methods and status codes

## Testing

Use the provided test scripts to verify API connectivity:

- **Windows**: Run `test-api.ps1`
- **Linux/Mac**: Run `test-api.sh`

These scripts will verify that the backend API is running and accessible.