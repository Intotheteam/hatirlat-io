# Hatirlat.io Project Context

## Overview
Hatirlat.io is a modern reminder application built with Next.js 15, TypeScript, and Tailwind CSS. The application allows users to create and manage personal and group reminders with different notification channels (email, SMS, WhatsApp). The project uses shadcn/ui components for the UI and implements a clean, responsive design with dark/light theme support.

## Technology Stack
- Next.js 15
- TypeScript
- Tailwind CSS
- shadcn/ui components
- React Hook Form (for forms)
- Zod (for validation)
- Radix UI (for accessible components)
- Lucide React (for icons)

## Project Structure
```
hatirlat-io/
├── app/                      # Next.js app router pages
│   ├── groups/              # Group-related pages
│   ├── invite/              # Invitation pages
│   ├── globals.css          # Global styles
│   ├── layout.tsx           # Root layout
│   └── page.tsx             # Main page
├── components/              # React components
│   ├── ui/                  # shadcn/ui components
│   ├── header.tsx           # Navigation header
│   ├── theme-provider.tsx   # Theme context provider
│   ├── theme-toggle.tsx     # Theme toggle component
│   ├── create-reminder-modal.tsx
│   ├── edit-reminder-modal.tsx
│   ├── group-management.tsx
│   ├── manage-members.tsx
│   ├── reminder-history.tsx
│   └── reminders-dashboard.tsx
├── core/                    # Core domain entities
│   └── domain/
│       └── entities/
│           ├── group.ts
│           └── member.ts
├── hooks/                   # Custom React hooks
│   └── use-toast.ts
├── lib/                     # Utility functions
├── public/                  # Static assets
├── services/                # API services
│   └── api/
│       ├── apiService.ts    # Main API service with dummy data
│       └── apiError.ts      # API error handling
├── types/                   # TypeScript type definitions
├── styles/                  # Additional styles
```

## Key Components and Their Functions

### Main Pages and Views
- `app/page.tsx`: Main application page with view switching logic (dashboard, groups, schedules, manage members)
- `RemindersDashboard`: Shows overview and statistics of reminders
- `ScheduleList`: Displays and manages scheduled reminders with filtering
- `GroupManagement`: Handles group creation and management
- `ManageMembers`: Allows managing members within a group

### UI Components
- `Header`: Navigation header with theme toggle and user controls
- Modal components: `CreateReminderModal` and `EditReminderModal` for managing reminders
- Standard shadcn/ui components in the `ui/` directory

## Data Models

### Reminder Interface
```typescript
interface Reminder {
  id: string;
  title: string;
  type: "personal" | "group";
  message: string;
  dateTime: string;
  status: "scheduled" | "sent" | "paused" | "failed";
  contact: Contact;        // For personal reminders
  group: Group;            // For group reminders
  channels: ("email" | "sms" | "whatsapp")[];
  repeat: "none" | "hourly" | "daily" | "weekly" | "custom";
  customRepeat?: CustomRepeatConfig;
}
```

### Group Interface
```typescript
interface Group {
  id: string;
  name: string;
  description?: string;
  memberCount?: number;
  createdAt?: string;
}
```

### Member Interface
```typescript
interface Member {
  id: string;
  name: string;
  email: string;
  role: "Admin" | "Member";
  status: "Active" | "Pending";
  joinedAt: string;
  phone?: string;
  lastActivity?: string;
}
```

### Contact Interface
```typescript
interface Contact {
  name: string;
  phone: string;
  email: string;
}
```

## API Service Architecture
The application uses an `apiService` module that implements a dummy data mode for development:
- When `NEXT_PUBLIC_API_URL` is not configured or matches the default API URL, dummy data is used
- The service provides standard REST methods: `get`, `post`, `put`, `delete`
- Dummy data includes reminders, groups, and members
- The implementation includes delay simulation for realistic UX

## Key Features and Functionality

### Reminder Management
- Create and edit reminders with multiple notification channels
- Pause/resume active reminders
- Filter reminders by status, type, and channel
- Support for recurring reminders with custom configurations
- View reminder history

### Group Management
- Create groups with names and descriptions
- Generate and share invite links
- Manage group members
- Track member count

### User Interface
- Responsive design supporting mobile and desktop
- Dark/light theme support using next-themes
- Interactive UI with toast notifications
- Filtering and sorting capabilities
- Modal dialogs for forms and confirmations

## Navigation Flow
The application supports multiple views that are managed from the main page:
- Dashboard (default view)
- Scheduled reminders
- Group management
- Member management (with group context)

## Development Notes
- The project uses dummy data implementation by default, making it easy to develop without a backend
- Type safety is implemented throughout the application
- The UI follows accessibility best practices through Radix UI primitives
- The design is responsive and follows modern UI/UX principles

## Environment Variables
- `NEXT_PUBLIC_API_URL`: API endpoint (falls back to dummy data when not set)

## Future Considerations
- Integration with a real backend API
- Authentication system implementation
- Additional notification channels
- Advanced scheduling options
- Export/import functionality for reminders