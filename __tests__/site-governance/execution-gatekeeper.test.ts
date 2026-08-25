import { describe, it, expect } from "vitest";
import {
  verifyExecutionAccess,
  assertExecutionAllowed,
  SovereignGatekeeperException,
} from "../../lib/site-governance/execution-gatekeeper";
import { issueGreenlightToken } from "../../lib/site-governance/greenlight-engine";

describe("Sovereign Site Execution Gatekeeper Middleware", () => {
  const greenlightToken = issueGreenlightToken(
    "SITE-301",
    "STUDY-PH3-VACCINE",
    "GREENLIGHT",
    "FACET_HASH_123"
  );

  const blockedToken = issueGreenlightToken(
    "SITE-301",
    "STUDY-PH3-VACCINE",
    "BLOCKED",
    "FACET_HASH_456"
  );

  const overriddenToken = issueGreenlightToken(
    "SITE-301",
    "STUDY-PH3-VACCINE",
    "OVERRIDDEN",
    "FACET_HASH_789"
  );

  /**
   * @req: REQ-GATEKEEPER-ALLOW-WRITE
   * Permits randomization and eCRF write access on greenlit sites.
   */
  it("permits subject randomization and eCRF write access on greenlit sites", () => {
    const resRandomization = verifyExecutionAccess({
      siteId: "SITE-301",
      action: "SUBJECT_RANDOMIZATION",
      tokenPayload: greenlightToken,
    });

    const resWriteAccess = verifyExecutionAccess({
      siteId: "SITE-301",
      action: "ECRF_WRITE_ACCESS",
      tokenPayload: greenlightToken,
    });

    expect(resRandomization.allowed).toBe(true);
    expect(resWriteAccess.allowed).toBe(true);
    expect(resRandomization.status).toBe("GREENLIGHT");
  });

  /**
   * @req: REQ-GATEKEEPER-ALLOW-OVERRIDDEN
   * Permits execution access on sponsor-overridden sites.
   */
  it("permits execution access on sponsor-overridden sites", () => {
    const res = verifyExecutionAccess({
      siteId: "SITE-301",
      action: "SUBJECT_ENROLLMENT",
      tokenPayload: overriddenToken,
    });

    expect(res.allowed).toBe(true);
    expect(res.status).toBe("OVERRIDDEN");
  });

  /**
   * @req: REQ-GATEKEEPER-BLOCK-WRITE
   * Denies subject randomization and eCRF write access on blocked sites.
   */
  it("denies subject randomization and eCRF write access on blocked sites", () => {
    const resRandomization = verifyExecutionAccess({
      siteId: "SITE-301",
      action: "SUBJECT_RANDOMIZATION",
      tokenPayload: blockedToken,
    });

    expect(resRandomization.allowed).toBe(false);
    expect(resRandomization.violationCode).toBe("GATEKEEPER_SITE_NOT_GREENLIT");
    expect(resRandomization.reason).toContain("BLOCKED");
  });

  /**
   * @req: REQ-GATEKEEPER-DENY-MISSING-TOKEN
   * Denies execution access when Greenlight HMAC token is missing.
   */
  it("denies access when Greenlight HMAC token is missing", () => {
    const res = verifyExecutionAccess({
      siteId: "SITE-301",
      action: "ECRF_WRITE_ACCESS",
      tokenPayload: undefined,
    });

    expect(res.allowed).toBe(false);
    expect(res.violationCode).toBe("MISSING_GREENLIGHT_TOKEN");
  });

  /**
   * @req: REQ-GATEKEEPER-EXCEPTION
   * Throws SovereignGatekeeperException when asserting access on non-greenlight sites.
   */
  it("throws SovereignGatekeeperException on blocked access assertion", () => {
    expect(() => {
      assertExecutionAllowed("SITE-301", "SUBJECT_RANDOMIZATION", blockedToken);
    }).toThrow(SovereignGatekeeperException);
  });
});
