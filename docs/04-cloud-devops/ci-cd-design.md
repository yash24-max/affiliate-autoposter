# CI/CD Design

## Source Control Flow
- `main`: production-ready branch
- `dev`: integration branch
- Feature branches merged through pull requests

## Pipeline Stages
1. Checkout and dependency restore
2. Build and unit tests
3. Static checks (format/lint policy if enabled)
4. Container image build
5. Deploy to stage (on dev) and prod (on main)

## Artifacts
- Build logs
- Test report
- Versioned container image tags

## Controls
- Manual approval gate before prod deploy
- Environment-scoped secrets in CI platform
- Fast rollback to prior image tag
