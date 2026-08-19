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
      "Translating dense 150-page clinical trial protocols into relational schemas and dynamic eCRFs. Building cross-form validation rules to catch edge-case clinician typos before they hit the database, and ensuring 100% device traceability under 21 CFR 812.",
    tags: ["GxP Systems", "21 CFR 812", "eCRF Architecture", "Edit Checks", "DMP Authoring", "SAE Reconciliation", "iMednet"]
  },
  {
    role: "Research Program Coordinator",
    company: "Mayo Clinic",
    period: "July 2021 — March 2023",
    recruiterDescription:
      "Pioneered an EHR-based recruitment pipeline using SlicerDicer and MyChart, resulting in a 5x increase in qualified participant enrollment (10 to 50+/month) and a 25% reduction in screen failures. Architected production REDCap databases, executed Linux-based FreeSurfer C pipelines processing 3T MRI scans for volumetric brain segmentation, innovated 3D-printable STL workflows for participant brain models, and prepared NIH DSMB data safety dossiers.",
    realityDescription:
      "Automated cohort identification using Epic SlicerDicer and MyChart queries, scaling monthly enrollment 5x. Executed FreeSurfer C processing pipelines across Linux clusters for 3T MRI scans, 3D printed custom brain models for study participants, and compiled multi-million dollar NIH DSMB data safety dossiers.",
    tags: ["Mayo Clinic", "Epic SlicerDicer", "MyChart Recruitment", "REDCap", "FreeSurfer Linux", "3T MRI Neuroinformatics", "3D Printing (STL)", "NIH DSMB"]
  },
  {
    role: "Clinical Research Coordinator",
    company: "Mayo Clinic",
    period: "October 2019 — July 2021",
    recruiterDescription:
      "Orchestrated the operational lifecycle for multiple high-compliance, federally funded NIH studies from startup to closeout. Authored and managed complex IRB protocols, informed consent documents, and regulatory amendments. Served as departmental Epic Super User providing at-the-elbow clinical troubleshooting and leading staff training on Epic for Research modules, ensuring 100% data integrity through Source Document Verification (SDV).",
    realityDescription:
      "Ran day-to-day operations for federally funded NIH clinical trials from startup to closeout. Wrote IRB protocols, navigated multi-phase regulatory amendments, and served as departmental Epic Super User helping doctors and clinical staff troubleshoot complex electronic health record workflows.",
    tags: ["Mayo Clinic", "NIH Studies", "IRB Protocols", "Epic Super User", "Source Document Verification", "GxP Compliance", "Clinical Operations"]
  },
  {
    role: "Desk Operations Specialist & Epic Super User",
    company: "Mayo Clinic",
    period: "February 2018 — October 2019",
    recruiterDescription:
      "Spearheaded departmental EHR data migration for the high-volume Division of Oncology, personally transcribing record-high volumes of complex patient orders to ensure continuity of clinical care. Provided frontline technical troubleshooting and partnered with IT analysts to test and validate system updates in UAT environments.",
    realityDescription:
      "Executed high-volume EHR data migrations for the Division of Oncology, keeping cancer treatment orders moving accurately during system transitions and resolving frontline software glitches for clinical teams.",
    tags: ["Mayo Clinic", "Division of Oncology", "EHR Data Migration", "Epic Super User", "UAT Testing", "Technical Troubleshooting"]
  },
  {
    role: "Summer Operations Coordinator & Vikings Training Camp Liaison",
    company: "Minnesota State University, Mankato",
    period: "July 2017 — February 2018",
    recruiterDescription:
      "Served as the primary university liaison for the Minnesota Vikings Summer Training Camp, orchestrating logistical, broadcast, and security operations between the university and the NFL franchise. Directed conference finances, inventory systems, and client billing reconciliations while spearheading campus health initiatives including free menstrual product access in university facilities.",
    realityDescription:
      "Acted as the university's main liaison for the Minnesota Vikings Training Camp—handling facilities, broadcast logistics, and NFL team operations—while managing campus billing reconciliations and successfully organizing student initiatives to provide free menstrual products across campus bathrooms.",
    tags: ["Minnesota Vikings NFL Camp", "University Liaison", "Campus Advocacy", "Operations Logistics", "Financial Reconciliation", "Facilities Management"]
  }
];

