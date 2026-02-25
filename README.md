# Affiliate Autoposter

A B2C SaaS platform that automates affiliate marketing — connect Amazon Associates and a Telegram channel once, then the system fetches deals, generates posts, and publishes on schedule.

**Start here:** [`docs/PLAN.md`](docs/PLAN.md) — master plan with version map and all layer links.

---

## Directory Structure

- `docs/` — Master plan, product vision, version phases
- `backend/` — Spring Boot microservices and API documentation
- `frontend/` — React application and UI documentation
- `infra/` — Infrastructure, CI/CD, deployment, observability
- `shared/` — Shared quality and test strategy

## Agent Ownership

| File | Owns |
|------|------|
| `CLAUDE.md` | Infrastructure, DevOps, cloud, testing, product |
| `AGENTS.md` | Backend: API, services, data model, auth, integrations |
| `GEMINI.md` | Frontend: React components, UI/UX, styling, routing |
