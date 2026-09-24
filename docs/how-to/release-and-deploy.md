# Release and Deployment Workflow

Last reconciled: 2026-09-24. Governed by
[ADR 0048](../../adr/0048-deploy-main-on-green-ci.md), which amends
[ADR 0038](../../adr/0038-protected-build-once-production-releases.md).

**In one line:** open a PR, let CI go green, squash-merge it. Production
deploys itself.

## The Flow

1. Branch from `main` with an allowed prefix (`feat/`, `fix/`, `chore/`,
   `docs/`, `dx/`, `refactor/`, `perf/`, `test/`), commit with Conventional
   Commits, and open a pull request into `main`.
2. CI (`.github/workflows/ci.yml`) runs on the PR. Merge only when
   **Merge Gate (Required Checks Summary)** is green.
3. The merge pushes to `main`, and CI runs once more there.
4. When that run passes, **Deploy Production** (`.github/workflows/release.yml`)
   starts on its own and:
   1. confirms the commit is still the tip of `main` (an older run steps aside
      for a newer merge);
   2. replays every migration on a throwaway PostgreSQL, then applies
      production migrations once and checks for zero drift;
   3. builds the production artifact once and deploys it to a hidden
      `*.vercel.app` URL without touching `deruiter.dev`;
   4. runs the synthetic journeys against that URL;
   5. promotes the same deployment to `deruiter.dev`;
   6. checks that the apex alias points at it, the apex returns 200, and `www`
      returns 308 to the apex.
5. The run summary names the commit and deployment that went live.

If any step before promotion fails, production is untouched. Fix forward with
a new PR.

## Buttons

| Situation | Do this |
| --- | --- |
| Ship `main` again (a deploy failed for a transient reason) | Actions, **Deploy Production**, **Run workflow** on `main`. It refuses unless CI passed on the tip. |
| Production is broken after a deploy | Vercel dashboard, Deployments, **Instant Rollback** to the previous production deployment. Then open a `fix/` PR. |
| Anything else | Don't press **Redeploy** in Vercel. It rebuilds the commit already live, not `main`. |

## One-Time Setup

The `production-release` GitHub Environment holds these secrets, and nothing
else in the repository, Vercel build variables, or `.env` files may hold the
migration credential:

| Secret | What it is |
| --- | --- |
| `PRODUCTION_MIGRATION_DATABASE_URL` | Unpooled Neon URL with only the rights Prisma migrations need |
| `VERCEL_TOKEN` | Vercel token scoped to this team |
| `VERCEL_ORG_ID` | Vercel team ID |
| `VERCEL_PROJECT_ID` | `portfolio` project ID |
| `VERCEL_AUTOMATION_BYPASS_SECRET` | Vercel, project Settings, Deployment Protection, **Protection Bypass for Automation**. Lets the smoke test past Vercel Authentication on the hidden URL. |

Recommended repository settings, available now that the repository is public:

- A ruleset on `main` that requires pull requests and the
  **Merge Gate (Required Checks Summary)** status check.
- A deployment branch policy on `production-release` that allows `main` only.

## Rules That Keep This Safe

- **Migrations ship on merge.** Every migration must be expand/contract: the
  live app and the new app must both work against the migrated schema. Never
  drop or rename a column in the same PR that stops using it.
- **Hold work back with a flag, not by leaving it unmerged for days.**
- **Database recovery is roll-forward.** Add a new migration through a normal
  PR. Restore from a Neon backup only for confirmed data loss.
- **Previews are off.** `vercel.json` disables Vercel Git deployments for every
  branch to protect build-hour and storage quota, so this workflow is the only
  path to production. Branch pushes may still appear in Vercel as canceled
  deployments; they build nothing.

## Capacity

Vercel Hobby limits build hours and Functions storage. The last readings
(2026-09-12) were 87/100 build hours and 9.68/10 GB Functions Storage. Each
deploy costs one build. If a deploy fails with a quota error, check Vercel
Usage before retrying.
