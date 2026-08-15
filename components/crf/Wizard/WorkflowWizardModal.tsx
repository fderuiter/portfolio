"use client";

import React, { useState, useEffect } from "react";
import {
  IconX,
  IconChevronRight,
  IconChevronLeft,
  IconSparkles,
  IconLayoutGrid,
  IconCalendarEvent,
  IconMathFunction,
  IconDeviceLaptop,
  IconFileExport,
  IconShieldCheck,
  IconCertificate,
  IconArrowRight,
  IconHelp,
  IconPlayerPlay,
} from "@tabler/icons-react";
import { StudioMode } from "@/lib/crf/types";

export interface WorkflowWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchMode: (mode: StudioMode) => void;
  onLoadPreset?: (presetId: string) => void;
  onStartSpotlightTour: () => void;
}

interface WizardStage {
  id: string;
  number: number;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  regulatoryBadges: string[];
  description: string;
  keyFeatures: { label: string; detail: string }[];
  targetMode: StudioMode;
  actionText: string;
  presetSuggestion?: { id: string; name: string };
  callout: { title: string; text: string; codeSnippet?: string };
}

const WIZARD_STAGES: WizardStage[] = [
  {
    id: "cdash_design",
    number: 1,
    title: "CDASH 2.2 Form & Canvas Design",
    subtitle: "12-Column Responsive Layout & Custom Options Authoring",
    icon: <IconLayoutGrid className="w-5 h-5 text-sky-400" />,
    regulatoryBadges: ["CDASH v2.2", "SDTMIG v3.4", "ISO 14155"],
    description:
      "Design clinical trial Case Report Forms with standardized CDASH variables across 13 core, medical device (DI, DU, DE), and pharmaceutical domains (DA, EX, MH, DS). Author custom multiple-choice options, dropdowns, and Likert scales with instant promotion to study-level controlled terminology.",
    keyFeatures: [
      {
        label: "12-Column Responsive Grid",
        detail: "Drag & drop fields with span steppers (3, 4, 6, 12 cols) and instant desktop/tablet/mobile preview.",
      },
      {
        label: "Rich Custom Options Builder",
        detail: "Inline option editing, 7 quick templates (Yes/No, Likert 5-Pt, CTCAE), bulk paste, and 1-click codelist promotion.",
      },
      {
        label: "1-Click CDASH Domain Scaffolder",
        detail: "Instant scaffolding of standard forms (DM, VS, AE, CM, LB, RECIST, DI, DU, DE, DA, EX, MH, DS).",
      },
    ],
    targetMode: "designer",
    actionText: "Open Form Canvas",
    presetSuggestion: { id: "device_cardiovascular_implant", name: "Class III Medical Device IDE Preset" },
    callout: {
      title: "CDISC Conformance Guard",
      text: "Every variable name is automatically validated against the 8-character SDTM length limit and bound to standard NCI Controlled Terminology codelists.",
    },
  },
  {
    id: "soa_matrix",
    number: 2,
    title: "Schedule of Activities (SoA Matrix)",
    subtitle: "Longitudinal Visit Architecture & Protocol Windows",
    icon: <IconCalendarEvent className="w-5 h-5 text-purple-400" />,
    regulatoryBadges: ["ICH-GCP E6(R2)", "CDISC ODM-XML v1.3.2"],
    description:
      "Map out the complete clinical study protocol visit matrix across Screening, Treatment, Follow-up, and Unscheduled visits. Assign CRF forms to specific visits, configure target days and protocol allowable windows, and manage log forms (e.g. ConMeds, Adverse Events).",
    keyFeatures: [
      {
        label: "Interactive Visit x Form Grid",
        detail: "1-click toggle to assign forms to study events with real-time SoA orphan detection.",
      },
      {
        label: "Visit Windows & Target Days",
        detail: "Set Day offsets (e.g. Day 0, Day 30 ± 3d, Month 6 ± 14d) with automatic protocol timeline validation.",
      },
      {
        label: "Repeating & Log Forms",
        detail: "Support for continuous repeating forms (Adverse Events, Concomitant Medications) that span across all visits.",
      },
    ],
    targetMode: "matrix",
    actionText: "Explore Visit Matrix",
    callout: {
      title: "Protocol Timeline Integrity",
      text: "Forms not assigned to any visit are automatically surfaced in the CDISC Diagnostics Drawer (Rule SD0005) with 1-click Auto-Fix remediation.",
    },
  },
  {
    id: "logic_ast",
    number: 3,
    title: "Dynamic Edit Checks & AST Formulas",
    subtitle: "Real-Time Formula Parsing & Automated Query Engine",
    icon: <IconMathFunction className="w-5 h-5 text-emerald-400" />,
    regulatoryBadges: ["21 CFR Part 11", "GAMP 5 Validation"],
    description:
      "Build complex clinical validation logic and automated calculation fields using Abstract Syntax Tree (AST) formula evaluation. Create conditional visibility triggers, cross-field ranges, cross-visit delta consistency checks, and automated EDC discrepancy queries.",
    keyFeatures: [
      {
        label: "AST Mathematical Formulas",
        detail: "Real-time evaluation for Body Mass Index (BMI), Mean Arterial Pressure (MAP), Drug Compliance, and Delta Vitals.",
      },
      {
        label: "Visual Rule Graph Studio",
        detail: "Interactive node-graph visualizer displaying field dependencies, query triggers, and calculation flows.",
      },
      {
        label: "Multi-Severity Query Generation",
        detail: "Configure fatal errors, warning flags, or informational alerts that fire dynamically upon data entry.",
      },
    ],
    targetMode: "rules",
    actionText: "View Logic & Rule Graph",
    callout: {
      title: "AST Formula Example",
      text: "Drug Compliance Formula evaluated in real-time across patient visits:",
      codeSnippet: "((f_da_disp - f_da_ret) / f_da_disp) * 100",
    },
  },
  {
    id: "live_edc",
    number: 4,
    title: "21 CFR Part 11 Live EDC Simulator",
    subtitle: "Patient Enrollment, Immutable Audit Trail & E-Signatures",
    icon: <IconDeviceLaptop className="w-5 h-5 text-amber-400" />,
    regulatoryBadges: ["FDA 21 CFR Part 11", "EMA Annex 11", "HIPAA Safe Harbor"],
    description:
      "Step into a live, interactive Electronic Data Capture (EDC) environment. Simulate multi-subject clinical trials with role switching (Investigator PI, Clinical Research Associate CRA Monitor, Data Manager), immutable audit logging with Reason for Change modals, PI form locking, and e-signatures.",
    keyFeatures: [
      {
        label: "Immutable Audit Trail",
        detail: "Tracks every keystroke, old value, new value, timestamp, user identity, and mandatory Reason for Change.",
      },
      {
        label: "PI Lock & Electronic Signatures",
        detail: "Principal Investigator 21 CFR Part 11 cryptographic attestations with SHA-256 verification and form locking.",
      },
      {
        label: "CRA Source Data Verification (SDV)",
        detail: "Field-by-field verification workflow with query issue and resolution lifecycles.",
      },
    ],
    targetMode: "edc",
    actionText: "Launch EDC Simulator",
    callout: {
      title: "21 CFR Part 11 Compliance Note",
      text: "Data modifications after initial entry automatically require a formal Reason for Change before changes are committed to the audit trail.",
    },
  },
  {
    id: "regulatory_exports",
    number: 5,
    title: "Multi-Standard Regulatory Exports",
    subtitle: "CDISC ODM-XML, Blank/Annotated CRF PDF & Word Protocol Books",
    icon: <IconFileExport className="w-5 h-5 text-brand-cyan" />,
    regulatoryBadges: ["CDISC ODM-XML v1.3.2", "HL7 FHIR R4", "FDA eSubmit / eCTD"],
    description:
      "Instantly compile and export submission-ready regulatory packages. Generate CDISC ODM-XML with metadata versions and codelists, vector Blank and Annotated CRFs (aCRF) with SDTM domain color annotations, Microsoft Word (.docx) study books with Table of Contents, and HL7 FHIR Questionnaire JSON.",
    keyFeatures: [
      {
        label: "CDISC ODM-XML v1.3.2",
        detail: "Complete XML metadata serialization with StudyEventDefs, FormDefs, ItemGroupDefs, ItemDefs, and CodeLists.",
      },
      {
        label: "Vector Blank & Annotated PDF",
        detail: "Pixel-perfect vector PDF forms with SDTM variable callout boxes and customizable sponsor branding/logos.",
      },
      {
        label: "Word (.docx) Study Protocol Book",
        detail: "Full Microsoft Word specification document with clickable Table of Contents and structured section tables.",
      },
    ],
    targetMode: "designer",
    actionText: "Back to Workspace",
    callout: {
      title: "Sponsor Branding Integration",
      text: "All exported PDF and Word documents honor the sponsor's logo, primary/secondary brand colors, and header/footer metadata configured in the Branding Studio.",
    },
  },
];

