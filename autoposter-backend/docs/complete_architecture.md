# Complete Backend Architecture & System Design (V1 - V4)

## 1. Full System Overview

The Affiliate Autoposter Backend evolves from a synchronized, true microservice architecture (V1) to an event-driven, globally scalable multi-tenant SaaS platform (V4). Its core purpose is to automate the discovery of affiliate products (Amazon) and publish them across multiple platforms (Telegram, Pinterest, Instagram, Twitter, WhatsApp, Facebook) based on user-defined schedules and preferences, including AI-driven selections.

---

## 2. Internal Architecture

### Services & Responsibilities

| Service | Port | Responsibility | Evolution |
| :--- | :--- | :--- | :--- |
| **API Gateway** | 8080 | Routing, JWT validation, Rate-limiting, CORS, TraceId injection. Custom domain routing in V4. | V1-V4 |
| **Auth Service** | 8081 | Registration, login, Google OAuth, JWT issue/refresh/revoke. | V1-V4 |
| **User Config Svc** | 8082 | Amazon/Telegram/Pinterest configs, Templates, AI pref, Platform toggles. | V1-V4 |
| **Scheduler Svc** | 8083 | Quartz per-user job management, plan limit enforcement. | V1-V4 |
| **Fetcher Service** | 8084 | Amazon PA API calls, product cache. In V3, publishes to Kafka instead of REST. | V1-V4 |
| **Pusher Service** | 8085 | Telegram/Pinterest publish. In V3, split into Platform Publisher Kafka consumers. | V1-V4 |
| **Dashboard Svc** | 8086 | Analytics, summaries, post history. In V3, supplements with ClickHouse data. | V1-V4 |
| **Eureka Service** | 8761 | Service Discovery Registry. | V1-V4 |
| **Image Service** | 8087 | Headless Playwright HTML→PNG render, uploads to Cloudinary (V2) or S3 (V4). | V2-V4 |
| **AI Service** | 8089 | Ranks/scores products via OpenAI/Gemini for optimal selection. | V3-V4 |
| **Analytics Svc** | 8090 | Consumes click events from Kafka, writes to ClickHouse, serves stats. | V3-V4 |
| **Billing Service** | 8091 | Subscriptions, Stripe/Razorpay webhooks, plan enforcement. | V4 |

### Service Internal Components

