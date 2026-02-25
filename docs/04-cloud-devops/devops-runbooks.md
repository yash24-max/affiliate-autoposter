# DevOps Runbooks

## Runbook: Scheduler Failure Spike
- Check scheduler metrics and failed job logs
- Validate Telegram and Amazon external responses
- Pause affected user schedules if needed
- Apply hotfix or rollback

## Runbook: Deployment Rollback
- Identify last stable container tag
- Roll back deployment and verify health endpoints
- Validate key user flows in stage/prod

## Runbook: Secret Rotation
- Rotate JWT/OAuth/API secrets in secret manager
- Restart services safely
- Validate auth and external integration health

## Runbook: DB Connection Saturation
- Confirm pool metrics and slow query logs
- Temporarily reduce scheduler concurrency
- Apply query/index optimization follow-up
