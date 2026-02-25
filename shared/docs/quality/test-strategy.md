# Test Strategy

## V1 Test Layers

| Layer | Scope |
|-------|-------|
| Unit | Service logic, validators, utility components |
| Integration | API ↔ DB and scheduler interactions |
| Contract | External adapter behavior (Amazon PA API, Telegram Bot API) |
| End-to-end | Full user flow from config to scheduled post |

## Frontend Test Focus
- Form validations
- Route protection (protected routes blocked without auth)
- API error-state rendering

## Backend Test Focus
- Auth and authorization guards
- Scheduler job selection and post persistence
- Dashboard aggregation correctness

## Release Quality Gate
No release if the core flow (auth → config → schedule → post → dashboard) is broken.

---

## Acceptance Criteria (V1)

### Must-Have Functional Criteria
- User can register/login and remain authenticated on protected pages
- User can save Amazon and Telegram configurations
- User can configure and activate schedule times
- Scheduler publishes to Telegram automatically at configured times
- Each post attempt is persisted with status and error detail if failed
- Dashboard shows correct counts for today, week, and total

### Security Criteria
- Sensitive credentials (Amazon keys, Telegram bot token) are encrypted at rest
- APIs are user-scoped and reject unauthorized cross-user access
- Protected routes return 401/403 for unauthenticated/unauthorized requests

### Operational Criteria
- Application health endpoint (`/actuator/health`) is available
- CI pipeline builds and tests successfully before deployment

---

## UAT Checklists

### UAT 1: New User Onboarding
- [ ] Create account and login (email/password)
- [ ] Login with Google OAuth
- [ ] Save Amazon config (API keys, affiliate tag, categories)
- [ ] Save Telegram config (bot token, channel ID)
- [ ] Confirm validation messages for invalid inputs

### UAT 2: Scheduling and Posting
- [ ] Set schedule times and activate
- [ ] Wait for scheduled trigger time
- [ ] Verify Telegram channel received the post
- [ ] Verify dashboard summary counts updated
- [ ] Verify post appears in recent posts history

### UAT 3: Failure and Recovery
- [ ] Use invalid Telegram bot token → observe FAILED status in post history
- [ ] Correct bot token and verify next scheduled post succeeds
- [ ] Confirm both failed and successful events visible in post history

### UAT 4: Session and Security
- [ ] Access protected route without auth token → should receive 401/redirect to login
- [ ] Let access token expire → verify redirect to login
- [ ] Logout → verify token is revoked (next request returns 401)
- [ ] Attempt to access another user's config via API → should return 403
