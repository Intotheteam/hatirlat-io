# Hatirlat.io Frontend API Integration Guide

## Overview

This document describes how the frontend application integrates with the Hatirlat.io backend API. The integration uses JWT-based authentication and follows RESTful principles.

## Base URL Configuration

The API base URL is configurable through the `NEXT_PUBLIC_API_URL` environment variable. If not set, it defaults to `http://localhost:8080`.

## Authentication

All API requests (except for authentication endpoints) require a valid JWT token in the Authorization header:

```
Authorization: Bearer <jwt-token>
```

### Login
- **Endpoint**: `POST /api/auth/login`
- **Request Body**: 
  ```json
  {
    "username": "string",
    "password": "string"
  }
  ```
- **Response**: 
  ```json
  {
    "token": "string",
    "refreshToken": "string",
    "type": "Bearer",
    "expiresIn": "number",
    "user": {
      "id": "string",
      "username": "string",
      "email": "string",
      "role": "string"
    }
  }
  ```

### Register
- **Endpoint**: `POST /api/auth/register`
- **Query Parameters**: 
  - `username`: User's username
  - `password`: User's password
  - `email`: User's email
- **Response**: 
  ```json
  {
    "id": "string",
    "username": "string",
    "email": "string",
    "role": "string"
  }
  ```

### Get Current User
- **Endpoint**: `GET /api/auth/me`
- **Response**: 
  ```json
  {
    "id": "string",
    "username": "string",
    "email": "string",
    "role": "string"
  }
  ```

## Reminders API

### Get All Reminders
- **Endpoint**: `GET /api/reminders`
- **Response**: Array of Reminder objects

### Get Reminder by ID
- **Endpoint**: `GET /api/reminders/{id}`
- **Response**: Reminder object

### Create Reminder
- **Endpoint**: `POST /api/reminders`
- **Request Body**: Reminder object (without ID)
- **Response**: Created Reminder object

### Update Reminder
- **Endpoint**: `PUT /api/reminders/{id}`
- **Request Body**: Partial or full Reminder object
- **Response**: Updated Reminder object

### Delete Reminder
- **Endpoint**: `DELETE /api/reminders/{id}`
- **Response**: 204 No Content

### Update Reminder Status
- **Endpoint**: `PUT /api/reminders/{id}/status`
- **Request Body**: 
  ```json
  {
    "status": "string"
  }
  ```
- **Response**: Updated Reminder object

## Groups API

### Get All Groups
- **Endpoint**: `GET /api/groups`
- **Response**: Array of Group objects

### Get Group by ID
- **Endpoint**: `GET /api/groups/{id}`
- **Response**: Group object

### Create Group
- **Endpoint**: `POST /api/groups`
- **Request Body**: Group object (without ID)
- **Response**: Created Group object

### Update Group
- **Endpoint**: `PUT /api/groups/{id}`
- **Request Body**: Partial or full Group object
- **Response**: Updated Group object

### Delete Group
- **Endpoint**: `DELETE /api/groups/{id}`
- **Response**: 204 No Content

## Members API

### Get Group Members
- **Endpoint**: `GET /api/groups/{groupId}/members`
- **Response**: Array of Member objects

### Add Member to Group
- **Endpoint**: `POST /api/groups/{groupId}/members`
- **Request Body**: Member object (without ID)
- **Response**: Created Member object

### Remove Member from Group
- **Endpoint**: `DELETE /api/groups/{groupId}/members/{memberId}`
- **Response**: 204 No Content

### Invite Member
- **Endpoint**: `POST /api/members/invite`
- **Request Body**: 
  ```json
  {
    "email": "string",
    "groupId": "string"
  }
  ```
- **Response**: Success message

## Contacts API

### Get All Contacts
- **Endpoint**: `GET /api/contacts`
- **Response**: Array of Contact objects

### Get Contact by ID
- **Endpoint**: `GET /api/contacts/{id}`
- **Response**: Contact object

### Create Contact
- **Endpoint**: `POST /api/contacts`
- **Request Body**: Contact object (without ID)
- **Response**: Created Contact object

### Update Contact
- **Endpoint**: `PUT /api/contacts/{id}`
- **Request Body**: Partial or full Contact object
- **Response**: Updated Contact object

### Delete Contact
- **Endpoint**: `DELETE /api/contacts/{id}`
- **Response**: 204 No Content

## Error Handling

All API errors are wrapped in an ApiError class that extends the standard JavaScript Error class. The error includes:

- `status`: HTTP status code
- `message`: Human-readable error message

Common error responses:
- `400 Bad Request`: Invalid request parameters or payload
- `401 Unauthorized`: Missing or invalid authentication
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Resource not found
- `500 Internal Server Error`: Server error

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

## Authentication Flow

1. User submits login credentials
2. Frontend sends POST request to `/api/auth/login`
3. Backend validates credentials and returns JWT token
4. Frontend stores token in localStorage
5. For subsequent requests, frontend adds Authorization header with token
6. Backend validates token on each request
7. On logout, frontend clears token from localStorage

## Best Practices

1. Always handle API errors gracefully with user-friendly messages
2. Show loading states during API requests
3. Implement proper error boundaries for network failures
4. Use optimistic updates where appropriate for better UX
5. Cache data when possible to reduce API calls
6. Implement proper pagination for large datasets
7. Use TypeScript interfaces for type safety
8. Handle authentication tokens securely (localStorage is acceptable for this demo)