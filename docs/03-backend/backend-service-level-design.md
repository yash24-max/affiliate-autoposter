# Backend Service-Level Design — Microservice Edition

## 1. API Gateway Service (Port 8080)

**Technology:** Spring Cloud Gateway

**Responsibilities:**
- Route incoming requests to the correct downstream microservice
- Validate JWT on every protected route (verify signature + expiry)
- Inject `X-User-Id` and `X-User-Email` headers into downstream requests after validation
- Rate limiting per user (Redis-backed)
- CORS configuration for frontend origin
- Request/response logging with `traceId` injection
- No business logic — pure routing and cross-cutting concerns

**Route Table:**

| Path Prefix | Routes To | Auth Required |
|---|---|---|
| `/api/auth/**` | Auth Service :8081 | ❌ No |
| `/oauth2/**` | Auth Service :8081 | ❌ No |
| `/api/user/**` | User Config Service :8082 | ✅ Yes |
| `/api/amazon-config/**` | User Config Service :8082 | ✅ Yes |
| `/api/telegram-config/**` | User Config Service :8082 | ✅ Yes |
| `/api/schedule/**` | Scheduler Service :8083 | ✅ Yes |
| `/api/dashboard/**` | Dashboard Service :8086 | ✅ Yes |

**No direct route to Fetcher or Pusher** — those are internal services only.

---

## 2. Auth Service (Port 8081)

**Responsibilities:**
- User registration with email + password (BCrypt hashing)
- User login — validate credentials, issue JWT access token + refresh token
- Google OAuth2 callback — map Google identity to internal user, issue JWT
- JWT token refresh endpoint
- Token revocation (blacklist `jti` in Redis with TTL = remaining token lifetime)
- Brute-force protection — lock account after N failed attempts (track in Redis)

**Endpoints:**
```
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/refresh
POST   /api/auth/logout
GET    /oauth2/callback/google
```

**DB Schema: `auth`**
```sql
auth.users
  id UUID PK, email VARCHAR UNIQUE, password_hash VARCHAR,
  name VARCHAR, provider VARCHAR, is_active BOOLEAN,
  created_at TIMESTAMP, updated_at TIMESTAMP

auth.refresh_tokens
  id UUID PK, user_id UUID FK, token_hash VARCHAR,
  expires_at TIMESTAMP, revoked BOOLEAN

auth.login_attempts
  id UUID PK, email VARCHAR, attempted_at TIMESTAMP, success BOOLEAN, ip VARCHAR
```

**Redis Keys:**
```
token_blacklist:{jti}          TTL = remaining access token lifetime
login_fail_count:{email}       TTL = 15 minutes, increment on failure
```

---

## 3. User Config Service (Port 8082)

**Responsibilities:**
- Store and retrieve Amazon PA API credentials (encrypted at rest)
- Store and retrieve Telegram Bot config (encrypted at rest)
- Validate Telegram connection (test-send to channel on save)
- Store user profile and preferences (timezone, notification settings)
- Expose config status to Scheduler — is this user ready to post?

**Endpoints:**
```
GET    /api/user/profile
PUT    /api/user/profile
GET    /api/amazon-config
PUT    /api/amazon-config
DELETE /api/amazon-config
GET    /api/telegram-config
PUT    /api/telegram-config
DELETE /api/telegram-config
POST   /api/telegram-config/test      ← sends a test message to verify connection
```

**DB Schema: `user_config`**
```sql
user_config.amazon_credentials
  id UUID PK, user_id UUID UNIQUE, access_key_enc VARCHAR,
  secret_key_enc VARCHAR, affiliate_tag VARCHAR,
  categories TEXT[], min_discount_pct INTEGER, min_rating DECIMAL,
  is_active BOOLEAN, created_at TIMESTAMP, updated_at TIMESTAMP

user_config.telegram_credentials
  id UUID PK, user_id UUID UNIQUE, bot_token_enc VARCHAR,
  channel_id VARCHAR, channel_name VARCHAR,
  is_active BOOLEAN, last_verified_at TIMESTAMP,
  created_at TIMESTAMP, updated_at TIMESTAMP

user_config.user_profiles
  id UUID PK, user_id UUID UNIQUE, timezone VARCHAR DEFAULT 'Asia/Kolkata',
  notify_on_failure BOOLEAN, plan VARCHAR DEFAULT 'FREE',
  plan_expiry TIMESTAMP, updated_at TIMESTAMP
```

