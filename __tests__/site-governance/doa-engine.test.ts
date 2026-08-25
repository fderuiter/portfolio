import { describe, it, expect } from "vitest";
import {
  createInitialDOALog,
  addPersonnelDelegation,
  signDOALogByPI,
  revokePersonnelDelegation,
  verifyDOAAuditTrailIntegrity,
  exportDOALogToPdf,
} from "../../lib/site-governance/doa-engine";

describe("Principal Investigator Electronic Delegation of Authority (DOA) Log", () => {
  const piCredentials = {
    id: "PI-USER-001",
    name: "Dr. Robert Vance, MD",
    passwordHashOrSecret: "pi_secure_passcode_2026",
  };

  /**
   * @req: REQ-DOA-DELEGATIONS
   * Manages staff task delegations and maintains chronological audit history.
   */
  it("creates DOA log, adds staff delegations, and verifies audit trail entries", () => {
    let log = createInitialDOALog(
      "SITE-501",
      "Stanford Medical Center",
      "STUDY-PH3-CARDIOLOGY",
      piCredentials.name,
      "rvance@stanford.edu"
    );

    expect(log.status).toBe("DRAFT");
    expect(log.personnel).toHaveLength(0);

    // Add Sub-Investigator
    log = addPersonnelDelegation(
      log,
      {
        name: "Dr. Emily Zhang, MD",
        role: "Sub-Investigator",
        email: "ezhang@stanford.edu",
        delegatedTaskCodes: [
          "CONSENT",
          "PHYSICAL_EXAM",
          "CRF_ENTRY",
          "ELIGIBILITY_VERIFICATION",
        ],
        startDate: "2026-02-01",
      },
      { id: "COORD-01", name: "Coordinator Mark", role: "Study Coordinator" }
    );

    // Add Research Nurse
    log = addPersonnelDelegation(
      log,
      {
        name: "Sarah Miller, RN",
        role: "Research Nurse",
        email: "smiller@stanford.edu",
        delegatedTaskCodes: ["CONSENT", "IP_ADMIN", "LAB_SAMPLES", "CRF_ENTRY"],
        startDate: "2026-02-01",
      },
      { id: "COORD-01", name: "Coordinator Mark", role: "Study Coordinator" }
    );

    expect(log.personnel).toHaveLength(2);
    expect(log.status).toBe("AMENDED");
    expect(log.auditTrail).toHaveLength(2);

    // Verify hash chain
    const integrity = verifyDOAAuditTrailIntegrity(log);
    expect(integrity.valid).toBe(true);
  });

  /**
   * @req: REQ-DOA-PART11-SIGNOFF
   * Executes PI 21 CFR Part 11 electronic signature sign-off.
   */
  it("executes Principal Investigator Part 11 electronic signature sign-off", () => {
    let log = createInitialDOALog(
      "SITE-501",
      "Stanford Medical Center",
      "STUDY-PH3-CARDIOLOGY",
      piCredentials.name,
      "rvance@stanford.edu"
    );

    log = addPersonnelDelegation(
      log,
      {
        name: "Dr. Emily Zhang, MD",
        role: "Sub-Investigator",
        email: "ezhang@stanford.edu",
        delegatedTaskCodes: ["CONSENT", "PHYSICAL_EXAM"],
        startDate: "2026-02-01",
      },
      { id: "COORD-01", name: "Coordinator Mark", role: "Study Coordinator" }
    );

    // PI Sign-off
    log = signDOALogByPI(
      log,
      piCredentials,
      "Principal Investigator formal approval of delegation log"
    );

    expect(log.status).toBe("PI_SIGNED");
    expect(log.piSignature).toBeDefined();
    expect(log.piSignature?.signerName).toBe("Dr. Robert Vance, MD");
    expect(log.piSignature?.digest).toBeDefined();

    // Verify personnel updated to ACTIVE
    expect(log.personnel[0].status).toBe("ACTIVE");
    expect(log.personnel[0].signedByPi).toBe(true);

    const integrity = verifyDOAAuditTrailIntegrity(log);
    expect(integrity.valid).toBe(true);
  });

  /**
   * @req: REQ-DOA-REVOCATION
   * Revokes staff task delegation and records Part 11 justification.
   */
  it("revokes staff task delegation with Part 11 justification logging", () => {
    let log = createInitialDOALog(
      "SITE-501",
      "Stanford Medical Center",
      "STUDY-PH3-CARDIOLOGY",
      piCredentials.name,
      "rvance@stanford.edu"
    );

    log = addPersonnelDelegation(
      log,
      {
        name: "Dr. Emily Zhang, MD",
        role: "Sub-Investigator",
        email: "ezhang@stanford.edu",
        delegatedTaskCodes: ["CONSENT", "PHYSICAL_EXAM"],
        startDate: "2026-02-01",
      },
      { id: "COORD-01", name: "Coordinator Mark", role: "Study Coordinator" }
    );

    log = signDOALogByPI(log, piCredentials);

    const personnelId = log.personnel[0].id;

    // Revoke
    log = revokePersonnelDelegation(
      log,
      personnelId,
      piCredentials,
      "Staff member transferred to another department"
    );

    expect(log.personnel[0].status).toBe("REVOKED");
    expect(log.personnel[0].revocationReason).toBe(
      "Staff member transferred to another department"
    );

    const integrity = verifyDOAAuditTrailIntegrity(log);
    expect(integrity.valid).toBe(true);
  });

  /**
   * @req: REQ-DOA-PDF-EXPORT
   * Generates certified Part 11 PDF export.
   */
  it("generates certified 21 CFR Part 11 DOA log PDF export", async () => {
    let log = createInitialDOALog(
      "SITE-501",
      "Stanford Medical Center",
      "STUDY-PH3-CARDIOLOGY",
      piCredentials.name,
      "rvance@stanford.edu"
    );

    log = addPersonnelDelegation(
      log,
      {
        name: "Dr. Emily Zhang, MD",
        role: "Sub-Investigator",
        email: "ezhang@stanford.edu",
        delegatedTaskCodes: ["CONSENT", "PHYSICAL_EXAM", "CRF_ENTRY"],
        startDate: "2026-02-01",
      },
      { id: "COORD-01", name: "Coordinator Mark", role: "Study Coordinator" }
    );

    log = signDOALogByPI(log, piCredentials);

    const pdfBuffer = await exportDOALogToPdf(log);

    expect(pdfBuffer).toBeDefined();
    expect(pdfBuffer.byteLength).toBeGreaterThan(1000); // PDF contains header, tables, signature certificate
  });
});
