# Release and Deployment Workflow

This guide implements
[ADR 0037](../../adr/0037-controlled-integration-and-release-deployments.md)
and
[ADR 0038](../../adr/0038-protected-build-once-production-releases.md). It uses
one long-lived branch and a protected build-once release while bounding Vercel
Hobby storage and build consumption.

## Branch Roles

| Branch | Starts from | Pull request target | Merge method | Vercel deployment |
| --- | --- | --- | --- | --- |
| `feat/*`, `fix/*`, `chore/*`, `docs/*`, `dx/*`, `refactor/*`, `perf/*` | `main` | `main` | Squash | None by default |
| `main` | Reviewed topic PR | N/A | N/A | None until protected release promotion |

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

## Dev Reconciliation (completed)

The historical `main`/`dev` divergence was reconciled on 2026-09-13.
`origin/dev`'s tree was confirmed byte-for-byte merged into `main`, GitHub's
default branch was changed to `main`, and `dev` was deleted. This workflow is
now fully active; there is no ongoing reconciliation step for new work.

## Release

A merge to `main` is releasable, but it does not deploy automatically. Vercel
Git deployments are disabled so production can change only through
`.github/workflows/release.yml`.

Before the first release, create a GitHub Environment named
`production-release`, require the repository owner as its reviewer, prevent
self-review when the plan supports it, and scope these secrets to that
environment only:

| Secret | Scope |
| --- | --- |
| `PRODUCTION_MIGRATION_DATABASE_URL` | Unpooled direct PostgreSQL URL with only the connect and schema-DDL rights needed by Prisma migrations; never use the pooled application URL |
| `VERCEL_TOKEN` | Token restricted to deployments for this Vercel account or team |
| `VERCEL_ORG_ID` | Vercel team or account identifier |
| `VERCEL_PROJECT_ID` | Portfolio Vercel project identifier |

Do not duplicate the production migration credential in repository secrets,
Actions variables, Vercel build variables, Preview variables, or `.env` files.
Ordinary CI and Vercel builds neither receive nor reference it.

Prepare the release commit on `main` with the target stable SemVer in
`package.json` and `package-lock.json`, an updated `CHANGELOG.md`, and only
backward-compatible expand/contract migrations. Then dispatch **Protected
Production Release** from the `main` branch and enter the version without a `v`
prefix. The first job has no production environment or credentials. It verifies
that the dispatch targets the current `origin/main`, rejects an existing tag,
replays every migration on disposable PostgreSQL, and runs `npm run quality`
plus `npm test`.

After that job passes, the `production-release` Environment asks its reviewer
to authorize the protected job. Approval releases the environment secrets for
that job only. The job has a 45-minute timeout and all production runs share the
non-canceling `production-release` concurrency group. It performs these steps
in order:

1. Record the current production deployment as the application rollback target.
2. Run the offline destructive-migration guard, execute exactly one
   `prisma migrate deploy`, then verify migration status and zero schema drift.
3. Pull production configuration, build once, and deploy the prebuilt artifact
   with `--prod --skip-domain`, leaving canonical traffic untouched.
4. Run the Chromium synthetic journey suite against that staged deployment.
5. Promote the same deployment without rebuilding and smoke-test
   `https://deruiter.dev`.
6. Record the promoted deployment ID, commit SHA, previous deployment ID, and
   timestamp as a retained workflow artifact.
7. Create the annotated `vX.Y.Z` tag and GitHub release only after the evidence
   exists.

Prisma's migration table makes a rerun idempotent: already-applied migrations
are no-ops. The current-main and existing-tag guards prevent an older or already
released commit from being published under the same version. A failure before
promotion leaves production traffic on the recorded deployment. A failure
after the migration step must be safe because expand/contract migrations remain
compatible with both the current and candidate applications.

## Hotfix

Create `fix/descriptive-name` from `origin/main`, open it against `main`, and
run the same CI checks. Request one Vercel preview only if the incident can be
validated safely before merge. Never patch `main` directly.

## Rollback

Application rollback and database recovery are separate operations:

- **Application rollback** repoints production to the `previousDeploymentId`
  captured in `release-evidence.json`. Use Vercel's instant rollback, then open
  a normal `fix/*` PR for the durable correction. Do not rewrite `main`, delete
  the failing commit, or force-push the trunk.
- **Database recovery** never reverses production migrations automatically.
  Add a forward-compatible migration using expand/contract discipline, replay
  it on disposable PostgreSQL, and send it through the same protected release
  gate. Restore from a provider backup only for confirmed data loss and only
  through the provider's separately authorized recovery procedure.

Before releasing 0.3.0, run **Non-Production Rollback Drill** with two existing
non-production `*.vercel.app` deployment URLs. The workflow points a unique
temporary alias to the candidate, verifies it, repoints that alias to the
known-good artifact, verifies recovery, uploads
`rollback-drill-evidence.json`, and removes the alias. It builds and deploys
nothing, so the drill consumes no Vercel build or deployment-storage quota.

## Vercel Storage Controls

`vercel.json` disables Git deployments for every branch. This prevents topic,
transitional `dev`, and unpromoted `main` commits from creating even canceled
Vercel deployments. The project retention policy is one day for canceled and
production deployments, and seven days for preview and errored deployments,
subject to Vercel's mandatory protection exceptions.

If Functions Storage reaches 80%, stop requesting previews and review the live
retention inventory. At 95%, keep only production deployments until Vercel
confirms recovery. The usage meter is GB-month accounting and does not fall
immediately after deletion.

## GitHub Plan and Actions Minutes

This repository is private on **GitHub Free**, per
[ADR 0039](../../adr/0039-github-pro-plan-capabilities-and-actions-minutes-governance.md)
as corrected 2026-09-18.

Branch protection, rulesets, and environment protection rules (required
reviewers on `production-release`) are **not available** — all three require
Pro on a private repository and return `403` today. The local pre-push
guardrails and CI are therefore the only enforcement that exists, not
defense-in-depth over a server-side gate. Treat any claim of server-side
branch protection on `main` as describing a control that is not in place.

Free's private-repository Actions allowance is 2,000 minutes/month on standard
runners, with **no authorized paid overage**. A CI run that exhausts this
allowance stays down until the monthly reset. See ADR 0039 for the governing
policy and the tracked follow-up for reducing per-run cost.

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
