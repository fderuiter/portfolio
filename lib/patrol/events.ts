import type { PatrolEvent } from "./types";

/**
 * Stub event dispatcher and queue management for patrol shifts.
 */
export function createEvent(
  type: string,
  title: string,
  description: string,
  severity: PatrolEvent["severity"] = "info"
): PatrolEvent {
  return {
    id: `event-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    timestamp: new Date().toISOString(),
    type,
    title,
    description,
    severity,
  };
}
