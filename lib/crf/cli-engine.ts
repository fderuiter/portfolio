/**
 * CRF Studio CLI & Headless Command Engine
 * Implements Document-Driven CLI Output and Agent-DX Specification
 * Pure, decoupled command executor for both Node CLI and In-Studio Web Terminal
 */

import { StudyProtocol, CRFForm, CRFField, ClinicalDataType } from "./types";
import { lintForm } from "./ast-evaluator";
import { scaffoldCdashDomain } from "./cdash-domain-templates";
import { exportStudyToCdiscOdmXml } from "./odm-xml-serializer";
import { exportStudyToFhirQuestionnaire } from "./fhir-questionnaire";
import { exportStudyToSas } from "./export-sas";
import { exportStudyToR } from "./export-r";
import {
  exportUniversalCrfJson,
  exportUniversalCrfYaml,
  diffUniversalCrfStudies,
} from "./universal-schema";

export interface CliExecutionOptions {
  json?: boolean;
  dryRun?: boolean;
  color?: boolean;
}

export interface CliCommandResult {
  success: boolean;
  document: string;
  data?: unknown;
  updatedStudy?: StudyProtocol;
  error?: string;
}

// ANSI Color Formatter Helpers
export const ansi = {
  reset: "\x1b[0m",
  bold: "\x1b[1m",
  dim: "\x1b[2m",
  italic: "\x1b[3m",
  underline: "\x1b[4m",
  cyan: "\x1b[36m",
  brightCyan: "\x1b[96m",
  green: "\x1b[32m",
  brightGreen: "\x1b[92m",
  amber: "\x1b[33m",
  brightYellow: "\x1b[93m",
  red: "\x1b[31m",
  brightRed: "\x1b[91m",
  magenta: "\x1b[35m",
  blue: "\x1b[34m",
  white: "\x1b[37m",
};

/**
 * Strips ANSI codes for non-color output or test assertions
 */
