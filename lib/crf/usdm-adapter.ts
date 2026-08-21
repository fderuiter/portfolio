/**
 * CDISC USDM (Unified Study Data Model) Bidirectional Graph Adapter & Diff Engine
 * Facilitates loss-free conversion between CRF Studio protocols and CDISC USDM graph JSON specifications.
 */

import {
  StudyProtocol,
  CRFForm,
  CRFField,
  CRFSection,
  StudyVisit,
  StudyArm,
  StudyEpoch,
  StudyCohort,
  BiomedicalConcept,
} from "./types";
import { validateUniversalCrf } from "./universal-schema";

export interface UsdmBiomedicalConceptProperty {
  id: string;
  name: string;
  code?: string;
  datatype?: string;
}

export interface UsdmBiomedicalConcept {
  id: string;
  name: string;
  conceptId?: string;
  code?: string;
  domain?: string;
  synonyms?: string[];
  properties?: UsdmBiomedicalConceptProperty[] | Record<string, unknown>;
  variableName?: string;
  dataType?: string;
  label?: string;
  unit?: string;
}

export interface UsdmArm {
  id: string;
  name: string;
  type: string;
  description?: string;
  epochIds?: string[];
}

export interface UsdmEpoch {
  id: string;
  name: string;
  sequenceNumber: number;
  type?: string;
  description?: string;
}

export interface UsdmCohort {
  id: string;
  name: string;
  description?: string;
  armIds?: string[];
  targetSize?: number;
}

export interface UsdmEncounter {
  id: string;
  oid?: string;
  name: string;
  type: "Scheduled" | "Unscheduled" | "Common";
  targetDay: number;
  timepointDays?: number;
  windowBefore: number;
  windowAfter: number;
  epochId?: string;
  armIds?: string[];
  assignedFormIds?: string[];
  armFormAssignments?: Record<string, string[]>;
  isRepeating?: boolean;
  repeatMax?: number;
}

export interface UsdmActivity {
  id: string;
  name: string;
  domain: string;
  description?: string;
  version?: string;
  sections?: CRFForm["sections"];
  rules?: CRFForm["rules"];
  isLogForm?: boolean;
}

export interface UsdmStudyDesign {
  id: string;
  name: string;
  arms: UsdmArm[];
  epochs: UsdmEpoch[];
  cohorts: UsdmCohort[];
  encounters: UsdmEncounter[];
  activities: UsdmActivity[];
  biomedicalConcepts: UsdmBiomedicalConcept[];
}

export interface UsdmStudy {
  id: string;
  name?: string;
  title?: string;
  protocolNumber?: string;
  protocolId?: string;
  phase?: string;
  sponsor?: string;
  therapeuticArea?: string;
  version?: string;
  lastModified?: string;
  studyDesigns?: UsdmStudyDesign[];
  arms?: UsdmArm[];
  epochs?: UsdmEpoch[];
  cohorts?: UsdmCohort[];
  encounters?: UsdmEncounter[];
  activities?: UsdmActivity[];
  biomedicalConcepts?: UsdmBiomedicalConcept[];
}

export interface UsdmDocument {
  $schema?: string;
  schemaVersion?: string;
  study: UsdmStudy;
}

export interface UsdmDiffSummary {
  protocolNumber: string;
  hasChanges: boolean;
  addedArms: string[];
  removedArms: string[];
  addedEpochs: string[];
  removedEpochs: string[];
  addedCohorts: string[];
  removedCohorts: string[];
  addedConcepts: string[];
  removedConcepts: string[];
  modifiedConcepts: string[];
  addedEncounters: string[];
  removedEncounters: string[];
  modifiedEncounters: string[];
  addedActivities: string[];
  removedActivities: string[];
}

/**
 * Transforms a CRF Studio StudyProtocol into a CDISC USDM Graph representation.
 * Decouples field-level presentation properties into independent BiomedicalConcept nodes.
 * Maps linear visit target days to epoch-based encounter schedules.
 */
