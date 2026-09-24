# Monitor GitHub Actions Minutes

Last verified: 2026-09-22 against GitHub Free (2,000 min/month), repository
settings, and current workflow-run results.

Governing policy: [ADR 0039](../../adr/0039-github-pro-plan-capabilities-and-actions-minutes-governance.md).

## Why this exists

GitHub Free's private-repository entitlement is 2,000 Actions minutes/month on
standard runners, with no authorized paid overage — this repository does not
purchase additional minutes or raise a spending limit. On 2026-09-13 the
previous single-job `.github/workflows/ci.yml` design (full four-device
Playwright matrix on every PR push, repeated identically on the post-merge
`main` push) exhausted the month's allowance during one active day of
iteration, and every CI job on the next three PRs failed in 2-4 seconds with
`0` billable milliseconds. #733 restructured the workflow to reduce that
cost, but the revised runtime has not yet been measured in GitHub because the
allowance remains exhausted. This page is the manual habit that catches the
next regression before minutes hit zero, mirroring
[monitor-vercel-headroom.md](./monitor-vercel-headroom.md) for a resource
GitHub itself does not yet expose a scriptable read on.

**Correction 2026-09-18:** this page previously stated that Actions billing
usage was not readable through the API and that checking it was a dashboard
action. That is wrong. The enhanced billing endpoint reads it directly, given
a token carrying the `user` scope (`gh auth refresh -h github.com -s user`):

```bash
gh api "/users/fderuiter/settings/billing/usage?year=2026&month=9"
```

The legacy `/settings/billing/actions` endpoint now returns `410 Gone` and
must not be used.

Two properties of the response matter and are easy to get wrong:

- **Only private repositories draw on the allowance.** Public repositories
  appear in the same response with their minutes fully discounted. Summing
  every `usageItems` entry overstates consumption several-fold — September
  2026 totalled 19,955 minutes across all repositories but only 2,433
  against the allowance. Filter by private repositories before summing.
- **`netAmount` is not a usage signal.** It stays `0.00` both when usage is
  comfortably inside the allowance and when the allowance is exhausted with
  a $0 spending limit, because in the latter case GitHub refuses the jobs
  rather than billing them. Measure `quantity` against the allowance; do not
  infer headroom from cost.

## Check before a heavy iteration day

Before merging or dispatching anything expected to trigger several CI runs in
one day (a run of follow-up PRs, several `workflow_dispatch` cross-device
runs, repeated pushes while chasing a flaky test):

1. Open **Settings → Billing → Actions minutes** for the account owning
   `fderuiter/portfolio` (organization or personal account billing settings,
   whichever holds this repository).
