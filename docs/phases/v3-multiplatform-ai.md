# V3: Multi-Platform and AI Smart Picks

## Objective
Expand distribution channels and improve post selection quality with AI-assisted product ranking.

## Scope (Delta from V2)
- Additional publishers: Instagram (Meta Business API), Twitter/X (API v2), WhatsApp Channel, Facebook Page
- AI scoring/ranking of candidate products (OpenAI / Gemini via Spring AI)
- Click tracking with custom short URL redirects (by platform, country, device)
- Earnings estimation using Amazon reporting API
- A/B template testing support
- Async event-driven pipeline (Kafka) replacing synchronous Fetcher → Pusher calls
- High-performance analytics storage (ClickHouse)

## Non-Goals
- Billing and agency mode (V4)
- Full white-label features (V4)

## Architecture Change
V1/V2 use synchronous internal REST calls (Fetcher → Pusher). V3 migrates this to Kafka: Fetcher publishes to a topic, platform-specific Pusher consumers subscribe independently. This enables adding new platforms without changing the core pipeline.

## Exit Criteria
- At least two additional publishers (beyond Telegram + Pinterest) are production-ready
- Click events are captured with source platform tagging
- AI picker can be toggled per user or by plan
- Kafka pipeline handles Fetcher → Publisher flow

## Layer Documentation Links

- Frontend V3: [frontend/docs/v3.md](../../frontend/docs/v3.md)
- Backend V3: [backend/docs/v3.md](../../autoposter-backend/docs/v3.md)
- Infra V3: [infra/docs/v3.md](../../infra/docs/v3.md)