#### API GATEWAY
```text
┌─────────────────────────────────────────────────────────────┐
│                      API GATEWAY                            │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │                  FILTER CHAIN (Netty)                │  │
│  │                                                      │  │
│  │  TraceIdFilter      JwtAuthFilter      CorsFilter    │  │
│  │  • Inject UUID      • Verify JWT       • Handle CORS │  │
│  │  • Log requests     • Extract Claims   • Allowed Orgs│  │
│  └──────────────────┬───────────────────────────────────┘  │
│                     │                                       │
│  ┌──────────────────▼───────────────────────────────────┐  │
│  │                  ROUTING LAYER                       │  │
│  │                                                      │  │
│  │  RouteConfig           RateLimiterFilter             │  │
│  │  • Predicate Matching  • Token Bucket                │  │
│  │  • Downstream URIs     • Redis-backed                │  │
│  └────┬──────────────┬──────────────────────────────────┘  │
│       │              │                                      │
│  ┌────▼────┐   ┌─────▼──────┐   ┌────────────────────────┐  │
│  │ Service │   │   Redis    │   │      Eureka            │  │
│  │ Registry│   │   Layer    │   │      Discovery         │  │
│  │         │   │            │   │                        │  │
│  │ Load    │   │ Blacklist  │   │ Fetch service instances│  │
│  │ Balancer│   │ RateLimits │   │ auth, config, etc.     │  │
│  └─────────┘   └────────────┘   └────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

#### AUTH SERVICE
```text
┌─────────────────────────────────────────────────────────────┐
│                     AUTH SERVICE                            │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │                  CONTROLLER LAYER                    │  │
│  │                                                      │  │
│  │  AuthController         OAuth2Controller             │  │
│  │  POST /register         GET /oauth2/callback/google  │  │
│  │  POST /login                                         │  │
│  │  POST /refresh                                       │  │
│  │  POST /logout                                        │  │
│  └──────────────────┬───────────────────────────────────┘  │
│                     │                                       │
│  ┌──────────────────▼───────────────────────────────────┐  │
│  │                  SERVICE LAYER                       │  │
│  │                                                      │  │
│  │  AuthService          JwtService     OAuth2Service   │  │
│  │  • register()         • generate()   • handleGoogle  │  │
│  │  • login()            • validate()   • findOrCreate  │  │
│  │  • refresh()          • extract()                    │  │
│  │  • logout()           • blacklist()                  │  │
│  │  • checkBrute()                                      │  │
│  └────┬──────────────┬──────────────────────────────────┘  │
│       │              │                                      │
│  ┌────▼────┐   ┌─────▼──────┐                              │
│  │   JPA   │   │   Redis    │                              │
│  │  Layer  │   │   Layer    │                              │
│  │         │   │            │                              │
│  │ User    │   │ Blacklist  │                              │
│  │ Repo    │   │ BruteForce │                              │
│  │ Token   │   │ Counter    │                              │
│  │ Repo    │   │            │                              │
│  └────┬────┘   └────────────┘                              │
│       │                                                     │
│  ┌────▼──────────────────────┐                             │
│  │      PostgreSQL           │                             │
│  │      auth schema          │                             │
│  │                           │                             │
│  │  auth.users (Profile)     │                             │
│  │  auth.user_credentials    │                             │
│  │  auth.refresh_tokens      │                             │
│  │  auth.login_attempts      │                             │
│  └───────────────────────────┘                             │
└─────────────────────────────────────────────────────────────┘
```

#### USER CONFIG SERVICE
```text
┌─────────────────────────────────────────────────────────────┐
│                 USER CONFIG SERVICE                         │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │                  CONTROLLER LAYER                    │  │
│  │                                                      │  │
│  │  AmazonConfigController    TelegramConfigController  │  │
│  │  PinterestConfigController TemplateController          │  │
│  └──────────────────┬───────────────────────────────────┘  │
│                     │                                       │
│  ┌──────────────────▼───────────────────────────────────┐  │
│  │                  SERVICE LAYER                       │  │
│  │                                                      │  │
│  │  ConfigService        EncryptionService              │  │
│  │  • get/saveAmazon()   • encrypt(secret)              │  │
│  │  • get/saveTelegram() • decrypt(secret)              │  │
│  │  • verifyBot()        • AES-256-GCM                  │  │
│  └────┬──────────────┬──────────────────────────────────┘  │
│       │              │                                      │
│  ┌────▼────┐   ┌─────▼──────┐                              │
│  │   JPA   │   │  External  │                              │
│  │  Layer  │   │   APIs     │                              │
│  │         │   │            │                              │
│  │ Profile │   │ Telegram   │                              │
│  │ Repo    │   │ Pinterest  │                              │
│  │ Creds   │   │            │                              │
│  │ Repo    │   │            │                              │
│  └────┬────┘   └────────────┘                              │
│       │                                                     │
│  ┌────▼──────────────────────┐                             │
│  │      PostgreSQL           │                             │
│  │      user_config schema   │                             │
│  └───────────────────────────┘                             │
└─────────────────────────────────────────────────────────────┘
```

#### SCHEDULER SERVICE
```text
┌─────────────────────────────────────────────────────────────┐
│                   SCHEDULER SERVICE                         │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │                  CONTROLLER LAYER                    │  │
│  │                                                      │  │
│  │  ScheduleController       InternalController         │  │
│  │  • PUT /api/schedule      • GET /status/{userId}     │  │
│  │  • POST /activate                                    │  │
│  └──────────────────┬───────────────────────────────────┘  │
│                     │                                       │
│  ┌──────────────────▼───────────────────────────────────┐  │
│  │                  SERVICE LAYER                       │  │
│  │                                                      │  │
│  │  QuartzManager          PostingJob (Quartz Job)      │  │
│  │  • Dynamic Triggers     • execute()                  │  │
│  │  • Pausing/Resuming     • Call Fetcher               │  │
│  │  • Multi-user cron      • Plan Limit Check           │  │
│  └────┬──────────────┬──────────────────────────────────┘  │
│       │              │                                      │
│  ┌────▼────┐   ┌─────▼──────┐   ┌────────────────────────┐  │
│  │   JPA   │   │   Quartz   │   │      Feign /           │  │
│  │  Layer  │   │   Storage  │   │      REST Client       │  │
│  │         │   │            │   │                        │  │
│  │ Schedule│   │ JobStore   │   │ Call Config Svc        │  │
│  │ Repo    │   │ (Postgres) │   │ Call Fetcher Svc       │  │
│  │ JobRun  │   │ Triggers   │   │                        │  │
│  └────┬────┘   └─────┬──────┘   └────────────────────────┘  │
│       │              │                                      │
│  ┌────▼──────────────▼───────┐                             │
│  │      PostgreSQL           │                             │
│  │      scheduler schema     │                             │
│  └───────────────────────────┘                             │
└─────────────────────────────────────────────────────────────┘
```

#### FETCHER SERVICE
```text
┌─────────────────────────────────────────────────────────────┐
│                    FETCHER SERVICE                          │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │                  INTERNAL CONTROLLER                 │  │
│  │                                                      │  │
│  │  FetcherController                                   │  │
│  │  • POST /internal/fetch                              │  │
│  │  • Triggered by Scheduler                            │  │
│  └──────────────────┬───────────────────────────────────┘  │
│                     │                                       │
│  ┌──────────────────▼───────────────────────────────────┐  │
│  │                  SERVICE LAYER                       │  │
│  │                                                      │  │
│  │  AmazonService        AIEnrichmentService (V3)       │  │
│  │  • PA-API v5 Client   • Rank items                   │  │
│  │  • Sign AWS v4 req    • Filter by relevance          │  │
│  │  • Category Mapping   • Selection Logic              │  │
│  └────┬──────────────┬─────────────────┬────────────────┘  │
│       │              │                 │                    │
│  ┌────▼────┐   ┌─────▼──────┐   ┌──────▼─────┐   ┌─────────┐│
│  │   JPA   │   │   Redis    │   │    Kafka   │   │External ││
│  │  Layer  │   │   Layer    │   │   Producer │   │  APIs   ││
│  │         │   │            │   │            │   │         ││
│  │ Product │   │ Cache Pool │   │ product.   │   │ Amazon  ││
│  │ Repo    │   │ Quota Mgmt │   │   ready    │   │ PA-API  ││
│  └────┬────┘   └────────────┘   └──────┬─────┘   └─────────┘│
│       │                                │                    │
│  ┌────▼──────────────────────┐         │                    │
│  │      PostgreSQL           │         │                    │
│  │      products schema      │         ▼                    │
│  └───────────────────────────┘      [Message Broker]        │
└─────────────────────────────────────────────────────────────┘
```

#### PUSHER SERVICE (PLATFORM PUBLISHERS)
```text
┌─────────────────────────────────────────────────────────────┐
│                   PUBLISHER WORKERS                         │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │                  KAFKA CONSUMER LAYER                │  │
│  │                                                      │  │
│  │  TelegramListener      PinterestListener             │  │
│  │  InstagramListener     WhatsAppListener              │  │
│  │  Consumes topic: "product.ready"                     │  │
│  └──────────────────┬───────────────────────────────────┘  │
│                     │                                       │
│  ┌──────────────────▼───────────────────────────────────┐  │
│  │                  PUBLISH LOGIC                       │  │
│  │                                                      │  │
│  │  PublisherService     RetryManager (Resilience4j)    │  │
│  │  • Format message     • Exponential Backoff          │  │
│  │  • Attach visual      • Max 3 attempts               │  │
│  │  • Platform Auth      • Dead Letter Queue            │  │
│  └────┬──────────────┬─────────────────┬────────────────┘  │
│       │              │                 │                    │
│  ┌────▼────┐   ┌─────▼──────┐   ┌──────▼─────┐   ┌─────────┐│
│  │   JPA   │   │   Redis    │   │    Kafka   │   │External ││
│  │  Layer  │   │   Layer    │   │   Producer │   │  APIs   ││
│  │         │   │            │   │            │   │         ││
│  │ Post    │   │ Dedup Set  │   │ post.      │   │Telegram ││
│  │ Repo    │   │            │   │  result    │   │Meta/Pins││
│  └────┬────┘   └────────────┘   └──────┬─────┘   └─────────┘│
│       │                                │                    │
│  ┌────▼──────────────────────┐         │                    │
│  │      PostgreSQL           │         │                    │
│  │      post_events schema   │         ▼                    │
│  └───────────────────────────┘      [Message Broker]        │
└─────────────────────────────────────────────────────────────┘
```

#### DASHBOARD & ANALYTICS
```text
┌─────────────────────────────────────────────────────────────┐
│                 DASHBOARD / ANALYTICS                       │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │                  CONTROLLER LAYER                    │  │
│  │                                                      │  │
│  │  DashboardController      AnalyticsController        │  │
│  │  • GET /summary           • GET /clicks              │  │
│  │  • GET /recent-posts      • GET /breakdown           │  │
│  └──────────────────┬───────────────────────────────────┘  │
│                     │                                       │
│  ┌──────────────────▼───────────────────────────────────┐  │
│  │                  DATA AGGREGATION                    │  │
│  │                                                      │  │
│  │  StatsService           KafkaListener                │  │
│  │  • Aggregate Post Hist  • Consumes "post.result"     │  │
│  │  • GeoIP Enrichment     • Consumes "click.event"     │  │
│  │  • Period comparison                                 │  │
│  └────┬──────────────┬──────────────────────────────────┘  │
│       │              │                                      │
│  ┌────▼────┐   ┌─────▼──────┐                              │
│  │   JPA   │   │ ClickHouse │                              │
│  │  Layer  │   │   Repo     │                              │
│  │         │   │            │                              │
│  │ Post    │   │ Click      │                              │
│  │ Events  │   │ Analytics  │                              │
│  │ (Read)  │   │            │                              │
│  └────┬────┘   └─────┬──────┘                              │
│       │              │                                      │
│  ┌────▼────────┐   ┌─▼──────────────┐                      │
│  │ PostgreSQL  │   │  ClickHouse    │                      │
│  └─────────────┘   └────────────────┘                      │
└─────────────────────────────────────────────────────────────┘
```

#### BILLING SERVICE (V4)
```text
┌─────────────────────────────────────────────────────────────┐
│                    BILLING SERVICE                          │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │                  CONTROLLER LAYER                    │  │
│  │                                                      │  │
│  │  BillingController        WebhookController          │  │
│  │  • GET /api/plan          • POST /razorpay           │  │
│  │  • POST /upgrade          • POST /stripe             │  │
│  └──────────────────┬───────────────────────────────────┘  │
│                     │                                       │
│  ┌──────────────────▼───────────────────────────────────┐  │
│  │                  SERVICE LAYER                       │  │
│  │                                                      │  │
│  │  SubscriptionService      PaymentGatewayService      │  │
│  │  • Plan Logic             • Stripe Integration       │  │
│  │  • Team Management        • Razorpay Integration     │  │
│  │  • Quota Check            • Event Verification       │  │
│  └────┬──────────────┬─────────────────┬────────────────┘  │
│       │              │                 │                    │
│  ┌────▼────┐   ┌─────▼──────┐   ┌──────▼─────┐   ┌─────────┐│
│  │   JPA   │   │  Internal  │   │    Kafka   │   │External ││
│  │  Layer  │   │   APIs     │   │   Producer │   │  APIs   ││
│  │         │   │            │   │            │   │         ││
│  │ Sub     │   │ Update     │   │ billing.   │   │Stripe   ││
│  │ Repo    │   │ Profile    │   │  changed   │   │Razorpay ││
│  └────┬────┘   └────────────┘   └────────────┘   └─────────┘│
│       │                                                     │
│  ┌────▼──────────────────────┐                             │
│  │      PostgreSQL           │                             │
│  │      billing schema       │                             │
│  └───────────────────────────┘                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. Complete Flow Diagrams

