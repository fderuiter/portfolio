# ADR 0046: Trial & Error: Biostat Ops Architecture

## Status

Accepted on 2026-09-23 with T&E-01 ([#909](https://github.com/fderuiter/portfolio/issues/909)),
under the governing map [#890](https://github.com/fderuiter/portfolio/issues/890).
Later Trial & Error tickets amend this record rather than contradict it.

## Context

Trial & Error: Biostat Ops is a new standalone arcade game: a poker-themed
roguelike deckbuilder in which clinical outputs (Tables, Listings, Figures and
subject tokens) form scoring hands worth `Chips × Mult` against milestone
Blinds. Thirteen child tickets deliver it as vertical slices, so the first
slice has to fix the seams every later slice builds on: where the domain
lives, what may be random, how a hand is scored, and how blinded values are
kept out of the client.

Two existing clinical-themed surfaces are adjacent but out of bounds. Clinical
Trial Chaos (`lib/clinical-trial-chaos*`, `components/ClinicalTrialChaos.tsx`)
is a separate game, and CRF Studio (`lib/crf`) is a separate tool. Sharing code
with either would couple three products' release cadences and invite exactly
the "fix the prototype later" drift the governing map rules out.

## Decision

### Deep module

The game domain is the deep module `lib/trial-and-error/`:

- `types.ts` declares every contract as a Zod schema with its type inferred
  from it: populations (FAS and ITT are distinct members), card and hand
  types, rounding modes, `TableShellSpec`, `RuleCheckResult`, the SAP
  rulebook, population snapshot, staged table, QC finding and report,
  `HandEvaluation`, and `Scenario`.
- `scenarios.ts` holds fictional scenario presets.
- `index.ts` is the public API.
- `internal/` (rounding, hands, validator, scoring, CPU, desk) is private.
  `app/`, `components/` and `__tests__/` import only through the root entry
  points, which `npm run lint:boundaries` enforces.

React components (`components/trial-and-error/`) are thin adapters: they
render `deriveDeskView` and dispatch intents to `advanceDesk`. The route
`/arcade/trial-and-error` mounts the desk through the shared `PlayCabinet`
lifecycle with a `ssr: false` dynamic import.

### No imports from Clinical Trial Chaos or CRF Studio

Nothing under `lib/trial-and-error/`, `components/trial-and-error/` or the
route imports from `lib/clinical-trial-chaos*`, `components/ClinicalTrialChaos.tsx`
or `lib/crf`. Ideas may be copied; modules may not be shared.

### Determinism and the seeded-RNG boundary

Validation and scoring are pure: they never mutate inputs, never read browser
state, and never consult randomness. The validator returns findings in a
stable order (row, column, category), and every denominator is derived from
the population snapshot rather than from the table. Rounding uses exact
integer arithmetic (`roundRatio`), so a tie such as `543 / 12 = 45.25` is
detected exactly and resolved by the scenario's declared mode (half-even,
half-away-from-zero, or truncate). There is no universal N+1 or N+2 rule.

Randomness is allowed in exactly two places: the crisis/event deck (T&E-05)
and shop inventory (T&E-12). Both will draw from one seeded PRNG kept in
`internal/`, and run state will record the seed and draw index so that the
same seed plus the same moves replays identically. T&E-01 needs no
randomness: its draw pile is a fixed, scenario-ordered list, and desk state
records the `drawIndex`.

### Scoring pipeline

`evaluateHand` implements the pipeline pinned in #890:

```text
Hand Score = (base hand Chips + Σ output Chips + Σ relic Chips)
           × (base hand +Mult + Σ card and rule +Mult + Σ relic +Mult)
           × Π ×Mult
```

Chips and +Mult totals are floored at zero, and the score is floored to an
integer after binary floating-point noise is removed. Any `RuleCheckResult`
with `multMultiplier: 0` triggers the zero-score rule: final Mult is 0. That
covers an uncorrected fatal denominator error now and closed-session
unblinding (T&E-08) later. `HandEvaluation` returns the per-step ledger,
Chips, +Mult and ×Mult breakdowns, rule results and zero-rule flag. Later
tickets extend the inputs (relics, synergies such as T&E-06's ×2.0 TLF_PAIR
bonus applied as a ×Mult factor), not this output shape.

`ruleResultsFor` maps findings to scoring consequences. A corrected finding
earns its SAP rule's `correctionMultBonus`. An open fatal finding carries
×0. An open non-fatal finding is a redline that subtracts its
`redlineMultPenalty`. With no standing denominator finding, the population's
verified subject records are credited as Chips. The QC Desk's Expected Value
scores only the findings the reviewer has revealed. Approve & Play scores the
hand as it truly is, so an undiscovered fatal error still zeroes it.

### CPU

`cpuReducer` charges 2 CPU to play a hand and 1 CPU to discard. An
unaffordable spend returns the same ledger. T&E-04 extends this reducer
(replenishment, footnote seals) rather than replacing it.

### Blinding lives in state, not CSS

Face-down or closed-session values (T&E-08) must be absent from client state:
the desk reducer receives redacted cards, not full cards with a hidden flag.
A test asserts that serialized state contains no blinded value.

## Consequences

- Scenario data can be validated at runtime with the same schemas the
  compiler checks, and schema tests cover acceptance and rejection.
- `vitest.config.ts` enforces a per-glob threshold of 95% statements,
  branches, functions and lines for `lib/trial-and-error/**`, above the
  repository-wide gate. The type-only barrel `index.ts` is excluded. `types.ts`
  holds runtime schemas, so it stays measured.
- Replay is a property test: any move sequence reduces to an identical state,
  and CPU is conserved.
- Every Trial & Error ticket touches only this module, its components, and
  its route registrations.
