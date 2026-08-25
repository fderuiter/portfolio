import * as crypto from "crypto";
import { getEnv } from "../env";
import {
  CountryCode,
  FacetEvaluation,
  GreenlightEvaluation,
  GreenlightFacet,
  GreenlightStatus,
  GreenlightTokenPayload,
  Part11AuditEntry,
  Part11Signature,
  SiteStartupData,
  SponsorOverrideRequest,
  SponsorOverrideResult,
} from "./types";
import { evaluateCountryRules } from "./country-rules";

const DEFAULT_HMAC_SECRET =
  getEnv().GREENLIGHT_SECRET || "site-greenlight-hmac-sha256-secret-2026";

/**
 * Evaluates the 6 operational readiness facets for clinical trial site qualification:
 * 1. IRB: Ethics & IRB Approval
 * 2. CTA: Clinical Trial Agreement
 * 3. eISF: Electronic Investigator Site File
 * 4. DOA: Delegation of Authority Log
 * 5. Training: Site Staff Training & GCP
 * 6. IP: Investigational Product Release
 */
export function evaluateGreenlight(
  siteData: SiteStartupData,
  studyId: string,
  overrides?: {
    waivedFacets?: GreenlightFacet[];
    sponsorOverrideActive?: boolean;
  }
): GreenlightEvaluation {
  const countryCode: CountryCode = siteData.countryCode || "Global";
  const countryRulesResult = evaluateCountryRules(countryCode, siteData);
  const now = new Date().toISOString();
  const waivedSet = new Set(overrides?.waivedFacets || []);

  // 1. IRB Facet
  const irbApproved = Boolean(siteData.irbApprovalDate);
  const irbNotExpired = siteData.irbExpirationDate
    ? new Date(siteData.irbExpirationDate).getTime() > Date.now()
    : true;
  const irbPassed = irbApproved && irbNotExpired;
  const irbStatus = waivedSet.has("IRB")
    ? "WAIVED"
    : irbPassed
      ? "PASSED"
      : "FAILED";
  const irbEvaluation: FacetEvaluation = {
    facet: "IRB",
    status: irbStatus,
    score: irbStatus === "PASSED" ? 100 : irbStatus === "WAIVED" ? 100 : 0,
    details: irbPassed
      ? `IRB approved on ${siteData.irbApprovalDate}`
      : "IRB approval missing or expired",
    lastEvaluatedAt: now,
  };

  // 2. CTA Facet
  const ctaPassed = Boolean(siteData.ctaExecuted);
  const ctaStatus = waivedSet.has("CTA")
    ? "WAIVED"
    : ctaPassed
      ? "PASSED"
      : "FAILED";
  const ctaEvaluation: FacetEvaluation = {
    facet: "CTA",
    status: ctaStatus,
    score: ctaStatus === "PASSED" ? 100 : ctaStatus === "WAIVED" ? 100 : 0,
    details: ctaPassed
      ? `CTA executed on ${siteData.ctaExecutionDate || "record"}`
      : "CTA execution pending",
    lastEvaluatedAt: now,
  };

  // 3. eISF Facet
  const eIsfComplete = Boolean(siteData.eIsfComplete);
  const missingDocs = siteData.eIsfMissingDocuments || [];
  const eIsfPassed = eIsfComplete && missingDocs.length === 0;
  const eIsfStatus = waivedSet.has("eISF")
    ? "WAIVED"
    : eIsfPassed
      ? "PASSED"
      : "FAILED";
  const eIsfEvaluation: FacetEvaluation = {
    facet: "eISF",
    status: eIsfStatus,
    score:
      eIsfStatus === "PASSED"
        ? 100
        : eIsfStatus === "WAIVED"
          ? 100
          : Math.max(0, 100 - missingDocs.length * 20),
    details: eIsfPassed
      ? "eISF Sections 1-7 complete and verified"
      : `eISF incomplete: ${missingDocs.length} required document(s) missing`,
    lastEvaluatedAt: now,
  };

  // 4. DOA Facet
  const doaPassed = Boolean(siteData.doaSignedByPi);
  const doaStatus = waivedSet.has("DOA")
    ? "WAIVED"
    : doaPassed
      ? "PASSED"
      : "FAILED";
  const doaEvaluation: FacetEvaluation = {
    facet: "DOA",
    status: doaStatus,
    score: doaStatus === "PASSED" ? 100 : doaStatus === "WAIVED" ? 100 : 0,
    details: doaPassed
      ? `DOA signed by PI on ${siteData.doaPiSignatureDate || "record"}`
      : "DOA log pending PI electronic signature",
    lastEvaluatedAt: now,
  };

  // 5. Training Facet
  const trainingPercent = siteData.trainingCompletionPercent ?? 0;
  const trainingPassed = trainingPercent >= 100;
  const trainingStatus = waivedSet.has("Training")
    ? "WAIVED"
    : trainingPassed
      ? "PASSED"
      : "FAILED";
  const trainingEvaluation: FacetEvaluation = {
    facet: "Training",
    status: trainingStatus,
    score: waivedSet.has("Training")
      ? 100
      : Math.min(100, Math.max(0, trainingPercent)),
    details: trainingPassed
      ? "100% staff protocol & GCP training complete"
      : `Training at ${trainingPercent}% (100% required)`,
    lastEvaluatedAt: now,
  };

  // 6. IP Facet
  const ipPassed = Boolean(siteData.ipReleaseAuthorized);
  const ipStatus = waivedSet.has("IP")
    ? "WAIVED"
    : ipPassed
      ? "PASSED"
      : "FAILED";
  const ipEvaluation: FacetEvaluation = {
    facet: "IP",
    status: ipStatus,
    score: ipStatus === "PASSED" ? 100 : ipStatus === "WAIVED" ? 100 : 0,
    details: ipPassed
      ? `Investigational product released on ${siteData.ipReleaseDate || "record"}`
      : "IP release authorization pending",
    lastEvaluatedAt: now,
  };

  const facets: Record<GreenlightFacet, FacetEvaluation> = {
    IRB: irbEvaluation,
    CTA: ctaEvaluation,
    eISF: eIsfEvaluation,
    DOA: doaEvaluation,
    Training: trainingEvaluation,
    IP: ipEvaluation,
  };

  const allFacetsPassedOrWaived = Object.values(facets).every(
    (f) => f.status === "PASSED" || f.status === "WAIVED"
  );

  let status: GreenlightStatus = "BLOCKED";

  if (overrides?.sponsorOverrideActive) {
    status = "OVERRIDDEN";
  } else if (allFacetsPassedOrWaived && countryRulesResult.isCompliant) {
    status = "GREENLIGHT";
  } else {
    status = "BLOCKED";
  }

  return {
    siteId: siteData.siteId,
    studyId,
    status,
    facets,
    countryRulesResult,
    isExecutionPermitted: status === "GREENLIGHT" || status === "OVERRIDDEN",
    evaluatedAt: now,
  };
}

