# V4: Full SaaS Scale

## Objective
Transform the product into a polished, scalable, multi-tenant SaaS business.

## Scope (Delta from V3)
- Subscription billing with plan enforcement (Razorpay / Stripe)
- Multi-account support: one user manages multiple affiliate accounts and channels
- Team/agency mode: invite members, manage multiple clients
- White-label capability for agencies
- React Native mobile app (separate repo — on-the-go dashboard)
- Webhook notifications (WhatsApp/email when earnings milestones hit)
- Product blacklist and custom posting rules per user
- Production observability: Grafana + Prometheus dashboards and alerts
- AWS-first deployment with managed services (RDS, S3, CloudFront)
- Kubernetes orchestration with horizontal autoscaling

## Non-Goals
- Major redesign of the V1 user journey
- New affiliate networks outside the planned roadmap

## Exit Criteria
- Plan restrictions correctly enforce feature access (FREE/PRO/AGENCY)
- Operational dashboards and alerts cover all critical paths
- DB and queue failure recovery procedure is documented and tested
- Multi-tenant data isolation is validated

## Layer Documentation Links

- Frontend V4: [frontend/docs/v4.md](../../frontend/docs/v4.md)
- Backend V4: [backend/docs/v4.md](../../autoposter-backend/docs/v4.md)
- Infra V4: [infra/docs/v4.md](../../infra/docs/v4.md)
