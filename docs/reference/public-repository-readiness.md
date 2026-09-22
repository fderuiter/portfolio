# Public Repository Readiness: GitHub Actions and Secret Exposure

Last verified: 2026-09-22 against current GitHub documentation

Scope: the operational consequences of changing `fderuiter/portfolio` from
private to public on GitHub Free. This note does not assert that the repository
is ready to change visibility; it defines the provider-backed release gate.

## Decision Summary

Making the repository public removes the private-repository monthly compute
minute ceiling for **standard** GitHub-hosted runners. GitHub describes those
runners as free and unlimited for public repositories. It does not make all
Actions usage free: larger runners remain billable, while artifact and cache
storage retain separate allowances and billing behavior.

The visibility change must remain blocked until the credential concern tracked
in [#865](https://github.com/fderuiter/portfolio/issues/865) is resolved by
revocation or rotation and the repository's current files, Git history, GitHub
discussion surfaces, and historical Actions logs and artifacts have been
audited. Public secret scanning is a useful backstop after publication, not a
substitute for that pre-publication review.

## Actions Billing Findings

- GitHub provides free, unlimited standard GitHub-hosted runners for public
  repositories. Public conversion should therefore remove the 2,000-minute
  GitHub Free compute constraint that applies while this repository is private.
  See [Choosing the runner for a job](https://docs.github.com/en/actions/how-tos/write-workflows/choose-where-workflows-run/choose-the-runner-for-a-job)
  and [GitHub Actions billing](https://docs.github.com/en/billing/concepts/product-billing/github-actions).
- Larger runners are always charged, including for public repositories. The
  workflows must continue to use standard runner labels unless a paid runner is
  deliberately approved. See [GitHub Actions billing](https://docs.github.com/en/billing/concepts/product-billing/github-actions#free-use-of-github-actions).
- GitHub Free still includes only 500 MB of artifact storage, shared with
  GitHub Packages, and 10 GB of cache storage per repository. Storage is
  measured separately from runner minutes and can accrue charges beyond the
  included amount. See [How storage billing works](https://docs.github.com/en/billing/concepts/product-billing/github-actions#how-storage-billing-works).
- Free public-repository compute remains subject to GitHub's acceptable-use
  rules. Hosted-runner work must support the repository's production, testing,
  deployment, or publication and must not impose prohibited or disproportionate
  load. See [GitHub Terms for Additional Products and Features](https://docs.github.com/en/site-policy/github-terms/github-terms-for-additional-products-and-features#actions).

## Exposure and History Findings

- A private-to-public conversion makes the code, existing Actions history, and
  Actions logs visible to everyone; anyone can fork the repository. GitHub also
  warns that push rulesets are disabled by the conversion. See
  [Setting repository visibility](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/managing-repository-settings/setting-repository-visibility#changing-from-private-to-public).
- GitHub's first response to an exposed password, token, or credential is to
  revoke or rotate it. Rewriting history is secondary and may be unnecessary
  after the credential is invalidated. See
  [Removing sensitive data from a repository](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/removing-sensitive-data-from-a-repository#about-removing-sensitive-data-from-a-repository).
- If a history rewrite is necessary, GitHub's process is broader than a force
  push: rewrite locally, update GitHub, coordinate cleanup of other clones, and
  prevent recurrence. Old data can remain in clones, forks, SHA-addressable
  cached views, and pull-request references; GitHub Support may be needed for
  cached views and PR references. A rewrite also changes commit hashes, can
  invalidate signatures and PR diffs, and can be recontaminated by an old clone.
  See [About sensitive data exposure](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/removing-sensitive-data-from-a-repository#about-sensitive-data-exposure).
- Public-repository secret scanning runs automatically for free and scans the
  full Git history on all branches as well as issues, pull requests,
  discussions, and wikis. Detection depends on supported patterns, so a clean
  result is not proof that no application-specific or unstructured secret is
  present. See [Secret scanning](https://docs.github.com/en/code-security/concepts/secret-security/secret-scanning).
- If an unredacted secret appears in a workflow log, GitHub directs operators to
  delete the log and rotate the secret. See [Secure use reference](https://docs.github.com/en/actions/reference/security/secure-use#use-secrets-for-sensitive-information)
  and [Using workflow run logs](https://docs.github.com/en/actions/how-tos/monitor-workflows/use-workflow-run-logs#deleting-logs).

## Required Pre-Publication Gate

1. Confirm every potentially exposed credential is revoked or rotated; do not
   treat file deletion or history rewriting as credential invalidation.
2. Scan the current tree and every reachable Git ref without printing secret
   values, then review GitHub's secret-scanning alerts after conversion.
3. Audit historical Actions logs and artifacts, plus issues, pull requests,
   discussions, and wikis. Delete affected workflow logs or runs before they
   become public.
4. Decide whether any confirmed exposure warrants a coordinated
   `git-filter-repo` rewrite and GitHub Support cleanup. Do not rewrite history
   merely for cosmetic cleanup.
5. Review every workflow for public-fork safety, keep external-contributor run
   approval enabled, and avoid granting secrets or write tokens to untrusted
   fork code. See [Managing GitHub Actions settings](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/enabling-features-for-your-repository/managing-github-actions-settings-for-a-repository#controlling-changes-from-forks-to-workflows-in-public-repositories).
6. After conversion, re-establish branch protection or branch rulesets for
   `main`; both are available for public repositories on GitHub Free. See
   [Managing protected branches](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches)
   and [About rulesets](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/about-rulesets).

The visibility switch itself is an operator action after this gate is signed
off. It is not part of the repository-polish change set.

## Repository Evidence Recorded 2026-09-21

- `npm run audit:secrets` scanned all 547 commits reachable from the local refs
  for credential-bearing database URLs, GitHub and AWS credentials, private-key
  headers, and common provider-token formats. It passed with zero unallowlisted
  matches. The command reports only file, line, commit, and category metadata;
  it never prints a matched value.
- Git history contains no tracked `.env.local`, `.env.development.local`, key,
  or certificate file. The tracked `.env.example` contains local/example
  fixtures only.
- GitHub reported 2,820 historical workflow runs (as last verified on
  2026-09-22; this count grows with every push and is not a stable
  invariant — treat it as a snapshot, not a target to re-derive) and zero
  retained Actions artifacts. The pull-request, head-commit, and post-merge
  runs associated with #862 had no executed steps because the Actions
  allowance was already exhausted, corroborating #865's assessment that the
  live database credential did not reach GitHub Actions logs through that
  regression.
- A complete review or deliberate retention decision for older workflow logs is
  still required before conversion; the absence of artifacts and the #862
  evidence do not prove every historical log is safe.

## Completed Since Last Verification

- **Application source licensing.** [PR #886](https://github.com/fderuiter/portfolio/pull/886)
  (merged to `main` as `7fb7e666`) added the Apache License 2.0 grant
  (`LICENSE`) and the three-layer `NOTICE` scope statement (application
  source under Apache-2.0, `public/files/` artwork unchanged under CC BY 4.0,
  editorial/identity content all rights reserved), as decided in
  [ADR 0045](../../adr/0045-source-code-licensing-and-three-layer-reuse-boundary.md).
  The licensing surface is enforced by
  `__tests__/public-repository-readiness.test.ts`, which pins the license and
  notice text against truncation or unauthorized mutation rather than
  substring-matching a label. License selection is no longer a publication
  blocker.

## Process Correction: PR #886 Runtime-Impact Declaration

PR #886's Verification checklist checked the Vercel-preview item as "not
requested; no runtime code paths change." That statement was inaccurate: the
merged diff (`7fb7e666`) included runtime-rendered changes — `app/globals.css`,
`app/proof/ProofWorkspaceSkeleton.tsx`, `components/CommandPalette.tsx`,
`components/FooterStatusTicker.tsx`, `components/Hero.tsx`,
`components/MermaidDiagram.tsx`, `components/RichNarrative.tsx`,
`components/UnifiedErrorLayout.tsx`, and `components/arcade/PlayCabinet.tsx`
— and updated a Playwright visual snapshot
(`__tests__/e2e/visual.spec.ts-snapshots/home-chromium-darwin.png`). No
Vercel preview was captured for this diff before merge.

This is recorded here rather than corrected in the PR itself: the PR is
merged and its description is part of the historical record, not something
to rewrite after the fact. The pull request template's runtime-impact
checkbox has been tightened (see `.github/pull_request_template.md`) to
require checking the actual diff for runtime-rendered paths rather than
relying on the author's stated intent, so the same mismatch is harder to
reproduce.

## Current Go/No-Go Status

The repository is **not ready to become public or release to production** yet.
Those decisions have related but distinct gates.

### Public Conversion

1. Complete [#865](https://github.com/fderuiter/portfolio/issues/865): rotate
   the production database credential, update every dependent environment,
   redeploy, and prove the old credential fails.
2. Resolve the mutation-quality gate. The first functioning local Stryker run
   measured 46.73% against the configured 80% break threshold; the threshold
   has not been weakened.
3. Review or retire all historical Actions runs (2,820 as last verified on
   2026-09-22, and growing) before their logs become public. The absence of
   retained artifacts is not evidence that every log is safe.
4. Finish the public-surface audit of open and closed issues, pull requests,
   discussions, and wikis. Discussions and the wiki are currently disabled;
   that fact does not replace review of existing issue and pull-request text,
   comments, attachments, or linked content.
5. Complete the workflow and repository-setting review for untrusted public
   forks, external-contributor approval, token permissions, and secret access.
   After conversion, enable public secret scanning and restore protection for
   `main` because GitHub disables push rulesets during the visibility change.

Application source licensing (item 3 in prior verifications) is complete; see
"Completed Since Last Verification" above.

### Production Release

The authoritative release checklist remains
[#863](https://github.com/fderuiter/portfolio/issues/863). In addition to the
credential and mutation gates above, release remains blocked on the unresolved
operator work tracked by:

- [#840](https://github.com/fderuiter/portfolio/issues/840), the current GitHub
  Actions allowance outage and restoration of required checks;
- [#848](https://github.com/fderuiter/portfolio/issues/848), production cron
  secret configuration and a verified scheduled run;
- [#851](https://github.com/fderuiter/portfolio/issues/851), the production
  credential-path remediation; and
- [#720](https://github.com/fderuiter/portfolio/issues/720), final production
  verification.

The historical Actions-log and public-surface review blocks publication, but
does not independently block a private production deployment. Conversely,
completion of the local repository audit does not close the operator-owned
production checks above.
