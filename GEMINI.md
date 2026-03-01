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
- **Backend Development, CI/CD, Infra, Cloud:** Handled by `AGENTS.md`.
- **n8n Workflows, Code Review, Testing Strategy:** Handled by `CLAUDE.md`.

---

## Architecture Impact

The backend uses a **hybrid architecture** (Spring Boot + n8n workflow engine). From the frontend's perspective:

- **Zero API contract changes** — the frontend talks to the same API Gateway endpoints regardless of whether automation runs in Spring Boot or n8n
- **workflow-bridge-service** transparently replaces the old scheduler/fetcher/pusher services behind the Gateway
- Schedule activate/deactivate calls route to workflow-bridge-service, which manages n8n workflows — the frontend only sees REST endpoints
- All existing route and API patterns remain identical

---

## Frontend Technology Stack
- **Framework:** React 18 + Vite + TypeScript.
- **Styling:** Tailwind CSS (Mobile-first, modern aesthetics).
- **State/Data:** React Query (TanStack Query) for server state; native hooks for UI state.
- **Routing:** React Router.
- **Visualization:** Recharts for the analytics dashboard.

---

## API Endpoints (consumed by frontend)

**Auth (auth-service):**
- `POST /api/auth/register` — email/password registration
- `POST /api/auth/login` — email/password login
- `POST /api/auth/refresh` — refresh access token
- `POST /api/auth/logout` — revoke token
- `GET /oauth2/callback/google` — Google OAuth flow

**Config (user-config-service):**
- `GET/PUT /api/amazon-config` — manage Amazon credentials
- `GET/PUT /api/telegram-config` — manage Telegram config
- `POST /api/telegram-config/test` — send test message
- `GET/PUT /api/schedule` — view/update schedule configuration

**Schedule Control (workflow-bridge-service):**
- `POST /api/schedule/activate` — start automated posting
- `POST /api/schedule/deactivate` — pause posting
- `GET /api/schedule/history` — job run history

**Dashboard (dashboard-service):**
- `GET /api/dashboard/summary` — summary stats
- `GET /api/dashboard/recent-posts` — recent post list
- `GET /api/dashboard/category-breakdown` — category chart data

---

## Route Map

| Route | Access | Page |
|-------|--------|------|
| `/login` | Public | Email/password login + Google OAuth |
| `/register` | Public | Registration form |
| `/oauth2/callback` | Public | Google OAuth callback handler |
| `/setup` | Protected | 4-step onboarding wizard (first-time users) |
| `/dashboard` | Protected | Summary cards, recent posts, category chart |
| `/settings/amazon` | Protected | Amazon PA API credentials + preferences |
| `/settings/telegram` | Protected | Telegram bot token + channel config |
| `/schedule` | Protected | Schedule management, activate/deactivate |

---

## Core Mandates for Frontend/UX
1. **Modern Aesthetics:** Implement a "polished" and "alive" feel with consistent spacing and interactive feedback.
2. **Component Isolation:** Features should be grouped by domain (e.g., `frontend/src/features/schedule`).
3. **Responsive Design:** Every feature must be functional and visually appealing on both mobile and desktop.
4. **Accessibility (a11y):** Use semantic HTML and ensure keyboard navigability.
5. **Performance:** Lazy-load routes and optimize images/assets for fast initial load.

---

## Frontend Documentation
- Full V1 specification: [`frontend/docs/v1.md`](frontend/docs/v1.md)
- V2 delta (template picker, Pinterest): [`frontend/docs/v2.md`](frontend/docs/v2.md)
- V3 delta (click analytics, AI config, multi-platform): [`frontend/docs/v3.md`](frontend/docs/v3.md)
- V4 delta (subscription, agency view, white-label): [`frontend/docs/v4.md`](frontend/docs/v4.md)
- Terminology reference: [`docs/overview/glossary.md`](docs/overview/glossary.md)

## Directory Focus
- `frontend/`: Implementation of the React application.
- `shared/`: Consuming shared types and models for API consistency.
