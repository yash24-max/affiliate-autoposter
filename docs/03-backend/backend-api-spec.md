# Backend API Specification (V1)

## Base URL
All APIs go through the API Gateway at port 8080 (local) or your production domain.
Internal service APIs (/internal/**) are NOT routed through the Gateway.
They are only reachable within the private Docker network.

---

## Auth APIs → routes to Auth Service (8081)

### POST /api/auth/register
Request:  { "email": "user@example.com", "password": "StrongPass123!", "name": "Ravi Kumar" }
Response 201: { "success": true, "data": { "accessToken": "eyJ...", "refreshToken": "eyJ...", "user": { "id": "uuid", "email": "...", "name": "...", "plan": "FREE" } } }

### POST /api/auth/login
Request:  { "email": "user@example.com", "password": "StrongPass123!" }
Response: same shape as register

### POST /api/auth/refresh
Request:  { "refreshToken": "eyJ..." }
Response: { "accessToken": "eyJ...", "refreshToken": "eyJ..." }

### POST /api/auth/logout
Header: Authorization: Bearer {accessToken}
Response 200 — blacklists token JTI in Redis for remaining TTL

### GET /oauth2/callback/google
Handled by Spring Security OAuth2 — redirects frontend with JWT

---

## Config APIs → routes to User Config Service (8082)

All require Authorization: Bearer {token}
Gateway injects X-User-Id header — service reads this, never re-validates JWT.

### GET /api/amazon-config
Returns: affiliateTag, categories, minDiscountPct, minRating, isActive
NOTE: accessKey and secretKey are NEVER returned in any response

### PUT /api/amazon-config
Request: { "accessKey": "...", "secretKey": "...", "affiliateTag": "mystore-21", "categories": ["Electronics"], "minDiscountPct": 30, "minRating": 4.0 }

### GET /api/telegram-config
Returns: channelId, channelName, isActive, lastVerifiedAt
NOTE: botToken is NEVER returned in any response

### PUT /api/telegram-config
Request: { "botToken": "...", "channelId": "@mydeals", "channelName": "My Deals" }

### POST /api/telegram-config/test
Sends a test message to the channel to verify connection
Response 400 if token invalid or bot is not admin in channel

---

## Scheduler APIs → routes to Scheduler Service (8083)

### GET /api/schedule
Returns: postsPerDay, postingTimes[], activeCategories[], timezone, isActive, jobStatus

### PUT /api/schedule
Request: { "postsPerDay": 5, "postingTimes": ["09:00","12:00","15:00","18:00","21:00"], "activeCategories": ["Electronics","Fashion"], "timezone": "Asia/Kolkata" }

### POST /api/schedule/activate
### POST /api/schedule/deactivate

### GET /api/schedule/history?page=0&size=10
Returns paginated list of job runs: triggeredAt, status, productsPosted, errorMessage

---

## Dashboard APIs → routes to Dashboard Service (8086)

### GET /api/dashboard/summary
Returns: postsToday, postsThisWeek, postsAllTime, successRate, schedulerStatus

### GET /api/dashboard/recent-posts?page=0&size=20
Returns paginated list: productTitle, category, discountPct, status, platform, postedAt

### GET /api/dashboard/category-breakdown
Returns: [ { category, count, successCount } ]

---

## Internal APIs (Not exposed via Gateway — Docker network only)

### Fetcher Service: POST http://fetcher-service:8084/internal/fetch
Called by Scheduler. Accepts userId + Amazon credentials + filters.
Returns selected product payload with affiliate URL.

### Pusher Service: POST http://pusher-service:8085/internal/push
Called by Fetcher. Accepts userId + Telegram credentials + product payload.
Returns postId, status, telegramMessageId, error.

---

## Standard Error Codes

INVALID_CREDENTIALS     401 - Wrong email or password
TOKEN_EXPIRED           401 - JWT access token expired
TOKEN_INVALID           401 - JWT signature invalid
UNAUTHORIZED            403 - Valid token but no access to resource
AMAZON_CONFIG_NOT_FOUND 404 - User has not set up Amazon config
TELEGRAM_CONFIG_NOT_FOUND 404 - User has not set up Telegram config
TELEGRAM_INVALID_TOKEN  400 - Bot token rejected by Telegram API
TELEGRAM_NOT_ADMIN      400 - Bot is not admin in the channel
PLAN_LIMIT_REACHED      429 - Daily post limit reached for plan
VALIDATION_ERROR        400 - Request body failed bean validation
INTERNAL_ERROR          500 - Unexpected server error

## Standard Response Wrapper (all responses)
{
  "success": true/false,
  "data": { ... } or null,
  "error": null or { "errorCode": "...", "message": "...", "traceId": "...", "timestamp": "..." },
  "traceId": "abc-123",
  "timestamp": "2026-02-25T10:30:00Z"
}
