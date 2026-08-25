import { describe, it, expect } from "vitest";
import {
  evaluateCountryRules,
  evaluateGreenlight,
  computeFacetHash,
  issueGreenlightToken,
  applySponsorOverride,
  verifyExecutionAccess,
  assertExecutionAllowed,
  SovereignGatekeeperException,
  InMemoryStoragePort,
  DualReadStorageAdapter,
  BinderSyncEngine,
  createInitialDOALog,
  addPersonnelDelegation,
  signDOALogByPI,
  revokePersonnelDelegation,
  verifyDOAAuditTrailIntegrity,
  exportDOALogToPdf,
} from "../../lib/site-governance";
import {
  SiteStartupData,
  SponsorOverrideRequest,
} from "../../lib/site-governance/types";

describe("Site Qualification, Regulatory Binders, and Delegation Governance - End-to-End Integration", () => {
  const studyId = "STUDY-PH3-ONCOLOGY-2026";
  const piCredentials = {
    id: "PI-JOHN-HOPKINS-01",
    name: "Dr. Eleanor Vance, MD",
    passwordHashOrSecret: "eleanor_secure_part11_secret",
  };

  /**
   * @req: REQ-INTEGRATION-E2E-GOVERNANCE
   * Executes full lifecycle: Startup Matrix -> 6-Facet Greenlight -> Execution Gatekeeper -> Sponsor Override -> eISF/eTMF Sync -> DOA Part 11 Log & PDF Export.
   */
  it("executes complete clinical site qualification and governance lifecycle seamlessly", async () => {
    // Step 1: Evaluate Country Rules Matrix (US Jurisdiction)
    const siteData: SiteStartupData = {
      siteId: "SITE-US-707",
      siteName: "Johns Hopkins Oncology Center",
      countryCode: "US",
      irbApprovalDate: "2026-01-10",
      irbExpirationDate: "2027-01-10",
      form1572Signed: true,
      ctaExecuted: true,
      ctaExecutionDate: "2026-01-15",
      eIsfComplete: false,
      eIsfMissingDocuments: ["Pending Monitoring Plan Sign-off"],
      doaSignedByPi: true,
      doaPiSignatureDate: "2026-01-18",
      trainingCompletionPercent: 100,
      ipReleaseAuthorized: true,
    };

    const countryResult = evaluateCountryRules("US", siteData);
    expect(countryResult.isCompliant).toBe(true); // US mandatory rules pass

    // Step 2: Evaluate 6-Facet Operational Readiness
    const greenlightEval = evaluateGreenlight(siteData, studyId);
    expect(greenlightEval.status).toBe("BLOCKED"); // Training incomplete -> BLOCKED
    expect(greenlightEval.isExecutionPermitted).toBe(false);

    const blockedToken = issueGreenlightToken(
      greenlightEval.siteId,
      greenlightEval.studyId,
      greenlightEval.status,
      computeFacetHash(greenlightEval.facets)
    );

    // Step 3: Test Execution Gatekeeper on BLOCKED site -> Subject Randomization and eCRF Write Denied
    const gatekeeperBlockedCheck = verifyExecutionAccess({
      siteId: siteData.siteId,
      action: "SUBJECT_RANDOMIZATION",
      tokenPayload: blockedToken,
    });
    expect(gatekeeperBlockedCheck.allowed).toBe(false);
    expect(gatekeeperBlockedCheck.violationCode).toBe(
      "GATEKEEPER_SITE_NOT_GREENLIT"
    );

    expect(() => {
      assertExecutionAllowed(
        siteData.siteId,
        "ECRF_WRITE_ACCESS",
        blockedToken
      );
    }).toThrow(SovereignGatekeeperException);

    // Step 4: Apply Dual-Signature Sponsor Override with Part 11 Audit Logging
    const overrideReq: SponsorOverrideRequest = {
      siteId: siteData.siteId,
      studyId,
      justification:
        "Sponsor Medical Monitor and QA Director approved temporary waiver for secondary lab tech GCP refresher completion.",
      waivedFacets: ["Training"],
      signer1: {
        id: "SPONSOR-MM-01",
        name: "Dr. Arthur Pendelton",
        role: "Medical Monitor",
        passwordHashOrSecret: "mm_secret_part11",
      },
      signer2: {
        id: "SPONSOR-QA-02",
        name: "Samantha Wright",
        role: "QA Director",
        passwordHashOrSecret: "qa_secret_part11",
      },
    };

    const overrideResult = applySponsorOverride(overrideReq);
    expect(overrideResult.success).toBe(true);
    expect(overrideResult.status).toBe("OVERRIDDEN");
    expect(overrideResult.auditEntry.signatures).toHaveLength(2);

    const overrideToken = overrideResult.tokenPayload!;

    // Step 5: Test Execution Gatekeeper with OVERRIDDEN token -> Access Granted
    const gatekeeperOverrideCheck = verifyExecutionAccess({
      siteId: siteData.siteId,
      action: "SUBJECT_RANDOMIZATION",
      tokenPayload: overrideToken,
    });
    expect(gatekeeperOverrideCheck.allowed).toBe(true);
    expect(gatekeeperOverrideCheck.status).toBe("OVERRIDDEN");

    // Step 6: Regulatory Binders (eISF Sections 1-7 <-> eTMF DIA Zones 1-10) and CRA QC Staging
    const primaryPort = new InMemoryStoragePort("Primary-S3");
    const secondaryPort = new InMemoryStoragePort("Secondary-Vault");
    const adapter = new DualReadStorageAdapter(primaryPort, secondaryPort);
    const syncEngine = new BinderSyncEngine(adapter);

    const stagedDoc = await syncEngine.stageDocumentForQC({
      id: "BINDER-DOC-1572",
      title: "FDA Form 1572 Statement of Investigator",
      eisfSection: 1, // Section 1 Regulatory & Approvals
      siteId: siteData.siteId,
      studyId,
      content: "Form 1572 PDF Data",
      version: "1.0",
      uploadedBy: "PI Dr. Eleanor Vance",
      uploadedAt: new Date().toISOString(),
    });

    expect(stagedDoc.qcStatus).toBe("QC_PENDING");
    expect(stagedDoc.etmfZone).toBe(3); // Maps to DIA Zone 3 Regulatory

    const approvedDoc = await syncEngine.approveQC(
      "BINDER-DOC-1572",
      "CRA-SARAH-01"
    );
    expect(approvedDoc.qcStatus).toBe("QC_APPROVED");

    const syncedDoc = await syncEngine.syncToETMF("BINDER-DOC-1572");
    expect(syncedDoc.qcStatus).toBe("SYNCED_TO_ETMF");

    // Step 7: PI Delegation of Authority (DOA) Log & Part 11 Signature
    let doaLog = createInitialDOALog(
      siteData.siteId,
      siteData.siteName,
      studyId,
      piCredentials.name,
      "evance@jhmi.edu"
    );

    doaLog = addPersonnelDelegation(
      doaLog,
      {
        name: "Dr. Marcus Brody, MD",
        role: "Sub-Investigator",
        email: "mbrody@jhmi.edu",
        delegatedTaskCodes: [
          "CONSENT",
          "PHYSICAL_EXAM",
          "CRF_ENTRY",
          "ELIGIBILITY_VERIFICATION",
        ],
        startDate: "2026-01-18",
      },
      {
        id: "COORD-01",
        name: "Coordinator Lisa",
        role: "Clinical Research Coordinator",
      }
    );

    doaLog = signDOALogByPI(
      doaLog,
      piCredentials,
      "PI electronic sign-off of initial delegation log"
    );
    expect(doaLog.status).toBe("PI_SIGNED");
    expect(doaLog.piSignature).toBeDefined();

    // Revoke Sub-Investigator delegation
    const personnelId = doaLog.personnel[0].id;
    doaLog = revokePersonnelDelegation(
      doaLog,
      personnelId,
      piCredentials,
      "Sub-I transferred to another study"
    );
    expect(doaLog.personnel[0].status).toBe("REVOKED");

    // Verify Audit Trail Integrity
    const integrity = verifyDOAAuditTrailIntegrity(doaLog);
    expect(integrity.valid).toBe(true);

    // Step 8: Generate Certified Part 11 PDF Export
    const pdfExport = await exportDOALogToPdf(doaLog);
    expect(pdfExport).toBeDefined();
    expect(pdfExport.byteLength).toBeGreaterThan(1000);
  });
});
