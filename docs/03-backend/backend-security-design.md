# Backend Security Design

## Authentication
- JWT for session authorization
- Google OAuth2 as optional identity provider

## Authorization
- All config/schedule/dashboard APIs are user-scoped
- No cross-user access to configs, posts, or schedules

## Secret Management
- Encrypt external API secrets at rest
- Inject master encryption key via environment variables
- Never expose secrets in API responses or logs

## Input and API Hardening
- DTO validation on all write endpoints
- Centralized exception handling with sanitized messages
- Rate limit auth and external test endpoints

## Audit and Logging
- Correlation id (`traceId`) on all errors
- Authentication and configuration change events logged
