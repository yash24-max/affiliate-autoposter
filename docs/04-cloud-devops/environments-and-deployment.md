# Environments and Deployment

## Environment Model
- Dev: local Docker Compose with PostgreSQL and Redis
- Stage: pre-production for integration validation
- Prod: managed environment with monitored services

## V1 Deployment Target
- Railway or Render for initial release
- Containerized Spring Boot service
- Managed PostgreSQL and Redis where available

## Deployment Requirements
- Environment variables for DB, Redis, JWT, OAuth, API credentials
- Health endpoint for readiness/liveness checks
- Rollback path to previous stable release

## Release Gates
- Build and tests pass
- Basic smoke checks pass in stage
- Config/secret validation complete
