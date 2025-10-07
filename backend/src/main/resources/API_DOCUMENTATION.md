# Hatirlat.io API Documentation

## Table of Contents
- [Overview](#overview)
- [Base URL](#base-url)
- [Authentication](#authentication)
- [Data Models](#data-models)
- [API Endpoints](#api-endpoints)
  - [Reminders](#reminders)
  - [Groups](#groups)
  - [Members](#members)
- [Error Responses](#error-responses)
- [Response Format](#response-format)

## Overview

Hatirlat.io is a modern reminder application that allows users to create and manage personal and group reminders with multiple notification channels (email, SMS, WhatsApp). This document outlines the API endpoints and data structures for the backend implementation.

## Base URL

```
https://api.hatirlat.io/v1
```

## Authentication

All authenticated endpoints require a valid JWT token in the Authorization header:

```
Authorization: Bearer <jwt-token>
```

Some endpoints are public and do not require authentication.

## Data Models

### Reminder
```json
{
  "id": "string",
  "title": "string",
  "type": "personal" | "group",
  "message": "string",
  "dateTime": "string (ISO 8601)",
  "status": "scheduled" | "sent" | "paused" | "failed",
  "contact": {
    "name": "string",
    "phone": "string",
    "email": "string"
  },
  "group": {
    "id": "string",
    "name": "string"
  },
  "channels": ["email" | "sms" | "whatsapp"],
  "repeat": "none" | "hourly" | "daily" | "weekly" | "custom",
  "customRepeat": {
    "interval": "number",
    "frequency": "day" | "week" | "month",
    "daysOfWeek": ["mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun"]
  }
}
```

### Group
```json
{
  "id": "string",
  "name": "string",
  "description": "string (optional)",
  "memberCount": "number (optional)",
  "createdAt": "string (ISO 8601)"
}
```

### Member
```json
{
  "id": "string",
  "name": "string",
  "email": "string",
  "role": "Admin" | "Member",
  "status": "Active" | "Pending",
  "joinedAt": "string (ISO 8601)",
  "phone": "string (optional)",
  "lastActivity": "string (ISO 8601, optional)"
}
```

## API Endpoints

### Reminders

#### Get all reminders
- **Endpoint**: `GET /reminders`
- **Authentication**: Required
- **Description**: Retrieve all reminders for the authenticated user
- **Response**: Array of Reminder objects

Example request:
```
GET /reminders
Authorization: Bearer <jwt-token>
```

Example response:
```json
[
  {
    "id": "rem1",
    "title": "Quarterly Team Sync",
    "type": "group",
    "message": "Discuss Q3 goals and roadmap. Please come prepared with your updates.",
    "dateTime": "2024-09-30T10:00:00Z",
    "status": "scheduled",
    "contact": { "name": "", "phone": "", "email": "" },
    "group": { "id": "2", "name": "İş Arkadaşları" },
    "channels": ["email"],
    "repeat": "custom",
    "customRepeat": {
      "interval": 2,
      "frequency": "week",
      "daysOfWeek": ["fri"]
    }
  }
]
```

#### Create a reminder
- **Endpoint**: `POST /reminders`
- **Authentication**: Required
- **Description**: Create a new reminder
- **Request Body**: Reminder object (without ID)
- **Response**: Created Reminder object

Example request:
```
POST /reminders
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "title": "New Reminder",
  "type": "personal",
  "message": "Sample reminder message",
  "dateTime": "2024-10-01T09:00:00Z",
  "status": "scheduled",
  "contact": {
    "name": "John Doe",
    "phone": "+15551234567",
    "email": "john.doe@example.com"
  },
  "group": { "id": "", "name": "" },
  "channels": ["email", "sms"],
  "repeat": "none"
}
```

Example response:
```json
{
  "id": "rem5",
  "title": "New Reminder",
  "type": "personal",
  "message": "Sample reminder message",
  "dateTime": "2024-10-01T09:00:00Z",
  "status": "scheduled",
  "contact": {
    "name": "John Doe",
    "phone": "+15551234567",
    "email": "john.doe@example.com"
  },
  "group": { "id": "", "name": "" },
  "channels": ["email", "sms"],
  "repeat": "none"
}
```

#### Update a reminder
- **Endpoint**: `PUT /reminders/:id`
- **Authentication**: Required
- **Description**: Update an existing reminder
- **Request Body**: Partial or full Reminder object
- **Response**: Updated Reminder object

Example request:
```
PUT /reminders/<reminder-id>
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "status": "paused"
}
```

Example response:
```json
{
  "id": "<reminder-id>",
  "title": "Existing Reminder",
  "type": "personal",
  "message": "Updated reminder message",
  "dateTime": "2024-10-01T09:00:00Z",
  "status": "paused",
  "contact": {
    "name": "John Doe",
    "phone": "+15551234567",
    "email": "john.doe@example.com"
  },
  "group": { "id": "", "name": "" },
  "channels": ["email", "sms"],
  "repeat": "none"
}
```

#### Delete a reminder
- **Endpoint**: `DELETE /reminders/:id`
- **Authentication**: Required
- **Description**: Delete a reminder
- **Response**: 204 No Content

Example request:
```
DELETE /reminders/<reminder-id>
Authorization: Bearer <jwt-token>
```

Example response:
```
Status: 204 No Content
```

### Groups

#### Get all groups
- **Endpoint**: `GET /groups`
- **Authentication**: Required
- **Description**: Retrieve all groups for the authenticated user
- **Response**: Array of Group objects

Example request:
```
GET /groups
Authorization: Bearer <jwt-token>
```

Example response:
```json
[
  {
    "id": "1",
    "name": "Family",
    "description": "Family members for important reminders",
    "memberCount": 4,
    "createdAt": "2024-01-15T10:00:00Z"
  }
]
```

#### Create a group
- **Endpoint**: `POST /groups`
- **Authentication**: Required
- **Description**: Create a new group
- **Request Body**: Group object (without ID and createdAt)
- **Response**: Created Group object

Example request:
```
POST /groups
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "name": "New Group",
  "description": "A new group for notifications"
}
```

Example response:
```json
{
  "id": "3",
  "name": "New Group",
  "description": "A new group for notifications",
  "memberCount": 1,
  "createdAt": "2024-09-30T12:00:00Z"
}
```

### Members

#### Get group members
- **Endpoint**: `GET /groups/:groupId/members`
- **Authentication**: Required
- **Description**: Retrieve all members of a specific group
- **Response**: Array of Member objects

Example request:
```
GET /groups/<group-id>/members
Authorization: Bearer <jwt-token>
```

Example response:
```json
[
  {
    "id": "101",
    "name": "Ahmet Yılmaz",
    "email": "ahmet@example.com",
    "role": "Admin",
    "status": "Active",
    "joinedAt": "2024-01-15T10:00:00Z"
  }
]
```

## Error Responses

All error responses follow the format:

```json
{
  "error": "string",
  "message": "string",
  "statusCode": "number"
}
```

### Common Error Codes
- `400 Bad Request`: Invalid request parameters or payload
- `401 Unauthorized`: Missing or invalid authentication
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Resource not found
- `500 Internal Server Error`: Server error

### Example Error Response
```json
{
  "error": "Not Found",
  "message": "Reminder not found",
  "statusCode": 404
}
```

## Response Format

Success responses typically use the following format:

- `GET` requests return the resource or array of resources
- `POST` requests return the created resource with ID and any server-generated fields
- `PUT` requests return the updated resource
- `DELETE` requests return status code 204 (No Content) on success
- All responses use JSON format with UTF-8 encoding

## Additional Notes

- Date and time values use ISO 8601 format (YYYY-MM-DDTHH:mm:ss.sssZ)
- All string IDs are unique identifiers
- The API implements rate limiting to prevent abuse
- Requests should include appropriate headers for content type
- The API is designed to be RESTful with consistent endpoint patterns