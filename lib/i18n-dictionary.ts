import { compileTerms } from "./term-compiler";

export interface TimelineItem {
  role: string;
  company: string;
  period: string;
  recruiterDescription: string;
  realityDescription: string;
  tags: string[];
}

export interface DomainItem {
  id: string;
  title: string;
  tooltip: string;
  description: string;
}

export interface Dictionary {
  bio: {
    title: string;
    subtitle: string;
    description: string;
  };
  domains: {
    title: string;
    items: DomainItem[];
  };
  timeline: TimelineItem[];
}

const rawTimelineDetailed: TimelineItem[] = [
  {
    role: "Clinical Data Specialist",
    company: "BRIGHT Research Partners, Inc.",
    period: "March 2023 — Present",
    recruiterDescription:
      "Lead technical architect for GxP-compliant eClinical databases, translating 100+ page scientific protocols into validated eCRF systems. Engineer automated cross-form edit checks and dynamic logic rules to enforce protocol compliance and point-of-entry data integrity. Manage clinical data lifecycles (DMP authoring, SAE reconciliation, database locks) and administer 21 CFR 812 investigational device accountability.",
    realityDescription:
      "Translating dense 150-page clinical trial protocols into relational schemas and dynamic eCRFs. Developing cross-form edit check suites to catch edge-case clinician input discrepancies at point-of-entry, and maintaining 100% device traceability under 21 CFR 812.",
    tags: ["GxP Systems", "21 CFR 812", "eCRF Architecture", "Edit Checks", "DMP Authoring", "SAE Reconciliation", "iMednet"]
  },
  {
    role: "Research Program Coordinator",
    company: "Mayo Clinic",
    period: "July 2021 — March 2023",
    recruiterDescription:
      "Pioneered an EHR-based recruitment pipeline using SlicerDicer and MyChart, resulting in a 5x increase in qualified participant enrollment (10 to 50+/month) and a 25% reduction in screen failures. Architected production REDCap databases, executed Linux-based FreeSurfer C pipelines processing 3T MRI scans for volumetric brain segmentation, innovated 3D-printable STL workflows for participant brain models, and prepared NIH DSMB data safety dossiers.",
    realityDescription:
      "Automated cohort identification using Epic SlicerDicer and MyChart queries, scaling monthly enrollment from 10 to 50+ participants. Executed FreeSurfer C processing pipelines across Linux clusters for 3T MRI volumetric segmentation and authored multi-million dollar NIH DSMB data safety dossiers.",
    tags: ["Mayo Clinic", "Epic SlicerDicer", "MyChart Recruitment", "REDCap", "FreeSurfer Linux", "3T MRI Neuroinformatics", "3D Printing (STL)", "NIH DSMB"]
  },
  {
    role: "Clinical Research Coordinator",
    company: "Mayo Clinic",
    period: "October 2019 — July 2021",
    recruiterDescription:
      "Orchestrated the operational lifecycle for multiple high-compliance, federally funded NIH studies from startup to closeout. Authored and managed complex IRB protocols, informed consent documents, and regulatory amendments. Served as departmental Epic Super User providing at-the-elbow clinical troubleshooting and leading staff training on Epic for Research modules, ensuring 100% data integrity through Source Document Verification (SDV).",
    realityDescription:
      "Led operational execution for federally funded NIH trials from startup to closeout. Authored IRB protocols, navigated multi-phase regulatory amendments, and served as departmental Epic Super User providing frontline EHR workflow optimization.",
    tags: ["Mayo Clinic", "NIH Studies", "IRB Protocols", "Epic Super User", "Source Document Verification", "GxP Compliance", "Clinical Operations"]
  },
  {
    role: "Desk Operations Specialist & Epic Super User",
    company: "Mayo Clinic",
    period: "February 2018 — October 2019",
    recruiterDescription:
      "Spearheaded departmental EHR data migration for the high-volume Division of Oncology, personally transcribing record-high volumes of complex patient orders to ensure continuity of clinical care. Provided frontline technical troubleshooting and partnered with IT analysts to test and validate system updates in UAT environments.",
    realityDescription:
      "Executed high-volume EHR data migrations for the Division of Oncology, validating complex clinical orders during system transitions and resolving critical frontline Epic workflow issues.",
    tags: ["Mayo Clinic", "Division of Oncology", "EHR Data Migration", "Epic Super User", "UAT Testing", "Technical Troubleshooting"]
  },
  {
    role: "Summer Operations Coordinator",
    company: "Minnesota State University, Mankato",
    period: "July 2017 — February 2018",
    recruiterDescription:
      "Orchestrated logistical and media operations for the final year of the Minnesota Vikings Summer Training Camp, managing high-security accommodations and broadcast setups for NFL teams. Managed conference finances, inventory systems, and client billing reconciliations for university summer programs.",
    realityDescription:
      "Coordinated logistical and broadcast infrastructure for the Minnesota Vikings Training Camp, managing venue operations, high-security access, and multi-departmental billing reconciliations.",
    tags: ["Minnesota Vikings NFL Camp", "Operations Logistics", "Financial Reconciliation", "Facilities Management", "Media Coordination"]
  }
];