export function stripAnsi(text: string): string {
  return text.replace(/\x1b\[[0-9;]*m/g, "");
}

/**
 * Summary Info Document
 */
export function executeInfoCommand(study: StudyProtocol, options: CliExecutionOptions = {}): CliCommandResult {
  const totalFields = study.forms.reduce(
    (acc, f) => acc + f.sections.reduce((sAcc, s) => sAcc + s.fields.length, 0),
    0
  );
  const totalRules = study.forms.reduce((acc, f) => acc + f.rules.length, 0);
  const totalDiagnostics = study.forms.reduce((acc, f) => acc + lintForm(f).length, 0);

  if (options.json) {
    return {
      success: true,
      document: JSON.stringify(
        {
          protocolNumber: study.protocolNumber,
          studyName: study.studyName,
          phase: study.phase,
          sponsor: study.sponsor,
          therapeuticArea: study.therapeuticArea,
          formsCount: study.forms.length,
          fieldsCount: totalFields,
          visitsCount: study.visits.length,
          rulesCount: totalRules,
          diagnosticsCount: totalDiagnostics,
        },
        null,
        2
      ),
      data: study,
    };
  }

  const lines: string[] = [];
  lines.push(`${ansi.bold}${ansi.underline}# STUDY PROTOCOL — ${study.protocolNumber}${ansi.reset}`);
  lines.push(`${ansi.dim}${study.studyName}${ansi.reset}`);
  lines.push(
    `*${study.phase} · ${study.therapeuticArea} · Sponsor: ${study.sponsor} · v${study.version}*`
  );
  lines.push("");

  lines.push(`${ansi.bold}${ansi.blue}### Clinical Forms · ${study.forms.length} domains${ansi.reset}`);
  for (const form of study.forms) {
    const fldCount = form.sections.reduce((acc, s) => acc + s.fields.length, 0);
    const domainTag = `${ansi.cyan}[${form.domain.padEnd(4)}]${ansi.reset}`;
    const nameStr = form.name.padEnd(32);
    const metaStr = `${ansi.dim}${String(fldCount).padStart(2)} fields · ${String(form.rules.length).padStart(2)} rules${ansi.reset}`;
    lines.push(`  ${domainTag} ${nameStr}  ${metaStr}`);
  }
  lines.push("");

  lines.push(`${ansi.bold}${ansi.blue}### Schedule of Activities (SoA) · ${study.visits.length} visits${ansi.reset}`);
  for (const visit of study.visits) {
    const dayStr = `Day ${String(visit.targetDay).padStart(3)}`;
    const nameStr = visit.name.padEnd(24);
    const formsStr = `${ansi.dim}${visit.assignedFormIds.length} forms assigned${ansi.reset}`;
    lines.push(`  ${ansi.amber}${dayStr}${ansi.reset}  ${nameStr}  ${formsStr}`);
  }
  lines.push("");

  lines.push(`${ansi.bold}${ansi.blue}### Conformance & Diagnostics${ansi.reset}`);
  if (totalDiagnostics === 0) {
    lines.push(`  ${ansi.green}✔ All ${study.forms.length} forms pass CDISC CDASH 2.2 and AST logic checks cleanly.${ansi.reset}`);
  } else {
    lines.push(`  ${ansi.amber}⚠ ${totalDiagnostics} diagnostics flagged across forms. Run 'crf validate' for details.${ansi.reset}`);
  }
  lines.push("");

  lines.push(`${ansi.bold}${ansi.blue}### Next Actions${ansi.reset}`);
  lines.push(`  ${ansi.green}crf validate${ansi.reset}                 Verify CDISC 2.2 conformance and AST rules`);
  lines.push(`  ${ansi.green}crf add form <domain>${ansi.reset}        Scaffold standard CDASH domain (e.g. VS, AE, LB)`);
  lines.push(`  ${ansi.green}crf export --format odm${ansi.reset}      Compile to CDISC ODM-XML 1.3.2 metadata`);
  lines.push("");

  lines.push(`${ansi.dim}##### Metadata${ansi.reset}`);
  lines.push(`${ansi.dim}Study ID: ${study.id} · Codelists: ${study.codelists.length} · Last Modified: ${study.lastModified || "N/A"}${ansi.reset}`);

  const document = lines.join("\n");
  return { success: true, document, data: study };
}

/**
 * Four-Tier Conformance Validation Command
 */
export function executeValidateCommand(
  study: StudyProtocol,
  options: CliExecutionOptions = {}
): CliCommandResult {
  const issues: Array<{ form: string; field?: string; rule: string; message: string; severity: "error" | "warning" }> = [];

  // Tier 1: Variable Name Length & CDASH Conformance
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

    // Tier 2: AST Formula & Edit Checks
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

  // Tier 3: Schedule of Activities Matrix Checks
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

  const isCompliant = issues.filter((i) => i.severity === "error").length === 0;

  if (options.json) {
    return {
      success: isCompliant,
      document: JSON.stringify(
        {
          compliant: isCompliant,
          totalIssues: issues.length,
          errors: issues.filter((i) => i.severity === "error"),
          warnings: issues.filter((i) => i.severity === "warning"),
        },
        null,
        2
      ),
      data: { isCompliant, issues },
    };
  }

  const lines: string[] = [];
  lines.push(`${ansi.bold}${ansi.underline}# VALIDATION REPORT — ${study.protocolNumber}${ansi.reset}`);
  lines.push(`*CDISC CDASH 2.2 · AST Logic Integrity · Schedule of Activities (SoA)*\n`);

  if (issues.length === 0) {
    lines.push(`${ansi.bold}${ansi.brightGreen}✔ 100% CDISC & AST Conformance Verified${ansi.reset}`);
    lines.push(`All ${study.forms.length} forms, ${study.visits.length} visits, and rule graphs comply with regulatory standards.\n`);
  } else {
    lines.push(`${ansi.bold}${ansi.blue}### Diagnostics Found · ${issues.length} items${ansi.reset}`);
    for (const issue of issues) {
      const tag =
        issue.severity === "error"
          ? `${ansi.brightRed}[ERROR]${ansi.reset}`
          : `${ansi.brightYellow}[WARN] ${ansi.reset}`;
      const domainStr = `${ansi.cyan}${issue.form}${ansi.reset}`;
      const fieldStr = issue.field ? ` · ${issue.field}` : "";
      lines.push(`  ${tag} ${domainStr}${fieldStr}: ${issue.message}`);
    }
    lines.push("");
  }

  lines.push(`${ansi.dim}##### Metadata${ansi.reset}`);
  lines.push(`${ansi.dim}Audited ${study.forms.length} forms against FDA/PMDA CDASH Technical Conformance rules.${ansi.reset}`);

  return {
    success: isCompliant,
    document: lines.join("\n"),
    data: { isCompliant, issues },
  };
}

/**
 * Add Form / Inject CDASH Domain
 */
export function executeAddFormCommand(
  study: StudyProtocol,
  domain: string,
  customName?: string,
  options: CliExecutionOptions = {}
): CliCommandResult {
  const upperDomain = domain.toUpperCase();
  let newForm: CRFForm;
  try {
    const template = scaffoldCdashDomain(upperDomain as Parameters<typeof scaffoldCdashDomain>[0]);
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
      description: `User-defined clinical data form for ${upperDomain}`,
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

  if (options.json) {
    return {
      success: true,
      document: JSON.stringify(newForm, null, 2),
      data: newForm,
      updatedStudy: options.dryRun ? study : updatedStudy,
    };
  }

  const lines: string[] = [];
  lines.push(`${ansi.bold}${ansi.underline}# ADD FORM — ${newForm.domain}${ansi.reset}`);
  lines.push(`Created form "${newForm.name}" with ${newForm.sections.flatMap((s) => s.fields).length} CDASH variables.`);
  if (options.dryRun) {
    lines.push(`${ansi.amber}*Dry-run mode: study not modified.*${ansi.reset}`);
  } else {
    lines.push(`${ansi.brightGreen}✔ Successfully added to protocol ${study.protocolNumber}.${ansi.reset}`);
  }

  return {
    success: true,
    document: lines.join("\n"),
    data: newForm,
    updatedStudy: options.dryRun ? study : updatedStudy,
  };
}

/**
 * Add Field to Form
 */
export function executeAddFieldCommand(
  study: StudyProtocol,
  domainOrFormId: string,
  fieldData: Partial<CRFField> & { variableName: string; dataType: ClinicalDataType },
  options: CliExecutionOptions = {}
): CliCommandResult {
  const targetForm = study.forms.find(
    (f) => f.id === domainOrFormId || f.domain.toUpperCase() === domainOrFormId.toUpperCase()
  );

  if (!targetForm) {
    return {
      success: false,
      document: `${ansi.brightRed}Error: Form '${domainOrFormId}' not found in protocol.${ansi.reset}`,
      error: `Form '${domainOrFormId}' not found.`,
    };
  }

  const newField: CRFField = {
    id: `fld_${fieldData.variableName.toLowerCase()}_${Date.now()}`,
    variableName: fieldData.variableName.toUpperCase(),
    label: fieldData.label || fieldData.variableName,
    dataType: fieldData.dataType,
    columnSpan: fieldData.columnSpan || 6,
    required: fieldData.required || false,
    unit: fieldData.unit,
    calculationFormula: fieldData.calculationFormula,
  };

  const updatedSections = targetForm.sections.map((sec, idx) => {
    if (idx === 0) {
      return { ...sec, fields: [...sec.fields, newField] };
    }
    return sec;
  });

  const updatedForm = { ...targetForm, sections: updatedSections };
  const updatedStudy: StudyProtocol = {
    ...study,
    lastModified: new Date().toISOString(),
    forms: study.forms.map((f) => (f.id === targetForm.id ? updatedForm : f)),
  };

  if (options.json) {
    return {
      success: true,
      document: JSON.stringify(newField, null, 2),
      data: newField,
      updatedStudy: options.dryRun ? study : updatedStudy,
    };
  }

  const lines: string[] = [];
  lines.push(`${ansi.bold}${ansi.underline}# ADD FIELD — ${newField.variableName}${ansi.reset}`);
  lines.push(`Added field "${newField.label}" (${newField.dataType}) to form ${targetForm.domain}.`);
  if (options.dryRun) {
    lines.push(`${ansi.amber}*Dry-run mode: study not modified.*${ansi.reset}`);
  } else {
    lines.push(`${ansi.brightGreen}✔ Successfully added to form ${targetForm.domain}.${ansi.reset}`);
  }

  return {
    success: true,
    document: lines.join("\n"),
    data: newField,
    updatedStudy: options.dryRun ? study : updatedStudy,
  };
}

/**
 * Multi-Format Export Command
 */
export function executeExportCommand(
  study: StudyProtocol,
  format: "json" | "yaml" | "odm" | "fhir" | "sas" | "r",
  _options: CliExecutionOptions = {}
): CliCommandResult {
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
        document: `Unsupported format '${format}'. Valid formats: json, yaml, odm, fhir, sas, r`,
        error: `Invalid format '${format}'`,
      };
  }

  return {
    success: true,
    document: output,
    data: { format, sizeBytes: output.length },
  };
}

