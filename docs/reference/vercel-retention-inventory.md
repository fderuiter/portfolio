# Reference: Vercel Retained Function Storage & Deployment Inventory

Last verified: 2026-09-12, approximately 18:00 UTC, across All Projects / Last 30 Days.
Authoritative source: Vercel Team Dashboard and paginated read-only deployment API audits under the Vercel Hobby plan.

This reference documents the measured capacity findings for Vercel Functions Storage and Deployment Storage across the Vercel account, identifies explicit protected targets required for production reliability and recovery, and details the candidate deployments identified for non-destructive review under [Issue #691](https://github.com/fderuiter/portfolio/issues/691) and [Issue #692](https://github.com/fderuiter/portfolio/issues/692).

> [!IMPORTANT]
> **Review-Only Audit**: This inventory is for operator review only. It does **not** authorize automated deletion, resizing, alias removal, or region modifications. Per repository safety constraints, actual cleanup is governed by human-gated issue #692.

---

## 1. Authoritative Meter Readings & Headroom

All meter readings were observed on September 12, 2026 (~18:00 UTC) spanning all projects in the shared Vercel Hobby team scope for the 30-day billing window:

| Meter | Used | Allowance / Limit | Headroom Remaining | Headroom % | Notes |
| --- | --- | --- | --- | --- | --- |
| **Functions Storage** | **9.60 GB** | 10.00 GB | **0.40 GB** | **4.0%** | Critical threshold (< 5% headroom); primary constraint |
| **Deployment Storage** | **5.85 GB** | 10.00 GB | **4.15 GB** | **41.5%** | Healthy headroom |
| **Build Time** | **86.0 hrs** | 100.0 hrs | **14.0 hrs** | **14.0%** | Rolling 30-day window meter |

### Project Contributions to Functions Storage

Functions Storage is shared across all active and paused projects in the Vercel team:

| Project | Functions Storage Contribution | Share of Used Meter (9.60 GB) | Project State |
| --- | --- | --- | --- |
| `portfolio` | 8.18 GB | 85.2% | Active (production & dev continuous delivery) |
| `wedding-website` | 1.41 GB | 14.7% | Paused (archived / protected reference) |
| Residual / Unattributed | 0.01 GB | 0.1% | Metadata and routing artifacts |

---

## 2. Paginated Deployment Inventory Scope

A full read-only paginated inventory was conducted on September 12, 2026, across both projects:

| Project | Pages Queried | Total Records | READY Deployments | Blocked / Error / Canceled | Regions |
| --- | --- | --- | --- | --- | --- |
| `portfolio` | 4 pages | 304 records | 82 READY | 222 non-ready | 100% `iad1` (US East) |
| `wedding-website` | 1 page | 61 records | 43 READY | 18 non-ready | 100% `iad1` (US East) |
| **Total** | **5 pages** | **365 records** | **125 READY** | **240 non-ready** | **100% `iad1`** |

### Detail Checks and Bundle Attribution
- **125 READY Deployments**: Detailed deployment metadata inspection was completed for all 125 READY records (82 portfolio, 43 wedding).
- **Blocked / Error Records**: Deployments marked `ERROR`, `BLOCKED`, or `CANCELED` do not represent successful serverless function bundles. They do not retain executable Lambda bundle artifacts and contribute 0 GB to runtime Functions Storage.
- **Regional Uniformity**: All 125 analyzed deployments reside exclusively in region `iad1` (Washington, D.C. / North Virginia). There are no multi-region deployments or orphaned secondary regions.

---

## 3. Conservative Preservation Rules & Protected Targets

To guarantee operational continuity, zero production downtime, and verifiable rollback paths, the following strict preservation rules are enforced:

### Preservation Rules
1. **Current Production Targets**: The live production deployment for each project must never be deleted, unaliased, or modified.
2. **Current Dev Target**: The active `dev` branch integration deployment must never be deleted.
3. **Active Review Targets**: Open pull request preview deployments (e.g. PR #687) must remain intact.
4. **Current Active Aliases**: Any deployment currently mapped to an active domain or system alias (paginated join across 3 pages for portfolio, 2 pages for wedding) is strictly excluded from candidate pools. Historical aliases listed in deployment detail logs must not be confused with active alias targets.
5. **Recency Safety Buffers**:
   - The latest **20 READY deployments per environment** (production and preview) are preserved to provide safe immediate rollbacks.
   - The latest **10 deployments overall per project** are unconditionally preserved.
6. **Recovery Objectives**: Named rollback targets are retained to satisfy recovery-time (RTO) and recovery-point (RPO) objectives.

### Named Protected Targets

| Project | Deployment ID | Environment | Branch / Commit | Role / Retention Reason |
| --- | --- | --- | --- | --- |
| `portfolio` | `dpl_3VVso5GPXhpejKjb5wGRFszJABfa` | Production | `main` @ `53ddf0c91` | Primary active production deployment & rollback target |
| `portfolio` | `dpl_UjoKTURkgG7fooX9DVM84qkUBERZ` | Preview | `origin/dev` @ `e3f2a3a43` | Active dev branch integration & dev rollback target |
| `portfolio` | `dpl_5jnmgXBHz9xmdeKvrJq2rKvwhZ4c` | Preview | PR #687 @ `abac72014` | Active pull request review target |
| `wedding-website` | `dpl_7aFUEAbwXRfddKE9EUvbyNLZTYxA` | Production | `main` | Active production deployment & wedding rollback target |

---

## 4. Stale Deployment Candidate Inventory (Review-Only)

After applying conservative preservation rules, recency buffers, and active alias exclusions, exactly **42 deployments** (40 portfolio, 2 wedding) qualify as stale candidates for operator review.

### Physical Size & Savings Evidence Limitation
Under the Vercel Hobby tier, individual deployment function bundle byte breakdowns are **not** exposed via read-only metadata APIs without paid log drains or physical tarball extraction. Consequently, the physical byte savings for each candidate deployment is explicitly documented as **unknown**. No savings estimate may be assumed prior to provider processing.

### Candidate Deployments Table

| Project | Deployment ID | Created UTC | Environment | Reason / Qualification | Physical Savings |
| --- | --- | --- | --- | --- | --- |
| `portfolio` | `dpl_5cKqrdPYojj4Zc1KmURqe9NrpmTr` | 2026-09-09T17:27:18.432Z | preview | Stale preview; superseded; no active alias | Unknown |
| `portfolio` | `dpl_461arRp2VGazFNAZ4EkDtZ6vi1dC` | 2026-09-09T02:47:18.970Z | preview | Stale preview; superseded; no active alias | Unknown |
| `portfolio` | `dpl_ESojQggeemwa7NSC8svWFaPcgHDB` | 2026-09-09T02:46:04.492Z | preview | Stale preview; superseded; no active alias | Unknown |
| `portfolio` | `dpl_8CGAzMZuVLA6uq3cr31qUAPMmjWQ` | 2026-09-09T02:37:02.170Z | preview | Stale preview; superseded; no active alias | Unknown |
| `portfolio` | `dpl_3oXVepXG2aNe65dWVaUpYFEA7Dh1` | 2026-09-09T02:36:19.088Z | preview | Stale preview; superseded; no active alias | Unknown |
| `portfolio` | `dpl_BpUFQQJe8KndagxkYtkWrGjrisNo` | 2026-09-09T02:28:39.936Z | preview | Stale preview; superseded; no active alias | Unknown |
| `portfolio` | `dpl_D1uKTqh64nApQ3CzF9Uyd3VNju5s` | 2026-09-09T02:17:46.126Z | preview | Stale preview; superseded; no active alias | Unknown |
| `portfolio` | `dpl_CJesS6oiwyKEAeJqr5khHMHeppsS` | 2026-09-09T02:17:10.959Z | preview | Stale preview; superseded; no active alias | Unknown |
| `portfolio` | `dpl_9LLeKmPCiop8krwpzbxq6fKeuEcM` | 2026-09-09T02:05:14.770Z | preview | Stale preview; superseded; no active alias | Unknown |
| `portfolio` | `dpl_Hy9q1KJN2knAeDLTBgrXUy7ZQd6h` | 2026-09-08T19:44:12.693Z | preview | Stale preview; superseded; no active alias | Unknown |
| `portfolio` | `dpl_6HxEgpETzZED8TNa3NbyPm2ghgBq` | 2026-09-08T19:37:13.131Z | preview | Stale preview; superseded; no active alias | Unknown |
| `portfolio` | `dpl_ETJfZ5J5E5vSWKxykJ6RhvU4Xced` | 2026-09-08T19:36:26.400Z | preview | Stale preview; superseded; no active alias | Unknown |
| `portfolio` | `dpl_DhnZP7oDooF9Lfd22j6pewtQs4yN` | 2026-09-08T19:23:23.095Z | preview | Stale preview; superseded; no active alias | Unknown |
| `portfolio` | `dpl_92QgXcDgGwW7eEimXjS1X3iuudCQ` | 2026-09-04T20:59:42.707Z | preview | Stale preview; superseded; no active alias | Unknown |
| `portfolio` | `dpl_GQn8QkgDEvq6HD2FTDN1thg4f9bo` | 2026-09-04T20:58:39.722Z | preview | Stale preview; superseded; no active alias | Unknown |
| `portfolio` | `dpl_HYUHfEJ7FpxHtvAFxjfrJDTaDkXM` | 2026-09-04T20:47:23.476Z | preview | Stale preview; superseded; no active alias | Unknown |
| `portfolio` | `dpl_BdrQSmHMAnRn6n579tNxfoCoAMsY` | 2026-09-04T03:57:24.388Z | preview | Stale preview; superseded; no active alias | Unknown |
| `portfolio` | `dpl_F8RsRFMP5Yjw2tyo9oHP7uretZ1G` | 2026-09-04T03:49:01.062Z | preview | Stale preview; superseded; no active alias | Unknown |
| `portfolio` | `dpl_5a8K1iMXSHsDeMP5JxErxmCPQfZy` | 2026-09-04T03:27:55.624Z | preview | Stale preview; superseded; no active alias | Unknown |
| `portfolio` | `dpl_8d6dK1F2VrJTRoumAPM6Me4QAnme` | 2026-08-17T17:19:07.755Z | production | Historical production; superseded; outside latest 20 | Unknown |
| `portfolio` | `dpl_GAySWwUw6gz6DaA4jF6A6UjQGZaV` | 2026-08-17T17:11:35.621Z | production | Historical production; superseded; outside latest 20 | Unknown |
| `portfolio` | `dpl_6BM3ZLZg8TN6hyBu6g9GGzJHgBBJ` | 2026-08-17T16:45:05.056Z | production | Historical production; superseded; outside latest 20 | Unknown |
| `portfolio` | `dpl_BMRUFKBvzgYkdhxatUwYDGsTF8bx` | 2026-08-17T16:39:41.764Z | production | Historical production; superseded; outside latest 20 | Unknown |
| `portfolio` | `dpl_Eq5PawRYB1oJ2zwFzw1QriR2D8vu` | 2026-08-17T16:39:12.612Z | production | Historical production; superseded; outside latest 20 | Unknown |
| `portfolio` | `dpl_65A5FAASYFW3dWVV8eFzqaBEQptZ` | 2026-08-17T16:37:48.119Z | production | Historical production; superseded; outside latest 20 | Unknown |
| `portfolio` | `dpl_6bhJ5goRxGD9giNjQT45qSw2QwzK` | 2026-08-17T16:28:04.602Z | production | Historical production; superseded; outside latest 20 | Unknown |
| `portfolio` | `dpl_8YSRXh4weGnScSLXA6JiGKoZzzRG` | 2026-08-17T16:19:27.931Z | production | Historical production; superseded; outside latest 20 | Unknown |
| `portfolio` | `dpl_GZgkvU4EjHdDSLjuzedpMh4H8W2f` | 2026-08-17T16:19:01.177Z | production | Historical production; superseded; outside latest 20 | Unknown |
| `portfolio` | `dpl_5xkNpa1aTzRxVzy684kULbuZVeY5` | 2026-08-16T20:45:56.812Z | production | Historical production; superseded; outside latest 20 | Unknown |
| `portfolio` | `dpl_9cHGH5kGfrE45Y8phyFRXZLda6Lt` | 2026-08-16T14:25:19.354Z | production | Historical production; superseded; outside latest 20 | Unknown |
| `portfolio` | `dpl_hCFgb851dfzjcsArgeJHKoLiMFXj` | 2026-08-15T21:59:32.321Z | production | Historical production; superseded; outside latest 20 | Unknown |
| `portfolio` | `dpl_62pjyTPrjobWhxkMDgtPJn2JjvXy` | 2026-08-15T06:45:36.273Z | production | Historical production; superseded; outside latest 20 | Unknown |
| `portfolio` | `dpl_3ZSYjAPHLMPF7icKUqzUu5USaRAJ` | 2026-08-15T05:37:27.129Z | production | Historical production; superseded; outside latest 20 | Unknown |
| `portfolio` | `dpl_E2ohM6BVinuMegQBs6ocjduwAJSp` | 2026-08-15T05:10:43.743Z | production | Historical production; superseded; outside latest 20 | Unknown |
| `portfolio` | `dpl_G64HqsAScmC3YeFa6Droy6nRJaso` | 2026-08-15T04:21:09.900Z | production | Historical production; superseded; outside latest 20 | Unknown |
| `portfolio` | `dpl_668FjQxQRMLc3wnXwMz6vzszNwDv` | 2026-08-15T04:04:57.197Z | production | Historical production; superseded; outside latest 20 | Unknown |
| `portfolio` | `dpl_Hxv3tgRBb1SL2DxA4dCQAr38nDuj` | 2026-08-15T03:50:59.955Z | production | Historical production; superseded; outside latest 20 | Unknown |
| `portfolio` | `dpl_7j2UiytvdBvu8wZwLYYw7MR4acFg` | 2026-08-15T03:09:41.077Z | production | Historical production; superseded; outside latest 20 | Unknown |
| `portfolio` | `dpl_68hycydmsSGEaVK8tVV36yBeZ6vd` | 2026-08-15T03:03:50.433Z | production | Historical production; superseded; outside latest 20 | Unknown |
| `portfolio` | `dpl_8PasfgQA7fdvoM5GnBVr5fGaPncQ` | 2026-08-15T01:03:47.336Z | production | Historical production; superseded; outside latest 20 | Unknown |
| `wedding-website` | `dpl_5SHZwuivXdg19fw4mKVFNQuPgLYz` | 2026-08-13T18:45:49.735Z | preview | Stale preview; superseded; no active alias | Unknown |
| `wedding-website` | `dpl_9KfbFZ8CJpGSjxfKAiWjzBpJerSK` | 2026-08-13T18:30:21.585Z | preview | Stale preview; superseded; no active alias | Unknown |

---

## 5. Non-Destructive Cleanup Proposal for Issue #692

Deployment deletion in Vercel is an **irreversible purge**: once deleted, an artifact cannot be recovered or selected as a rollback target. Therefore, cleanup operations in [Issue #692](https://github.com/fderuiter/portfolio/issues/692) must proceed through the following phased protocol:

### Phase 1: Pre-Execution Verification
1. Verify live domain health for `https://www.deruiter.dev` and `https://wedding.deruiter.dev`.
2. Confirm current active alias targets against Vercel API to ensure no new aliases have been assigned to candidate IDs.
3. Validate that all 4 named protected targets remain excluded.

### Phase 2: Human Operator Approval
1. Present the 42 candidate IDs and 4 protected targets to the operator on Issue #692.
2. Confirm explicit operator approval before invoking any mutation API or CLI command.

### Phase 3: Preview-First Reclamation
1. Purge only the **21 preview candidates** (19 portfolio preview + 2 wedding preview).
2. Retain all 21 historical production deployments intact during this phase to preserve deeper historical rollback options.

### Phase 4: Meter Reconciliation
1. Vercel storage meter recalculation is asynchronous and can take up to 24 hours to reflect purged Lambda bundle artifacts.
2. Record post-purge meter readings and measure reclaimed capacity.

### Phase 5: Production Pruning (Conditional)
1. If Functions Storage headroom remains below 10% (1.0 GB) after Phase 4, the operator may approve pruning the oldest batch of historical production candidates (pre-August 17, 2026).

---

## 6. CLI Inspection Command

To inspect the retention inventory and candidate list from the terminal:

```bash
# Standard summary output
npx tsx scripts/vercel-retention-inventory.ts

# List all 42 candidate deployment identifiers
npx tsx scripts/vercel-retention-inventory.ts --candidates

# Machine-readable JSON output for automated agents
npx tsx scripts/vercel-retention-inventory.ts --json
```

Or via DX task runner:

```bash
npm run inventory:vercel
```
