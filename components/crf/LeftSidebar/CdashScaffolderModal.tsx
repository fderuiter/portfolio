"use client";

import React from "react";
import { IconDatabase, IconPlus, IconX, IconCheck } from "@tabler/icons-react";
import { scaffoldCdashDomain } from "@/lib/crf/cdisc-cdash-library";
import { CRFForm } from "@/lib/crf/types";

interface CdashScaffolderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInjectForm: (form: CRFForm) => void;
}

const AVAILABLE_DOMAINS: {
  code: "DM" | "VS" | "AE" | "CM" | "LB" | "RECIST";
  name: string;
  category: string;
  description: string;
  badge: string;
}[] = [
  {
    code: "DM",
    name: "Demographics & Consent (DM)",
    category: "Special Purpose / Subject Characteristics",
    description: "Informed consent date tracking, year of birth, age, sex, race, ethnicity with standard NCI codelists.",
    badge: "CDASH 2.2 Core",
  },
  {
    code: "VS",
    name: "Vital Signs & Physical Metrics (VS)",
    category: "Findings / Safety",
    description: "Blood pressure, pulse, temperature, height, weight, and automated AST Body Mass Index (BMI) derivation.",
    badge: "Auto-Calculated",
  },
  {
    code: "AE",
    name: "Adverse Events Log (AE)",
    category: "Events / Safety",
    description: "Continuous log for CTCAE v5.0 severity grading, seriousness (SAE), causality, action taken, and outcome.",
    badge: "Part 11 Log",
  },
  {
    code: "CM",
    name: "Prior & Concomitant Medications (CM)",
    category: "Interventions",
    description: "Medication name, indication, dose, units, route of administration, and start/stop/ongoing dates.",
    badge: "CDASH 2.2",
  },
  {
    code: "LB",
    name: "Laboratory Chemistry & Hematology (LB)",
    category: "Findings",
    description: "Comprehensive serum panel (ALT, AST, Bilirubin, Creatinine, Platelets, ANC) with fasting status.",
    badge: "Clinical Safety",
  },
  {
    code: "RECIST",
    name: "Oncology RECIST 1.1 Tumor Response (TR)",
    category: "Specialized / Oncology",
    description: "Target & non-target lesion tracking with automated sum of longest diameters (SLD) and percent change from baseline.",
    badge: "Oncology Gold Standard",
  },
];

export const CdashScaffolderModal: React.FC<CdashScaffolderModalProps> = ({
  isOpen,
  onClose,
  onInjectForm,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-zinc-900 border border-zinc-700/80 rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-950/60">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-brand-cyan/10 border border-brand-cyan/30 text-brand-cyan">
              <IconDatabase className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white font-mono">1-Click CDASH Domain Scaffolder</h3>
              <p className="text-xs text-zinc-400 font-sans">
                Instantly inject pre-configured, CDISC CDASH 2.2 compliant standard forms
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <IconX className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-3 flex-1">
          {AVAILABLE_DOMAINS.map((domain) => (
            <div
              key={domain.code}
              className="p-4 rounded-xl bg-zinc-950/60 border border-zinc-800/80 hover:border-brand-cyan/50 hover:bg-zinc-900/60 transition-all flex items-start justify-between gap-4 group"
            >
              <div className="space-y-1 flex-1">
                <div className="flex items-center gap-2.5">
                  <span className="text-sm font-bold text-white font-mono">{domain.name}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-brand-cyan/10 text-brand-cyan border border-brand-cyan/20">
                    {domain.badge}
                  </span>
                </div>
                <div className="text-xs text-zinc-400 font-sans leading-relaxed">{domain.description}</div>
                <div className="text-[11px] text-zinc-500 font-mono">Category: {domain.category}</div>
              </div>

              <button
                onClick={() => {
                  const newForm = scaffoldCdashDomain(domain.code);
                  onInjectForm(newForm);
                  onClose();
                }}
                className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 bg-brand-cyan/20 hover:bg-brand-cyan text-brand-cyan hover:text-black font-mono text-xs font-bold rounded-lg border border-brand-cyan/40 transition-all mt-1"
              >
                <IconPlus className="w-4 h-4" />
                <span>Inject Form</span>
              </button>
            </div>
          ))}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-zinc-800 bg-zinc-950/80 flex items-center justify-between text-xs font-mono text-zinc-400">
          <span className="flex items-center gap-1.5 text-emerald-400">
            <IconCheck className="w-4 h-4" /> All schemas include NCI C-Codes &amp; SDTM metadata
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
