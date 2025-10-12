# Hatirlat.io - Full Stack Integration Guide

## Overview

This guide explains how to integrate the frontend and backend of the Hatirlat.io reminder application. The application consists of:

1. **Frontend**: Next.js 15 application with TypeScript, Tailwind CSS, and shadcn/ui components
2. **Backend**: Spring Boot application with Java, PostgreSQL, and JWT authentication

## Architecture

```
┌─────────────────────┐    HTTP/API    ┌─────────────────────┐
│   Frontend (Next.js) │ ◄────────────► │  Backend (Spring Boot) │
│                     │               │                     │
│  - React Components │               │  - REST Controllers │
│  - TypeScript       │               │  - Services         │
│  - Tailwind CSS     │               │  - JPA Entities     │
│  - shadcn/ui        │               │  - PostgreSQL DB    │
└─────────────────────┘               └─────────────────────┘
```

## API Integration

### Authentication Flow

1. **Login**: 
   - POST `/api/auth/login` with username/password
   - Returns JWT token and user info
   - Stores token in localStorage

2. **Register**:
   - POST `/api/auth/register` with user details
   - Returns created user object

3. **Token Usage**:
   - All subsequent requests include `Authorization: Bearer <token>` header
   - Tokens are automatically added by the API service

### Data Models

The integration uses consistent data models between frontend and backend:

#### Reminder
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

#### Group
```typescript
interface Group {
  id: string;
  name: string;
  description?: string;
  memberCount?: number;
  createdAt?: string; // ISO 8601 format
}
```

#### Member
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

#### Contact
```typescript
interface Contact {
  name: string;
  phone: string;
  email: string;
}
```

### API Endpoints

#### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/auth/me` - Get current user info

#### Reminders
- `GET /api/reminders` - Get all reminders
- `GET /api/reminders/{id}` - Get reminder by ID
- `POST /api/reminders` - Create new reminder
- `PUT /api/reminders/{id}` - Update reminder
- `PUT /api/reminders/{id}/status` - Update reminder status
- `DELETE /api/reminders/{id}` - Delete reminder

#### Groups
- `GET /api/groups` - Get all groups
- `GET /api/groups/{id}` - Get group by ID
- `POST /api/groups` - Create new group
- `PUT /api/groups/{id}` - Update group
- `DELETE /api/groups/{id}` - Delete group

#### Members
- `GET /api/groups/{groupId}/members` - Get group members
- `POST /api/groups/{groupId}/members` - Add member to group
- `PUT /api/groups/{groupId}/members/{memberId}` - Update member
- `DELETE /api/groups/{groupId}/members/{memberId}` - Remove member from group
- `POST /api/members/invite` - Invite member to group

#### Contacts
- `GET /api/contacts` - Get all contacts
- `GET /api/contacts/{id}` - Get contact by ID
- `POST /api/contacts` - Create new contact
- `PUT /api/contacts/{id}` - Update contact
- `DELETE /api/contacts/{id}` - Delete contact

## Frontend Architecture

### Directory Structure
```
frontend/
├── app/                 # Next.js app router pages
├── components/          # React components
├── contexts/            # React context providers
├── hooks/               # Custom React hooks
├── lib/                 # Utility functions
├── services/            # API and business logic services
├── styles/              # Global styles
├── types/               # TypeScript type definitions
└── public/              # Static assets
```

### Key Services

1. **AuthService**: Handles authentication (login, register, logout)
2. **ApiService**: Low-level HTTP client with JWT token handling
3. **ApiManager**: High-level API methods that map to backend endpoints

### State Management

The application uses React Context for authentication state and React hooks for component state.

## Backend Architecture

### Directory Structure
```
backend/
├── src/main/java/com/hatirlat/backend/
│   ├── controller/      # REST controllers
│   ├── dto/             # Data transfer objects
│   ├── entity/          # JPA entities
│   ├── exception/       # Custom exceptions
│   ├── repository/      # Spring Data JPA repositories
│   ├── service/         # Business logic services
│   └── config/          # Configuration classes
└── src/main/resources/  # Configuration files
```

### Key Components

1. **Controllers**: Handle HTTP requests and return JSON responses
2. **Services**: Contain business logic
3. **Entities**: JPA entities mapped to database tables
4. **DTOs**: Data transfer objects for API requests/responses
5. **Repositories**: Database access layers

## Development Setup

### Prerequisites
- Node.js 18+
- Java 17+
- Maven 3.8+
- PostgreSQL 13+

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### Backend Setup
```bash
cd backend
mvn spring-boot:run
```

## Environment Variables

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:8080
```

### Backend (application.properties)
```properties
# Database Configuration
spring.datasource.url=jdbc:postgresql://localhost:5432/hatirlat
spring.datasource.username=your_username
spring.datasource.password=your_password

# JWT Configuration
application.security.jwt.secret-key=your_secret_key
application.security.jwt.expiration=86400000
```

## Deployment

### Frontend
Deploy as a static site or use Vercel/Netlify for automatic deployments.

### Backend
Deploy as a standalone JAR or use Docker containerization.

## Testing

### Frontend
- Unit tests with Jest
- Integration tests with Cypress
- Component tests with React Testing Library

### Backend
- Unit tests with JUnit
- Integration tests with Testcontainers
- API tests with RestAssured

## Troubleshooting

### Common Issues

1. **CORS Errors**: Ensure backend CORS configuration allows frontend origin
2. **Authentication Failures**: Check JWT secret key consistency between frontend/backend
3. **API Connection Issues**: Verify API base URL configuration
4. **Database Connection**: Check PostgreSQL connection settings

### Debugging Tips

1. Enable debug logging in backend (`logging.level.com.hatirlat.backend=DEBUG`)
2. Use browser dev tools to inspect network requests
3. Check browser console for JavaScript errors
4. Verify API responses match expected data structures

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details.