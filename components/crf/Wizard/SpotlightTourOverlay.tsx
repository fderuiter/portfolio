"use client";

import React, { useState, useCallback } from "react";
import { useFocusTrap } from "@/hooks/useFocusTrap";
import {
  IconX,
  IconChevronRight,
  IconChevronLeft,
  IconSparkles,
  IconCheck,
  IconFocus2,
} from "@tabler/icons-react";

interface SpotlightTourOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

interface TourStep {
  id: string;
  stepNumber: number;
  title: string;
  targetDescription: string;
  details: string;
  actionHint: string;
  position: "bottom-left" | "center" | "bottom-right" | "top-center";
}

const TOUR_STEPS: TourStep[] = [
  {
    id: "step_palette",
    stepNumber: 1,
    title: "1. Left Palette & 1-Click CDASH Scaffolder",
    targetDescription: "Left Sidebar — Forms Navigator & Clinical Field Palette",
    details:
      "Explore clinical forms across your protocol or scaffold full CDASH 2.2 domains (DM, VS, AE, CM, LB, RECIST, DI, DU, DE, DA, EX, MH, DS) in 1-click. Drag or click widgets to add them to your form.",
    actionHint: "Tip: Press ⌘K or click 'Scaffold CDASH Domain' to inject pre-configured regulatory forms.",
    position: "bottom-left",
  },
  {
    id: "step_canvas",
    stepNumber: 2,
    title: "2. Center 12-Column Responsive Canvas",
    targetDescription: "Center Workspace — Form Canvas & Field Grid",
    details:
      "Design your Case Report Form on a flexible 12-column grid. Hover over any field to reveal quick width span steppers (3, 4, 6, 12 cols), click labels to edit directly, duplicate, or reorder sections.",
    actionHint: "Tip: Switch between Desktop, Tablet, and Mobile viewport modes at the top of the canvas.",
    position: "center",
  },
  {
    id: "step_inspector",
    stepNumber: 3,
    title: "3. Right Inspector & Custom Options Builder",
    targetDescription: "Right Sidebar — Field Properties, Logic Rules & CDASH Metadata",
    details:
      "Configure data types, custom multiple-choice options with Quick Templates (Yes/No, Likert 5-Pt), promote options to study codelists, write AST validation formulas, and inspect SDTM variable annotations.",
    actionHint: "Tip: Select any field to instantly load its properties in the inspector tabs.",
    position: "bottom-right",
  },
  {
    id: "step_modes",
    stepNumber: 4,
    title: "4. Workspace Mode Navigation",
    targetDescription: "Top Header — Studio View Modes (1-5)",
    details:
      "Seamlessly transition between the Form Canvas, Schedule of Activities (SoA Visit Matrix), AST Rule Graph Visualizer, Live 21 CFR Part 11 EDC Simulator, and Annotated CRF (aCRF) viewer.",
    actionHint: "Tip: Use hotkeys 1, 2, 3, 4, and 5 to rapidly switch between workspace views.",
    position: "top-center",
  },
  {
    id: "step_diagnostics",
    stepNumber: 5,
    title: "5. CDISC Conformance & Regulatory Exports",
    targetDescription: "Header Badges & Action Dropdowns",
    details:
      "Monitor CDISC SDTM/CDASH compliance in real-time with 1-click Auto-Fix remediation. Export production CDISC ODM-XML v1.3.2, Blank / Annotated PDF CRFs, Microsoft Word (.docx) protocol books, and FHIR Questionnaires.",
    actionHint: "Tip: Click the CDISC Conformance badge to open the real-time Diagnostics Drawer.",
    position: "top-center",
  },
];