### AUTH SERVICE FLOWS

#### Flow 1 — Register (Email + Password)
```text
Client                  Auth Service              PostgreSQL         Redis
  │                          │                        │               │
  │  POST /api/auth/register │                        │               │
  │  { email, password, name}│                        │               │
  ├─────────────────────────►│                        │               │
  │                          │ @Valid validates DTO   │               │
  │                          │                        │               │
  │                          │ findByEmail(email)     │               │
  │                          ├───────────────────────►│               │
  │                          │ user exists? NO        │               │
  │                          │◄───────────────────────┤               │
  │                          │                        │               │
  │                          │ Transactional Save:    │               │
  │                          │ 1. Create User Profile │               │
  │                          │ 2. Create Credential   │               │
  │                          │    (isEnabled=false)   │               │
  │                          │ 3. Create VerifyToken  │               │
  │                          │                        │               │
  │                          │ save(user, credential) │               │
  │                          ├───────────────────────►│               │
  │                          │ success                │               │
  │                          │◄───────────────────────┤               │
  │                          │                        │               │
  │                          │ Send Verification Email│               │
  │                          │ (Mock for now)         │               │
  │                          │                        │               │
  │  201 Created             │                        │               │
  │  "Verification email sent"                        │               │
  │◄─────────────────────────┤                        │               │
```

