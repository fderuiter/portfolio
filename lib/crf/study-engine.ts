/**
 * CRF Studio Unified Clinical Protocol Business Logic Engine
 * Pure, framework-agnostic functional service providing high-assurance protocol mutations,
 * CDASH 2.2 invariants, Schedule of Activities synchronization, AST rule dependency management,
 * and multi-standard exports across both Web Studio and CLI environments.
 */

import {
  StudyProtocol,
  CRFForm,
  CRFField,
  StudyVisit,
  EditCheckRule,
  ClinicalDataType,
} from "./types";
import { lintForm } from "./ast-evaluator";
import {
  scaffoldCdashDomain,
  CDASH_STANDARD_VARIABLES,
} from "./cdash-domain-templates";
import { getStudyPresetsSync, getPresetByIdSync, getOncologyPresetSync } from "./presets/loader";
import { exportStudyToCdiscOdmXml } from "./odm-xml-serializer";
import { exportStudyToFhirQuestionnaire } from "./fhir-questionnaire";
import { exportStudyToSas } from "./export-sas";
import { exportStudyToR } from "./export-r";
import {
  exportUniversalCrfJson,
  exportUniversalCrfYaml,
  diffUniversalCrfStudies,
} from "./universal-schema";

export interface ValidationIssue {
  form: string;
  field?: string;
  rule: string;
  message: string;
  severity: "error" | "warning";
}

export interface ProtocolValidationResult {
  isCompliant: boolean;
  totalIssues: number;
  errors: ValidationIssue[];
  warnings: ValidationIssue[];
  issues: ValidationIssue[];
}

export interface DomainMetadata {
  code: string;
  label: string;
  description: string;
  category: "core" | "device" | "pharma" | "specialty";
  variableCount: number;
  sampleVariables: string[];
}

/**
 * Standard Catalog of all 13 Supported CDASH & Medical Device Domains
 */
export const CDASH_DOMAIN_CATALOG: DomainMetadata[] = [
  {
    code: "DM",
    label: "Demographics & Informed Consent",
    description: "Subject baseline characteristics, age, sex, race, ethnicity, and consent date",
    category: "core",
    variableCount: 7,
    sampleVariables: ["ICDAT", "AGE", "SEX", "RACE", "ETHNIC"],
  },
  {
    code: "VS",
    label: "Vital Signs & Anthropometrics",
    description: "Blood pressure, pulse, temperature, respiration, height, weight, and BMI",
    category: "core",
    variableCount: 9,
    sampleVariables: ["SYSBP", "DIABP", "PULSE", "TEMP", "WEIGHT", "HEIGHT", "BMI"],
  },
  {
    code: "AE",
    label: "Adverse Events (CTCAE v5.0)",
    description: "Reported term, severity grade, serious criteria, causality, and outcome",
    category: "core",
    variableCount: 9,
    sampleVariables: ["AETERM", "AESTDTC", "AESEV", "AESER", "AEREL", "AEOUT"],
  },
  {
    code: "CM",
    label: "Concomitant Medications",
    description: "Prior and concomitant therapy, indication, dose, route, and duration",
    category: "core",
    variableCount: 8,
    sampleVariables: ["CMTRT", "CMINDC", "CMDOSE", "CMDOSU", "CMROUTE", "CMSTDTC"],
  },
  {
    code: "LB",
    label: "Laboratory Test Results",
    description: "Clinical chemistry, hematology, urinalysis, units, and normal ranges",
    category: "core",
    variableCount: 6,
    sampleVariables: ["LBDAT", "LBTEST", "LBORRES", "LBORRESU", "LBNRIND"],
  },
  {
    code: "RECIST",
    label: "Oncology RECIST 1.1 Tumor Tracking",
    description: "Target/non-target lesion measurements, sum of diameters, and response assessment",
    category: "specialty",
    variableCount: 8,
    sampleVariables: ["TULOC", "TUDIAM", "TUSLD", "TUNONTG", "TUNLRES", "TUOVRSP"],
  },
  {
    code: "DI",
    label: "Medical Device Identification (UDI)",
    description: "Class II/III medical device tracking, brand, model, serial/lot number, and UDI",
    category: "device",
    variableCount: 9,
    sampleVariables: ["DITERM", "DIBRN", "DIMODN", "DISERN", "DIUDI", "DISTAT"],
  },
  {
    code: "DU",
    label: "Medical Device Use & Procedure",
    description: "Implant deployment, surgical access site, procedure duration, and success outcome",
    category: "device",
    variableCount: 6,
    sampleVariables: ["DUTEST", "DUORRES", "DUSTDTC", "DUENDTC", "DULOC", "DUDUR"],
  },
  {
    code: "DE",
    label: "Medical Device Incidents & Deficiencies",
    description: "Device malfunction, use error, serious health deterioration, and root cause analysis",
    category: "device",
    variableCount: 8,
    sampleVariables: ["DETERM", "DESTDTC", "DEDEFIC", "DESEV", "DESER", "DEREL"],
  },
  {
    code: "DA",
    label: "Drug Accountability & Dispensation",
    description: "Investigational product kit tracking, units dispensed, returned, and % compliance",
    category: "pharma",
    variableCount: 8,
    sampleVariables: ["DATEST", "DASTDTC", "DASPNO", "DARETNO", "DACOMPL", "DARECON"],
  },
  {
    code: "EX",
    label: "Investigational Treatment Exposure",
    description: "Dose administered, infusion rate, route, modification reasons, and cycle timing",
    category: "pharma",
    variableCount: 8,
    sampleVariables: ["EXTRT", "EXDOSE", "EXDOSU", "EXROUTE", "EXSTDTC", "EXADJ"],
  },
  {
    code: "MH",
    label: "Medical History & Comorbidities",
    description: "Prior diagnoses, body system categories, onset date, and ongoing status",
    category: "core",
    variableCount: 5,
    sampleVariables: ["MHTERM", "MHCAT", "MHSTDTC", "MHONGO", "MHENDTC"],
  },
  {
    code: "DS",
    label: "Subject Disposition & Milestones",
    description: "Study completion, discontinuation reasons, primary endpoint, and withdrawal date",
    category: "core",
    variableCount: 4,
    sampleVariables: ["DSTERM", "DSDECOD", "DSCAT", "DSSTDTC"],
  },
];

