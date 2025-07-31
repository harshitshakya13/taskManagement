# &lt;HarshitTaskFlow/&gt; - Task Management Application

## Overview

This is a client-side task management application built with React and localStorage. The application allows users to create, edit, delete, and comment on tasks with animated UI elements, dark/light theme support, and a modern, responsive design. Data is persisted using browser localStorage instead of requiring a backend database.

## User Preferences

- Preferred communication style: Simple, everyday language
- Branding: Use "&lt;HarshitTaskFlow/&gt;" as logo and title name
- Copyright: Show current year (2025) with developer name "Harshit Shakya"
- Data storage: Use localStorage instead of database dependencies
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
- **Framework**: Express.js with TypeScript (minimal backend for development)
- **Runtime**: Node.js with ES modules
- **Storage**: Client-side localStorage implementation via LocalStorageManager
- **Data Persistence**: Browser localStorage with structured keys for tasks and comments
- **API Style**: Direct localStorage operations, no network requests required

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
- **LocalStorageManager**: Client-side data management utility
- **Sample Data**: Pre-populated tasks and comments for demonstration
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
3. Direct localStorage operations via LocalStorageManager
4. Data stored in browser localStorage with structured keys
5. Component state updates trigger UI refresh
6. Automatic data persistence across browser sessions

### Comment System Flow
1. User adds comments or status changes
2. Comments can be threaded (replies to other comments)
3. Status changes are tracked as special comment types
4. All changes immediately saved to localStorage
5. UI updates reflect changes with animations

### State Management
- Local state managed by React hooks (useState, useEffect)
- Data persistence via browser localStorage
- Theme state persisted to localStorage
- Form state managed by controlled components
- No network requests - fully client-side operation

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
- Browser localStorage with structured keys
- Automatic data initialization with sample content
- Cross-session persistence without server requirements
- LocalStorageManager utility for all data operations

### Development vs Production
- Development: Vite dev server with HMR
- Production: Static files deployable to any web server
- Client-side only: No server infrastructure required
- Responsive design: Works on mobile, tablet, and desktop

## Recent Changes (Updated 2025-01-20)

### Major Architecture Changes
✓ Migrated from database-dependent backend to client-side localStorage
✓ Updated branding to "&lt;HarshitTaskFlow/&gt;" with animated logo
✓ Enhanced UI with custom animations and improved visual appeal
✓ Fixed HTML validation errors in comment threading components
✓ Added staggered animations for task card loading
✓ Updated copyright to 2025 with developer attribution

### Key Features Added
✓ localStorage-based data persistence
✓ Custom CSS animations (glow, fade-in, scale-in effects)
✓ Improved responsive design
✓ Enhanced theme switching animations
✓ Better accessibility compliance

The application is now completely client-side, requiring no backend infrastructure while maintaining full functionality for task management, comment threading, and data persistence.