#### Flow 2 — Verify Email
```text
Client                  Auth Service              PostgreSQL
  │                          │                        │
  │  GET /api/auth/verify    │                        │
  │  ?token=uuid-123         │                        │
  ├─────────────────────────►│                        │
  │                          │ findByVerifyToken()    │
  │                          ├───────────────────────►│
  │                          │ token valid? YES       │
  │                          │◄───────────────────────┤
  │                          │                        │
  │                          │ Update Credential:     │
  │                          │ set isEnabled = true   │
  │                          │ clear verifyToken      │
  │                          ├───────────────────────►│
  │                          │                        │
  │  200 OK                  │                        │
  │  "Account activated"     │                        │
  │◄─────────────────────────┤                        │
```

#### Flow 3 — Login (Email + Password)
```text
Client                Auth Service           PostgreSQL         Redis
  │                        │                      │               │
  │  POST /api/auth/login  │                      │               │
  │  { email, password }   │                      │               │
  ├───────────────────────►│                      │               │
  │                        │                      │               │
  │                        │ get("login_fail:{email}")            │
  │                        ├─────────────────────────────────────►│
  │                        │ count = 3 (< 5, ok)  │               │
  │                        │◄─────────────────────────────────────┤
  │                        │                      │               │
  │                        │ findByEmail(email)   │               │
  │                        ├─────────────────────►│               │
  │                        │ user found           │               │
  │                        │◄─────────────────────┤               │
  │                        │                      │               │
  │                        │ check isEnabled?     │               │
  │                        │ NO → 403 Forbidden   │               │
  │                        │                      │               │
  │                        │ BCrypt.matches(password, hash)       │
  │                        │ ✓ matches                            │
  │                        │                      │               │
  │                        │ del("login_fail:{email}")            │
  │                        ├─────────────────────────────────────►│
  │                        │ save(login_attempt success=true)     │
  │                        ├─────────────────────►│               │
  │                        │                      │               │
  │                        │ generateAccessToken + RefreshToken   │
  │                        │ save RefreshToken    │               │
  │                        ├─────────────────────►│               │
  │                        │                      │               │
  │  200 OK                │                      │               │
  │  { accessToken,        │                      │               │
  │    refreshToken, user }│                      │               │
  │◄───────────────────────┤                      │               │
```

