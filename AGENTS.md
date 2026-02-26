# Repository Guidelines

## Scope and Ownership
This file governs backend development only.

AGENTS.md owns:
- Backend architecture and module boundaries
- API design and request/response contracts
- Business logic and service-layer behavior
- Database schema and data access patterns
- Authentication and authorization flows
- External integrations (for example Amazon, Telegram)
- Server-side performance and reliability concerns

AGENTS.md does not own:
- Frontend work (owned by `GEMINI.md`)
- Infrastructure, DevOps, cloud, testing frameworks, and product decisions (owned by `CLAUDE.md`)

## Backend Structure & Module Organization

All backend code lives under `autoposter-backend/`. It is a Maven multi-module project.
The parent POM is `autoposter-backend/pom.xml`.

### Service Registry (must start first)

| Module | Port | Role | Status |
|--------|------|------|--------|
| `eureka-service` | 8761 | Spring Cloud Netflix Eureka Server — all other services register here on startup | **Implemented** |

Every subsequent service is a Eureka **client** that registers with the registry on boot.
The API Gateway discovers service instances from Eureka and routes traffic dynamically.

### Application Services (start after Eureka)

| Module | Port | Responsibility | DB Schema | Status |
|--------|------|----------------|-----------|--------|
| `api-gateway` | 8080 | Route, JWT validate, rate-limit, CORS, traceId inject | None | Not started |
| `auth-service` | 8081 | Register, login, Google OAuth, JWT issue/refresh/revoke | `auth` | Not started |
| `user-config-service` | 8082 | Amazon/Telegram/Schedule config CRUD, config status | `user_config` | Not started |
| `scheduler-service` | 8083 | Quartz per-user job management, plan limit enforcement | `scheduler` | Not started |
| `fetcher-service` | 8084 | Amazon PA API calls, product cache, selection | `products` | Not started |
| `pusher-service` | 8085 | Telegram publish, retry, post record | `post_events` | Not started |
| `dashboard-service` | 8086 | Analytics, summaries, post history | reads `post_events` | Not started |

### Startup Order

```
1. eureka-service  (:8761)  ← must be healthy before anything else starts
2. auth-service, user-config-service, scheduler-service,
   fetcher-service, pusher-service, dashboard-service
   (all register with Eureka on startup)
3. api-gateway     (:8080)  ← discovers registered services from Eureka, then opens for traffic
```

### Request Flow

```
Frontend → API Gateway (:8080)
         → validates JWT, injects X-User-Id header
         → looks up service instance from Eureka
         → proxies to target service

Internal:  Scheduler → Fetcher (:8084, POST /internal/fetch)
           Fetcher   → Pusher  (:8085, POST /internal/push)
           Pusher    → writes post_event to DB (Dashboard reads it)
```

Keep controllers thin, services explicit, and repositories focused on persistence concerns.

## Backend Documentation
- Full V1 specification: [`autoposter-backend/docs/v1.md`](autoposter-backend/docs/v1.md)
- V2 delta (image templates, Pinterest): [`autoposter-backend/docs/v2.md`](autoposter-backend/docs/v2.md)
- V3 delta (multi-platform, AI, Kafka): [`autoposter-backend/docs/v3.md`](autoposter-backend/docs/v3.md)
- V4 delta (billing, agency, SaaS scale): [`autoposter-backend/docs/v4.md`](autoposter-backend/docs/v4.md)

## Backend Development Commands
Run commands from `autoposter-backend/`:
- `mvn spring-boot:run -pl eureka-service`: start Eureka locally.
- `mvn clean package`: compile and package all modules.
- `mvn test`: run the verification suite.
- `docker compose up --build`: build and start services via Docker (see `docker-compose.yml`).

Use `rg` for fast backend search, for example:
- `rg "POST /api/schedule" autoposter-backend/docs`

## What Is Next

Eureka service registry is complete and Dockerized. The next steps in order are:

1. **`api-gateway`** — add as a Maven module, configure Spring Cloud Gateway with Eureka discovery, JWT filter, rate-limiting, CORS, and traceId injection.
2. **`auth-service`** — register/login endpoints, Google OAuth, JWT issue/refresh/revoke, Redis token blacklist.
3. **`user-config-service`** — Amazon PA API key + Telegram token storage (AES-256-GCM encrypted), schedule config CRUD.
4. **`scheduler-service`** — Quartz scheduler, per-user jobs, triggers Fetcher.
5. **`fetcher-service`** — Amazon PA API calls, product cache in Redis, selection logic.
6. **`pusher-service`** — Telegram publish, retry logic, post event persistence.
7. **`dashboard-service`** — read `post_events`, return analytics and post history.
8. **`docker-compose.yml` expansion** — add PostgreSQL, Redis, and all new services alongside eureka-service.
9. **`infra/docker-compose.yml`** — local dev environment (PostgreSQL + Redis only, for running services outside Docker).

## API, Auth, and Data Conventions
- Follow API naming and field contracts in `backend/docs/v1.md`.
- Standardize error responses with `errorCode`, `message`, `traceId`, and `timestamp`.
- Enforce least-privilege authorization on every protected endpoint.
- Never store integration credentials in plaintext; use encrypted-at-rest patterns.
- Keep schema evolution backward-compatible where possible; use additive changes before removals.

## Performance and Integration Guidelines
- Design idempotent scheduling and posting operations.
- Add timeouts, retries, and failure logging for external API calls.
- Protect critical paths with caching and query optimization when latency rises.
- Persist integration outcomes for auditability and recovery.

## Commit and PR Guidelines (Backend)
- Use Conventional Commits with backend scope, for example `feat(backend): add dashboard summary service`.
- One PR should target one backend concern (API, auth, data model, integration, or performance improvement).
- PR description must include affected endpoints/modules and any schema or auth impact.
