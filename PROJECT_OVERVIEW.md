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
8. [Backend Services](#8-backend-services)
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
| **Backend** | Spring Boot 3 + Spring Security + JWT + OAuth2 + Spring Data JPA |
| **API Gateway** | Spring Cloud Gateway + Eureka Service Discovery |
| **Workflow Engine** | n8n (self-hosted) — cron scheduling, API orchestration, Telegram publishing |
| **Database** | PostgreSQL (autoposter_db: schema-per-service + n8n_db) |
| **Cache** | Redis (product cache, rate limiting, token blacklist) |
| **External APIs** | Amazon PA API 5.0, Telegram Bot API |
| **Build** | Maven (backend), Vite (frontend) |
| **Containerization** | Docker + Docker Compose |
| **CI/CD** | GitHub Actions |
| **Deployment** | Railway / Render |

### Future Additions (V2–V4)

| Version | Additions |
|---------|-----------|
| V2 | Playwright (HTML→PNG image generation), Cloudinary CDN, Pinterest API v5, Flipkart API |
| V3 | Spring AI (OpenAI/Gemini), n8n queue-based fan-out, ClickHouse analytics, Instagram/Twitter/WhatsApp APIs |
| V4 | Stripe/Razorpay billing, Kubernetes (EKS/GKE), AWS RDS + S3 + CloudFront, Grafana + Prometheus, React Native mobile app |

---

## 7. System Architecture

### Hybrid Architecture (V1)

The system uses a **hybrid architecture**: Spring Boot handles APIs, auth, and data persistence. **n8n workflow engine** handles automation (scheduling, product fetching, Telegram publishing). This eliminates 3 Spring Boot microservices that would otherwise be needed.

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
                    └──┬───────┬────────┬──────────┬──┘
                       │       │        │          │
           ┌───────────┘       │        │          └──────────────┐
           │                   │        │                         │
┌──────────▼──────┐  ┌────────▼─────┐  ▼─────────────────┐  ┌───▼──────────────┐
│  AUTH SERVICE    │  │ USER CONFIG  │  │ WORKFLOW BRIDGE   │  │ DASHBOARD SERVICE│
│  :8081           │  │ SERVICE      │  │ SERVICE :8083     │  │ :8086            │
│  Register/Login  │  │ :8082        │  │ n8n lifecycle     │  │ Analytics/History│
│  OAuth · JWT     │  │ Amazon/Tele  │  │ Config serving    │  │ Post summaries   │
│                  │  │ Schedule cfg │  │ Post event record │  │                  │
└─────────────────┘  └──────────────┘  └────────┬─────────┘  └──────────────────┘
                                                 │
                                                 │ REST API
                                                 ▼
                     ┌────────────────────────────────────────────┐
                     │          n8n WORKFLOW ENGINE (:5678)        │
                     │                                            │
                     │  ┌──────┐   ┌──────────┐   ┌───────────┐  │
                     │  │ Cron │──▶│ Amazon   │──▶│ Telegram  │  │
                     │  │Trigger│  │ PA API   │   │ Publish   │  │
                     │  └──────┘   └──────────┘   └───────────┘  │
                     │                                            │
                     │  Per-user workflow instances                │
                     └────────────────────────────────────────────┘

        ┌──────────────────────────────────────────────────┐
        │          EUREKA SERVICE REGISTRY (:8761)          │
        │   All Spring Boot services register here          │
        └──────────────────────────────────────────────────┘

        ┌──────────────┐    ┌──────────────┐
        │  PostgreSQL   │    │    Redis      │
        │  (2 databases)│    │  (cache/auth) │
        └──────────────┘    └──────────────┘
```

### Communication Patterns

```
Frontend → API Gateway → Service                (REST, JWT in header)
Gateway → workflow-bridge-service               (schedule activate/deactivate)
Bridge → n8n REST API                           (create/activate/deactivate workflows)
n8n → Bridge /internal/user-config/{userId}     (get decrypted credentials)
n8n → Amazon PA API                             (fetch products)
n8n → Telegram Bot API                          (publish posts)
n8n → Bridge /internal/post-event               (record results)
Dashboard → reads post_events schema            (analytics queries)
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

## 8. Backend Services

### Spring Boot Services (code)

| Service | Port | Responsibility | DB Schema | Status |
|---------|------|----------------|-----------|--------|
| **Eureka Service** | 8761 | Service registry — all services register here | None | Implemented |
| **API Gateway** | 8080 | Route, JWT validate, rate-limit, CORS, traceId | None | Not started |
| **Auth Service** | 8081 | Register, login, Google OAuth, JWT issue/refresh/revoke | `auth` | Not started |
| **User Config Service** | 8082 | Amazon/Telegram config CRUD, schedule config, encrypted credentials | `user_config` | Not started |
| **Workflow Bridge Service** | 8083 | n8n lifecycle management, config serving to n8n, post event recording | `bridge` + writes `post_events` | Not started |
| **Dashboard Service** | 8086 | Analytics summaries, post history, category breakdown | reads `post_events` | Not started |

### n8n Workflow Engine (automation)

| Component | Port | Responsibility |
|-----------|------|----------------|
| **n8n** | 5678 | Cron scheduling, Amazon PA API calls, Telegram publishing, retry/error handling |

### Services Eliminated by n8n

The original architecture had 8 Spring Boot microservices. The hybrid approach eliminates 3:

| ~~Service~~ | Replaced By |
|-------------|-------------|
| ~~Scheduler Service (Quartz)~~ | n8n Cron Trigger nodes — one workflow per user |
| ~~Fetcher Service~~ | n8n HTTP Request nodes — calls Amazon PA API directly |
| ~~Pusher Service~~ | n8n Telegram nodes — publishes to user's channel |

### Startup Order

```
1. eureka-service  (:8761)   ← must be healthy first
2. auth-service, user-config-service, workflow-bridge-service, dashboard-service
   (all register with Eureka on startup)
3. api-gateway (:8080)       ← discovers services from Eureka, then opens for traffic
4. n8n (:5678)               ← starts independently, calls bridge on workflow execution
```

### Posting Cycle (Core Automation)

```
Step 1: n8n Cron Trigger fires at user's scheduled time
Step 2: n8n calls bridge GET /internal/user-config/{userId} (decrypted credentials)
Step 3: n8n checks schedule is still active, posts today vs plan limit
Step 4: n8n calls Amazon PA API → returns trending products
Step 5: n8n selects best product (by discount%, rating, category match)
Step 6: n8n formats affiliate link + post text
Step 7: n8n sends to Telegram channel via Bot API
Step 8: n8n calls bridge POST /internal/post-event (record SUCCESS/FAILED)
```

Workflows are idempotent. Failures are captured by n8n's error workflow and recorded via bridge callback.

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

**Single PostgreSQL instance** (`autoposter_db`) with **schema-per-service** isolation.
**Separate database** (`n8n_db`) for n8n workflow state and execution history.

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
| `user_config.schedule_configs` | user_id, posts_per_day, posting_times[], active_categories[], is_active, timezone |

### Schema: `bridge` (Workflow Bridge Service)

| Table | Key Columns |
|-------|-------------|
| `bridge.workflow_instances` | user_id, n8n_workflow_id, is_active, cron_expression, created_at, updated_at |
| `bridge.job_runs` | user_id, workflow_instance_id, triggered_at, status (RUNNING/SUCCESS/FAILED/SKIPPED), products_posted, error_message |

### Schema: `post_events` (Bridge writes, Dashboard reads)

| Table | Key Columns |
|-------|-------------|
| `post_events.posts` | user_id, asin, product_title, affiliate_url, platform, status (PENDING/POSTED/FAILED), posted_at |
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

**Auth (auth-service):**
- `POST /api/auth/register` — email/password registration
- `POST /api/auth/login` — email/password login
- `POST /api/auth/refresh` — refresh access token
- `POST /api/auth/logout` — revoke token (blacklist JTI in Redis)
- `GET /oauth2/callback/google` — Google OAuth flow

**Config (user-config-service):**
- `GET/PUT /api/amazon-config` — manage Amazon credentials (keys never returned)
- `GET/PUT /api/telegram-config` — manage Telegram config (bot token never returned)
- `POST /api/telegram-config/test` — send test message to verify connection
- `GET/PUT /api/schedule` — view/update posting schedule configuration

**Schedule Control (workflow-bridge-service):**
- `POST /api/schedule/activate` — create & activate n8n workflow for user
- `POST /api/schedule/deactivate` — deactivate user's n8n workflow (config preserved)
- `GET /api/schedule/history` — paginated job run history

**Dashboard (dashboard-service):**
- `GET /api/dashboard/summary` — posts today/week/all-time, success rate
- `GET /api/dashboard/recent-posts` — paginated recent post list
- `GET /api/dashboard/category-breakdown` — posts per category

### Internal APIs (bridge ↔ n8n, not exposed)

- `GET /internal/user-config/{userId}` — n8n calls to get decrypted config
- `GET /internal/schedule-config/{userId}` — n8n calls to get schedule parameters
- `POST /internal/post-event` — n8n calls to record posting result
- `GET /internal/config-status/{userId}` — check if user has valid config

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
| **n8n encryption** | n8n credential store encrypted with `N8N_ENCRYPTION_KEY` |
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
| Dev | Local development | Docker Compose (PostgreSQL + Redis + n8n) |
| Stage | Integration validation | Railway / Render (auto-deploy from `dev` branch) |
| Prod | Live traffic | Railway / Render (deploy from `main` with manual approval) |

### CI/CD Pipeline (GitHub Actions)

```
1. Checkout + dependency restore
2. Build + unit tests (mvn clean package)
3. Static checks (lint/format)
4. Container image build + tag (commit SHA)
5. Validate n8n workflow JSON exports
6. Deploy to stage (on dev merge) or prod (on main merge + approval)
```

### Branch Strategy

```
Feature branches → PR to dev → auto-deploy to Stage
dev → PR to main → manual approval → deploy to Prod
```

### Observability

- **Metrics:** Request latency, 5xx rate, n8n workflow execution outcomes, external API status
- **Logging:** Structured JSON with traceId correlation
- **Alerts:** High error ratio, repeated workflow failures, API error spikes, DB pool exhaustion
- **Dashboards:** API health, workflow outcomes, dependency status, DB/Redis/n8n availability

### Backup & Recovery (V1)

- Daily PostgreSQL backups for both `autoposter_db` and `n8n_db` (7 days stage, 30 days prod)
- n8n workflow definitions exported as JSON and version-controlled
- RPO: 24 hours | RTO: same-day
- Recovery: restore snapshots → validate schemas → re-import n8n workflows → re-enable executions → smoke-test flows

---

## 14. Product Roadmap (V1–V4)

### V1 — Foundation & Core MVP (In Progress)

> **Goal:** End-to-end automation from Amazon to Telegram. Prove the idea.

| Feature | Included |
|---------|----------|
| User registration + login (JWT + Google OAuth) | Yes |
| Amazon PA API product fetcher (via n8n) | Yes |
| Telegram auto-publisher (via n8n) | Yes |
| Per-user scheduling (n8n workflow instances) | Yes |
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
| Headless browser rendering | Playwright → PNG export (sidecar container) |
| Cloud image storage + CDN | Cloudinary |
| Pinterest publisher | n8n Pinterest node (API v5) |
| Template selection per user | Persisted preference |
| Flipkart affiliate support | Additional product source via n8n HTTP node |

**Why Pinterest?** Pins have a lifespan of months to years — compounding passive income unlike Instagram/Twitter where posts die within hours.

---

### V3 — Multi-Platform & AI Smart Picks

> **Goal:** Expand to more platforms. Use AI to pick better products.

| Feature | Details |
|---------|---------|
| New publishers | Instagram, Twitter/X, WhatsApp, Facebook (n8n platform nodes) |
| AI product ranking | OpenAI / Gemini via Spring AI or n8n AI nodes |
| Click tracking | Custom short URLs with platform/country/device tagging |
| Earnings estimation | Amazon reporting API integration |
| A/B template testing | Compare template performance |
| Scalable scheduling | n8n queue-based fan-out (replaces per-user workflows) |
| High-perf analytics | ClickHouse for click/analytics storage |

**Architecture change:** V1/V2 one-workflow-per-user → V3 shared queue-based fan-out. Adding new platforms requires only a new n8n publisher node.

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
| n8n HA mode | Clustered n8n with queue-mode workers |
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
├── CLAUDE.md                 ← n8n workflows, code review, testing, task coordination
├── AGENTS.md                 ← Backend + CI/CD + infra + cloud + DevOps
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
├── autoposter-backend/       ← Spring Boot services (Maven multi-module)
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
├── n8n/                      ← n8n workflow exports and templates
│   └── workflows/            ← JSON workflow definitions (version-controlled)
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
| **Claude** (Claude Code) | `CLAUDE.md` | n8n workflow orchestration, code review, testing strategy, cross-cutting task coordination |
| **Codegen** (Windsurf/Cursor) | `AGENTS.md` | Backend services, CI/CD, infrastructure, cloud, DevOps |
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
| Workflow Bridge Service | Not started |
| Dashboard Service | Not started |
| n8n setup + workflow template | Not started |
| Frontend application | Not started |
| Infrastructure (Docker Compose, CI/CD) | Not started |

### Next Steps (in order)

1. `api-gateway` — Spring Cloud Gateway with Eureka, JWT filter, rate-limiting, CORS, traceId
2. `auth-service` — register/login, Google OAuth, JWT issue/refresh/revoke, Redis blacklist
3. `user-config-service` — Amazon/Telegram config CRUD + schedule config with AES-256-GCM encryption
4. `workflow-bridge-service` — n8n lifecycle management, config serving, post event recording
5. `dashboard-service` — read post_events, return analytics and history
6. n8n setup — Docker container, posting workflow template, bridge integration
7. Frontend application — auth pages, setup wizard, dashboard, schedule management
8. Infrastructure — Docker Compose for all services + n8n, GitHub Actions CI/CD, Railway/Render deployment

---

*This document is the single-source overview of the Affiliate Autoposter project. For detailed specs, refer to the version-specific docs linked in [Project Structure](#17-project-structure).*
