# Workflows

This directory contains **n8n workflow definitions** (JSON exports) for the Affiliate Autoposter automation engine.

## Directory Structure

```
workflows/
├── templates/              ← Workflow JSON templates (version-controlled)
│   ├── posting-workflow-template.json
│   ├── error-workflow.json
│   └── ...
└── README.md               (this file)
```

## Quick Links

- **Workflow Design Guide:** See `CLAUDE.md` — workflow architecture, code review standards, testing strategy
- **Bridge Service Integration:** See `AGENTS.md` — bridge endpoints that n8n calls
- **Implementation Order:** See `CLAUDE.md` → Implementation Order section

## Workflow Management

### Exporting Workflows
```bash
# Inside n8n container
n8n export:workflow --all --output=/exports
```

### Importing Workflows
```bash
# Inside n8n container
n8n import:workflow --input=templates/posting-workflow-template.json
```

## Design Principles

- **One template per automation type** — posting, error handling, etc.
- **Per-user cloning** — bridge service clones template for each activated user
- **Idempotent operations** — workflows safe to retry
- **No plaintext credentials** — n8n credential store encrypted with `N8N_ENCRYPTION_KEY`
- **Timeout configs** — all external calls (Amazon, Telegram) have explicit timeouts
- **Error handling** — failures captured and recorded via bridge callback

## Core Workflow: Posting Automation

Triggers automatically on user's schedule:

```
1. Cron Trigger (user's timezone + time)
   ↓
2. Get Config (GET /internal/user-config/{userId})
   ↓
3. Parse Config (extract Amazon keys, Telegram token)
   ↓
4. Fetch Products (HTTP Request to Amazon PA API)
   ↓
5. Select Product (pick best by discount/rating)
   ↓
6. Format Post (build affiliate link + post text)
   ↓
7. Publish (Telegram Bot API)
   ↓
8. Record Result (POST /internal/post-event)
```

## Error Handling

A separate error workflow catches failures:
- Triggered when any step fails
- Posts error details to bridge `/internal/post-event` with status=FAILED
- Logs error for debugging in n8n execution history

## Development Workflow

1. **Edit workflows in n8n UI** (`http://localhost:5678`)
2. **Test with sample user data** (create test user in local DB)
3. **Validate node connections & timeouts**
4. **Export updated workflow** (`n8n export:workflow`)
5. **Commit JSON to git** with descriptive message
6. **Update workflow in prod** by re-importing JSON

## Version Control Strategy

- All workflow exports are `.json` and tracked in git
- Commit message format: `feat(workflows): [template-name] [description]`
- PR review must include:
  - Node connections properly configured
  - Timeout values set for external calls
  - Error handling workflow triggered on failures
  - No hard-coded user IDs or secrets (use function nodes)
  - Bridge endpoint contracts validated

## Testing Workflows

**Unit tests:** Test individual Function node scripts in isolation

**Integration tests:** Deploy to staging, activate workflow for test user, verify:
- Cron fires at correct time
- Bridge endpoints receive correct payloads
- Amazon PA API responses handled correctly
- Post recorded in post_events schema
- Errors captured in error workflow

**Contract tests:** Validate:
- Bridge GET `/internal/user-config/{userId}` returns correct shape
- Bridge POST `/internal/post-event` accepts result payload
- Amazon PA API response format matches expectations
- Telegram Bot API response handling

See `CLAUDE.md` → Testing Strategy for full details.
