"use client";

import React, { useState } from "react";
import {
  StudyProtocol,
  StudioMode,
  StudioTheme,
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
  IconDotsVertical,
  IconLayoutSidebarLeftCollapse,
  IconLayoutSidebarLeftExpand,
  IconLayoutSidebarRightCollapse,
  IconLayoutSidebarRightExpand,
  IconX,
  IconHelp,
  IconPlayerPlay,
  IconLink,
  IconSun,
  IconMoon,
} from "@tabler/icons-react";
import { getStudyBranding } from "@/lib/crf/branding-defaults";

interface StudioHeaderProps {
  study: StudyProtocol;
  activeMode: StudioMode;
  canUndo: boolean;
  canRedo: boolean;
  theme?: StudioTheme;
  onToggleTheme?: () => void;
  isLeftSidebarOpen?: boolean;
  isRightInspectorOpen?: boolean;
  onToggleLeftSidebar?: () => void;
  onToggleRightInspector?: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onChangeMode: (mode: StudioMode) => void;
  onSelectPreset: (presetId: string) => void;
  onOpenDiagnostics: () => void;
  onOpenCdashScaffolder: () => void;
  onOpenBranding: () => void;
  onOpenExportDocument: () => void;
  onOpenWizard: () => void;
  onStartSpotlightTour?: () => void;
  onCopyShareLink?: () => void;
}

