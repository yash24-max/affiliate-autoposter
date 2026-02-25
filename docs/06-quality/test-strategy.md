# Test Strategy

## V1 Test Layers
- Unit tests: service logic, validators, utility components
- Integration tests: API to DB and scheduler interactions
- Contract tests: external adapter behavior (Amazon, Telegram)
- End-to-end checks: full user flow from config to scheduled post

## Frontend Test Focus
- Form validations
- Route protection
- API error-state rendering

## Backend Test Focus
- Auth and authorization guards
- Scheduler selection and post persistence
- Dashboard aggregation correctness

## Release Quality Gate
No release if core flow (auth -> config -> schedule -> post -> dashboard) is broken.
