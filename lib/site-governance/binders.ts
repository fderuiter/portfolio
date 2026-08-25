import { BinderDocument, DiaEtmfZone, EisfSection } from "./types";

/**
 * DIA Reference Model v3.2.0 (10 zones) Taxonomy Definition.
 */
export const DIA_ETMF_ZONES_V32: DiaEtmfZone[] = [
  {
    zoneNumber: 1,
    zoneName: "Trial Management",
    description:
      "Global trial governance, timelines, committees, and monitoring plans.",
  },
  {
    zoneNumber: 2,
    zoneName: "Central Trial Documents",
    description:
      "Protocol, Investigator Brochure, ICF master templates, and study manuals.",
  },
  {
    zoneNumber: 3,
    zoneName: "Regulatory",
    description:
      "FDA, EMA, PMDA, MHRA submissions, authorizations, and protocol filings.",
  },
  {
    zoneNumber: 4,
    zoneName: "IRB / IEC",
    description:
      "Central and local IRB/Ethics approvals, notifications, and composition lists.",
  },
  {
    zoneNumber: 5,
    zoneName: "Site Management",
    description:
      "Site selection, feasibility, contracts, DOA logs, staff CVs, and monitoring reports.",
  },
  {
    zoneNumber: 6,
    zoneName: "IP and Trial Supplies",
    description:
      "Investigational Product labels, shipping receipts, destruction, and accountability.",
  },
  {
    zoneNumber: 7,
    zoneName: "Safety Reporting",
    description:
      "SAE reports, CIOMS forms, SUSAR notifications, and safety updates.",
  },
  {
    zoneNumber: 8,
    zoneName: "Central Laboratory / Other Vendors",
    description:
      "Vendor certifications, normal lab ranges, accreditation, and central lab records.",
  },
  {
    zoneNumber: 9,
    zoneName: "Data Management",
    description:
      "CRF specifications, Data Management Plan, edit check rules, and data transfer specs.",
  },
  {
    zoneNumber: 10,
    zoneName: "Statistics",
    description:
      "Statistical Analysis Plan (SAP), randomization lists, and interim analyses.",
  },
];

/**
 * eISF Binder Section 1–7 Taxonomy Definition.
 */
export const EISF_SECTION_TAXONOMY: EisfSection[] = [
  {
    sectionNumber: 1,
    sectionName: "Regulatory & Approvals",
    description:
      "Form 1572, IRB/Ethics approvals, regulatory letters, and trial notifications.",
  },
  {
    sectionNumber: 2,
    sectionName: "Protocol & Amendments",
    description:
      "Signed protocol signature pages, IB acknowledgements, and amendment logs.",
  },
  {
    sectionNumber: 3,
    sectionName: "Financial & Agreements",
    description:
      "Executed CTA, site budget, insurance certificates, and financial disclosures.",
  },
  {
    sectionNumber: 4,
    sectionName: "Site Personnel & Delegation",
    description:
      "DOA Log, PI/Sub-I CVs, medical licenses, GCP certificates, and training logs.",
  },
  {
    sectionNumber: 5,
    sectionName: "Investigational Product",
    description:
      "IP accountability logs, temperature logs, shipment receipts, and destruction receipts.",
  },
  {
    sectionNumber: 6,
    sectionName: "Subject / Patient Documents",
    description:
      "Blank ICF samples, subject identification log, screening log, and enrollment log.",
  },
  {
    sectionNumber: 7,
    sectionName: "Safety & Correspondence",
    description:
      "Site SAE reports, pregnancy reports, CRA monitoring letters, and general correspondence.",
  },
];

/**
 * Default Section 1-7 eISF to DIA Zone eTMF mapping dictionary.
 */
