# Affiliate Autoposter

A B2C SaaS platform that automates affiliate marketing — connect Amazon Associates and a Telegram channel once, then the system fetches deals, generates posts, and publishes on schedule.

**Hybrid architecture:** Spring Boot (APIs, auth, data) + n8n workflow engine (scheduling, fetching, publishing).

**Start here:** [`docs/PLAN.md`](docs/PLAN.md) — master plan with version map and all layer links.

---

## Directory Structure

- `docs/` — Master plan, product vision, version phases
- `backend/` — Spring Boot services and API documentation
- `frontend/` — React application and UI documentation
- `workflows/` — n8n workflow exports and templates (version-controlled JSON)
- `infrastructure/` — Docker Compose, CI/CD, deployment, observability

## Agent Ownership

| File | Owns |
|------|------|
| `CLAUDE.md` | n8n workflow orchestration, code review, testing, task coordination |
| `AGENTS.md` | Backend services, CI/CD, infrastructure, cloud, DevOps |
| `GEMINI.md` | Frontend: React components, UI/UX, styling, routing |
