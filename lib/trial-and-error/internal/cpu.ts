/** CPU cycles each workbench action costs. Allocating a shell and applying a footnote seal are free. */
export const CPU_COSTS = Object.freeze({
  PLAY_HAND: 2,
  DISCARD: 1,
  INSPECT: 1,
  /** Rerun a stale output against the current population snapshot. */
  RECOMPILE: 2,
});

/** An action that consumes CPU. */
export type CpuAction = keyof typeof CPU_COSTS;

/** Remaining and consumed CPU for the current Blind. */
export interface CpuLedger {
  available: number;
  spent: number;
}

/**
 * Events the CPU reducer understands. `SPEND` pays for one action;
 * `REPLENISH` refills the ledger to the Blind's allocation, which happens
 * once, deterministically, when each Blind starts.
 */
export type CpuEvent =
  | { type: "SPEND"; action: CpuAction }
  | { type: "REPLENISH"; available: number };

/** Whether the ledger can pay for an action. */
export function canAfford(ledger: CpuLedger, action: CpuAction): boolean {
  return ledger.available >= CPU_COSTS[action];
}

/**
 * Pure CPU reducer. An unaffordable spend returns the same ledger object, so
 * callers can detect the refusal by identity.
 */
export function cpuReducer(ledger: CpuLedger, event: CpuEvent): CpuLedger {
  if (event.type === "REPLENISH") {
    return { available: Math.max(0, Math.trunc(event.available)), spent: 0 };
  }
  if (!canAfford(ledger, event.action)) return ledger;
  const cost = CPU_COSTS[event.action];
  return { available: ledger.available - cost, spent: ledger.spent + cost };
}
