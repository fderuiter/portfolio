# ADR 0039: GitHub Pro Plan Capabilities and Actions Minutes Governance

## Status

Accepted on 2026-09-13. Corrects the plan assumption in ADR 0037's context
section (written against GitHub Free) and extends ADR 0036's free-tier
governance pattern to a resource ADR 0036 does not cover: GitHub Actions
minutes.

## Context

The account owning `fderuiter/portfolio` is on **GitHub Pro**, not GitHub
Free. This was not established at the time ADR 0037 was written; its context
section states private-repo branch protection is unavailable, which was true
against a Free-plan assumption but is not true on Pro. GitHub Pro grants
private repositories classic branch protection rules, repository rulesets,
and environment protection rules (required reviewers, wait timers, branch
restrictions) — the exact capabilities the 2026-09-12 governance audit
(`docs/explanation/audits/2026-09-12-github-vercel-release-governance.md`)
flagged as blocked pending a plan decision. That decision is now made.

GitHub Pro's private-repository entitlement is **3,000 Actions minutes per
month** on standard (Linux) runners at a 1x billing multiplier, with **no
authorization for any paid overage**: this repository does not purchase
additional minutes or raise a spending limit. That is a hard operating
constraint, not a preference, and it governs every workflow change from here
forward the same way Vercel Hobby's 100 build-hours and one-cron-per-day
limits already govern deployment and scheduling design in ADR 0036.

