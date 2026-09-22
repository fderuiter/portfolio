# Release, Public Repository, and Vercel Readiness Audit

Captured on 2026-09-22. This is point-in-time evidence, not a substitute for
the live provider checks required immediately before publication or release.

## Source Identity

- Audited `main`: `7fb7e666960e1a9cf7f44d2b872d92ad01014605`.
- Local `main` exactly matched `origin/main` and had a clean worktree before
  this documentation branch was created.
- `origin/main` was the only remaining remote branch.
- The repository was still private on GitHub Free.

## Local Quality Evidence

| Gate | Result |
| --- | --- |
| `npm run quality` | Passed; 28/28 DX invariants and 41/41 browser routes passed |
| `npm test` | Passed; 395 files and 3,683 tests |
| `npm audit --audit-level=moderate` | Passed; zero vulnerabilities |
| Reachable-history secret audit | Passed; 551 commits, zero unallowlisted matches |
| `npm run test:mutation` | **Failed**; 46.73% against the 80% break threshold |

Passing local correctness, documentation, dependency, and browser gates does
not override the mutation failure or the provider-owned release checks below.

## GitHub State

- Current-main, PR #886, and scheduled synthetic-probe runs failed before any
  job step executed. This is the signature of the exhausted Actions allowance,
  not a test failure.
- GitHub showed 2,820 historical Actions runs and zero retained artifacts at
  the time of inspection.
- Branch protection and ruleset APIs returned `403` because the repository is
  private on GitHub Free. Client-side guardrails are therefore the only active
  protection until the repository becomes public or the plan changes.
- Actions are restricted to selected GitHub-owned and verified actions, and
  the default workflow token is read-only.
- `sha_pinning_required` was false. Workflows used mutable major action tags,
  so full-SHA pinning remains public-repository hardening work.

## Vercel Control-Plane Evidence

- `.vercel/project.json` links the checkout to the expected `portfolio`
  project and team. It records Next.js, Node 24, `npm run build`, and a root
  project layout. `vercel.json` overrides installation with `npm ci` and
  disables automatic Git deployments for every branch.
- The workstation's global Vercel CLI was `41.6.1`; its stored token was
  invalid. The connected Vercel app was not authorized for the linked team and
  returned `403`, so deployment, alias, environment, quota, and runtime-log
  inventories could not be refreshed through the private control plane.
- The release and rollback workflows dynamically requested
  `vercel@59.16.0`. The npm registry reported `59.25.0` as the current stable
  release on 2026-09-22. No Vercel CLI version was locked in `package-lock.json`.
- `.vercel/.env.production.local` existed locally, was ignored and untracked,
  and contained production-variable names for database, Redis, Clerk, Resend,
  cron, QStash, and related services. No values were printed. It contained no
  usable `VERCEL_TOKEN`. The file remains sensitive local state under #851.

Private Vercel state is therefore **unknown until reauthorization**, not
healthy by assumption.

## Public Production Evidence

Unauthenticated public probes remained possible despite the control-plane
authorization gap:

| Probe | Observed result |
| --- | --- |
| `https://deruiter.dev/` | `200` from Vercel |
| `https://www.deruiter.dev/` | `308` to `https://deruiter.dev/` |
| `/api/cron/maintenance` without a bearer secret | `401` |
| Homepage canonical and `og:url` | Incorrectly used `https://www.deruiter.dev` |
| `robots.txt` sitemap reference | Incorrectly used the `www` host |
| Sitemap entries | Incorrectly used the `www` host |
| Representative page cache policy | `private, no-cache, no-store`; `x-vercel-cache: MISS` |
| CSP | Still allowed `'unsafe-eval'` and `'unsafe-inline'` |

The production HTML reported Sentry release
`dc133b59ed8254d10f62c879f413f378f498a4d4`. That value resolves to a Git
commit 64 commits behind the audited `main`. Because the Vercel control plane
was unavailable, treat this as strong application-release evidence rather
than an API-confirmed deployment SHA.

The exact audited `main` build behaved differently under `next start`: `/`
and `/case-studies` were prerendered cache hits with
`Cache-Control: s-maxage=3600, stale-while-revalidate=31532400`. Current source
also generates apex canonical URLs. The public metadata and no-store behavior
are therefore deployment drift, not the expected output of audited `main`.

## Capacity Evidence

The checked-in Vercel inventory contains a 2026-09-12 snapshot:

| Meter | Last-known value | Status at capture |
| --- | ---: | --- |
| Functions Storage | 9.68/10 GB | Critical (96.8%) |
| Deployment Storage | 6.20/10 GB | Healthy (62%) |
| Build Time | 87/100 hours | Warning (87%) |

These are not live readings. `scripts/vercel-headroom.ts` also defaults its
evaluation time to a fixed 2026-09-12 timestamp, so its stale classification
does not age naturally. Until that defect is fixed and Vercel access is
restored, the strict command proves only that the captured snapshot was
critical; it cannot prove current headroom.

## Go/No-Go Result

Production release and public conversion remain **no-go**. Before either:

1. Rotate the credential tracked by #865 and prove the old credential fails.
2. Resolve the 80% mutation gate without weakening it.
3. Restore read-only Vercel access and refresh capacity, deployment, alias,
   environment-name, and runtime-error evidence.
4. Confirm sufficient Vercel headroom for one staged production release.
5. Deploy the exact audited release commit through the governed build-once
   workflow.
6. Verify apex canonical metadata, sitemap, robots, structured data, ISR cache
   headers, alias target, promoted commit SHA, and runtime health.
7. Observe one successful authenticated scheduled maintenance execution.
8. Complete the historical GitHub public-surface and Actions-log review.
9. Convert visibility only with explicit operator approval, then configure
   the server-side protections available to public repositories.

Issues #720, #817, #840, #848, #851, #853, #865, #871, and release epic
[#863](https://github.com/fderuiter/portfolio/issues/863) must be reconciled
against this evidence rather than closed merely because code exists on `main`.
