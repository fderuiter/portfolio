"use client";

import React from "react";
import {
  StudyProtocol,
  StudioMode,
} from "@/lib/crf/types";
import { STUDY_PRESETS } from "@/lib/crf/presets";
import { lintForm } from "@/lib/crf/ast-evaluator";
import {
  IconLayoutGrid,
  IconCalendar,
  IconMathFunction,
  IconShieldCheck,
  IconFileCode,
  IconCode,
  IconSparkles,
  IconArrowBackUp,
  IconArrowForwardUp,
  IconBug,
  IconCheck,
  IconPalette,
  IconFileSpreadsheet,
} from "@tabler/icons-react";
import { getStudyBranding } from "@/lib/crf/branding-defaults";

interface StudioHeaderProps {
  study: StudyProtocol;
  activeMode: StudioMode;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onChangeMode: (mode: StudioMode) => void;
  onSelectPreset: (presetId: string) => void;
  onOpenDiagnostics: () => void;
  onOpenCdashScaffolder: () => void;
  onOpenBranding: () => void;
  onOpenExportDocument: () => void;
}

export const StudioHeader: React.FC<StudioHeaderProps> = ({
  study,
  activeMode,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onChangeMode,
  onSelectPreset,
  onOpenDiagnostics,
  onOpenCdashScaffolder,
  onOpenBranding,
  onOpenExportDocument,
}) => {
  const branding = getStudyBranding(study);
  // Aggregate lint issues across study
  const totalIssues = study.forms.reduce((acc, f) => acc + lintForm(f).length, 0);

  const MODES: { mode: StudioMode; label: string; icon: React.ReactNode }[] = [
    {
      mode: "designer",
      label: "Form Designer",
      icon: <IconLayoutGrid className="w-4 h-4" />,
    },
    {
      mode: "matrix",
      label: "Visit Matrix",
      icon: <IconCalendar className="w-4 h-4" />,
    },
    {
      mode: "rules",
      label: "Logic & Rules",
      icon: <IconMathFunction className="w-4 h-4" />,
    },
    {
      mode: "edc",
      label: "Live EDC Test",
      icon: <IconShieldCheck className="w-4 h-4" />,
    },
    {
      mode: "acrf",
      label: "Submission aCRF",
      icon: <IconFileCode className="w-4 h-4" />,
    },
    {
      mode: "export",
      label: "Export / CDISC",
      icon: <IconCode className="w-4 h-4" />,
    },
  ];

  return (
    <header className="border-b border-zinc-850 bg-zinc-950/95 sticky top-0 z-30 backdrop-blur-xl">
      {/* Top Banner Row */}
      <div className="flex flex-wrap items-center justify-between px-4 sm:px-6 py-2.5 gap-3 border-b border-zinc-900">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-brand-cyan animate-pulse" />
            <span className="font-mono text-sm font-extrabold text-white tracking-wider uppercase">
              CRF Studio
            </span>
          </div>

          <div className="h-4 w-px bg-zinc-800 hidden sm:block" />

          {/* Preset Selector */}
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-[10px] font-mono text-zinc-500 uppercase hidden md:inline">
              Protocol:
            </span>
            <select
              onChange={(e) => onSelectPreset(e.target.value)}
              value={
                STUDY_PRESETS.find((p) => p.study.protocolNumber === study.protocolNumber)?.id ||
                "custom"
              }
              className="bg-zinc-900 border border-zinc-800 text-xs font-mono text-zinc-200 rounded-lg px-2.5 py-1 focus:border-brand-cyan focus:outline-none max-w-[200px] sm:max-w-xs truncate"
            >
              {STUDY_PRESETS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.study.protocolNumber})
                </option>
              ))}
            </select>
          </div>

          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-brand-cyan/10 text-brand-cyan border border-brand-cyan/20 hidden lg:inline">
            {study.phase}
          </span>
        </div>

        {/* Top Right Actions */}
        <div className="flex items-center gap-2">
          {/* Undo / Redo */}
          <div className="flex items-center gap-1 bg-zinc-900 border border-zinc-800 rounded-lg p-0.5">
            <button
              onClick={onUndo}
              disabled={!canUndo}
              className="p-1 text-zinc-400 hover:text-white disabled:opacity-30 disabled:pointer-events-none rounded hover:bg-zinc-800 transition-colors"
              title="Undo"
            >
              <IconArrowBackUp className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={onRedo}
              disabled={!canRedo}
              className="p-1 text-zinc-400 hover:text-white disabled:opacity-30 disabled:pointer-events-none rounded hover:bg-zinc-800 transition-colors"
              title="Redo"
            >
              <IconArrowForwardUp className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Linter Trigger Badge */}
          <button
            onClick={onOpenDiagnostics}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono transition-all border ${
              totalIssues > 0
                ? "bg-amber-500/10 border-amber-500/30 text-amber-400 hover:bg-amber-500/20"
                : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white"
            }`}
          >
            {totalIssues > 0 ? (
              <IconBug className="w-3.5 h-3.5 text-amber-400" />
            ) : (
              <IconCheck className="w-3.5 h-3.5 text-emerald-400" />
            )}
            <span>{totalIssues > 0 ? `${totalIssues} Diagnostics` : "Verified"}</span>
          </button>

          {/* Branding Trigger */}
          <button
            onClick={onOpenBranding}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white font-mono text-xs rounded-lg transition-all"
            title="Configure Organization Branding"
          >
            <span
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: branding.primaryColor }}
            />
            <IconPalette className="w-3.5 h-3.5 text-brand-cyan" />
            <span className="hidden md:inline">Branding</span>
          </button>

          {/* Word / PDF Export Modal Trigger */}
          <button
            onClick={onOpenExportDocument}
            className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-600/20 hover:bg-blue-600 text-blue-300 hover:text-white font-mono text-xs font-bold rounded-lg border border-blue-500/40 transition-all shadow-xs"
            title="Export Word (.docx) & PDF Documents"
          >
            <IconFileSpreadsheet className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Docx / PDF</span>
          </button>

          {/* 1-Click CDASH Quick Scaffolder */}
          <button
            onClick={onOpenCdashScaffolder}
            className="inline-flex items-center gap-1 px-3 py-1 bg-brand-cyan/15 hover:bg-brand-cyan text-brand-cyan hover:text-black font-mono text-xs font-bold rounded-lg border border-brand-cyan/40 transition-all"
          >
            <IconSparkles className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">+ CDASH Form</span>
          </button>
        </div>
      </div>

      {/* Mode Navigation Tabs */}
      <div className="flex items-center gap-1 px-4 sm:px-6 overflow-x-auto">
        {MODES.map((item) => {
          const isActive = activeMode === item.mode;

          return (
            <button
              key={item.mode}
              onClick={() => onChangeMode(item.mode)}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-mono font-semibold transition-all border-b-2 whitespace-nowrap ${
                isActive
                  ? "border-brand-cyan text-brand-cyan font-bold bg-brand-cyan/5"
                  : "border-transparent text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50"
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </header>
  );
};