**Security:** `access_key_enc`, `secret_key_enc`, `bot_token_enc` — all AES-256 encrypted using master key from environment variable. Never returned in API responses.

---

## 4. Scheduler Service (Port 8083)

**Responsibilities:**
- Store per-user schedule preferences (times, categories, posts per day)
- Create, update, delete Quartz jobs per user dynamically at runtime
- Activate or deactivate posting for a user without deleting their config
- On each job trigger: call Fetcher Service internally to kick off the post flow
- Track job execution history (started, completed, failed)
- Enforce plan limits (FREE = max 3 posts/day, PRO = max 20)

**Endpoints:**
```
GET    /api/schedule
PUT    /api/schedule
POST   /api/schedule/activate
POST   /api/schedule/deactivate
GET    /api/schedule/history          ← recent job run results
```

**Internal Endpoint (not exposed via Gateway):**
```
POST   /internal/schedule/trigger/{userId}    ← called by Quartz job → calls Fetcher
```

**DB Schema: `scheduler`**
```sql
scheduler.schedules
  id UUID PK, user_id UUID UNIQUE, posts_per_day INTEGER,
  posting_times TEXT[], active_categories TEXT[],
  timezone VARCHAR, is_active BOOLEAN,
  quartz_job_key VARCHAR, updated_at TIMESTAMP

scheduler.job_runs
  id UUID PK, user_id UUID, triggered_at TIMESTAMP,
  completed_at TIMESTAMP, status VARCHAR,   -- RUNNING, SUCCESS, FAILED
  products_posted INTEGER, error_message TEXT
```

**Quartz Job Logic:**
```
PostingJob.execute(context):
  1. Load schedule + user context from DB
  2. Check user plan limits for today (posts_today < posts_per_day)
  3. Verify Amazon config is active (call User Config Service)
  4. Verify Telegram config is active (call User Config Service)
  5. Call Fetcher Service: POST /internal/fetch { userId, categories, filters }
  6. Record job_run result
```

---

## 5. Fetcher Service (Port 8084)

**Responsibilities:**
- Receive a fetch request from Scheduler (userId + categories + filters)
- Call Amazon PA API with the user's own affiliate credentials
- Normalize product response into internal Product model
- Apply filters: min discount %, min rating, category
- Cache normalized products in Redis (shared product pool, TTL 1 hour)
- Select one product NOT yet posted by this user (check Redis dedup set)
- Build the full affiliate URL with user's affiliate tag
- Pass the selected product payload to Pusher Service

**Internal Endpoint (not exposed via Gateway):**
```
POST   /internal/fetch
  Request:  { userId, affiliateTag, accessKey, secretKey, categories[], minDiscount, minRating }
  Response: { productId, title, price, originalPrice, discountPct, imageUrl, affiliateUrl, category }
```

**DB Schema: `products`**
```sql
products.products
  id UUID PK, asin VARCHAR UNIQUE, title VARCHAR, description TEXT,
  price DECIMAL, original_price DECIMAL, discount_pct INTEGER,
  rating DECIMAL, review_count INTEGER, image_url VARCHAR,
  product_url VARCHAR, category VARCHAR, source VARCHAR,
  fetched_at TIMESTAMP, expires_at TIMESTAMP

products.fetch_log
  id UUID PK, user_id UUID, category VARCHAR, fetched_count INTEGER,
  selected_asin VARCHAR, fetched_at TIMESTAMP, status VARCHAR
```

**Redis Keys:**
```
product_cache:{category}                    TTL=1hr  — shared product pool
posted_products:{userId}                    SET      — ASINs already posted by this user
fetch_quota:{userId}:{date}                 Counter  — Amazon API call count per user per day
```

**Amazon PA API Notes:**
- PA API 5.0 requires AWS Signature V4 signing on every request
- Each user's own `accessKey` + `secretKey` used — not a shared key
- Rate limit: 1 request/second per affiliate tag
- Response includes: ASIN, title, price, offers, images, ratings

