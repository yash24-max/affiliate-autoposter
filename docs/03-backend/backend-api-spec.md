# Backend API Specification (V1)

## Auth APIs
- `POST /api/auth/register`
  - Request: email, password, name
  - Response: token, user profile
- `POST /api/auth/login`
  - Request: email, password
  - Response: token, user profile
- `GET /oauth2/callback/google`
  - Response: token + redirect target

## Config APIs
- `GET /api/amazon-config`
- `PUT /api/amazon-config`
  - Fields: accessKey, secretKey, affiliateTag, categories, minDiscountPct, minRating
- `GET /api/telegram-config`
- `PUT /api/telegram-config`
  - Fields: botToken, channelId, channelName

## Scheduler APIs
- `GET /api/schedule`
- `PUT /api/schedule`
  - Fields: postsPerDay, postingTimes[], activeCategories[], timezone, isActive
- `POST /api/schedule/activate`
- `POST /api/schedule/deactivate`

## Dashboard APIs
- `GET /api/dashboard/summary`
- `GET /api/dashboard/recent-posts`
- `GET /api/dashboard/category-breakdown`

## Error Contract
- HTTP code aligned with error type
- Body: `errorCode`, `message`, `traceId`, `timestamp`
