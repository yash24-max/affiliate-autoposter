# Infrastructure Scaling Path (V1 to V4)

## V1
- Single backend service
- PostgreSQL + Redis
- Basic monitoring and log inspection

## V2
- Add image rendering sidecar/service
- Cloud image storage and CDN delivery

## V3
- Introduce Kafka for async pipelines
- Add ClickHouse for high-volume analytics
- Split publisher workers from API service

## V4
- Multi-tenant production architecture
- AWS managed data services
- Container orchestration (Kubernetes)
- Horizontal scaling with autoscaling policies
