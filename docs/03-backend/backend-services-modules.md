# Backend Services and Modules

## Auth Module
- Register/login
- JWT issue/validate
- OAuth provider mapping

## Amazon Module
- Store encrypted credentials
- Fetch products by category and filters
- Normalize product metadata

## Product Module
- Persist fetched products
- Resolve candidate products not yet posted
- Apply expiration strategy for stale products

## Telegram Module
- Store encrypted bot token/channel id
- Build message format from product fields
- Publish image + caption and capture response id

## Scheduler Module
- Persist user schedule
- Create/update Quartz jobs per user
- Execute posting workflow and write status logs

## Dashboard Module
- Aggregate posts by period/status/category
- Return summary and recent events to UI
