/**
 * Type definitions for Site Qualification, Regulatory Binders, and Delegation Governance.
 */

export type CountryCode = "US" | "EU" | "JP" | "GB" | "Global";

export type StatutoryRuleStatus =
  "PASSED" | "FAILED" | "PENDING" | "NOT_APPLICABLE";

export interface StatutoryRuleCheck {
  id: string;
  name: string;
  jurisdiction: CountryCode;
  status: StatutoryRuleStatus;
  description: string;
  statutoryReference: string;
  mandatory: boolean;
}

export interface SiteStartupData {
  siteId: string;
  siteName: string;
  countryCode: CountryCode;
  irbApprovalDate?: string;
  irbExpirationDate?: string;
  ctaExecuted?: boolean;
  ctaExecutionDate?: string;
  eIsfComplete?: boolean;
  eIsfMissingDocuments?: string[];
  doaSignedByPi?: boolean;
  doaPiSignatureDate?: string;
  trainingCompletionPercent?: number; // 0-100
  ipReleaseAuthorized?: boolean;
  ipReleaseDate?: string;
  form1572Signed?: boolean; // US
  euCtisRegistered?: boolean; // EU
  pmdaNotificationFiled?: boolean; // JP
  mhraApprovalReceived?: boolean; // GB
}

export interface CountryRulesResult {
  jurisdiction: CountryCode;
  isCompliant: boolean;
  complianceScore: number; // 0-100
  evaluatedRules: StatutoryRuleCheck[];
  passedRules: string[];
  missingRequirements: string[];
}

export type GreenlightFacet =
  "IRB" | "CTA" | "eISF" | "DOA" | "Training" | "IP";

export type FacetStatus = "PASSED" | "FAILED" | "WAIVED";

export interface FacetEvaluation {
  facet: GreenlightFacet;
  status: FacetStatus;
  score: number; // 0-100
  details: string;
  lastEvaluatedAt: string;
}

export type GreenlightStatus = "GREENLIGHT" | "BLOCKED" | "OVERRIDDEN";

export interface GreenlightEvaluation {
  siteId: string;
  studyId: string;
  status: GreenlightStatus;
  facets: Record<GreenlightFacet, FacetEvaluation>;
  countryRulesResult: CountryRulesResult;
  isExecutionPermitted: boolean;
  evaluatedAt: string;
}

export interface GreenlightTokenPayload {
  siteId: string;
  studyId: string;
  status: GreenlightStatus;
  facetHash: string;
  issuedAt: number;
  expiresAt: number;
  nonce: string;
  overrideActive?: boolean;
  signature: string;
}

export interface Part11Signature {
  signerId: string;
  signerName: string;
  signerRole: string;
  reason: string;
  timestamp: string;
  digest: string;
}

export interface SponsorOverrideRequest {
  siteId: string;
  studyId: string;
  justification: string;
  waivedFacets: GreenlightFacet[];
  signer1: {
    id: string;
    name: string;
    role: string;
    passwordHashOrSecret: string;
  };
  signer2: {
    id: string;
    name: string;
    role: string;
    passwordHashOrSecret: string;
  };
}

export interface SponsorOverrideResult {
  success: boolean;
  siteId: string;
  studyId: string;
  status: GreenlightStatus;
  auditEntry: Part11AuditEntry;
  tokenPayload?: GreenlightTokenPayload;
  errorMessage?: string;
}

export interface Part11AuditEntry {
  id: string;
  timestamp: string;
  siteId: string;
  eventType:
    | "SPONSOR_OVERRIDE"
    | "DOA_SIGN_OFF"
    | "DOA_REVOCATION"
    | "GREENLIGHT_CHANGE"
    | "GATEKEEPER_DENIAL";
  actorId: string;
  actorName: string;
  actorRole: string;
  justification: string;
  signatures: Part11Signature[];
  previousState?: string;
  newState?: string;
  previousHash: string;
  hash: string;
}

export type ExecutionAction =
  | "SUBJECT_RANDOMIZATION"
  | "ECRF_WRITE_ACCESS"
  | "ECRF_SAVE"
  | "ECRF_SUBMIT"
  | "IP_DISPENSING"
  | "SUBJECT_ENROLLMENT";

export interface GatekeeperResult {
  allowed: boolean;
  siteId: string;
  action: ExecutionAction;
  status: GreenlightStatus;
  reason: string;
  violationCode?: string;
  timestamp: string;
}

export interface DiaEtmfZone {
  zoneNumber: number; // 1-10
  zoneName: string;
  description: string;
}

export interface EisfSection {
  sectionNumber: number; // 1-7
  sectionName: string;
  description: string;
}

export type QcStatus =
  "DRAFT" | "QC_PENDING" | "QC_APPROVED" | "QC_REJECTED" | "SYNCED_TO_ETMF";

export interface BinderDocument {
  id: string;
  title: string;
  eisfSection: number; // 1-7
  etmfZone: number; // 1-10
  siteId: string;
  studyId: string;
  qcStatus: QcStatus;
  content: string;
  version: string;
  uploadedBy: string;
  uploadedAt: string;
  qcComments?: string;
  lastSyncedAt?: string;
}

export type DOATaskCode =
  | "CONSENT"
  | "PHYSICAL_EXAM"
  | "CRF_ENTRY"
  | "IP_ADMIN"
  | "SAE_REPORTING"
  | "LAB_SAMPLES"
  | "ELIGIBILITY_VERIFICATION";

export interface DOAPersonnel {
  id: string;
  name: string;
  role: string;
  email: string;
  delegatedTaskCodes: DOATaskCode[];
  startDate: string;
  endDate?: string;
  status: "ACTIVE" | "PENDING" | "REVOKED";
  signedByPi: boolean;
  piSignDate?: string;
  revokedByPi?: boolean;
  piRevokeDate?: string;
  revocationReason?: string;
}

export interface DOALog {
  siteId: string;
  siteName: string;
  studyId: string;
  piName: string;
  piEmail: string;
  personnel: DOAPersonnel[];
  status: "DRAFT" | "PI_SIGNED" | "AMENDED";
  piSignature?: Part11Signature;
  auditTrail: Part11AuditEntry[];
}
