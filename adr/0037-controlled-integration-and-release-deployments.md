# ADR 0037: Main-Only Integration and Release Deployments

## Status

Accepted on 2026-09-12. Its automatic production-deployment decision was
superseded by ADR 0038. Its single-long-lived-`main` integration model remains
the steady-state workflow. [ADR 0050](0050-jules-consolidation-release.md)
records a temporary exception for the current Jules consolidation and does
not establish `dev` as a permanent integration branch. Production delivery
remains defined by [ADR 0049](0049-deploy-main-on-green-ci.md).

## Context

At the time of this decision, the repository used `dev` as its default
integration branch and `main` as Vercel production, but CI only ran for pull
requests targeting `main`. A main-push workflow rebased and force-pushed `dev`,
while Vercel built every topic-branch and integration-branch commit. On
2026-09-12 this produced 100 retained READY deployments, 9.68 GB-month of
Functions Storage, 87 build hours, and branch divergence of eight `main`-only
commits versus 74 `dev`-only commits. The repository's plan and visibility
have since changed; see #732 for verification of current server-side branch
rules. Checked-in workflows and hooks remain defense-in-depth.

## Decision

`main` becomes the sole long-lived branch, GitHub default branch, integration
branch, releasable source, and Vercel Production Branch. Normal `feat/*`,
`fix/*`, `chore/*`, `docs/*`, `dx/*`, `refactor/*`, and `perf/*` branches
start from current `main`, target `main`, pass CI, and squash-merge with a
Conventional Commit title. GitHub deletes merged head branches.

The transition is deliberately non-destructive. A one-time reconciliation PR
must preserve the intended net tree from both divergent histories, pass the
full quality suite, and merge into `main` without force-pushing either branch.
After production is verified, GitHub's default branch changes to `main`. For
the one-time Jules consolidation, ADR 0050 defers deleting `dev` to a
separately reviewed operator task. The force-rebase synchronization workflow
is removed before the reconciliation so it cannot rewrite either history.

Vercel Git deployments were originally allowlisted in `vercel.json` so only
`main` deployed automatically. ADR 0038 supersedes that part of this decision:
all Git deployments are now disabled and production uses protected staged
promotion. Topic pushes still create no Vercel deployment, preventing
canceled-deployment noise and function-bundle growth.

The current one-time reconciliation is tracked in ADR 0050. Its release PR
targets `main`, so the existing required pull-request gates run on that PR.
After the consolidation, only `main` remains an active integration target.
Outdated pull-request runs are canceled through GitHub Actions concurrency.
Production verification on a `main` push is not canceled. CI uses Node.js 24,
matching Vercel.

Production and preview credentials are separate security boundaries. A
release preview must not share a mutative production database, Redis
namespace, email delivery path, authentication tenant, or observability
environment. Missing integrations fail closed or use documented non-mutating
fallbacks; documentation must not call an integration active unless its live
Vercel environment variables are present.

## Considered Options

- Retaining `dev` as an integration lane would avoid a one-time migration but
  permanently preserve two meanings of “ready” and require synchronization
  automation.
- Building every pull request gives excellent previews but is incompatible
  with the observed Hobby storage and build-hour budget at the repository's
  current merge rate.
- Rebasing `dev` onto `main` keeps a linear graph but rewrites the shared
  integration branch and invalidates open topic branches and audit evidence.

## Consequences

Normal pull requests rely on CI artifacts rather than automatic Vercel
previews. Releases become one reviewed merge, one production build, and one
verified tag. At acceptance, branch rules could not be enforced on the
repository's then-private Free plan. The repository is now public, but the
current rules still need dashboard verification tracked by #732.