/**
 * Computes a hash string for 6-facet evaluation state.
 */
export function computeFacetHash(
  facets: Record<GreenlightFacet, FacetEvaluation>
): string {
  const summary = Object.keys(facets)
    .sort()
    .map(
      (k) =>
        `${k}:${facets[k as GreenlightFacet].status}:${facets[k as GreenlightFacet].score}`
    )
    .join("|");
  return crypto.createHash("sha256").update(summary).digest("hex");
}

/**
 * Issues cryptographic HMAC-SHA256 token for site execution greenlight.
 */
export function issueGreenlightToken(
  siteId: string,
  studyId: string,
  status: GreenlightStatus,
  facetHash: string,
  secretKey: string = DEFAULT_HMAC_SECRET,
  expiresInSeconds: number = 86400 // 24 hours default
): GreenlightTokenPayload {
  const issuedAt = Math.floor(Date.now() / 1000);
  const expiresAt = issuedAt + expiresInSeconds;
  const nonce = crypto.randomBytes(12).toString("hex");

  const message = `${siteId}:${studyId}:${status}:${facetHash}:${issuedAt}:${expiresAt}:${nonce}`;
  const signature = crypto
    .createHmac("sha256", secretKey)
    .update(message)
    .digest("hex");

  return {
    siteId,
    studyId,
    status,
    facetHash,
    issuedAt,
    expiresAt,
    nonce,
    overrideActive: status === "OVERRIDDEN",
    signature,
  };
}

/**
 * Verifies cryptographic HMAC-SHA256 greenlight token validity and payload integrity.
 */
export function verifyGreenlightToken(
  token: GreenlightTokenPayload,
  secretKey: string = DEFAULT_HMAC_SECRET
): { valid: boolean; reason?: string } {
  if (!token || !token.signature || !token.siteId || !token.studyId) {
    return { valid: false, reason: "Malformed or missing token payload" };
  }

  const now = Math.floor(Date.now() / 1000);
  if (token.expiresAt && now > token.expiresAt) {
    return { valid: false, reason: "Greenlight HMAC token has expired" };
  }

  const message = `${token.siteId}:${token.studyId}:${token.status}:${token.facetHash}:${token.issuedAt}:${token.expiresAt}:${token.nonce}`;
  const expectedSignature = crypto
    .createHmac("sha256", secretKey)
    .update(message)
    .digest("hex");

  if (
    !crypto.timingSafeEqual(
      Buffer.from(token.signature),
      Buffer.from(expectedSignature)
    )
  ) {
    return { valid: false, reason: "Invalid HMAC-SHA256 signature mismatch" };
  }

  return { valid: true };
}

