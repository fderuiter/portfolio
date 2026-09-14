# Monitor GitHub Actions Minutes

Last verified: 2026-09-14 against GitHub Pro.

Governing policy: [ADR 0039](../../adr/0039-github-pro-plan-capabilities-and-actions-minutes-governance.md).

## Why this exists

GitHub Pro's private-repository entitlement is 3,000 Actions minutes/month on
standard runners, with no authorized paid overage — this repository does not
purchase additional minutes or raise a spending limit. On 2026-09-13 the
previous single-job `.github/workflows/ci.yml` design (full four-device
Playwright matrix on every PR push, repeated identically on the post-merge
`main` push) exhausted the month's allowance during one active day of
iteration, and every CI job on the next three PRs failed in 2-4 seconds with
`0` billable milliseconds. #733 restructured the workflow to fit inside the
allowance comfortably; this page is the manual habit that catches the next
regression before minutes hit zero, mirroring
[monitor-vercel-headroom.md](./monitor-vercel-headroom.md) for a resource
GitHub itself does not yet expose a scriptable read on.

No `npm run headroom:*`-style script exists for GitHub Actions minutes today.
Unlike Vercel's usage API, GitHub's Actions billing usage is not reliably
readable through a token scoped to this repository alone — checking it is a
dashboard action, not a script.

## Check before a heavy iteration day

Before merging or dispatching anything expected to trigger several CI runs in
one day (a run of follow-up PRs, several `workflow_dispatch` cross-device
runs, repeated pushes while chasing a flaky test):

1. Open **Settings → Billing → Actions minutes** for the account owning
   `fderuiter/portfolio` (organization or personal account billing settings,
   whichever holds this repository).
2. Note the minutes used and the allowance (3,000/month standard Linux
   runners) and the days remaining until the monthly reset.
3. If usage is already above ~80% of the allowance for the cycle, prefer
   `heavy-gate`'s single-device PR run over dispatching
   `cross-device-matrix`, and avoid re-pushing speculative fixes — validate
   locally first (`npm run typecheck && npm run lint && npx playwright test
   --project=chromium <file>`) before spending a CI run on it.
4. If usage is at or near 100%, CI will fail fast with near-zero billable
   time on every job (the same signature #733 diagnosed). Stop pushing and
   wait for the monthly reset; there is no supported way to buy more minutes
   for this account.

## What changed to reduce cost (ADR 0039 / #733)

- `fast-gate` (typecheck, lint, docs/schema drift, unit tests, property
  fuzzing) runs on every push and PR — cheap, and gates the expensive jobs
  below via `needs:`.
- `heavy-gate` (build, bundle budget, Playwright, Web Vitals) runs only on
  PR pushes, and only against the `chromium` Playwright project instead of
  all four configured device projects.
- `post-merge-device-smoke` runs only on the `main` push after a squash
  merge, and only runs the two genuinely device-engine-dependent specs
  (`visual.spec.ts`, `touch-controls.spec.ts`) against the three non-chromium
  projects — coverage the PR run did not have, without repeating the full
  suite a second time on identical code.
- `cross-device-matrix` (the full four-device matrix against the full suite)
  is `workflow_dispatch`-only, for a release or a device-sensitive change
  that specifically warrants it.
- The stale `dev` branch trigger was removed; `dev` no longer exists.

## Refresh this page

After checking the live billing dashboard, or after further restructuring
`.github/workflows/ci.yml`, update this page's "Last verified" line and the
list above, then run:

```bash
npm run lint:docs
```
