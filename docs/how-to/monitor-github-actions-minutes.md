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
- `device-gate` runs only on PR pushes, alongside `heavy-gate`, and runs the
  two genuinely device-engine-dependent specs (`visual.spec.ts`,
  `touch-controls.spec.ts`) against the three non-chromium projects —
  coverage `heavy-gate`'s single `chromium` project does not have. This used
  to be a separate `post-merge-device-smoke` job that ran only after a
  squash-merge landed on `main` (see CI-02 below); it does not repeat the
  full suite a second time on identical code.
- `merge-gate` is a required-checks summary job: it `needs:` every job above
  and fails deliberately unless each one that is supposed to run for the
  triggering event actually reported success. See "Required branch
  protection checks (#732)" below.
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
`security-gate` — a safety net for a direct push that bypasses PR review
(relevant only until #732's branch protection is confirmed active), not a
repeat of the build/Playwright work the merged PR already did. The full
four-device matrix remains a one-click `workflow_dispatch` job
(`cross-device-matrix`); nothing here changes when or how often that runs
automatically (it doesn't).

### Required branch protection checks (#732)

`.github/workflows/ci.yml` now exposes one job whose sole purpose is to be
the required status check: **`Merge Gate (Required Checks Summary)`** (the
`merge-gate` job's `name:`). Require exactly that check under Settings →
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

`security-gate` remains unconditional (no `if:`), so its `"security-gate"`
check name is safe to require directly as well if the repo owner wants
defense-in-depth beyond `merge-gate` alone — but `merge-gate` failing
already implies `security-gate` failed or was skipped, so it is not
required for correctness.

### CI-03: manual (`workflow_dispatch`) and unrecognized triggers now fail closed

`merge-gate` originally carried `if: always() && github.event_name !=
'workflow_dispatch'` at the job level. That exclusion made the *entire job*
skip on a manual dispatch — and a job skipped by its own `if:` still posts
a "skipped" conclusion under the exact required check name above, which
GitHub's required-status-checks rule treats as satisfied, not blocking.
Concretely: an operator who ran `workflow_dispatch` against a branch that
also had an open PR pointing at the same commit SHA would post a fresh
"skipped" `Merge Gate (Required Checks Summary)` check run for that SHA —
superseding whatever the PR's own `pull_request`-triggered run had
reported, and satisfying the required check regardless of whether
`heavy-gate`/`device-gate` had ever actually run or passed.

`merge-gate` now runs unconditionally (`if: always()`, no event exclusion),
and its shell script dispatches explicitly on `github.event_name`:
`pull_request` requires all four jobs; `push` requires `fast-gate`/
`security-gate` only (the bounded main-push confirmation, unchanged); any
other event — `workflow_dispatch` included, and any future trigger this
workflow does not yet have — hits an explicit default branch that fails the
job outright (`echo "::error::..."; fail=1`), regardless of whether the
jobs that happened to run all reported success. A manual or unrecognized
trigger can therefore never produce a "skipped" conclusion (satisfied by
default) or an accidental "success" (from a partial check) for this shared
required check name — only a hard, visible failure that a fresh
`pull_request`/`push` run supersedes once one actually runs.

This does mean dispatching `cross-device-matrix` against a branch that also
carries an open PR will post a failing `Merge Gate` check on that SHA until
the PR's branch next receives a real `pull_request` event (e.g. a new
push). That is an accepted, visible cost of failing closed, not a bug: the
alternative — letting a manual trigger silently satisfy or skip the
required check — is exactly the gap this fix closes. In practice, dispatch
`cross-device-matrix` against `main` or a release branch with no open PR
against it, and this never comes up.

### What is still not measured (remaining cost gate)

This task did not, and could not, produce a live CI run: GitHub Actions is
currently blocked on this account by a billing/spending-limit issue
(see #733's tracking comments), independent of the workflow content. That
means:

- The `timeout-minutes` values on `fast-gate` (20), `heavy-gate` (40), and
  `device-gate` (25, inherited unchanged from the former
  `post-merge-device-smoke`) are still the estimates #733/#775 documented as
  provisional, not measurements. Moving `device-gate` to run pre-merge does
  not change its own cost, only when it runs — but it now runs on every PR
  push instead of only on every `main` push, which does change the
  *aggregate* monthly cost and has not been measured either.
  See "Check before a heavy iteration day" above and re-run that check after
  this change ships and Actions minutes are available again.
- Whether `merge-gate` behaves as designed against real GitHub scheduling
  (a genuinely cancelled `heavy-gate` run, a genuinely skipped `device-gate`
  outside a PR) is verified here only by unit tests against the workflow
  YAML (`__tests__/ci-execution-policy.test.ts`,
  `__tests__/ci-gate-ordering.test.ts`) — not by an actual run. Confirm with
  one real PR once Actions minutes are available.
- #733 is not closed by this change; its own acceptance criteria (a real
  measured run confirming aggregate cost fits the allowance) remain open.
- CI-03's fail-closed behavior (a real `workflow_dispatch` run producing a
  hard failure rather than a skip, and real `pull_request`/`push` runs
  still passing under the new `case`-based script) is verified here only by
  the same means: unit tests that extract the literal script from
  `.github/workflows/ci.yml` and actually execute it with bash against
  controlled event/result inputs (`__tests__/ci-execution-policy.test.ts`),
  not a live GitHub Actions run. GitHub Actions minutes for this account
  are exhausted for the current billing cycle (ADR 0039's no-paid-overage
  policy), so live validation — confirming `merge-gate` actually reports
  failure for a real `workflow_dispatch` run and actually reports success
  for a real PR under the new script — can only happen next month, after
  the allowance resets. Until then, the unit tests above are the only
  evidence this change behaves as designed; no workflow was dispatched,
  retried, or otherwise run against GitHub Actions to produce this page.

## Refresh this page

After checking the live billing dashboard, or after further restructuring
`.github/workflows/ci.yml`, update this page's "Last verified" line and the
list above, then run:

```bash
npm run lint:docs
```
