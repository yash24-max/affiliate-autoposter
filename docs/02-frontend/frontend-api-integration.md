# Frontend API Integration Contract

## Auth
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /oauth2/callback/google`

## User Config
- `GET /api/amazon-config`
- `PUT /api/amazon-config`
- `GET /api/telegram-config`
- `PUT /api/telegram-config`

## Scheduling
- `GET /api/schedule`
- `PUT /api/schedule`
- `POST /api/schedule/activate`
- `POST /api/schedule/deactivate`

## Dashboard
- `GET /api/dashboard/summary`
- `GET /api/dashboard/recent-posts`
- `GET /api/dashboard/category-breakdown`

## Response Handling Standard
- Success payload includes `data` and optional `message`
- Failure payload includes `errorCode`, `message`, and `traceId`
- Client retries idempotent GET calls only

## Token Behavior
- Add Bearer token for protected routes
- On 401, redirect to login and clear stale auth state