#### Flow 4 — Login Failed (Brute-Force Protection)
```text
Client               Auth Service              PostgreSQL         Redis
  │                       │                         │               │
  │  POST /api/auth/login │                         │               │
  │  { email, wrongPass } │                         │               │
  ├──────────────────────►│                         │               │
  │                       │ get("login_fail:{email}")               │
  │                       ├────────────────────────────────────────►│
  │                       │ count = 4 (< 5, proceed)│               │
  │                       │◄────────────────────────────────────────┤
  │                       │                         │               │
  │                       │ findByEmail(email)      │               │
  │                       ├────────────────────────►│               │
  │                       │                         │               │
  │                       │ BCrypt.matches() → FALSE│               │
  │                       │                         │               │
  │                       │ increment("login_fail:{email}")         │
  │                       │ expire key for 15 min   │               │
  │                       ├────────────────────────────────────────►│
  │                       │ count is now 5          │               │
  │                       │                         │               │
  │                       │ save(login_attempt success=false)       │
  │                       ├────────────────────────►│               │
  │                       │                         │               │
  │  401 Unauthorized     │                         │               │
  │  INVALID_CREDENTIALS  │                         │               │
  │◄──────────────────────┤                         │               │
  │                       │                         │               │
  │                       │                         │               │
  │  [next attempt]       │                         │               │
  ├──────────────────────►│                         │               │
  │                       │ get("login_fail:{email}")               │
  │                       ├────────────────────────────────────────►│
  │                       │ count = 5 ≥ 5           │               │
  │                       │◄────────────────────────────────────────┤
  │  423 Locked           │                         │               │
  │  ACCOUNT_LOCKED       │                         │               │
  │◄──────────────────────┤                         │               │
```

#### Flow 5 — Logout (Token Blacklisting)
```text
Client              API Gateway           Auth Service           Redis
  │                      │                     │                   │
  │  POST /api/auth/logout                     │                   │
  │  Authorization: Bearer {accessToken}       │                   │
  ├─────────────────────►│                     │                   │
  │                      │ validate JWT ✓      │                   │
  │                      │ inject X-User-Id    │                   │
  │                      ├────────────────────►│                   │
  │                      │                     │ extract jti from token
  │                      │                     │ calculate remaining TTL
  │                      │                     │                   │
  │                      │                     │ set("token_blacklist:{jti}",
  │                      │                     │     "revoked", remainingTTL)
  │                      │                     ├──────────────────►│
  │                      │                     │                   │
  │                      │                     │ revoke refresh token in DB
  │                      │                     │ (set revoked=true)│
  │                      │                     │                   │
  │  200 OK              │                     │                   │
  │  "Logged out"        │                     │                   │
  │◄─────────────────────┤                     │                   │
  │                      │                     │                   │
  │                      │                     │                   │
  │  [try reuse token]   │                     │                   │
  ├─────────────────────►│                     │                   │
  │                      │ validate JWT ✓      │                   │
  │                      │ check blacklist     │                   │
  │                      ├───────────────────────────────────────►│
  │                      │ "token_blacklist:{jti}" EXISTS          │
  │                      │◄───────────────────────────────────────┤
  │  401 TOKEN_REVOKED   │                     │                   │
  │◄─────────────────────┤                     │                   │
```

