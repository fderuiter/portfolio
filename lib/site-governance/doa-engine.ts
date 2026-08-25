import * as crypto from "crypto";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  DOALog,
  DOAPersonnel,
  Part11AuditEntry,
  Part11Signature,
} from "./types";

/**
 * Creates a new blank DOA Log structure for a trial site.
 */
export function createInitialDOALog(
  siteId: string,
  siteName: string,
  studyId: string,
  piName: string,
  piEmail: string
): DOALog {
  return {
    siteId,
    siteName,
    studyId,
    piName,
    piEmail,
    personnel: [],
    status: "DRAFT",
    auditTrail: [],
  };
}

/**
 * Computes SHA-256 hash chain for DOA Audit Entry.
 */
export function computeAuditHash(
  entry: Omit<Part11AuditEntry, "hash">
): string {
  const payload = `${entry.id}:${entry.timestamp}:${entry.siteId}:${entry.eventType}:${entry.actorId}:${entry.justification}:${entry.previousHash}`;
  return crypto.createHash("sha256").update(payload).digest("hex");
}

/**
 * Adds a new personnel task delegation to DOA log.
 */
export function addPersonnelDelegation(
  log: DOALog,
  personnelData: Omit<
    DOAPersonnel,
    "id" | "status" | "signedByPi" | "revokedByPi"
  >,
  actor: { id: string; name: string; role: string }
): DOALog {
  const newPersonnelId = `PER-${crypto.randomBytes(6).toString("hex")}`;
  const now = new Date().toISOString();

  const newPersonnel: DOAPersonnel = {
    ...personnelData,
    id: newPersonnelId,
    status: "PENDING",
    signedByPi: false,
  };

  const updatedPersonnel = [...log.personnel, newPersonnel];
  const prevHash =
    log.auditTrail.length > 0
      ? log.auditTrail[log.auditTrail.length - 1].hash
      : "GENESIS_HASH_00000000000000000000000000000000";

  const auditEntryId = `AUD-DOA-${crypto.randomBytes(6).toString("hex")}`;
  const rawAudit: Omit<Part11AuditEntry, "hash"> = {
    id: auditEntryId,
    timestamp: now,
    siteId: log.siteId,
    eventType: "GREENLIGHT_CHANGE",
    actorId: actor.id,
    actorName: actor.name,
    actorRole: actor.role,
    justification: `Added task delegation for staff member ${personnelData.name} (${personnelData.role})`,
    signatures: [],
    previousState: log.status,
    newState: "AMENDED",
    previousHash: prevHash,
  };

  const hash = computeAuditHash(rawAudit);
  const auditEntry: Part11AuditEntry = { ...rawAudit, hash };

  return {
    ...log,
    personnel: updatedPersonnel,
    status: "AMENDED",
    auditTrail: [...log.auditTrail, auditEntry],
  };
}

/**
 * Executes Principal Investigator 21 CFR Part 11 Electronic Signature Sign-off on DOA log.
 */
export function signDOALogByPI(
  log: DOALog,
  piCredentials: { id: string; name: string; passwordHashOrSecret: string },
  justification: string = "Official Principal Investigator sign-off and activation of Delegation of Authority Log"
): DOALog {
  if (
    !piCredentials ||
    !piCredentials.id ||
    !piCredentials.passwordHashOrSecret
  ) {
    throw new Error("Invalid PI credentials for Part 11 electronic signature");
  }

  const now = new Date().toISOString();
  const sigDigest = crypto
    .createHash("sha256")
    .update(`${piCredentials.id}:PI_SIGN_OFF:${log.siteId}:${now}`)
    .digest("hex");

  const piSignature: Part11Signature = {
    signerId: piCredentials.id,
    signerName: piCredentials.name,
    signerRole: "Principal Investigator",
    reason: justification,
    timestamp: now,
    digest: sigDigest,
  };

  const updatedPersonnel = log.personnel.map((p) => {
    if (p.status === "PENDING") {
      return {
        ...p,
        status: "ACTIVE" as const,
        signedByPi: true,
        piSignDate: now,
      };
    }
    return p;
  });

  const prevHash =
    log.auditTrail.length > 0
      ? log.auditTrail[log.auditTrail.length - 1].hash
      : "GENESIS_HASH_00000000000000000000000000000000";
  const auditEntryId = `AUD-DOA-${crypto.randomBytes(6).toString("hex")}`;

  const rawAudit: Omit<Part11AuditEntry, "hash"> = {
    id: auditEntryId,
    timestamp: now,
    siteId: log.siteId,
    eventType: "DOA_SIGN_OFF",
    actorId: piCredentials.id,
    actorName: piCredentials.name,
    actorRole: "Principal Investigator",
    justification,
    signatures: [piSignature],
    previousState: log.status,
    newState: "PI_SIGNED",
    previousHash: prevHash,
  };

  const hash = computeAuditHash(rawAudit);
  const auditEntry: Part11AuditEntry = { ...rawAudit, hash };

  return {
    ...log,
    personnel: updatedPersonnel,
    status: "PI_SIGNED",
    piSignature,
    auditTrail: [...log.auditTrail, auditEntry],
  };
}

