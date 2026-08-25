import { describe, it, expect } from "vitest";
import {
  DIA_ETMF_ZONES_V32,
  EISF_SECTION_TAXONOMY,
  EISF_TO_DIA_ZONE_MAP,
  InMemoryStoragePort,
  DualReadStorageAdapter,
  BinderSyncEngine,
} from "../../lib/site-governance/binders";
import { BinderDocument } from "../../lib/site-governance/types";

describe("Regulatory Binders: DIA v3.2.0, eISF 1-7, Dual-Read & CRA QC Sync", () => {
  /**
   * @req: REQ-BINDER-TAXONOMY
   * Asserts DIA Reference Model v3.2.0 (10 zones) and Section 1–7 eISF binder taxonomy definitions.
   */
  it("verifies DIA Reference Model v3.2.0 (10 zones) and Section 1-7 eISF binder taxonomy", () => {
    expect(DIA_ETMF_ZONES_V32).toHaveLength(10);
    expect(EISF_SECTION_TAXONOMY).toHaveLength(7);

    // Verify Zone 1 through 10
    expect(DIA_ETMF_ZONES_V32[0].zoneName).toBe("Trial Management");
    expect(DIA_ETMF_ZONES_V32[9].zoneName).toBe("Statistics");

    // Verify Section 1 through 7
    expect(EISF_SECTION_TAXONOMY[0].sectionName).toBe("Regulatory & Approvals");
    expect(EISF_SECTION_TAXONOMY[6].sectionName).toBe(
      "Safety & Correspondence"
    );

    // Verify mapping
    expect(EISF_TO_DIA_ZONE_MAP[1]).toBe(3); // Regulatory -> Zone 3
    expect(EISF_TO_DIA_ZONE_MAP[5]).toBe(6); // IP -> Zone 6
  });

  /**
   * @req: REQ-BINDER-DUAL-READ
   * Tests zero-downtime dual-read storage port adapter fallback and self-healing backfill.
   */
  it("executes zero-downtime dual-read storage port adapter fallback and primary self-healing", async () => {
    const docInSecondaryOnly: BinderDocument = {
      id: "DOC-FALLBACK-001",
      title: "FDA Form 1572 Signed",
      eisfSection: 1,
      etmfZone: 3,
      siteId: "SITE-401",
      studyId: "STUDY-PH3",
      qcStatus: "QC_APPROVED",
      content: "Form 1572 PDF payload",
      version: "1.0",
      uploadedBy: "PI Dr. Smith",
      uploadedAt: new Date().toISOString(),
    };

    const primaryPort = new InMemoryStoragePort("Primary-S3");
    const secondaryPort = new InMemoryStoragePort("Secondary-Vault", [
      docInSecondaryOnly,
    ]);

    const adapter = new DualReadStorageAdapter(primaryPort, secondaryPort);

    // Primary initially does NOT have document
    expect(await primaryPort.get("DOC-FALLBACK-001")).toBeNull();

    // Read through dual-read adapter -> falls back to secondary and triggers primary backfill
    const fetchedDoc = await adapter.readDocument("DOC-FALLBACK-001");
    expect(fetchedDoc).not.toBeNull();
    expect(fetchedDoc?.title).toBe("FDA Form 1572 Signed");

    // Give microtask queue time to complete async primary backfill
    await new Promise((resolve) => setTimeout(resolve, 20));

    // Assert primary port is now healed with document
    const primaryHealed = await primaryPort.get("DOC-FALLBACK-001");
    expect(primaryHealed).not.toBeNull();
    expect(primaryHealed?.id).toBe("DOC-FALLBACK-001");
  });

  /**
   * @req: REQ-BINDER-CRA-QC-WORKFLOW
   * Tests CRA QC staging workflow: DRAFT -> QC_PENDING -> QC_APPROVED -> SYNCED_TO_ETMF.
   */
  it("runs CRA QC staging workflow and synchronizes bidirectionally with eTMF", async () => {
    const primaryPort = new InMemoryStoragePort("Primary-S3");
    const secondaryPort = new InMemoryStoragePort("Secondary-Vault");
    const adapter = new DualReadStorageAdapter(primaryPort, secondaryPort);
    const syncEngine = new BinderSyncEngine(adapter);

    // 1. Stage document for CRA QC
    const stagedDoc = await syncEngine.stageDocumentForQC({
      id: "DOC-CTA-101",
      title: "Clinical Trial Agreement Executed",
      eisfSection: 3,
      siteId: "SITE-401",
      studyId: "STUDY-PH3",
      content: "CTA Contract Content",
      version: "1.0",
      uploadedBy: "CRA Sarah",
      uploadedAt: new Date().toISOString(),
    });

    expect(stagedDoc.qcStatus).toBe("QC_PENDING");
    expect(stagedDoc.etmfZone).toBe(5); // Section 3 maps to Zone 5 Site Management

    // 2. CRA approves QC
    const approvedDoc = await syncEngine.approveQC(
      "DOC-CTA-101",
      "CRA-USER-99",
      "CTA fully executed and verified"
    );
    expect(approvedDoc.qcStatus).toBe("QC_APPROVED");

    // 3. Sync to eTMF Zone 5
    const syncedDoc = await syncEngine.syncToETMF("DOC-CTA-101");
    expect(syncedDoc.qcStatus).toBe("SYNCED_TO_ETMF");
    expect(syncedDoc.lastSyncedAt).toBeDefined();

    // 4. Propagate eTMF status update back to eISF
    const updatedDoc = await syncEngine.syncBackFromETMF("DOC-CTA-101", {
      version: "1.1-eTMF-Archived",
      qcComments: "Archived in eTMF Vault Zone 5",
    });

    expect(updatedDoc.version).toBe("1.1-eTMF-Archived");
    expect(updatedDoc.qcComments).toBe("Archived in eTMF Vault Zone 5");
  });
});