#### Flow 6 — Token Refresh (Rotation)
```text
Client                 Auth Service              PostgreSQL
  │                         │                         │
  │  POST /api/auth/refresh │                         │
  │  { refreshToken: "eyJ..."}                        │
  ├────────────────────────►│                         │
  │                         │ validate refresh token  │
  │                         │ (signature + expiry)    │
  │                         │                         │
  │                         │ extract userId from token
  │                         │                         │
  │                         │ findByTokenHashAndNotRevoked(hash)
  │                         ├────────────────────────►│
  │                         │ found, not expired ✓    │
  │                         │◄────────────────────────┤
  │                         │                         │
  │                         │ generate NEW accessToken│
  │                         │ generate NEW refreshToken (rotation)
  │                         │                         │
  │                         │ revoke OLD refresh token│
  │                         │ save NEW refresh token  │
  │                         ├────────────────────────►│
  │                         │                         │
  │  200 OK                 │                         │
  │  { accessToken: "new",  │                         │
  │    refreshToken: "new" }│                         │
  │◄────────────────────────┤                         │
```

#### Flow 7 — Google OAuth2 Login
```text
Client          Google            API Gateway        Auth Service     PostgreSQL
  │                │                   │                  │               │
  │ Click          │                   │                  │               │
  │ "Login with    │                   │                  │               │
  │  Google"       │                   │                  │               │
  ├───────────────────────────────────►│                  │               │
  │                │                   │ redirect to      │               │
  │                │                   │ Google OAuth URL │               │
  │◄───────────────────────────────────┤                  │               │
  │                │                   │                  │               │
  │ GET accounts.google.com/consent    │                  │               │
  ├───────────────►│                   │                  │               │
  │ User approves  │                   │                  │               │
  │                │                   │                  │               │
  │                │ redirect to       │                  │               │
  │                │ /oauth2/callback/ │                  │               │
  │                │ google?code=xyz   │                  │               │
  │                ├──────────────────►│                  │               │
  │                │                   │ route to Auth    │               │
  │                │                   ├─────────────────►│               │
  │                │                   │                  │               │
  │                │ exchange code     │                  │               │
  │                │ for ID token      │                  │               │
  │◄───────────────┤ (Spring does this │                  │               │
  │                │ automatically)    │                  │               │
  │                │                   │                  │               │
  │                │                   │                  │ extract email,
  │                │                   │                  │ name from
  │                │                   │                  │ Google ID token
  │                │                   │                  │               │
  │                │                   │                  │ findByEmail() │
  │                │                   │                  ├──────────────►│
  │                │                   │                  │               │
  │                │                   │         user exists? YES → load  │
  │                │                   │         user exists? NO  → create│
  │                │                   │                  │◄──────────────┤
  │                │                   │                  │               │
  │                │                   │                  │ generateAccessToken
  │                │                   │                  │ generateRefreshToken
  │                │                   │                  │               │
  │ redirect to    │                   │                  │               │
  │ frontend with  │                   │                  │               │
  │ ?token=eyJ...  │                   │                  │               │
  │◄───────────────────────────────────┤                  │               │
```

### CONFIG SERVICE FLOWS

#### Flow 8 — Update Amazon Config
```text
Client                API Gateway            Config Service         PostgreSQL
  │                        │                      │                     │
  │  PUT /api/amazon-config│                      │                     │
  │  { accessKey, ... }    │                      │                     │
  ├───────────────────────►│                      │                     │
  │                        │ validate JWT ✓       │                     │
  │                        │ inject X-User-Id     │                     │
  │                        ├─────────────────────►│                     │
  │                        │                      │ EncryptionService.encrypt()
  │                        │                      │ (AES-256-GCM)       │
  │                        │                      │                     │
  │                        │                      │ save(AmazonCreds)   │
  │                        │                      ├────────────────────►│
  │                        │                      │ success             │
  │                        │                      │◄────────────────────┤
  │  200 OK                │                      │                     │
  │◄───────────────────────┤                      │                     │
```

### SCHEDULER SERVICE FLOWS

#### Flow 9 — Update Schedule
```text
Client                API Gateway           Scheduler Service       PostgreSQL
  │                        │                      │                     │
  │  PUT /api/schedule     │                      │                     │
  │  { times: [...] }      │                      │                     │
  ├───────────────────────►│                      │                     │
  │                        │ validate JWT ✓       │                     │
  │                        │ inject X-User-Id     │                     │
  │                        ├─────────────────────►│                     │
  │                        │                      │ updateSchedule(userId)
  │                        │                      ├────────────────────►│
  │                        │                      │                     │
  │                        │                      │ QuartzManager.reschedule()
  │                        │                      │ (update cron triggers)
  │                        │                      │                     │
  │  200 OK                │                      │                     │
  │◄───────────────────────┤                      │                     │
```

