import { StudyProtocol } from "../types";
import { ONCOLOGY_RECIST_PRESET } from "./oncology-recist";
import { CNS_NEURO_PRESET } from "./cns-neuro";
import { PK_ESCALATION_PRESET } from "./pk-dose-escalation";
import { CLINICAL_INSTRUMENTS_PRESET } from "./clinical-instruments";
import { EMPTY_STUDY_PRESET } from "./empty-study";

export interface PresetCatalogItem {
  id: string;
  name: string;
  phase: string;
  therapeuticArea: string;
  description: string;
  study: StudyProtocol;
}

export const STUDY_PRESETS: PresetCatalogItem[] = [
  {
    id: "oncology_recist",
    name: "Phase III Oncology Solid Tumor (RECIST 1.1)",
    phase: "Phase III",
    therapeuticArea: "Oncology",
    description: "Dual immunotherapy trial with continuous AE/CM logs, CTCAE grading, and automated RECIST 1.1 tumor burden SLD derivations.",
    study: ONCOLOGY_RECIST_PRESET,
  },
  {
    id: "clinical_instruments",
    name: "Digital Health & Safety (PRO-CTCAE, PHQ-9, ECG QTc, SAE)",
    phase: "Phase II",
    therapeuticArea: "Digital Health / Cardiology / Safety",
    description: "Validated Patient-Reported Outcomes (PHQ-9), 12-Lead ECG with automated Bazett/Fridericia QTc calculations, and Expedited Oncology SAE reporting.",
    study: CLINICAL_INSTRUMENTS_PRESET,
  },
  {
    id: "cns_neuro",
    name: "Phase II CNS / Alzheimer's Cognitive Trial",
    phase: "Phase II",
    therapeuticArea: "Neurology",
    description: "Anti-amyloid antibody study featuring standardized MMSE cognitive battery with automated subscore roll-ups and impairment alerts.",
    study: CNS_NEURO_PRESET,
  },
  {
    id: "pk_escalation",
    name: "Phase I First-in-Human PK Dose Escalation",
    phase: "Phase I",
    therapeuticArea: "Early Development",
    description: "Intensive serial pharmacokinetic blood sampling matrix with DLT monitoring and strict dosing condition rules.",
    study: PK_ESCALATION_PRESET,
  },
  {
    id: "custom_blank",
    name: "Blank Starter Canvas",
    phase: "Custom",
    therapeuticArea: "General",
    description: "Clean slate protocol template with essential CDASH demographic baselines and custom widget canvas.",
    study: EMPTY_STUDY_PRESET,
  },
];
