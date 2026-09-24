# ADR 0048: Deploy Main on Green CI

## Status

Accepted on 2026-09-24. Amends
[ADR 0038](0038-protected-build-once-production-releases.md): the build-once,
stage, verify, and promote sequence stays; the manual SemVer dispatch, the
repeated quality gates, and the rollback-drill workflow are removed.

## Context

ADR 0038 made production change only through a manually dispatched release
that required a new SemVer in `package.json`, re-ran `npm run quality` and
`npm test` on a commit CI had already verified, and then staged and promoted
one artifact. By 2026-09-24 that workflow had never run. Production had served
the 2026-09-13 commit for eleven days, and the only production deploys in that
period were dashboard **Redeploy** actions, which rebuild the commit already
live rather than `main`.

Three properties of the old design caused the drift:

- Releasing required remembering a separate step and preparing a version bump,
  so merged work accumulated unreleased.
- Re-running the full gates made each release cost up to 90 minutes and ran
  the same gating work twice against one tree, contrary to ADR 0039.
- The staged smoke test targeted a `*.vercel.app` URL protected by Vercel
  Authentication without a bypass secret, so a first run would have failed
  after migrations had already applied.

The repository is now public, so Actions minutes are free and branch rulesets
are available.

## Decision

Merging to `main` deploys. `.github/workflows/release.yml` runs when the
`CI Pipeline` workflow completes successfully on a `main` push, and on manual
dispatch as a re-run button.

- A small first job picks the commit. It deploys only the commit CI verified,
  and only while that commit is still the tip of `main`; an older run steps
  aside because the newer merge triggers its own deploy. A manual dispatch
  must target `main` and the tip must have a successful `CI Pipeline` push run.
- The production job keeps ADR 0038's order: replay every migration on
  disposable PostgreSQL, apply production migrations once with the
  environment-scoped credential and verify zero drift, build once, deploy the
  prebuilt artifact with `--skip-domain`, run the synthetic journeys against
  it through `VERCEL_AUTOMATION_BYPASS_SECRET`, promote the same deployment,
  and prove the apex alias points at it, the apex returns 200 and `www`
  returns 308 to the apex.
- Deploys share one non-cancelling concurrency group, so a merge never
  interrupts a deploy mid-migration.
- Vercel Git deployments stay disabled, so this workflow is the only path to
  production and migrations always precede the build (ADR 0001).
- Application rollback is Vercel's Instant Rollback. The rollback-drill
  workflow is removed.
- Deploys are recorded by commit SHA in the workflow summary and in Vercel.
  SemVer tags and GitHub releases become optional milestones cut by hand, not
  a precondition for shipping.

## Consequences

- Production tracks `main` within one CI run plus about fifteen minutes, and
  nobody has to remember to release.
- A red CI run on `main` blocks deploys until fixed. A merge that must not
  ship yet has to stay unmerged or behind a flag.
- Every migration reaches production on merge, so expand/contract discipline
  is mandatory at review time rather than at release time.
- The dashboard **Redeploy** button is not a release path; it only rebuilds
  the live commit.
- The `main` branch should require the `Merge Gate (Required Checks Summary)` check through a ruleset,
  now that the public repository allows one, so CI cannot be skipped on the
  way to a deploy.
