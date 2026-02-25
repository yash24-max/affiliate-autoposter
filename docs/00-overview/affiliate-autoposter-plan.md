# 🛒 Affiliate Auto-Poster — Full Product Plan
### B2C SaaS | Spring Boot | Passive Income Platform

> **Vision:** A platform where anyone can sign up, connect their Amazon Affiliate account and Telegram channel, and let the system automatically fetch trending products, generate posts, and publish them — earning passive affiliate income without lifting a finger.

---

## 📌 Table of Contents

1. [Problem Statement](#problem-statement)
2. [How Money Flows](#how-money-flows)
3. [User Journey (B2C)](#user-journey-b2c)
4. [V1 — Core MVP](#v1--core-mvp)
5. [V2 — Image Templates + Pinterest](#v2--image-templates--pinterest)
6. [V3 — Multi-Platform + AI](#v3--multi-platform--ai)
7. [V4 — Full B2C Platform](#v4--full-b2c-platform)
8. [Full Tech Stack](#full-tech-stack)
9. [Database Schema](#database-schema)
10. [Project Structure](#project-structure)
11. [Monetization Plans](#monetization-plans)
12. [12-Week V1 Build Timeline](#12-week-v1-build-timeline)
13. [Day 1 Checklist](#day-1-checklist)

---

## 🎯 Problem Statement

Thousands of content creators, bloggers, and side-hustle seekers sign up for Amazon Associates / Flipkart Affiliate programs but **never earn consistently** because:

- Manually finding deals every day is time-consuming
- Creating good-looking posts takes design skills
- Posting consistently across platforms is exhausting
- Tracking what's working requires technical knowledge

**This platform solves all of it — automatically.**

---

## 💰 How Money Flows

```
Amazon / Flipkart
        ↓  (Product Advertising API)
  Your Platform fetches top deals + generates affiliate links
        ↓  (Auto image/text post generation)
  Posts to Telegram / Pinterest / Instagram / Twitter
        ↓  (User clicks → lands on Amazon/Flipkart)
  User purchases the product
        ↓
  YOUR USER earns affiliate commission (2–9%)
        ↓
  YOUR USER pays YOU a monthly subscription
```

**You earn subscription revenue. Your users earn affiliate commissions. Double win.**

---

## 👤 User Journey (B2C)

```
1. User visits your platform → signs up with email / Google
          ↓
2. User registers on Amazon Associates → gets affiliate tag
          ↓
3. User creates a Telegram Bot + channel → gets bot token + channel ID
          ↓
4. User connects both on your platform settings page
          ↓
5. User picks product categories (Electronics / Fashion / Deals)
          ↓
6. User sets schedule: "Post 5 times/day at 9AM, 12PM, 3PM, 6PM, 9PM"
          ↓
7. ✅ System runs 100% automatically — fetches, generates, publishes
          ↓
8. User logs in to dashboard to see: posts made, clicks, estimated earnings
```

---

## 🚀 V1 — Core MVP

**Goal:** Ship the smallest working product. Prove the idea. Get first paying users.

### Scope

| Feature | Include in V1? |
|---|---|
| User registration + login (JWT) | ✅ Yes |
| Google OAuth login | ✅ Yes |
| Amazon PA API product fetcher | ✅ Yes |
| Telegram auto-publisher | ✅ Yes |
| Per-user post scheduling (Quartz) | ✅ Yes |
| Basic dashboard (posts today, this week) | ✅ Yes |
| User Amazon config (API keys, affiliate tag) | ✅ Yes |
| User Telegram config (bot token, channel ID) | ✅ Yes |
| Subscription / payments | ❌ Later |
| Image template generation | ❌ Later |
| Pinterest / Instagram publisher | ❌ Later |

### Tech Stack (V1)

| Layer | Technology |
|---|---|
| Backend | Spring Boot 3.x |
| Security | Spring Security + JWT + OAuth2 |
| Database | PostgreSQL |
| ORM | Spring Data JPA + Hibernate |
| Cache | Redis (product cache, rate limiting) |
| Scheduler | Quartz Scheduler (per-user jobs) |
| Amazon API | Amazon Product Advertising API (PA API 5.0) |
| Telegram | Telegram Bot API (HTTP calls via RestTemplate) |
| Build Tool | Maven |
| Containerization | Docker + Docker Compose |
| Deployment | Railway / Render (free tier to start) |
| CI/CD | GitHub Actions |

### V1 Key Features Deep Dive

**Product Fetcher (Amazon PA API)**
- Fetches top deals by category (Electronics, Fashion, Beauty, Home)
- Filters: minimum discount % (e.g., ≥ 30%), minimum rating (e.g., ≥ 4.0 stars)
- Auto-generates affiliate link using user's affiliate tag
- Caches products in Redis for 1 hour to avoid duplicate API calls
- Stores fetched products in PostgreSQL

**Telegram Publisher**
- Connects to user's Telegram Bot via Bot API
- Posts to user's private channel
- Message format: Product title, price (original + discounted), discount %, rating, affiliate link
- Sends product image as photo with caption
- Handles API failures with retry logic

**Quartz Scheduler**
- Each user gets their own scheduled job
- Runs at user-defined times (e.g., every 3 hours)
- Picks a product not yet posted (no duplicates)
- Falls back gracefully if no product available

**Dashboard**
- Total posts made (today / this week / all time)
- Posts by category breakdown
- Recent post history with status (Posted / Failed)
- Telegram channel link preview

---

## 🖼️ V2 — Image Templates + Pinterest

**Goal:** Make posts visually attractive. Add Pinterest for long-term passive reach.

### New Features

| Feature | Details |
|---|---|
| HTML → Image generator | Design 5–10 product card templates in HTML/CSS. Render via Playwright (headless Chrome) → export as PNG |
| Cloudinary integration | Store and serve generated images at CDN speed |
| Pinterest publisher | Pinterest API v5 — post image pin with affiliate link |
| Template picker | User can choose which template style they prefer |
| More product sources | Flipkart Affiliate API + Cashkaro deals |

### New Tech Introduced in V2

| Tech | Purpose |
|---|---|
| Playwright (Java/Node sidecar) | Headless browser for HTML → PNG |
| Cloudinary SDK | Image storage and CDN delivery |
| Pinterest API v5 | Publishing pins with affiliate links |
| Feign Client | Cleaner external API calls (replaces RestTemplate) |

### Why Pinterest?

Pinterest posts (Pins) have a **lifespan of months to years** — a pin posted today can still drive traffic 6 months later. This creates compounding passive income unlike Instagram or Twitter where posts die in hours.

---

## 🌐 V3 — Multi-Platform + AI Smart Picks

**Goal:** Expand reach. Use AI to pick the best-performing products.

### New Features

| Feature | Details |
|---|---|
| Instagram publisher | Meta Business API — requires Facebook Business account |
| Twitter / X publisher | Twitter API v2 — post with image and affiliate link |
| WhatsApp Channel publisher | WhatsApp Business API (free tier available) |
| Facebook Page publisher | Meta Graph API |
| AI product picker | OpenAI / Gemini API — picks products based on season, trends, day of week |
| Click tracking | Custom short URL redirect + click tracking by platform, country, device |
| Earnings estimate | Pull Amazon reporting API + estimate earnings per product |
| A/B template testing | Test which template gets more clicks |

### New Tech Introduced in V3

| Tech | Purpose |
|---|---|
| Spring AI | OpenAI / Gemini API integration for smart picks |
| Kafka | Async event-driven post publishing pipeline |
| ClickHouse | High-performance analytics for click tracking |
| URL shortener module | Custom short links with redirect tracking |

---

## 🏢 V4 — Full B2C Platform

**Goal:** Make it a polished, scalable, multi-tenant SaaS product.

### New Features

| Feature | Details |
|---|---|
| Razorpay / Stripe payments | Subscription billing with FREE / PRO / AGENCY plans |
| Multi-account support | One user manages multiple affiliate accounts / channels |
| Team / agency mode | Invite team members, manage multiple clients |
| White-label option | Agencies can brand the tool as their own |
| Mobile app | React Native app for on-the-go dashboard |
| Webhook notifications | WhatsApp / Email alerts when earnings milestones hit |
| Product blacklist | User can exclude specific products/brands |
| Custom posting rules | "Only post if discount > 50%" type rules |
| Analytics deep dive | Best performing categories, times, platforms per user |
| Admin panel | Manage all users, plans, system health |

### New Tech Introduced in V4

| Tech | Purpose |
|---|---|
| Razorpay Subscriptions API | Recurring billing |
| Spring Boot Multi-tenancy | Separate data per tenant/user |
| React Native | Mobile dashboard app |
| Grafana + Prometheus | System monitoring and alerting |
| AWS S3 + CloudFront | Production image storage and CDN |
| AWS RDS | Managed PostgreSQL in production |
| Kubernetes (K8s) | Container orchestration at scale |

---

## 🔧 Full Tech Stack (All Versions)

```
┌─────────────────────────────────────────────────────────┐
│                    FRONTEND (React)                      │
│  React 18 + Vite + Tailwind CSS + React Query           │
│  Recharts (analytics) + React Router                    │
└─────────────────────────┬───────────────────────────────┘
                          │ REST API (JSON)
┌─────────────────────────▼───────────────────────────────┐
│                 BACKEND (Spring Boot 3)                  │
│                                                         │
│  Spring Security (JWT + OAuth2 Google)                  │
│  Spring Data JPA + Hibernate                            │
│  Spring Web (REST Controllers)                          │
│  Spring Mail                                            │
│  Quartz Scheduler                                       │
│  Spring AI (V3+)                                        │
│  Spring Batch (V3+ for bulk operations)                 │
│  Feign Client (external APIs)                           │
└──────┬──────────┬──────────┬──────────┬─────────────────┘
       │          │          │          │
┌──────▼──┐  ┌───▼────┐  ┌──▼───┐  ┌──▼──────────────┐
│PostgreSQL│  │ Redis  │  │Kafka │  │ ClickHouse (V3) │
│(main DB) │  │(cache) │  │(V3+) │  │ (analytics)    │
└─────────┘  └────────┘  └──────┘  └────────────────┘
       │
┌──────▼──────────────────────────────────────────────────┐
│              EXTERNAL APIs                              │
│  Amazon PA API 5.0   Flipkart Affiliate API             │
│  Telegram Bot API    Pinterest API v5                   │
│  Meta Graph API      Twitter API v2                     │
│  OpenAI / Gemini     Razorpay / Stripe                  │
│  Cloudinary / AWS S3                                    │
└─────────────────────────────────────────────────────────┘
       │
┌──────▼──────────────────────────────────────────────────┐
│              INFRASTRUCTURE                             │
│  Docker + Docker Compose                                │
│  GitHub Actions (CI/CD)                                 │
│  Railway / Render (V1) → AWS EC2 / ECS (V3+)           │
│  Grafana + Prometheus (monitoring)                      │
│  Kubernetes (V4)                                        │
└─────────────────────────────────────────────────────────┘
```

---

## 🗄️ Database Schema

### Core Tables

```sql
-- =============================================
-- USERS
-- =============================================
CREATE TABLE users (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email       VARCHAR(255) UNIQUE NOT NULL,
    password    VARCHAR(255),                    -- null if OAuth login
    name        VARCHAR(255),
    plan        VARCHAR(20) DEFAULT 'FREE',      -- FREE, PRO, AGENCY
    plan_expiry TIMESTAMP,
    provider    VARCHAR(20) DEFAULT 'LOCAL',     -- LOCAL, GOOGLE
    created_at  TIMESTAMP DEFAULT NOW(),
    updated_at  TIMESTAMP DEFAULT NOW()
);

-- =============================================
-- AMAZON CONFIG (per user)
-- =============================================
CREATE TABLE amazon_config (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID REFERENCES users(id) ON DELETE CASCADE,
    access_key          VARCHAR(255) NOT NULL,
    secret_key          VARCHAR(255) NOT NULL,     -- store encrypted
    affiliate_tag       VARCHAR(100) NOT NULL,
    categories          TEXT[],                    -- ['Electronics','Fashion']
    min_discount_pct    INTEGER DEFAULT 20,
    min_rating          DECIMAL(2,1) DEFAULT 3.5,
    is_active           BOOLEAN DEFAULT TRUE,
    created_at          TIMESTAMP DEFAULT NOW()
);

-- =============================================
-- TELEGRAM CONFIG (per user)
-- =============================================
CREATE TABLE telegram_config (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID REFERENCES users(id) ON DELETE CASCADE,
    bot_token       VARCHAR(255) NOT NULL,         -- store encrypted
    channel_id      VARCHAR(100) NOT NULL,         -- e.g. @mychannel or -100xxxxxxx
    channel_name    VARCHAR(255),
    is_active       BOOLEAN DEFAULT TRUE,
    created_at      TIMESTAMP DEFAULT NOW()
);

-- =============================================
-- PRODUCTS (shared cache — all users benefit)
-- =============================================
CREATE TABLE products (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asin                VARCHAR(20) UNIQUE NOT NULL,
    title               VARCHAR(500),
    description         TEXT,
    price               DECIMAL(10,2),
    original_price      DECIMAL(10,2),
    discount_percent    INTEGER,
    rating              DECIMAL(2,1),
    review_count        INTEGER,
    image_url           VARCHAR(1000),
    product_url         VARCHAR(1000),
    category            VARCHAR(100),
    source              VARCHAR(50) DEFAULT 'AMAZON',
    fetched_at          TIMESTAMP DEFAULT NOW(),
    expires_at          TIMESTAMP
);

-- =============================================
-- POSTS (per user — one row per post attempt)
-- =============================================
CREATE TABLE posts (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID REFERENCES users(id) ON DELETE CASCADE,
    product_id          UUID REFERENCES products(id),
    platform            VARCHAR(50) NOT NULL,      -- TELEGRAM, PINTEREST, TWITTER
    affiliate_url       VARCHAR(1000),
    status              VARCHAR(20) DEFAULT 'PENDING', -- PENDING, POSTED, FAILED
    platform_post_id    VARCHAR(255),              -- ID returned by platform API
    error_message       TEXT,
    posted_at           TIMESTAMP,
    click_count         INTEGER DEFAULT 0,
    created_at          TIMESTAMP DEFAULT NOW()
);

-- =============================================
-- POST SCHEDULE (per user)
-- =============================================
CREATE TABLE post_schedule (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID REFERENCES users(id) ON DELETE CASCADE,
    posts_per_day       INTEGER DEFAULT 5,
    posting_times       TEXT[],                    -- ['09:00','12:00','15:00','18:00','21:00']
    active_categories   TEXT[],
    timezone            VARCHAR(100) DEFAULT 'Asia/Kolkata',
    is_active           BOOLEAN DEFAULT TRUE,
    quartz_job_key      VARCHAR(255),              -- Quartz job identifier
    updated_at          TIMESTAMP DEFAULT NOW()
);
```

---

## 🏗️ Project Structure

```
affiliate-autoposter/
├── .github/
│   └── workflows/
│       └── deploy.yml                    ← GitHub Actions CI/CD
│
├── docker/
│   ├── Dockerfile
│   └── docker-compose.yml               ← PostgreSQL + Redis + App
│
├── src/
│   └── main/
│       ├── java/com/autoposter/
│       │   │
│       │   ├── auth/                     ← Authentication module
│       │   │   ├── AuthController.java
│       │   │   ├── AuthService.java
│       │   │   ├── JwtService.java
│       │   │   ├── OAuth2Service.java
│       │   │   └── dto/
│       │   │       ├── RegisterRequest.java
│       │   │       ├── LoginRequest.java
│       │   │       └── AuthResponse.java
│       │   │
│       │   ├── user/                     ← User management
│       │   │   ├── UserController.java
│       │   │   ├── UserService.java
│       │   │   └── entity/User.java
│       │   │
│       │   ├── amazon/                   ← Amazon PA API module
│       │   │   ├── AmazonProductFetcher.java
│       │   │   ├── AmazonConfigService.java
│       │   │   ├── AmazonConfigController.java
│       │   │   ├── entity/AmazonConfig.java
│       │   │   └── dto/ProductDto.java
│       │   │
│       │   ├── product/                  ← Product storage & retrieval
│       │   │   ├── ProductService.java
│       │   │   ├── ProductRepository.java
│       │   │   └── entity/Product.java
│       │   │
│       │   ├── telegram/                 ← Telegram publisher module
│       │   │   ├── TelegramPublisher.java
│       │   │   ├── TelegramConfigService.java
│       │   │   ├── TelegramConfigController.java
│       │   │   ├── MessageTemplateBuilder.java
│       │   │   └── entity/TelegramConfig.java
│       │   │
│       │   ├── scheduler/                ← Quartz job management
│       │   │   ├── PostSchedulerService.java
│       │   │   ├── PostJob.java          ← Quartz Job implementation
│       │   │   ├── ScheduleController.java
│       │   │   ├── SchedulerConfig.java
│       │   │   └── entity/PostSchedule.java
│       │   │
│       │   ├── post/                     ← Post tracking
│       │   │   ├── PostService.java
│       │   │   ├── PostRepository.java
│       │   │   └── entity/Post.java
│       │   │
│       │   ├── dashboard/                ← Analytics & dashboard
│       │   │   ├── DashboardController.java
│       │   │   └── DashboardService.java
│       │   │
│       │   └── common/                   ← Shared utilities
│       │       ├── config/
│       │       │   ├── SecurityConfig.java
│       │       │   ├── RedisConfig.java
│       │       │   └── AppConfig.java
│       │       ├── exception/
│       │       │   ├── GlobalExceptionHandler.java
│       │       │   └── AppException.java
│       │       └── util/
│       │           └── EncryptionUtil.java
│       │
│       └── resources/
│           ├── application.yml
│           ├── application-dev.yml
│           └── application-prod.yml
│
└── frontend/                             ← React app (separate folder)
    ├── src/
    │   ├── pages/
    │   │   ├── Login.jsx
    │   │   ├── Dashboard.jsx
    │   │   ├── Settings.jsx
    │   │   └── Schedule.jsx
    │   └── components/
    └── package.json
```

---

## 💳 Monetization Plans

```
┌─────────────────────────────────────────────────────────┐
│  FREE PLAN                                              │
│  ₹0 / month                                            │
│  ─────────────────────────────────────────────────────  │
│  ✅ 3 posts per day                                     │
│  ✅ 1 category (Electronics only)                       │
│  ✅ Telegram publisher only                             │
│  ✅ Basic dashboard                                     │
│  ❌ No scheduling control                               │
│  ❌ No filters (discount %, rating)                     │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│  PRO PLAN                                               │
│  ₹299 / month                                          │
│  ─────────────────────────────────────────────────────  │
│  ✅ 20 posts per day                                    │
│  ✅ All categories                                      │
│  ✅ Custom schedule (choose posting times)              │
│  ✅ Smart filters (min discount %, min rating)          │
│  ✅ Telegram + Pinterest publisher (V2)                 │
│  ✅ Full analytics dashboard                            │
│  ✅ Email support                                       │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│  AGENCY PLAN                                            │
│  ₹999 / month                                          │
│  ─────────────────────────────────────────────────────  │
│  ✅ Everything in PRO                                   │
│  ✅ 5 connected affiliate accounts                      │
│  ✅ All platforms (Telegram, Pinterest, Twitter, etc.)  │
│  ✅ AI smart product picks                              │
│  ✅ White-label option                                  │
│  ✅ Priority support                                    │
└─────────────────────────────────────────────────────────┘
```

---

## 📅 12-Week V1 Build Timeline

### Week 1 — Project Foundation
- Spring Boot project setup (Spring Initializr)
- Dependencies: Web, Security, JPA, PostgreSQL, Redis, Lombok, Quartz
- Docker Compose for local PostgreSQL + Redis
- Flyway migrations for all V1 tables
- Basic application.yml configuration

### Week 2 — Authentication
- User entity + repository + service
- JWT token generation and validation (JwtService)
- Register and Login endpoints
- Google OAuth2 login integration
- Spring Security filter chain configuration
- Test with Postman / HTTP client

### Week 3 — Amazon PA API Integration
- Register on Amazon Associates → apply for PA API 5.0 access
- AmazonConfig entity — save/retrieve user's API keys (encrypted)
- AmazonProductFetcher — call PA API to fetch products by category
- Product entity + repository
- Cache fetched products in Redis (TTL 1 hour)
- REST endpoint to test product fetch

### Week 4 — Telegram Publisher
- Create test Telegram bot via @BotFather
- TelegramConfig entity — save/retrieve user's bot token + channel ID
- TelegramPublisher — send message to channel via Bot API
- MessageTemplateBuilder — format product into clean Telegram message
- Test: manually trigger a post to your own Telegram channel

### Week 5 — Quartz Scheduler
- PostSchedule entity — store user's schedule preferences
- PostJob — Quartz Job that picks an unposted product and publishes it
- PostSchedulerService — create/update/delete Quartz jobs per user
- Schedule CRUD REST endpoints
- Test: schedule a job every 2 minutes and verify posts appear on Telegram

### Week 6 — User Configuration UI
- React app setup (Vite + Tailwind CSS)
- Login / Register pages
- Amazon Config settings page (enter API keys + affiliate tag)
- Telegram Config settings page (enter bot token + channel ID)
- Category + filter preferences page

### Week 7 — Dashboard
- DashboardService — count posts today, this week, by status
- DashboardController — REST endpoints for dashboard data
- React Dashboard page with charts (Recharts)
- Recent posts list with status
- Schedule status (active/inactive toggle)

### Week 8 — Polish + Deploy
- Error handling — GlobalExceptionHandler for clean API errors
- Input validation on all DTOs
- Encrypt sensitive fields (API keys, bot tokens) in DB
- Docker build for Spring Boot app
- GitHub Actions CI/CD — build → test → deploy to Railway
- Basic landing page with signup CTA
- Manual end-to-end test of complete user journey

---

## ✅ Day 1 Checklist

```
□ Create new Spring Boot project at start.spring.io
  Dependencies: Spring Web, Spring Security, Spring Data JPA,
  PostgreSQL Driver, Spring Data Redis, Lombok, Quartz Scheduler,
  Spring Boot DevTools, Validation, OAuth2 Client

□ Set up GitHub repository with main + dev branches

□ Create docker-compose.yml with PostgreSQL + Redis

□ Create application.yml with DB, Redis, JWT config placeholders

□ Write Flyway migration V1 — create users table

□ Create User entity + UserRepository + UserService skeleton

□ Create AuthController with /api/auth/register and /api/auth/login stubs

□ Apply for Amazon PA API access (takes 1–3 days to approve)
  URL: https://affiliate-program.amazon.in/assoc_credentials/home

□ Create a Telegram Bot via @BotFather (takes 2 minutes)
  Command: /newbot → get your bot token

□ Test DB connection with a simple GET /health endpoint
```

---

## 🗺️ Full Version Roadmap Summary

```
V1 (Weeks 1–8)
├── Amazon PA API fetcher
├── Telegram auto-publisher
├── Per-user Quartz scheduling
├── JWT + Google OAuth auth
├── Basic React dashboard
└── Docker + Railway deploy

V2 (Months 3–5)
├── HTML → PNG image template generator (Playwright)
├── Cloudinary image storage
├── Pinterest API publisher
├── Flipkart Affiliate API integration
└── Template picker for users

V3 (Months 6–9)
├── Twitter / Instagram / WhatsApp publishers
├── Kafka async publishing pipeline
├── AI smart product picks (Spring AI + OpenAI)
├── Custom click tracking + short URLs
├── ClickHouse for analytics
└── Earnings estimation dashboard

V4 (Months 10–14)
├── Razorpay subscription billing
├── Agency / multi-account support
├── White-label option
├── React Native mobile app
├── Grafana + Prometheus monitoring
├── AWS production infrastructure
└── Kubernetes orchestration
```

---

## 🎓 Skills You Will Master Building This

| Skill | Where Learned | SDE2 Relevance |
|---|---|---|
| Spring Security + JWT | Auth module | ⭐⭐⭐⭐⭐ |
| OAuth2 (Google login) | Auth module | ⭐⭐⭐⭐ |
| Spring Data JPA | All modules | ⭐⭐⭐⭐⭐ |
| REST API design | All controllers | ⭐⭐⭐⭐⭐ |
| Quartz Scheduler | Scheduler module | ⭐⭐⭐⭐ |
| Redis caching | Product cache | ⭐⭐⭐⭐ |
| External API integration | Amazon + Telegram | ⭐⭐⭐⭐⭐ |
| Async processing | Kafka (V3) | ⭐⭐⭐⭐⭐ |
| Docker + CI/CD | Deploy | ⭐⭐⭐⭐⭐ |
| System design | Overall architecture | ⭐⭐⭐⭐⭐ |
| Database schema design | DB design | ⭐⭐⭐⭐⭐ |
| Multi-tenancy | B2C per-user isolation | ⭐⭐⭐⭐ |
| Payment integration | Razorpay (V4) | ⭐⭐⭐ |
| Cloud infrastructure | AWS (V3+) | ⭐⭐⭐⭐ |

---

*This document is your single source of truth. Start with V1, ship fast, iterate based on user feedback.*

**Build → Ship → Learn → Repeat** 🚀
