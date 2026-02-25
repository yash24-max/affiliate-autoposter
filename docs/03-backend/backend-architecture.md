# Backend Architecture — Microservice Design

## Architecture Style
True microservice architecture. Each service is independently deployable,
owns its own database schema, and communicates through the API Gateway
(for frontend calls) or internal REST/event bus (for service-to-service calls).

---

## High-Level Architecture Diagram

```
                        ┌─────────────────────────────┐
                        │        FRONTEND (React)      │
                        └──────────────┬──────────────┘
                                       │ HTTPS
                        ┌──────────────▼──────────────┐
                        │         API GATEWAY          │
                        │   (Spring Cloud Gateway)     │
                        │                              │
                        │  • Route to microservices    │
                        │  • JWT validation            │
                        │  • Rate limiting             │
                        │  • Request logging           │
                        │  • CORS                      │
                        └──┬───────┬────────┬──────────┘
                           │       │        │
           ┌───────────────┘       │        └──────────────────┐
           │                       │                           │
┌──────────▼──────┐   ┌────────────▼──────────┐   ┌──────────▼────────┐
│  AUTH SERVICE   │   │   USER CONFIG SERVICE  │   │ DASHBOARD SERVICE  │
│                 │   │                        │   │                   │
│ • Register      │   │ • Amazon config CRUD   │   │ • Summary stats   │
│ • Login         │   │ • Telegram config CRUD │   │ • Recent posts    │
│ • Google OAuth  │   │ • Schedule config CRUD │   │ • Category charts │
│ • JWT issue     │   │ • Validate connections │   │ • Post history    │
│ • Token refresh │   │                        │   │                   │
│ • Token revoke  │   │  DB: user_config schema│   │  DB: reads from   │
│                 │   │                        │   │  post_events      │
│  DB: auth schema│   └────────────────────────┘   └───────────────────┘
└─────────────────┘

           ┌─────────────────────────────────────────────────┐
           │               SCHEDULER SERVICE                  │
           │                                                  │
           │  • Per-user Quartz job management               │
           │  • Create / update / delete posting jobs        │
           │  • Activate / deactivate per user               │
           │  • Triggers Fetcher Service on schedule         │
           │                                                  │
           │  DB: schedules, job_runs schema                 │
           └─────────────────┬────────────────────────────────┘
                             │ triggers (internal REST or event)
           ┌─────────────────▼────────────────────────────────┐
           │               FETCHER SERVICE                     │
           │                                                   │
           │  • Calls Amazon PA API per user config           │
           │  • Filters by discount %, rating, category       │
           │  • Normalizes product metadata                   │
           │  • Caches products in Redis (shared)             │
           │  • Selects unposted product for this user        │
           │  • Sends product to Pusher Service               │
           │                                                   │
           │  DB: products, product_fetch_log schema          │
           │  Cache: Redis (product cache, posted dedup set)  │
           └─────────────────┬─────────────────────────────────┘
                             │ sends product payload
           ┌─────────────────▼─────────────────────────────────┐
           │               PUSHER SERVICE                       │
           │                                                    │
           │  • Receives product payload from Fetcher          │
           │  • Builds Telegram message (text + image)         │
           │  • Posts to user's Telegram channel               │
           │  • Records post result (POSTED / FAILED)          │
           │  • Retries on transient failures (max 3 attempts) │
           │  • Emits post_event for Dashboard to consume      │
           │                                                    │
           │  DB: post_deliveries, post_events schema          │
           └────────────────────────────────────────────────────┘
```

---

## Services Summary

| Service | Port | Responsibility | DB Schema |
|---|---|---|---|
| API Gateway | 8080 | Route, auth-verify, rate-limit, CORS | None |
| Auth Service | 8081 | Register, login, OAuth, JWT | `auth` |
| User Config Service | 8082 | Amazon/Telegram/Schedule config CRUD | `user_config` |
| Scheduler Service | 8083 | Quartz per-user job management | `scheduler` |
| Fetcher Service | 8084 | Amazon PA API, product cache, selection | `products` |
| Pusher Service | 8085 | Telegram publish, retry, post record | `post_events` |
| Dashboard Service | 8086 | Analytics, summaries, post history | reads `post_events` |

---

## Data Store Ownership

```
PostgreSQL (one DB, separate schemas per service)
├── auth schema          → Auth Service owns this
├── user_config schema   → User Config Service owns this
├── scheduler schema     → Scheduler Service owns this
├── products schema      → Fetcher Service owns this
└── post_events schema   → Pusher Service writes, Dashboard reads

Redis (shared)
├── product_cache:{category}         → Fetcher writes, Fetcher reads
├── posted_products:{userId}         → Pusher writes (dedup set)
├── rate_limit:{userId}              → API Gateway uses
└── token_blacklist:{jti}            → Auth Service uses
```

---

## Communication Patterns

```
Frontend → API Gateway → Service         (REST, JWT in header)
Scheduler → Fetcher                      (internal REST POST /internal/fetch)
Fetcher → Pusher                         (internal REST POST /internal/push)
Pusher → Dashboard                       (async: write post_event to DB)
```

V1 uses synchronous internal REST calls (simple, no infra overhead).
V3+ migrates Fetcher → Pusher to Kafka for async, at-least-once delivery.

---

## Reliability Decisions

- Every post attempt is persisted before and after the Telegram call
- Pusher retries up to 3 times with exponential backoff on transient errors
- Fetcher deduplicates products per user using Redis SET (posted_products)
- Scheduler jobs are idempotent — re-triggering the same job does not double-post
- API Gateway validates JWT so individual services trust the gateway header

---

## V1 vs Future Migration Path

```
V1 (Monorepo, separate Spring Boot modules, single deploy)
→ All services in one repo, one docker-compose, separate packages

V2 (True separate deployables)
→ Each service its own Spring Boot JAR, own Dockerfile, own deploy

V3+ (Event-driven)
→ Fetcher → Kafka topic → Pusher consumes
→ Add Pinterest Pusher, Twitter Pusher as separate consumers
```