### CORE ENGINE FLOW (THE AUTOPOSTER)

#### Flow 10 — Scheduled Posting Cycle
```text
Quartz Trigger        Scheduler Svc          Fetcher Svc            External APIs
  │                        │                      │                     │
  │ FIRE!                  │                      │                     │
  ├───────────────────────►│                      │                     │
  │                        │ checkConfigStatus()  │                     │
  │                        ├─────────────────────►│ (User Config Svc)   │
  │                        │ OK ✓                 │                     │
  │                        │                      │                     │
  │                        │ POST /internal/fetch │                     │
  │                        ├─────────────────────►│                     │
  │                        │                      │ Amazon PA API Fetch │
  │                        │                      ├────────────────────►│
  │                        │                      │ candidates found    │
  │                        │                      │◄────────────────────┤
  │                        │                      │                     │
  │                        │                      │ AI Svc Rank (V3)    │
  │                        │                      ├────────────────────►│
  │                        │                      │ best product picked │
  │                        │                      │◄────────────────────┤
  │                        │                      │                     │
  │                        │                      │ Image Svc Render (V2)
  │                        │                      ├────────────────────►│
  │                        │                      │ image CDN URL       │
  │                        │                      │◄────────────────────┤
  │                        │                      │                     │
  │                        │                      │ Kafka Publish       │
  │                        │                      │ "product.ready"     │
  │                        │                      ├───────────┐         │
  │                        │                      │           │         │
  │                        │                      │◄──────────┘         │
  │                        │                      │                     │
  │ job success recorded   │                      │                     │
  │◄───────────────────────┤                      │                     │
```

---

## 4. Database Schema Design

Database: `autoposter_db` (PostgreSQL) - Segmented by schema per service. ClickHouse used for Analytics in V3+.

### Schema: `auth` (Auth Service)
*   **users:** `id (UUID)`, `email`, `name`, `phone`, `other_details`, `created_at`, `updated_at`
*   **user_credentials:** `id`, `user_id (FK)`, `email (Unique)`, `password`, `is_enabled`, `verification_token`, `reset_token`, `reset_token_expiry`
*   **refresh_tokens:** `id`, `user_id`, `token`, `expiry_date`, `revoked`
*   **login_attempts:** `id`, `email`, `ip_address`, `success`

### Schema: `user_config` (User Config Service)
*   **user_profiles:** `id`, `user_id`, `timezone`, `plan`, `preferred_template_id` (V2), `ai_picker_enabled` (V3), `agency_owner_id` (V4), `stripe_customer_id` (V4)
*   **amazon_credentials:** `id`, `user_id`, `access_key_enc`, `secret_key_enc`, `affiliate_tag`, `categories[]`, `min_discount_pct`, `min_rating`
*   **telegram_credentials / pinterest_credentials:** Similar structure; tokens AES-256-GCM encrypted.

### Schema: `scheduler` (Scheduler Service)
*   **schedules:** `id`, `user_id`, `posts_per_day`, `posting_times[]`, `active_categories[]`, `quartz_job_key`, `is_active`
*   **job_runs:** `id`, `user_id`, `status` (RUNNING, SUCCESS, FAILED), `error_message`, `triggered_at`

### Schema: `products` (Fetcher Service)
*   **products:** `id`, `asin`, `title`, `price`, `discount_pct`, `image_url`, `category`, `expires_at`
*   **fetch_log:** tracks fetch counts and API quotas.

### Schema: `post_events` (Dashboard / Publishers)
*   **posts:** `id`, `user_id`, `asin`, `platform`, `status` (PENDING, POSTED, FAILED), `error_message`, `posted_at`
*   **post_delivery_log:** `id`, `post_id`, `attempt_number`, `response_code`

### ClickHouse Schema: `analytics` (V3+)
*   **click_events:** `id`, `post_id`, `user_id`, `platform`, `short_url`, `clicked_at`, `country_code`, `device_type`, `ip_hash`

### Schema: `billing` & `agency` (V4+)
*   **subscriptions:** `id`, `user_id`, `plan`, `status`, `provider`, `external_subscription_id`, `period_end`
*   **team_members:** `id`, `agency_user_id`, `member_user_id`, `role` (VIEWER, EDITOR, ADMIN)

---

## 5. Redis Key Design

Redis is used globally for caching, rate limiting, and session security.