2. Note the minutes used and the allowance (2,000/month standard Linux
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
- `security-gate` (vulnerability audit) runs on every push and PR — independent
  and fast.
- `heavy-gate` (build, bundle budget, Playwright, Web Vitals) runs only on
  PR pushes, and only against the `chromium` Playwright project instead of
  all four configured device projects.
- `device-gate` runs only on PR pushes, alongside `heavy-gate`, and runs the
  two genuinely device-engine-dependent specs (`visual.spec.ts`,
  `touch-controls.spec.ts`) against the three non-chromium projects —
  coverage `heavy-gate`'s single `chromium` project does not have. This used
  to be a separate `post-merge-device-smoke` job that ran only after a
  squash-merge landed on `main` (see CI-02 below); it does not repeat the
  full suite a second time on identical code.
- `merge-gate` is a required-checks summary job: it `needs:` every job above
  and fails deliberately unless each one that is supposed to run for the
  triggering event actually reported success. See "Required check contract
  when branch protection becomes available (#732)" below.
- `cross-device-matrix` (the full four-device matrix against the full suite)
  is `workflow_dispatch`-only, for a release or a device-sensitive change
  that specifically warrants it.
- The stale `dev` branch trigger was removed; `dev` no longer exists.

## CI-02: targeted device coverage now gates the merge, not just `main`

Before this change, `device-gate` was `post-merge-device-smoke`: it ran only
on the `push` to `main` after a squash-merge, so a device-engine regression
(a pixel-diff drift or a touch-only interaction bug) could land on `main`
before anything caught it — the PR's own `heavy-gate` run only exercised
`chromium`. `device-gate` now runs on the pull request itself, alongside
`heavy-gate`, so both the full-suite `chromium` run and the targeted
`Tablet Safari` / `Mobile Safari` / `Mobile Chrome` run of `visual.spec.ts`
and `touch-controls.spec.ts` gate the merge. Nothing now re-runs that
targeted suite a second time on the post-merge push — the reduced-scope
split from #733/#775 (one four-device matrix run per merge, not per push and
per PR) is unchanged, just relocated to before the merge instead of after.

`main`-push confirmation stays deliberately bounded to `fast-gate` and
`security-gate` — a safety net for a direct push that bypasses PR review.
That risk remains real while the repository is private on GitHub Free because
the live branch-protection API returns `403`; server-side protection is not
active. The bounded push jobs are not a repeat of the build/Playwright work
the merged PR already did. The full
four-device matrix remains a one-click `workflow_dispatch` job
(`cross-device-matrix`); nothing here changes when or how often that runs
automatically (it doesn't).

### Required check contract when branch protection becomes available (#732)

`.github/workflows/ci.yml` now exposes one job whose sole purpose is to be
the required status check: **`Merge Gate (Required Checks Summary)`** (the
`merge-gate` job's `name:`). The repository cannot require it today: the live
branch-protection and ruleset APIs return `403` for this private GitHub Free
repository. After public conversion or a qualifying plan change, require
exactly that check under Settings →
Branches → branch protection rule for `main` → "Require status checks to
pass before merging".

This replaces the two check names #732 originally listed
(`Rigor Ecosystem (Logic, Visual, Performance)` and
`Security Gate (Vulnerability Audit)`) — the first no longer exists under
that name since #775 split it into `fast-gate`/`heavy-gate`/`device-gate`.
Requiring the individual job names directly does not work correctly here:
`heavy-gate` and `device-gate` both carry an `if: github.event_name ==
'pull_request'` condition, and GitHub's required-status-checks rule treats a
job skipped by its own `if:` (or skipped as a side effect of a failed
`needs:` predecessor) the same as a job that never applied — a "skipped"
conclusion satisfies the requirement instead of blocking it. `merge-gate`
runs with `if: always()` specifically to stay unaffected by that, then
inspects `needs.<job>.result` for every job that should have run for the
current event and fails unless each one is literally `"success"` — so a
cancelled Playwright run, a failed `fast-gate`, or an unexpectedly skipped
`device-gate` cannot produce a passing `merge-gate`, and requiring that one
check is sufficient; requiring the four upstream jobs individually as well
is redundant (harmless, but adds nothing `merge-gate` doesn't already
depend on).

`security-gate` remains unconditional (no `if:`), so its `"Security Gate
(Vulnerability Audit)"` check name is safe to require directly as well if the
repo owner wants defense-in-depth beyond `merge-gate` alone — but `merge-gate`
failing already implies `security-gate` failed or was skipped, so it is not
required for correctness.

### CI-03: manual (`workflow_dispatch`) and unrecognized triggers now fail closed

`merge-gate` originally carried `if: always() && github.event_name !=
'workflow_dispatch'` at the job level. That exclusion made the *entire job*
skip on a manual dispatch. Understanding why this matters requires examining
how GitHub evaluates required status checks on pull requests versus head commits,
as documented in official GitHub guidance on
[Troubleshooting required status checks](https://docs.github.com/en/pull-requests/how-tos/merge-and-close-pull-requests/troubleshooting-required-status-checks):

1. **Test-merge versus head check evaluation**: When a pull request triggers a
   workflow via `pull_request`, GitHub creates a temporary test merge commit
   (`refs/pull/<number>/merge`). GitHub displays "Showing checks for the merge
   commit" in the pull request status checks box, and the checks associated with
   that test merge commit determine whether the PR can be merged. GitHub only
   falls back to evaluating checks reported on the head commit SHA if no checks
   exist for the test merge commit. A check run reported on the head commit does
   not unconditionally overwrite or replace an existing test-merge check run.
2. **Evaluated event scopes**: GitHub evaluates workflow jobs for pull request
   status checks only when triggered by specific events: `push`, `pull_request`,
   `pull_request_review`, `pull_request_target`, `deployment`, or `deployment_status`.
   Checks created by `workflow_dispatch` do not appear in the pull request's
   status checks section and cannot satisfy a required status check in a branch ruleset.
3. **The genuine skip-is-a-pass hazard**: If `merge-gate` were skipped via `if:`,
   GitHub would report its conclusion as "skipped". In any evaluation context
   where checks are assessed against a commit directly (such as direct branch pushes
   or head-check fallback when merge checks are absent), GitHub's required-status-checks
   rule treats "skipped" as satisfied rather than blocking. That could allow an
   unsupported trigger to post a passing conclusion without validating requirements.

To eliminate this gap, `merge-gate` runs unconditionally (`if: always()`, no
event exclusion), and its shell script dispatches explicitly on `github.event_name`:

- `pull_request`: requires all four predecessor jobs (`fast-gate`, `security-gate`,
  `heavy-gate`, `device-gate`) to report literal `"success"`.
- `push`: requires `fast-gate` and `security-gate` only (the bounded main-push
  confirmation, since PR review already validated heavy-gate and device-gate).
- `*` (default): any other event — `workflow_dispatch` included, and any future
  trigger this workflow does not yet have — hits an explicit default branch that
  fails the job outright (`echo "::error::..."; fail=1`).

A manual or unrecognized trigger can therefore never produce a "skipped" conclusion
(satisfied by default) or an accidental "success" for this required check name.

### Implementation evidence, server settings, and deferred cost measurements

Because GitHub Actions minutes for the account are currently exhausted, this
guidance separates what is locally verified from unavailable server controls
and future measured costs:

- **Local implementation evidence**: Workflow YAML topology, step dependencies
  (`needs:`), and the literal bash evaluation logic of `merge-gate` are verified
  locally by offline unit and shell execution test suites
  (`__tests__/ci-execution-policy.test.ts` and `__tests__/ci-gate-ordering.test.ts`).
  These tests extract the exact bash script from `.github/workflows/ci.yml` and
  execute it across simulated event and status permutations (`pull_request`,
  `push`, `workflow_dispatch`, `success`, `failure`, `cancelled`, `skipped`).
- **Server-side protection is unavailable**: Live API probes on 2026-09-22
  returned `403` for branch protection and rulesets, and required reviewers
  are also unavailable for this private GitHub Free repository. Client-side
  guardrails remain the only enforcement. Since
  [ADR 0049](../../adr/0049-deploy-main-on-green-ci.md), no GitHub workflow or
  environment deploys: Vercel builds and promotes `main` itself.
- **Future measured Actions costs**: The `timeout-minutes` values on `fast-gate` (20),
  `security-gate` (15), `heavy-gate` (40), `device-gate` (25), and `merge-gate` (5)
  remain provisional estimates. Real runtime and billable minutes consumption
  cannot be measured until the account's Actions minutes allowance resets in the
  next monthly billing cycle.
- **Operating constraint**: September Actions minutes remain exhausted on this
  account. In strict accordance with ADR 0039's no-paid-overage governance, no
  additional minutes will be purchased, and no cloud workflows may be dispatched
  or retried until next month's billing cycle reset (without assuming or inventing
  an exact calendar reset day). All live validation and timeout tuning remain
  deferred under #733. On 2026-09-22, current-main, PR #886, and the scheduled
  synthetic-probe run still failed with zero executed steps, confirming the
  outage had not cleared.

## Refresh this page

After checking the live billing dashboard, or after further restructuring
`.github/workflows/ci.yml`, update this page's "Last verified" line and the
list above, then run:

```bash
npm run lint:docs
```