export const SpotlightTourOverlay: React.FC<SpotlightTourOverlayProps> = ({
  isOpen,
  onClose,
}) => {
  const [currentStepIdx, setCurrentStepIdx] = useState<number>(0);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      setCurrentStepIdx((prev) => Math.min(prev + 1, TOUR_STEPS.length - 1));
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      setCurrentStepIdx((prev) => Math.max(prev - 1, 0));
    }
  }, []);

  const containerRef = useFocusTrap<HTMLDivElement>(isOpen, {
    onEscape: onClose,
    onKeyDown: handleKeyDown,
    returnFocus: true,
  });

  if (!isOpen) return null;

  const currentStep = TOUR_STEPS[currentStepIdx];

  const handleNext = () => {
    if (currentStepIdx < TOUR_STEPS.length - 1) {
      setCurrentStepIdx(currentStepIdx + 1);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentStepIdx > 0) {
      setCurrentStepIdx(currentStepIdx - 1);
    }
  };

  return (
    <div ref={containerRef} className="fixed inset-0 z-50 pointer-events-auto flex items-end justify-center sm:items-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div
        className="w-full max-w-lg bg-zinc-950 border border-brand-cyan/40 rounded-3xl shadow-2xl overflow-hidden ring-1 ring-brand-cyan/30 animate-scale-in"
        role="dialog"
        aria-modal="true"
        aria-labelledby="tour-step-title"
      >
        {/* Header with Step indicator */}
        <div className="px-5 py-3.5 bg-zinc-900/90 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-brand-cyan/20 text-brand-cyan border border-brand-cyan/30">
              <IconFocus2 className="w-4 h-4" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                  Interactive UI Tour
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-brand-cyan/15 text-brand-cyan border border-brand-cyan/30">
                  Step {currentStep.stepNumber} of {TOUR_STEPS.length}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
            aria-label="Exit tour"
          >
            <IconX className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-3.5">
          <div className="space-y-1">
            <div className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest">
              {currentStep.targetDescription}
            </div>
            <h3 id="tour-step-title" className="text-base font-bold text-white font-mono">
              {currentStep.title}
            </h3>
          </div>

          <p className="text-xs text-zinc-300 font-sans leading-relaxed">
            {currentStep.details}
          </p>

          <div className="p-3 rounded-xl bg-brand-cyan/5 border border-brand-cyan/20 flex items-start gap-2">
            <IconSparkles className="w-4 h-4 text-brand-cyan shrink-0 mt-0.5" />
            <p className="text-[11px] font-mono text-brand-cyan/90 leading-tight">
              {currentStep.actionHint}
            </p>
          </div>

          {/* Step Progress Dots */}
          <div className="flex items-center justify-center gap-1.5 pt-1">
            {TOUR_STEPS.map((s, idx) => (
              <button
                key={s.id}
                onClick={() => setCurrentStepIdx(idx)}
                className={`h-1.5 rounded-full transition-all ${
                  idx === currentStepIdx
                    ? "w-6 bg-brand-cyan"
                    : idx < currentStepIdx
                    ? "w-2 bg-emerald-500"
                    : "w-2 bg-zinc-800"
                }`}
                title={s.title}
                aria-label={`Jump to step ${idx + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-5 py-3.5 bg-zinc-900/60 border-t border-zinc-800 flex items-center justify-between">
          <button
            onClick={onClose}
            className="text-xs font-mono text-zinc-400 hover:text-white transition-colors"
          >
            Skip Tour
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrev}
              disabled={currentStepIdx === 0}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 disabled:opacity-40 disabled:cursor-not-allowed border border-zinc-800 text-xs font-mono transition-colors"
            >
              <IconChevronLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>

            <button
              onClick={handleNext}
              className="inline-flex items-center gap-1 px-4 py-1.5 rounded-xl bg-brand-cyan text-black hover:bg-white text-xs font-mono font-bold transition-all shadow-md"
            >
              <span>{currentStepIdx === TOUR_STEPS.length - 1 ? "Complete Tour" : "Next Step"}</span>
              {currentStepIdx === TOUR_STEPS.length - 1 ? (
                <IconCheck className="w-3.5 h-3.5" />
              ) : (
                <IconChevronRight className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
