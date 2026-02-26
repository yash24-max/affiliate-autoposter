# V1: Foundation and Core MVP

## Phase 1 — Foundation (v0.1)

### Objective
Set up the base system and delivery pipeline required for V1 development.

### Scope
- Project skeleton (backend + frontend folders)
- Local runtime dependencies (PostgreSQL, Redis via Docker Compose)
- Base environment configuration and secret handling
- CI baseline (build and test workflow)
- Initial DB migration strategy and health checks

### Entry Criteria
- Source plan approved
- Tech stack fixed: Spring Boot 3, React 18, PostgreSQL, Redis, Quartz

### Exit Criteria
- Local setup steps are reproducible from docs
- Basic app health check endpoint is documented
- CI can run compile/test checks

### Risks and Mitigations
- Config drift between local and deployment target → use environment variable contract
- Missing secret handling policy → define secret storage and rotation approach before first deploy

---

## Phase 2 — V1 Core MVP (v1.0)

### Objective
Ship the smallest working product: end-to-end automation from Amazon to Telegram. Prove the idea. Get first paying users.

### Functional Outcomes
- User registers or signs in with Google OAuth
- User saves Amazon affiliate credentials and Telegram bot config
- User sets posting times and product categories
- System auto-publishes product posts at configured schedule
- User sees post status and counts in dashboard

### Engineering Streams

| Stream | Deliverables |
|--------|-------------|
| Frontend | Auth pages, setup wizard, schedule config, dashboard |
| Backend | Auth service, config service, scheduler, fetcher, pusher, dashboard |
| DevOps | CI/CD pipeline, Docker Compose, Railway/Render deploy, health endpoints |

### V1 Feature Scope

| Feature | Included |
|---------|----------|
| User registration + login (JWT) | Yes |
| Google OAuth login | Yes |
| Amazon PA API product fetcher | Yes |
| Telegram auto-publisher | Yes |
| Per-user post scheduling (Quartz) | Yes |
| Basic dashboard (posts today, this week) | Yes |
| User Amazon config (API keys, affiliate tag) | Yes |
| User Telegram config (bot token, channel ID) | Yes |
| Subscription / payments | No (V4) |
| Image template generation | No (V2) |
| Pinterest / Instagram publisher | No (V2/V3) |

### Exit Criteria
- Complete user journey runs without manual backend trigger
- Failed posts are captured with error reason
- Dashboard summary metrics are accurate
- Frontend + backend + infra all pass V1 checks → V1 done

---

## Cross-Layer Exit Gate

| Layer | Criteria |
|-------|----------|
| Frontend | Auth flow, setup wizard, schedule, dashboard all working |
| Backend | All services running, scheduler triggers, posts recorded |
| Infra | CI passes, Docker Compose works locally, stage deploy successful |

All three passing = V1 release ready.

---

## Layer Documentation Links

- Frontend V1: [frontend/docs/v1.md](../../frontend/docs/v1.md)
- Backend V1: [backend/docs/v1.md](../../autoposter-backend/docs/v1.md)
- Infra V1: [infra/docs/v1.md](../../infra/docs/v1.md)
