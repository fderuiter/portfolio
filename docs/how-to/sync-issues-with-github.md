# How-To: Synchronize Issues with GitHub CLI

Goal: manage local tracer-bullet specifications in `.scratch/issues/` and synchronize them with remote GitHub Issues using `scripts/sync-issues.ts` and the `gh` CLI, adhering to ADR 0025.

---

## 1. Context & Architecture

Per [ADR 0025](../../adr/0025-dual-tracker-issue-slicing-and-github-sync.md), autonomous agents perform best with self-contained, context-isolated tracer-bullet tickets in the local workspace (`.scratch/issues/`). However, team visibility, issue tracking, and PR linking benefit from native GitHub Issues with milestone tags and dependency references.

The **Dual-Tracker Issue Slicing Pattern** bridges this divide:
1. **Local Tracer-Bullet Specification (`.scratch/issues/`)**: authored as standalone markdown files (`0001-<slug>.md`, `0548-<slug>.md`).
2. **Automated GitHub CLI Synchronization**: zero-dependency script utilizing GitHub CLI (`gh issue list`, `gh issue create`, `gh issue edit`) to update or create GitHub Issues.
3. **Execution Boundary**: agents work from local ticket files via `/implement`, clearing context between tickets, while commits and PRs reference both the ticket ID and GitHub issue number.

---

## 2. Authoring a Local Issue Ticket

Create a markdown file under `.scratch/issues/` (e.g. `.scratch/issues/0850-feat-analytics-v2.md`):

```markdown
# feat(analytics): Add Real-Time Engagement Telemetry

- Status: OPEN
- Blocked By: #713
- Labels: area:dx, type:feature, ready-for-agent
- Milestone: Sprint 14

## Context & Seam
Target files: `lib/telemetry.ts`, `app/api/telemetry/route.ts`.

## Red-Green TDD Plan
1. Failing test asserting event batching.
2. Implement ring buffer flush handler.

## Verification Gates
`npm run quality` and `npm test`
```

### Supported Metadata Headers

- `Status`: `OPEN` | `IN_PROGRESS` | `DONE` (or `CLOSED`).
- `Blocked By`: comma-separated list of issue numbers e.g. `#713, #748`.
- `Labels`: comma-separated triage labels (e.g. `area:dx`, `type:feature`, `ready-for-agent`).
- `Milestone`: target milestone string.

---

## 3. Running Synchronization

### Dry-Run Preview

To inspect what changes would be dispatched without making network calls or mutations:

```bash
npm run dx issues:sync -- --dry-run
# or directly
npx tsx scripts/sync-issues.ts --dry-run
```

### Executing Live Synchronization

Ensure you are authenticated with GitHub CLI (`gh auth status`), then run:

```bash
npm run dx issues:sync
```

The script will:
- Parse all markdown specifications in `.scratch/issues/*.md`.
- Match existing issues by number (from the filename prefix like `0548-*.md`) or title.
- Update missing labels and close completed tickets (`Status: DONE`).
- Create new GitHub issues for unmapped specifications and print the assigned issue URL.

---

## 4. Verification

After synchronization, verify the issue status remotely:

```bash
gh issue list --state open --limit 20
```
