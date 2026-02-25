# GEMINI.md - Frontend & UI/UX Specialist Context

## Role & Responsibility
This file (GEMINI.md) is the authoritative context for **Frontend Development and UI/UX** within the Affiliate Autoposter project.

### In-Scope:
- **Frontend Architecture:** React 18 (Vite), React Router, React Query.
- **UI Components:** Design system, component library, and reusable UI elements.
- **State Management:** Server state (React Query) and local UI state.
- **Styling:** Tailwind CSS and aesthetic polish (animations, transitions).
- **User Experience (UX):** User flows, interactive feedback, and intuitive design.
- **Responsiveness & Accessibility:** Ensuring a high-quality experience across devices and for all users.
- **Performance:** Optimization of bundle size, rendering, and asset loading.

### Out-of-Scope:
- **Backend Development:** Handled by `AGENTS.md`.
- **Infrastructure, DevOps & Cloud:** Handled by `CLAUDE.md`.
- **Testing & Product-Level Architecture:** Handled by `CLAUDE.md`.

## Frontend Technology Stack
- **Framework:** React 18 + Vite + TypeScript.
- **Styling:** Tailwind CSS (Mobile-first, modern aesthetics).
- **State/Data:** React Query (TanStack Query) for server state; native hooks for UI state.
- **Routing:** React Router.
- **Visualization:** Recharts for the analytics dashboard.

## Core Mandates for Frontend/UX
1. **Modern Aesthetics:** Implement a "polished" and "alive" feel with consistent spacing and interactive feedback.
2. **Component Isolation:** Features should be grouped by domain (e.g., `frontend/src/features/schedule`).
3. **Responsive Design:** Every feature must be functional and visually appealing on both mobile and desktop.
4. **Accessibility (a11y):** Use semantic HTML and ensure keyboard navigability.
5. **Performance:** Lazy-load routes and optimize images/assets for fast initial load.

## Primary Documentation References
- `docs/02-frontend/`: Detailed architecture and UI flow specifications.
- `docs/05-product-business/user-personas-and-journey.md`: Context for UX decisions.
- `docs/00-overview/glossary.md`: Consistency in terminology across the UI.

## Directory Focus
- `frontend/`: Implementation of the React application.
- `shared/`: Consuming shared types and models for API consistency.
