# Repository Guidelines

## Scope and Ownership

This file governs **backend development, CI/CD, infrastructure, cloud, and DevOps**.

AGENTS.md owns:
- Backend architecture and module boundaries
- API design and request/response contracts
- Business logic and service-layer behavior
- Database schema and data access patterns
- Authentication and authorization flows
- External integrations (Amazon PA API, Telegram Bot API)
- CI/CD pipeline design and implementation
- Infrastructure (Docker Compose, container orchestration)
- Cloud deployment (Railway/Render for V1, AWS for V4)
- Environment configuration and secret management
- Observability (metrics, logging, alerting, dashboards)
- Operational runbooks and backup/recovery

AGENTS.md does not own:
- Frontend work (owned by `GEMINI.md`)
- n8n workflow design, code review standards, testing strategy, or task coordination (owned by `CLAUDE.md`)

---

## Hybrid Architecture

This project uses a **hybrid architecture**: Spring Boot for APIs/auth/data + **n8n workflow engine** for automation. Three services that would have been Spring Boot microservices are replaced by n8n workflows.

---

## Backend Module Structure

All backend code lives under `autoposter-backend/`. It is a Maven multi-module project.
The parent POM is `autoposter-backend/pom.xml`.

### Service Registry (must start first)

| Module | Port | Role | Status |
|--------|------|------|--------|
| `eureka-service` | 8761 | Spring Cloud Netflix Eureka Server — all other services register here on startup | **Implemented** |

### Application Services (start after Eureka)

| Module | Port | Responsibility | DB Schema | Status |
|--------|------|----------------|-----------|--------|
| `api-gateway` | 8080 | Route, JWT validate, rate-limit, CORS, traceId inject | None | Not started |
| `auth-service` | 8081 | Register, login, Google OAuth, JWT issue/refresh/revoke | `auth` | Not started |
| `user-config-service` | 8082 | Amazon/Telegram config CRUD, schedule config, encrypted credentials | `user_config` | Not started |
| `workflow-bridge-service` | 8083 | n8n ↔ Spring Boot bridge: activate/deactivate workflows, serve config to n8n, record post events | `bridge` + writes `post_events` | Not started |
| `dashboard-service` | 8086 | Analytics summaries, post history, category breakdown | reads `post_events` | Not started |

### n8n Workflow Engine (not a Spring Boot module)

| Component | Port | Role |
|-----------|------|------|
| n8n | 5678 | Workflow automation — cron scheduling, Amazon PA API calls, Telegram publishing |

n8n runs as a Docker container, not as a Maven module. See `CLAUDE.md` for workflow design details.

### Services Eliminated by n8n

These services from the original 8-service architecture are **no longer needed**:

| ~~Service~~ | ~~Port~~ | Replaced By |
|-------------|----------|-------------|
| ~~scheduler-service~~ | ~~8083~~ | n8n Cron Trigger nodes (per-user workflow instances) |
| ~~fetcher-service~~ | ~~8084~~ | n8n HTTP Request nodes (Amazon PA API calls) |
| ~~pusher-service~~ | ~~8085~~ | n8n Telegram nodes (channel publishing) |

---

## Startup Order

```
1. eureka-service  (:8761)    ← must be healthy before anything else starts
2. auth-service, user-config-service, workflow-bridge-service, dashboard-service
   (all register with Eureka on startup)
3. api-gateway     (:8080)    ← discovers registered services from Eureka, then opens for traffic
4. n8n             (:5678)    ← starts independently, calls bridge endpoints on workflow execution
```

---

## Request Flow

```
Frontend → API Gateway (:8080)
         → validates JWT, injects X-User-Id and X-Trace-Id headers
         → looks up service instance from Eureka
         → proxies to target service

Schedule activation:
  Frontend → Gateway → workflow-bridge-service → n8n REST API (create + activate workflow)

Posting cycle (n8n-driven):
  n8n Cron fires
    → GET bridge /internal/user-config/{userId}
    → HTTP Request to Amazon PA API
    → Telegram Bot API publish
    → POST bridge /internal/post-event

Dashboard:
  Frontend → Gateway → dashboard-service → reads post_events schema
```

Keep controllers thin, services explicit, and repositories focused on persistence concerns.

---

## Database Design

**Single PostgreSQL instance** (`autoposter_db`) with **schema-per-service** isolation.
**Separate PostgreSQL database** (`n8n_db`) for n8n workflow state.

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

### n8n Database

| Database | Purpose |
|----------|---------|
| `n8n_db` | n8n internal state: workflow definitions, execution history, credentials store |

