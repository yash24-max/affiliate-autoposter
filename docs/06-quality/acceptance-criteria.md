# Acceptance Criteria

## V1 Must-Have Criteria
- User can register/login and remain authenticated on protected pages.
- User can save Amazon and Telegram configurations.
- User can configure and activate schedule times.
- Scheduler publishes to Telegram automatically at configured times.
- Each post attempt is persisted with status and error detail if failed.
- Dashboard shows correct counts for today, week, and total.

## Security Criteria
- Sensitive credentials are encrypted at rest.
- APIs are user-scoped and reject unauthorized access.

## Operational Criteria
- Application health endpoint available.
- CI pipeline builds and tests successfully before deployment.