/**
 * Pure Functional Protocol Engine
 */
export class StudyProtocolEngine {
  /**
   * Create Initial Blank Study Protocol
   */
  static createInitialStudy(profile?: Partial<StudyProtocol>): StudyProtocol {
    const timestamp = new Date().toISOString();
    return {
      id: profile?.id || `study_${Date.now()}`,
      protocolNumber: profile?.protocolNumber || "PROTOCOL-001",
      studyName: profile?.studyName || "Clinical Evaluation Protocol",
      phase: profile?.phase || "Phase I",
      sponsor: profile?.sponsor || "Clinical Development Sponsor",
      therapeuticArea: profile?.therapeuticArea || "General Medicine",
      version: profile?.version || "1.0",
      lastModified: timestamp,
      forms: profile?.forms || [],
      visits: profile?.visits || [
        {
          id: "v_screening",
          oid: "SE.SCREENING",
          name: "Screening",
          visitType: "Scheduled",
          targetDay: 0,
          windowBefore: 0,
          windowAfter: 0,
          assignedFormIds: [],
        },
        {
          id: "v_baseline",
          oid: "SE.BASELINE",
          name: "Day 1 Baseline",
          visitType: "Scheduled",
          targetDay: 1,
          windowBefore: 0,
          windowAfter: 1,
          assignedFormIds: [],
        },
      ],
      codelists: profile?.codelists || [],
      branding: profile?.branding,
    };
  }

  /**
   * Find Form by ID or Domain (Case-Insensitive)
   */
  static getForm(study: StudyProtocol, formIdOrDomain: string): CRFForm | undefined {
    const target = formIdOrDomain.trim().toUpperCase();
    return (
      study.forms.find((f) => f.id === formIdOrDomain) ||
      study.forms.find((f) => f.domain.toUpperCase() === target)
    );
  }

  /**
   * Find Field within Study or Specific Form
   */
  static getField(
    study: StudyProtocol,
    domainOrFormId: string,
    fieldIdOrVar: string
  ): { form: CRFForm; field: CRFField; sectionIndex: number; fieldIndex: number } | undefined {
    const form = this.getForm(study, domainOrFormId);
    if (!form) return undefined;

    const targetVar = fieldIdOrVar.trim().toUpperCase();
    for (let sIdx = 0; sIdx < form.sections.length; sIdx++) {
      const sec = form.sections[sIdx];
      for (let fIdx = 0; fIdx < sec.fields.length; fIdx++) {
        const fld = sec.fields[fIdx];
        if (fld.id === fieldIdOrVar || fld.variableName.toUpperCase() === targetVar) {
          return { form, field: fld, sectionIndex: sIdx, fieldIndex: fIdx };
        }
      }
    }
    return undefined;
  }

