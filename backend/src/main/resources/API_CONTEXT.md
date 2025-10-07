# Hatirlat.io API Context and Request/Response Models

## Project Overview
Hatirlat.io is a modern reminder application backend built with Spring Boot, Java, PostgreSQL, and JWT authentication. The API provides full CRUD functionality for reminders, groups, members, and contacts with multiple notification channels.

## API Endpoints and Request/Response Models

### Authentication API
#### POST /api/auth/register
- **Request**: AuthRequest
- **Response**: BaseResponse<UserResponse>

#### POST /api/auth/login
- **Request**: AuthRequest
- **Response**: AuthResponse

#### GET /api/auth/me
- **Request**: (JWT in header)
- **Response**: BaseResponse<UserResponse>

### Reminders API
#### GET /api/reminders
- **Request**: (JWT in header)
- **Response**: BaseResponse<List<ReminderResponse>>

#### GET /api/reminders/{id}
- **Request**: (JWT in header)
- **Response**: BaseResponse<ReminderResponse>

#### POST /api/reminders
- **Request**: (JWT in header), ReminderRequest
- **Response**: BaseResponse<ReminderResponse>

#### PUT /api/reminders/{id}
- **Request**: (JWT in header), ReminderRequest
- **Response**: BaseResponse<ReminderResponse>

#### DELETE /api/reminders/{id}
- **Request**: (JWT in header)
- **Response**: BaseResponse<Void> (204 No Content)

#### PUT /api/reminders/{id}/status
- **Request**: (JWT in header), {"status": "string"}
- **Response**: BaseResponse<ReminderResponse>

### Groups API
#### GET /api/groups
- **Request**: (JWT in header)
- **Response**: BaseResponse<List<GroupResponse>>

#### GET /api/groups/{id}
- **Request**: (JWT in header)
- **Response**: BaseResponse<GroupResponse>

#### POST /api/groups
- **Request**: (JWT in header), GroupRequest
- **Response**: BaseResponse<GroupResponse>

#### PUT /api/groups/{id}
- **Request**: (JWT in header), GroupRequest
- **Response**: BaseResponse<GroupResponse>

#### DELETE /api/groups/{id}
- **Request**: (JWT in header)
- **Response**: BaseResponse<Void> (204 No Content)

### Members API
#### GET /api/groups/{groupId}/members
- **Request**: (JWT in header)
- **Response**: BaseResponse<List<MemberResponse>>

#### POST /api/groups/{groupId}/members
- **Request**: (JWT in header), MemberRequest
- **Response**: BaseResponse<MemberResponse>

#### DELETE /api/groups/{groupId}/members/{memberId}
- **Request**: (JWT in header)
- **Response**: BaseResponse<Void> (204 No Content)

#### POST /api/members/invite
- **Request**: (JWT in header), {"email": "string", "groupId": "string"}
- **Response**: BaseResponse<String>

### Contacts API
#### GET /api/contacts
- **Request**: (JWT in header)
- **Response**: BaseResponse<List<ContactResponse>>

#### POST /api/contacts
- **Request**: (JWT in header), ContactRequest
- **Response**: BaseResponse<ContactResponse>

#### PUT /api/contacts/{id}
- **Request**: (JWT in header), ContactRequest
- **Response**: BaseResponse<ContactResponse>

#### DELETE /api/contacts/{id}
- **Request**: (JWT in header)
- **Response**: BaseResponse<Void> (204 No Content)

## Detailed Request/Response Model Definitions

### Generic Response Models

#### BaseResponse<T>
- **success**: boolean - Indicates if the request was successful
- **data**: T - The response data (null for errors)
- **message**: String - Optional success or error message

#### ErrorResponse
- **success**: boolean - Always false for error responses
- **error**: ErrorDetails
  - **code**: String - Error code
  - **message**: String - Human-readable error message
  - **details**: String (optional) - Additional error details

### Authentication Models

#### AuthRequest
- **username**: String (NotBlank) - User's username
- **password**: String (NotBlank) - User's password

#### AuthResponse
- **token**: String - JWT access token
- **refreshToken**: String - JWT refresh token
- **type**: String - Token type (default: "Bearer")
- **expiresIn**: Long - Token expiration time in seconds
- **user**: UserResponse - User information

#### UserResponse
- **id**: String - User ID
- **username**: String - Username
- **email**: String - User's email
- **role**: String - User role

### Reminder Models

