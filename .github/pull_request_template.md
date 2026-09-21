## Summary

<!-- What changed, and why? -->

## Target branch

- [ ] Normal topic or hotfix PR into `main` (squash merge)

## Verification

- [ ] `npm run quality`
- [ ] `npm test`
- [ ] Generated documentation is synchronized when public contracts changed
- [ ] One operator-requested Vercel preview checked when deployment risk warrants it
- [ ] No production or shared-provider credentials were added to the repository
- [ ] `npm run audit:secrets` passes when history or public visibility is in scope

## Agent Review Brief

- **Files and symbols:** <!-- Exact review targets -->
- **Invariant boundaries:** Non-destructive Git operations; Vercel Hobby quota;
  environment-scoped credentials; no direct push to `main`.
- **Verification commands:** `npm run quality`, `npm test`,
  `npm run check-docs-drift`.