  /**
   * Add / Scaffold CDASH Domain Form
   */
  static addForm(
    study: StudyProtocol,
    domain: string,
    customName?: string
  ): { study: StudyProtocol; form: CRFForm } {
    const upperDomain = domain.trim().toUpperCase();
    let newForm: CRFForm;

    try {
      const template = scaffoldCdashDomain(
        upperDomain as Parameters<typeof scaffoldCdashDomain>[0]
      );
      newForm = {
        ...template,
        id: `form_${upperDomain.toLowerCase()}_${Date.now()}`,
        name: customName || template.name,
      };
    } catch {
      newForm = {
        id: `form_${upperDomain.toLowerCase()}_${Date.now()}`,
        name: customName || `${upperDomain} Custom Form`,
        domain: upperDomain,
        description: `Clinical data form for ${upperDomain}`,
        version: "1.0",
        sections: [
          {
            id: `sec_${Date.now()}`,
            title: "General Assessment",
            fields: [],
          },
        ],
        rules: [],
      };
    }

    const updatedStudy: StudyProtocol = {
      ...study,
      lastModified: new Date().toISOString(),
      forms: [...study.forms, newForm],
    };

    return { study: updatedStudy, form: newForm };
  }

  /**
   * Remove Form & Automatically Prune Schedule of Activities (SoA) References
   */
  static removeForm(
    study: StudyProtocol,
    formIdOrDomain: string
  ): { study: StudyProtocol; removedForm?: CRFForm } {
    const targetForm = this.getForm(study, formIdOrDomain);
    if (!targetForm) {
      return { study };
    }

    // Clean up visit assignments
    const updatedVisits = study.visits.map((v) => ({
      ...v,
      assignedFormIds: v.assignedFormIds.filter((id) => id !== targetForm.id),
    }));

    const updatedForms = study.forms.filter((f) => f.id !== targetForm.id);

    const updatedStudy: StudyProtocol = {
      ...study,
      lastModified: new Date().toISOString(),
      forms: updatedForms,
      visits: updatedVisits,
    };

    return { study: updatedStudy, removedForm: targetForm };
  }

  /**
   * Add Clinical Field to Form
   */
  static addField(
    study: StudyProtocol,
    domainOrFormId: string,
    fieldData: Partial<CRFField> & { variableName: string; dataType: ClinicalDataType },
    sectionIndex = 0
  ): { study: StudyProtocol; field?: CRFField; form?: CRFForm; error?: string } {
    const form = this.getForm(study, domainOrFormId);
    if (!form) {
      return { study, error: `Form '${domainOrFormId}' not found in protocol.` };
    }

    const upperVar = fieldData.variableName.trim().toUpperCase();

    // Check variable duplicate in form
    const exists = form.sections.some((s) =>
      s.fields.some((f) => f.variableName.toUpperCase() === upperVar)
    );
    if (exists) {
      return { study, error: `Variable '${upperVar}' already exists in form '${form.domain}'.` };
    }

    // Attempt CDASH variable metadata lookup
    const domainVars = CDASH_STANDARD_VARIABLES[form.domain];
    const cdashMeta = domainVars?.find((v) => v.sdtmVariable === upperVar);

    const newField: CRFField = {
      id: fieldData.id || `fld_${upperVar.toLowerCase()}_${Date.now()}`,
      variableName: upperVar,
      label: fieldData.label || cdashMeta?.cdashLabel || upperVar,
      description: fieldData.description,
      dataType: fieldData.dataType,
      columnSpan: fieldData.columnSpan || 6,
      required: fieldData.required ?? (cdashMeta?.core === "R" || cdashMeta?.core === "HR"),
      unit: fieldData.unit,
      unitOptions: fieldData.unitOptions,
      minValue: fieldData.minValue,
      maxValue: fieldData.maxValue,
      defaultValue: fieldData.defaultValue,
      codelistId: fieldData.codelistId,
      customOptions: fieldData.customOptions,
      calculationFormula: fieldData.calculationFormula,
      cdashMetadata: cdashMeta,
      allowPartial: fieldData.allowPartial,
      preventFutureDate: fieldData.preventFutureDate,
      allowNullFlavor: fieldData.allowNullFlavor,
      requirementTier:
        fieldData.requirementTier ||
        (fieldData.required ? "hard_stop" : "optional"),
      requiresSdv: fieldData.requiresSdv,
      isBlinded: fieldData.isBlinded,
      nullFlavorValue: fieldData.nullFlavorValue,
    };

    const targetSecIdx = Math.max(0, Math.min(sectionIndex, form.sections.length - 1));
    const updatedSections = form.sections.map((sec, idx) => {
      if (idx === targetSecIdx) {
        return { ...sec, fields: [...sec.fields, newField] };
      }
      return sec;
    });

    const updatedForm = { ...form, sections: updatedSections };
    const updatedStudy: StudyProtocol = {
      ...study,
      lastModified: new Date().toISOString(),
      forms: study.forms.map((f) => (f.id === form.id ? updatedForm : f)),
    };

    return { study: updatedStudy, field: newField, form: updatedForm };
  }

