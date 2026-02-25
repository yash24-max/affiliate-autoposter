# UAT Checklists

## UAT 1: New User Onboarding
- Create account and login
- Save Amazon config
- Save Telegram config
- Confirm validation messages for invalid inputs

## UAT 2: Scheduling and Posting
- Set schedule times and activate
- Wait for scheduled trigger
- Verify Telegram channel received post
- Verify dashboard and post history updated

## UAT 3: Failure and Recovery
- Use invalid Telegram token and observe failure status
- Correct token and verify next post succeeds
- Confirm failed and successful events both visible in history

## UAT 4: Session and Security
- Access protected routes without token (should fail)
- Expire token and verify redirect to login
