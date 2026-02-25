# Scheduler Design (Quartz)

## Objective
Run per-user posting jobs at configured times with safe retry and status tracking.

## Inputs
- User schedule settings
- Active categories and filters
- Valid Amazon and Telegram configurations

## Job Flow
1. Resolve user job context and validate active configs.
2. Fetch candidate products from cache/store.
3. Select unposted product for the user.
4. Build affiliate URL and publish to Telegram.
5. Persist post result (POSTED or FAILED).

## Failure Handling
- Retry transient publisher failures with capped attempts.
- Do not retry on permanent validation errors (invalid token/channel).
- Log failure reason in `posts.error_message`.

## Operational Controls
- Activate/deactivate per user
- Safe update when posting times change
- De-duplicate posts by user + product guard