  /**
   * Update Existing Clinical Field in Form
   */
  static updateField(
    study: StudyProtocol,
    domainOrFormId: string,
    fieldIdOrVar: string,
    updates: Partial<CRFField>
  ): { study: StudyProtocol; field?: CRFField; form?: CRFForm; error?: string } {
    const found = this.getField(study, domainOrFormId, fieldIdOrVar);
    if (!found) {
      return { study, error: `Field '${fieldIdOrVar}' not found in form '${domainOrFormId}'.` };
    }

    const { form, field: currentField } = found;
    const updatedField: CRFField = {
      ...currentField,
      ...updates,
      variableName: updates.variableName
        ? updates.variableName.trim().toUpperCase()
        : currentField.variableName,
    };

    const updatedSections = form.sections.map((sec) => ({
      ...sec,
      fields: sec.fields.map((f) => (f.id === currentField.id ? updatedField : f)),
    }));

    const updatedForm: CRFForm = {
      ...form,
      sections: updatedSections,
    };

    const updatedStudy: StudyProtocol = {
      ...study,
      lastModified: new Date().toISOString(),
      forms: study.forms.map((f) => (f.id === form.id ? updatedForm : f)),
    };

    return { study: updatedStudy, field: updatedField, form: updatedForm };
  }

  /**
   * Remove Field from Form & Prune AST Rules
   */
  static removeField(
    study: StudyProtocol,
    domainOrFormId: string,
    fieldIdOrVar: string
  ): { study: StudyProtocol; removedField?: CRFField; form?: CRFForm; error?: string } {
    const found = this.getField(study, domainOrFormId, fieldIdOrVar);
    if (!found) {
      return { study, error: `Field '${fieldIdOrVar}' not found in form '${domainOrFormId}'.` };
    }

    const { form, field } = found;

    const updatedSections = form.sections.map((sec) => ({
      ...sec,
      fields: sec.fields.filter((f) => f.id !== field.id),
    }));

    // Prune rules that target this field or use it as trigger
    const updatedRules = form.rules.filter(
      (r) => r.targetFieldId !== field.id && !r.triggerFieldIds.includes(field.id)
    );

    const updatedForm: CRFForm = {
      ...form,
      sections: updatedSections,
      rules: updatedRules,
    };

    const updatedStudy: StudyProtocol = {
      ...study,
      lastModified: new Date().toISOString(),
      forms: study.forms.map((f) => (f.id === form.id ? updatedForm : f)),
    };

    return { study: updatedStudy, removedField: field, form: updatedForm };
  }

  /**
   * Add Longitudinal Study Visit to SoA Matrix
   */
  static addVisit(
    study: StudyProtocol,
    visitData: Partial<StudyVisit> & { name: string; targetDay: number }
  ): { study: StudyProtocol; visit: StudyVisit } {
    const oidSuffix = visitData.name
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, "")
      .slice(0, 12);

    const newVisit: StudyVisit = {
      id: visitData.id || `visit_${Date.now()}`,
      oid: visitData.oid || `SE.${oidSuffix || "VISIT"}`,
      name: visitData.name,
      visitType: visitData.visitType || "Scheduled",
      targetDay: visitData.targetDay,
      windowBefore: visitData.windowBefore || 0,
      windowAfter: visitData.windowAfter || 0,
      assignedFormIds: visitData.assignedFormIds || [],
      isRepeating: visitData.isRepeating,
    };

    const updatedVisits = [...study.visits, newVisit].sort((a, b) => a.targetDay - b.targetDay);

    const updatedStudy: StudyProtocol = {
      ...study,
      lastModified: new Date().toISOString(),
      visits: updatedVisits,
    };

