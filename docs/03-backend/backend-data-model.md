# Backend Data Model — Microservice Schema Design

## Schema Ownership (one PostgreSQL DB, separate schemas per service)

Each microservice owns its schema. No service directly queries another service tables.
Cross-service data access happens through REST calls only.

  PostgreSQL: autoposter_db
  auth schema        owned by Auth Service
  user_config schema owned by User Config Service
  scheduler schema   owned by Scheduler Service
  products schema    owned by Fetcher Service
  post_events schema written by Pusher, read by Dashboard

---

## Schema: auth (Auth Service)

  auth.users
    id UUID PK, email VARCHAR UNIQUE NOT NULL,
    password_hash VARCHAR (NULL for OAuth users),
    name VARCHAR, provider VARCHAR (LOCAL/GOOGLE),
    is_active BOOLEAN, created_at TIMESTAMP, updated_at TIMESTAMP

  auth.refresh_tokens
    id UUID PK, user_id UUID FK auth.users,
    token_hash VARCHAR NOT NULL, expires_at TIMESTAMP,
    revoked BOOLEAN DEFAULT FALSE, created_at TIMESTAMP

  auth.login_attempts
    id UUID PK, email VARCHAR, ip_address VARCHAR,
    attempted_at TIMESTAMP, success BOOLEAN

  Indexes: email, token_hash, user_id on refresh_tokens

---

## Schema: user_config (User Config Service)

  user_config.amazon_credentials
    id UUID PK, user_id UUID UNIQUE NOT NULL,
    access_key_enc VARCHAR NOT NULL  (AES-256 encrypted),
    secret_key_enc VARCHAR NOT NULL  (AES-256 encrypted),
    affiliate_tag VARCHAR NOT NULL,
    categories TEXT[], min_discount_pct INTEGER DEFAULT 20,
    min_rating DECIMAL DEFAULT 3.5,
    is_active BOOLEAN, created_at TIMESTAMP, updated_at TIMESTAMP

  user_config.telegram_credentials
    id UUID PK, user_id UUID UNIQUE NOT NULL,
    bot_token_enc VARCHAR NOT NULL  (AES-256 encrypted),
    channel_id VARCHAR NOT NULL, channel_name VARCHAR,
    is_active BOOLEAN, last_verified_at TIMESTAMP,
    created_at TIMESTAMP, updated_at TIMESTAMP

  user_config.user_profiles
    id UUID PK, user_id UUID UNIQUE NOT NULL,
    timezone VARCHAR DEFAULT 'Asia/Kolkata',
    plan VARCHAR DEFAULT 'FREE',  (FREE, PRO, AGENCY)
    plan_expiry TIMESTAMP, notify_on_failure BOOLEAN,
    updated_at TIMESTAMP

---

## Schema: scheduler (Scheduler Service)

  scheduler.schedules
    id UUID PK, user_id UUID UNIQUE NOT NULL,
    posts_per_day INTEGER DEFAULT 3,
    posting_times TEXT[] DEFAULT '{09:00,18:00,21:00}',
    active_categories TEXT[], timezone VARCHAR,
    is_active BOOLEAN DEFAULT FALSE,
    quartz_job_key VARCHAR, quartz_trigger_key VARCHAR,
    updated_at TIMESTAMP

  scheduler.job_runs
    id UUID PK, user_id UUID NOT NULL, schedule_id UUID FK,
    triggered_at TIMESTAMP, completed_at TIMESTAMP,
    status VARCHAR  (RUNNING, SUCCESS, FAILED, SKIPPED),
    products_posted INTEGER DEFAULT 0, error_message TEXT

  Indexes: user_id, triggered_at DESC on job_runs

---

## Schema: products (Fetcher Service)

  products.products
    id UUID PK, asin VARCHAR UNIQUE NOT NULL,
    title VARCHAR, price DECIMAL, original_price DECIMAL,
    discount_pct INTEGER, rating DECIMAL, review_count INTEGER,
    image_url VARCHAR, product_url VARCHAR,
    category VARCHAR, source VARCHAR DEFAULT 'AMAZON',
    fetched_at TIMESTAMP, expires_at TIMESTAMP

  products.fetch_log
    id UUID PK, user_id UUID NOT NULL, category VARCHAR,
    fetched_count INTEGER, selected_asin VARCHAR,
    fetched_at TIMESTAMP, status VARCHAR

  Indexes: category, expires_at, discount_pct DESC

---

## Schema: post_events (Pusher writes, Dashboard reads)

  post_events.posts
    id UUID PK, user_id UUID NOT NULL,
    asin VARCHAR, product_title VARCHAR,
    category VARCHAR, discount_pct INTEGER,
    affiliate_url VARCHAR, platform VARCHAR DEFAULT 'TELEGRAM',
    telegram_message_id VARCHAR,
    status VARCHAR DEFAULT 'PENDING',  (PENDING, POSTED, FAILED)
    attempt_count INTEGER DEFAULT 0,
    error_message TEXT, posted_at TIMESTAMP, created_at TIMESTAMP

  post_events.post_delivery_log
    id UUID PK, post_id UUID FK post_events.posts,
    attempt_number INTEGER, attempted_at TIMESTAMP,
    response_code INTEGER, response_body TEXT, success BOOLEAN

  Indexes: user_id, (user_id + status), (user_id + created_at DESC), category

---

## Redis Key Map (Shared)

  token_blacklist:{jti}         Auth Service       TTL=token remaining life   Logout/revoke
  login_fail:{email}            Auth Service       TTL=15min                  Brute-force guard
  product_cache:{category}      Fetcher Service    TTL=1hr                    Shared product pool
  posted_products:{userId}      Pusher Service     TTL=30days                 Dedup, avoid repost
  fetch_quota:{userId}:{date}   Fetcher Service    TTL=24hr                   Amazon API rate guard
  rate_limit:{userId}:{ep}      API Gateway        TTL=1min                   Request rate limit

---

## Important Constraints

  auth.users.email                         UNIQUE NOT NULL
  products.products.asin                   UNIQUE  (shared pool, not per-user)
  user_config.amazon_credentials.user_id   UNIQUE  (one Amazon config per user in V1)
  user_config.telegram_credentials.user_id UNIQUE  (one Telegram config per user in V1)
  post_events.posts.status                 ENUM: PENDING, POSTED, FAILED
  auth.users.provider                      ENUM: LOCAL, GOOGLE
  user_config.user_profiles.plan           ENUM: FREE, PRO, AGENCY

---

## Sensitive Fields (All AES-256-GCM Encrypted at Rest)

  user_config.amazon_credentials.access_key_enc
  user_config.amazon_credentials.secret_key_enc
  user_config.telegram_credentials.bot_token_enc

  Master key injected via ENCRYPTION_MASTER_KEY env var.
  Never stored in DB or committed to source control.
  Never returned in any API response.

---

## Data Retention Policy

  post_events.posts          Keep forever    (user analytics history)
  post_events.delivery_log   90 days         (debug and audit)
  products.products          Clean after 48hr (freshness)
  products.fetch_log         30 days
  scheduler.job_runs         90 days
  auth.login_attempts        30 days
  auth.refresh_tokens        Clean revoked/expired daily (DB hygiene)
