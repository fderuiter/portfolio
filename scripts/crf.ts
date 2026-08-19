#!/usr/bin/env node
/**
 * Clinical Research Form (CRF) CLI & TUI Guided Authoring Suite
 * Zero-dependency TypeScript command-line tool for CDISC 2.2 / Universal CRF Protocols
 *
 * Usage:
 *   npx tsx scripts/crf.ts <command> [options]
 *   npm run crf <command> [options]
 */

import fs from "fs";
import path from "path";
import readline from "readline";
import { getOncologyPresetSync, getPresetByIdSync } from "../lib/crf/presets/loader";
import { StudyProtocol } from "../lib/crf/types";
import {
  executeInfoCommand,
  executeValidateCommand,
  executeAddFormCommand,
  executeAddFieldCommand,
  executeExportCommand,
  executeDiffCommand,
  ansi,
  CliExecutionOptions,
} from "../lib/crf/cli-engine";
import { parseUniversalCrf, exportUniversalCrfJson } from "../lib/crf/universal-schema";

const DEFAULT_FILE = "study.crf.json";

function loadProtocolFromFileOrDefault(filePath?: string): { study: StudyProtocol; path: string } {
  const targetPath = filePath || path.resolve(process.cwd(), DEFAULT_FILE);
  if (fs.existsSync(targetPath)) {
    try {
      const raw = fs.readFileSync(targetPath, "utf-8");
      return { study: parseUniversalCrf(raw), path: targetPath };
    } catch {
      // Fallback
    }
  }
  return { study: getOncologyPresetSync(), path: targetPath };
}

function saveProtocolToFile(filePath: string, study: StudyProtocol): void {
  const serialized = exportUniversalCrfJson(study);
  fs.writeFileSync(filePath, serialized, "utf-8");
}

function printHelp(): void {
  console.log(`${ansi.bold}${ansi.underline}# CRF STUDIO CLI — Clinical Data Management Suite${ansi.reset}\n`);
  console.log(`${ansi.bold}Usage:${ansi.reset} crf <command> [file] [options]\n`);
  console.log(`${ansi.bold}Commands:${ansi.reset}`);
  console.log(`  ${ansi.cyan}info [file]${ansi.reset}                            Display study overview, CDASH domains & SoA visits`);
  console.log(`  ${ansi.cyan}validate [file]${ansi.reset}                        Audit CDISC CDASH 2.2, AST logic & SoA matrix`);
  console.log(`  ${ansi.cyan}wizard${ansi.reset}                                 Launch interactive step-by-step TUI authoring wizard`);
  console.log(`  ${ansi.cyan}init [name] [--preset <id>]${ansi.reset}            Scaffold new study protocol file (study.crf.json)`);
  console.log(`  ${ansi.cyan}add form <domain> [file]${ansi.reset}               Inject standard CDASH domain (e.g. DM, VS, AE, LB)`);
  console.log(`  ${ansi.cyan}add field <form> [file] --var <n> --type <t>${ansi.reset} Add clinical variable with unit and validation`);
  console.log(`  ${ansi.cyan}export [file] --format <odm|json|yaml|fhir|sas|r>${ansi.reset} Compile to regulatory metadata standards`);
  console.log(`  ${ansi.cyan}diff <file1> <file2>${ansi.reset}                   Compare semantic structural changes between protocols`);
  console.log(`  ${ansi.cyan}help${ansi.reset}                                   Show this help menu\n`);
  console.log(`${ansi.bold}Flags:${ansi.reset}`);
  console.log(`  ${ansi.dim}--json${ansi.reset}                                 Output structured machine-readable JSON`);
  console.log(`  ${ansi.dim}--dry-run${ansi.reset}                              Verify execution without writing changes to disk`);
  console.log(`  ${ansi.dim}--out <path>${ansi.reset}                           Write export output to specific file path\n`);
  console.log(`${ansi.bold}Examples:${ansi.reset}`);
  console.log(`  $ npm run crf info`);
  console.log(`  $ npm run crf validate study.crf.json`);
  console.log(`  $ npm run crf add form VS`);
  console.log(`  $ npm run crf add field VS --var SYSBP --type number --unit mmHg --required`);
  console.log(`  $ npm run crf export --format odm --out study-metadata.xml`);
  console.log(`  $ npm run crf wizard\n`);
}

/**
 * Interactive TUI Wizard for Terminal
 */
