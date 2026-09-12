# Release and Deployment Workflow

This guide implements
[ADR 0037](../../adr/0037-controlled-integration-and-release-deployments.md).
It uses one long-lived branch while bounding Vercel Hobby storage and build
consumption.

## Branch Roles

| Branch | Starts from | Pull request target | Merge method | Vercel deployment |
| --- | --- | --- | --- | --- |
| `feat/*`, `fix/*`, `chore/*`, `docs/*`, `dx/*`, `refactor/*`, `perf/*` | `main` | `main` | Squash | None by default |
| `main` | Reviewed topic PR | N/A | N/A | Production |

## Normal Development

```bash
git switch main
git pull --ff-only origin main
git switch -c feat/descriptive-name
```

Commit with Conventional Commits, run `npm run quality` and `npm test`, push
the topic branch, and open a pull request into `main`. The CI workflow is the
required evidence for normal topic work. Squash-merge the PR and allow GitHub
to delete its head branch.

## One-Time Dev Reconciliation

The historical `main` and `dev` branches must be reconciled once before this
workflow becomes fully active. Freeze merges, capture both branch tips and the
current production SHA, and create a dedicated reconciliation branch without
rebasing or force-pushing:

```bash
git fetch origin
git switch --create chore/reconcile-dev-into-main origin/main
git merge --no-commit --no-ff origin/dev
```

Resolve conflicts by reviewing the intended final tree rather than choosing a
branch wholesale. Then run `npm run quality` and `npm test`, commit the
reconciliation, and open it against `main`. After merge and production
verification, change GitHub's default branch to `main` and delete `dev`.

## Release

Every squash merge to `main` is releasable and produces one Vercel production
deployment. Validate:

1. GitHub CI completed successfully.
2. The Vercel production deployment serves the expected commit SHA.
3. The production synthetic probe passes.
4. Database migrations are backward-compatible with the current production
   application.
5. Functions Storage and build-hour headroom remain below the warning bounds.

After production verification, tag the deployed `main` commit:

```bash
git fetch origin main
git tag -a vX.Y.Z origin/main -m "vX.Y.Z"
git push origin vX.Y.Z
```

## Hotfix

Create `fix/descriptive-name` from `origin/main`, open it against `main`, and
run the same CI checks. Request one Vercel preview only if the incident can be
validated safely before merge. Never patch `main` directly.

## Rollback

Prefer Vercel's instant rollback to the last known-good production deployment
for an operational incident. Then create a normal `fix/*` PR that records
the durable code correction. Do not rewrite `main`, delete the failing commit,
or force-push the trunk.

## Vercel Storage Controls

`vercel.json` uses `git.deploymentEnabled` as an allowlist. This prevents
topic and transitional `dev` commits from creating even canceled Vercel
deployments. The project retention policy is one day for canceled and
production deployments, and seven days for preview and errored deployments,
subject to Vercel's mandatory protection exceptions.

If Functions Storage reaches 80%, stop requesting previews and review the live
retention inventory. At 95%, keep only production deployments until Vercel
confirms recovery. The usage meter is GB-month accounting and does not fall
immediately after deletion.

## GitHub Free Limitation

This repository is private on GitHub Free. GitHub therefore rejects branch
protection and ruleset configuration. Local pre-push guardrails, CI, and this
workflow reduce risk but cannot prevent an administrator from bypassing the
process in the GitHub UI. Making the repository public or upgrading to GitHub
Pro would allow required status checks, blocked force pushes, required pull
requests, and protected release tags to be enforced server-side.

## Integration Release Checklist

Before enabling a provider in a release preview, verify that Preview and
Production use distinct provider environments or non-mutating preview modes:

- Neon: a dedicated preview branch/database; never the production connection
  string for mutative preview routes.
- Upstash: preview credentials or a mandatory `preview:` namespace.
- Resend: simulated delivery or an isolated test domain in Preview.
- Clerk: test credentials in Preview and production credentials only in
  Production.
- Sentry: distinct environment labels and zero performance sampling in
  Preview.

Never place provider tokens in workflow YAML, command arguments, pull request
text, or committed `.env` files.