export function exportStudyToUsdmObject(study: StudyProtocol): UsdmDocument {
  const biomedicalConcepts: UsdmBiomedicalConcept[] = (study.biomedicalConcepts || []).map((bc) => ({
    id: bc.id,
    name: bc.name,
    conceptId: bc.conceptId || bc.code || bc.id,
    code: bc.code,
    domain: bc.domain,
    synonyms: bc.synonyms || [bc.variableName || bc.id, bc.label || bc.name].filter((s): s is string => Boolean(s)),
    properties: bc.properties || {},
    variableName: bc.variableName,
    dataType: bc.dataType,
    label: bc.label,
    unit: bc.unit,
  }));
  const conceptIdSet = new Set(biomedicalConcepts.map((bc) => bc.id));

  const domainVarMap = new Map<string, UsdmBiomedicalConcept>();
  biomedicalConcepts.forEach((bc) => {
    if (bc.domain && bc.variableName) {
      domainVarMap.set(`${bc.domain.toUpperCase()}_${bc.variableName.toUpperCase()}`, bc);
    }
  });

  // Clone forms so we don't mutate original
  const forms: CRFForm[] = JSON.parse(JSON.stringify(study.forms || []));

  forms.forEach((form) => {
    form.sections?.forEach((section) => {
      section.fields?.forEach((field) => {
        let conceptId = field.conceptId;

        if (!conceptId) {
          const key = `${form.domain.toUpperCase()}_${field.variableName.toUpperCase()}`;
          const existing = domainVarMap.get(key);
          if (existing) {
            conceptId = existing.id;
          } else {
            conceptId = `bc_${form.domain.toLowerCase()}_${field.variableName.toLowerCase()}`;
          }
          field.conceptId = conceptId;
        }

        if (!conceptIdSet.has(conceptId)) {
          conceptIdSet.add(conceptId);
          const newConcept: UsdmBiomedicalConcept = {
            id: conceptId,
            name: field.label,
            conceptId: field.cdashMetadata?.nciConceptId || conceptId,
            code: field.cdashMetadata?.nciConceptId,
            domain: form.domain,
            synonyms: [field.variableName, field.label],
            properties: {
              dataType: field.dataType,
              required: field.required,
              cdashMetadata: field.cdashMetadata,
              codelistId: field.codelistId,
              unit: field.unit,
              minValue: field.minValue,
              maxValue: field.maxValue,
              calculationFormula: field.calculationFormula,
            },
            variableName: field.variableName,
            dataType: field.dataType,
            label: field.label,
            unit: field.unit,
          };
          biomedicalConcepts.push(newConcept);
          if (form.domain && field.variableName) {
            domainVarMap.set(`${form.domain.toUpperCase()}_${field.variableName.toUpperCase()}`, newConcept);
          }
        }
      });
    });
  });

  const encounters: UsdmEncounter[] = (study.visits || []).map((v) => ({
    id: v.id,
    oid: v.oid,
    name: v.name,
    type: v.visitType,
    targetDay: v.targetDay,
    timepointDays: v.timepointDays,
    windowBefore: v.windowBefore,
    windowAfter: v.windowAfter,
    epochId: v.epochId,
    armIds: v.armIds,
    assignedFormIds: v.assignedFormIds || [],
    armFormAssignments: v.armFormAssignments,
    isRepeating: v.isRepeating,
    repeatMax: v.repeatMax,
  }));

  const activities: UsdmActivity[] = forms.map((f) => ({
    id: f.id,
    name: f.name,
    domain: f.domain,
    description: f.description,
    version: f.version,
    sections: f.sections,
    rules: f.rules,
    isLogForm: f.isLogForm,
  }));

  const primaryDesign: UsdmStudyDesign = {
    id: "design_main",
    name: study.studyName || "Main Study Design",
    arms: (study.arms || []).map((a) => ({
      id: a.id,
      name: a.name,
      type: a.type,
      description: a.description,
      epochIds: a.epochIds,
    })),
    epochs: (study.epochs || []).map((e) => ({
      id: e.id,
      name: e.name,
      sequenceNumber: e.sequenceNumber,
      type: e.type,
      description: e.description,
    })),
    cohorts: (study.cohorts || []).map((c) => ({
      id: c.id,
      name: c.name,
      description: c.description,
      armIds: c.armIds,
      targetSize: c.targetSize,
    })),
    encounters,
    activities,
    biomedicalConcepts,
  };

  return {
    $schema: "https://www.cdisc.org/schemas/usdm/v3/usdm.schema.json",
    schemaVersion: "3.0.0",
    study: {
      id: study.id,
      name: study.protocolNumber || study.id,
      title: study.studyName,
      protocolNumber: study.protocolNumber,
      protocolId: study.protocolId || study.protocolNumber,
      phase: study.phase,
      sponsor: study.sponsor,
      therapeuticArea: study.therapeuticArea,
      version: study.version,
      lastModified: study.lastModified,
      studyDesigns: [primaryDesign],
    },
  };
}