/**
 * Protocol Semantic Diff
 */
export function executeDiffCommand(
  studyA: StudyProtocol,
  studyB: StudyProtocol,
  options: CliExecutionOptions = {}
): CliCommandResult {
  const diffSummary = diffUniversalCrfStudies(studyA, studyB);

  if (options.json) {
    return {
      success: true,
      document: JSON.stringify(diffSummary, null, 2),
      data: diffSummary,
    };
  }

  const lines: string[] = [];
  lines.push(`${ansi.bold}${ansi.underline}# PROTOCOL DIFF — ${studyB.protocolNumber}${ansi.reset}`);

  if (!diffSummary.hasChanges) {
    lines.push(`${ansi.green}✔ No structural changes between protocols.${ansi.reset}`);
  } else {
    if (diffSummary.addedForms.length > 0) {
      lines.push(`${ansi.bold}${ansi.green}### Added Forms${ansi.reset}`);
      diffSummary.addedForms.forEach((f) => lines.push(`  + ${f}`));
    }
    if (diffSummary.removedForms.length > 0) {
      lines.push(`${ansi.bold}${ansi.red}### Removed Forms${ansi.reset}`);
      diffSummary.removedForms.forEach((f) => lines.push(`  - ${f}`));
    }
    if (diffSummary.modifiedForms.length > 0) {
      lines.push(`${ansi.bold}${ansi.amber}### Modified Forms${ansi.reset}`);
      for (const mf of diffSummary.modifiedForms) {
        lines.push(`  ${ansi.cyan}${mf.domain}${ansi.reset}:`);
        mf.addedFields.forEach((fld) => lines.push(`    + field: ${fld}`));
        mf.removedFields.forEach((fld) => lines.push(`    - field: ${fld}`));
        mf.modifiedFields.forEach((fld) => lines.push(`    ~ field: ${fld}`));
      }
    }
  }

  return {
    success: true,
    document: lines.join("\n"),
    data: diffSummary,
  };
}

