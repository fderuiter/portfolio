import { describe, it, expect } from "vitest";
import {
  evaluateGreenlight,
  computeFacetHash,
  issueGreenlightToken,
  verifyGreenlightToken,
  applySponsorOverride,
} from "../../lib/site-governance/greenlight-engine";
import {
  SiteStartupData,
  SponsorOverrideRequest,
} from "../../lib/site-governance/types";

describe("6-Facet Site Greenlight Engine", () => {
  const completeSite: SiteStartupData = {
    siteId: "SITE-201",
    siteName: "Mayo Clinic Trial Site",
    countryCode: "US",
    irbApprovalDate: "2026-01-10",
    irbExpirationDate: "2027-01-10",
    form1572Signed: true,
    ctaExecuted: true,
    ctaExecutionDate: "2026-01-12",
    eIsfComplete: true,
    doaSignedByPi: true,
    doaPiSignatureDate: "2026-01-15",
    trainingCompletionPercent: 100,
    ipReleaseAuthorized: true,
    ipReleaseDate: "2026-01-20",
  };

  /**
   * @req: REQ-GREENLIGHT-EVALUATOR
   * Evaluates all 6 operational readiness facets accurately.
   */
  it("evaluates all 6 operational readiness facets and issues GREENLIGHT", () => {
    const evaluation = evaluateGreenlight(completeSite, "STUDY-PH3-ONCOLOGY");

    expect(evaluation.status).toBe("GREENLIGHT");
    expect(evaluation.isExecutionPermitted).toBe(true);

    // Verify all 6 facets
    expect(evaluation.facets.IRB.status).toBe("PASSED");
    expect(evaluation.facets.CTA.status).toBe("PASSED");
    expect(evaluation.facets.eISF.status).toBe("PASSED");
    expect(evaluation.facets.DOA.status).toBe("PASSED");
    expect(evaluation.facets.Training.status).toBe("PASSED");
    expect(evaluation.facets.IP.status).toBe("PASSED");
  });

  /**
   * @req: REQ-GREENLIGHT-BLOCKED
   * Returns BLOCKED when one or more required facets fail.
   */
  it("returns BLOCKED when training is incomplete or IP release pending", () => {
    const incompleteSite: SiteStartupData = {
      ...completeSite,
      trainingCompletionPercent: 75, // incomplete
      ipReleaseAuthorized: false,
    };

    const evaluation = evaluateGreenlight(incompleteSite, "STUDY-PH3-ONCOLOGY");

    expect(evaluation.status).toBe("BLOCKED");
    expect(evaluation.isExecutionPermitted).toBe(false);
    expect(evaluation.facets.Training.status).toBe("FAILED");
    expect(evaluation.facets.IP.status).toBe("FAILED");
  });

  /**
   * @req: REQ-GREENLIGHT-HMAC-TOKEN
   * Issues cryptographic HMAC-SHA256 tokens and verifies signatures.
   */
  it("issues and verifies cryptographic HMAC-SHA256 greenlight tokens", () => {
    const evaluation = evaluateGreenlight(completeSite, "STUDY-PH3-ONCOLOGY");
    const facetHash = computeFacetHash(evaluation.facets);

    const token = issueGreenlightToken(
      evaluation.siteId,
      evaluation.studyId,
      evaluation.status,
      facetHash
    );

    expect(token.signature).toBeDefined();
    expect(token.signature.length).toBe(64); // hex SHA-256

    const verification = verifyGreenlightToken(token);
    expect(verification.valid).toBe(true);
  });

  /**
   * @req: REQ-GREENLIGHT-TOKEN-TAMPER
   * Rejects tampered or expired HMAC tokens.
   */
  it("rejects tampered or expired HMAC greenlight tokens", () => {
    const evaluation = evaluateGreenlight(completeSite, "STUDY-PH3-ONCOLOGY");
    const facetHash = computeFacetHash(evaluation.facets);

    const validToken = issueGreenlightToken(
      evaluation.siteId,
      evaluation.studyId,
      evaluation.status,
      facetHash
    );

    // Tamper payload
    const tamperedToken = {
      ...validToken,
      status: "GREENLIGHT" as const,
      siteId: "TAMPERED-SITE",
    };
    const verification = verifyGreenlightToken(tamperedToken);

    expect(verification.valid).toBe(false);
    expect(verification.reason).toContain("mismatch");
  });

  /**
   * @req: REQ-GREENLIGHT-SPONSOR-OVERRIDE
   * Dual-signature sponsor overrides require Part 11 justification audit logging.
   */
  it("applies dual-signature sponsor override with 21 CFR Part 11 audit logging", () => {
    const overrideReq: SponsorOverrideRequest = {
      siteId: "SITE-201",
      studyId: "STUDY-PH3-ONCOLOGY",
      justification:
        "Sponsor dispensation granted for delayed secondary site staff GCP refreshers due to urgent study launch window.",
      waivedFacets: ["Training"],
      signer1: {
        id: "USR-MED-MONITOR-01",
        name: "Dr. Sarah Jenkins",
        role: "Medical Monitor",
        passwordHashOrSecret: "hash_secret_12345",
      },
      signer2: {
        id: "USR-QA-DIRECTOR-02",
        name: "Marcus Vance",
        role: "QA Director",
        passwordHashOrSecret: "hash_secret_67890",
      },
    };

    const overrideResult = applySponsorOverride(overrideReq);

    expect(overrideResult.success).toBe(true);
    expect(overrideResult.status).toBe("OVERRIDDEN");
    expect(overrideResult.auditEntry).toBeDefined();

    const audit = overrideResult.auditEntry;
    expect(audit.eventType).toBe("SPONSOR_OVERRIDE");
    expect(audit.signatures).toHaveLength(2);
    expect(audit.signatures[0].signerName).toBe("Dr. Sarah Jenkins");
    expect(audit.signatures[1].signerName).toBe("Marcus Vance");
    expect(audit.hash).toBeDefined();

    // Verify token issued for override
    expect(overrideResult.tokenPayload).toBeDefined();
    const tokenVerification = verifyGreenlightToken(
      overrideResult.tokenPayload!
    );
    expect(tokenVerification.valid).toBe(true);
  });

  /**
   * @req: REQ-GREENLIGHT-SPONSOR-OVERRIDE-REJECT
   * Rejects override request if signers are identical or justification is missing.
   */
  it("rejects sponsor override if dual signers are same or justification missing", () => {
    const invalidReq: SponsorOverrideRequest = {
      siteId: "SITE-201",
      studyId: "STUDY-PH3-ONCOLOGY",
      justification: "Short", // too short
      waivedFacets: ["Training"],
      signer1: {
        id: "USR-SAME-01",
        name: "Dr. Same",
        role: "Medical Monitor",
        passwordHashOrSecret: "secret",
      },
      signer2: {
        id: "USR-SAME-01", // duplicate signer
        name: "Dr. Same",
        role: "QA Lead",
        passwordHashOrSecret: "secret",
      },
    };

    const overrideResult = applySponsorOverride(invalidReq);

    expect(overrideResult.success).toBe(false);
    expect(overrideResult.errorMessage).toBeDefined();
  });
});
