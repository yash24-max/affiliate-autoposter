# Affiliate Autoposter — Complete Project Overview

> A B2C SaaS platform that automates affiliate marketing. Users connect their Amazon Associates account and Telegram channel once — the system fetches trending deals, generates posts, and publishes them on schedule. Passive affiliate income without manual effort.

---

## Table of Contents

1. [The Problem](#1-the-problem)
2. [The Solution](#2-the-solution)
3. [How It Works — User Journey](#3-how-it-works--user-journey)
4. [How Money Flows](#4-how-money-flows)
5. [Target Users](#5-target-users)
6. [Tech Stack](#6-tech-stack)
7. [System Architecture](#7-system-architecture)
8. [Backend Microservices](#8-backend-microservices)
9. [Frontend Pages & Features](#9-frontend-pages--features)
10. [Database Design](#10-database-design)
11. [API Overview](#11-api-overview)
12. [Security Design](#12-security-design)
13. [Infrastructure & DevOps](#13-infrastructure--devops)
14. [Product Roadmap (V1–V4)](#14-product-roadmap-v1v4)
15. [Monetization & Pricing](#15-monetization--pricing)
16. [Design System](#16-design-system)
17. [Project Structure](#17-project-structure)
18. [Agent Ownership](#18-agent-ownership)
19. [Current Status](#19-current-status)

---

## 1. The Problem

Affiliate creators fail to earn consistently because of:

- **Manual product hunting** — browsing Amazon daily for deals is tedious
- **Design effort** — creating attractive posts for each product takes time
- **Posting inconsistency** — missing schedules kills audience engagement and revenue
- **Limited time** — side-hustle creators can't dedicate hours daily

Result: most affiliate marketers give up within weeks despite having an audience ready to buy.

---

## 2. The Solution

**Affiliate Autoposter** eliminates all manual work:

1. Connect your Amazon Associates account (one-time setup)
2. Connect your Telegram channel (one-time setup)
3. Pick product categories and set a posting schedule
4. The system runs 100% automatically — fetch deals, generate posts, publish on time
5. Check your dashboard for post stats, clicks, and estimated earnings

**For users:** passive affiliate earnings via automation.
**For the platform:** recurring subscription revenue.

---

## 3. How It Works — User Journey

```
Step 1 → User visits platform → signs up with email or Google OAuth
Step 2 → User registers on Amazon Associates → gets affiliate tag
Step 3 → User creates Telegram Bot + channel → gets bot token + channel ID
Step 4 → User connects both on the platform settings page
Step 5 → User picks product categories (Electronics, Fashion, Deals, etc.)
Step 6 → User sets schedule: "Post 5 times/day at 9AM, 12PM, 3PM, 6PM, 9PM"
Step 7 → System runs automatically: fetch → generate → publish (zero manual work)
Step 8 → User logs in to dashboard: posts made, clicks, estimated earnings
```

---

## 4. How Money Flows

```
Amazon PA API → Platform fetches top deals + affiliate links
             → Auto-generates text/image posts
             → Posts to Telegram / Pinterest / Instagram / Twitter
             → User's audience clicks → lands on Amazon
             → Audience purchases → affiliate commission (2–9% per sale)
             → User pays platform a monthly subscription

Platform earns: subscription revenue
Users earn:     affiliate commissions from Amazon
```

---

## 5. Target Users

| Segment | Description |
|---------|-------------|
| Individual affiliate marketers | People running Amazon affiliate programs manually today |
| Content creators | Users with existing Telegram/Pinterest audiences |
| Side-hustle users | People with limited daily time who want passive income |

---

## 6. Tech Stack

### V1 (Current — MVP)

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18 + Vite + TypeScript + Tailwind CSS + React Query + Recharts |
| **Backend** | Spring Boot 3 + Spring Security + JWT + OAuth2 + Spring Data JPA + Quartz |
| **API Gateway** | Spring Cloud Gateway + Eureka Service Discovery |
| **Database** | PostgreSQL (one DB, schema-per-service) |
| **Cache** | Redis (product cache, rate limiting, token blacklist) |
| **Scheduler** | Quartz (JDBC JobStore, per-user CronTriggers) |
| **External APIs** | Amazon PA API 5.0, Telegram Bot API |
| **Build** | Maven (backend), Vite (frontend) |
| **Containerization** | Docker + Docker Compose |
| **CI/CD** | GitHub Actions |
| **Deployment** | Railway / Render |

### Future Additions (V2–V4)

| Version | Additions |
|---------|-----------|
| V2 | Playwright (HTML→PNG image generation), Cloudinary CDN, Pinterest API v5, Flipkart API |
| V3 | Spring AI (OpenAI/Gemini), Kafka event pipeline, ClickHouse analytics, Instagram/Twitter/WhatsApp APIs |
| V4 | Stripe/Razorpay billing, Kubernetes (EKS/GKE), AWS RDS + S3 + CloudFront, Grafana + Prometheus, React Native mobile app |

---

## 7. System Architecture

### High-Level Architecture (V1)

```
                    ┌─────────────────────────────────┐
                    │        FRONTEND (React 18)       │
                    │   Vite + TypeScript + Tailwind    │
                    └──────────────┬──────────────────┘
                                   │ HTTPS
                    ┌──────────────▼──────────────────┐
                    │         API GATEWAY (:8080)       │
                    │    Spring Cloud Gateway + Eureka  │
                    │  JWT validate · CORS · rate-limit │
                    │  traceId inject · route to service│
                    └──┬───────┬────────┬──────────────┘
                       │       │        │
           ┌───────────┘       │        └──────────────────┐
           │                   │                           │
┌──────────▼──────┐   ┌────────▼──────────┐   ┌──────────▼────────┐
│  AUTH SERVICE    │   │ USER CONFIG SVC    │   │ DASHBOARD SERVICE  │
│  :8081           │   │ :8082              │   │ :8086              │
│  Register/Login  │   │ Amazon/Telegram    │   │ Analytics/History  │
│  OAuth · JWT     │   │ config CRUD        │   │ Post summaries     │
└─────────────────┘   └────────────────────┘   └───────────────────┘

           ┌───────────────────────────────────────────────┐
           │            SCHEDULER SERVICE (:8083)           │
           │         Quartz per-user job management         │
           └─────────────────┬─────────────────────────────┘
                             │ triggers
           ┌─────────────────▼─────────────────────────────┐
           │            FETCHER SERVICE (:8084)              │
           │      Amazon PA API calls · product cache        │
           └─────────────────┬─────────────────────────────┘
                             │ sends product payload
           ┌─────────────────▼─────────────────────────────┐
           │            PUSHER SERVICE (:8085)               │
           │     Telegram publish · retry · post record      │
           └────────────────────────────────────────────────┘

        ┌──────────────────────────────────────────────────┐
        │          EUREKA SERVICE REGISTRY (:8761)          │
        │   All services register here on startup            │
        └──────────────────────────────────────────────────┘

        ┌──────────────┐    ┌──────────────┐
        │  PostgreSQL   │    │    Redis      │
        │  (5 schemas)  │    │  (cache/auth) │
        └──────────────┘    └──────────────┘
```

### Communication Patterns

```
Frontend → API Gateway → Service             (REST, JWT in header)
Scheduler → Fetcher                          (internal REST: POST /internal/fetch)
Fetcher → Pusher                             (internal REST: POST /internal/push)
Pusher → DB                                  (writes post_event; Dashboard reads it)
```

Internal APIs (`/internal/**`) are NOT exposed through the API Gateway — reachable only within the Docker network.

### Request Flow

```
1. Frontend sends request with JWT → API Gateway (:8080)
2. Gateway validates JWT, injects X-User-Id and X-Trace-Id headers
3. Gateway looks up target service instance from Eureka
4. Gateway proxies request to target service
5. Service processes request (trusts X-User-Id, never re-validates JWT)
6. Service returns response through Gateway to Frontend
```

---

## 8. Backend Microservices

| Service | Port | Responsibility | DB Schema | Status |
|---------|------|----------------|-----------|--------|
| **Eureka Service** | 8761 | Service registry — all services register here | None | Implemented |
| **API Gateway** | 8080 | Route, JWT validate, rate-limit, CORS, traceId | None | Not started |
| **Auth Service** | 8081 | Register, login, Google OAuth, JWT issue/refresh/revoke | `auth` | Not started |
| **User Config Service** | 8082 | Amazon/Telegram config CRUD, encrypted credentials | `user_config` | Not started |
| **Scheduler Service** | 8083 | Quartz per-user jobs, plan limit enforcement | `scheduler` | Not started |
| **Fetcher Service** | 8084 | Amazon PA API calls, product cache in Redis, selection | `products` | Not started |
| **Pusher Service** | 8085 | Telegram publish, retry logic, post event persistence | `post_events` | Not started |
| **Dashboard Service** | 8086 | Analytics summaries, post history, category breakdown | reads `post_events` | Not started |

### Startup Order

```
1. eureka-service  (:8761)   ← must be healthy first
2. auth-service, user-config-service, scheduler-service,
   fetcher-service, pusher-service, dashboard-service
   (all register with Eureka on startup)
3. api-gateway (:8080)       ← discovers services from Eureka, then opens for traffic
```

### Scheduler Design (Core Automation Engine)

```
Step 1: Read userId from Quartz JobDataMap
Step 2: Check schedule is still active
Step 3: Count posts today vs plan limit (FREE=3, PRO=20, AGENCY=unlimited)
Step 4: Verify Amazon + Telegram configs are active (internal API call)
Step 5: Call Fetcher → Fetcher calls Amazon PA API → returns best product
Step 6: Fetcher calls Pusher → Pusher publishes to Telegram
Step 7: Record job outcome (SUCCESS / FAILED / SKIPPED)
```

Quartz jobs are idempotent and persist across restarts via JDBC JobStore.

---

## 9. Frontend Pages & Features

### Route Map

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

### Key Screens

**Login/Register** — Split-screen: brand panel (gradient + value props) on left, auth form on right.

**Setup Wizard (4 Steps)**:
1. Amazon Configuration — API keys, affiliate tag, region
2. Telegram Configuration — bot token, channel ID, test message
3. Categories & Filters — multi-select categories, min rating, discount filters
4. Schedule Setup — timezone, posts per day, time slots, active days

**Dashboard**:
- 4 stat cards: Posts Today, This Week, All Time, Estimated Earnings
- Recent posts table with status pills (Published/Failed/Pending)
- Category breakdown donut chart (Recharts)
- Quick action links to edit config/schedule

**Schedule Management**:
- Weekly grid view with scheduled time slots
- Settings panel (timezone, posts/day, active days)
- Activate/deactivate toggle
- Save & Apply actions

### State Management

| Type | Technology |
|------|-----------|
| Server state | React Query (TanStack Query) — all API data |
| Local UI state | useState/useReducer for forms |
| Auth tokens | In-memory (sessionStorage fallback) |
| Error handling | Centralized toast system + route-level error boundaries |

---

## 10. Database Design

**Single PostgreSQL database** (`autoposter_db`) with **schema-per-service** isolation.

### Schema: `auth` (Auth Service)

| Table | Key Columns |
|-------|-------------|
| `auth.users` | id, email, password_hash, name, provider (LOCAL/GOOGLE), is_active |
| `auth.refresh_tokens` | user_id, token_hash, expires_at, revoked |
| `auth.login_attempts` | email, ip_address, success (brute-force tracking) |

### Schema: `user_config` (User Config Service)

| Table | Key Columns |
|-------|-------------|
| `user_config.amazon_credentials` | user_id, access_key_enc (AES-256-GCM), secret_key_enc, affiliate_tag, categories, min_discount_pct |
| `user_config.telegram_credentials` | user_id, bot_token_enc (AES-256-GCM), channel_id, channel_name |
| `user_config.user_profiles` | user_id, timezone, plan (FREE/PRO/AGENCY), plan_expiry |

### Schema: `scheduler` (Scheduler Service)

| Table | Key Columns |
|-------|-------------|
| `scheduler.schedules` | user_id, posts_per_day, posting_times[], active_categories[], is_active, quartz_job_key |
| `scheduler.job_runs` | user_id, triggered_at, status (RUNNING/SUCCESS/FAILED/SKIPPED), products_posted |

### Schema: `products` (Fetcher Service)

| Table | Key Columns |
|-------|-------------|
| `products.products` | asin, title, price, discount_pct, rating, image_url, category, fetched_at |
| `products.fetch_log` | user_id, category, fetched_count, selected_asin |

### Schema: `post_events` (Pusher writes, Dashboard reads)

| Table | Key Columns |
|-------|-------------|
| `post_events.posts` | user_id, asin, product_title, platform, status (PENDING/POSTED/FAILED), posted_at |
| `post_events.post_delivery_log` | post_id, attempt_number, response_code, success |

### Redis Keys

| Key Pattern | Purpose | TTL |
|-------------|---------|-----|
| `token_blacklist:{jti}` | Logout/revoke JWT | Token remaining life |
| `login_fail:{email}` | Brute-force guard | 15 min |
| `product_cache:{category}` | Shared product pool | 1 hr |
| `posted_products:{userId}` | Dedup — avoid reposting | 30 days |
| `rate_limit:{userId}:{endpoint}` | Request rate limiting | 1 min |

---

## 11. API Overview

### Public APIs (through API Gateway :8080)

**Auth:**
- `POST /api/auth/register` — email/password registration
- `POST /api/auth/login` — email/password login
- `POST /api/auth/refresh` — refresh access token
- `POST /api/auth/logout` — revoke token (blacklist JTI in Redis)
- `GET /oauth2/callback/google` — Google OAuth flow

**Config:**
- `GET/PUT /api/amazon-config` — manage Amazon credentials (keys never returned)
- `GET/PUT /api/telegram-config` — manage Telegram config (bot token never returned)
- `POST /api/telegram-config/test` — send test message to verify connection

**Schedule:**
- `GET/PUT /api/schedule` — view/update posting schedule
- `POST /api/schedule/activate` — start automated posting
- `POST /api/schedule/deactivate` — pause posting (config preserved)
- `GET /api/schedule/history` — paginated job run history

**Dashboard:**
- `GET /api/dashboard/summary` — posts today/week/all-time, success rate
- `GET /api/dashboard/recent-posts` — paginated recent post list
- `GET /api/dashboard/category-breakdown` — posts per category

### Internal APIs (service-to-service, not exposed)

- `POST /internal/fetch` — Scheduler triggers Fetcher
- `POST /internal/push` — Fetcher triggers Pusher
- `GET /internal/config-status/{userId}` — Scheduler checks user readiness

### Standard Response Format

```json
{
  "success": true,
  "data": { },
  "error": null,
  "traceId": "abc-123",
  "timestamp": "2026-02-25T10:30:00Z"
}
```

---

## 12. Security Design

| Area | Implementation |
|------|---------------|
| **Authentication** | JWT (HS256) — 15 min access token, 7 day refresh token |
| **OAuth** | Google OAuth2 via Spring Security |
| **Authorization** | All `/api/**` protected by JWT at Gateway; every query scoped by `user_id` |
| **Secret encryption** | Amazon keys + Telegram bot tokens encrypted with AES-256-GCM using `ENCRYPTION_MASTER_KEY` |
| **Brute-force protection** | 5 failed logins in 15 min → account locked (Redis-tracked) |
| **Rate limiting** | Per-user, per-endpoint rate limits at API Gateway |
| **Audit logging** | Auth events, config changes, post attempts — all logged with traceId |
| **No PII in logs** | Credentials and personal data never appear in log lines |
| **Internal isolation** | `/internal/**` endpoints reachable only within Docker network |
| **Token revocation** | On logout, JTI stored in Redis with TTL = remaining token lifetime |

---

## 13. Infrastructure & DevOps

### Environments

| Environment | Purpose | Target |
|-------------|---------|--------|
| Dev | Local development | Docker Compose (PostgreSQL + Redis) |
| Stage | Integration validation | Railway / Render (auto-deploy from `dev` branch) |
| Prod | Live traffic | Railway / Render (deploy from `main` with manual approval) |

### CI/CD Pipeline (GitHub Actions)

```
1. Checkout + dependency restore
2. Build + unit tests (mvn clean package)
3. Static checks (lint/format)
4. Container image build + tag (commit SHA)
5. Deploy to stage (on dev merge) or prod (on main merge + approval)
```

### Branch Strategy

```
Feature branches → PR to dev → auto-deploy to Stage
dev → PR to main → manual approval → deploy to Prod
```

### Observability

- **Metrics:** Request latency, 5xx rate, scheduler outcomes, external API status
- **Logging:** Structured JSON with traceId correlation
- **Alerts:** High error ratio, repeated scheduler failures, API error spikes, DB pool exhaustion
- **Dashboards:** API health, scheduler outcomes, dependency status, DB/Redis availability

### Backup & Recovery (V1)

- Daily PostgreSQL backups (7 days stage, 30 days prod)
- RPO: 24 hours | RTO: same-day
- Recovery: restore snapshot → validate schema → re-enable scheduler → smoke-test flows

---

## 14. Product Roadmap (V1–V4)

### V1 — Foundation & Core MVP (In Progress)

> **Goal:** End-to-end automation from Amazon to Telegram. Prove the idea.

| Feature | Included |
|---------|----------|
| User registration + login (JWT + Google OAuth) | Yes |
| Amazon PA API product fetcher | Yes |
| Telegram auto-publisher | Yes |
| Per-user post scheduling (Quartz) | Yes |
| Basic dashboard (posts today, this week, history) | Yes |
| User config (Amazon API keys, Telegram bot token) | Yes |
| Setup wizard (4-step onboarding) | Yes |

**Exit criteria:** Complete user journey runs without manual backend trigger. Failed posts captured. Dashboard accurate.

---

### V2 — Visual Layer & Pinterest Expansion

> **Goal:** Improve post quality with generated images. Add Pinterest for long-tail traffic.

| Feature | Details |
|---------|---------|
| HTML/CSS product card templates | 5–10 template designs |
| Headless browser rendering | Playwright → PNG export |
| Cloud image storage + CDN | Cloudinary |
| Pinterest publisher | Pinterest API v5 |
| Template selection per user | Persisted preference |
| Flipkart affiliate support | Additional product source |

**Why Pinterest?** Pins have a lifespan of months to years — compounding passive income unlike Instagram/Twitter where posts die within hours.

---

### V3 — Multi-Platform & AI Smart Picks

> **Goal:** Expand to more platforms. Use AI to pick better products.

| Feature | Details |
|---------|---------|
| New publishers | Instagram, Twitter/X, WhatsApp, Facebook |
| AI product ranking | OpenAI / Gemini via Spring AI |
| Click tracking | Custom short URLs with platform/country/device tagging |
| Earnings estimation | Amazon reporting API integration |
| A/B template testing | Compare template performance |
| Async event pipeline | Kafka replaces synchronous Fetcher→Pusher calls |
| High-perf analytics | ClickHouse for click/analytics storage |

**Architecture change:** V1/V2 synchronous internal REST → V3 Kafka event-driven pipeline. Adding new platforms requires only a new consumer.

---

### V4 — Full SaaS Scale

> **Goal:** Transform into a polished, multi-tenant SaaS business.

| Feature | Details |
|---------|---------|
| Subscription billing | Razorpay / Stripe with plan enforcement |
| Multi-account support | One user manages multiple affiliate accounts + channels |
| Team/agency mode | Invite members, manage multiple clients |
| White-label capability | For agencies reselling the platform |
| Mobile app | React Native (dashboard on the go) |
| Webhook notifications | WhatsApp/email alerts for earnings milestones |
| Product blacklist + custom rules | Per-user posting rules |
| AWS production stack | RDS, S3, CloudFront |
| Kubernetes | EKS/GKE with horizontal autoscaling |
| Production observability | Grafana + Prometheus dashboards and alerts |

---

## 15. Monetization & Pricing

| Plan | Price | Key Limits |
|------|-------|------------|
| **FREE** | Rs.0/month | 3 posts/day, 1 category, Telegram only |
| **PRO** | Rs.299/month | 20 posts/day, all categories, all platforms (V2+), analytics |
| **AGENCY** | Rs.999/month | Unlimited posts, 5 affiliate accounts, AI picks, white-label |

---

## 16. Design System

### Visual Identity

- **Theme:** Dark mode (slate backgrounds: `#0F172A` base, `#1E293B` surfaces)
- **Brand colors:** Indigo (`#6366F1`) primary, Violet (`#8B5CF6`) secondary
- **Brand gradient:** `linear-gradient(135deg, #6366F1, #8B5CF6)`
- **Font:** Inter (Google Fonts) — all UI
- **Icons:** Heroicons (Outline for navigation, Solid for status)
- **Effects:** Glassmorphism cards, brand glow on CTAs

### Component Library

| Layer | Components |
|-------|-----------|
| **Atoms** | Button, Input, Select, Checkbox, Toggle, Badge/Pill, Avatar, Spinner, Tooltip |
| **Molecules** | FormField, SearchableSelect, TimePicker, CategoryChip, DayToggle, StatusPill, StatCard |
| **Organisms** | AuthCard, BrandPanel, Stepper, RecentPostsTable, CategoryDonutChart, WeeklyScheduleGrid, SidebarNav, TopNavBar |
| **Layouts** | AuthLayout (split-screen), AppShell (sidebar + content), SetupWizardLayout (centered card) |

### Responsive Breakpoints

| Breakpoint | Layout |
|-----------|--------|
| Mobile (`< 640px`) | Bottom tab bar, stacked cards, full-width forms |
| Tablet (`640–1024px`) | 8-column grid, 2x2 stat cards |
| Desktop (`> 1024px`) | 12-column grid, 240px sidebar, full table views |

---

## 17. Project Structure

```
affiliate-autoposter/
├── CLAUDE.md                 ← Infra/DevOps/testing/product rules
├── AGENTS.md                 ← Backend development rules
├── GEMINI.md                 ← Frontend development rules
├── README.md                 ← Entry point
│
├── docs/
│   ├── PLAN.md               ← Master plan with version map
│   ├── overview/
│   │   ├── product-vision.md
│   │   └── glossary.md
│   └── phases/
│       ├── v1-foundation-and-mvp.md
│       ├── v2-visual-pinterest.md
│       ├── v3-multiplatform-ai.md
│       └── v4-saas-scale.md
│
├── autoposter-backend/       ← Spring Boot microservices (Maven multi-module)
│   ├── pom.xml               ← Parent POM
│   ├── eureka-service/       ← Service registry (:8761) — IMPLEMENTED
│   └── docs/
│       ├── v1.md             ← Full backend V1 spec
│       ├── v2.md, v3.md, v4.md
│
├── frontend/                 ← React 18 + Vite + TypeScript
│   ├── src/
│   │   ├── features/         ← auth, settings, schedule, dashboard
│   │   ├── components/       ← shared UI components
│   │   ├── layouts/          ← AuthLayout, AppShell
│   │   └── lib/              ← API client, auth helpers
│   └── docs/
│       ├── v1.md             ← Full frontend V1 spec
│       ├── design/           ← Design specification + flows
│       ├── v2.md, v3.md, v4.md
│
└── infra/                    ← Docker Compose, CI/CD, deployment configs
    └── docs/
        ├── v1.md             ← Full infra V1 spec
        ├── v2.md, v3.md, v4.md
```

---

## 18. Agent Ownership

This project uses a multi-agent development approach:

| Agent | Config File | Owns |
|-------|------------|------|
| **Claude** (Claude Code) | `CLAUDE.md` | Infrastructure, DevOps, cloud, CI/CD, testing, product decisions |
| **Codegen** (Windsurf/Cursor) | `AGENTS.md` | Backend: APIs, services, data model, auth, integrations |
| **Gemini** | `GEMINI.md` | Frontend: React components, UI/UX, styling, routing |

---

## 19. Current Status

| Component | Status |
|-----------|--------|
| Documentation & planning | Complete for V1–V4 |
| Design specification | Complete (dark theme, component library, all screens) |
| Eureka service registry | Implemented and Dockerized |
| API Gateway | Not started |
| Auth Service | Not started |
| User Config Service | Not started |
| Scheduler Service | Not started |
| Fetcher Service | Not started |
| Pusher Service | Not started |
| Dashboard Service | Not started |
| Frontend application | Not started |
| Infrastructure (Docker Compose, CI/CD) | Not started |

### Next Steps (in order)

1. `api-gateway` — Spring Cloud Gateway with Eureka, JWT filter, rate-limiting, CORS, traceId
2. `auth-service` — register/login, Google OAuth, JWT issue/refresh/revoke, Redis blacklist
3. `user-config-service` — Amazon/Telegram config CRUD with AES-256-GCM encryption
4. `scheduler-service` — Quartz scheduler, per-user jobs, triggers Fetcher
5. `fetcher-service` — Amazon PA API calls, Redis product cache, selection logic
6. `pusher-service` — Telegram publish, retry, post event persistence
7. `dashboard-service` — read post_events, return analytics and history
8. Frontend application — auth pages, setup wizard, dashboard, schedule management
9. Infrastructure — Docker Compose for all services, GitHub Actions CI/CD, Railway/Render deployment

---

*This document is the single-source overview of the Affiliate Autoposter project. For detailed specs, refer to the version-specific docs linked in [Project Structure](#17-project-structure).*
