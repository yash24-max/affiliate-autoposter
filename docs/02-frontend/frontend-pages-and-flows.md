# Frontend Pages and Flows

## 1. Authentication Flow
- User opens login/register
- Submits email/password or Google OAuth
- On success, app stores JWT token and redirects to setup

## 2. Setup Flow
- Step A: Amazon credentials and affiliate tag
- Step B: Telegram bot token and channel id
- Step C: Category and filter preferences
- Step D: Schedule time slots and timezone

## 3. Dashboard Flow
- Load summary cards: today/week/all-time posts
- Load recent post table with status
- Load category breakdown chart
- Provide quick links to configuration edits

## 4. Error Flows
- Invalid credentials
- Missing/invalid API keys
- Unauthorized token expiry
- Scheduler conflict or save failure

## UX Rules
- Show empty-state guides for first-time users
- Use clear action labels: Save Config, Test Connection, Activate Schedule
- Preserve unsaved form state during temporary API errors
