# Release and Deployment Workflow

Last reconciled: 2026-09-24. Governed by
[ADR 0049](../../adr/0049-deploy-main-on-green-ci.md).

**In one line:** open a PR, let CI go green, squash-merge it. Vercel deploys
`main` itself.

## The Flow

1. Branch from `main` with an allowed prefix (`feat/`, `fix/`, `chore/`,
   `docs/`, `dx/`, `refactor/`, `perf/`, `test/`), commit with Conventional
   Commits, and open a pull request into `main`.
2. CI (`.github/workflows/ci.yml`) runs on the PR. Merge only when
   **Merge Gate (Required Checks Summary)** is green.
3. The merge pushes to `main`. Two things start at once:
   - CI runs on the `main` commit in GitHub;
   - Vercel builds the same commit with the production secrets it holds.
4. The Vercel build applies pending migrations through the unpooled Neon
   endpoint, then compiles the site. If either step fails, nothing goes live.
5. Vercel waits for **Merge Gate** on that commit (Deployment Checks), then
   points `deruiter.dev` at the new deployment.

Everything about production lives in Vercel. GitHub holds no deploy secrets.

## Buttons

| Situation | Do this |
| --- | --- |
| Production is broken after a deploy | Vercel dashboard, Deployments, **Instant Rollback** to the previous production deployment. Then open a `fix/` PR. |
| A build failed for a transient reason | Vercel dashboard, the failed `main` deployment, **Redeploy**. |
| A deployment is built but not live | Its Deployment Check is waiting on CI, or CI failed. Fix forward with a new PR. |

**Redeploy** rebuilds the commit it is pressed on. Pressing it on the live
deployment does not ship `main`.

## One-Time Setup

In the Vercel dashboard for the `portfolio` project:

1. **Settings, Git:** confirm the production branch is `main`.
   `vercel.json` already enables Git deployments for `main` only.
2. **Settings, Deployment Checks:** add the GitHub check
   **Merge Gate (Required Checks Summary)** so production waits for CI.
3. **Settings, Environment Variables:** the Neon integration provides
   `DATABASE_URL` (pooled, for the app) and `DATABASE_URL_UNPOOLED` (direct,
   for migrations). Nothing else is needed for deploys.

Recommended repository settings, available now that the repository is public:
a ruleset on `main` that requires pull requests and the **Merge Gate**
status check.

## Rules That Keep This Safe

- **Migrations ship on merge, before CI on `main` finishes.** Every migration
  must be expand/contract: the live app and the new app must both work against
  the migrated schema. Never drop or rename a column in the same PR that stops
  using it.
- **Hold work back with a flag, not by leaving it unmerged for days.**
- **Database recovery is roll-forward.** Add a new migration through a normal
  PR. Restore from a Neon backup only for confirmed data loss.
- **Previews are off.** `vercel.json` disables Git deployments for every
  branch except `main` to protect build-hour and storage quota. Preview builds
  never migrate even if one is started by hand.

## Capacity

Vercel Hobby limits build hours and Functions storage. The last readings
(2026-09-12) were 87/100 build hours and 9.68/10 GB Functions Storage. Each
merge to `main` costs one Vercel build. If a build fails with a quota error,
check Vercel Usage before retrying.