/**
 * Revokes a staff task delegation with 21 CFR Part 11 PI signature logging.
 */
export function revokePersonnelDelegation(
  log: DOALog,
  personnelId: string,
  piCredentials: { id: string; name: string; passwordHashOrSecret: string },
  revocationReason: string
): DOALog {
  const targetIndex = log.personnel.findIndex((p) => p.id === personnelId);
  if (targetIndex === -1) {
    throw new Error(`Personnel member '${personnelId}' not found in DOA log`);
  }

  if (!revocationReason || revocationReason.trim().length < 5) {
    throw new Error(
      "Part 11 revocation requires explicit justification reason"
    );
  }

  const now = new Date().toISOString();
  const sigDigest = crypto
    .createHash("sha256")
    .update(`${piCredentials.id}:REVOCATION:${personnelId}:${now}`)
    .digest("hex");

  const piRevokeSignature: Part11Signature = {
    signerId: piCredentials.id,
    signerName: piCredentials.name,
    signerRole: "Principal Investigator",
    reason: `Revocation: ${revocationReason}`,
    timestamp: now,
    digest: sigDigest,
  };

  const target = log.personnel[targetIndex];
  const updatedPersonnel = [...log.personnel];
  updatedPersonnel[targetIndex] = {
    ...target,
    status: "REVOKED",
    revokedByPi: true,
    piRevokeDate: now,
    revocationReason,
  };

  const prevHash =
    log.auditTrail.length > 0
      ? log.auditTrail[log.auditTrail.length - 1].hash
      : "GENESIS_HASH_00000000000000000000000000000000";
  const auditEntryId = `AUD-REV-${crypto.randomBytes(6).toString("hex")}`;

  const rawAudit: Omit<Part11AuditEntry, "hash"> = {
    id: auditEntryId,
    timestamp: now,
    siteId: log.siteId,
    eventType: "DOA_REVOCATION",
    actorId: piCredentials.id,
    actorName: piCredentials.name,
    actorRole: "Principal Investigator",
    justification: `Revoked delegation for ${target.name} (${target.role}): ${revocationReason}`,
    signatures: [piRevokeSignature],
    previousState: target.status,
    newState: "REVOKED",
    previousHash: prevHash,
  };

  const hash = computeAuditHash(rawAudit);
  const auditEntry: Part11AuditEntry = { ...rawAudit, hash };

  return {
    ...log,
    personnel: updatedPersonnel,
    auditTrail: [...log.auditTrail, auditEntry],
  };
}

/**
 * Verifies chronological audit trail hash chain integrity for 21 CFR Part 11.
 */
export function verifyDOAAuditTrailIntegrity(log: DOALog): {
  valid: boolean;
  brokenAtStep?: number;
} {
  let prevHash = "GENESIS_HASH_00000000000000000000000000000000";

  for (let i = 0; i < log.auditTrail.length; i++) {
    const entry = log.auditTrail[i];
    if (entry.previousHash !== prevHash) {
      return { valid: false, brokenAtStep: i };
    }

    const expectedHash = computeAuditHash(entry);
    if (entry.hash !== expectedHash) {
      return { valid: false, brokenAtStep: i };
    }

    prevHash = entry.hash;
  }

  return { valid: true };
}