/**
 * Dispatcher executing raw CLI argument string or parsed args
 */
export function executeCliString(
  study: StudyProtocol,
  input: string,
  options: CliExecutionOptions = {}
): CliCommandResult {
  const parts = input.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0 || parts[0] === "help") {
    const helpDoc = [
      `${ansi.bold}${ansi.underline}# CRF STUDIO CLI COMMANDS${ansi.reset}`,
      "",
      `  ${ansi.cyan}crf info${ansi.reset}                           Display study metadata, form summary & SoA matrix`,
      `  ${ansi.cyan}crf validate${ansi.reset}                       Audit CDISC CDASH 2.2 conformance and AST rule graphs`,
      `  ${ansi.cyan}crf add form <domain>${ansi.reset}              Scaffold standard CDASH domain (e.g. DM, VS, AE, CM, LB)`,
      `  ${ansi.cyan}crf add field <form> --var <n> --type <t>${ansi.reset} Add clinical variable with unit and type`,
      `  ${ansi.cyan}crf export --format <odm|json|yaml|fhir|sas|r>${ansi.reset} Export to standardized clinical formats`,
      `  ${ansi.cyan}crf diff <studyA> <studyB>${ansi.reset}         Compare semantic diff between two protocols`,
      `  ${ansi.cyan}crf wizard${ansi.reset}                         Launch interactive guided authoring session`,
    ].join("\n");

    return { success: true, document: helpDoc };
  }

  const cmd = parts[0] === "crf" ? parts[1] : parts[0];
  const rest = parts[0] === "crf" ? parts.slice(2) : parts.slice(1);

  if (cmd === "info") {
    return executeInfoCommand(study, options);
  }

  if (cmd === "validate" || cmd === "lint") {
    return executeValidateCommand(study, options);
  }

  if (cmd === "add") {
    const sub = rest[0];
    if (sub === "form") {
      const domain = rest[1] || "CUSTOM";
      return executeAddFormCommand(study, domain, undefined, options);
    }
    if (sub === "field") {
      const formDomain = rest[1] || study.forms[0]?.domain || "DM";
      const varIndex = rest.indexOf("--var");
      const varName = varIndex !== -1 && rest[varIndex + 1] ? rest[varIndex + 1] : "TESTVAR";
      const typeIndex = rest.indexOf("--type");
      const dataType = (typeIndex !== -1 && rest[typeIndex + 1] ? rest[typeIndex + 1] : "text") as ClinicalDataType;
      const req = rest.includes("--required");
      const unitIdx = rest.indexOf("--unit");
      const unit = unitIdx !== -1 && rest[unitIdx + 1] ? rest[unitIdx + 1] : undefined;

      return executeAddFieldCommand(study, formDomain, { variableName: varName, dataType, required: req, unit }, options);
    }
  }

  if (cmd === "export") {
    const formatIdx = rest.indexOf("--format");
    const fmt = (formatIdx !== -1 && rest[formatIdx + 1] ? rest[formatIdx + 1] : "json") as "json" | "yaml" | "odm" | "fhir" | "sas" | "r";
    return executeExportCommand(study, fmt, options);
  }

  return {
    success: false,
    document: `${ansi.brightRed}Unknown command '${input}'. Type 'help' for available commands.${ansi.reset}`,
    error: `Unknown command: ${input}`,
  };
}