const compiledTimelineDetailed = rawTimelineDetailed.map((item) => ({
  ...item,
  recruiterDescription: compileTerms(item.recruiterDescription),
  realityDescription: compileTerms(item.realityDescription),
}));

const rawTimelineSimplified: TimelineItem[] = [
  {
    role: "Clinical Data Specialist",
    company: "BRIGHT Research Partners, Inc.",
    period: "March 2023 — Present",
    recruiterDescription:
      "Lead database designer for clinical research, creating digital medical forms and automated validation rules to ensure error-free data collection. Oversee trial data quality across study milestones and maintain full regulatory compliance for medical device studies.",
    realityDescription:
      "Designing online medical trial forms and database schemas from complex protocol guidelines. Building automated rules to catch clinical data entry errors in real time, and maintaining complete accountability logs for medical device trials.",
    tags: ["GxP Systems", "21 CFR Part 11", "Database Design", "Data Validation", "Clinical Operations"]
  },
  {
    role: "Research Program Coordinator",
    company: "Mayo Clinic",
    period: "July 2021 — March 2023",
    recruiterDescription:
      "Created automated participant search tools using hospital electronic health records, boosting monthly study enrollment fivefold while reducing screening disqualifications.",
    realityDescription:
      "Automated patient recruitment queries in hospital systems, built secure research databases, processed brain scan imaging workflows, and compiled federal study safety reports.",
    tags: ["Mayo Clinic", "Trial Enrollment", "Database Management", "Data Safety dossiers"]
  },
  {
    role: "Clinical Research Coordinator",
    company: "Mayo Clinic",
    period: "October 2019 — July 2021",
    recruiterDescription:
      "Managed operations for federally funded clinical trials from launch to completion, overseeing ethics board submissions and staff software training.",
    realityDescription:
      "Coordinated daily study operations, managed ethics board approvals and patient consent paperwork, and provided on-site electronic health record support for clinical staff.",
    tags: ["Mayo Clinic", "Trial Operations", "Compliance Checks", "Staff Training"]
  },
  {
    role: "Desk Operations Specialist & Epic Super User",
    company: "Mayo Clinic",
    period: "February 2018 — October 2019",
    recruiterDescription:
      "Directed large-scale medical record transfers for cancer care departments, maintaining technical support and verifying software updates with IT teams.",
    realityDescription:
      "Transferred and verified high-volume patient medical records during hospital software upgrades while troubleshooting software issues for clinical staff.",
    tags: ["Mayo Clinic", "Data Migration", "IT Support", "Workflow Optimization"]
  },
  {
    role: "Summer Operations Coordinator",
    company: "Minnesota State University, Mankato",
    period: "July 2017 — February 2018",
    recruiterDescription:
      "Managed venue operations, broadcast logistics, and secure arrangements for major sports teams and university summer programs.",
    realityDescription:
      "Coordinated event logistics, media broadcast setups, facility security, and financial billing reconciliations for professional sports teams and campus events.",
    tags: ["Event Coordination", "Operations Logistics", "Financial Reconciliations", "Facilities Management"]
  }
];

