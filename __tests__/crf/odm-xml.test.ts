import { describe, it, expect } from "vitest";
import { exportStudyToCdiscOdmXml } from "@/lib/crf/odm-xml-serializer";
import { ONCOLOGY_RECIST_PRESET } from "@/lib/crf/presets/oncology-recist";

describe("CRF Studio - CDISC ODM-XML v1.3.2 Serializer", () => {
  it("serializes an entire study into compliant ODM-XML format", () => {
    const xml = exportStudyToCdiscOdmXml(ONCOLOGY_RECIST_PRESET);

    expect(xml).toContain('<?xml version="1.0" encoding="UTF-8"?>');
    expect(xml).toContain('<ODM xmlns="http://www.cdisc.org/ns/odm/v1.3"');
    expect(xml).toContain('ODMVersion="1.3.2"');
    expect(xml).toContain(`<ProtocolName>${ONCOLOGY_RECIST_PRESET.protocolNumber}</ProtocolName>`);
  });

  it("contains StudyEventDefs (Visits) and FormDefs", () => {
    const xml = exportStudyToCdiscOdmXml(ONCOLOGY_RECIST_PRESET);

    ONCOLOGY_RECIST_PRESET.visits.forEach((v) => {
      expect(xml).toContain(`StudyEventDef OID="${v.oid}"`);
    });

    ONCOLOGY_RECIST_PRESET.forms.forEach((f) => {
      expect(xml).toContain(`FormDef OID="FORM.${f.id}"`);
    });
  });

  it("exports Codelists with standard NCI Concept C-Codes", () => {
    const xml = exportStudyToCdiscOdmXml(ONCOLOGY_RECIST_PRESET);

    expect(xml).toContain('<CodeList OID="CL_SEX"');
    expect(xml).toContain('def:NCICode="C66742"');
    expect(xml).toContain('<CodeListItem CodedValue="M"');
    expect(xml).toContain('<CodeListItem CodedValue="F"');
  });

  it("properly escapes XML special characters in labels and descriptions", () => {
    const specialStudy = {
      ...ONCOLOGY_RECIST_PRESET,
      studyName: "Phase III Study <A & B> with \"quotes\" & 'apostrophes'",
    };

    const xml = exportStudyToCdiscOdmXml(specialStudy);
    expect(xml).toContain("Phase III Study &lt;A &amp; B&gt; with &quot;quotes&quot; &amp; &apos;apostrophes&apos;");
  });

  it("exports single-form edit check rules as ConditionDef elements and links them in ItemRefs", () => {
    const studyWithRules = {
      ...ONCOLOGY_RECIST_PRESET,
      forms: ONCOLOGY_RECIST_PRESET.forms.map((f) => {
        if (f.domain === "VS") {
          return {
            ...f,
            rules: [
              {
                id: "rule_sysbp_high",
                name: "High Systolic Blood Pressure Warning",
                description: "Warn if Systolic BP >= 140 mmHg",
                triggerFieldIds: ["f_sysbp"],
                actionType: "raise_query" as const,
                targetFieldId: "f_sysbp",
                conditions: [{ fieldId: "f_sysbp", operator: "gte" as const, value: 140 }],
                logicalOperator: "AND" as const,
                querySeverity: "warning" as const,
                queryMessage: "Systolic Blood Pressure is >= 140 mmHg.",
              },
            ],
          };
        }
        return f;
      }),
    };

    const xml = exportStudyToCdiscOdmXml(studyWithRules);

    expect(xml).toContain('<ConditionDef OID="CND.rule_sysbp_high" Name="High Systolic Blood Pressure Warning">');
    expect(xml).toContain("<FormalExpression Context=\"CRFStudio\">SYSBP &gt;= 140</FormalExpression>");
    expect(xml).toContain('CollectionExceptionConditionOID="CND.rule_sysbp_high"');
  });

  it("excludes cross-visit rules from single-form ConditionDef export", () => {
    const studyWithCrossVisit = {
      ...ONCOLOGY_RECIST_PRESET,
      forms: ONCOLOGY_RECIST_PRESET.forms.map((f) => {
        if (f.domain === "VS") {
          return {
            ...f,
            rules: [
              {
                id: "rule_cross_visit_check",
                name: "Cross Visit Weight Delta Check",
                description: "Compare weight to baseline screening visit",
                triggerFieldIds: ["f_weight"],
                actionType: "raise_query" as const,
                targetFieldId: "f_weight",
                conditions: [{ fieldId: "f_weight", crossVisitId: "v_screen", operator: "gte" as const, value: 100 }],
                logicalOperator: "AND" as const,
              },
            ],
          };
        }
        return f;
      }),
    };

    const xml = exportStudyToCdiscOdmXml(studyWithCrossVisit);
    expect(xml).not.toContain('<ConditionDef OID="CND.rule_cross_visit_check"');
  });
});