export const WorkflowWizardModal: React.FC<WorkflowWizardModalProps> = ({
  isOpen,
  onClose,
  onSwitchMode,
  onLoadPreset,
  onStartSpotlightTour,
}) => {
  const [currentStageIdx, setCurrentStageIdx] = useState<number>(0);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        setCurrentStageIdx((prev) => Math.min(prev + 1, WIZARD_STAGES.length - 1));
      } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        setCurrentStageIdx((prev) => Math.max(prev - 1, 0));
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const stage = WIZARD_STAGES[currentStageIdx];

  const handleNext = () => {
    if (currentStageIdx < WIZARD_STAGES.length - 1) {
      setCurrentStageIdx(currentStageIdx + 1);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentStageIdx > 0) {
      setCurrentStageIdx(currentStageIdx - 1);
    }
  };

  const handleStageAction = () => {
    onSwitchMode(stage.targetMode);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div
        className="w-full max-w-4xl max-h-[92vh] flex flex-col bg-zinc-950 border border-zinc-800 rounded-3xl shadow-2xl overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby="wizard-title"
      >
        {/* Top Header Bar */}
        <div className="px-6 py-4 border-b border-zinc-800/80 bg-zinc-900/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="p-2 rounded-xl bg-brand-cyan/15 text-brand-cyan border border-brand-cyan/30">
              <IconSparkles className="w-5 h-5" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h2 id="wizard-title" className="text-base font-bold text-white font-mono">
                  CRF Designer &amp; EDC Studio Walkthrough
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-zinc-800 text-zinc-300 border border-zinc-700">
                  Stage {stage.number} of {WIZARD_STAGES.length}
                </span>
              </div>
              <p className="text-xs text-zinc-400 font-sans">
                Master the end-to-end clinical data management &amp; regulatory workflow.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onClose();
                onStartSpotlightTour();
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 border border-sky-500/30 text-xs font-mono font-medium transition-all"
              title="Launch interactive UI Spotlight Tour"
            >
              <IconPlayerPlay className="w-3.5 h-3.5" />
              <span>Interactive Spotlight Tour</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
              aria-label="Close walkthrough"
            >
              <IconX className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Stage Navigation Pills */}
        <div className="px-6 py-3 border-b border-zinc-800/60 bg-zinc-950 grid grid-cols-5 gap-2">
          {WIZARD_STAGES.map((s, idx) => {
            const isActive = idx === currentStageIdx;
            const isCompleted = idx < currentStageIdx;

            return (
              <button
                key={s.id}
                onClick={() => setCurrentStageIdx(idx)}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-left transition-all border ${
                  isActive
                    ? "bg-brand-cyan/15 border-brand-cyan text-white shadow-sm"
                    : isCompleted
                    ? "bg-zinc-900/60 border-zinc-800 text-zinc-300 hover:border-zinc-700"
                    : "bg-zinc-950 border-transparent text-zinc-500 hover:text-zinc-400"
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-mono font-bold shrink-0 ${
                    isActive
                      ? "bg-brand-cyan text-black"
                      : isCompleted
                      ? "bg-emerald-500 text-black"
                      : "bg-zinc-800 text-zinc-400"
                  }`}
                >
                  {isCompleted ? "✓" : s.number}
                </div>
                <div className="min-w-0 hidden sm:block">
                  <div className="text-[11px] font-mono font-semibold truncate leading-tight">
                    {s.title.split(" ")[0]} {s.title.split(" ")[1]}
                  </div>
                  <div className="text-[9px] text-zinc-500 truncate">{s.subtitle.split("&")[0]}</div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Stage Content Body */}
        <div className="flex-1 p-6 overflow-y-auto space-y-6">
          {/* Main Stage Banner */}
          <div className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2.5">
                  <span className="p-2 rounded-xl bg-zinc-950 border border-zinc-800">{stage.icon}</span>
                  <div>
                    <h3 className="text-lg font-bold text-white font-mono">{stage.title}</h3>
                    <p className="text-xs text-brand-cyan font-mono">{stage.subtitle}</p>
                  </div>
                </div>
              </div>

              {/* Regulatory Badges */}
              <div className="flex flex-wrap items-center gap-1.5 justify-end">
                {stage.regulatoryBadges.map((badge) => (
                  <span
                    key={badge}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-mono font-semibold bg-zinc-950 border border-zinc-800 text-zinc-300 shadow-sm"
                  >
                    <IconCertificate className="w-3 h-3 text-brand-cyan" />
                    <span>{badge}</span>
                  </span>
                ))}
              </div>
            </div>

            <p className="text-sm text-zinc-300 leading-relaxed font-sans">{stage.description}</p>
          </div>

          {/* Key Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {stage.keyFeatures.map((feat, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl bg-zinc-900/40 border border-zinc-800/60 space-y-1.5 hover:border-zinc-700 transition-colors"
              >
                <div className="flex items-center gap-2 text-xs font-mono font-bold text-white">
                  <IconShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{feat.label}</span>
                </div>
                <p className="text-xs text-zinc-400 font-sans leading-normal">{feat.detail}</p>
              </div>
            ))}
          </div>

          {/* Deep-Dive Callout & Preset Suggestion */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            <div className="md:col-span-8 p-4 rounded-xl bg-brand-cyan/5 border border-brand-cyan/20 space-y-2">
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-brand-cyan">
                <IconHelp className="w-4 h-4" />
                <span>{stage.callout.title}</span>
              </div>
              <p className="text-xs text-zinc-300 font-sans">{stage.callout.text}</p>
              {stage.callout.codeSnippet && (
                <pre className="p-2.5 rounded-lg bg-zinc-950 border border-zinc-800 text-[11px] font-mono text-emerald-400 overflow-x-auto">
                  <code>{stage.callout.codeSnippet}</code>
                </pre>
              )}
            </div>

            <div className="md:col-span-4 p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 flex flex-col justify-between space-y-3">
              <div className="space-y-1">
                <div className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 font-semibold">
                  Live Studio Action
                </div>
                <p className="text-xs text-zinc-300 font-sans">
                  Experience this stage live in the interactive studio.
                </p>
              </div>

              <div className="space-y-2">
                <button
                  onClick={handleStageAction}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-brand-cyan text-black hover:bg-white font-mono text-xs font-bold transition-all shadow-sm"
                >
                  <span>{stage.actionText}</span>
                  <IconArrowRight className="w-3.5 h-3.5" />
                </button>

                {stage.presetSuggestion && onLoadPreset && (
                  <button
                    onClick={() => {
                      onLoadPreset(stage.presetSuggestion!.id);
                      onSwitchMode("designer");
                      onClose();
                    }}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-zinc-950 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 text-[11px] font-mono transition-colors truncate"
                    title={`Load ${stage.presetSuggestion.name}`}
                  >
                    ⚡ Load {stage.presetSuggestion.name}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer Navigation Bar */}
        <div className="px-6 py-4 border-t border-zinc-800/80 bg-zinc-900/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={handlePrev}
              disabled={currentStageIdx === 0}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 disabled:opacity-40 disabled:cursor-not-allowed border border-zinc-800 text-xs font-mono font-semibold transition-colors"
            >
              <IconChevronLeft className="w-4 h-4" />
              <span>Previous Stage</span>
            </button>

            <span className="text-xs font-mono text-zinc-500 hidden sm:inline">
              Use ← and → arrow keys to navigate
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleNext}
              className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-brand-cyan text-black hover:bg-white text-xs font-mono font-bold transition-all shadow-md"
            >
              <span>
                {currentStageIdx === WIZARD_STAGES.length - 1 ? "Finish & Start Designing" : "Next Stage"}
              </span>
              <IconChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
