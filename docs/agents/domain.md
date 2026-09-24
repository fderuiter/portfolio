# Domain Docs

How the engineering skills consume this repo's domain documentation when exploring the codebase.

## Before exploring, read these

- **`CONTEXT.md`** at the repo root: authoritative glossary of domain terminology (Logical Proof, CRF Studio, CDISC standards, AST Evaluator, Mobile Stack, SEO, etc.).
- **Relevant ADRs in `adr/`** at the repo root: architectural decisions that apply to the area being explored.

If any of these files don't exist, proceed silently. The `/domain-modeling` skill (reached via `/grill-with-docs` and `/improve-codebase-architecture`) creates or updates them when terms or decisions get resolved.

## File structure

Single-context repo:

```text
/
├── CONTEXT.md
├── adr/
│   ├── 0001-pre-build-database-migrations.md
│   └── ...
├── docs/
│   └── agents/
└── lib/
```

## Use the glossary's vocabulary

When output names a domain concept (in an issue title, a refactor proposal, a hypothesis, a test name), use the term as defined in `CONTEXT.md`. Don't drift to synonyms the glossary explicitly avoids.

## Flag ADR conflicts

If output contradicts an existing ADR, surface it explicitly:

> _Contradicts ADR-0007 (defect remediation), but worth reopening because…_
