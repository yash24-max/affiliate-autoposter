# Backup, Recovery, and Disaster Readiness

## Backup Policy
- Daily PostgreSQL backups
- Backup retention by environment
- Config backup for scheduler metadata

## Recovery Objectives
- RPO: up to 24 hours for V1
- RTO: same-day restoration target for V1

## Recovery Steps
1. Restore database snapshot.
2. Validate schema and critical tables.
3. Re-enable scheduler in controlled mode.
4. Run smoke checks for auth, config, and posting flow.

## Disaster Scenarios
- DB corruption
- Region/service outage
- Secret leakage requiring rotation