/**
 * Applies dual-signature sponsor override with 21 CFR Part 11 justification audit logging.
 */
export function applySponsorOverride(
  request: SponsorOverrideRequest,
  previousHash: string = "GENESIS_HASH_0000000000000000000000000000000000000000000000000000000000000000",
  secretKey: string = DEFAULT_HMAC_SECRET
): SponsorOverrideResult {
  const { siteId, studyId, justification, waivedFacets, signer1, signer2 } =
    request;

  if (!justification || justification.trim().length < 10) {
    return {
      success: false,
      siteId,
      studyId,
      status: "BLOCKED",
      auditEntry: {} as Part11AuditEntry,
      errorMessage:
        "Part 11 compliance requires explicit justification statement (min 10 characters)",
    };
  }

  if (!signer1 || !signer2 || !signer1.id || !signer2.id) {
    return {
      success: false,
      siteId,
      studyId,
      status: "BLOCKED",
      auditEntry: {} as Part11AuditEntry,
      errorMessage:
        "Dual-signature sponsor override requires 2 distinct authorized signers",
    };
  }

  if (signer1.id === signer2.id) {
    return {
      success: false,
      siteId,
      studyId,
      status: "BLOCKED",
      auditEntry: {} as Part11AuditEntry,
      errorMessage: "Signer 1 and Signer 2 must be distinct individuals",
    };
  }

  if (!signer1.passwordHashOrSecret || !signer2.passwordHashOrSecret) {
    return {
      success: false,
      siteId,
      studyId,
      status: "BLOCKED",
      auditEntry: {} as Part11AuditEntry,
      errorMessage:
        "Electronic signature credential verification failed for sponsor signers",
    };
  }

  const timestamp = new Date().toISOString();

  // Generate Part 11 Signatures
  const sig1Digest = crypto
    .createHash("sha256")
    .update(`${signer1.id}:${signer1.role}:${justification}:${timestamp}`)
    .digest("hex");

  const sig2Digest = crypto
    .createHash("sha256")
    .update(`${signer2.id}:${signer2.role}:${justification}:${timestamp}`)
    .digest("hex");

  const signature1: Part11Signature = {
    signerId: signer1.id,
    signerName: signer1.name,
    signerRole: signer1.role,
    reason: `Sponsor Override Approval for Site ${siteId}`,
    timestamp,
    digest: sig1Digest,
  };

  const signature2: Part11Signature = {
    signerId: signer2.id,
    signerName: signer2.name,
    signerRole: signer2.role,
    reason: `Dual-Signer QA Approval for Site ${siteId}`,
    timestamp,
    digest: sig2Digest,
  };

  const auditEntryId = `AUD-${crypto.randomBytes(8).toString("hex")}`;
  const waivedSummary = (waivedFacets || []).join(",");
  const auditContent = `${auditEntryId}:${timestamp}:${siteId}:SPONSOR_OVERRIDE:${justification}:${waivedSummary}:${sig1Digest}:${sig2Digest}:${previousHash}`;
  const auditHash = crypto
    .createHash("sha256")
    .update(auditContent)
    .digest("hex");

  const auditEntry: Part11AuditEntry = {
    id: auditEntryId,
    timestamp,
    siteId,
    eventType: "SPONSOR_OVERRIDE",
    actorId: `${signer1.id},${signer2.id}`,
    actorName: `${signer1.name} & ${signer2.name}`,
    actorRole: `${signer1.role} / ${signer2.role}`,
    justification,
    signatures: [signature1, signature2],
    previousState: "BLOCKED",
    newState: "OVERRIDDEN",
    previousHash,
    hash: auditHash,
  };

  const dummyFacetHash = crypto
    .createHash("sha256")
    .update(`OVERRIDE:${waivedSummary}`)
    .digest("hex");
  const tokenPayload = issueGreenlightToken(
    siteId,
    studyId,
    "OVERRIDDEN",
    dummyFacetHash,
    secretKey
  );

  return {
    success: true,
    siteId,
    studyId,
    status: "OVERRIDDEN",
    auditEntry,
    tokenPayload,
  };
}