| Key Pattern | Type | TTL | Owner | Purpose |
| :--- | :--- | :--- | :--- | :--- |
| `token_blacklist:{jti}` | String | Token Exp | API Gateway | Invalidates logged-out JWTs. |
| `rate_limit:{userId}:{endpoint}` | Counter| 1 min | API Gateway | Prevents API spam. |
| `login_fail:{email}` | Counter| 15 min | Auth Service | Brute-force protection (lockout after 5). |
| `product_cache:{category}` | Hash | 1 hr | Fetcher Svc | Shared pool to reduce Amazon API calls. |
| `fetch_quota:{userId}:{date}` | String | 24 hr | Fetcher Svc | Amazon API rate limit guard per user. |
| `posted_products:{userId}` | Set | 30 days| Pusher Svc | Deduplication to prevent reposting identical items. |

---

## 6. Package Structure (Standard Microservice)

Each Spring Boot microservice follows domain-driven packaging:

```text
com.autoposter.{service_name}
├── config/           # Security, Kafka, Beans, ExceptionHandlers
├── controller/       # REST API endpoints
├── service/          # Business logic
├── repository/       # Spring Data JPA / ClickHouse interfaces
├── entity/           # JPA Entities / Models
├── dto/              # Request/Response objects
└── security/         # Local security filters (if applicable)

com.autoposter.common # Shared Library Maven Module
├── dto/              # ApiResponse, ErrorResponse, ProductPayload
├── exception/        # Custom exceptions
└── trace/            # TraceId MDC utilities
```

---

## 7. Key Design Decisions Explained

1.  **API Gateway JWT Injection:** The Gateway validates the JWT once, extracts claims, and injects `X-User-Id`, `X-User-Email`, `X-User-Plan` headers. Downstream services trust the Gateway and do not re-validate the token, saving compute and complexity.
2.  **AES-256-GCM Encryption for Credentials:** Third-party API keys (Amazon, Telegram, etc.) are encrypted at rest using a master key injected via environment variables. This prevents mass compromise if the database is breached.
3.  **TraceId Propagation:** Every request receives a UUID `X-Trace-Id` at the Gateway. The common-lib library handles populating MDC (Mapped Diagnostic Context) so logs across all microservices can be aggregated by a single flow.
4.  **Migration to Kafka (V3):** Moving from REST to Kafka for publishing decouples the `Fetcher` from the specific target platforms. Adding Instagram support requires zero changes to the core scheduling loop; it just requires spinning up a new Kafka consumer.
5.  **ClickHouse for Analytics (V3):** Postgres `post_events` is great for OLTP status tracking, but tracking millions of URL clicks requires an OLAP database. ClickHouse provides sub-second aggregations for the dashboard.
6.  **Playwright Sidecar (V2):** Using Playwright allows using standard web tech (HTML/Tailwind) to design beautiful post images dynamically, rather than relying on complex Java graphics libraries.

---

## 8. Non-Functional Requirements (NFRs)

*   **Security:**
    *   No PII or secrets logged.
    *   Secrets encrypted at rest.
    *   Internal APIs (`/internal/**`) are blocked at the Gateway and only accessible via internal Docker/K8s networking.
*   **Scalability:**
    *   Stateless services (session state in Redis/JWT).
    *   V4 utilizes Kubernetes HPA (Horizontal Pod Autoscaler) based on CPU/Kafka lag metrics.
*   **Observability:**
    *   Trace IDs on every log line.
    *   Actuator endpoints exposed (`/health`, `/metrics`) for Prometheus scraping.
*   **Resilience:**
    *   Exponential backoff for third-party API failures (Amazon, Telegram).
    *   Circuit breakers via Resilience4j (or Feign equivalents) to prevent cascading failures.
*   **Performance:**
    *   Gateway Rate Limiting: Redis-backed token bucket algorithm.
    *   Product caching to minimize external API latency.

---

## 9. Functional Requirements (By Service)

*   **Auth:** Must register users, issue expiring JWTs, handle Google OAuth2 callbacks, and support secure logout via token blacklisting.
*   **User Config:** Must securely store and validate user credentials for Amazon and destination platforms. Must allow users to select templates and toggle AI features.
*   **Scheduler:** Must guarantee job execution based on user timezones. Must enforce daily limits based on subscription plans (e.g., Free = 3 posts, Pro = 20 posts).
*   **Fetcher:** Must reliably search Amazon PA API, calculate discounts, and ensure the same product is not posted twice to the same user within 30 days.
*   **Pusher (Publishers):** Must format messages specifically for their target platform (e.g., Telegram MarkdownV2, Pinterest Board format). Must handle platform-specific rate limits gracefully.
*   **Image Service:** Must generate PNGs within 5 seconds to prevent downstream timeouts.
*   **Dashboard / Analytics:** Must aggregate post success rates, category breakdowns, and click-through rates in near real-time.
*   **Billing:** Must automatically downgrade users whose payments fail or expire. Must support multi-tenant agency management.
