# Observability and Alerting

## Signals
- Metrics: request latency, error rates, scheduler success rate
- Logs: structured application and integration logs
- Traces: correlation id across request and job execution

## Minimum Dashboards
- API health and throughput
- Scheduler run outcomes (posted vs failed)
- External API dependency status
- DB and Redis availability

## Alerts
- High 5xx error ratio
- Repeated scheduler failures
- External API error spikes
- Database connection exhaustion

## Ownership
- On-call owner list and escalation path documented in runbooks
