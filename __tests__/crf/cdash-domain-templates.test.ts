import { describe, it, expect } from "vitest";
import {
  scaffoldCdashDomain,
  CDASH_STANDARD_VARIABLES,
  type ClinicalDataType,
} from "@/lib/crf";

describe("CDASH Domain Templates Unit Test Suite", () => {
  const DOMAIN_CODES = [
    "DM",
    "VS",
    "AE",
    "CM",
    "LB",
    "RECIST",
    "DI",
    "DU",
    "DE",
    "DA",
    "EX",
    "MH",
    "DS",
  ] as const;

  const CATALOG_DOMAINS = [
    "DM",
    "VS",
    "AE",
    "CM",
    "LB",
    "DI",
    "DU",
    "DE",
    "DA",
    "EX",
    "MH",
    "DS",
  ] as const;

  const VALID_DATA_TYPES: ClinicalDataType[] = [
    "text",
    "textarea",
    "number",
    "integer",
    "date",
    "partial_date",
    "precision_date",
    "time",
    "datetime",
    "single_select",
    "multi_select",
    "radio",
    "checkbox",
    "vas_scale",
    "nrs_scale",
    "calculated",
    "repeating_table",
    "signature",
  ];

  describe("CDASH Standard Variable Catalog (CDISC CDASH v2.2)", () => {
    it("contains catalog definitions for all 12 standard catalog domains", () => {
      CATALOG_DOMAINS.forEach((domain) => {
        const vars = CDASH_STANDARD_VARIABLES[domain];
        expect(vars).toBeDefined();
        expect(Array.isArray(vars)).toBe(true);
        expect(vars.length).toBeGreaterThan(0);
      });
    });

    it("verifies CDASH metadata standards for all catalog variables", () => {
      Object.entries(CDASH_STANDARD_VARIABLES).forEach(
        ([domainKey, variables]) => {
          variables.forEach((meta) => {
            expect(meta.domain).toBe(domainKey);
            expect(meta.sdtmVariable).toBeTruthy();
            expect(meta.sdtmVariable.length).toBeLessThanOrEqual(8);
            expect(meta.sdtmVariable).toBe(meta.sdtmVariable.toUpperCase());

            expect(meta.cdashLabel).toBeTruthy();
            expect(["R", "HR", "O"]).toContain(meta.core);
            expect(meta.acrfAnnotation).toBeTruthy();
            expect([
              "Topic",
              "Qualifier",
              "Timing",
              "Result",
              "Derived",
              "Identifier",
            ]).toContain(meta.dataCategory);

            if (meta.nciConceptId) {
              expect(meta.nciConceptId).toMatch(/^C\d+$/);
            }
          });
        }
      );
    });
  });

  describe("Requirement 1: Structural Validity for all 13 CDASH Domain Templates", () => {
    it.each(DOMAIN_CODES)(
      "scaffolds domain '%s' with complete structural integrity",
      (domainCode) => {
        const form = scaffoldCdashDomain(domainCode);

        expect(form.id).toMatch(/^form_[a-z0-9_]+$/);
        expect(form.name).toBeTruthy();
        expect(typeof form.name).toBe("string");
        expect(form.description).toBeTruthy();
        expect(form.version).toBe("1.0");

        if (domainCode === "RECIST") {
          expect(form.domain).toBe("TR");
        } else {
          expect(form.domain).toBe(domainCode);
        }

        expect(Array.isArray(form.sections)).toBe(true);
        expect(form.sections.length).toBeGreaterThan(0);

        const allFields = form.sections.flatMap((sec) => sec.fields);
        expect(allFields.length).toBeGreaterThan(0);

        // Ensure unique field IDs across sections
        const fieldIds = allFields.map((f) => f.id);
        const uniqueFieldIds = new Set(fieldIds);
        expect(uniqueFieldIds.size).toBe(fieldIds.length);

        // Structural check on fields
        allFields.forEach((field) => {
          expect(field.id).toBeTruthy();
          expect(field.variableName).toBeTruthy();
          expect(field.variableName.length).toBeLessThanOrEqual(8);
          expect(field.label).toBeTruthy();
          expect(VALID_DATA_TYPES).toContain(field.dataType);
          expect(typeof field.required).toBe("boolean");
          expect(field.columnSpan).toBeGreaterThanOrEqual(1);
          expect(field.columnSpan).toBeLessThanOrEqual(12);
        });
      }
    );

    it("correctly identifies repeating log forms for relevant domains", () => {
      const logDomains = ["AE", "CM", "DE", "MH"] as const;
      logDomains.forEach((domain) => {
        const form = scaffoldCdashDomain(domain);
        expect(form.isLogForm).toBe(true);
      });

      const singleRecordDomains = [
        "DM",
        "VS",
        "LB",
        "RECIST",
        "DI",
        "DU",
        "DA",
        "EX",
        "DS",
      ] as const;
      singleRecordDomains.forEach((domain) => {
        const form = scaffoldCdashDomain(domain);
        expect(form.isLogForm).toBeUndefined();
      });
    });

    it("throws an explicit error when scaffolding an unsupported domain code", () => {
      expect(() =>
        scaffoldCdashDomain(
          "INVALID" as unknown as (typeof DOMAIN_CODES)[number]
        )
      ).toThrow("Unsupported CDASH domain: INVALID");
    });
  });

  describe("Requirement 2: Variable Identifiers, Core Designations & Data Types", () => {
    it("verifies Demographics (DM) domain variables, data types, and core metadata", () => {
      const form = scaffoldCdashDomain("DM");
      const fields = form.sections.flatMap((s) => s.fields);
      const varMap = new Map(fields.map((f) => [f.variableName, f]));

      expect(varMap.has("ICDAT")).toBe(true);
      const icdat = varMap.get("ICDAT")!;
      expect(icdat.dataType).toBe("date");
      expect(icdat.required).toBe(true);
      expect(icdat.cdashMetadata?.core).toBe("R");

      expect(varMap.has("ICYN")).toBe(true);
      const icyn = varMap.get("ICYN")!;
      expect(icyn.dataType).toBe("radio");
      expect(icyn.required).toBe(true);
      expect(icyn.codelistId).toBe("CL_NY");

      expect(varMap.has("BRTHYR")).toBe(true);
      const brthyr = varMap.get("BRTHYR")!;
      expect(brthyr.dataType).toBe("integer");
      expect(brthyr.required).toBe(true);
      expect(brthyr.minValue).toBe(1900);
      expect(brthyr.maxValue).toBe(2026);
      expect(brthyr.cdashMetadata?.core).toBe("HR");

      expect(varMap.has("AGE")).toBe(true);
      const age = varMap.get("AGE")!;
      expect(age.dataType).toBe("integer");
      expect(age.required).toBe(true);
      expect(age.unit).toBe("Years");
      expect(age.cdashMetadata?.core).toBe("HR");

      expect(varMap.has("SEX")).toBe(true);
      const sex = varMap.get("SEX")!;
      expect(sex.dataType).toBe("single_select");
      expect(sex.required).toBe(true);
      expect(sex.codelistId).toBe("CL_SEX");
      expect(sex.cdashMetadata?.core).toBe("R");
      expect(sex.cdashMetadata?.nciConceptId).toBe("C66742");

      expect(varMap.has("RACE")).toBe(true);
      const race = varMap.get("RACE")!;
      expect(race.dataType).toBe("single_select");
      expect(race.required).toBe(true);
      expect(race.codelistId).toBe("CL_RACE");
      expect(race.cdashMetadata?.core).toBe("HR");
      expect(race.cdashMetadata?.nciConceptId).toBe("C74457");

      expect(varMap.has("ETHNIC")).toBe(true);
      const ethnic = varMap.get("ETHNIC")!;
      expect(ethnic.dataType).toBe("single_select");
      expect(ethnic.required).toBe(true);
      expect(ethnic.codelistId).toBe("CL_ETHNIC");
      expect(ethnic.cdashMetadata?.core).toBe("HR");
      expect(ethnic.cdashMetadata?.nciConceptId).toBe("C66790");
    });

    it("verifies Vital Signs (VS) domain variables, units, and derivation rules", () => {
      const form = scaffoldCdashDomain("VS");
      const fields = form.sections.flatMap((s) => s.fields);
      const varMap = new Map(fields.map((f) => [f.variableName, f]));

      expect(varMap.get("VSDAT")?.dataType).toBe("datetime");
      expect(varMap.get("VSDAT")?.required).toBe(true);

      expect(varMap.get("HEIGHT")?.unit).toBe("cm");
      expect(varMap.get("WEIGHT")?.unit).toBe("kg");

      const bmi = varMap.get("BMI")!;
      expect(bmi.dataType).toBe("calculated");
      expect(bmi.readOnly).toBe(true);
      expect(bmi.required).toBe(false);
      expect(bmi.unit).toBe("kg/m²");
      expect(bmi.calculationFormula).toContain(
        "weight / ((height/100) * (height/100))"
      );

      expect(varMap.get("SYSBP")?.unit).toBe("mmHg");
      expect(varMap.get("DIABP")?.unit).toBe("mmHg");
      expect(varMap.get("PULSE")?.unit).toBe("beats/min");
      expect(varMap.get("TEMP")?.unit).toBe("°C");

      expect(varMap.get("RESP")?.required).toBe(false);
      expect(varMap.get("RESP")?.cdashMetadata?.core).toBe("O");

      // Verify VS edit-check rules
      expect(form.rules.length).toBe(2);
      const bmiRule = form.rules.find((r) => r.targetFieldId === "f_bmi");
      expect(bmiRule?.actionType).toBe("set_value");
      expect(bmiRule?.triggerFieldIds).toEqual(["f_height", "f_weight"]);

      const sysbpRule = form.rules.find((r) => r.targetFieldId === "f_sysbp");
      expect(sysbpRule?.actionType).toBe("raise_query");
      expect(sysbpRule?.querySeverity).toBe("warning");
    });

    it("verifies Adverse Events (AE) domain variables and ongoing rule", () => {
      const form = scaffoldCdashDomain("AE");
      const fields = form.sections.flatMap((s) => s.fields);
      const varMap = new Map(fields.map((f) => [f.variableName, f]));

      expect(varMap.get("AETERM")?.dataType).toBe("text");
      expect(varMap.get("AETERM")?.required).toBe(true);

      expect(varMap.get("AESTDTC")?.dataType).toBe("partial_date");
      expect(varMap.get("AEENDTC")?.dataType).toBe("partial_date");
      expect(varMap.get("AEENDTC")?.required).toBe(false);

      expect(varMap.get("AEONGO")?.dataType).toBe("checkbox");
      expect(varMap.get("AESEV")?.codelistId).toBe("CL_AESEV");
      expect(varMap.get("AESER")?.codelistId).toBe("CL_NY");
      expect(varMap.get("AEREL")?.codelistId).toBe("CL_AEREL");

      const acn = varMap.get("AEACN")!;
      expect(acn.customOptions?.length).toBeGreaterThan(0);

      expect(varMap.get("AEOUT")?.codelistId).toBe("CL_AEOUT");

      // Edit check rule
      expect(form.rules.length).toBe(1);
      expect(form.rules[0].actionType).toBe("hide_field");
      expect(form.rules[0].targetFieldId).toBe("f_ae_endtc");
    });

    it("verifies Concomitant Medications (CM) domain variables and data types", () => {
      const form = scaffoldCdashDomain("CM");
      const fields = form.sections.flatMap((s) => s.fields);
      const varMap = new Map(fields.map((f) => [f.variableName, f]));

      expect(varMap.get("CMTRT")?.required).toBe(true);
      expect(varMap.get("CMINDC")?.required).toBe(true);
      expect(varMap.get("CMDOSE")?.dataType).toBe("number");
      expect(varMap.get("CMDOSU")?.dataType).toBe("text");
      expect(varMap.get("CMROUTE")?.codelistId).toBe("CL_ROUTE");
      expect(varMap.get("CMSTDTC")?.dataType).toBe("partial_date");
      expect(varMap.get("CMENDTC")?.required).toBe(false);
    });

    it("verifies Laboratory (LB) domain variables and clinical thresholds", () => {
      const form = scaffoldCdashDomain("LB");
      const fields = form.sections.flatMap((s) => s.fields);
      const varMap = new Map(fields.map((f) => [f.variableName, f]));

      expect(varMap.get("LBDAT")?.dataType).toBe("datetime");
      expect(varMap.get("LBFAST")?.codelistId).toBe("CL_NY");
      expect(varMap.get("ALT")?.unit).toBe("U/L");
      expect(varMap.get("AST")?.unit).toBe("U/L");
      expect(varMap.get("BILI")?.unit).toBe("mg/dL");
      expect(varMap.get("CREAT")?.unit).toBe("mg/dL");
      expect(varMap.get("ANC")?.unit).toBe("10^9/L");
      expect(varMap.get("PLAT")?.unit).toBe("10^9/L");
    });

    it("verifies RECIST 1.1 (TR) domain variables and response rule", () => {
      const form = scaffoldCdashDomain("RECIST");
      expect(form.domain).toBe("TR");

      const fields = form.sections.flatMap((s) => s.fields);
      const varMap = new Map(fields.map((f) => [f.variableName, f]));

      expect(varMap.get("TRDAT")?.dataType).toBe("date");
      expect(varMap.get("TRMETHOD")?.customOptions?.length).toBe(3);
      expect(varMap.get("TRL1")?.unit).toBe("mm");
      expect(varMap.get("TRL2")?.required).toBe(false);

      const sldCurr = varMap.get("TRSLDCUR")!;
      expect(sldCurr.dataType).toBe("calculated");
      expect(sldCurr.readOnly).toBe(true);

      const pctChg = varMap.get("TRPCTCHG")!;
      expect(pctChg.dataType).toBe("calculated");
      expect(pctChg.readOnly).toBe(true);

      expect(varMap.get("TRRESP")?.codelistId).toBe("CL_RECIST_RESP");

      expect(form.rules.length).toBe(1);
      expect(form.rules[0].targetFieldId).toBe("f_recist_resp");
    });

    it("verifies Device Identification (DI) domain variables and UDI metadata", () => {
      const form = scaffoldCdashDomain("DI");
      const fields = form.sections.flatMap((s) => s.fields);
      const varMap = new Map(fields.map((f) => [f.variableName, f]));

      expect(varMap.get("DITERM")?.required).toBe(true);
      expect(varMap.get("DIBRN")?.required).toBe(true);
      expect(varMap.get("DIMODN")?.required).toBe(true);
      expect(varMap.get("DILOTN")?.required).toBe(true);
      expect(varMap.get("DISERN")?.required).toBe(false);
      expect(varMap.get("DIUDI")?.cdashMetadata?.dataCategory).toBe(
        "Identifier"
      );
      expect(varMap.get("DIEXPDTC")?.dataType).toBe("date");
      expect(varMap.get("DISTAT")?.codelistId).toBe("CL_DISTAT");
    });

    it("verifies Device Utilization (DU) domain variables and procedures", () => {
      const form = scaffoldCdashDomain("DU");
      const fields = form.sections.flatMap((s) => s.fields);
      const varMap = new Map(fields.map((f) => [f.variableName, f]));

      expect(varMap.get("DUTEST")?.required).toBe(true);
      expect(varMap.get("DULOC")?.required).toBe(true);
      expect(varMap.get("DUSTDTC")?.dataType).toBe("datetime");
      expect(varMap.get("DUENDTC")?.dataType).toBe("datetime");
      expect(varMap.get("DUDUR")?.unit).toBe("min");
      expect(varMap.get("DUORRES")?.codelistId).toBe("CL_DUPROC");
    });

    it("verifies Device Events (DE) domain variables and incident reporting", () => {
      const form = scaffoldCdashDomain("DE");
      const fields = form.sections.flatMap((s) => s.fields);
      const varMap = new Map(fields.map((f) => [f.variableName, f]));

      expect(varMap.get("DETERM")?.required).toBe(true);
      expect(varMap.get("DESTDTC")?.dataType).toBe("datetime");
      expect(varMap.get("DEDEFIC")?.codelistId).toBe("CL_DEDEF");
      expect(varMap.get("DESEV")?.codelistId).toBe("CL_AESEV");
      expect(varMap.get("DESER")?.codelistId).toBe("CL_NY");
      expect(varMap.get("DEREL")?.codelistId).toBe("CL_DEREL");
      expect(varMap.get("DEACT")?.codelistId).toBe("CL_DEACT");
      expect(varMap.get("DEOUT")?.codelistId).toBe("CL_AEOUT");
    });

    it("verifies Drug Accountability (DA) domain variables and compliance formula", () => {
      const form = scaffoldCdashDomain("DA");
      const fields = form.sections.flatMap((s) => s.fields);
      const varMap = new Map(fields.map((f) => [f.variableName, f]));

      expect(varMap.get("DATEST")?.required).toBe(true);
      expect(varMap.get("DASTDTC")?.dataType).toBe("date");
      expect(varMap.get("DAENDTC")?.required).toBe(false);
      expect(varMap.get("DASPNO")?.dataType).toBe("integer");
      expect(varMap.get("DARETNO")?.required).toBe(false);
      expect(varMap.get("DAUSEDN")?.dataType).toBe("integer");

      const compl = varMap.get("DACOMPL")!;
      expect(compl.dataType).toBe("calculated");
      expect(compl.readOnly).toBe(true);
      expect(compl.unit).toBe("%");
      expect(compl.calculationFormula).toContain("dausedn / daspno");

      expect(varMap.get("DARECON")?.codelistId).toBe("CL_DARECON");

      expect(form.rules.length).toBe(1);
      expect(form.rules[0].targetFieldId).toBe("f_da_compl");
    });

    it("verifies Treatment Exposure (EX) domain variables and dosing options", () => {
      const form = scaffoldCdashDomain("EX");
      const fields = form.sections.flatMap((s) => s.fields);
      const varMap = new Map(fields.map((f) => [f.variableName, f]));

      expect(varMap.get("EXTRT")?.required).toBe(true);
      expect(varMap.get("EXDOSE")?.dataType).toBe("number");
      expect(varMap.get("EXDOSU")?.codelistId).toBe("CL_DOSU");
      expect(varMap.get("EXROUTE")?.codelistId).toBe("CL_ROUTE");
      expect(varMap.get("EXSTDTC")?.dataType).toBe("datetime");
      expect(varMap.get("EXENDTC")?.required).toBe(false);
      expect(varMap.get("EXADJ")?.required).toBe(false);
    });

    it("verifies Medical History (MH) domain variables and ongoing status", () => {
      const form = scaffoldCdashDomain("MH");
      const fields = form.sections.flatMap((s) => s.fields);
      const varMap = new Map(fields.map((f) => [f.variableName, f]));

      expect(varMap.get("MHTERM")?.required).toBe(true);
      expect(varMap.get("MHCAT")?.codelistId).toBe("CL_MHCAT");
      expect(varMap.get("MHSTDTC")?.dataType).toBe("partial_date");
      expect(varMap.get("MHONGO")?.codelistId).toBe("CL_NY");
      expect(varMap.get("MHENDTC")?.required).toBe(false);
    });

    it("verifies Subject Disposition (DS) domain variables and milestones", () => {
      const form = scaffoldCdashDomain("DS");
      const fields = form.sections.flatMap((s) => s.fields);
      const varMap = new Map(fields.map((f) => [f.variableName, f]));

      expect(varMap.get("DSCAT")?.required).toBe(true);
      expect(varMap.get("DSDECOD")?.codelistId).toBe("CL_DSCONT");
      expect(varMap.get("DSSTDTC")?.dataType).toBe("date");
      expect(varMap.get("DSTERM")?.dataType).toBe("textarea");
      expect(varMap.get("DSTERM")?.required).toBe(false);
    });
  });
});
