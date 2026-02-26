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
Primary backend work happens in `backend/project-backend/` with shared contracts in `shared/`.

Prefer domain-first modules, for example:
- `backend/project-backend/auth-service`
- `backend/project-backend/scheduler-service`
- `backend/project-backend/fetcher-service`
- `backend/project-backend/pusher-service`
- `backend/project-backend/dashboard-service`

Keep controllers thin, services explicit, and repositories focused on persistence concerns.

## Backend Documentation
- Full V1 specification: [`backend/docs/v1.md`](backend/docs/v1.md)
- V2 delta (image templates, Pinterest): [`backend/docs/v2.md`](backend/docs/v2.md)
- V3 delta (multi-platform, AI, Kafka): [`backend/docs/v3.md`](backend/docs/v3.md)
- V4 delta (billing, agency, SaaS scale): [`backend/docs/v4.md`](backend/docs/v4.md)

## Backend Development Commands
Run commands from `backend/project-backend/`:
- `mvn spring-boot:run`: start backend service locally.
- `mvn clean package`: compile and package backend artifacts.
- `mvn test`: run backend verification suite if configured.

Use `rg` for fast backend search, for example:
- `rg "POST /api/schedule" backend/docs`

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