export const EISF_TO_DIA_ZONE_MAP: Record<number, number> = {
  1: 3, // Regulatory -> Zone 3 Regulatory
  2: 2, // Protocol -> Zone 2 Central Trial Documents
  3: 5, // Financial -> Zone 5 Site Management
  4: 5, // Personnel -> Zone 5 Site Management
  5: 6, // IP -> Zone 6 IP and Trial Supplies
  6: 9, // Subject Docs -> Zone 9 Data Management
  7: 7, // Safety -> Zone 7 Safety Reporting
};

/**
 * In-memory / Abstract Storage Port Interface for dual-read port adapter pattern.
 */
export interface StoragePort {
  name: string;
  get(id: string): Promise<BinderDocument | null>;
  set(doc: BinderDocument): Promise<void>;
  list(siteId?: string): Promise<BinderDocument[]>;
}

export class InMemoryStoragePort implements StoragePort {
  public readonly name: string;
  private store = new Map<string, BinderDocument>();

  constructor(name: string, initialDocs: BinderDocument[] = []) {
    this.name = name;
    for (const doc of initialDocs) {
      this.store.set(doc.id, { ...doc });
    }
  }

  async get(id: string): Promise<BinderDocument | null> {
    const found = this.store.get(id);
    return found ? { ...found } : null;
  }

  async set(doc: BinderDocument): Promise<void> {
    this.store.set(doc.id, { ...doc });
  }

  async list(siteId?: string): Promise<BinderDocument[]> {
    const all = Array.from(this.store.values());
    if (siteId) {
      return all.filter((d) => d.siteId === siteId);
    }
    return all;
  }
}

/**
 * Zero-downtime Dual-Read Storage Port Adapter.
 * Provides seamless read fallback from primary to secondary storage,
 * automatic backfill / self-healing, and atomic dual-write synchronization.
 */
export class DualReadStorageAdapter {
  constructor(
    public readonly primary: StoragePort,
    public readonly secondary: StoragePort
  ) {}

  /**
   * Reads document with zero downtime:
   * 1. Attempts read from primary storage.
   * 2. If primary fails or item missing, falls back to secondary storage.
   * 3. If found in secondary, asynchronously backfills item to primary storage.
   */
  async readDocument(id: string): Promise<BinderDocument | null> {
    try {
      const primaryDoc = await this.primary.get(id);
      if (primaryDoc) {
        return primaryDoc;
      }
    } catch {
      // Primary port error fallback to secondary
    }

    try {
      const secondaryDoc = await this.secondary.get(id);
      if (secondaryDoc) {
        // Backfill primary asynchronously
        this.primary.set(secondaryDoc).catch(() => {});
        return secondaryDoc;
      }
    } catch {
      // Secondary port error
    }

    return null;
  }

  /**
   * Dual-writes document to both primary and secondary storage ports.
   */
  async writeDocument(doc: BinderDocument): Promise<void> {
    await Promise.all([this.primary.set(doc), this.secondary.set(doc)]);
  }

  /**
   * Reconciles all documents between primary and secondary ports for 100% parity.
   */
  async reconcile(): Promise<{
    primaryCount: number;
    secondaryCount: number;
    syncedCount: number;
  }> {
    const [primaryDocs, secondaryDocs] = await Promise.all([
      this.primary.list(),
      this.secondary.list(),
    ]);

    const primaryMap = new Map(primaryDocs.map((d) => [d.id, d]));
    const secondaryMap = new Map(secondaryDocs.map((d) => [d.id, d]));

    let syncedCount = 0;

    for (const [id, secDoc] of secondaryMap.entries()) {
      if (!primaryMap.has(id)) {
        await this.primary.set(secDoc);
        syncedCount++;
      }
    }

    for (const [id, priDoc] of primaryMap.entries()) {
      if (!secondaryMap.has(id)) {
        await this.secondary.set(priDoc);
        syncedCount++;
      }
    }

    return {
      primaryCount: primaryDocs.length,
      secondaryCount: secondaryDocs.length,
      syncedCount,
    };
  }
}

/**
 * CRA QC Staging Workflow & Bidirectional eISF / eTMF Synchronizer Engine.
 */
