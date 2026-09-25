# ADR 0051: Temporary Manual Production Releases

## Status

Accepted on 2026-09-24. This temporarily supersedes the automatic Production
trigger in [ADR 0049](0049-deploy-main-on-green-ci.md) until 2026-10-01.
Automatic `main` deployment resumes on 2026-10-01 unless a new decision is
recorded.

## Context

Recent automated changes caused avoidable release mistakes. The operator is
keeping Production deployment under direct Dashboard control for a short,
defined period while PR review and CI continue normally. The Production
Upstash REST credentials also need a verified URL/token pair before another
build can safely run its telemetry and rate limiting paths.

## Decision

- Disable all Vercel Git-triggered deployments during the hold by setting
  `git.deploymentEnabled` to `false` in `vercel.json`. No merge, push, GitHub
  workflow, deploy hook or Vercel CLI command may start a Production release.
- After the PR's Merge Gate is green and merged to `main`, the operator opens
  the `portfolio` project in Vercel, chooses **Deployments → Create
  Deployment**, selects the current `main` commit SHA and Production, then
  presses **Create Deployment**. Deployment Checks must pass before the
  production domains move.
- Keep Production credentials in Vercel. Do not copy them into GitHub or a
  local deploy command. Production builds authenticate Upstash with a REST
  `PING` and require `PONG` before running migrations; failures name the
  variable and never print credential values.
- On 2026-10-01, restore `git.deploymentEnabled` to
  `{ "*": false, "main": true }`, remove the temporary Dashboard-only CLI
  guard, reconcile the release runbooks and agent instructions with ADR 0049,
  and verify that a `main` merge is again the automatic Production trigger.

## Invariant Compliance

- GitHub Actions remains CI-only, and Production secrets remain in Vercel.
- PR checks and the Vercel Deployment Check continue to gate release.
- The temporary hold is date-bounded; it does not establish manual releases as
  the long-term policy.
- `npm run quality` and `npm test` are the required repository gates before
  publishing the pull request.

## Consequences

- A merge to `main` no longer creates a Vercel deployment during the hold.
  Production changes only after the operator deliberately creates the
  deployment from the current, green `main` commit in the Dashboard.
- A Production build and its migrations happen only after that manual action.
  A rejected Upstash token stops the build before migrations and leaves the
  current live deployment serving traffic.
- The manual gate depends on remembering the October 1 policy restoration;
  Vercel does not automatically expire this repository setting.
