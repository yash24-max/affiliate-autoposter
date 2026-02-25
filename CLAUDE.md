# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Scope

CLAUDE.md covers **infrastructure, DevOps, cloud, testing, and product** concerns only.
- Backend development is handled by **AGENTS.md**
- Frontend development is handled by **GEMINI.md**

---

## Project Status

Documentation-first project. The `infra/` directory is empty and awaiting implementation. All specifications live in `docs/04-cloud-devops/` and `docs/06-quality/`.

---

## Local Environment

```bash
docker compose up -d    # Start PostgreSQL + Redis
docker compose down     # Stop services
```

Infrastructure is not yet defined. A `docker-compose.yml` needs to be created under `infra/` providing PostgreSQL and Redis for local development.

---

## Environment Model

| Environment | Purpose | Target |
|-------------|---------|--------|
| Dev | Local development | Docker Compose |
| Stage | Integration validation | Railway / Render |
| Prod | Live traffic | Railway / Render (V1), AWS+K8s (V4) |

**Required environment variables for all non-dev environments:**
```
DATABASE_URL, DB_USERNAME, DB_PASSWORD
REDIS_URL
JWT_SECRET, JWT_EXPIRY
GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_CALLBACK_URL
ENCRYPTION_MASTER_KEY
APP_ENV    # dev | stage | prod
```

---

## CI/CD Pipeline

Branch strategy:
- `main` → production (manual approval gate required)
- `dev` → staging (auto-deploy on merge)
- Feature branches → PRs to `dev`

Pipeline stages (to be implemented in CI platform):
1. Checkout and dependency restore
2. Build and unit tests
3. Static checks (lint/format)
4. Container image build and tag
5. Deploy to stage (on `dev` merge) or prod (on `main` merge with approval)

Rollback: redeploy prior versioned container image tag.

---

## Security

- All external API secrets (Amazon PA API, Telegram bot tokens) must be **encrypted at rest** using `ENCRYPTION_MASTER_KEY`; never exposed in API responses or logs
- JWT and OAuth secrets injected via environment variables only
- Rate-limit auth and external integration test endpoints
- All errors include a `traceId` correlation ID; sanitize messages before returning to clients
- Auth and config change events must be logged for audit

Secret rotation runbook: rotate JWT/OAuth/API secrets in secret manager → restart services → validate auth and external integration health.

---

## Testing Strategy

**Release quality gate:** no release if the core flow (auth → config → schedule → post → dashboard) is broken.

| Layer | Scope |
|-------|-------|
| Unit | Service logic, validators, utilities |
| Integration | API ↔ DB and scheduler interactions |
| Contract | External adapter behaviour (Amazon PA API, Telegram) |
| End-to-end | Full user flow from config to scheduled post |

---

## Observability

**Key signals to instrument:**
- Request latency and 5xx error rate
- Scheduler run outcomes (POSTED vs FAILED per user)
- External API dependency status (Amazon, Telegram)
- DB and Redis availability

**Alert conditions:**
- High 5xx error ratio
- Repeated scheduler failures for a user
- External API error spikes
- Database connection pool exhaustion

Dashboards must cover: API health/throughput, scheduler outcomes, external dependency status, DB/Redis availability.

---

## Runbooks

**Scheduler failure spike:** check scheduler metrics and failed job logs → validate Telegram/Amazon responses → pause affected user schedules if needed → hotfix or rollback.

**Deployment rollback:** identify last stable container tag → redeploy → verify health endpoints → validate key user flows.

**DB connection saturation:** check pool metrics and slow query logs → temporarily reduce scheduler concurrency → apply query/index optimization.

---

## Backup and Recovery

- Daily PostgreSQL backups with per-environment retention policy
- V1 objectives: RPO 24 hours, RTO same-day
- Recovery sequence: restore DB snapshot → validate schema and critical tables → re-enable scheduler in controlled mode → smoke-check auth, config, and posting flow

---

## Infrastructure Scaling Path

| Version | Infrastructure changes |
|---------|----------------------|
| V1 | Single backend service, PostgreSQL + Redis, basic monitoring |
| V2 | Image rendering sidecar, cloud storage + CDN |
| V3 | Kafka for async pipelines, ClickHouse for analytics, split publisher workers |
| V4 | AWS managed data services, Kubernetes with horizontal autoscaling |

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
