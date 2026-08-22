"use client";

import React, { useState } from "react";
import { useResizeObserver } from "@/hooks/useResizeObserver";
import { StudyProtocol, StudioMode, StudioTheme } from "@/lib/crf/types";
import { getStudyPresetsSync } from "@/lib/crf/presets";
import { useDebouncedDiagnostics } from "@/hooks/useDebouncedDiagnostics";
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
  IconTerminal2,
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
  isTerminalOpen?: boolean;
  onToggleLeftSidebar?: () => void;
  onToggleRightInspector?: () => void;
  onToggleTerminal?: () => void;
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
  isTerminalOpen = false,
  onToggleLeftSidebar,
  onToggleRightInspector,
  onToggleTerminal,
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
  const [presets] = useState<
    Array<{
      id: string;
      name: string;
      therapeuticArea?: string;
      study: { protocolNumber: string };
    }>
  >(() => getStudyPresetsSync());
  const branding = getStudyBranding(study);
  const { totalIssues } = useDebouncedDiagnostics(study);

  const currentPreset = presets.find(
    (p) => p.study.protocolNumber === study.protocolNumber
  );

  const MODES: {
    mode: StudioMode;
    label: string;
    shortLabel: string;
    shortcut: string;
    icon: React.ReactNode;
  }[] = [
    {
      mode: "designer",
      label: "Form Designer",
      shortLabel: "Designer",
      shortcut: "1",
      icon: <IconLayoutGrid className="w-3.5 h-3.5" />,
    },
    {
      mode: "matrix",
      label: "Visit Matrix (SoA)",
      shortLabel: "Matrix (SoA)",
      shortcut: "2",
      icon: <IconCalendar className="w-3.5 h-3.5" />,
    },
    {
      mode: "rules",
      label: "Logic & AST Rules",
      shortLabel: "AST Rules",
      shortcut: "3",
      icon: <IconMathFunction className="w-3.5 h-3.5" />,
    },
    {
      mode: "edc",
      label: "Live 21 CFR EDC",
      shortLabel: "Live EDC",
      shortcut: "4",
      icon: <IconShieldCheck className="w-3.5 h-3.5" />,
    },
    {
      mode: "acrf",
      label: "Annotated aCRF",
      shortLabel: "aCRF Viewer",
      shortcut: "5",
      icon: <IconFileCode className="w-3.5 h-3.5" />,
    },
    {
      mode: "export",
      label: "CDISC / Exports",
      shortLabel: "Exports",
      shortcut: "6",
      icon: <IconCode className="w-3.5 h-3.5" />,
    },
  ];

  const headerObserverRef = useResizeObserver<HTMLElement>(
    (entry) => {
      const h = Math.round(entry.contentRect.height);
      if (typeof document !== "undefined" && h > 0) {
        document.documentElement.style.setProperty("--header-height", `${h}px`);
      }
    },
    { trackVertical: true }
  );

  return (
    <header
      ref={headerObserverRef}
      className="border-b border-zinc-850 bg-zinc-950/95 sticky top-0 z-30 backdrop-blur-xl"
    >
      {/* TIER 1: Brand, Protocol Selector & Global Actions Bar */}
      <div className="flex items-center justify-between px-3 sm:px-4 py-2 border-b border-zinc-900/80 gap-3">
        {/* Left Side: Brand, Protocol Selector & Study Badges */}
        <div className="flex items-center gap-2 sm:gap-2.5 min-w-0 shrink">
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="w-2 h-2 rounded-full bg-brand-cyan animate-pulse shrink-0" />
            <span className="font-mono text-xs sm:text-sm font-extrabold text-white tracking-wider uppercase truncate">
              CRF Studio
            </span>
          </div>

          <div className="h-3.5 w-px bg-zinc-800 hidden sm:block shrink-0" />

          {/* Protocol Preset Selector */}
          <div className="flex items-center min-w-0 max-w-[160px] xs:max-w-[200px] sm:max-w-[240px] md:max-w-[280px] shrink">
            <select
              onChange={(e) => onSelectPreset(e.target.value)}
              value={currentPreset?.id || "custom"}
              aria-label="Select Clinical Protocol Preset"
              className="w-full bg-zinc-900/90 border border-zinc-800 hover:border-zinc-700 text-xs font-mono text-zinc-200 rounded-lg px-2.5 py-1 focus:border-brand-cyan focus:ring-1 focus:ring-brand-cyan focus:outline-none truncate transition-colors cursor-pointer"
            >
              {presets.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.study.protocolNumber})
                </option>
              ))}
            </select>
          </div>

          <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-brand-cyan/10 text-brand-cyan border border-brand-cyan/20 hidden sm:inline-flex shrink-0 whitespace-nowrap">
            {study.phase}
          </span>
        </div>

        {/* Right Side: Undo/Redo, Diagnostics, Theme & Global Action Buttons */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Undo / Redo */}
          <div className="flex items-center gap-0.5 bg-zinc-900 border border-zinc-800 rounded-lg p-0.5 shrink-0">
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
              className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 transition-colors inline-flex items-center gap-1 text-[11px] font-mono shrink-0"
              title={
                theme === "light"
                  ? "Switch to Dark Studio Mode"
                  : "Switch to Clinical Light Mode"
              }
              aria-label={
                theme === "light"
                  ? "Switch to Dark Studio Mode"
                  : "Switch to Clinical Light Mode"
              }
            >
              {theme === "light" ? (
                <IconMoon className="w-3.5 h-3.5 text-amber-500" />
              ) : (
                <IconSun className="w-3.5 h-3.5 text-amber-400" />
              )}
            </button>
          )}

          {/* Conformance Diagnostics Badge */}
          <button
            onClick={onOpenDiagnostics}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono transition-all border shrink-0 ${
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
            <span className="hidden md:inline">
              {totalIssues > 0 ? `${totalIssues} Issues` : "Verified"}
            </span>
          </button>

          {/* Primary 1-Click CDASH Quick Scaffolder Button */}
          <button
            onClick={onOpenCdashScaffolder}
            className="inline-flex items-center gap-1 px-2.5 py-1 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 hover:text-white font-mono text-xs font-bold rounded-lg border border-zinc-700 transition-all shrink-0 whitespace-nowrap shadow-xs"
            title="1-Click CDASH Domain Scaffolder (⌘K)"
          >
            <IconSparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="hidden sm:inline">+ CDASH Form</span>
            <span className="sm:hidden">+ CDASH</span>
          </button>

          {/* Simulation Button (Shown on 2xl or via More menu) */}
          <button
            onClick={() => {
              if (typeof window !== "undefined") {
                try {
                  localStorage.setItem(
                    "crf_active_protocol",
                    JSON.stringify(study)
                  );
                } catch {}
                window.location.href = "/arcade/clinical-chaos";
              }
            }}
            className="hidden 2xl:inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white font-mono text-xs font-bold rounded-lg border border-emerald-500/40 transition-all shadow-xs shrink-0 whitespace-nowrap"
            title="Launch Live Conformance Engine Simulation with Active Protocol Pre-Loaded"
          >
            <IconPlayerPlay className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400 shrink-0" />
            <span>Simulate Protocol</span>
          </button>

          {/* Word / PDF Export Modal Trigger (Shown on 2xl or via More menu) */}
          <button
            onClick={onOpenExportDocument}
            className="hidden 2xl:inline-flex items-center gap-1 px-2.5 py-1 bg-blue-600/20 hover:bg-blue-600 text-blue-300 hover:text-white font-mono text-xs font-bold rounded-lg border border-blue-500/40 transition-all shadow-xs shrink-0 whitespace-nowrap"
            title="Export Word (.docx) Protocol Books & PDF Blank/Annotated CRFs"
          >
            <IconFileSpreadsheet className="w-3.5 h-3.5 shrink-0" />
            <span>Docx / PDF</span>
          </button>

          {/* More Actions Trigger Button */}
          <div className="relative">
            <button
              onClick={() => setIsMoreMenuOpen((prev) => !prev)}
              className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 transition-colors inline-flex items-center gap-1 shrink-0"
              title="More Actions & Tools"
              aria-label="More Studio Actions"
              aria-expanded={isMoreMenuOpen}
            >
              <IconDotsVertical className="w-4 h-4" />
              {totalIssues > 0 && (
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              )}
            </button>

            {/* Popover Menu */}
            {isMoreMenuOpen && (
              <>
                <div
                  className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs 2xl:hidden"
                  onClick={() => setIsMoreMenuOpen(false)}
                />
                <div className="absolute right-0 top-full mt-2 w-72 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl p-3 z-50 2xl:hidden space-y-1 animate-in fade-in zoom-in-95 duration-150">
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
                      if (typeof window !== "undefined") {
                        try {
                          localStorage.setItem(
                            "crf_active_protocol",
                            JSON.stringify(study)
                          );
                        } catch {}
                        window.location.href = "/arcade/clinical-chaos";
                      }
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-left text-xs font-mono rounded-xl bg-emerald-950/40 hover:bg-emerald-900/40 text-emerald-200 border border-emerald-800/40 transition-colors"
                  >
                    <IconPlayerPlay className="w-4 h-4 text-emerald-400 fill-emerald-400" />
                    <div className="flex-1">
                      <div className="font-bold">Simulate Protocol</div>
                      <div className="text-[10px] text-emerald-400/70">
                        Launch in Clinical Chaos Arcade
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
                      <div className="font-bold">Docx / PDF Books</div>
                      <div className="text-[10px] text-blue-400/70">
                        Export Word &amp; blank PDFs
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      setIsMoreMenuOpen(false);
                      onOpenBranding();
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-left text-xs font-mono rounded-xl bg-zinc-950 hover:bg-zinc-800 text-zinc-200 transition-colors"
                  >
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: branding.primaryColor }}
                    />
                    <IconPalette className="w-4 h-4 text-brand-cyan" />
                    <div className="flex-1">
                      <div className="font-bold">Organization Branding</div>
                      <div className="text-[10px] text-zinc-500">
                        Logos, colors &amp; header profiles
                      </div>
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
                        <div className="font-bold">Share Studio Protocol</div>
                        <div className="text-[10px] text-zinc-500">
                          Copy direct link with state
                        </div>
                      </div>
                    </button>
                  )}

                  <button
                    onClick={() => {
                      setIsMoreMenuOpen(false);
                      onOpenWizard();
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-left text-xs font-mono rounded-xl bg-zinc-950 hover:bg-zinc-800 text-zinc-200 transition-colors"
                  >
                    <IconHelp className="w-4 h-4 text-brand-cyan" />
                    <div className="flex-1">
                      <div className="font-bold">Interactive Guide</div>
                      <div className="text-[10px] text-zinc-500">
                        How CRF Studio works
                      </div>
                    </div>
                  </button>

                  {onStartSpotlightTour && (
                    <button
                      onClick={() => {
                        setIsMoreMenuOpen(false);
                        onStartSpotlightTour();
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-left text-xs font-mono rounded-xl bg-brand-cyan/10 hover:bg-brand-cyan/20 text-brand-cyan border border-brand-cyan/20 transition-colors"
                    >
                      <IconPlayerPlay className="w-4 h-4 text-brand-cyan" />
                      <div className="flex-1">
                        <div className="font-bold">Spotlight UI Tour</div>
                        <div className="text-[10px] text-brand-cyan/70">
                          Interactive walkthrough
                        </div>
                      </div>
                    </button>
                  )}

                  {onToggleTerminal && (
                    <button
                      onClick={() => {
                        setIsMoreMenuOpen(false);
                        onToggleTerminal();
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-left text-xs font-mono rounded-xl bg-zinc-950 hover:bg-zinc-800 text-brand-cyan transition-colors"
                    >
                      <IconTerminal2 className="w-4 h-4 text-brand-cyan" />
                      <div className="flex-1">
                        <div className="font-bold">CLI Terminal Drawer</div>
                        <div className="text-[10px] text-zinc-500">
                          Interactive command interface
                        </div>
                      </div>
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* TIER 2: Segmented Mode Navigation Rail & Workspace Visibility Toggles */}
      <div className="flex items-center justify-between px-3 sm:px-4 py-1.5 bg-zinc-950/90 gap-2 border-t border-zinc-900/50">
        {/* Left Side: 6 Segmented Mode Navigation Pills */}
        <nav
          role="tablist"
          aria-label="Studio Mode Navigation"
          className="flex items-center gap-1 overflow-x-auto scrollbar-none py-0.5 min-w-0"
        >
          {MODES.map((item) => {
            const isActive = activeMode === item.mode;
            return (
              <button
                key={item.mode}
                role="tab"
                aria-selected={isActive}
                onClick={() => onChangeMode(item.mode)}
                className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono font-semibold transition-all rounded-lg whitespace-nowrap outline-none shrink-0 ${
                  isActive
                    ? "bg-brand-cyan/15 text-brand-cyan font-bold border border-brand-cyan/30 shadow-xs"
                    : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 border border-transparent"
                }`}
              >
                {item.icon}
                <span className="hidden 2xl:inline">{item.label}</span>
                <span className="hidden sm:inline 2xl:hidden">
                  {item.shortLabel}
                </span>
                <span className="sm:hidden">{item.shortLabel}</span>
                <span
                  className={`text-[9px] px-1 py-0.2 rounded font-mono hidden 2xl:inline-block ${
                    isActive
                      ? "bg-brand-cyan/25 text-brand-cyan font-bold"
                      : "bg-zinc-900 text-zinc-600"
                  }`}
                >
                  {item.shortcut}
                </span>
              </button>
            );
          })}
        </nav>

        {/* Right Side: In-Studio Terminal Toggle & Workspace Sidebar Toggles */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Terminal / CLI Drawer Toggle */}
          {onToggleTerminal && (
            <button
              onClick={onToggleTerminal}
              className={`p-1.5 rounded-lg border transition-colors inline-flex items-center gap-1.5 text-[11px] font-mono shrink-0 ${
                isTerminalOpen
                  ? "bg-brand-cyan/20 text-brand-cyan border-brand-cyan/40"
                  : "bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border-zinc-800"
              }`}
              title="Toggle Interactive In-Studio Terminal (⌘J or `)"
            >
              <IconTerminal2 className="w-3.5 h-3.5" />
              <span className="hidden md:inline font-bold">Terminal</span>
            </button>
          )}

          {/* Left Sidebar Toggle Button */}
          {activeMode === "designer" && onToggleLeftSidebar && (
            <button
              onClick={onToggleLeftSidebar}
              className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800 transition-colors hidden md:inline-flex items-center gap-1 text-[11px] font-mono shrink-0"
              title="Toggle Left Forms Navigator (⌘B)"
            >
              {isLeftSidebarOpen ? (
                <IconLayoutSidebarLeftCollapse className="w-3.5 h-3.5 text-brand-cyan" />
              ) : (
                <IconLayoutSidebarLeftExpand className="w-3.5 h-3.5 text-zinc-400" />
              )}
            </button>
          )}

          {/* Right Inspector Toggle Button */}
          {activeMode === "designer" && onToggleRightInspector && (
            <button
              onClick={onToggleRightInspector}
              className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800 transition-colors hidden md:inline-flex items-center gap-1 text-[11px] font-mono shrink-0"
              title="Toggle Property Inspector (⌘I)"
            >
              {isRightInspectorOpen ? (
                <IconLayoutSidebarRightCollapse className="w-3.5 h-3.5 text-brand-cyan" />
              ) : (
                <IconLayoutSidebarRightExpand className="w-3.5 h-3.5 text-zinc-400" />
              )}
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
