# 0035. Reviewed AI-Assisted Suggestion Boundary

Date: 2026-09-12

## Status

Proposed — a specification deliverable for #665. This ADR designs a review workflow; it does not connect any AI/ML provider, does not transmit study content anywhere, and does not claim suggestion accuracy. Sections marked **Human decision required** are open and must be resolved by a maintainer before any live-provider implementation begins.

## Context

CRF Studio has **no AI-backed feature today**. A case-insensitive search of `lib/crf` and CRF-related components for "suggest", "assist", and "ai" turns up exactly one existing mechanism: `ComplianceViolation.suggestedFix` / `autoFixAvailable` (`lib/crf/types.ts:335-353`), produced entirely deterministically by `study-auditor.ts` and `cdisc-conformance-linter.ts` (e.g., "Truncate to 200 characters", "Assign standard No/Yes codelist"). These are surfaced read-only in `DiagnosticsDrawer.tsx` — there is no accept/reject/undo interaction on them at all today, and no LLM or external call anywhere in the CRF designer.

ADR 0022 §6 already established a **Time-Machine visual diff** mechanism (green additions, red deletions, amber modifications) and a field-level, role-attributed comment/audit trail for 21 CFR Part 11 compliance. Any suggestion-review design should reuse both rather than inventing parallel diff and audit mechanisms.

