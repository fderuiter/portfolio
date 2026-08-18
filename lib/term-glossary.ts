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