#### ReminderRequest
- **title**: String (NotBlank) - Title of the reminder
- **type**: String (NotNull) - "personal" or "group"
- **message**: String - Reminder message content
- **dateTime**: LocalDateTime (NotNull) - Date and time for the reminder (ISO 8601 format)
- **status**: String (NotBlank) - "scheduled", "sent", "paused", or "failed"
- **contact**: ContactRequest - Contact details for personal reminders
- **group**: GroupRequest - Group details for group reminders (when creating inline; optional)
- **groupId**: String - ID of an existing group to associate with the reminder (takes precedence over 'group' field)
- **channels**: List<String> (NotEmpty) - Notification channels ("email", "sms", "whatsapp")
- **repeat**: String (NotBlank) - "none", "hourly", "daily", "weekly", or "custom"
- **customRepeat**: CustomRepeatRequest - Custom repeat configuration when repeat is "custom"

#### ReminderResponse
- **id**: String - Unique identifier for the reminder
- **title**: String - Title of the reminder
- **type**: String - "personal" or "group"
- **message**: String - Reminder message content
- **dateTime**: LocalDateTime - Date and time for the reminder (ISO 8601 format)
- **status**: String - "scheduled", "sent", "paused", or "failed"
- **contact**: ContactRequest - Contact details for personal reminders
- **group**: GroupResponse - Group details for group reminders
- **channels**: List<String> - Notification channels ("email", "sms", "whatsapp")
- **repeat**: String - "none", "hourly", "daily", "weekly", or "custom"
- **customRepeat**: CustomRepeatRequest - Custom repeat configuration when repeat is "custom"

#### ContactRequest
- **name**: String - Contact name
- **phone**: String - Contact phone number
- **email**: String - Contact email address

#### CustomRepeatRequest
- **interval**: Integer - Repeat interval (e.g., every 2 days/weeks/months)
- **frequency**: String - "day", "week", or "month"
- **daysOfWeek**: List<String> - Days of week when frequency is "week" ("mon", "tue", "wed", "thu", "fri", "sat", "sun")

### Group Models

#### GroupRequest
- **name**: String (NotBlank) - Group name
- **description**: String (optional) - Group description

#### GroupResponse
- **id**: String - Unique identifier for the group
- **name**: String - Group name
- **description**: String - Group description
- **memberCount**: Integer - Number of members in the group
- **createdAt**: LocalDateTime - Creation timestamp (ISO 8601 format)

### Member Models

#### MemberRequest
- **name**: String (NotBlank) - Member name
- **email**: String (Email) - Member email address
- **role**: String - "Admin" or "Member"
- **phone**: String (optional) - Member phone number

#### MemberResponse
- **id**: String - Unique identifier for the member
- **name**: String - Member name
- **email**: String - Member email address
- **role**: String - "Admin" or "Member"
- **status**: String - "Active" or "Pending"
- **joinedAt**: LocalDateTime - Join timestamp (ISO 8601 format)
- **phone**: String - Member phone number
- **lastActivity**: LocalDateTime - Last activity timestamp (ISO 8601 format)

### Contact Models

#### ContactResponse
- **id**: String - Unique identifier for the contact
- **name**: String - Contact name
- **phone**: String - Contact phone number
- **email**: String - Contact email address

## Validation Rules

### Reminder Validation
- Title: Required, not blank
- Type: Required, one of "personal" or "group"
- DateTime: Required, must be a future date/time
- Status: Required, one of "scheduled", "sent", "paused", "failed"
- Channels: At least one channel required
- Repeat: Required, one of "none", "hourly", "daily", "weekly", "custom"
- Custom repeat: Required if repeat is "custom"

### Group Validation
- Name: Required, not blank

### Contact Validation
- Email: Must be a valid email format

### Member Validation
- Name: Required, not blank
- Email: Required, must be valid email format

## Error Handling

### Standard Error Response Format
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

### Common HTTP Status Codes
- 200: OK (successful GET, PUT requests)
- 201: Created (successful POST request)
- 204: No Content (successful DELETE request)
- 400: Bad Request (validation errors)
- 401: Unauthorized (missing or invalid JWT)
- 403: Forbidden (insufficient permissions)
- 404: Not Found (resource not found)
- 500: Internal Server Error (unexpected server error)

## Security Considerations
- All endpoints except auth/login and auth/register require JWT authentication
- JWT tokens should be included in the Authorization header as "Bearer <token>"
- Users can only access their own resources
- Proper input validation on all endpoints
- Rate limiting applied to prevent abuse

## Additional API Features
- Pagination for GET endpoints returning lists
- Search and filtering capabilities for reminders and groups
- Soft deletes for important entities
- Audit logging for critical operations
- Background job processing for notification sending