/**
 * Serializes a StudyProtocol into standard CDISC USDM JSON string.
 */
export function exportStudyToUsdm(study: StudyProtocol, pretty = true): string {
  const usdmObj = exportStudyToUsdmObject(study);
  return pretty ? JSON.stringify(usdmObj, null, 2) : JSON.stringify(usdmObj);
}

/**
 * Imports a CDISC USDM JSON document or object into an internal CRF Studio StudyProtocol.
 * Reassembles linear encounter schedules into visit sequences and resolves decoupled BiomedicalConcept definitions.
 */
export function importStudyFromUsdm(usdmInput: string | UsdmDocument | Record<string, unknown>): StudyProtocol {
  const doc = (typeof usdmInput === "string" ? JSON.parse(usdmInput) : usdmInput) as Record<string, unknown> & UsdmDocument;

  // Support direct StudyProtocol JSON fallback if user pasted a Universal CRF JSON
  if (doc.forms && doc.visits && doc.protocolNumber) {
    const val = validateUniversalCrf(doc as unknown as StudyProtocol);
    if (val.success) return val.study!;
  }

  const studyObj = (doc.study || doc) as UsdmStudy & Record<string, unknown>;
  const primaryDesign = ((studyObj.studyDesigns && studyObj.studyDesigns[0]) || {}) as UsdmStudyDesign & Record<string, unknown>;

  const arms: StudyArm[] = primaryDesign.arms || studyObj.arms || [];
  const epochs: StudyEpoch[] = primaryDesign.epochs || studyObj.epochs || [];
  const cohorts: StudyCohort[] = primaryDesign.cohorts || studyObj.cohorts || [];

  const rawConcepts: UsdmBiomedicalConcept[] =
    primaryDesign.biomedicalConcepts || studyObj.biomedicalConcepts || [];

  const conceptMap = new Map<string, UsdmBiomedicalConcept>();
  rawConcepts.forEach((bc) => conceptMap.set(bc.id, bc));

  const biomedicalConcepts: BiomedicalConcept[] = rawConcepts.map((bc) => ({
    id: bc.id,
    name: bc.name,
    conceptId: bc.conceptId || bc.code || bc.id,
    code: bc.code,
    domain: bc.domain,
    synonyms: bc.synonyms,
    properties: bc.properties,
    variableName: bc.variableName,
    dataType: bc.dataType,
    label: bc.label,
    unit: bc.unit,
  }));

  const rawEncounters: UsdmEncounter[] = primaryDesign.encounters || studyObj.encounters || [];
  const visits: StudyVisit[] = rawEncounters.map((enc) => ({
    id: enc.id,
    oid: enc.oid || `SE.${enc.id.toUpperCase()}`,
    name: enc.name,
    visitType: enc.type || "Scheduled",
    targetDay: typeof enc.targetDay === "number" ? enc.targetDay : 0,
    timepointDays: enc.timepointDays,
    windowBefore: typeof enc.windowBefore === "number" ? enc.windowBefore : 0,
    windowAfter: typeof enc.windowAfter === "number" ? enc.windowAfter : 0,
    assignedFormIds: enc.assignedFormIds || [],
    armFormAssignments: enc.armFormAssignments,
    epochId: enc.epochId,
    armIds: enc.armIds,
    isRepeating: enc.isRepeating,
    repeatMax: enc.repeatMax,
  }));

  const rawActivities: UsdmActivity[] = primaryDesign.activities || studyObj.activities || (studyObj.forms as unknown as UsdmActivity[]) || [];
  const forms: CRFForm[] = rawActivities.map((act) => {
    const sections: CRFSection[] = (act.sections || []).map((sec) => ({
      ...sec,
      fields: (sec.fields || []).map((fld: CRFField) => {
        const matchingConcept = fld.conceptId ? conceptMap.get(fld.conceptId) : undefined;
        return {
          ...fld,
          variableName: fld.variableName || matchingConcept?.variableName || fld.id,
          label: fld.label || matchingConcept?.label || matchingConcept?.name || fld.variableName || fld.id,
          dataType: fld.dataType || matchingConcept?.dataType || "text",
          unit: fld.unit || matchingConcept?.unit,
        };
      }),
    }));

    return {
      id: act.id,
      name: act.name,
      domain: act.domain || "GENERAL",
      description: act.description || "",
      version: act.version || "1.0",
      sections,
      rules: act.rules || [],
      isLogForm: act.isLogForm,
    };
  });

  const protocol: StudyProtocol = {
    $schema: "https://www.deruiter.dev/schemas/crf/v1/universal-crf.schema.json",
    schemaVersion: "1.0.0",
    id: studyObj.id || "imported_usdm_study",
    protocolNumber: studyObj.protocolNumber || studyObj.name || "USDM-STUDY",
    studyName: studyObj.title || studyObj.name || "Imported USDM Protocol",
    phase: (studyObj.phase as StudyProtocol["phase"]) || "Phase III",
    sponsor: studyObj.sponsor || "Clinical Sponsor",
    therapeuticArea: studyObj.therapeuticArea || "General Medicine",
    version: studyObj.version || "1.0",
    lastModified: studyObj.lastModified || new Date().toISOString(),
    forms,
    visits,
    codelists: (studyObj.codelists as StudyProtocol["codelists"]) || [],
    branding: studyObj.branding as StudyProtocol["branding"],
    arms,
    epochs,
    cohorts,
    biomedicalConcepts,
  };

  return protocol;
}

