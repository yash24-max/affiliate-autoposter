# Scheduler Design — Microservice Edition

## Objective
Run per-user posting jobs at configured times. Delegate product fetching to Fetcher Service
and publishing to Pusher Service. Scheduler Service only orchestrates — it does not fetch or publish.

## Scheduler Service Responsibilities

  Owns Quartz job lifecycle for all users
  Creates one CronTrigger per user posting time (5 posting times = 5 Quartz triggers)
  Stores schedule config in scheduler.schedules table
  Records every job execution in scheduler.job_runs table
  Enforces plan-based daily post limits (FREE=3, PRO=20, AGENCY=unlimited)
  Delegates actual work to Fetcher Service via internal REST call

## Job Flow (PostingJob.execute)

  Step 1: Read userId from Quartz JobDataMap
  Step 2: Load schedule from DB — is it still active? If not, skip and log SKIPPED
  Step 3: Count posts today for this user (query scheduler.job_runs) vs plan limit
          If limit reached: log SKIPPED with reason PLAN_LIMIT_REACHED
  Step 4: Call User Config Service GET /internal/config-status/{userId}
          Verify Amazon config isActive=true AND Telegram config isActive=true
          If either missing or inactive: log FAILED with reason CONFIG_INCOMPLETE
  Step 5: Call Fetcher Service POST /internal/fetch with user credentials + filters
          On success: Fetcher returns the product payload + posts it via Pusher internally
          On no product available: log SKIPPED with reason NO_ELIGIBLE_PRODUCT
          On API error: log FAILED with reason FETCHER_ERROR + error message
  Step 6: Write job_run record with final status

## Quartz Job Design

  Job key:     POST_JOB_{userId}           (one job per user)
  Trigger key: POST_TRIGGER_{userId}_{HH:mm} (one trigger per posting time)

  Example: user has posting times [09:00, 18:00, 21:00]
    POST_JOB_uuid → triggered by POST_TRIGGER_uuid_0900
    POST_JOB_uuid → triggered by POST_TRIGGER_uuid_1800
    POST_JOB_uuid → triggered by POST_TRIGGER_uuid_2100

  Job creation is idempotent: if job exists, update its triggers; do not create duplicate
  Jobs persist across restarts via Quartz JDBC JobStore (stored in scheduler schema tables)

## Schedule Update Flow

  User calls PUT /api/schedule
  ScheduleService saves new config to DB
  QuartzJobManagerService:
    1. Delete all existing triggers for this user
    2. Re-create triggers from new postingTimes list
    3. If isActive=false, pause all triggers instead of deleting

## Activate / Deactivate

  POST /api/schedule/activate   → resume all paused triggers for user
  POST /api/schedule/deactivate → pause all triggers for user (config preserved, jobs stop firing)

## Concurrency Guard

  DisallowConcurrentExecution annotation on PostingJob
  Prevents same user job from running twice simultaneously if previous run is still executing

## Failure Handling

  Transient errors (Fetcher unavailable, timeout): log FAILED, retry on next scheduled time
  Permanent errors (config invalid, plan limit): log SKIPPED/FAILED with clear reason
  Scheduler Service does NOT retry — it fires on schedule and records outcome
  Retry of actual Telegram posting is handled by Pusher Service internally

## Internal Endpoint (not via Gateway)

  GET /internal/config-status/{userId}
    Called by Scheduler to check if user has active Amazon + Telegram config
    Returns: { amazonConfigActive: true, telegramConfigActive: true, userPlan: "PRO" }
    Owned by User Config Service
