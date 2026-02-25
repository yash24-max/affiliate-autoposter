# Backend Security Design — Microservice Edition

## Authentication Flow

  1. User registers or logs in via Auth Service
  2. Auth Service issues JWT access token (15 min TTL) + refresh token (7 day TTL)
  3. Frontend stores access token in memory (not localStorage)
  4. Frontend sends: Authorization: Bearer {accessToken} on every request
  5. API Gateway intercepts all requests to /api/**
  6. API Gateway validates JWT (signature + expiry + blacklist check)
  7. API Gateway injects X-User-Id and X-User-Email headers into downstream request
  8. Downstream services (Auth, UserConfig, Scheduler, Dashboard) trust X-User-Id header
  9. Fetcher and Pusher are internal only — not reachable from outside Docker network

## JWT Design

  Algorithm: HS256 (V1) → RS256 with key rotation (V3)
  Access token TTL: 15 minutes
  Refresh token TTL: 7 days
  Claims: sub (userId), email, plan, iat, exp, jti (unique token ID for blacklisting)

## Token Blacklist (Logout Support)

  On logout: JTI stored in Redis with TTL = remaining access token lifetime
  API Gateway checks Redis for JTI on every request
  Result: tokens are effectively revoked before natural expiry

## Authorization

  All /api/** endpoints protected by JWT validation at Gateway level
  All /oauth2/** endpoints public (no JWT)
  All /api/auth/** endpoints public (no JWT)
  All /internal/** endpoints NOT routed through Gateway — only reachable within Docker network
  Each service additionally verifies X-User-Id header is present before serving data
  No user can access another user config, posts, or schedule (user_id scope enforced in every query)

## Secret Management

  amazon_credentials.access_key_enc    AES-256-GCM encrypted before DB write
  amazon_credentials.secret_key_enc    AES-256-GCM encrypted before DB write
  telegram_credentials.bot_token_enc   AES-256-GCM encrypted before DB write
  Master encryption key via ENCRYPTION_MASTER_KEY env var (never hardcoded)
  Secrets NEVER returned in API responses
  Secrets NEVER logged even at DEBUG level

## Input Validation and Hardening

  All write endpoints: DTO validation via @Valid + @NotNull/@Email/@Size
  GlobalExceptionHandler: catches MethodArgumentNotValidException, returns errorCode + message
  Sanitized error messages: never expose stack traces or internal error details to client
  SQL injection: prevented by Spring Data JPA parameterized queries
  Rate limiting at API Gateway: per-user per-endpoint using Redis token bucket

## Brute-Force Protection

  Auth Service tracks failed login attempts per email in Redis
  After 5 failures within 15 minutes: account temporarily locked (returns 423 Locked)
  Login attempt log written to auth.login_attempts table for audit

## Internal Service Security (V1)

  Fetcher and Pusher are on private Docker network only
  Scheduler calls Fetcher via http://fetcher-service:8084 (internal Docker DNS)
  Fetcher calls Pusher via http://pusher-service:8085 (internal Docker DNS)
  No external traffic can reach these services directly
  V3+: Add mutual TLS or service mesh (Istio) for service-to-service auth

## Audit and Logging

  Every request gets a traceId injected by API Gateway TraceIdFilter
  traceId propagated to all downstream services via X-Trace-Id header
  Auth events logged: registration, login success, login failure, logout, token refresh
  Config change events logged: Amazon config saved, Telegram config saved/verified
  Post events logged: every post attempt with outcome in post_delivery_log table
  No PII or credentials in any log line
