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
Primary backend work happens in `backend/` with shared contracts in `shared/`.

Prefer domain-first modules, for example:
- `backend/auth`
- `backend/scheduler`
- `backend/integrations/amazon`
- `backend/integrations/telegram`
- `backend/dashboard`

Keep controllers thin, services explicit, and repositories focused on persistence concerns.

## Backend Development Commands
Run commands from `backend/`:
- `./mvnw spring-boot:run`: start backend service locally.
- `./mvnw clean package`: compile and package backend artifacts.
- `./mvnw test`: run backend verification suite if configured.

Use `rg` for fast backend search, for example:
- `rg "POST /api/schedule" docs/03-backend`

## API, Auth, and Data Conventions
- Follow API naming and field contracts in `docs/03-backend/backend-api-spec.md`.
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
