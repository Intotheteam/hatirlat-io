# API Context for Hatirlat.io Backend Implementation

## Project Overview
Hatirlat.io is a modern reminder application frontend built with Next.js 15, TypeScript, and Tailwind CSS. The application currently uses dummy data for API calls, but requires a backend implementation with Java Spring Boot REST APIs to handle all data operations and business logic.

## Current Frontend State
The frontend application is fully functional with dummy data implementation and includes the following key features:
- Reminder management (create, read, update, delete)
- Group management (create, read)
- Member management within groups
- Multiple notification channels (email, SMS, WhatsApp)
- Recurring reminder functionality
- User authentication simulation
- Dashboard with statistics and filtering

## API Implementation Requirements

### 1. Core Technology Stack
- **Backend Framework**: Java Spring Boot (latest stable version)
- **Database**: PostgreSQL (or similar SQL database)
- **Authentication**: JWT-based authentication
- **API Documentation**: OpenAPI/Swagger
- **Testing**: JUnit for unit tests, MockMvc for integration tests
- **Security**: Spring Security with CSRF protection

### 2. Data Models & Endpoints to Implement

#### Reminders API
- `GET /api/reminders` - Get all reminders for authenticated user
- `GET /api/reminders/{id}` - Get specific reminder
- `POST /api/reminders` - Create new reminder
- `PUT /api/reminders/{id}` - Update reminder
- `DELETE /api/reminders/{id}` - Delete reminder
- `PUT /api/reminders/{id}/status` - Update reminder status

**Reminder Entity Fields**:
```java
@Entity
public class Reminder {
    @Id
    private String id;
    private String title;
    private String type; // "personal" | "group"
    private String message;
    private LocalDateTime dateTime;
    private String status; // "scheduled" | "sent" | "paused" | "failed"
    
    @ManyToOne
    @JoinColumn(name = "contact_id")
    private Contact contact;
    
    @ManyToOne
    @JoinColumn(name = "group_id")
    private Group group;
    
    @ElementCollection
    private List<String> channels; // "email" | "sms" | "whatsapp"
    
    private String repeat; // "none" | "hourly" | "daily" | "weekly" | "custom"
    
    @OneToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "custom_repeat_id")
    private CustomRepeatConfig customRepeat;
    
    // Getters and setters
}
```

#### Groups API
- `GET /api/groups` - Get all groups for authenticated user
- `GET /api/groups/{id}` - Get specific group
- `POST /api/groups` - Create new group
- `PUT /api/groups/{id}` - Update group
- `DELETE /api/groups/{id}` - Delete group

**Group Entity Fields**:
```java
@Entity
public class Group {
    @Id
    private String id;
    private String name;
    private String description;
    private LocalDateTime createdAt;
    
    @ManyToMany
    @JoinTable(
        name = "group_members",
        joinColumns = @JoinColumn(name = "group_id"),
        inverseJoinColumns = @JoinColumn(name = "member_id")
    )
    private Set<Member> members = new HashSet<>();
    
    // Getters and setters
}
```

#### Members API
- `GET /api/groups/{groupId}/members` - Get all members in a group
- `POST /api/groups/{groupId}/members` - Add member to group
- `DELETE /api/groups/{groupId}/members/{memberId}` - Remove member from group
- `POST /api/members/invite` - Send invitation to join group

**Member Entity Fields**:
```java
@Entity
public class Member {
    @Id
    private String id;
    private String name;
    private String email;
    private String role; // "Admin" | "Member"
    private String status; // "Active" | "Pending"
    private LocalDateTime joinedAt;
    private String phone;
    private LocalDateTime lastActivity;
    
    // Getters and setters
}
```

#### Contacts API
- `GET /api/contacts` - Get all contacts for authenticated user
- `POST /api/contacts` - Create new contact
- `PUT /api/contacts/{id}` - Update contact
- `DELETE /api/contacts/{id}` - Delete contact

**Contact Entity Fields**:
```java
@Entity
public class Contact {
    @Id
    private String id;
    private String name;
    private String phone;
    private String email;
    
    // Getters and setters
}
```

### 3. Authentication and User Management
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Authenticate user and return JWT
- `GET /api/auth/me` - Get current user info (requires valid JWT)

### 4. Custom Repeat Configuration
For recurring reminders, implement custom repeat logic:
- Support for multiple repeat patterns (hourly, daily, weekly, monthly)
- Custom intervals and days of week
- End date or occurrence limit

### 5. Notification System
- Integration with external services for SMS, email, and WhatsApp notifications
- Background job scheduling using Spring Scheduler or similar
- Retry mechanism for failed notifications
- Logging for notification status

### 6. API Response Format
All API responses should follow a consistent format:

Success responses:
```json
{
  "success": true,
  "data": { ... },
  "message": "Optional success message"
}
```

Error responses:
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

### 7. Validation Requirements
- Server-side validation for all input parameters
- Proper error messages for validation failures
- Business logic validation (e.g., cannot delete group with active reminders)

### 8. Security Considerations
- Authentication required for all endpoints except login/register
- Authorization: users can only access their own data
- Input sanitization to prevent injection attacks
- Rate limiting to prevent abuse
- Proper CORS configuration

### 9. Deployment & Environment Configuration
- Containerized deployment with Docker
- Environment variables for database credentials, JWT secrets, API keys
- Health check endpoints for monitoring
- Logging configuration for production

### 10. Data Relationships
- A Reminder can be associated with either a Contact (for personal reminders) or a Group (for group reminders)
- A Group can have multiple Members
- Users can be members of multiple groups
- Contacts are tied to individual users

### 11. Additional Features for Backend
- Search and filtering capabilities
- Pagination for large datasets
- Export functionality (CSV, PDF)
- Audit logging for important operations
- Soft delete for important entities to maintain data integrity
- Background processing for notification sending

### 12. Error Handling Strategy
- Custom exception classes for different error types
- Global exception handler with appropriate HTTP status codes
- Proper logging of errors for debugging
- Graceful degradation when external services are unavailable

### 13. Testing Strategy
- Unit tests for service layer logic
- Integration tests for API endpoints
- Repository tests for database operations
- Test coverage should be at least 80%

This document provides the complete context needed for implementing the Java Spring Boot REST API for the Hatirlat.io platform, ensuring it meets all requirements of the existing frontend application.