export const StudioHeader: React.FC<StudioHeaderProps> = ({
  study,
  activeMode,
  canUndo,
  canRedo,
  theme = "dark",
  onToggleTheme,
  isLeftSidebarOpen = true,
  isRightInspectorOpen = true,
  onToggleLeftSidebar,
  onToggleRightInspector,
  onUndo,
  onRedo,
  onChangeMode,
  onSelectPreset,
  onOpenDiagnostics,
  onOpenCdashScaffolder,
  onOpenBranding,
  onOpenExportDocument,
  onOpenWizard,
  onStartSpotlightTour,
  onCopyShareLink,
}) => {
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  const branding = getStudyBranding(study);
  // Aggregate lint issues across study
  const totalIssues = study.forms.reduce((acc, f) => acc + lintForm(f).length, 0);
  const currentPreset = STUDY_PRESETS.find((p) => p.study.protocolNumber === study.protocolNumber);

  const MODES: { mode: StudioMode; label: string; shortLabel: string; shortcut: string; icon: React.ReactNode }[] = [
    {
      mode: "designer",
      label: "Form Designer",
      shortLabel: "Designer",
      shortcut: "1",
      icon: <IconLayoutGrid className="w-4 h-4" />,
    },
    {
      mode: "matrix",
      label: "Visit Matrix (SoA)",
      shortLabel: "Matrix (SoA)",
      shortcut: "2",
      icon: <IconCalendar className="w-4 h-4" />,
    },
    {
      mode: "rules",
      label: "Logic & AST Rules",
      shortLabel: "AST Rules",
      shortcut: "3",
      icon: <IconMathFunction className="w-4 h-4" />,
    },
    {
      mode: "edc",
      label: "Live 21 CFR EDC",
      shortLabel: "Live EDC",
      shortcut: "4",
      icon: <IconShieldCheck className="w-4 h-4" />,
    },
    {
      mode: "acrf",
      label: "Annotated aCRF",
      shortLabel: "aCRF Viewer",
      shortcut: "5",
      icon: <IconFileCode className="w-4 h-4" />,
    },
    {
      mode: "export",
      label: "CDISC / Exports",
      shortLabel: "Exports",
      shortcut: "6",
      icon: <IconCode className="w-4 h-4" />,
    },
  ];

  return (
    <header className="border-b border-zinc-850 bg-zinc-950/95 sticky top-0 z-30 backdrop-blur-xl">
      {/* Top Banner Row */}
      <div className="flex items-center justify-between px-3 sm:px-5 py-2.5 gap-2 border-b border-zinc-900">
        {/* Left Side: Brand & Protocol Selector & Left Sidebar Toggle */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          {/* Left Sidebar Toggle Button (Only in Designer mode) */}
          {activeMode === "designer" && onToggleLeftSidebar && (
            <button
              onClick={onToggleLeftSidebar}
              className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800 transition-colors hidden md:inline-flex items-center gap-1 text-[11px] font-mono"
              title={`Toggle Left Navigator (${navigator?.platform?.toUpperCase()?.includes("MAC") ? "⌘B" : "Ctrl+B"})`}
            >
              {isLeftSidebarOpen ? (
                <IconLayoutSidebarLeftCollapse className="w-4 h-4 text-brand-cyan" />
              ) : (
                <IconLayoutSidebarLeftExpand className="w-4 h-4 text-zinc-400" />
              )}
            </button>
          )}

          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-brand-cyan animate-pulse shrink-0" />
            <span className="font-mono text-xs sm:text-sm font-extrabold text-white tracking-wider uppercase truncate">
              CRF Studio
            </span>
          </div>

          <div className="h-4 w-px bg-zinc-800 hidden sm:block" />

          {/* Preset / Protocol Selector */}
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="text-[10px] font-mono text-zinc-500 uppercase hidden lg:inline">
              Protocol:
            </span>
            <select
              onChange={(e) => onSelectPreset(e.target.value)}
              value={currentPreset?.id || "custom"}
              aria-label="Select Clinical Protocol Preset"
              className="bg-zinc-900 border border-zinc-800 text-xs font-mono text-zinc-200 rounded-lg px-2 py-1 focus:border-brand-cyan focus:ring-1 focus:ring-brand-cyan focus:outline-none max-w-[140px] xs:max-w-[180px] sm:max-w-xs truncate"
            >
              {STUDY_PRESETS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.study.protocolNumber})
                </option>
              ))}
            </select>
          </div>

          {currentPreset?.therapeuticArea && (
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-purple-500/10 text-purple-400 border border-purple-500/20 hidden 2xl:inline truncate max-w-[150px]">
              {currentPreset.therapeuticArea}
            </span>
          )}

          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-brand-cyan/10 text-brand-cyan border border-brand-cyan/20 hidden xl:inline">
            {study.phase}
          </span>
        </div>

        {/* Right Side: Desktop Actions & Responsive More Menu */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Undo / Redo */}
          <div className="flex items-center gap-0.5 bg-zinc-900 border border-zinc-800 rounded-lg p-0.5">
            <button
              onClick={onUndo}
              disabled={!canUndo}
              className="p-1 text-zinc-400 hover:text-white disabled:opacity-30 disabled:pointer-events-none rounded hover:bg-zinc-800 transition-colors focus-visible:ring-2 focus-visible:ring-brand-cyan outline-none"
              title="Undo (⌘Z)"
              aria-label="Undo"
            >
              <IconArrowBackUp className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={onRedo}
              disabled={!canRedo}
              className="p-1 text-zinc-400 hover:text-white disabled:opacity-30 disabled:pointer-events-none rounded hover:bg-zinc-800 transition-colors focus-visible:ring-2 focus-visible:ring-brand-cyan outline-none"
              title="Redo (⌘⇧Z)"
              aria-label="Redo"
            >
              <IconArrowForwardUp className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Theme Toggle (Dark / Light) */}
          {onToggleTheme && (
            <button
              onClick={onToggleTheme}
              className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 transition-colors inline-flex items-center gap-1 text-[11px] font-mono"
              title={theme === "light" ? "Switch to Dark Studio Mode" : "Switch to Clinical Light Mode"}
              aria-label={theme === "light" ? "Switch to Dark Studio Mode" : "Switch to Clinical Light Mode"}
            >
              {theme === "light" ? (
                <IconMoon className="w-3.5 h-3.5 text-amber-500" />
              ) : (
                <IconSun className="w-3.5 h-3.5 text-amber-400" />
              )}
            </button>
          )}

          {/* Desktop Actions (Hidden on small screens / laptops, moved to More Menu) */}
          <div className="hidden lg:flex items-center gap-1.5">
            {/* Linter Trigger Badge */}
            <button
              onClick={onOpenDiagnostics}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono transition-all border ${
                totalIssues > 0
                  ? "bg-amber-500/10 border-amber-500/30 text-amber-400 hover:bg-amber-500/20"
                  : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white"
              }`}
              title="Open CDISC Conformance Diagnostics"
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
              title="Configure Organization Branding & Logos"
            >
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: branding.primaryColor }}
              />
              <IconPalette className="w-3.5 h-3.5 text-brand-cyan" />
              <span className="hidden xl:inline">Branding</span>
            </button>

            {/* Word / PDF Export Modal Trigger */}
            <button
              onClick={onOpenExportDocument}
              className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-600/20 hover:bg-blue-600 text-blue-300 hover:text-white font-mono text-xs font-bold rounded-lg border border-blue-500/40 transition-all shadow-xs"
              title="Export Word (.docx) Protocol Books & PDF Blank/Annotated CRFs"
            >
              <IconFileSpreadsheet className="w-3.5 h-3.5" />
              <span>Docx / PDF</span>
            </button>

            {/* 1-Click CDASH Quick Scaffolder */}
            <button
              onClick={onOpenCdashScaffolder}
              className="inline-flex items-center gap-1 px-2.5 py-1 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 hover:text-white font-mono text-xs font-bold rounded-lg border border-zinc-700 transition-all"
              title="1-Click CDASH Domain Scaffolder (⌘K)"
            >
              <IconSparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>+ CDASH Form</span>
            </button>

            {/* Copy Shareable Link */}
            {onCopyShareLink && (
              <button
                onClick={onCopyShareLink}
                className="inline-flex items-center gap-1 px-2.5 py-1 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white font-mono text-xs rounded-lg transition-all"
                title="Copy Shareable Studio Link with Active Mode & Form State"
              >
                <IconLink className="w-3.5 h-3.5 text-brand-cyan" />
                <span>Share</span>
              </button>
            )}

            {/* "How It Works" / Walkthrough Tour Trigger */}
            <div className="flex items-center bg-zinc-900 border border-brand-cyan/40 rounded-lg overflow-hidden shadow-xs">
              <button
                onClick={onOpenWizard}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-brand-cyan/15 hover:bg-brand-cyan text-brand-cyan hover:text-black font-mono text-xs font-bold transition-all"
                title="Open Interactive Clinical Walkthrough Wizard (Press ? or F1)"
              >
                <IconHelp className="w-3.5 h-3.5" />
                <span>How It Works</span>
              </button>
              {onStartSpotlightTour && (
                <button
                  onClick={onStartSpotlightTour}
                  className="px-1.5 py-1 bg-brand-cyan/10 hover:bg-brand-cyan text-brand-cyan hover:text-black font-mono text-xs border-l border-brand-cyan/30 transition-all"
                  title="Launch Interactive UI Spotlight Tour"
                >
                  <IconPlayerPlay className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>

          {/* Right Inspector Toggle Button (Only in Designer mode on desktop/tablet) */}
          {activeMode === "designer" && onToggleRightInspector && (
            <button
              onClick={onToggleRightInspector}
              className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800 transition-colors hidden md:inline-flex items-center gap-1 text-[11px] font-mono"
              title={`Toggle Property Inspector (${navigator?.platform?.toUpperCase()?.includes("MAC") ? "⌘I" : "Ctrl+I"})`}
            >
              {isRightInspectorOpen ? (
                <IconLayoutSidebarRightCollapse className="w-4 h-4 text-brand-cyan" />
              ) : (
                <IconLayoutSidebarRightExpand className="w-4 h-4 text-zinc-400" />
              )}
            </button>
          )}

          {/* More Actions Trigger Button (Visible on mobile & tablets / smaller screens) */}
          <div className="relative">
            <button
              onClick={() => setIsMoreMenuOpen((prev) => !prev)}
              className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 transition-colors lg:hidden inline-flex items-center gap-1"
              title="More Actions & Tools"
              aria-label="More Studio Actions"
              aria-expanded={isMoreMenuOpen}
            >
              <IconDotsVertical className="w-4 h-4" />
              {totalIssues > 0 && (
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              )}
            </button>

            {/* Mobile / Tablet More Actions Popover Drawer */}
            {isMoreMenuOpen && (
              <>
                <div
                  className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs lg:hidden"
                  onClick={() => setIsMoreMenuOpen(false)}
                />
                <div className="absolute right-0 top-full mt-2 w-72 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl p-3 z-50 lg:hidden space-y-1 animate-in fade-in zoom-in-95 duration-150">
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-zinc-800 px-1">
                    <span className="text-xs font-bold font-mono text-zinc-300 uppercase">
                      Studio Actions
                    </span>
                    <button
                      onClick={() => setIsMoreMenuOpen(false)}
                      className="p-1 text-zinc-500 hover:text-white rounded"
                    >
                      <IconX className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <button
                    onClick={() => {
                      setIsMoreMenuOpen(false);
                      onOpenCdashScaffolder();
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-left text-xs font-mono rounded-xl bg-zinc-950 hover:bg-zinc-800 text-zinc-200 transition-colors"
                  >
                    <IconSparkles className="w-4 h-4 text-amber-400" />
                    <div className="flex-1">
                      <div className="font-bold">+ CDASH Form Scaffolder</div>
                      <div className="text-[10px] text-zinc-500">Inject 10+ standard domains</div>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      setIsMoreMenuOpen(false);
                      onOpenDiagnostics();
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-left text-xs font-mono rounded-xl bg-zinc-950 hover:bg-zinc-800 text-zinc-200 transition-colors"
                  >
                    {totalIssues > 0 ? (
                      <IconBug className="w-4 h-4 text-amber-400" />
                    ) : (
                      <IconCheck className="w-4 h-4 text-emerald-400" />
                    )}
                    <div className="flex-1">
                      <div className="font-bold">CDISC Diagnostics</div>
                      <div className="text-[10px] text-zinc-500">
                        {totalIssues > 0 ? `${totalIssues} rule violations found` : "Study fully verified"}
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      setIsMoreMenuOpen(false);
                      onOpenExportDocument();
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-left text-xs font-mono rounded-xl bg-blue-950/40 hover:bg-blue-900/40 text-blue-200 border border-blue-800/40 transition-colors"
                  >
                    <IconFileSpreadsheet className="w-4 h-4 text-blue-400" />
                    <div className="flex-1">
                      <div className="font-bold">Docx / PDF Protocol Books</div>
                      <div className="text-[10px] text-blue-400/70">Export Word books &amp; blank PDFs</div>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      setIsMoreMenuOpen(false);
                      onOpenBranding();
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-left text-xs font-mono rounded-xl bg-zinc-950 hover:bg-zinc-800 text-zinc-200 transition-colors"
                  >
                    <IconPalette className="w-4 h-4 text-brand-cyan" />
                    <div className="flex-1">
                      <div className="font-bold">Organization Branding</div>
                      <div className="text-[10px] text-zinc-500">Logos, colors &amp; header profiles</div>
                    </div>
                  </button>

                  {onCopyShareLink && (
                    <button
                      onClick={() => {
                        setIsMoreMenuOpen(false);
                        onCopyShareLink();
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-left text-xs font-mono rounded-xl bg-zinc-950 hover:bg-zinc-800 text-zinc-200 transition-colors"
                    >
                      <IconLink className="w-4 h-4 text-brand-cyan" />
                      <div className="flex-1">
                        <div className="font-bold">Share Studio View</div>
                        <div className="text-[10px] text-zinc-500">Copy link with active mode &amp; form</div>
                      </div>
                    </button>
                  )}

                  {onToggleTheme && (
                    <button
                      onClick={() => {
                        setIsMoreMenuOpen(false);
                        onToggleTheme();
                      }}
                      className="w-full flex items-center justify-between px-3 py-2 text-left text-xs font-mono rounded-xl bg-zinc-950 hover:bg-zinc-800 text-zinc-200 transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        {theme === "light" ? (
                          <IconMoon className="w-4 h-4 text-amber-500" />
                        ) : (
                          <IconSun className="w-4 h-4 text-amber-400" />
                        )}
                        <div className="flex-1">
                          <div className="font-bold">Studio Theme</div>
                          <div className="text-[10px] text-zinc-500">{theme === "light" ? "Clinical Light" : "Studio Dark"}</div>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold text-zinc-400 uppercase px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800">
                        {theme}
                      </span>
                    </button>
                  )}

                  <div className="pt-2 border-t border-zinc-800 flex gap-2">
                    <button
                      onClick={() => {
                        setIsMoreMenuOpen(false);
                        onOpenWizard();
                      }}
                      className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 bg-brand-cyan/15 hover:bg-brand-cyan text-brand-cyan hover:text-black font-mono text-xs font-bold rounded-lg transition-all"
                    >
                      <IconHelp className="w-3.5 h-3.5" />
                      <span>User Guide</span>
                    </button>
                    {onStartSpotlightTour && (
                      <button
                        onClick={() => {
                          setIsMoreMenuOpen(false);
                          onStartSpotlightTour();
                        }}
                        className="flex items-center justify-center p-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg transition-all"
                        title="UI Spotlight Tour"
                      >
                        <IconPlayerPlay className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mode Navigation Tabs (Smooth horizontal scrolling on touch devices) */}
      <div
        role="tablist"
        aria-label="Studio Mode Navigation"
        className="flex items-center gap-1 px-3 sm:px-6 overflow-x-auto scrollbar-none py-0.5"
      >
        {MODES.map((item) => {
          const isActive = activeMode === item.mode;

          return (
            <button
              key={item.mode}
              role="tab"
              aria-selected={isActive}
              onClick={() => onChangeMode(item.mode)}
              className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 text-xs font-mono font-semibold transition-all border-b-2 whitespace-nowrap outline-none focus-visible:bg-zinc-900 focus-visible:ring-1 focus-visible:ring-brand-cyan ${
                isActive
                  ? "border-brand-cyan text-brand-cyan font-bold bg-brand-cyan/5"
                  : "border-transparent text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50"
              }`}
            >
              {item.icon}
              <span className="hidden sm:inline">{item.label}</span>
              <span className="sm:hidden">{item.shortLabel}</span>
              <span
                className={`text-[9px] px-1 py-0.2 rounded font-mono hidden md:inline-block ${
                  isActive ? "bg-brand-cyan/20 text-brand-cyan" : "bg-zinc-900 text-zinc-600"
                }`}
              >
                {item.shortcut}
              </span>
            </button>
          );
        })}
      </div>
    </header>
  );
};