The parent epic (#536) and this ticket are explicit that #665 is design-only: "do not connect a provider, transmit study content, or claim AI accuracy."

## Decision

### 1. Suggestion lifecycle

`suggestion → assumptions/impact preview → accept/reject → undo`, identical regardless of whether the suggestion came from the existing deterministic linter or a future model-backed source:

```text
Suggestion {
  id: string
  targetRef: { formId, sectionId, fieldId? }   // what it proposes to change
  patch: JsonPatchOp[]                          // proposed change, as data — never applied automatically
  rationale: string                             // plain-language "why"
  assumptions: string[]                         // e.g. "Assumes AE severity uses CTCAE v5 numeric grades"
  provenance: "rule" | "model"                  // visible badge — user always knows which
  confidence?: "low" | "medium" | "high"        // qualitative only, see Human decisions below
}
```

A `Suggestion` is inert data. It cannot mutate `CRFForm`/`StudyProtocol` state by existing. Two user-invoked actions are the only way a suggestion affects the study:

- **Accept**: applies `patch` through the _same_ form-mutation path a manual edit would use (not a separate write path) — so accepted suggestions are indistinguishable from manual edits to every downstream consumer (validation, export, audit trail).
- **Reject**: discards the suggestion; no state change; the rejection itself is logged (see Provenance/audit below) so a reviewer can see what was proposed and declined.
- **Undo**: reuses ADR 0022's existing Time-Machine history mechanism rather than a parallel undo stack — an accepted suggestion is just another entry in that history, revertible the same way a manual edit is.

### 2. Non-mutation boundary (the actual guarantee, stated precisely)

The boundary this ADR is required to define: **no suggestion source — rule-based or model-based — may write to study state except through `acceptSuggestion(id)`, and `acceptSuggestion` may only be invoked by an explicit user action on a rendered `Suggestion`.** Concretely:

- Suggestion generation (linting, or a future model call) runs against a **read-only snapshot** of the current form, never the live mutable state.
- `acceptSuggestion` re-validates the patch against the _current_ state at accept time (not the state at generation time) and refuses to apply if the target has changed underneath it (e.g., the field was deleted since the suggestion was generated) — surfaced as "this suggestion is stale" rather than a silent no-op or a forced apply.
- Non-AI manual authoring is unaffected: a user can always edit a field directly whether or not a suggestion exists for it, and doing so does not require dismissing pending suggestions on that field (they're simply re-validated against the new state on next accept attempt, per the point above).

### 3. Impact preview

Before accept, render `patch` through the existing Time-Machine diff renderer (ADR 0022 §6) scoped to just the affected fields/rules, plus the `assumptions` list as plain text. No accept action is reachable without this preview having been rendered at least once for that suggestion — there is no "accept all" that skips preview.

### 4. Data provenance, privacy, and transmission boundary

**Default and only mode built by this ADR's bounded slice (see §6): fully local, rule-based suggestions — zero network egress for suggestion generation.** For any _future_ model-backed suggestion source, this ADR fixes the following non-negotiable constraints before one may be added, without designing the provider integration itself:

- Study content (form definitions, and especially any synthetic subject-level data) must never be sent to an external provider **by default**. A per-study, explicit opt-in toggle is required before any external call is made.
- Even with opt-in, only the minimal schema needed for the specific suggestion (e.g., "this field's `dataType`, `label`, and validation rules") may be transmitted — never a full study export, never subject-level records.
- Every external call is logged to the same 21 CFR Part 11 audit trail ADR 0022 established for field comments (reuse, not a parallel log): what was sent (the minimized payload, redacted of anything not covered by the minimization rule), when, and which suggestion it produced.
- Provider failures (timeout, error, rate limit) must degrade to "no suggestion available" and must never block, slow, or error the surrounding authoring UI.

### 5. Explicit future gates (not designed here — flagged so they cannot be silently skipped later)

- **Provider selection**: which external AI provider(s), if any, is a **Human decision required** — not made by this ADR.
- **Cost/rate-limiting model**: per-study quota, org-wide budget, or unlimited — **Human decision required**.
- **Consent UX**: exact wording and placement of the opt-in toggle from §4 — **Human decision required**.
- **Confidence display**: this ADR fixes confidence as qualitative (`low`/`medium`/`high`) rather than a numeric score, to avoid implying a precision the system cannot back up; whether to expose even that qualitative label to end users, or keep it internal-only, is a **Human decision required**.
- **Accuracy claims**: never surface language stronger than "suggestion" (never "verified", "validated", "compliant", or "correct") anywhere a model-backed suggestion is rendered. This is fixed by this ADR, not a future gate.

### 6. Bounded proposed implementation slice

The only implementation this ADR proposes building now: a **review UI wired to the existing deterministic suggestion source**, with no new AI/provider code at all.

- Wrap each `ComplianceViolation` that already carries a `suggestedFix` in a `Suggestion` object (`provenance: "rule"`, `confidence` omitted — deterministic fixes don't need a confidence label).
- Build the suggestion card, impact-preview modal (reusing the Time-Machine diff renderer), and accept/reject/undo actions described in §1-§3, wired only to this existing source.
- No network call, no provider SDK, no new external dependency. Because there is no model-backed source yet, §4's transmission boundary is enforced by construction (there is nothing to leak) rather than by a runtime guard — that guard becomes necessary only when a "model" provenance source is added later, at which point it should be implemented and tested before that source ships, not deferred again.

This gives the review UI, the non-mutation boundary, and the audit trail integration real usage and test coverage against a safe, already-shipped suggestion source before anyone has to make the harder provider/cost/consent decisions in §5.

## Synthetic Example Walkthrough

All identifiers below are synthetic.

1. The existing linter flags a field: `ComplianceViolation { field: "AESEV", rule: "missing-codelist", suggestedFix: "Assign CL_AESEV_CTCAE5" }`.
2. Wrapped as a suggestion:
   ```json
   {
     "id": "sugg_001",
     "targetRef": { "formId": "form_ae", "fieldId": "AESEV" },
     "patch": [
       {
         "op": "add",
         "path": "/fields/AESEV/codelistId",
         "value": "CL_AESEV_CTCAE5"
       }
     ],
     "rationale": "AESEV has no codelist reference; CDASH requires a controlled severity grade.",
     "assumptions": [
       "Assumes AE severity uses CTCAE v5.0 numeric grades, per ADR 0034."
     ],
     "provenance": "rule"
   }
   ```
3. **Impact preview**: diff shows `AESEV.codelistId` changing from `undefined` to `"CL_AESEV_CTCAE5"`; assumptions list rendered alongside.
4. **Accept**: patch applied through the normal field-edit path; entry appended to the Time-Machine history and the audit trail as "Suggestion sugg_001 accepted by `{user}`."
5. **Reject**: no state change; audit trail records "Suggestion sugg_001 rejected by `{user}`," so a later reviewer can see it was seen and declined, not missed.
6. **Undo**: the accepted change is reverted via the existing Time-Machine control, identical to undoing a manual edit.
7. **Staleness case**: if the field `AESEV` was deleted between generation and accept, `acceptSuggestion` refuses with "This suggestion no longer applies" rather than recreating the field or silently no-op'ing.

## Human decisions required (summary)

1. Whether to ever add a live external AI provider at all.
2. Which provider(s), cost model, and rate-limiting strategy.
3. Consent UX wording/placement for the opt-in toggle.
4. Whether qualitative confidence labels are shown to end users at all.
5. Whether AI-suggestion audit entries reuse the existing 21 CFR Part 11 field-comment trail (recommended in §4) or need a separate log — a maintainer call once a model-backed source is actually proposed.

## Out of Scope / Non-Claims

- No AI/ML provider is connected by this ADR or its proposed bounded slice.
- No study content, synthetic or otherwise, is transmitted to any external service by anything this ADR proposes building now.
- No accuracy, validation, or compliance claim is made about any suggestion, rule-based or (future) model-based.
- Provider selection, cost, consent UX, and evaluation/rollback criteria for a live model are explicitly deferred future gates, not resolved here.

## Invariant Compliance

- **AGENTS.md Invariant #9**: source-backed design contract requested by #665; no `lib/`, `hooks/`, or `types/` exports changed, so no TypeDoc regeneration is required by this document alone.
- **AGENTS.md Invariant #10/#11** (accessibility, defect remediation): flagged here for whoever implements §6 — the suggestion card, impact-preview modal, and accept/reject/undo controls must meet the same WCAG 2.1 AA and focus-trap requirements as every other CRF Studio modal (ADR 0022's existing modals already do this; the implementation should reuse those primitives, not build new ones).
- **Verification**: none — this is a specification artifact with no executable surface. `npm run check-docs-drift` was run after adding this file and reports no drift.

## Consequences

### Positive

- Gives the "suggestion" concept one lifecycle and one non-mutation boundary that both today's deterministic linter and any future model-backed source must fit into — no separate code path per source.
- The bounded slice (§6) delivers real, testable value (a working review UI) without waiting on any of the harder provider/licensing/consent decisions.
- Reuses ADR 0022's existing diff and audit-trail mechanisms instead of building parallel ones.

### Negative / Trade-offs

- The bounded slice intentionally does not touch the hardest part of "AI-assisted" (an actual model), so it does not validate the transmission-boundary guard under real provider conditions — that guard's correctness under a real integration remains to be proven when one is proposed.
- Reusing the Time-Machine/audit-trail mechanisms couples this feature's implementation timeline to those mechanisms remaining stable.
