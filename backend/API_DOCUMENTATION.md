# Hatirlat.io Backend API Documentation

## Overview

This document provides information about the Hatirlat.io backend REST API.

## Base URL

```
http://localhost:8080/api
```

## Authentication

All API endpoints (except for authentication endpoints) require a valid JWT token in the Authorization header:

```
Authorization: Bearer <jwt-token>
```

### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "username": "string",
  "password": "string"
}
```

Response:
```json
{
  "token": "string",
  "refreshToken": "string",
  "type": "Bearer",
  "expiresIn": 86400,
  "user": {
    "id": "string",
    "username": "string",
    "email": "string",
    "role": "string"
  }
}
```

### Register
```http
POST /api/auth/register
Content-Type: application/json

{
  "username": "string",
  "password": "string",
  "email": "string"
}
```

Response:
```json
{
  "id": "string",
  "username": "string",
  "email": "string",
  "role": "USER",
  "enabled": true,
  "premium": false
}
```

## Reminders

### Get All Reminders
```http
GET /api/reminders
Authorization: Bearer <jwt-token>
```

Response:
```json
{
  "success": true,
  "data": [
    {
      "id": "string",
      "title": "string",
      "type": "personal|group",
      "message": "string",
      "dateTime": "2023-12-31T23:59:59",
      "status": "scheduled|sent|paused|failed",
      "contact": {
        "name": "string",
        "phone": "string",
        "email": "string"
      },
      "group": {
        "id": "string",
        "name": "string",
        "description": "string",
        "memberCount": 0,
        "createdAt": "2023-12-31T23:59:59"
      },
      "channels": ["email|sms|whatsapp|push"],
      "repeat": "none|hourly|daily|weekly|custom",
      "customRepeat": {
        "interval": 0,
        "frequency": "day|week|month",
        "daysOfWeek": ["mon|tue|wed|thu|fri|sat|sun"]
      }
    }
  ],
  "message": "string"
}
```

### Get Reminder by ID
```http
GET /api/reminders/{id}
Authorization: Bearer <jwt-token>
```

Response:
```json
{
  "success": true,
  "data": {
    "id": "string",
    "title": "string",
    "type": "personal|group",
    "message": "string",
    "dateTime": "2023-12-31T23:59:59",
    "status": "scheduled|sent|paused|failed",
    "contact": {
      "name": "string",
      "phone": "string",
      "email": "string"
    },
    "group": {
      "id": "string",
      "name": "string",
      "description": "string",
      "memberCount": 0,
      "createdAt": "2023-12-31T23:59:59"
    },
    "channels": ["email|sms|whatsapp|push"],
    "repeat": "none|hourly|daily|weekly|custom",
    "customRepeat": {
      "interval": 0,
      "frequency": "day|week|month",
      "daysOfWeek": ["mon|tue|wed|thu|fri|sat|sun"]
    }
  },
  "message": "string"
}
```

### Create Reminder
```http
POST /api/reminders
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "title": "string",
  "type": "personal|group",
  "message": "string",
  "dateTime": "2023-12-31T23:59:59",
  "status": "scheduled|sent|paused|failed",
  "contact": {
    "name": "string",
    "phone": "string",
    "email": "string"
  },
  "groupId": "string",
  "channels": ["email|sms|whatsapp|push"],
  "repeat": "none|hourly|daily|weekly|custom",
  "customRepeat": {
    "interval": 0,
    "frequency": "day|week|month",
    "daysOfWeek": ["mon|tue|wed|thu|fri|sat|sun"]
  }
}
```

Response:
```json
{
  "success": true,
  "data": {
    "id": "string",
    "title": "string",
    "type": "personal|group",
    "message": "string",
    "dateTime": "2023-12-31T23:59:59",
    "status": "scheduled|sent|paused|failed",
    "contact": {
      "name": "string",
      "phone": "string",
      "email": "string"
    },
    "group": {
      "id": "string",
      "name": "string",
      "description": "string",
      "memberCount": 0,
      "createdAt": "2023-12-31T23:59:59"
    },
    "channels": ["email|sms|whatsapp|push"],
    "repeat": "none|hourly|daily|weekly|custom",
    "customRepeat": {
      "interval": 0,
      "frequency": "day|week|month",
      "daysOfWeek": ["mon|tue|wed|thu|fri|sat|sun"]
    }
  },
  "message": "string"
}
```

### Update Reminder
```http
PUT /api/reminders/{id}
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "title": "string",
  "type": "personal|group",
  "message": "string",
  "dateTime": "2023-12-31T23:59:59",
  "status": "scheduled|sent|paused|failed",
  "contact": {
    "name": "string",
    "phone": "string",
    "email": "string"
  },
  "groupId": "string",
  "channels": ["email|sms|whatsapp|push"],
  "repeat": "none|hourly|daily|weekly|custom",
  "customRepeat": {
    "interval": 0,
    "frequency": "day|week|month",
    "daysOfWeek": ["mon|tue|wed|thu|fri|sat|sun"]
  }
}
```

Response:
```json
{
  "success": true,
  "data": {
    "id": "string",
    "title": "string",
    "type": "personal|group",
    "message": "string",
    "dateTime": "2023-12-31T23:59:59",
    "status": "scheduled|sent|paused|failed",
    "contact": {
      "name": "string",
      "phone": "string",
      "email": "string"
    },
    "group": {
      "id": "string",
      "name": "string",
      "description": "string",
      "memberCount": 0,
      "createdAt": "2023-12-31T23:59:59"
    },
    "channels": ["email|sms|whatsapp|push"],
    "repeat": "none|hourly|daily|weekly|custom",
    "customRepeat": {
      "interval": 0,
      "frequency": "day|week|month",
      "daysOfWeek": ["mon|tue|wed|thu|fri|sat|sun"]
    }
  },
  "message": "string"
}
```

### Update Reminder Status
```http
PUT /api/reminders/{id}/status
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "status": "scheduled|sent|paused|failed"
}
```

Response:
```json
{
  "success": true,
  "data": {
    "id": "string",
    "title": "string",
    "type": "personal|group",
    "message": "string",
    "dateTime": "2023-12-31T23:59:59",
    "status": "scheduled|sent|paused|failed",
    "contact": {
      "name": "string",
      "phone": "string",
      "email": "string"
    },
    "group": {
      "id": "string",
      "name": "string",
      "description": "string",
      "memberCount": 0,
      "createdAt": "2023-12-31T23:59:59"
    },
    "channels": ["email|sms|whatsapp|push"],
    "repeat": "none|hourly|daily|weekly|custom",
    "customRepeat": {
      "interval": 0,
      "frequency": "day|week|month",
      "daysOfWeek": ["mon|tue|wed|thu|fri|sat|sun"]
    }
  },
  "message": "string"
}
```

### Delete Reminder
```http
DELETE /api/reminders/{id}
Authorization: Bearer <jwt-token>
```

Response:
```json
{
  "success": true,
  "data": null,
  "message": "string"
}
```

## Groups

### Get All Groups
```http
GET /api/groups
Authorization: Bearer <jwt-token>
```

Response:
```json
{
  "success": true,
  "data": [
    {
      "id": "string",
      "name": "string",
      "description": "string",
      "memberCount": 0,
      "createdAt": "2023-12-31T23:59:59"
    }
  ],
  "message": "string"
}
```

### Get Group by ID
```http
GET /api/groups/{id}
Authorization: Bearer <jwt-token>
```

Response:
```json
{
  "success": true,
  "data": {
    "id": "string",
    "name": "string",
    "description": "string",
    "memberCount": 0,
    "createdAt": "2023-12-31T23:59:59"
  },
  "message": "string"
}
```

### Create Group
```http
POST /api/groups
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "name": "string",
  "description": "string"
}
```

Response:
```json
{
  "success": true,
  "data": {
    "id": "string",
    "name": "string",
    "description": "string",
    "memberCount": 0,
    "createdAt": "2023-12-31T23:59:59"
  },
  "message": "string"
}
```

### Update Group
```http
PUT /api/groups/{id}
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "name": "string",
  "description": "string"
}
```

Response:
```json
{
  "success": true,
  "data": {
    "id": "string",
    "name": "string",
    "description": "string",
    "memberCount": 0,
    "createdAt": "2023-12-31T23:59:59"
  },
  "message": "string"
}
```

### Delete Group
```http
DELETE /api/groups/{id}
Authorization: Bearer <jwt-token>
```

Response:
```json
{
  "success": true,
  "data": null,
  "message": "string"
}
```

## Members

### Get Group Members
```http
GET /api/groups/{groupId}/members
Authorization: Bearer <jwt-token>
```

Response:
```json
{
  "success": true,
  "data": [
    {
      "id": "string",
      "name": "string",
      "email": "string",
      "role": "Admin|Member",
      "status": "Active|Pending",
      "joinedAt": "2023-12-31T23:59:59",
      "phone": "string",
      "lastActivity": "2023-12-31T23:59:59"
    }
  ],
  "message": "string"
}
```

### Add Member to Group
```http
POST /api/groups/{groupId}/members
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "name": "string",
  "email": "string",
  "role": "Admin|Member",
  "phone": "string"
}
```

Response:
```json
{
  "success": true,
  "data": {
    "id": "string",
    "name": "string",
    "email": "string",
    "role": "Admin|Member",
    "status": "Active|Pending",
    "joinedAt": "2023-12-31T23:59:59",
    "phone": "string",
    "lastActivity": "2023-12-31T23:59:59"
  },
  "message": "string"
}
```

### Update Member
```http
PUT /api/groups/{groupId}/members/{memberId}
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "name": "string",
  "email": "string",
  "role": "Admin|Member",
  "phone": "string"
}
```

Response:
```json
{
  "success": true,
  "data": {
    "id": "string",
    "name": "string",
    "email": "string",
    "role": "Admin|Member",
    "status": "Active|Pending",
    "joinedAt": "2023-12-31T23:59:59",
    "phone": "string",
    "lastActivity": "2023-12-31T23:59:59"
  },
  "message": "string"
}
```

### Remove Member from Group
```http
DELETE /api/groups/{groupId}/members/{memberId}
Authorization: Bearer <jwt-token>
```

Response:
```json
{
  "success": true,
  "data": null,
  "message": "string"
}
```

## Contacts

### Get All Contacts
```http
GET /api/contacts
Authorization: Bearer <jwt-token>
```

Response:
```json
{
  "success": true,
  "data": [
    {
      "name": "string",
      "phone": "string",
      "email": "string"
    }
  ],
  "message": "string"
}
```

### Get Contact by ID
```http
GET /api/contacts/{id}
Authorization: Bearer <jwt-token>
```

Response:
```json
{
  "success": true,
  "data": {
    "name": "string",
    "phone": "string",
    "email": "string"
  },
  "message": "string"
}
```

### Create Contact
```http
POST /api/contacts
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "name": "string",
  "phone": "string",
  "email": "string"
}
```

Response:
```json
{
  "success": true,
  "data": {
    "name": "string",
    "phone": "string",
    "email": "string"
  },
  "message": "string"
}
```

### Update Contact
```http
PUT /api/contacts/{id}
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "name": "string",
  "phone": "string",
  "email": "string"
}
```

Response:
```json
{
  "success": true,
  "data": {
    "name": "string",
    "phone": "string",
    "email": "string"
  },
  "message": "string"
}
```

### Delete Contact
```http
DELETE /api/contacts/{id}
Authorization: Bearer <jwt-token>
```

Response:
```json
{
  "success": true,
  "data": null,
  "message": "string"
}
```

## Error Responses

All error responses follow this format:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": "Optional detailed error information"
  }
}
```

Common HTTP Status Codes:
- 200: OK (successful GET, PUT requests)
- 201: Created (successful POST request)
- 204: No Content (successful DELETE request)
- 400: Bad Request (validation errors)
- 401: Unauthorized (missing or invalid JWT)
- 403: Forbidden (insufficient permissions)
- 404: Not Found (resource not found)
- 500: Internal Server Error (unexpected server error)