n8n manages its own schema — do not modify `n8n_db` tables directly.

### DB Users

| User | Access |
|------|--------|
| `auth_svc` | Full access to `auth` schema |
| `config_svc` | Full access to `user_config` schema |
| `bridge_svc` | Full access to `bridge` schema, INSERT/UPDATE on `post_events` |
| `dashboard_svc` | SELECT-only on `post_events` schema |
| `n8n_user` | Full access to `n8n_db` database |

### Redis Keys

| Key Pattern | Purpose | TTL |
|-------------|---------|-----|
| `token_blacklist:{jti}` | Logout/revoke JWT | Token remaining life |
| `login_fail:{email}` | Brute-force guard | 15 min |
| `product_cache:{category}` | Shared product pool (populated by n8n) | 1 hr |
| `posted_products:{userId}` | Dedup — avoid reposting | 30 days |
| `rate_limit:{userId}:{endpoint}` | Request rate limiting | 1 min |

---

## API Contracts

### Public APIs (through API Gateway :8080)

**Auth (auth-service):**
- `POST /api/auth/register` — email/password registration
- `POST /api/auth/login` — email/password login
- `POST /api/auth/refresh` — refresh access token
- `POST /api/auth/logout` — revoke token (blacklist JTI in Redis)
- `GET /oauth2/callback/google` — Google OAuth flow

**Config (user-config-service):**
- `GET/PUT /api/amazon-config` — manage Amazon credentials (keys never returned in plaintext)
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

### Internal APIs (bridge ↔ n8n, not exposed through Gateway)

- `GET /internal/user-config/{userId}` — n8n calls to get decrypted Amazon/Telegram config
- `GET /internal/schedule-config/{userId}` — n8n calls to get schedule parameters
- `POST /internal/post-event` — n8n calls to record posting result (success/failure)
- `GET /internal/config-status/{userId}` — check if user has valid Amazon + Telegram config

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

## Security

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

Secret rotation runbook: rotate JWT/OAuth/API secrets in secret manager → restart services → validate auth and external integration health.

---

## Local Environment

```bash
docker compose up -d          # Start PostgreSQL + Redis + n8n
docker compose down            # Stop all services
```

n8n UI available at `http://localhost:5678` in dev mode.

Infrastructure is not yet defined. A `docker-compose.yml` needs to be created under `infra/` providing PostgreSQL, Redis, and n8n for local development.

---

## Environment Model

| Environment | Purpose | Target |
|-------------|---------|--------|
| Dev | Local development | Docker Compose |
| Stage | Integration validation | Railway / Render |
| Prod | Live traffic | Railway / Render (V1), AWS+K8s (V4) |

**Required environment variables for all non-dev environments:**

```
# Database
DATABASE_URL, DB_USERNAME, DB_PASSWORD

# Redis
REDIS_URL

# Auth
JWT_SECRET, JWT_EXPIRY
GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_CALLBACK_URL

# Encryption
ENCRYPTION_MASTER_KEY

# n8n
N8N_ENCRYPTION_KEY
N8N_HOST, N8N_PORT
N8N_DB_HOST, N8N_DB_NAME, N8N_DB_USER, N8N_DB_PASSWORD
N8N_WEBHOOK_URL          # Base URL for n8n webhook triggers

# General
APP_ENV    # dev | stage | prod
```

---

## CI/CD Pipeline

### Branch Strategy

- `main` → production (manual approval gate required)
- `dev` → staging (auto-deploy on merge)
- Feature branches → PRs to `dev`

### Pipeline Stages (GitHub Actions)

1. Checkout and dependency restore
2. Build and unit tests (`mvn clean package`)
3. Static checks (lint/format)
4. Container image build and tag (commit SHA)
5. Deploy to stage (on `dev` merge) or prod (on `main` merge with approval)

n8n workflows are exported as JSON and version-controlled. CI validates workflow JSON structure on PR.

Rollback: redeploy prior versioned container image tag. For n8n: re-import previous workflow JSON export.

---

## Observability

### Key Signals to Instrument
- Request latency and 5xx error rate
- n8n workflow execution outcomes (SUCCESS vs FAILED per user)
- External API dependency status (Amazon PA API, Telegram Bot API)
- DB and Redis availability
- n8n container health and execution queue depth

### Alert Conditions
- High 5xx error ratio
- Repeated n8n workflow failures for a user
- External API error spikes
- Database connection pool exhaustion
- n8n container unhealthy or execution backlog growing

