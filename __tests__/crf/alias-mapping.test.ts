import { describe, it, expect } from "vitest";
import { ONCOLOGY_RECIST_PRESET } from "@/lib/crf/presets/oncology-recist";
import { StudyProtocol, ElectronicSignature } from "@/lib/crf/types";
import {
  buildFieldAliasMap,
  detectTypeIncompatibilities,
  resolveFieldAlias,
  generateSignatureDigest,
  verifySignatureHash,
  getNextReleaseVersion,
} from "@/lib/crf/alias-mapping";

describe("Draft-Release Lifecycle & Field Alias Mapping Engine", () => {
  it("builds field alias map when field variable names or data types are modified in draft", () => {
    const previousProtocol: StudyProtocol = JSON.parse(JSON.stringify(ONCOLOGY_RECIST_PRESET));
    const draftProtocol: StudyProtocol = JSON.parse(JSON.stringify(ONCOLOGY_RECIST_PRESET));

    // Rename a variable in draft (e.g. BRTHYR -> BIRTH_YEAR)
    const dmForm = draftProtocol.forms.find((f) => f.id === "form_dm_onc");
    expect(dmForm).toBeDefined();
    const brthyrField = dmForm?.sections.flatMap((s) => s.fields).find((f) => f.variableName === "BRTHYR");
    expect(brthyrField).toBeDefined();
    if (brthyrField) {
      brthyrField.variableName = "BIRTH_YEAR";
    }

    const aliasMap = buildFieldAliasMap(previousProtocol, draftProtocol, "1.1.0");

    expect(aliasMap.length).toBe(1);
    expect(aliasMap[0]).toMatchObject({
      publishedVersion: "1.1.0",
      formId: "form_dm_onc",
      fieldId: brthyrField?.id,
      currentVariableName: "BIRTH_YEAR",
      legacyVariableName: "BRTHYR",
      dataTypeChanged: false,
    });
  });

  it("detects data type incompatibilities and generates pre-publication notices", () => {
    const previousProtocol: StudyProtocol = JSON.parse(JSON.stringify(ONCOLOGY_RECIST_PRESET));
    const draftProtocol: StudyProtocol = JSON.parse(JSON.stringify(ONCOLOGY_RECIST_PRESET));

    // Change data type in draft (e.g. BRTHYR number -> date)
    const dmForm = draftProtocol.forms.find((f) => f.id === "form_dm_onc");
    const brthyrField = dmForm?.sections.flatMap((s) => s.fields).find((f) => f.variableName === "BRTHYR");
    if (brthyrField) {
      brthyrField.dataType = "date";
    }

    const notices = detectTypeIncompatibilities(previousProtocol, draftProtocol);

    expect(notices.length).toBeGreaterThan(0);
    expect(notices[0]?.variableName).toBe("BRTHYR");
    expect(notices[0]?.previousType).toBe("integer");
    expect(notices[0]?.newType).toBe("date");
    expect(notices[0]?.message).toContain("changed data type");
  });

  it("dynamically resolves field aliases to current variable names", () => {
    const aliasMap = [
      {
        id: "alias_1",
        publishedVersion: "1.1.0",
        formId: "form_vs",
        fieldId: "f_sysbp",
        currentVariableName: "SYSTOLIC_BP",
        legacyVariableName: "SYSBP",
        publishedAt: new Date().toISOString(),
      },
    ];

    // Resolve by legacy variable name
    const legacyRes = resolveFieldAlias("SYSBP", aliasMap);
    expect(legacyRes.currentName).toBe("SYSTOLIC_BP");
    expect(legacyRes.legacyName).toBe("SYSBP");

    // Resolve by field ID
    const fieldIdRes = resolveFieldAlias("f_sysbp", aliasMap);
    expect(fieldIdRes.currentName).toBe("SYSTOLIC_BP");

    // Resolve unmapped field name returns itself
    const unmappedRes = resolveFieldAlias("WEIGHT", aliasMap);
    expect(unmappedRes.currentName).toBe("WEIGHT");
    expect(unmappedRes.legacyName).toBeUndefined();
  });

  it("preserves cryptographic signature hash verification across protocol releases", () => {
    const sampleValues = { f_brthyr: 1982, f_sex: "M" };

    const digest = generateSignatureDigest({
      subjectId: "001-101",
      formId: "form_dm_onc",
      signedBy: "Dr. Sarah Jenkins",
      userRole: "Principal Investigator",
      meaning: "Data Lock",
      protocolVersion: "1.0.0",
      fieldValuesSnapshot: sampleValues,
    });

    const signature: ElectronicSignature = {
      id: "sig_101",
      subjectId: "001-101",
      formId: "form_dm_onc",
      signedBy: "Dr. Sarah Jenkins",
      userRole: "Principal Investigator",
      timestamp: new Date().toISOString(),
      meaning: "Data Lock",
      protocolVersion: "1.0.0",
      signedDataSnapshot: sampleValues,
      digest,
    };

    // Verify signature executed under v1.0.0
    const verification = verifySignatureHash(signature, [], { f_brthyr: 1982, f_sex: "M" });
    expect(verification.isValid).toBe(true);
    expect(verification.signedVersion).toBe("1.0.0");
    expect(verification.message).toContain("Protocol Release v1.0.0");
  });

  it("computes next semver release versions accurately", () => {
    expect(getNextReleaseVersion("1.0.0", "minor")).toBe("1.1.0");
    expect(getNextReleaseVersion("v1.1.0", "minor")).toBe("1.2.0");
    expect(getNextReleaseVersion("1.2.0", "major")).toBe("2.0.0");
  });
});
