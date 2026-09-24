# ADR 0038: Protected Build-Once Production Releases

## Status

**Amended by [ADR 0048](0048-deploy-main-on-green-ci.md) on 2026-09-24:**
production now deploys automatically when CI passes on `main`. The stage,
verify, and promote sequence below still applies; the manual SemVer dispatch,
the repeated quality gates, and the rollback drill do not.

Accepted on 2026-09-13. Supersedes ADR 0037 only where that decision allowed
Vercel to deploy every merge to `main` automatically.

**Control correction, 2026-09-22:** the build-once, stage, verify, and promote
decision remains active. The reviewer-protected GitHub Environment described
below is not active: required reviewers and environment protection rules are
unavailable while this repository is private on GitHub Free, and the live
environment has no protection rules. Today the job is guarded by manual
dispatch, environment-scoped secrets, workflow validation, concurrency, and
client-side policy—not by a server-enforced reviewer. Public conversion or a
qualifying plan change is required before the reviewer portion of this ADR can
be implemented.

## Context

ADR 0001 requires production migrations to run outside application builds,
while ADR 0037 made `main` the sole releasable source. Automatic Git deployment
could not satisfy both decisions: it could publish a commit before an approved
operator applied its migrations, and it rebuilt instead of promoting the exact
artifact that passed staged verification. Vercel Hobby also does not provide
paid deployment checks or rolling-release controls.

## Decision

Production is released only through a serialized, manually dispatched workflow
from the current `main` tip. An unprotected job first replays the complete
migration history on disposable PostgreSQL and reruns the repository gates. A
second job enters the `production-release` GitHub Environment, where an
authorized reviewer releases an unpooled, least-privilege migration credential
and Vercel deployment credentials.

The protected job applies backward-compatible migrations once, verifies zero
schema drift, builds one production artifact, deploys it with production
configuration but without assigning production domains, and runs synthetic
journeys against that immutable deployment. Only that deployment may be
promoted. Its deployment ID, commit SHA, and previous production deployment are
recorded before the workflow creates the annotated SemVer tag and GitHub
release. Vercel Git deployments are disabled for every branch so a merge cannot
bypass the gate.

Application rollback and database recovery are distinct. Application rollback
repoints domains to the recorded known-good immutable deployment. Database
changes follow expand/contract and recover by forward-compatible roll-forward;
the workflow never attempts an automatic destructive database rollback.

## Consequences

- A merge to `main` is releasable but not yet released.
- Production migration credentials never enter ordinary CI, builds, previews,
  or repository configuration.
- Failure before promotion leaves production untouched; failure after migration
  requires the candidate to remain compatible with both application versions.
- Releases consume one Vercel build. The rollback drill reuses existing preview
  artifacts and therefore consumes no additional builds.
