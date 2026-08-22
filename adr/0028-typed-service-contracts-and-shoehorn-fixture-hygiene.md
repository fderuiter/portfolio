# ADR 0028: Typed Service Contracts, Dual-Seam Architecture, and Shoehorn Test Fixture Hygiene

## Status

Accepted

## Context

As the portfolio architecture scales with interactive simulation engines (`lib/crf/ast-evaluator.ts`, `lib/garmin-engine.ts`, `lib/working-with-duck-engine.ts`), complex data workflows, and 140+ automated test suites, two systemic type-safety and testing issues emerged:

1. **Unsafe Test Assertions (`as unknown as TargetType`)**: Test fixtures throughout `__tests__/` frequently resorted to raw TypeScript type casts (`as TargetType` or double casts `as unknown as TargetType`) to satisfy complex interfaces. These assertions silently bypassed TypeScript's type-checker, creating risk of undetected schema regressions and silent contract drift when interfaces evolve.
2. **Implicit Engine Boundaries & Unhandled Exceptions**: Core calculation engines directly exposed raw functions or mutable class methods without formal input validation schemas or exhaustive error taxonomies. Unhandled runtime errors risked escaping to React UI layers as unexpected exceptions rather than structured, recoverable domain results.
3. **Simulation Performance vs. Schema Validation Overhead**: Game simulation engines (`GarminWatch`, `WorkingWithDuck`) operate at 60 FPS in browser `requestAnimationFrame` loops. Imposing heavy asynchronous Zod parsing on raw high-frequency tick and physics calculations would introduce unacceptable microtask overhead, memory allocation churn, and frame drops.

## Decision

We adopt the **Typed Service Contract (Spec & Handler Pattern)** alongside **Shoehorn Test Fixture Hygiene** across core engines and test suites:

1. **Dual-Seam Architecture**:
   - **Internal High-Frequency Core**: High-frequency deterministic physics updates, canvas drawing loops, and core AST recursive descent evaluation remain pure, synchronous, and zero-allocation.
   - **Operational Service Seam**: All boundary operations, command dispatches, formula linting, and persistence interactions are wrapped in vertical slices following the Spec & Handler pattern under `lib/services/`.

2. **Standardized Discriminated Union Result Envelope (`ServiceResult<T, E>`)**:
   - Every operation returns an explicit Discriminated Union value and **never throws**:
     ```typescript
     export type ServiceResult<T, E extends string = string> =
       | { success: true; data: T }
       | {
           success: false;
           error: {
             code: E;
             message: string;
             suggestion?: string;
             recoverable: boolean;
             details?: unknown;
           };
         };
     ```
   - Each operation defines an exhaustive domain-specific Zod string enum for error codes (e.g. `AstEvaluatorErrorCode`, `GarminEngineErrorCode`, `DuckEngineErrorCode`).

3. **Spec & Handler Vertical Slices (`lib/services/`)**:
   - Each operation lives in its own dedicated vertical slice directory containing:
     - `spec.ts`: Input Zod schema ("Parse, don't validate"), error code enum, result types, and `Spec` interface.
     - `handler.ts`: Pure execution handler implementing the `Spec` interface with zero-throw error mappings and constructor-injected dependencies.
   - Initial vertical slices:
     - `lib/services/crf-evaluator/evaluate-formula/`
     - `lib/services/crf-evaluator/lint-formula/`
     - `lib/services/crf-evaluator/lint-form/`
     - `lib/services/garmin/allocate-memory/`
     - `lib/services/garmin/garbage-collect/`
     - `lib/services/garmin/sync-flash-storage/`
     - `lib/services/duck/dispatch-command/`
     - `lib/services/duck/interact-hazard/`

4. **Synchronous vs. Asynchronous Execution Contracts**:
   - Pure in-memory operations declare synchronous `execute(input: Input): ServiceResult<T, E>` to eliminate microtask event-loop overhead.
   - I/O-bound operations (such as browser `localStorage` persistence) declare `execute(input: Input): Promise<ServiceResult<T, E>>`.

5. **Shoehorn Test Fixture Hygiene (`@total-typescript/shoehorn`)**:
   - Install `@total-typescript/shoehorn` as a `devDependency`.
   - In `__tests__/`, replace unsafe `as TargetType` assertions with `fromPartial()` (for partial data objects that still undergo strict property-type validation) and `fromAny()` (for intentionally invalid test cases).
   - Maintain idiomatic DOM casting (`querySelector(...) as HTMLInputElement`) in dedicated test utilities.

6. **Contract Test & Logic Test Separation**:
   - Every service vertical slice is verified by paired unit tests mirroring the source hierarchy:
     - `spec.test.ts`: Contract tests asserting schema parsing, defaults, and rejection of invalid inputs.
     - `handler.test.ts`: Logic tests asserting business logic, state transitions, and error mappings.

7. **DX Doctor Invariant 10: Test Fixture Hygiene Guard**:
   - `lib/dx/doctor.ts` (`npm run doctor` / `npm run quality`) includes an automated static scan asserting zero unsafe `as unknown as [A-Z]` assertions in `__tests__/` and providing single-command guidance.

## Consequences

- **Positive**:
  - Eliminates silent schema drift and type regression vectors in test suites.
  - Guarantees exhaustive error handling and self-documenting error taxonomies across UI and CLI consumers.
  - Preserves 60 FPS performance for game loops while establishing strict type contracts at the operational boundary.
  - Enforces zero-contention vertical slice scalability for future services.
  - Automated DX Doctor guard prevents regressions across PRs and multi-agent workflows.
- **Negative**:
  - Requires maintaining discrete `spec.ts` and `handler.ts` files per operation.
  - Requires migrating existing tests to `fromPartial()` / `fromAny()`.
