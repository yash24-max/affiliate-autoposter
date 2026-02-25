# Backend Services and Modules

## Module Structure (V1 — Monorepo, Separate Packages)

```
backend/
├── api-gateway/                    ← Spring Cloud Gateway
│   └── src/main/java/
│       ├── GatewayApplication.java
│       ├── config/
│       │   ├── RouteConfig.java         ← all route definitions
│       │   ├── CorsConfig.java
│       │   └── RateLimitConfig.java
│       └── filter/
│           ├── JwtAuthFilter.java       ← validate JWT, inject X-User-Id header
│           └── TraceIdFilter.java       ← inject traceId on every request
│
├── auth-service/                   ← Port 8081
│   └── src/main/java/
│       ├── AuthServiceApplication.java
│       ├── controller/
│       │   └── AuthController.java
│       ├── service/
│       │   ├── AuthService.java
│       │   ├── JwtService.java
│       │   └── OAuth2Service.java
│       ├── entity/
│       │   ├── User.java
│       │   └── RefreshToken.java
│       ├── repository/
│       │   ├── UserRepository.java
│       │   └── RefreshTokenRepository.java
│       └── dto/
│           ├── RegisterRequest.java
│           ├── LoginRequest.java
│           └── AuthResponse.java
│
├── user-config-service/            ← Port 8082
│   └── src/main/java/
│       ├── UserConfigServiceApplication.java
│       ├── controller/
│       │   ├── AmazonConfigController.java
│       │   ├── TelegramConfigController.java
│       │   └── UserProfileController.java
│       ├── service/
│       │   ├── AmazonConfigService.java
│       │   ├── TelegramConfigService.java
│       │   └── UserProfileService.java
│       ├── entity/
│       │   ├── AmazonCredential.java
│       │   ├── TelegramCredential.java
│       │   └── UserProfile.java
│       ├── repository/
│       │   ├── AmazonCredentialRepository.java
│       │   └── TelegramCredentialRepository.java
│       └── util/
│           └── EncryptionUtil.java      ← AES-256 encrypt/decrypt
│
├── scheduler-service/              ← Port 8083
│   └── src/main/java/
│       ├── SchedulerServiceApplication.java
│       ├── controller/
│       │   ├── ScheduleController.java
│       │   └── InternalScheduleController.java
│       ├── service/
│       │   ├── ScheduleService.java
│       │   └── QuartzJobManagerService.java  ← create/update/delete jobs
│       ├── job/
│       │   └── PostingJob.java               ← Quartz Job implementation
│       ├── entity/
│       │   ├── Schedule.java
│       │   └── JobRun.java
│       └── client/
│           └── FetcherClient.java            ← calls Fetcher Service internally
│
├── fetcher-service/                ← Port 8084
│   └── src/main/java/
│       ├── FetcherServiceApplication.java
│       ├── controller/
│       │   └── InternalFetchController.java  ← only internal, not exposed via Gateway
│       ├── service/
│       │   ├── ProductFetchService.java
│       │   ├── ProductCacheService.java      ← Redis read/write
│       │   ├── ProductSelectionService.java  ← pick unposted product for user
│       │   └── AmazonApiClient.java          ← PA API 5.0 with AWS Sig V4
│       ├── entity/
│       │   ├── Product.java
│       │   └── FetchLog.java
│       └── client/
│           └── PusherClient.java             ← calls Pusher Service internally
│
├── pusher-service/                 ← Port 8085
│   └── src/main/java/
│       ├── PusherServiceApplication.java
│       ├── controller/
│       │   └── InternalPushController.java   ← only internal, not exposed via Gateway
│       ├── service/
│       │   ├── TelegramPublishService.java
│       │   ├── MessageTemplateService.java   ← formats product into Telegram message
│       │   └── RetryService.java             ← retry logic with backoff
│       ├── entity/
│       │   ├── Post.java
│       │   └── PostDeliveryLog.java
│       └── repository/
│           ├── PostRepository.java
│           └── PostDeliveryLogRepository.java
│
└── dashboard-service/              ← Port 8086
    └── src/main/java/
        ├── DashboardServiceApplication.java
        ├── controller/
        │   └── DashboardController.java
        ├── service/
        │   └── DashboardService.java
        └── repository/
            └── PostReadRepository.java       ← reads post_events schema
```

---

## Shared Library (shared/)

```
shared/
└── src/main/java/com/autoposter/shared/
    ├── dto/
    │   ├── ApiResponse.java          ← standard response wrapper
    │   ├── ErrorResponse.java
    │   └── ProductPayload.java       ← passed from Fetcher to Pusher
    ├── exception/
    │   ├── AppException.java
    │   └── ErrorCode.java            ← all error codes as enum
    └── util/
        └── TraceUtil.java
```

---

## Key Class Responsibilities

### JwtAuthFilter (API Gateway)
- Extracts Bearer token from Authorization header
- Verifies JWT signature using shared secret
- Checks token expiry
- Checks token JTI against Redis blacklist (logout support)
- Injects `X-User-Id` and `X-User-Email` into downstream request headers
- Rejects with 401 if any check fails

### QuartzJobManagerService (Scheduler)
- `createOrUpdateJob(userId, schedule)` — creates a Quartz CronTrigger per user
- `deleteJob(userId)` — removes job when user deactivates or deletes schedule
- `pauseJob(userId)` — pause without deleting
- `resumeJob(userId)` — resume paused job
- Each job stores `userId` in JobDataMap — PostingJob reads it to know which user to run for

### PostingJob (Scheduler)
```
execute():
  1. userId = context.getMergedJobDataMap().getString("userId")
  2. Check job_run — is another instance already running for this user? if yes, skip
  3. Load schedule from DB — is it still active?
  4. Check plan limit — posts today < postsPerDay?
  5. Call FetcherClient.fetch(userId, ...)
  6. Record JobRun result
```

### AmazonApiClient (Fetcher)
- Implements AWS Signature Version 4 signing for every PA API request
- Handles PA API rate limiting (1 req/sec per tag) using Redis token bucket
- Parses PA API response XML/JSON → normalizes to internal Product model
- Categories supported: Electronics, Fashion, Beauty, HomeKitchen, Books

### TelegramPublishService (Pusher)
- Calls `sendPhoto` Telegram Bot API endpoint (image + caption in one call)
- Captures `message_id` from response (needed for future edit/delete)
- On failure: checks error code — 400/401/403 = permanent (no retry), 429/500/502 = transient (retry)
- Writes to `post_delivery_log` on every attempt regardless of outcome

### ProductSelectionService (Fetcher)
- Checks Redis SET `posted_products:{userId}` before selecting a product
- If all cached products for a category are already posted by this user, fetches fresh from Amazon
- Prioritizes products with higher discount % (configurable)
- Returns null if no eligible product found (Scheduler logs as SKIPPED)