async function runInteractiveWizard(): Promise<void> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const question = (promptText: string): Promise<string> => {
    return new Promise((resolve) => rl.question(promptText, resolve));
  };

  console.log(`\n${ansi.bold}${ansi.brightCyan}╔══════════════════════════════════════════════════════════════╗${ansi.reset}`);
  console.log(`${ansi.bold}${ansi.brightCyan}║       CRF STUDIO: Guided Clinical TUI Authoring Wizard       ║${ansi.reset}`);
  console.log(`${ansi.bold}${ansi.brightCyan}╚══════════════════════════════════════════════════════════════╝${ansi.reset}\n`);

  console.log(`${ansi.dim}Step 1 of 4: Study Protocol Profile${ansi.reset}`);
  const protocolNumber = (await question(`Protocol Number [ONC-2026-001]: `)).trim() || "ONC-2026-001";
  const studyName = (await question(`Study Name [Phase III Immuno-Oncology Evaluation]: `)).trim() || "Phase III Immuno-Oncology Evaluation";
  const phase = (await question(`Phase (Phase I / Phase II / Phase III) [Phase III]: `)).trim() || "Phase III";
  const sponsor = (await question(`Sponsor Name [BioPharma Therapeutics]: `)).trim() || "BioPharma Therapeutics";

  let study: StudyProtocol = {
    id: `study_${Date.now()}`,
    protocolNumber,
    studyName,
    phase: phase as StudyProtocol["phase"],
    sponsor,
    therapeuticArea: "Oncology",
    version: "1.0",
    lastModified: new Date().toISOString(),
    forms: [],
    visits: [
      { id: "v_screen", oid: "SE.SCREENING", name: "Screening", visitType: "Scheduled", targetDay: 0, windowBefore: 0, windowAfter: 0, assignedFormIds: [] },
      { id: "v_c1d1", oid: "SE.C1D1", name: "Cycle 1 Day 1", visitType: "Scheduled", targetDay: 28, windowBefore: 3, windowAfter: 3, assignedFormIds: [] },
    ],
    codelists: [],
  };

  console.log(`\n${ansi.dim}Step 2 of 4: Standard CDASH Domains Scaffolding${ansi.reset}`);
  console.log(`Available domains: ${ansi.cyan}DM${ansi.reset} (Demographics), ${ansi.cyan}VS${ansi.reset} (Vital Signs), ${ansi.cyan}AE${ansi.reset} (Adverse Events), ${ansi.cyan}CM${ansi.reset} (ConMeds), ${ansi.cyan}LB${ansi.reset} (Labs)`);
  const domainsAnswer = (await question(`Select domains to inject (comma separated) [DM, VS, AE]: `)).trim() || "DM, VS, AE";

  const selectedDomains = domainsAnswer.split(",").map((d) => d.trim().toUpperCase()).filter(Boolean);
  for (const d of selectedDomains) {
    const res = executeAddFormCommand(study, d);
    if (res.updatedStudy) {
      study = res.updatedStudy;
    }
  }

  console.log(`\n${ansi.dim}Step 3 of 4: Schedule of Activities (SoA) Form Assignment${ansi.reset}`);
  study.visits[0].assignedFormIds = study.forms.filter((f) => f.domain === "DM" || f.domain === "VS").map((f) => f.id);
  study.visits[1].assignedFormIds = study.forms.filter((f) => f.domain === "VS" || f.domain === "AE").map((f) => f.id);
  console.log(`${ansi.green}✔ Assigned baseline forms (DM, VS) to Screening and (VS, AE) to Cycle 1 Day 1.${ansi.reset}`);

  console.log(`\n${ansi.dim}Step 4 of 4: Conformance Audit & Save${ansi.reset}`);
  const valResult = executeValidateCommand(study);
  console.log(valResult.document);

  const outFile = (await question(`Save Universal CRF JSON file to [study.crf.json]: `)).trim() || "study.crf.json";
  saveProtocolToFile(outFile, study);
  console.log(`\n${ansi.bold}${ansi.brightGreen}✔ Successfully created ${outFile} with ${study.forms.length} forms and ${study.visits.length} visits!${ansi.reset}`);
  console.log(`To inspect: ${ansi.cyan}npm run crf info ${outFile}${ansi.reset}\n`);

  rl.close();
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  if (args.length === 0 || args.includes("--help") || args.includes("-h") || args[0] === "help") {
    printHelp();
    return;
  }

  const options: CliExecutionOptions = {
    json: args.includes("--json"),
    dryRun: args.includes("--dry-run"),
  };

  const command = args[0];

  // 1. Wizard
  if (command === "wizard") {
    await runInteractiveWizard();
    return;
  }

  // 2. Init
  if (command === "init") {
    const presetIdx = args.indexOf("--preset");
    const presetId = presetIdx !== -1 ? args[presetIdx + 1] : undefined;
    const study = presetId ? getPresetByIdSync(presetId) || getOncologyPresetSync() : getOncologyPresetSync();
    const targetFile = args[1] && !args[1].startsWith("--") ? args[1] : DEFAULT_FILE;

    if (!options.dryRun) {
      saveProtocolToFile(targetFile, study);
    }
    console.log(`${ansi.bold}${ansi.brightGreen}✔ Initialized Universal CRF protocol at ${targetFile}${ansi.reset}`);
    return;
  }

  // 3. Info
  if (command === "info") {
    const fileArg = args[1] && !args[1].startsWith("--") ? args[1] : undefined;
    const { study } = loadProtocolFromFileOrDefault(fileArg);
    const result = executeInfoCommand(study, options);
    console.log(result.document);
    return;
  }

  // 4. Validate / Lint
  if (command === "validate" || command === "lint") {
    const fileArg = args[1] && !args[1].startsWith("--") ? args[1] : undefined;
    const { study } = loadProtocolFromFileOrDefault(fileArg);
    const result = executeValidateCommand(study, options);
    console.log(result.document);
    if (!result.success) {
      process.exit(1);
    }
    return;
  }

  // 5. Add Form
  if (command === "add" && args[1] === "form") {
    const domain = args[2] || "CUSTOM";
    const fileArg = args[3] && !args[3].startsWith("--") ? args[3] : DEFAULT_FILE;
    const { study, path: filePath } = loadProtocolFromFileOrDefault(fileArg);

    const result = executeAddFormCommand(study, domain, undefined, options);
    console.log(result.document);
    if (result.updatedStudy && !options.dryRun) {
      saveProtocolToFile(filePath, result.updatedStudy);
    }
    return;
  }

  // 6. Add Field
  if (command === "add" && args[1] === "field") {
    const formDomain = args[2] || "DM";
    const varIdx = args.indexOf("--var");
    const varName = varIdx !== -1 && args[varIdx + 1] ? args[varIdx + 1] : "TESTVAR";
    const typeIdx = args.indexOf("--type");
    const dataType = (typeIdx !== -1 && args[typeIdx + 1] ? args[typeIdx + 1] : "text") as Parameters<typeof executeAddFieldCommand>[2]["dataType"];
    const req = args.includes("--required");
    const unitIdx = args.indexOf("--unit");
    const unit = unitIdx !== -1 && args[unitIdx + 1] ? args[unitIdx + 1] : undefined;

    const fileArg = args.find((a, i) => i > 2 && !a.startsWith("--") && args[i - 1] !== "--var" && args[i - 1] !== "--type" && args[i - 1] !== "--unit");
    const { study, path: filePath } = loadProtocolFromFileOrDefault(fileArg);

    const result = executeAddFieldCommand(study, formDomain, { variableName: varName, dataType, required: req, unit }, options);
    console.log(result.document);
    if (result.updatedStudy && !options.dryRun) {
      saveProtocolToFile(filePath, result.updatedStudy);
    }
    return;
  }

  // 7. Export
  if (command === "export") {
    const fmtIdx = args.indexOf("--format");
    const fmt = (fmtIdx !== -1 && args[fmtIdx + 1] ? args[fmtIdx + 1] : "json") as Parameters<typeof executeExportCommand>[1];
    const outIdx = args.indexOf("--out");
    const outPath = outIdx !== -1 ? args[outIdx + 1] : undefined;

    const fileArg = args.find((a, i) => i > 0 && !a.startsWith("--") && args[i - 1] !== "--format" && args[i - 1] !== "--out");
    const { study } = loadProtocolFromFileOrDefault(fileArg);

    const result = executeExportCommand(study, fmt, options);
    if (!result.success) {
      console.error(result.document);
      process.exit(1);
    }

    if (outPath && !options.dryRun) {
      fs.writeFileSync(outPath, result.document, "utf-8");
      console.log(`${ansi.bold}${ansi.brightGreen}✔ Exported ${fmt.toUpperCase()} metadata to ${outPath}${ansi.reset}`);
    } else {
      console.log(result.document);
    }
    return;
  }

  // 8. Diff
  if (command === "diff") {
    const fileA = args[1];
    const fileB = args[2];
    if (!fileA || !fileB) {
      console.error(`${ansi.brightRed}Usage: crf diff <file1> <file2>${ansi.reset}`);
      process.exit(1);
    }

    const studyA = parseUniversalCrf(fs.readFileSync(fileA, "utf-8"));
    const studyB = parseUniversalCrf(fs.readFileSync(fileB, "utf-8"));

    const result = executeDiffCommand(studyA, studyB, options);
    console.log(result.document);
    return;
  }

  printHelp();
}

main().catch((err) => {
  console.error(`${ansi.brightRed}Fatal error:${ansi.reset}`, err);
  process.exit(1);
});