/**
 * Performs semantic version diffing between two USDM protocol revisions.
 * Identifies added, modified, or removed arms, epochs, cohorts, biomedical concepts, encounters, and activities.
 */
export function diffUsdmProtocols(
  usdmAInput: string | UsdmDocument | Record<string, unknown>,
  usdmBInput: string | UsdmDocument | Record<string, unknown>
): UsdmDiffSummary {
  const studyA = importStudyFromUsdm(usdmAInput);
  const studyB = importStudyFromUsdm(usdmBInput);

  const docB = (typeof usdmBInput === "string" ? JSON.parse(usdmBInput) : usdmBInput) as Record<string, unknown> & UsdmDocument;
  const protocolNumber = studyB.protocolNumber || (docB?.study?.protocolNumber as string) || "USDM-STUDY";

  const armsA = new Set((studyA.arms || []).map((a) => a.id));
  const armsB = new Set((studyB.arms || []).map((a) => a.id));
  const addedArms = [...armsB].filter((a) => !armsA.has(a));
  const removedArms = [...armsA].filter((a) => !armsB.has(a));

  const epochsA = new Set((studyA.epochs || []).map((e) => e.id));
  const epochsB = new Set((studyB.epochs || []).map((e) => e.id));
  const addedEpochs = [...epochsB].filter((e) => !epochsA.has(e));
  const removedEpochs = [...epochsA].filter((e) => !epochsB.has(e));

  const cohortsA = new Set((studyA.cohorts || []).map((c) => c.id));
  const cohortsB = new Set((studyB.cohorts || []).map((c) => c.id));
  const addedCohorts = [...cohortsB].filter((c) => !cohortsA.has(c));
  const removedCohorts = [...cohortsA].filter((c) => !cohortsB.has(c));

  const conceptMapA = new Map((studyA.biomedicalConcepts || []).map((c) => [c.id, c]));
  const conceptMapB = new Map((studyB.biomedicalConcepts || []).map((c) => [c.id, c]));
  const addedConcepts: string[] = [];
  const removedConcepts: string[] = [];
  const modifiedConcepts: string[] = [];

  for (const [id, cB] of conceptMapB.entries()) {
    if (!conceptMapA.has(id)) {
      addedConcepts.push(id);
    } else {
      const cA = conceptMapA.get(id)!;
      if (
        cA.name !== cB.name ||
        cA.conceptId !== cB.conceptId ||
        cA.variableName !== cB.variableName ||
        cA.dataType !== cB.dataType ||
        cA.unit !== cB.unit
      ) {
        modifiedConcepts.push(id);
      }
    }
  }
  for (const id of conceptMapA.keys()) {
    if (!conceptMapB.has(id)) {
      removedConcepts.push(id);
    }
  }

  const visitMapA = new Map((studyA.visits || []).map((v) => [v.id, v]));
  const visitMapB = new Map((studyB.visits || []).map((v) => [v.id, v]));
  const addedEncounters: string[] = [];
  const removedEncounters: string[] = [];
  const modifiedEncounters: string[] = [];

  for (const [id, vB] of visitMapB.entries()) {
    if (!visitMapA.has(id)) {
      addedEncounters.push(id);
    } else {
      const vA = visitMapA.get(id)!;
      if (
        vA.name !== vB.name ||
        vA.targetDay !== vB.targetDay ||
        vA.windowBefore !== vB.windowBefore ||
        vA.windowAfter !== vB.windowAfter ||
        vA.epochId !== vB.epochId ||
        JSON.stringify(vA.assignedFormIds) !== JSON.stringify(vB.assignedFormIds) ||
        JSON.stringify(vA.armFormAssignments) !== JSON.stringify(vB.armFormAssignments)
      ) {
        modifiedEncounters.push(id);
      }
    }
  }
  for (const id of visitMapA.keys()) {
    if (!visitMapB.has(id)) {
      removedEncounters.push(id);
    }
  }

  const formMapA = new Map((studyA.forms || []).map((f) => [f.id, f]));
  const formMapB = new Map((studyB.forms || []).map((f) => [f.id, f]));
  const addedActivities = [...formMapB.keys()].filter((id) => !formMapA.has(id));
  const removedActivities = [...formMapA.keys()].filter((id) => !formMapB.has(id));

  const hasChanges =
    addedArms.length > 0 ||
    removedArms.length > 0 ||
    addedEpochs.length > 0 ||
    removedEpochs.length > 0 ||
    addedCohorts.length > 0 ||
    removedCohorts.length > 0 ||
    addedConcepts.length > 0 ||
    removedConcepts.length > 0 ||
    modifiedConcepts.length > 0 ||
    addedEncounters.length > 0 ||
    removedEncounters.length > 0 ||
    modifiedEncounters.length > 0 ||
    addedActivities.length > 0 ||
    removedActivities.length > 0;

  return {
    protocolNumber,
    hasChanges,
    addedArms,
    removedArms,
    addedEpochs,
    removedEpochs,
    addedCohorts,
    removedCohorts,
    addedConcepts,
    removedConcepts,
    modifiedConcepts,
    addedEncounters,
    removedEncounters,
    modifiedEncounters,
    addedActivities,
    removedActivities,
  };
}
