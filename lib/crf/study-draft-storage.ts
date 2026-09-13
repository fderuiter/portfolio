import type { StudyProtocol } from "./types";

/**
 * localStorage key holding the author's most recently acknowledged CRF Studio
 * draft, wrapped in a versioned envelope so future format changes can be
 * detected and migrated instead of silently misread.
 */
export const STUDY_DRAFT_STORAGE_KEY = "crf_studio_draft_v1";

/**
 * Backup key an unreadable/corrupt draft is copied to before the primary key
 * is reset, so a bad write or manual edit never silently destroys the only
 * copy of an author's work.
 */
export const STUDY_DRAFT_CORRUPT_BACKUP_KEY = "crf_studio_draft_v1_corrupt";

/** Current envelope format version. Bump when the envelope shape changes. */
export const STUDY_DRAFT_ENVELOPE_VERSION = 1;

export interface StudyDraftEnvelope {
  envelopeVersion: number;
  savedAt: string;
  study: StudyProtocol;
}

export type SaveStudyDraftResult =
  | { status: "saved"; savedAt: string }
  | { status: "unavailable" }
  | { status: "error"; message: string };

export type LoadStudyDraftResult =
  | { status: "recovered"; study: StudyProtocol; savedAt: string }
  | { status: "empty" }
  | { status: "corrupt" };

function isStudyProtocolShape(value: unknown): value is StudyProtocol {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.id === "string" &&
    Array.isArray(candidate.forms) &&
    Array.isArray(candidate.visits) &&
    Array.isArray(candidate.codelists)
  );
}

function isStudyDraftEnvelopeShape(
  value: unknown
): value is StudyDraftEnvelope {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.envelopeVersion === "number" &&
    typeof candidate.savedAt === "string" &&
    isStudyProtocolShape(candidate.study)
  );
}

function resolveStorage(storage?: Storage): Storage | undefined {
  if (storage) return storage;
  if (typeof window === "undefined") return undefined;
  return typeof window.localStorage?.getItem === "function" &&
    typeof window.localStorage?.setItem === "function"
    ? window.localStorage
    : undefined;
}

/**
 * Persists the current study as the acknowledged local draft. Never throws;
 * a full or unavailable store reports `"error"`/`"unavailable"` so the caller
 * can keep the in-memory draft and offer a native download instead.
 */
export function saveStudyDraft(
  study: StudyProtocol,
  storage?: Storage
): SaveStudyDraftResult {
  const target = resolveStorage(storage);
  if (!target) return { status: "unavailable" };

  const savedAt = new Date().toISOString();
  const envelope: StudyDraftEnvelope = {
    envelopeVersion: STUDY_DRAFT_ENVELOPE_VERSION,
    savedAt,
    study,
  };

  try {
    target.setItem(STUDY_DRAFT_STORAGE_KEY, JSON.stringify(envelope));
    return { status: "saved", savedAt };
  } catch (err) {
    return {
      status: "error",
      message: err instanceof Error ? err.message : "Unknown storage error",
    };
  }
}

/**
 * Reads the acknowledged local draft, if any. A present-but-unreadable or
 * version-mismatched entry is copied to {@link STUDY_DRAFT_CORRUPT_BACKUP_KEY}
 * for manual recovery rather than being silently overwritten or discarded.
 */
export function loadStudyDraft(storage?: Storage): LoadStudyDraftResult {
  const target = resolveStorage(storage);
  if (!target) return { status: "empty" };

  const raw = target.getItem(STUDY_DRAFT_STORAGE_KEY);
  if (!raw) return { status: "empty" };

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    preserveCorruptDraft(target, raw);
    return { status: "corrupt" };
  }

  if (
    !isStudyDraftEnvelopeShape(parsed) ||
    parsed.envelopeVersion !== STUDY_DRAFT_ENVELOPE_VERSION
  ) {
    preserveCorruptDraft(target, raw);
    return { status: "corrupt" };
  }

  return {
    status: "recovered",
    study: parsed.study,
    savedAt: parsed.savedAt,
  };
}

function preserveCorruptDraft(storage: Storage, raw: string): void {
  try {
    storage.setItem(STUDY_DRAFT_CORRUPT_BACKUP_KEY, raw);
  } catch {
    // Best-effort only; if the store is unavailable there's nowhere to preserve it.
  }
}
