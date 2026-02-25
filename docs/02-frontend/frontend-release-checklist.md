# Frontend Release Checklist

## Build and Quality
- Production build passes
- No console errors on major flows
- API base URL mapped per environment

## Functional Checks
- Auth flow works for email/password and Google OAuth
- Amazon and Telegram settings save and reload
- Schedule create/update/activate/deactivate works
- Dashboard summary and recent posts render correctly

## UX Checks
- Form validation messages are clear
- Loading and error states are visible
- Mobile layout verified for all main pages

## Security and Privacy
- No secrets logged in browser console
- Tokens stored and cleared securely
- Protected routes blocked without auth
