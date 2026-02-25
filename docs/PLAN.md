# Affiliate Autoposter — Master Plan

A B2C SaaS platform where users connect their Amazon affiliate account and Telegram channel once, then the system automatically fetches trending products, generates posts, and publishes them on schedule — delivering passive affiliate income without manual effort.

---

## Version Map

| Version | Goal | Status |
|---------|------|--------|
| V1 | Core MVP: auth, Amazon fetch, Telegram post, Quartz schedule, dashboard | In progress |
| V2 | Visual layer: HTML→PNG templates, Cloudinary storage, Pinterest publisher | Planned |
| V3 | Multi-platform + AI: Instagram/Twitter/WhatsApp, Kafka pipeline, ClickHouse analytics, AI picks | Planned |
| V4 | Full SaaS: billing, agency mode, white-label, Kubernetes, AWS production stack | Planned |

---

## Cross-Layer Reference

| Version | Frontend | Backend | Infra |
|---------|----------|---------|-------|
| V1 | [frontend/docs/v1.md](../frontend/docs/v1.md) | [backend/docs/v1.md](../backend/docs/v1.md) | [infra/docs/v1.md](../infra/docs/v1.md) |
| V2 | [frontend/docs/v2.md](../frontend/docs/v2.md) | [backend/docs/v2.md](../backend/docs/v2.md) | [infra/docs/v2.md](../infra/docs/v2.md) |
| V3 | [frontend/docs/v3.md](../frontend/docs/v3.md) | [backend/docs/v3.md](../backend/docs/v3.md) | [infra/docs/v3.md](../infra/docs/v3.md) |
| V4 | [frontend/docs/v4.md](../frontend/docs/v4.md) | [backend/docs/v4.md](../backend/docs/v4.md) | [infra/docs/v4.md](../infra/docs/v4.md) |

Phase details: [docs/phases/](phases/)

---

## Tech Stack by Version

| Layer | V1 | V2 additions | V3 additions | V4 additions |
|-------|----|--------------|--------------|--------------|
| Frontend | React 18 + Vite + Tailwind + React Query + Recharts | Template picker UI | Click analytics, AI config, multi-platform toggles | Subscription UI, agency view, white-label |
| Backend | Spring Boot 3, Spring Security, JWT, OAuth2, JPA, Quartz | Playwright sidecar, Cloudinary SDK, Pinterest API, Feign | Spring AI, Kafka, ClickHouse, URL shortener | Stripe/Razorpay, multi-tenancy, Billing Service |
| Database | PostgreSQL + Redis | Cloudinary for image CDN | ClickHouse for analytics | AWS RDS, S3 + CloudFront |
| Infra | Docker Compose, GitHub Actions, Railway/Render | Playwright container, image CDN backup | Kafka managed, ClickHouse cluster, split publishers | EKS/GKE, HPA, Grafana + Prometheus, multi-tenant isolation |

---

## Core User Journey (8 Steps)

```
1. User visits platform → signs up with email or Google
2. User registers on Amazon Associates → gets affiliate tag
3. User creates Telegram Bot + channel → gets bot token + channel ID
4. User connects both on platform settings page
5. User picks product categories (Electronics, Fashion, Deals)
6. User sets schedule: "Post 5 times/day at 9AM, 12PM, 3PM, 6PM, 9PM"
7. System runs 100% automatically: fetch → generate → publish
8. User logs in to dashboard: posts made, clicks, estimated earnings
```

---

## Monetization

| Plan | Price | Key Limits |
|------|-------|------------|
| FREE | ₹0/month | 3 posts/day, 1 category, Telegram only |
| PRO | ₹299/month | 20 posts/day, all categories, all platforms (V2+), analytics |
| AGENCY | ₹999/month | Unlimited posts, 5 affiliate accounts, AI picks, white-label |

---

## Agent Ownership

| Agent | File | Owns |
|-------|------|------|
| Claude | CLAUDE.md | Infrastructure, DevOps, cloud, testing, product decisions |
| Codegen | AGENTS.md | Backend: API, services, data model, auth, integrations |
| Gemini | GEMINI.md | Frontend: React components, UI/UX, styling, routing |

---

## How Money Flows

```
Amazon PA API → Platform fetches top deals + affiliate links
             → Auto generates text/image posts
             → Posts to Telegram / Pinterest / Instagram / Twitter
             → User clicks → lands on Amazon
             → User purchases → affiliate commission (2–9%)
             → User pays platform subscription
```

**Platform earns subscription revenue. Users earn affiliate commissions.**
