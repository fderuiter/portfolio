/** CPU cycles each workbench action costs. T&E-04 (#913) extends this table. */
export const CPU_COSTS = Object.freeze({
  PLAY_HAND: 2,
  DISCARD: 1,
  INSPECT: 1,
});

/** An action that consumes CPU. */
export type CpuAction = keyof typeof CPU_COSTS;

/** Remaining and consumed CPU for the current Blind. */
export interface CpuLedger {
  available: number;
  spent: number;
}

/** Events the CPU reducer understands. */
export type CpuEvent = { type: "SPEND"; action: CpuAction };

/** Whether the ledger can pay for an action. */
export function canAfford(ledger: CpuLedger, action: CpuAction): boolean {
  return ledger.available >= CPU_COSTS[action];
}

/**
 * Pure CPU reducer. An unaffordable spend returns the same ledger object, so
 * callers can detect the refusal by identity.
 */
export function cpuReducer(ledger: CpuLedger, event: CpuEvent): CpuLedger {
  if (!canAfford(ledger, event.action)) return ledger;
  const cost = CPU_COSTS[event.action];
  return { available: ledger.available - cost, spent: ledger.spent + cost };
}