This constraint was not previously written down anywhere, and the repository
found it the expensive way. In the 24 hours before this ADR, `.github/workflows/ci.yml`'s
single `rigor-pipeline` job — Playwright across four device projects, no
scope reduction between a PR check and the post-merge `main` push — was
cancelled at its job-timeout cap multiple times while iterating toward a fix
(runs on 2026-09-13: cancelled at 34m41s under a 45-minute cap, cancelled
again at 58m39s under a raised 70-minute cap, cancelled a third time on the
`main` post-merge run at 56 minutes elapsed). GitHub bills the full elapsed
runner time for a cancelled job, not zero. Every pull request additionally
re-ran the identical full-matrix suite twice — once for the PR check, once
again for the `main` push after squash-merge — for code that had not
changed between the two runs. By the time three follow-up PRs (#729, #730, #731)
were opened the same day, their `CI Pipeline` runs failed in 2-4 seconds with
`0` billable milliseconds on every job: GitHub Actions minutes
for the account's current billing cycle were exhausted.

## Decision

### 1. Branch protection is now an enforceable invariant, not a future option

Configure GitHub branch protection on `main` (Settings → Branches): require
a pull request before merging, require the `Rigor Ecosystem (Logic, Visual,
Performance)` and `Security Gate (Vulnerability Audit)` status checks,
require branches to be up to date, block force pushes, block deletion. This
replaces the client-side-only guardrails (`​.husky/pre-push`, `CODEOWNERS`)
ADR 0037 and ADR 0038 relied on as a substitute for server-side enforcement.
The client-side guardrails remain as defense-in-depth; they are not removed.

> [!NOTE]
> **Superseded (2026-09-14):** Requiring `Rigor Ecosystem (Logic, Visual,
Performance)` reflected the pre-#775 monolithic pipeline. When the workflow
> was partitioned, requiring individual tiered jobs (`heavy-gate`, `device-gate`)
> directly proved unsafe because GitHub branch protection treats skipped checks
> as passing. Under CI-02 (#779) and CI-03 (#781), branch protection policy was
> updated to require the single fail-closed summary check **`Merge Gate (Required
Checks Summary)`** (job ID `merge-gate`). See the 2026-09-14 update below and
> [docs/how-to/monitor-github-actions-minutes.md](../docs/how-to/monitor-github-actions-minutes.md).

Configure the `production-release` GitHub Environment (used by
`.github/workflows/release.yml`) with required reviewers, which Free-plan
private repositories cannot do but Pro can. This closes the gap ADR 0038
left open: the protected-release job currently has no server-side approval
gate, only the convention that a human must click "Run workflow."

### 2. GitHub Actions minutes are a governed quota, tracked the same way as every other provider in ADR 0036

Extend ADR 0036's pattern — explicit budget, defense-in-depth protection,
no silent overage — to GitHub Actions:

- **No paid overage, ever.** A workflow redesign that trades engineering
  effort for Actions minutes is always preferred over spending money on
  more minutes. If minutes are exhausted before the monthly reset, CI stays
  down until reset; this is an accepted consequence, not an emergency to
  solve by upgrading further.
- **Every required check must have a job-level `timeout-minutes` bound
  low enough that one hang cannot consume a meaningful fraction of the
  monthly allowance.** A hang that is merely capped at "safe" is not
  sufficient if the cap itself is expensive; the cap bounds diagnosability,
  not cost, so cost must be bounded separately by scope reduction (below).
- **Full-matrix, full-suite E2E execution is expensive and must not run
  twice for the same tree.** Concretely: a PR's own CI run is the gate;
  the subsequent `main` push after squash-merge validates the identical
  code the PR already validated. Re-running the full Playwright matrix a
  second time on that push spends minutes without checking anything new.
- **Device-matrix breadth is a cost multiplier, not a free correctness
  improvement.** Running all four configured Playwright projects
  (`chromium`, `Tablet Safari`, `Mobile Safari`, `Mobile Chrome`) against
  the full `__tests__/e2e/` suite on every PR push multiplies wall-clock
  (and therefore billed) time by four for coverage that mostly does not
  vary by device for non-visual, non-viewport-specific specs.
- **A monthly Actions-minutes check is a documented operational habit**,
  the same way Vercel headroom is (`docs/how-to/monitor-vercel-headroom.md`,
  `scripts/vercel-headroom.ts`). No equivalent script exists yet for GitHub
  Actions; until one does, check Settings → Billing → Actions manually
  before merging anything expected to trigger several CI runs in one day.

The concrete engineering plan implementing this decision — the specific
`ci.yml` restructuring (tiered fast/heavy gates, matrix reduction, removing
the redundant post-merge re-run, timeout ratcheting once a real run confirms
the honest post-#731 runtime) — is tracked as its own issue rather than
decided here, because the right shape depends on measuring one clean CI run
after minutes reset, not on guessing further from a starved account.

## Consequences

- Branch protection and environment protection rules can be configured
  immediately; this ADR removes the plan-decision blocker ADR 0037/0038 and
  the 2026-09-12 audit left open. #732 is corrected to reflect this rather
  than presenting it as a cost/upgrade decision still to be made.
- No further CI runs are possible on this repository until the Actions
  minutes allowance resets for the current billing cycle, or until the
  redesign in the follow-up issue reduces per-run cost enough that the
  remaining allowance covers verification of the changes already
  queued (#729, #730, #731, and this ADR's own follow-up work).
- Every future workflow change must state its expected cost impact (jobs ×
  matrix size × expected duration) the same way a database migration states
  its lock behavior — cost is now a reviewed property of CI changes, not an
  afterthought discovered via exhaustion.
- ADR 0037's context section describing branch protection as unavailable is
  superseded by this ADR for that specific claim; ADR 0037's branch-topology
  decision (single trunk, short-lived topic branches) is unaffected and
  remains active.

## Update 2026-09-14

The follow-up engineering plan is implemented in `.github/workflows/ci.yml`:
the pipeline splits `fast-gate` (typecheck, lint, docs/schema drift, unit tests,
property fuzzing — push and PR), `security-gate` (vulnerability audit — push and
PR), `heavy-gate` (build, bundle budget, Playwright chromium, Web Vitals — PR-only),
and `device-gate` (the two device-engine-dependent specs against the three
non-chromium projects — PR-only).

Under CI-02 (#779), `device-gate` was relocated pre-merge to pull requests
alongside `heavy-gate`, superseding the intermediate `post-merge-device-smoke` concept
so that cross-device visual and touch regressions gate the merge rather than
running after landing on `main`. Under CI-03 (#781), `merge-gate` (`Merge Gate
(Required Checks Summary)`) was configured to run unconditionally (`if: always()`)
and fail closed: on `pull_request` it asserts that all four gating jobs succeeded;
on `push` to `main` it provides bounded confirmation requiring `fast-gate` and
`security-gate`; on any unhandled trigger (including `workflow_dispatch`) it fails
deliberately with an explicit error. Branch protection on `main` must require
**`Merge Gate (Required Checks Summary)`** rather than the retired `Rigor
Ecosystem` check. The full four-device matrix remains available on demand via
`cross-device-matrix` (`workflow_dispatch`-only).

### Implementation Evidence, Server Settings, and Deferred Measurements

1. **Local Implementation Evidence**: Workflow topology, dependencies (`needs:`),
   and the fail-closed evaluation logic of `merge-gate` are validated locally
   by offline unit and shell execution test suites
   (`__tests__/ci-execution-policy.test.ts` and `__tests__/ci-gate-ordering.test.ts`).
2. **Unverified Server-Side Protection**: While branch protection rules on `main`
   (requiring `Merge Gate (Required Checks Summary)`) and environment protection
   rules on `production-release` (requiring reviewers) constitute required repository policy,
   their enforcement on GitHub's servers remains an unverified administrative configuration
   pending manual confirmation in repository settings.
3. **Future Measured Actions Costs**: Job `timeout-minutes` caps (`fast-gate`: 20,
   `security-gate`: 15, `heavy-gate`: 40, `device-gate`: 25, `merge-gate`: 5) remain
   provisional estimates rather than verified runtime measurements. September
   GitHub Actions minutes are exhausted on this account; per this ADR's
   no-paid-overage invariant, no cloud workflows may be dispatched or retried until
   next month's billing cycle reset. Live empirical measurement of runtime and
   cost remains deferred under #733.
