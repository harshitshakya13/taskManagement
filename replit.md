# &lt;HarshitTaskFlow/&gt; - Task Management Application

## Overview

This is a full-stack task management application built with React frontend and Express backend. The application allows users to create, edit, delete, and comment on tasks with animated UI elements, dark/light theme support, and a modern, responsive design. Data is persisted using JSON files on the server instead of requiring a database.

## User Preferences

- Preferred communication style: Simple, everyday language
- Branding: Use "&lt;HarshitTaskFlow/&gt;" as logo and title name
- Copyright: Show current year (2025) with developer name "Harshit Shakya"
- Data storage: Use JSON files instead of database dependencies
- UI: Include animations and improved visual appeal

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS with shadcn/ui component library
- **State Management**: TanStack Query (React Query) for server state
- **Routing**: Wouter for lightweight client-side routing
- **Build Tool**: Vite for fast development and optimized builds
- **Theme**: Dark/light mode support with custom theme provider

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Runtime**: Node.js with ES modules
- **Storage**: JSON file-based storage system via JsonFileStorage
- **Data Persistence**: Server-side JSON files (tasks.json, comments.json, counters.json)
- **API Style**: RESTful API endpoints with JSON file operations

### UI Component System
- **Component Library**: Radix UI primitives with custom styling
- **Design System**: shadcn/ui with "new-york" style variant
- **CSS Framework**: Tailwind CSS with CSS variables for theming
- **Icons**: Lucide React for consistent iconography

## Key Components

### Data Models
- **Tasks**: Core entity with title, description, status, timestamps, and user tracking
- **Comments**: Threaded comments system with status change tracking
- **Status System**: Four-state workflow (pending, work-in-process, on-hold, completed)

### Frontend Components
- **TaskCard**: Main task display with expandable comments section
- **TaskModal**: Create/edit form with validation
- **CommentThread**: Threaded comment system with reply functionality
- **ThemeProvider**: Dark/light mode toggle with persistence

### Backend Services
- **JsonFileStorage**: Server-side JSON file management system
- **API Routes**: RESTful endpoints for tasks and comments operations
- **Sample Data**: Pre-populated JSON files with demonstration data
- **Validation**: Zod schema validation for type safety

### Animation System
- **Custom CSS Animations**: Fade-in, scale-in, and glow effects
- **Staggered Loading**: Progressive appearance of task cards
- **Theme Transitions**: Smooth dark/light mode switching
- **Interactive Elements**: Hover effects and loading states

## Data Flow

### Task Management Flow
1. User creates/edits tasks through TaskModal
2. Form validation using Zod schemas
3. API requests to Express server endpoints
4. JSON file operations via JsonFileStorage
5. React Query manages server state and cache invalidation
6. UI updates reflect changes with automatic data synchronization

### Comment System Flow
1. User adds comments or status changes
2. Comments can be threaded (replies to other comments)
3. Status changes are tracked as special comment types
4. All changes immediately saved to localStorage
5. UI updates reflect changes with animations

### State Management
- Server state managed by TanStack Query (React Query)
- Local UI state managed by React hooks (useState, useEffect)
- Data persistence via server-side JSON files
- Theme state persisted to localStorage
- Form state managed by controlled components
- RESTful API communication for all data operations

## External Dependencies

### Core Libraries
- **@radix-ui/***: Headless UI component primitives
- **wouter**: Lightweight routing solution

### Development Tools
- **Vite**: Build tool and dev server
- **TypeScript**: Type safety across the stack
- **Tailwind CSS**: Utility-first CSS framework
- **PostCSS**: CSS processing and autoprefixing

### Validation & Utilities
- **zod**: Runtime type validation and schema definition
- **date-fns**: Date manipulation utilities
- **clsx & tailwind-merge**: Conditional CSS class handling

## Deployment Strategy

### Build Process
- Frontend: Vite builds React app with TypeScript
- Client-side only: No backend compilation required
- LocalStorage: Data persists automatically in browser

### Environment Configuration
- Development mode with hot reloading via Vite
- Production mode: Static site deployment ready
- No environment variables required for basic functionality

### Data Storage
- Server-side JSON files (data/tasks.json, data/comments.json, data/counters.json)
- Automatic file creation and initialization with sample content
- Persistent storage across server restarts
- JsonFileStorage utility for all file operations
- RESTful API endpoints for data access

### Development vs Production
- Development: Express server with Vite HMR integration
- Production: Full-stack application with Express backend
- Server-side: Requires Node.js runtime for JSON file operations
- Responsive design: Works on mobile, tablet, and desktop

## Recent Changes (Updated 2025-01-20)

### Major Architecture Changes
✓ Migrated from localStorage to server-side JSON file storage
✓ Implemented RESTful API with Express backend
✓ Integrated TanStack Query for server state management
✓ Updated branding to "&lt;HarshitTaskFlow/&gt;" with animated logo
✓ Enhanced UI with custom animations and improved visual appeal
✓ Fixed HTML validation errors in comment threading components
✓ Added staggered animations for task card loading
✓ Updated copyright to 2025 with developer attribution

### Key Features Added
✓ JSON file-based data persistence with server-side storage
✓ RESTful API endpoints for all CRUD operations
✓ Server state management with TanStack Query
✓ Custom CSS animations (glow, fade-in, scale-in effects)
✓ Improved responsive design
✓ Enhanced theme switching animations
✓ Better accessibility compliance

The application is now a full-stack solution with Express backend and JSON file storage, providing robust data persistence and professional API architecture while maintaining excellent user experience.