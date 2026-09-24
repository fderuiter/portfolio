import type {
  PopulationSnapshot,
  PopulationTransition,
  PopulationType,
  SnapshotRef,
  TransitionReason,
} from "../types";
import { PopulationTypeSchema } from "../types";

/**
 * The structured record a population transition leaves behind: which subject
 * moved, why, between which snapshot versions, and every dealt output it
 * rendered stale.
 */
export interface SnapshotInvalidation {
  transitionId: string;
  subjectId: string;
  reason: TransitionReason;
  change: PopulationTransition["change"];
  /** Populations whose membership actually changed, in suit order. */
  populations: PopulationType[];
  from: SnapshotRef;
  to: SnapshotRef;
  /** Dealt cards compiled against a population that changed. */
  staleCardIds: string[];
}

/** The result of applying a transition: the next version, or a refusal. */
export type TransitionOutcome =
  | { ok: true; snapshot: PopulationSnapshot; changed: PopulationType[] }
  | { ok: false; message: string };

/** A snapshot's id, version and capture time. */
export function snapshotRef(snapshot: PopulationSnapshot): SnapshotRef {
  return {
    id: snapshot.id,
    version: snapshot.version,
    capturedAt: snapshot.capturedAt,
  };
}

/** The ids of every subject in `population`, in snapshot order. */
export function membership(
  snapshot: PopulationSnapshot,
  population: PopulationType
): string[] {
  return snapshot.subjects
    .filter((subject) => subject.populations.includes(population))
    .map((subject) => subject.id);
}

/** Whether two snapshots have the same members of `population`. */
export function sameMembership(
  a: PopulationSnapshot,
  b: PopulationSnapshot,
  population: PopulationType
): boolean {
  if (a === b) return true;
  const left = membership(a, population);
  const right = membership(b, population);
  return left.length === right.length && left.every((id, i) => id === right[i]);
}

/** `SNAP-P1-v1` at version 1 becomes `SNAP-P1-v2`. */
const nextId = (snapshot: PopulationSnapshot) =>
  `${snapshot.id.replace(/-v\d+$/, "")}-v${snapshot.version + 1}`;

/**
 * Applies one transition to a snapshot and returns the next version. Pure:
 * the input snapshot is never modified, so every earlier version stays
 * available for audit. A transition that names an unknown subject, or that
 * would change no membership, is refused.
 */
export function applyTransition(
  snapshot: PopulationSnapshot,
  transition: PopulationTransition
): TransitionOutcome {
  const target = snapshot.subjects.find((s) => s.id === transition.subjectId);
  if (!target) {
    return {
      ok: false,
      message: `${transition.subjectId} is not in snapshot ${snapshot.id}.`,
    };
  }
  const named = new Set(transition.populations);
  const joining = transition.change === "JOIN";
  const changed = PopulationTypeSchema.options.filter(
    (population) =>
      named.has(population) &&
      target.populations.includes(population) !== joining
  );
  if (changed.length === 0) {
    return {
      ok: false,
      message: `${transition.subjectId} already ${joining ? "belongs to" : "is outside"} every named population; ${snapshot.id} is unchanged.`,
    };
  }
  const populations = joining
    ? PopulationTypeSchema.options.filter(
        (p) => target.populations.includes(p) || named.has(p)
      )
    : target.populations.filter((p) => !named.has(p));
  return {
    ok: true,
    changed,
    snapshot: {
      id: nextId(snapshot),
      version: snapshot.version + 1,
      capturedAt: transition.effectiveAt,
      subjects: snapshot.subjects.map((subject) =>
        subject === target ? { ...subject, populations } : subject
      ),
    },
  };
}
