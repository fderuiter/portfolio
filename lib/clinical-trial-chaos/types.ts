export type CDISCDomain = "DM" | "VS" | "AE" | "LB";

export type ValidationErrorType =
  | "unit-error"
  | "missing-digit"
  | "invalid-date"
  | "negative-value"
  | "range-outlier"
  | "casing-mismatch";

export interface ClinicalObservation {
  id: string;
  field: string;
  rawValue: string;
  correctedValue?: string;
  currentValue: string;
  destination: CDISCDomain;
  errorType?: ValidationErrorType;
  hint?: string;
  isResolved: boolean;
}

export interface ClinicalSubject {
  id: string;
  subjectLabel: string; // e.g. "SUBJ-1042"
  studySite: string; // e.g. "Site 014 (Boston)"
  observations: ClinicalObservation[];
  status: "queued" | "validating" | "routing" | "signing" | "submitted" | "rejected" | "expired";
  isSAE?: boolean; // Serious Adverse Event - urgent priority rush!
  timeRemaining: number; // Seconds before auditor flags it as overdue
  maxTime: number;
  assignedDomainSlot?: CDISCDomain;
  createdAt: number;
}

export interface StationConfig {
  id: CDISCDomain;
  name: string;
  label: string;
  description: string;
  color: string;
  accentColor: string;
  positionIndex: number; // 0, 1, 2, 3 (can be swapped during protocol amendments)
  vendor: "iMednet" | "Veeva Vault" | "OpenClinica";
  pendingSubjects: ClinicalSubject[];
  processedCount: number;
}

export type AuditorBehavior = "patrolling" | "inspecting" | "suspicious" | "issuing_483";

export interface AuditorState {
  x: number; // For canvas sprite rendering (0 to 1 percentage or pixels)
  y: number;
  direction: 1 | -1;
  behavior: AuditorBehavior;
  suspicion: number; // 0 to 100%
  suspicionDecayRate: number; // points per second
  targetStationId?: CDISCDomain;
  inspectTimer: number;
  total483Citations: number;
}

export type AmendmentType =
  | "station-scramble"
  | "sae-priority-rush"
  | "unit-shift-lbs-to-kg"
  | "double-signature-audit";

export interface ProtocolAmendment {
  id: string;
  version: string; // e.g. "Protocol v3.2.1"
  title: string;
  description: string;
  type: AmendmentType;
  durationSeconds: number;
  timeRemaining: number;
  active: boolean;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  level: "INFO" | "WARN" | "CRITICAL" | "COMPLIANT";
  message: string;
  suspicionDelta: number;
}

export type GamePhase = 1 | 2 | 3;
export type GameMode = "campaign" | "endless";
export type PlayState = "idle" | "playing" | "paused" | "phase_cleared" | "game_over";

export interface GameScoreState {
  score: number;
  highScore: number;
  combo: number;
  maxCombo: number;
  multiplier: number;
  subjectsSubmitted: number;
  correctionsMade: number;
  cleanSubmissions: number;
  auditViolations: number;
}

export interface SignatureModalState {
  isOpen: boolean;
  subject: ClinicalSubject | null;
  selectedReason: SignatureReason;
  passwordInput: string;
  requiresReason: boolean;
}

export type SignatureReason =
  | "Intent to Submit"
  | "Author Verification"
  | "Protocol Compliance Review"
  | "Urgent Safety Expedited";