---

## 6. Pusher Service (Port 8085)

**Responsibilities:**
- Receive product payload from Fetcher Service
- Build Telegram message: image + formatted caption (title, price, discount, rating, affiliate link)
- Post to user's Telegram channel using their Bot Token + Channel ID
- Handle Telegram API response — capture message ID on success
- Retry up to 3 times with exponential backoff on transient failures (5xx, timeout)
- Do NOT retry on permanent errors (400 invalid token, 403 bot not admin)
- Persist every post attempt with full status
- Add ASIN to user's Redis dedup set on success (posted_products:{userId})
- Write post_event record for Dashboard to read

**Internal Endpoint (not exposed via Gateway):**
```
POST   /internal/push
  Request:  { userId, telegramBotToken, channelId, product: { ...fields } }
  Response: { postId, status, telegramMessageId, error }
```

**DB Schema: `post_events`**
```sql
post_events.posts
  id UUID PK, user_id UUID, asin VARCHAR,
  platform VARCHAR DEFAULT 'TELEGRAM',
  affiliate_url VARCHAR, telegram_message_id VARCHAR,
  status VARCHAR,   -- PENDING, POSTED, FAILED
  attempt_count INTEGER DEFAULT 0,
  error_message TEXT,
  posted_at TIMESTAMP, created_at TIMESTAMP

post_events.post_delivery_log
  id UUID PK, post_id UUID FK, attempt_number INTEGER,
  attempted_at TIMESTAMP, response_code INTEGER,
  response_body TEXT, success BOOLEAN
```

**Telegram Message Format:**
```
📦 {title}

💰 ₹{price}  ~~₹{originalPrice}~~
🔥 {discountPct}% OFF
⭐ {rating}/5 ({reviewCount} reviews)

🛒 [Buy Now on Amazon]({affiliateUrl})

#deals #amazon #affiliate
```

---

## 7. Dashboard Service (Port 8086)

**Responsibilities:**
- Aggregate post history for the authenticated user
- Return summary: total posts today, this week, all time
- Return posts by status breakdown (POSTED / FAILED)
- Return posts by category breakdown
- Return paginated recent post list
- Precompute daily aggregates (scheduled nightly task) for performance

**Endpoints:**
```
GET    /api/dashboard/summary
GET    /api/dashboard/recent-posts?page=0&size=20
GET    /api/dashboard/category-breakdown
GET    /api/dashboard/weekly-trend
```

**Data Source:** Reads from `post_events.posts` — does NOT own this schema, reads it as a secondary consumer. In V3, this becomes a Kafka consumer that maintains its own read-optimized aggregate tables.

---

## Service-to-Service Call Chain (Full Flow)

```
Quartz fires job (Scheduler Service)
        │
        ▼
Scheduler validates user config (calls User Config Service /internal/config-status/{userId})
        │
        ▼
Scheduler calls Fetcher Service POST /internal/fetch
        │
        ▼
Fetcher calls Amazon PA API → selects product → adds to products DB
        │
        ▼
Fetcher calls Pusher Service POST /internal/push
        │
        ▼
Pusher posts to Telegram → records result in post_events DB
        │
        ▼
Dashboard reads post_events DB → serves to frontend via API Gateway
```

---

## Shared Conventions (All Services)

**Standard API Response Wrapper:**
```json
{
  "success": true,
  "data": { },
  "error": null,
  "traceId": "abc-123",
  "timestamp": "2026-02-25T10:30:00Z"
}
```

**Standard Error Response:**
```json
{
  "success": false,
  "data": null,
  "error": {
    "errorCode": "AMAZON_CONFIG_NOT_FOUND",
    "message": "Amazon configuration not set up for this user.",
    "traceId": "abc-123",
    "timestamp": "2026-02-25T10:30:00Z"
  }
}
```

**Headers passed by Gateway to downstream services:**
```
X-User-Id: {uuid}
X-User-Email: {email}
X-Trace-Id: {traceId}
```

Services extract user identity from `X-User-Id` header — they never re-validate the JWT themselves.
