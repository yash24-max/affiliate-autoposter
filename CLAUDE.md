# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Scope

CLAUDE.md covers **n8n workflow orchestration, code review, testing, and cross-cutting task coordination**.
- Backend development + CI/CD + Infra + Cloud + DevOps is handled by **AGENTS.md**
- Frontend development is handled by **GEMINI.md**

---

## Hybrid Architecture Overview

The Affiliate Autoposter uses a **hybrid architecture**: Spring Boot for APIs/auth/data + **n8n workflow engine** for automation (fetching, posting, scheduling).

### What Stays as Code (Spring Boot)

| Service | Role |
|---------|------|
| auth-service | Register, login, OAuth, JWT |
| user-config-service | Amazon/Telegram/Schedule config CRUD |
| workflow-bridge-service | Triggers n8n, receives callbacks, tracks executions |
| dashboard-service | Analytics, post history |
| api-gateway | Routing, JWT validation, rate limiting, CORS |
| eureka-service | Service discovery |

### What Moves to n8n

| Eliminated Service | n8n Replacement |
|-------------------|-----------------|
| ~~scheduler-service~~ (Quartz) | n8n Cron Trigger nodes — one workflow instance per user |
| ~~fetcher-service~~ | n8n HTTP Request nodes — calls Amazon PA API directly |
| ~~pusher-service~~ | n8n Telegram nodes — publishes to user's channel |

**Why n8n?** Eliminates 3 Spring Boot microservices. Visual workflow editor. Built-in retry/error handling. Per-user scheduling via workflow instances. Open-source, self-hosted.

---

## System Architecture Diagram (V1)

```
Frontend (React 18)
       │ HTTPS
       ▼
API Gateway (:8080)  ─── JWT validate · CORS · rate-limit · traceId
       │
       ├── auth-service (:8081)
       ├── user-config-service (:8082)
       ├── workflow-bridge-service (:8083)
       └── dashboard-service (:8086)

n8n Workflow Engine (:5678)
       ├── Cron trigger → HTTP Request (bridge/config) → Amazon PA API → Telegram → Webhook (bridge/post-event)
       └── Per-user workflow instances

Eureka (:8761) │ PostgreSQL (autoposter_db + n8n_db) │ Redis (cache/auth)
```

---

## n8n Workflow Engine

### How n8n Runs
- Self-hosted Docker container alongside Spring Boot services
- Accessible at `:5678` for workflow design (dev only — locked in prod)
- Uses its own database (`n8n_db`) for workflow state and execution history
- Communicates with Spring Boot via REST (workflow-bridge-service)

### n8n ↔ Spring Boot Communication

```
Activate schedule:
  Frontend → API Gateway → workflow-bridge-service → n8n REST API (create & activate workflow)

Posting cycle (n8n executes autonomously):
  n8n Cron fires
    → n8n calls bridge GET /internal/user-config/{userId}
    → n8n calls Amazon PA API (HTTP Request node)
    → n8n calls Telegram Bot API (Telegram node)
    → n8n calls bridge POST /internal/post-event (record result)

Deactivate:
  Frontend → API Gateway → workflow-bridge-service → n8n REST API (deactivate workflow)
```

---

## Data Flow: Posting Cycle

```
1. CONFIGURE  — User saves Amazon keys + Telegram token + schedule preferences
2. ACTIVATE   — User clicks "Activate" → bridge creates & activates n8n workflow for this user
3. AUTOPOST   — n8n cron fires at scheduled times:
                a. GET /internal/user-config/{userId} from bridge (decrypted credentials)
                b. HTTP Request to Amazon PA API (fetch trending products)
                c. Select best product (by discount%, rating, category match)
                d. Format affiliate link + post text
                e. Send to Telegram channel via Telegram Bot API
                f. POST /internal/post-event to bridge (record success/failure)
4. DASHBOARD  — User views post history, success rate, estimated earnings
```

---

## Credential Security

### Dual Encryption Layers

1. **Application Layer (AES-256-GCM):** Amazon API keys and Telegram bot tokens encrypted by user-config-service before DB storage. Decrypted only when n8n requests them via bridge.

2. **n8n Encryption:** n8n encrypts its own credential store with `N8N_ENCRYPTION_KEY`. Workflow templates reference credentials by ID, never plaintext.

**Key rule:** Credentials traverse the wire (bridge → n8n) only over the internal Docker network. Never exposed in API responses, logs, or n8n workflow exports.

---

## Per-User Scheduling

