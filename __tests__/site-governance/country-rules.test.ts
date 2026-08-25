import { describe, it, expect } from "vitest";
import {
  evaluateCountryRules,
  COUNTRY_RULES_DEFINITION,
} from "../../lib/site-governance/country-rules";
import { SiteStartupData } from "../../lib/site-governance/types";

describe("Dynamic Country Rules Matrix", () => {
  const baseValidSite: SiteStartupData = {
    siteId: "SITE-101",
    siteName: "Johns Hopkins Medical Center",
    countryCode: "US",
    irbApprovalDate: "2026-01-15",
    irbExpirationDate: "2027-01-15",
    form1572Signed: true,
    ctaExecuted: true,
    ctaExecutionDate: "2026-02-01",
    doaSignedByPi: true,
    doaPiSignatureDate: "2026-02-05",
    trainingCompletionPercent: 100,
    ipReleaseAuthorized: true,
    ipReleaseDate: "2026-02-10",
    eIsfComplete: true,
  };

  /**
   * @req: REQ-COUNTRY-RULES-US
   * Verifies US statutory site startup requirements evaluation.
   */
  it("evaluates US site startup requirements accurately", () => {
    const result = evaluateCountryRules("US", baseValidSite);

    expect(result.jurisdiction).toBe("US");
    expect(result.isCompliant).toBe(true);
    expect(result.complianceScore).toBe(100);
    expect(result.missingRequirements).toHaveLength(0);
    expect(result.evaluatedRules).toHaveLength(
      COUNTRY_RULES_DEFINITION.US.length
    );
  });

  /**
   * @req: REQ-COUNTRY-RULES-US-FAILURE
   * Detects missing FDA Form 1572 and IRB approval for US site.
   */
  it("detects non-compliance when US statutory rules fail", () => {
    const incompleteSite: SiteStartupData = {
      ...baseValidSite,
      countryCode: "US",
      form1572Signed: false,
      irbApprovalDate: undefined,
    };

    const result = evaluateCountryRules("US", incompleteSite);

    expect(result.isCompliant).toBe(false);
    expect(result.missingRequirements.length).toBeGreaterThanOrEqual(2);
    expect(result.complianceScore).toBeLessThan(100);
  });

  /**
   * @req: REQ-COUNTRY-RULES-EU
   * Verifies EU CTIS and GDPR/CTA statutory evaluation.
   */
  it("evaluates EU CTIS and CTR 536/2014 requirements accurately", () => {
    const euSite: SiteStartupData = {
      ...baseValidSite,
      countryCode: "EU",
      euCtisRegistered: true,
    };

    const result = evaluateCountryRules("EU", euSite);

    expect(result.jurisdiction).toBe("EU");
    expect(result.isCompliant).toBe(true);
    expect(result.complianceScore).toBe(100);
  });

  /**
   * @req: REQ-COUNTRY-RULES-JP
   * Verifies Japanese PMDA notification and J-GCP statutory evaluation.
   */
  it("evaluates Japanese PMDA CTN and J-GCP requirements", () => {
    const jpSite: SiteStartupData = {
      ...baseValidSite,
      countryCode: "JP",
      pmdaNotificationFiled: true,
    };

    const result = evaluateCountryRules("JP", jpSite);

    expect(result.jurisdiction).toBe("JP");
    expect(result.isCompliant).toBe(true);
    expect(result.complianceScore).toBe(100);
  });

  /**
   * @req: REQ-COUNTRY-RULES-GB
   * Verifies UK MHRA and NHS REC statutory evaluation.
   */
  it("evaluates UK MHRA and NHS REC requirements", () => {
    const gbSite: SiteStartupData = {
      ...baseValidSite,
      countryCode: "GB",
      mhraApprovalReceived: true,
    };

    const result = evaluateCountryRules("GB", gbSite);

    expect(result.jurisdiction).toBe("GB");
    expect(result.isCompliant).toBe(true);
    expect(result.complianceScore).toBe(100);
  });

  /**
   * @req: REQ-COUNTRY-RULES-GLOBAL
   * Verifies Global ICH E6(R2/R3) GCP statutory fallback matrix.
   */
  it("falls back to Global ICH E6 rules for generic jurisdictions", () => {
    const globalSite: SiteStartupData = {
      ...baseValidSite,
      countryCode: "Global",
      mhraApprovalReceived: true,
    };

    const result = evaluateCountryRules("Global", globalSite);

    expect(result.jurisdiction).toBe("Global");
    expect(result.isCompliant).toBe(true);
  });
});