const compiledTimelineDetailed = rawTimelineDetailed.map((item) => ({
  ...item,
  recruiterDescription: compileTerms(item.recruiterDescription),
  realityDescription: compileTerms(item.realityDescription),
  tags: item.tags,
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
      "Automated patient recruitment queries in hospital systems, built secure research databases, 3D printed custom brain models from MRI scans for study participants, and compiled federal study safety reports.",
    tags: ["Mayo Clinic", "Trial Enrollment", "3D Printing", "Database Management", "Data Safety dossiers"]
  },
  {
    role: "Clinical Research Coordinator",
    company: "Mayo Clinic",
    period: "October 2019 — July 2021",
    recruiterDescription:
      "Managed operations for federally funded clinical trials from launch to completion, overseeing ethics board submissions and staff software training.",
    realityDescription:
      "Coordinated daily study operations, managed ethics board approvals and patient paperwork, and provided on-site electronic health record support for doctors and research staff.",
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
    role: "Summer Operations Coordinator & Vikings Training Camp Liaison",
    company: "Minnesota State University, Mankato",
    period: "July 2017 — February 2018",
    recruiterDescription:
      "Served as primary campus liaison for the Minnesota Vikings Training Camp and summer conference operations, while spearheading successful student initiatives for free campus healthcare supplies.",
    realityDescription:
      "Coordinated event logistics and broadcast setups for the Minnesota Vikings NFL team on campus, managed summer facility operations, and successfully organized student initiatives for free menstrual products in campus facilities.",
    tags: ["Minnesota Vikings NFL Camp", "Campus Advocacy", "Operations Logistics", "Facilities Management"]
  }
];

const compiledTimelineSimplified = rawTimelineSimplified.map((item) => ({
  ...item,
  recruiterDescription: compileTerms(item.recruiterDescription),
  realityDescription: compileTerms(item.realityDescription),
  tags: item.tags,
}));

export const dictionary = {
  detailed: {
    bio: {
      title: "Pragmatic Problem Solver & Systems Engineer",
      subtitle: "Clinical Data • Interactive Graphics • High-Stakes Troubleshooting",
      description: "I build software that doesn't break, and make complex systems actually fun to use. My background spans translating 150-page FDA clinical trial protocols into bulletproof databases at Mayo Clinic, serving as the university operations liaison for the Minnesota Vikings Training Camp, advocating for campus health improvements at Mankato, and 3D printing participant MRI brain models. On side projects, I build fast browser engines, canvas games, and civic tools—including the Laser Loon design that became a Minnesota cultural icon and raised $13.5k for public libraries. When I'm off-screen, I do emergency medical triage on alpine ski patrol."
    },
    domains: {
      title: "Core Toolkit & Domains",
      items: [
        {
          id: "01",
          title: "Clinical Data Systems",
          tooltip: "Translating complex 150-page protocols into validated eCRFs, automated edit checks, and FDA-compliant datasets.",
          description: "Translating dense 150-page clinical trial protocols into relational schemas and dynamic eCRFs so clinicians don't enter bad data."
        },
        {
          id: "02",
          title: "Interactive Canvas Physics",
          tooltip: "Crafting 60FPS canvas simulations, raycasting engines, and interactive deductive logic assistants from scratch.",
          description: "Crafting 60FPS browser simulations, retro roguelikes, and interactive logic puzzles from scratch with zero framework bloat."
        },
        {
          id: "03",
          title: "Civic Tech & Laser Loon",
          tooltip: "Laser Loon CC0 viral campaign ($13.5k library fundraiser, NYT/WaPo coverage) and grassroots tech advocacy.",
          description: "Designing open-source tools and viral creative projects—like the Laser Loon flag design that raised $13.5k+ for public libraries."
        },
        {
          id: "04",
          title: "Ski Patrol & Emergency Triage",
          tooltip: "Credentialed Alpine Ski Patroller (OEC/OET certified) performing rapid triage in high-stakes environments.",
          description: "Applying rapid medical triage and calm decision-making from Alpine Ski Patrolling to build fault-tolerant, resilient software."
        }
      ]
    },
    timeline: compiledTimelineDetailed
  },
  simplified: {
    bio: {
      title: "Problem Solver & Systems Engineer",
      subtitle: "Web Apps • Clinical Systems • Interactive Tools",
      description: "I'm a builder and problem solver who likes making things work smoothly. From managing clinical research databases and 3D printing brain models at Mayo Clinic to coordinating logistics for NFL training camps and creating viral community projects, I specialize in taking complicated, messy challenges and turning them into simple, reliable software."
    },
    domains: {
      title: "What I Build (Simplified)",
      items: [
        {
          id: "01",
          title: "Clinical Databases",
          tooltip: "Designing electronic forms and automated checks to ensure regulatory-compliant, accurate data entry.",
          description: "Building clear digital medical forms with automatic checks that catch entry mistakes in real time."
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
          title: "Emergency Triage & Safety",
          tooltip: "Applying situational clarity and rapid medical decision-making to build secure, fault-tolerant systems.",
          description: "Using real-world emergency response and triage experience from ski patrol to build reliable, high-availability software."
        }
      ]
    },
    timeline: compiledTimelineSimplified
  }
};