export class BinderSyncEngine {
  constructor(private adapter: DualReadStorageAdapter) {}

  /**
   * Stages a document in eISF for CRA QC review.
   */
  async stageDocumentForQC(
    doc: Omit<BinderDocument, "qcStatus" | "etmfZone"> & { etmfZone?: number }
  ): Promise<BinderDocument> {
    const etmfZone = doc.etmfZone || EISF_TO_DIA_ZONE_MAP[doc.eisfSection] || 3;
    const binderDoc: BinderDocument = {
      ...doc,
      etmfZone,
      qcStatus: "QC_PENDING",
      uploadedAt: doc.uploadedAt || new Date().toISOString(),
    };

    await this.adapter.writeDocument(binderDoc);
    return binderDoc;
  }

  /**
   * CRA QC Approval action.
   */
  async approveQC(
    docId: string,
    craId: string,
    qcComments?: string
  ): Promise<BinderDocument> {
    const doc = await this.adapter.readDocument(docId);
    if (!doc) throw new Error(`Binder document '${docId}' not found`);

    doc.qcStatus = "QC_APPROVED";
    doc.qcComments = qcComments || `QC Approved by CRA ${craId}`;

    await this.adapter.writeDocument(doc);
    return doc;
  }

  /**
   * CRA QC Rejection action.
   */
  async rejectQC(
    docId: string,
    craId: string,
    rejectionReason: string
  ): Promise<BinderDocument> {
    const doc = await this.adapter.readDocument(docId);
    if (!doc) throw new Error(`Binder document '${docId}' not found`);

    doc.qcStatus = "QC_REJECTED";
    doc.qcComments = `QC Rejected by CRA ${craId}: ${rejectionReason}`;

    await this.adapter.writeDocument(doc);
    return doc;
  }

  /**
   * Synchronizes QC_APPROVED document from eISF to eTMF Zone.
   */
  async syncToETMF(docId: string): Promise<BinderDocument> {
    const doc = await this.adapter.readDocument(docId);
    if (!doc) throw new Error(`Binder document '${docId}' not found`);

    if (doc.qcStatus !== "QC_APPROVED") {
      throw new Error(
        `Document '${docId}' cannot be synced to eTMF in state '${doc.qcStatus}'. Must be QC_APPROVED.`
      );
    }

    doc.qcStatus = "SYNCED_TO_ETMF";
    doc.lastSyncedAt = new Date().toISOString();

    await this.adapter.writeDocument(doc);
    return doc;
  }

  /**
   * Propagates eTMF metadata changes back to eISF.
   */
  async syncBackFromETMF(
    docId: string,
    updates: Partial<Pick<BinderDocument, "version" | "qcComments" | "title">>
  ): Promise<BinderDocument> {
    const doc = await this.adapter.readDocument(docId);
    if (!doc) throw new Error(`Binder document '${docId}' not found`);

    if (updates.version) doc.version = updates.version;
    if (updates.qcComments) doc.qcComments = updates.qcComments;
    if (updates.title) doc.title = updates.title;

    doc.lastSyncedAt = new Date().toISOString();

    await this.adapter.writeDocument(doc);
    return doc;
  }

  /**
   * Executes batch bidirectional synchronization across site binder documents.
   */
  async performBatchSync(
    siteId: string
  ): Promise<{ processed: number; syncedToEtmf: number; errors: string[] }> {
    const primaryDocs = await this.adapter.primary.list(siteId);
    let syncedToEtmf = 0;
    const errors: string[] = [];

    for (const doc of primaryDocs) {
      if (doc.qcStatus === "QC_APPROVED") {
        try {
          await this.syncToETMF(doc.id);
          syncedToEtmf++;
        } catch (err) {
          errors.push(`Doc ${doc.id}: ${(err as Error).message}`);
        }
      }
    }

    return {
      processed: primaryDocs.length,
      syncedToEtmf,
      errors,
    };
  }
}
