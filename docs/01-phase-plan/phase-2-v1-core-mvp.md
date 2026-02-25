# Phase 2: V1 Core MVP

## Objective
Ship first usable product that delivers end-to-end automation for Amazon to Telegram posting.

## Scope (Detailed)
- Authentication and user onboarding
- Amazon config + product fetcher
- Telegram config + publishing pipeline
- Per-user schedule management with Quartz
- Dashboard metrics and post history
- Error handling, retries, and secure secret storage

## Functional Outcomes
- User registers or signs in with Google
- User saves affiliate and channel configs
- User sets post times and categories
- System auto-publishes product posts at schedule
- User sees post status in dashboard

## Engineering Streams
- Frontend: config, schedule, and dashboard pages
- Backend: API modules, scheduler, repository layer
- DevOps: CI/CD, deployment target, logging baseline

## Exit Criteria
- Complete user journey runs without manual backend trigger
- Failed posts are captured with reason
- Minimum dashboard metrics are accurate