const compiledTimelineSimplified = rawTimelineSimplified.map((item) => ({
  ...item,
  recruiterDescription: compileTerms(item.recruiterDescription),
  realityDescription: compileTerms(item.realityDescription),
}));

export const dictionary = {
  detailed: {
    bio: {
      title: "Systems Engineer & Clinical Data Specialist",
      subtitle: "Clinical Data • Interactive Graphics • Ski Patrol",
      description: "I spend my days turning 150-page FDA clinical trial protocols into clean, type-safe data pipelines. By night, I build zero-dependency canvas games, retro simulations, and civic open-source tools (like a laser loon design that accidentally raised $13.5k for libraries). When I'm not writing TypeScript or Python, I'm out on the mountain doing alpine ski patrol."
    },
    domains: {
      title: "Technical Domains",
      items: [
        {
          id: "01",
          title: "Clinical Data Pipelines",
          tooltip: "Translating complex 150-page protocols into validated eCRFs, automated edit checks, and FDA-compliant SDTM datasets.",
          description: "Translating dense 150-page clinical trial protocols into validated eCRFs, automated edit checks, and rock-solid typed schemas."
        },
        {
          id: "02",
          title: "Interactive Canvas Physics",
          tooltip: "Crafting 60FPS canvas simulations, raycasting engines, and interactive formal verification tools.",
          description: "Crafting 60FPS browser simulations, raycasters, and retro roguelikes from scratch with zero framework bloat."
        },
        {
          id: "03",
          title: "Civic Tech & Open Source",
          tooltip: "Laser Loon CC0 viral campaign ($13.5k library fundraiser, NYT/WaPo coverage) and grassroots tech advocacy.",
          description: "Creating open-source CC0 tools and viral designs that raised $13.5k+ for community public libraries (NYT & WaPo covered)."
        },
        {
          id: "04",
          title: "Ski Patrol & High-Stakes Triage",
          tooltip: "Credentialed Alpine Ski Patroller (OEC/OET certified) performing rapid triage in high-stakes environments.",
          description: "Certified Alpine Ski Patroller (OEC/OET) applying rapid triage and situational clarity to build fault-tolerant, resilient software."
        }
      ]
    },
    timeline: compiledTimelineDetailed
  },
  simplified: {
    bio: {
      title: "Systems Engineer & Clinical Data Specialist",
      subtitle: "Clinical Data • Interactive Graphics • Ski Patrol",
      description: "I spend my days designing secure databases and type-safe data pipelines for FDA clinical trials. On side projects, I build clean, zero-dependency browser games and civic open-source tools. I am also an active Alpine Ski Patroller, using medical triage and emergency decision-making experience to build highly resilient, fault-tolerant software."
    },
    domains: {
      title: "Technical Domains (Simplified)",
      items: [
        {
          id: "01",
          title: "Clinical Databases",
          tooltip: "Designing electronic forms and automated checks to ensure regulatory-compliant, accurate data entry.",
          description: "Designing electronic forms and automated rules to ensure accurate, regulatory-compliant data entry."
        },
        {
          id: "02",
          title: "Interactive Web Graphics",
          tooltip: "Developing lightweight web animations and responsive 2D guides from scratch.",
          description: "Developing fast, smooth, and interactive web animations and visual guides from scratch."
        },
        {
          id: "03",
          title: "Civic Open Source",
          tooltip: "Creating open-source software and tools that benefit public libraries and local organizations.",
          description: "Building open-source public software and creative awareness campaigns that raised over $13,500 for local public libraries."
        },
        {
          id: "04",
          title: "Ski Patrol & Team Safety",
          tooltip: "Applying situational clarity and rapid medical decision-making to build secure, fault-tolerant systems.",
          description: "Applying emergency medical response experience and rapid decision-making from ski patrolling to build reliable, high-availability software."
        }
      ]
    },
    timeline: compiledTimelineSimplified
  }
};

