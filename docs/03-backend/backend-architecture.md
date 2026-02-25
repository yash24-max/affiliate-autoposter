# Backend Architecture

## Scope
Multi-module Spring Boot service handling auth, configuration, product ingestion, publishing, scheduling, and analytics summary.

## Core Components
- Auth module (JWT + OAuth)
- User and settings modules
- Amazon integration module
- Telegram publishing module
- Scheduler module (Quartz)
- Dashboard and post history module

## Data Stores
- PostgreSQL: source of truth
- Redis: cache and rate-control support

## Integration Style
- REST controllers for frontend access
- External API clients for Amazon and Telegram
- Async-safe scheduler execution with retry strategy

## Reliability Decisions
- Persist each post attempt
- Idempotent schedule update operations
- Controlled retries for transient API failures