### V1 Strategy: One Workflow Per User
- When user activates schedule, bridge calls n8n REST API to create a workflow instance from template
- Workflow includes Cron node configured with user's timezone and posting times
- Each user has an independent workflow — failures are isolated
- Bridge tracks mapping: `user_id → n8n_workflow_id`

### V3 Scale Plan
- Single shared workflow with queue-based fan-out
- n8n processes user batches from a job queue
- Reduces workflow count from N (users) to fixed worker count

---

## n8n Posting Workflow Design

Template workflow (cloned per user):

```
┌─────────────┐     ┌──────────────────┐     ┌─────────────────┐
│ Cron Trigger │────▶│ HTTP Request     │────▶│ Function Node   │
│ (user's tz)  │     │ GET bridge/config │     │ Parse config    │
└─────────────┘     └──────────────────┘     └────────┬────────┘
                                                       │
                    ┌──────────────────┐     ┌─────────▼────────┐
                    │ HTTP Request     │◀────│ HTTP Request     │
                    │ POST bridge/     │     │ Amazon PA API    │
                    │ post-event       │     │ (search products)│
                    └──────────────────┘     └────────┬────────┘
                           ▲                          │
                           │              ┌───────────▼────────┐
                           │              │ Function Node      │
                           │              │ Select best product│
                           │              │ Format post text   │
                           │              └────────┬───────────┘
                           │                       │
                           │              ┌────────▼───────────┐
                           └──────────────│ Telegram Node      │
                                          │ Send to channel    │
                                          └────────────────────┘
```

Error handling: n8n's built-in error workflow catches failures → records FAILED status via bridge callback.

---

## Code Review Guidelines

Standards for PRs across all agents:

1. **No plaintext secrets** — credentials must be encrypted at rest, never logged
2. **Idempotent operations** — posting and scheduling must be safe to retry
3. **Error handling** — all external calls (Amazon, Telegram, n8n API) must have timeouts and error responses
4. **traceId propagation** — every request/response chain must carry X-Trace-Id
5. **Schema safety** — DB migrations must be additive (no column drops without migration plan)
6. **Test coverage** — new service logic requires unit tests; new endpoints require integration tests
7. **No over-engineering** — solve the current requirement, not hypothetical future ones

---

## Testing Strategy

**Release quality gate:** no release if the core flow (auth → config → activate → autopost → dashboard) is broken.

| Layer | Scope |
|-------|-------|
| Unit | Service logic, validators, utilities, n8n Function node scripts |
| Integration | API ↔ DB, bridge ↔ n8n API interactions |
| Contract | External adapter behaviour (Amazon PA API, Telegram Bot API) |
| End-to-end | Full user flow: register → configure → activate → verify post → check dashboard |

### n8n-Specific Testing
- Workflow template validation: ensure all nodes are connected and configured
- Bridge endpoint contract tests: verify n8n receives expected response shapes
- Cron scheduling verification: confirm correct timezone handling
- Error workflow testing: verify failure recording via bridge callback

---

## Version Evolution

| Version | Workflow Changes |
|---------|-----------------|
| V1 | One n8n workflow per user, Telegram only, text posts |
| V2 | Add image generation node (Playwright sidecar), Pinterest publisher node |
| V3 | Shared queue-based workflow, multi-platform publisher nodes, AI product ranking node |
| V4 | n8n clustered/HA mode, webhook-based monitoring, platform-specific workflow templates |

---

## Implementation Order

1. **workflow-bridge-service** — REST endpoints for n8n ↔ Spring Boot communication
2. **n8n Docker setup** — Add n8n container to docker-compose with PostgreSQL backend
3. **Posting workflow template** — Design and test the base n8n workflow
4. **Bridge → n8n integration** — Activate/deactivate workflows via n8n REST API
5. **Error handling workflow** — n8n error workflow that calls bridge callback
6. **Per-user workflow cloning** — Bridge creates workflow instances from template
7. **End-to-end testing** — Full cycle: configure → activate → post → dashboard

---

## Documentation Reference

- `docs/04-cloud-devops/ci-cd-design.md` — pipeline stages and controls
- `docs/04-cloud-devops/environments-and-deployment.md` — environment model and release gates
- `docs/04-cloud-devops/observability-and-alerting.md` — metrics, dashboards, alerts
- `docs/04-cloud-devops/devops-runbooks.md` — operational runbooks
- `docs/04-cloud-devops/backup-recovery-and-dr.md` — backup policy and DR steps
- `docs/04-cloud-devops/infra-scaling-path-v1-to-v4.md` — scaling roadmap
- `docs/06-quality/test-strategy.md` — test layers and release quality gate
- `docs/03-backend/backend-security-design.md` — secret management and audit requirements
