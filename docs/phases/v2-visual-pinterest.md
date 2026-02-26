# V2: Visual Layer and Pinterest Expansion

## Objective
Improve post quality and long-tail traffic by adding generated image templates and Pinterest publishing.

## Scope (Delta from V1)
- HTML/CSS product card template system (5–10 template designs)
- Headless browser render pipeline (Playwright → PNG export)
- Cloud image storage and CDN delivery (Cloudinary)
- Pinterest publisher integration (Pinterest API v5)
- Template selection per user (persisted preference)
- Additional product source: Flipkart Affiliate API

## Non-Goals
- Full analytics redesign
- Multi-platform expansion beyond Pinterest
- AI product selection

## Why Pinterest?
Pinterest pins have a lifespan of months to years. A pin posted today can drive traffic 6 months later — creating compounding passive income unlike Instagram or Twitter where posts die within hours.

## Exit Criteria
- Posts include generated image assets (HTML→PNG pipeline works end to end)
- Pinterest post flow works for configured users
- Template selection is persisted and applied at post time
- Cloudinary storage and CDN serving is functional

## Layer Documentation Links

- Frontend V2: [frontend/docs/v2.md](../../frontend/docs/v2.md)
- Backend V2: [backend/docs/v2.md](../../autoposter-backend/docs/v2.md)
- Infra V2: [infra/docs/v2.md](../../infra/docs/v2.md)
