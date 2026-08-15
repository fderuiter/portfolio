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
});
