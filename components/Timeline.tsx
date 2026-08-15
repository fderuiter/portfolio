"use client";

import React from "react";
import { hexToRgba } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { designManifest } from "@/lib/design-manifest";
import { IconBriefcase, IconFlame, IconSwitchHorizontal } from "@tabler/icons-react";
import { useTimelineState } from "@/hooks/useTimelineState";

export interface TimelineItem {
  role: string;
  company: string;
  period: string;
  recruiterDescription: string;
  realityDescription: string;
  tags: string[];
}

const timelineData: TimelineItem[] = [
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

export const Timeline: React.FC = () => {
  const {
    globalMode,
    handleGlobalToggle,
    handleCardToggle,
    getCardMode,
  } = useTimelineState();

  return (
    <div className="w-full max-w-3xl mx-auto py-6 sm:py-8 relative select-none">
      {/* Global View Switcher */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 mb-12 sm:mb-16 px-4 py-3 bg-zinc-900/40 border border-zinc-900/80 rounded-2xl backdrop-blur-md w-full">
        <div className="flex items-center gap-2 text-xs font-mono text-zinc-400 self-start sm:self-center">
          <span className="w-2 h-2 rounded-full bg-amber-400" />
          <span className="font-bold text-zinc-300">Perspective:</span>
        </div>

        <div className="flex p-0.5 bg-zinc-950/90 border border-zinc-800/80 rounded-xl text-xs font-mono w-full sm:w-auto">
          <button
            onClick={() => handleGlobalToggle("reality")}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 min-h-10 px-3.5 py-2 rounded-lg font-bold transition-all duration-200 cursor-pointer ${
              globalMode === "reality"
                ? "bg-zinc-900 text-amber-400 border border-amber-400/30 shadow-[0_0_12px_rgba(251,191,36,0.2)]"
                : "text-zinc-400 hover:text-zinc-200 border border-transparent"
            }`}
          >
            <IconFlame className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="text-[11px] sm:text-xs">HANDS-ON REALITY</span>
          </button>
          <button
            onClick={() => handleGlobalToggle("recruiter")}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 min-h-10 px-3.5 py-2 rounded-lg font-bold transition-all duration-200 cursor-pointer ${
              globalMode === "recruiter"
                ? "bg-zinc-900 text-brand-cyan border border-brand-cyan/30 shadow-[0_0_12px_rgba(6,182,212,0.2)]"
                : "text-zinc-400 hover:text-zinc-200 border border-transparent"
            }`}
          >
            <IconBriefcase className="w-3.5 h-3.5 shrink-0" />
            <span className="text-[11px] sm:text-xs">FORMAL SUMMARY</span>
          </button>
        </div>
      </div>

      {/* Vertical Rail Line */}
      <div className="absolute left-3 sm:left-4 md:left-1/2 top-28 bottom-0 w-0.5 bg-gradient-to-b from-brand-cyan/30 via-brand-blue/20 to-zinc-900/10 -translate-x-1/2" />

      <div className="space-y-10 sm:space-y-14">
        {timelineData.map((item, idx) => {
          const isLeft = idx % 2 === 0;
          const currentMode = getCardMode(idx);
          const isReality = currentMode === "reality";

          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, delay: idx * 0.08, ...designManifest.motion.springs.timeline }}
              className={`relative flex flex-col md:flex-row items-start md:items-center ${
                isLeft ? "md:flex-row-reverse" : ""
              }`}
            >
              {/* Timeline Bullet Node */}
              <div
                className={`absolute left-3 sm:left-4 md:left-1/2 w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-zinc-950 border-2 -translate-x-1/2 z-10 flex items-center justify-center transition-colors duration-300 ${
                  isReality ? "border-amber-400" : "border-brand-cyan"
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full transition-colors duration-300 ${
                    isReality ? "bg-amber-400" : "bg-brand-cyan"
                  }`}
                />
              </div>

              {/* Card Container */}
              <div className={`w-full md:w-[46%] pl-7 sm:pl-10 md:pl-0 ${isLeft ? "md:pr-10 md:text-right" : "md:pl-10"}`}>
                <div
                  style={
                    {
                      "--timeline-glow": `0 0 25px ${
                        isReality
                          ? hexToRgba(designManifest.colors.warning, 0.05)
                          : hexToRgba(designManifest.colors["brand-cyan"], 0.05)
                      }`,
                    } as React.CSSProperties
                  }
                  className={`p-4 sm:p-6 bg-zinc-900/25 border rounded-2xl backdrop-blur-sm transition-all duration-300 group hover:[box-shadow:var(--timeline-glow)] ${
                    isReality ? "border-amber-500/20 hover:border-amber-500/40" : "border-zinc-900/60 hover:border-zinc-800"
                  }`}
                >
                  <div className={`flex items-center justify-between gap-2 mb-3 ${isLeft ? "md:flex-row-reverse" : ""}`}>
                    <span
                      className={`text-[10px] font-mono font-bold tracking-wider uppercase px-2.5 py-0.5 border rounded-md transition-colors duration-300 ${
                        isReality
                          ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                          : "bg-brand-cyan/5 text-brand-cyan border-brand-cyan/10"
                      }`}
                    >
                      {item.period}
                    </span>

                    {/* Quick Flip Toggle Button */}
                    <button
                      onClick={() => handleCardToggle(idx)}
                      title="Toggle perspective for this role"
                      className={`inline-flex items-center gap-1 min-h-8 px-2.5 py-1 text-[10px] font-mono rounded-lg border transition-colors cursor-pointer ${
                        isReality
                          ? "bg-amber-500/10 text-amber-300 border-amber-500/30 hover:bg-amber-500/20"
                          : "bg-zinc-900/80 text-zinc-400 border-zinc-800 hover:text-zinc-200 hover:border-zinc-700"
                      }`}
                    >
                      <IconSwitchHorizontal className="w-3 h-3 shrink-0" />
                      <span>{isReality ? "Hands-On" : "Formal"}</span>
                    </button>
                  </div>

                  <h3 className="text-sm sm:text-base md:text-lg font-bold text-neutral-100 group-hover:text-white transition-colors">
                    {item.role}
                  </h3>
                  <h4 className="text-xs font-mono font-semibold text-zinc-400 mt-1">
                    {item.company}
                  </h4>

                  {/* Animated Content Transition */}
                  <div className="mt-3 min-h-[70px]">
                    <AnimatePresence mode="wait">
                      <motion.p
                        key={isReality ? "reality" : "recruiter"}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        transition={{ duration: 0.2 }}
                        className={`text-xs leading-relaxed font-sans ${
                          isReality ? "text-amber-200/90 italic" : "text-zinc-300"
                        }`}
                      >
                        {isReality ? item.realityDescription : item.recruiterDescription}
                      </motion.p>
                    </AnimatePresence>
                  </div>

                  {/* Tag Chips */}
                  <div className={`flex flex-wrap gap-1.5 mt-4 ${isLeft ? "md:justify-end" : ""}`}>
                    {item.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-0.5 text-[9px] font-mono bg-zinc-900/60 border border-zinc-800/80 text-zinc-400 rounded"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
