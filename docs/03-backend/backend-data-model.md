# Backend Data Model

## Core Entities
- users
- amazon_config
- telegram_config
- products
- posts
- post_schedule

## Relationship Summary
- One user to one amazon_config (V1)
- One user to one telegram_config (V1)
- One user to one post_schedule (V1)
- One user to many posts
- One product to many posts

## Important Constraints
- user email unique
- product asin unique
- post status enum: PENDING, POSTED, FAILED
- provider enum: LOCAL, GOOGLE

## Sensitive Fields
- `amazon_config.secret_key` encrypted
- `telegram_config.bot_token` encrypted

## Data Retention Guidance
- Keep post history for analytics
- Mark stale product cache with expiry fields
- Archive old analytics in future phases (V3+)
