import { describe, it, expect } from "vitest";
import {
  exportStudyToUsdm,
  exportStudyToUsdmObject,
  importStudyFromUsdm,
  diffUsdmProtocols,
} from "../../lib/crf/usdm-adapter";
import {
  validateUniversalCrf,
  diffUniversalCrfStudies,
} from "../../lib/crf/universal-schema";
import { StudyProtocolEngine } from "../../lib/crf/study-engine";
import { ONCOLOGY_RECIST_PRESET } from "../../lib/crf/presets/oncology-recist";
import { StudyProtocol } from "../../lib/crf/types";

describe("Graph-Extended Schema & USDM Bidirectional Adapter", () => {
  it("validates protocol containing explicit arms, epochs, cohorts, and biomedical concepts without error", () => {
    const validation = validateUniversalCrf(ONCOLOGY_RECIST_PRESET);
    expect(validation.success).toBe(true);
    expect(validation.study?.arms?.length).toBe(2);
    expect(validation.study?.epochs?.length).toBe(3);
    expect(validation.study?.cohorts?.length).toBe(1);
    expect(validation.study?.biomedicalConcepts?.length).toBe(3);
  });

  it("retains backward compatibility with flat protocol schemas lacking arms or epochs", () => {
    const flatProtocol: StudyProtocol = {
      id: "flat_01",
      protocolNumber: "FLAT-2026",
      studyName: "Flat Legacy Study Protocol",
      phase: "Phase II",
      sponsor: "Legacy Sponsor",
      therapeuticArea: "Cardiology",
      version: "1.0",
      lastModified: "2026-01-01",
      forms: [
        {
          id: "f_vs",
          name: "Vital Signs",
          domain: "VS",
          description: "Vital signs collection",
          version: "1.0",
          sections: [
            {
              id: "sec_1",
              title: "Vitals",
              fields: [
                {
                  id: "f_sysbp",
                  variableName: "SYSBP",
                  label: "Systolic Blood Pressure",
                  dataType: "integer",
                  columnSpan: 6,
                  required: true,
                  unit: "mmHg",
                },
              ],
            },
          ],
          rules: [],
        },
      ],
      visits: [
        {
          id: "v_1",
          oid: "SE.V1",
          name: "Baseline Visit",
          visitType: "Scheduled",
          targetDay: 1,
          windowBefore: 0,
          windowAfter: 2,
          assignedFormIds: ["f_vs"],
        },
      ],
      codelists: [],
    };

    const validation = validateUniversalCrf(flatProtocol);
    expect(validation.success).toBe(true);
    expect(validation.study?.arms).toEqual([]);
    expect(validation.study?.epochs).toEqual([]);
  });

  it("exports StudyProtocol to valid CDISC USDM JSON structure", () => {
    const usdmJson = exportStudyToUsdm(ONCOLOGY_RECIST_PRESET);
    expect(typeof usdmJson).toBe("string");

    const usdmObj = JSON.parse(usdmJson);
    expect(usdmObj.schemaVersion).toBe("3.0.0");
    expect(usdmObj.study.protocolNumber).toBe("ONC-2026-003");
    expect(usdmObj.study.studyDesigns.length).toBe(1);

    const design = usdmObj.study.studyDesigns[0];
    expect(design.arms.length).toBe(2);
    expect(design.epochs.length).toBe(3);
    expect(design.cohorts.length).toBe(1);
    expect(design.encounters.length).toBe(6);
    expect(design.activities.length).toBe(6);
    expect(design.biomedicalConcepts.length).toBeGreaterThanOrEqual(3);
  });

  it("performs lossless roundtrip conversion between StudyProtocol and USDM JSON", () => {
    const usdmJson = exportStudyToUsdm(ONCOLOGY_RECIST_PRESET);
    const reimportedStudy = importStudyFromUsdm(usdmJson);

    expect(reimportedStudy.protocolNumber).toBe(ONCOLOGY_RECIST_PRESET.protocolNumber);
    expect(reimportedStudy.arms?.length).toBe(ONCOLOGY_RECIST_PRESET.arms?.length);
    expect(reimportedStudy.epochs?.length).toBe(ONCOLOGY_RECIST_PRESET.epochs?.length);
    expect(reimportedStudy.cohorts?.length).toBe(ONCOLOGY_RECIST_PRESET.cohorts?.length);
    expect(reimportedStudy.visits.length).toBe(ONCOLOGY_RECIST_PRESET.visits.length);
    expect(reimportedStudy.forms.length).toBe(ONCOLOGY_RECIST_PRESET.forms.length);

    // Verify 2nd roundtrip stability (deterministic idempotency)
    const usdmJson2 = exportStudyToUsdm(reimportedStudy);
    const reimportedStudy2 = importStudyFromUsdm(usdmJson2);
    expect(usdmJson2).toBe(usdmJson);

    const diff = diffUniversalCrfStudies(reimportedStudy, reimportedStudy2);
    expect(diff.hasChanges).toBe(false);
  });

  it("decouples field presentation properties into biomedical concepts during export", () => {
    const usdmObj = exportStudyToUsdmObject(ONCOLOGY_RECIST_PRESET);
    const design = usdmObj.study.studyDesigns![0];

    const sysbpConcept = design.biomedicalConcepts.find((c) => c.variableName === "SYSBP" || c.name.includes("Systolic"));
    expect(sysbpConcept).toBeDefined();
    expect(sysbpConcept?.domain).toBe("VS");
    expect(sysbpConcept?.dataType).toBe("integer");
  });

  it("maps linear visit target days to USDM epoch encounters on export and reassembles on import", () => {
    const usdmObj = exportStudyToUsdmObject(ONCOLOGY_RECIST_PRESET);
    const design = usdmObj.study.studyDesigns![0];

    const c1d1Encounter = design.encounters.find((e) => e.id === "v_c1d1");
    expect(c1d1Encounter).toBeDefined();
    expect(c1d1Encounter?.targetDay).toBe(1);
    expect(c1d1Encounter?.epochId).toBe("e_trt");

    const reimported = importStudyFromUsdm(usdmObj);
    const c1d1Visit = reimported.visits.find((v) => v.id === "v_c1d1");
    expect(c1d1Visit?.targetDay).toBe(1);
    expect(c1d1Visit?.epochId).toBe("e_trt");
  });

  it("accurately reports semantic version diffing between USDM protocol revisions", () => {
    const usdmA = exportStudyToUsdm(ONCOLOGY_RECIST_PRESET);

    const modifiedStudy: StudyProtocol = JSON.parse(JSON.stringify(ONCOLOGY_RECIST_PRESET));
    // Add a new arm
    modifiedStudy.arms!.push({
      id: "arm_c",
      name: "Arm C: Dose Escalation Cohort",
      type: "Experimental",
    });
    // Add a new epoch
    modifiedStudy.epochs!.push({
      id: "e_maint",
      name: "Maintenance Epoch",
      sequenceNumber: 4,
    });

    const usdmB = exportStudyToUsdm(modifiedStudy);

    const usdmDiff = diffUsdmProtocols(usdmA, usdmB);
    expect(usdmDiff.hasChanges).toBe(true);
    expect(usdmDiff.addedArms).toContain("arm_c");
    expect(usdmDiff.addedEpochs).toContain("e_maint");
  });

  it("maintains arm-aware visit matrices with form assignments specific to study arms", () => {
    const matrix = StudyProtocolEngine.getArmAwareVisitMatrix(ONCOLOGY_RECIST_PRESET);
    expect(matrix.length).toBe(2); // Arm A and Arm B

    const armA = matrix.find((m) => m.armId === "arm_exp");
    const armB = matrix.find((m) => m.armId === "arm_ctrl");

    expect(armA).toBeDefined();
    expect(armB).toBeDefined();

    // Verify Arm A has form_recist_onc at Cycle 1 Day 1, while Arm B does not
    const armAC1D1 = armA?.visits.find((v) => v.visitId === "v_c1d1");
    const armBC1D1 = armB?.visits.find((v) => v.visitId === "v_c1d1");

    expect(armAC1D1?.assignedFormIds).toContain("form_recist_onc");
    expect(armBC1D1?.assignedFormIds).not.toContain("form_recist_onc");
  });

  it("assigns arm-specific visit forms using StudyProtocolEngine.assignArmVisitForms", () => {
    const { study: updated } = StudyProtocolEngine.assignArmVisitForms(
      ONCOLOGY_RECIST_PRESET,
      "v_c2d1",
      "arm_exp",
      ["form_recist_onc"]
    );

    const v2 = updated.visits.find((v) => v.id === "v_c2d1");
    expect(v2?.armFormAssignments?.["arm_exp"]).toContain("form_recist_onc");
  });
});
