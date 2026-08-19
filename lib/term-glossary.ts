export interface TermDefinition {
  key: string;
  canonical: string;
  simplified: string;
  definition: string;
  aliases?: string[];
}

export const CANONICAL_GLOSSARY: TermDefinition[] = [
  {
    key: "gxp-term",
    canonical: "GxP",
    simplified: "industry-standard",
    definition:
      "Good Practice standards (such as GCP or GLP) governing clinical trial design, conduct, and data integrity.",
    aliases: ["Good Practice"],
  },
  {
    key: "ecrf-term",
    canonical: "eCRF",
    simplified: "digital case report form",
    definition:
      "electronic Case Report Form. A digital questionnaire used to collect clinical trial data from research sites.",
    aliases: ["eCRFs"],
  },
  {
    key: "sdv-term",
    canonical: "Source Document Verification (SDV)",
    simplified: "record verification",
    definition:
      "Source Document Verification. The process of cross-referencing case report forms against original medical records to ensure accuracy.",
    aliases: ["Source Document Verification", "SDV"],
  },
  {
    key: "cdisc-term",
    canonical: "CDISC",
    simplified: "clinical data standard",
    definition:
      "Clinical Data Interchange Standards Consortium. The international standard organization setting data formats for medical research and FDA submissions.",
    aliases: ["CDISC Controlled Terminology"],
  },
  {
    key: "sdtm-term",
    canonical: "SDTM",
    simplified: "standard clinical data model",
    definition:
      "Study Data Tabulation Model. The FDA-mandated standard structure for tabulating clinical trial data.",
  },
  {
    key: "odm-term",
    canonical: "CDISC Operational Data Model (ODM)",
    simplified: "standard data exchange format",
    definition:
      "Operational Data Model. An XML-based vendor-neutral standard for exchanging clinical trial metadata and data.",
    aliases: ["CDISC ODM", "ODM"],
  },
  {
    key: "21-cfr-part-11-term",
    canonical: "21 CFR Part 11",
    simplified: "electronic record compliance",
    definition:
      "FDA regulation governing electronic records, electronic signatures, and audit trails in clinical research.",
    aliases: ["Part 11"],
  },
  {
    key: "21-cfr-812-term",
    canonical: "21 CFR 812",
    simplified: "investigational device regulation",
    definition:
      "FDA regulation governing Investigational Device Exemptions (IDE) and device accountability in clinical trials.",
  },
  {
    key: "edc-term",
    canonical: "Electronic Data Capture (EDC)",
    simplified: "electronic data system",
    definition:
      "Electronic Data Capture. Software used to collect and manage clinical trial data digitally.",
    aliases: ["Electronic Data Capture", "EDC"],
  },
  {
    key: "freesurfer-term",
    canonical: "FreeSurfer",
    simplified: "brain imaging software",
    definition:
      "An open-source neuroimaging software suite for processing and analyzing brain MRI images.",
  },
  {
    key: "redcap-term",
    canonical: "REDCap",
    simplified: "secure research database",
    definition:
      "Research Electronic Data Capture. A secure web application for building and managing online surveys and research databases.",
  },
  {
    key: "hipaa-term",
    canonical: "HIPAA",
    simplified: "patient privacy rules",
    definition:
      "Health Insurance Portability and Accountability Act. Federal law protecting sensitive patient health information.",
  },
  {
    key: "irb-term",
    canonical: "IRB",
    simplified: "ethics review board",
    definition:
      "Institutional Review Board. An administrative body established to protect the rights and welfare of human research subjects.",
  },
  {
    key: "sae-term",
    canonical: "SAE",
    simplified: "serious adverse event",
    definition:
      "Serious Adverse Event. An untoward medical occurrence in a clinical study subject resulting in death, hospitalization, or disability.",
  },
  {
    key: "dmp-term",
    canonical: "DMP",
    simplified: "data management plan",
    definition:
      "Data Management Plan. A formal document outlining how research data will be handled during and after a study.",
  },
  {
    key: "mri-term",
    canonical: "3T MRI",
    simplified: "brain scan imaging",
    definition:
      "High-field magnetic resonance imaging operating at 3 Tesla magnetic field strength.",
  },
  {
    key: "epic-term",
    canonical: "Epic Super User",
    simplified: "hospital database specialist",
    definition:
      "A clinical specialist trained to troubleshoot, optimize, and train staff on Epic electronic health record (EHR) software.",
    aliases: ["Epic SlicerDicer", "Epic for Research"],
  },
  {
    key: "zod-term",
    canonical: "Zod",
    simplified: "schema validation tool",
    definition:
      "A TypeScript-first schema declaration and validation library with static type inference.",
  },
  {
    key: "ast-term",
    canonical: "Abstract Syntax Tree (AST)",
    simplified: "code structure tree",
    definition:
      "Abstract Syntax Tree. A hierarchical tree representation of the syntactic structure of source code or logical expressions.",
    aliases: ["AST"],
  },
  {
    key: "phi-term",
    canonical: "Patient Health Information (PHI)",
    simplified: "protected health records",
    definition:
      "Patient Health Information. Sensitive health data protected under federal privacy standards.",
    aliases: ["Patient Health Information", "PHI"],
  },
  {
    key: "tls-term",
    canonical: "TLS 1.3",
    simplified: "secure internet encryption",
    definition:
      "Transport Layer Security. An encrypted communication protocol protecting data transfers across internet networks.",
    aliases: ["TLS"],
  },
  {
    key: "pydantic-term",
    canonical: "Pydantic",
    simplified: "data validation library",
    definition:
      "A Python data validation and settings management library using type annotations.",
    aliases: ["Pydantic v2"],
  },
  {
    key: "json-schema-term",
    canonical: "JSON Schema",
    simplified: "data structure blueprint",
    definition:
      "A vocabulary and standard for annotating, structuring, and validating JSON data documents.",
    aliases: ["JSON Schema Draft-07"],
  },
  {
    key: "dag-term",
    canonical: "Directed Acyclic Graph (DAG)",
    simplified: "ordered task network",
    definition:
      "Directed Acyclic Graph. A directed structural graph with no closed loops, used to order computational workflows.",
    aliases: ["Directed Acyclic Graph", "DAG"],
  },
  {
    key: "openapi-term",
    canonical: "OpenAPI",
    simplified: "API specification standard",
    definition:
      "A standard specification language for defining, describing, and documenting RESTful web APIs.",
    aliases: ["OpenAPI v3"],
  },
  {
    key: "sax-term",
    canonical: "SAX parser",
    simplified: "stream XML reader",
    definition:
      "Simple API for XML. A sequential stream-based parsing method for reading large XML files without high memory usage.",
    aliases: ["SAX", "sax-js"],
  },
  {
    key: "zustand-term",
    canonical: "Zustand",
    simplified: "application state manager",
    definition:
      "A lightweight, fast state management library for managing shared application state in React.",
  },
  {
    key: "cdash-term",
    canonical: "CDASH",
    simplified: "clinical data collection standard",
    definition:
      "Clinical Data Acquisition Standards Harmonization. CDISC standard defining basic data collection fields in clinical study forms.",
    aliases: ["CDISC CDASH", "CDASH 2.2"],
  },
  {
    key: "acrf-term",
    canonical: "Annotated CRF (aCRF)",
    simplified: "annotated case report form",
    definition:
      "Annotated Case Report Form. A blank clinical form mapping individual data entry fields directly to CDISC SDTM submission variables.",
    aliases: ["Annotated CRF", "aCRF", "aCRFs"],
  },
  {
    key: "web-worker-term",
    canonical: "Web Worker",
    simplified: "background browser worker",
    definition:
      "A background browser thread executing scripts independently of the main UI thread to prevent interface freezing.",
    aliases: ["Web Workers"],
  },
  {
    key: "roc-auc-term",
    canonical: "ROC-AUC",
    simplified: "model classification score",
    definition:
      "Receiver Operating Characteristic Area Under Curve. A performance metric measuring classification discrimination across diagnostic thresholds.",
    aliases: ["ROC-AUC", "AUC-ROC", "Area Under the Curve"],
  },
  {
    key: "pr-auc-term",
    canonical: "PR-AUC",
    simplified: "precision-recall accuracy score",
    definition:
      "Precision-Recall Area Under Curve. A classification metric evaluating positive prediction accuracy on imbalanced clinical datasets.",
    aliases: ["PR-AUC", "Precision-Recall AUC"],
  },
  {
    key: "adversarial-validation-term",
    canonical: "Adversarial Validation",
    simplified: "data shift detector",
    definition:
      "A machine learning technique that trains a binary classifier to distinguish training from test data to detect feature distribution drift.",
    aliases: ["Adversarial Validation"],
  },
  {
    key: "shap-term",
    canonical: "SHAP",
    simplified: "model explanation metric",
    definition:
      "SHapley Additive exPlanations. A game-theoretic approach to explain individual predictions by computing feature contributions.",
    aliases: ["SHAP values", "Shapley Additive exPlanations"],
  },
  {
    key: "epa-term",
    canonical: "Expected Points Added (EPA)",
    simplified: "expected play value",
    definition:
      "Expected Points Added. A sports analytics metric quantifying the net value of an individual play relative to baseline historical expectation.",
    aliases: ["Expected Points Added", "EPA"],
  },
  {
    key: "monte-carlo-term",
    canonical: "Monte Carlo Simulation",
    simplified: "probability simulation",
    definition:
      "A computational algorithm that relies on repeated random sampling to compute numerical probability distributions and risk outcomes.",
    aliases: ["Monte Carlo", "Monte Carlo Simulation"],
  },
  {
    key: "rag-term",
    canonical: "Retrieval-Augmented Generation (RAG)",
    simplified: "search-enhanced AI",
    definition:
      "Retrieval-Augmented Generation. An architecture that retrieves external reference documents into an LLM context window to ground responses.",
    aliases: ["RAG", "Retrieval-Augmented Generation"],
  },
  {
    key: "prompt-drift-term",
    canonical: "Prompt Drift",
    simplified: "AI prompt degradation",
    definition:
      "Gradual degradation in LLM prompt effectiveness or output format adherence resulting from upstream model version updates.",
    aliases: ["Prompt Drift"],
  },
  {
    key: "semver-term",
    canonical: "Semantic Versioning (SemVer)",
    simplified: "software version rules",
    definition:
      "A formal software versioning convention using MAJOR.MINOR.PATCH to signal breaking changes, features, and fixes.",
    aliases: ["Semantic Versioning", "SemVer"],
  },
];

export function getGlossaryKeyMap(
  glossary: TermDefinition[] = CANONICAL_GLOSSARY
): Map<string, TermDefinition> {
  const map = new Map<string, TermDefinition>();
  for (const entry of glossary) {
    map.set(entry.key, entry);
  }
  return map;
}

export function getSortedTermEntries(
  glossary: TermDefinition[] = CANONICAL_GLOSSARY
): Array<{ phrase: string; entry: TermDefinition }> {
  const list: Array<{ phrase: string; entry: TermDefinition }> = [];

  for (const entry of glossary) {
    list.push({ phrase: entry.canonical, entry });
    if (entry.aliases) {
      for (const alias of entry.aliases) {
        list.push({ phrase: alias, entry });
      }
    }
  }

  list.sort((a, b) => b.phrase.length - a.phrase.length);
  return list;
}