    return { study: updatedStudy, visit: newVisit };
  }

  /**
   * Remove Study Visit from SoA Matrix
   */
  static removeVisit(
    study: StudyProtocol,
    visitIdOrName: string
  ): { study: StudyProtocol; removedVisit?: StudyVisit } {
    const target = visitIdOrName.trim().toLowerCase();
    const visit = study.visits.find(
      (v) => v.id === visitIdOrName || v.name.toLowerCase() === target
    );

    if (!visit) {
      return { study };
    }

    const updatedStudy: StudyProtocol = {
      ...study,
      lastModified: new Date().toISOString(),
      visits: study.visits.filter((v) => v.id !== visit.id),
    };

    return { study: updatedStudy, removedVisit: visit };
  }

  /**
   * Assign Forms to a Study Visit (Additive)
   */
  static assignVisitForms(
    study: StudyProtocol,
    visitIdOrName: string,
    formIdsOrDomains: string[]
  ): { study: StudyProtocol; visit?: StudyVisit; error?: string } {
    const target = visitIdOrName.trim().toLowerCase();
    const visit = study.visits.find(
      (v) => v.id === visitIdOrName || v.name.toLowerCase() === target
    );

    if (!visit) {
      return { study, error: `Visit '${visitIdOrName}' not found in protocol.` };
    }

    const resolvedFormIds: string[] = [];
    for (const token of formIdsOrDomains) {
      const f = this.getForm(study, token);
      if (f && !resolvedFormIds.includes(f.id)) {
        resolvedFormIds.push(f.id);
      }
    }

    const mergedFormIds = Array.from(new Set([...visit.assignedFormIds, ...resolvedFormIds]));
    const updatedVisit: StudyVisit = { ...visit, assignedFormIds: mergedFormIds };

    const updatedStudy: StudyProtocol = {
      ...study,
      lastModified: new Date().toISOString(),
      visits: study.visits.map((v) => (v.id === visit.id ? updatedVisit : v)),
    };

    return { study: updatedStudy, visit: updatedVisit };
  }

  /**
   * Add Dynamic AST Edit Check / Calculation Rule to Form
   */
  static addRule(
    study: StudyProtocol,
    domainOrFormId: string,
    ruleData: {
      name: string;
      targetFieldIdOrVar: string;
      actionType: EditCheckRule["actionType"];
      formulaExpression?: string;
      queryMessage?: string;
      querySeverity?: "info" | "warning" | "error";
      triggerFieldIdsOrVars?: string[];
    }
  ): { study: StudyProtocol; rule?: EditCheckRule; form?: CRFForm; error?: string } {
    const form = this.getForm(study, domainOrFormId);
    if (!form) {
      return { study, error: `Form '${domainOrFormId}' not found.` };
    }

    const targetFieldFound = this.getField(study, form.id, ruleData.targetFieldIdOrVar);
    const targetFieldId = targetFieldFound ? targetFieldFound.field.id : ruleData.targetFieldIdOrVar;

    const triggerIds: string[] = [];
    if (ruleData.triggerFieldIdsOrVars) {
      for (const t of ruleData.triggerFieldIdsOrVars) {
        const found = this.getField(study, form.id, t);
        if (found) triggerIds.push(found.field.id);
      }
    }

    const newRule: EditCheckRule = {
      id: `rule_${Date.now()}`,
      name: ruleData.name,
      description: ruleData.queryMessage || `Edit check rule for ${ruleData.targetFieldIdOrVar}`,
      actionType: ruleData.actionType,
      targetFieldId,
      triggerFieldIds: triggerIds.length > 0 ? triggerIds : [targetFieldId],
      logicalOperator: "AND",
      conditions: [],
      querySeverity: ruleData.querySeverity || "warning",
      queryMessage: ruleData.queryMessage,
      formulaExpression: ruleData.formulaExpression,
    };

    const updatedForm: CRFForm = {
      ...form,
      rules: [...form.rules, newRule],
    };

    const updatedStudy: StudyProtocol = {
      ...study,
      lastModified: new Date().toISOString(),
      forms: study.forms.map((f) => (f.id === form.id ? updatedForm : f)),
    };

    return { study: updatedStudy, rule: newRule, form: updatedForm };
  }

  /**
   * List Available Presets
   */
  static listPresets() {
    return getStudyPresetsSync().map((p) => ({
      id: p.id,
      name: p.name,
      therapeuticArea: p.therapeuticArea || p.study.therapeuticArea,
      phase: p.study.phase,
      formsCount: p.study.forms.length,
      visitsCount: p.study.visits.length,
      protocolNumber: p.study.protocolNumber,
    }));
  }

  /**
   * Load Preset by ID
   */
  static loadPreset(presetId: string): { study: StudyProtocol; presetInfo: { id: string; name: string } } {
    const preset = getPresetByIdSync(presetId);
    if (preset) {
      const info = getStudyPresetsSync().find((p) => p.id === presetId)!;
      return { study: JSON.parse(JSON.stringify(preset)), presetInfo: { id: info.id, name: info.name } };
    }
    const defaultStudy = getOncologyPresetSync();
    return {
      study: JSON.parse(JSON.stringify(defaultStudy)),
      presetInfo: { id: "oncology_recist", name: "Phase III Immuno-Oncology (RECIST 1.1)" },
    };
  }

  /**
   * List Supported CDASH Domains
   */
  static listDomains(): DomainMetadata[] {
    return CDASH_DOMAIN_CATALOG;
  }

  /**
   * 4-Tier Regulatory & Logic Conformance Validation
   */
  static validateProtocol(study: StudyProtocol): ProtocolValidationResult {
    const issues: ValidationIssue[] = [];

    // Tier 1: Variable Name Length & Core CDASH Rules
    for (const form of study.forms) {
      for (const sec of form.sections) {
        for (const fld of sec.fields) {
          if (fld.variableName.length > 8) {
            issues.push({
              form: form.domain,
              field: fld.variableName,
              rule: "CDASH-VAR-LEN",
              message: `Variable '${fld.variableName}' exceeds CDISC 8-character limit (${fld.variableName.length} chars)`,
              severity: "error",
            });
          }
        }
      }

      // Tier 2: AST Formula & Edit Check Syntax Linting
      const formErrors = lintForm(form);
      for (const err of formErrors) {
        issues.push({
          form: form.domain,
          rule: "AST-LINT",
          message: err.message,
          severity: "warning",
        });
      }
    }

    // Tier 3: Schedule of Activities (SoA) Matrix Consistency
    const formIdsInStudy = new Set(study.forms.map((f) => f.id));
    const assignedFormIds = new Set(study.visits.flatMap((v) => v.assignedFormIds));

    for (const form of study.forms) {
      if (!form.isLogForm && !assignedFormIds.has(form.id)) {
        issues.push({
          form: form.domain,
          rule: "SOA-ORPHAN",
          message: `Form '${form.name}' (${form.domain}) is not assigned to any visit in the Visit Matrix`,
          severity: "warning",
        });
      }
    }

    for (const visit of study.visits) {
      for (const fId of visit.assignedFormIds) {
        if (!formIdsInStudy.has(fId)) {
          issues.push({
            form: "SOA",
            rule: "SOA-MISSING-FORM",
            message: `Visit '${visit.name}' references non-existent form ID '${fId}'`,
            severity: "error",
          });
        }
      }
    }

    const errors = issues.filter((i) => i.severity === "error");
    const warnings = issues.filter((i) => i.severity === "warning");

    return {
      isCompliant: errors.length === 0,
      totalIssues: issues.length,
      errors,
      warnings,
      issues,
    };
  }

  /**
   * Semantic Diff between Two Protocols
   */
  static diffProtocols(studyA: StudyProtocol, studyB: StudyProtocol) {
    return diffUniversalCrfStudies(studyA, studyB);
  }

  /**
   * Multi-Format Regulatory Export Compilation
   */
  static exportProtocol(
    study: StudyProtocol,
    format: "json" | "yaml" | "odm" | "fhir" | "sas" | "r"
  ): { success: boolean; output: string; format: string; sizeBytes: number; error?: string } {
    try {
      let output = "";
      switch (format) {
        case "json":
          output = exportUniversalCrfJson(study);
          break;
        case "yaml":
          output = exportUniversalCrfYaml(study);
          break;
        case "odm":
          output = exportStudyToCdiscOdmXml(study);
          break;
        case "fhir":
          output = JSON.stringify(exportStudyToFhirQuestionnaire(study), null, 2);
          break;
        case "sas":
          output = exportStudyToSas(study);
          break;
        case "r":
          output = exportStudyToR(study);
          break;
        default:
          return {
            success: false,
            output: "",
            format,
            sizeBytes: 0,
            error: `Unsupported format '${format}'`,
          };
      }
      return { success: true, output, format, sizeBytes: output.length };
    } catch (err) {
      return {
        success: false,
        output: "",
        format,
        sizeBytes: 0,
        error: err instanceof Error ? err.message : String(err),
      };
    }
  }
}
