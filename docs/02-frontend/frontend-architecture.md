# Frontend Architecture

## Scope
Web app for onboarding, configuration, scheduling, and dashboard reporting.

## Stack
- React 18 + Vite
- Tailwind CSS
- React Router
- React Query
- Recharts

## Architecture Layers
- Routing layer: public and authenticated routes
- Feature modules: auth, settings, schedule, dashboard
- API client layer: token-aware request wrappers
- State strategy: server state with React Query, minimal local UI state

## Key Design Decisions
- Keep business logic in backend; frontend focuses on orchestration and UX
- Use typed response contracts (documented API fields)
- Centralized error boundary and toast-based user feedback

## Core Screens
- Login/Register
- Amazon Configuration
- Telegram Configuration
- Schedule Management
- Dashboard and Recent Posts

## Non-Functional Requirements
- Responsive layout (mobile and desktop)
- Input validation before submit
- Graceful handling for expired sessions
