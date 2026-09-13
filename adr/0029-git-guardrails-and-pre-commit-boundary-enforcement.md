# ADR 0029: Git Safety Guardrails and Pre-Commit Deep-Module Boundary Enforcement

## Status

Accepted

## Context

During high-velocity development and autonomous multi-agent code generation on the `dev` branch, two architectural risks were identified:

1. **Accidental Destructive Git Operations**: Autonomous AI coding agents or shell commands executing `git push --force`, `git push origin main` (bypassing the PR review process), `git reset --hard`, `git clean -fd`, `git branch -D`, or indiscriminate `git checkout .` / `git restore .` risk unrecoverable work-in-progress data loss or disruption to the linear commit history.
2. **Delayed Deep-Module Boundary Detection**: Prior to this ADR, `.husky/pre-commit` executed `typecheck`, heavy Vitest test runners, security audits, and doc-drift checks, but omitted `lint:boundaries` (`depcruise`). Architectural violations (such as code reaching into private subfolder internals instead of declared public entry points) were only caught during full CI runs or manual `npm run quality` invocations, after hundreds of tests had already executed.

## Decision

We implement a **Dual-Defense Git Guardrail Architecture** and establish **Early Fail-Fast Pre-Commit Boundary Enforcement**:

1. **Agent-Agnostic Git Guardrail Interceptor (`scripts/git-guardrail.sh`)**:
   - Intercepts destructive git operations across both AI agent tool JSON payloads (`{"tool_input": {"command": "..."}}`) and direct CLI invocations.
   - Enforces strict exit code 2 rejection on:
     - `git push --force` / `git push -f`
     - Direct pushes targeting `main` (`git push origin main`, `git push main`, `git push .*:main`)
     - `git reset --hard`
     - `git clean -f` / `git clean -fd`
     - `git branch -D`
     - `git checkout .` / `git checkout -- .`
     - `git restore .` / `git restore --staged .`
   - Provides an intentional escape hatch when `ALLOW_DANGEROUS_GIT=1` is explicitly prepended.
   - Includes `.claude/hooks/block-dangerous-git.sh` and `.claude/settings.json` compatibility wrappers for Claude Code or other PreToolUse runners.

2. **Native Git Pre-Push Guard (`.husky/pre-push`)**:
   - Enforces invariant branch protection at the git protocol level by inspecting push destination refs.
   - Aborts direct pushes to `refs/heads/main` to guarantee all changes land via feature branches and pull requests.
   - Respects `ALLOW_DANGEROUS_GIT=1` for emergency recovery.

3. **Early Fail-Fast Pre-Commit Boundary Pipeline (`.husky/pre-commit`)**:
   - Positions `npm run lint:boundaries` (`depcruise lib app components __tests__ hooks scripts`) immediately after `npm run typecheck` and prior to `npm run test`.
   - Halts the pre-commit workflow within ~1.5s upon detecting any deep-module encapsulation breach, cyclic dependency, or private subfolder leak before spinning up worker threads for test suites.

4. **Public Service Entry Point Pattern (`lib/services/crf-evaluator/index.ts`)**:
   - All vertical service operations under `lib/services/<domain>/*` expose their public schemas, handlers, and types through root entry points (`lib/services/crf-evaluator/index.ts`, `lib/services/index.ts`).
   - Consumers in `lib/crf/` and `app/` import solely through these root entry points, maintaining zero private subfolder penetration and 100% boundary compliance.

## Consequences

- **Positive**:
  - Eliminates accidental history rewrites, branch deletions, and worktree wipeouts from autonomous agent tool calls and terminal workflows.
  - Guarantees pull request governance for all commits landing on `main`.
  - Provides instantaneous (~1.5s) feedback on deep-module boundary violations before long-running unit test suites execute.
  - Establishes a clean, consistent public entrypoint contract across all `lib/services/` modules.
- **Negative**:
  - Intentional hard resets or force pushes during rebase operations require prepending `ALLOW_DANGEROUS_GIT=1`.