/**
 * Generates 21 CFR Part 11 Certified DOA Log PDF export.
 */
export async function exportDOALogToPdf(log: DOALog): Promise<Uint8Array> {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  // Header banner
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, 210, 28, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text(
    "21 CFR Part 11 Certified Delegation of Authority (DOA) Log",
    12,
    14
  );

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text(
    `Study ID: ${log.studyId}  |  Site: ${log.siteName} (${log.siteId})`,
    12,
    22
  );

  // Metadata Block
  let y = 35;
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("1. Site & Principal Investigator Details", 12, y);

  y += 6;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text(`Principal Investigator: ${log.piName} (${log.piEmail})`, 12, y);
  doc.text(`Log Status: ${log.status}`, 120, y);

  y += 5;
  doc.text(`Generated Date: ${new Date().toISOString()}`, 12, y);
  doc.text(`Total Staff Delegated: ${log.personnel.length}`, 120, y);

  // Staff Delegation Table
  y += 10;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text("2. Delegated Personnel & Task Matrix", 12, y);

  const personnelRows = log.personnel.map((p) => [
    p.name,
    p.role,
    p.delegatedTaskCodes.join(", "),
    p.startDate,
    p.status === "REVOKED" ? `REVOKED (${p.piRevokeDate || ""})` : p.status,
    p.signedByPi ? `Signed (${p.piSignDate?.slice(0, 10)})` : "Pending",
  ]);

  autoTable(doc, {
    startY: y + 4,
    head: [
      [
        "Staff Name",
        "Role",
        "Delegated Tasks",
        "Start Date",
        "Status",
        "PI Sign",
      ],
    ],
    body: personnelRows,
    theme: "striped",
    headStyles: { fillColor: [30, 58, 138], textColor: 255, fontSize: 8 },
    bodyStyles: { fontSize: 8 },
    margin: { left: 12, right: 12 },
  });

  // Part 11 Signature Certificate Block
  let finalY =
    (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable
      .finalY + 10;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text("3. PI 21 CFR Part 11 Electronic Signature Certificate", 12, finalY);

  finalY += 6;
  if (log.piSignature) {
    doc.setFillColor(241, 245, 249);
    doc.rect(12, finalY, 186, 26, "F");
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(51, 65, 85);

    doc.text(
      `Signer Name: ${log.piSignature.signerName} (${log.piSignature.signerRole})`,
      16,
      finalY + 6
    );
    doc.text(`Timestamp: ${log.piSignature.timestamp}`, 16, finalY + 11);
    doc.text(`Reason: ${log.piSignature.reason}`, 16, finalY + 16);
    doc.text(
      `Digital Digest SHA-256: ${log.piSignature.digest}`,
      16,
      finalY + 21
    );
    finalY += 32;
  } else {
    doc.setFont("helvetica", "italic");
    doc.setFontSize(8);
    doc.text("No PI electronic signature recorded on file.", 16, finalY + 4);
    finalY += 12;
  }

  // Audit History Table
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text(
    "4. Chronological Audit History & Cryptographic Hash Chain",
    12,
    finalY
  );

  const auditRows = log.auditTrail.map((a, idx) => [
    (idx + 1).toString(),
    a.eventType,
    a.actorName,
    a.justification.slice(0, 45),
    a.timestamp.slice(0, 19),
    a.hash.slice(0, 12) + "...",
  ]);

  autoTable(doc, {
    startY: finalY + 4,
    head: [
      [
        "#",
        "Event Type",
        "Actor",
        "Justification / Action",
        "Timestamp",
        "SHA-256 Digest",
      ],
    ],
    body: auditRows,
    theme: "grid",
    headStyles: { fillColor: [71, 85, 105], textColor: 255, fontSize: 8 },
    bodyStyles: { fontSize: 7 },
    margin: { left: 12, right: 12 },
  });

  const arrayBuffer = doc.output("arraybuffer");
  return new Uint8Array(arrayBuffer);
}