### Dashboards
- API health and throughput
- n8n workflow execution outcomes (replaces "scheduler outcomes")
- External dependency status (Amazon, Telegram)
- DB/Redis/n8n availability

---

## Runbooks

**n8n workflow failure spike:** check n8n execution logs and failed workflow runs → validate Telegram/Amazon API responses → pause affected user workflows via bridge → hotfix or rollback workflow template.

**Deployment rollback:** identify last stable container tag → redeploy → for n8n: re-import previous workflow JSON → verify health endpoints → validate key user flows.

**DB connection saturation:** check pool metrics and slow query logs → temporarily pause n8n workflow executions → apply query/index optimization.

---

## Backup and Recovery

- Daily PostgreSQL backups (both `autoposter_db` and `n8n_db`) with per-environment retention
- n8n workflow definitions exported as JSON and version-controlled in repo
- V1 objectives: RPO 24 hours, RTO same-day
- Recovery sequence: restore DB snapshots → validate schemas → re-import n8n workflows if needed → re-enable workflow executions in controlled mode → smoke-check auth, config, and posting flow

---

## Infrastructure Scaling Path

| Version | Infrastructure Changes |
|---------|----------------------|
| V1 | Single backend + n8n container, PostgreSQL + Redis, basic monitoring |
| V2 | Image rendering sidecar (Playwright), cloud storage + CDN |
| V3 | n8n queue-based fan-out (replaces per-user workflows), ClickHouse for analytics |
| V4 | AWS managed data services, Kubernetes with horizontal autoscaling, n8n HA mode |

---

## Development Commands

Run commands from `autoposter-backend/`:
- `mvn spring-boot:run -pl eureka-service` — start Eureka locally
- `mvn clean package` — compile and package all modules
- `mvn test` — run the verification suite
- `docker compose up --build` — build and start all services via Docker

n8n CLI (inside container):
- `n8n export:workflow --all` — export all workflows as JSON
- `n8n import:workflow --input=workflow.json` — import workflow from JSON

Use `rg` for fast backend search, for example:
- `rg "POST /api/schedule" autoposter-backend/docs`

---

## What Is Next

Eureka service registry is complete and Dockerized. The next steps in order are:

1. **`api-gateway`** — add as a Maven module, configure Spring Cloud Gateway with Eureka discovery, JWT filter, rate-limiting, CORS, and traceId injection
2. **`auth-service`** — register/login endpoints, Google OAuth, JWT issue/refresh/revoke, Redis token blacklist
3. **`user-config-service`** — Amazon PA API key + Telegram token storage (AES-256-GCM encrypted), schedule config CRUD
4. **`workflow-bridge-service`** — n8n ↔ Spring Boot bridge: workflow lifecycle management, config serving, post event recording
5. **`dashboard-service`** — read `post_events`, return analytics and post history
6. **n8n setup** — Docker container, posting workflow template, bridge integration
7. **`docker-compose.yml` expansion** — add PostgreSQL, Redis, n8n, and all services
8. **`infra/docker-compose.yml`** — local dev environment (PostgreSQL + Redis + n8n only, for running services outside Docker)

---

## Commit and PR Guidelines

- Use Conventional Commits with backend scope, for example `feat(backend): add workflow-bridge post-event endpoint`
- One PR should target one backend concern (API, auth, data model, integration, infra, or CI/CD)
- PR description must include affected endpoints/modules and any schema or auth impact

---

## Backend Documentation

- Full V1 specification: [`autoposter-backend/docs/v1.md`](autoposter-backend/docs/v1.md)
- V2 delta (image templates, Pinterest): [`autoposter-backend/docs/v2.md`](autoposter-backend/docs/v2.md)
- V3 delta (multi-platform, AI, Kafka): [`autoposter-backend/docs/v3.md`](autoposter-backend/docs/v3.md)
- V4 delta (billing, agency, SaaS scale): [`autoposter-backend/docs/v4.md`](autoposter-backend/docs/v4.md)

## API, Auth, and Data Conventions

- Follow API naming and field contracts in `autoposter-backend/docs/v1.md`
- Standardize error responses with `errorCode`, `message`, `traceId`, and `timestamp`
- Enforce least-privilege authorization on every protected endpoint
- Never store integration credentials in plaintext; use encrypted-at-rest patterns
- Keep schema evolution backward-compatible where possible; use additive changes before removals

## Performance and Integration Guidelines

- Design idempotent scheduling and posting operations
- Add timeouts, retries, and failure logging for external API calls
- Protect critical paths with caching and query optimization when latency rises
- Persist integration outcomes for auditability and recovery
