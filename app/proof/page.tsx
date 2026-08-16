"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  IconTerminal,
  IconSparkles,
  IconRefresh,
  IconBulb,
  IconShieldCheck,
  IconX,
  IconBook,
  IconTable,
  IconAlertTriangle,
  IconDownload,
  IconCopy,
  IconCheck,
  IconPlayerPlay,
  IconCpu,
  IconWand,
  IconPlus,
  IconLink,
} from "@tabler/icons-react";
import {
  getSuggestion,
  evaluateProofStatus,
  canConnect,
  getNextTacticHint,
  getFallacyDiagnosis,
  getDeductionLedger,
  pruneStepOrNode,
  exportProofToLean4,
  exportProofToLatex,
  exportProofToMarkdown,
  exportProofToMermaid,
  applyRuleToAsts,
  parseFormula,
  formatFormula,
  getCompatibleTargets,
  computeMagneticSnap,
  AlignmentGuide,
  THEOREMS,
  INFERENCE_RULES,
  TheoremId,
  Edge,
  FallacyDiagnosis,
  ProofNode,
} from "@/lib/proof-utils";
import { FieldManualButton } from "@/components/FieldManualButton";
import { InteractiveTruthTable } from "@/components/proof/InteractiveTruthTable";
import { useAudio } from "@/components/providers/AudioProvider";
import { useStudioHashParams } from "@/hooks/useStudioHashParams";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { NextPrevNav } from "@/components/ui/NextPrevNav";

import dynamic from "next/dynamic";

interface TerminalLog {
  id: string;
  type: "command" | "output" | "error" | "info" | "success";
  text: string;
}

export function ProofWorkspaceSkeleton() {
  return (
    <div className="min-h-screen bg-brand-dark text-slate-100 flex flex-col font-sans pt-20 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 w-full flex-1 flex flex-col gap-6">
        {/* Header and Breadcrumbs */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="space-y-1">
            <nav aria-label="Breadcrumb" className="flex items-center text-xs font-mono text-zinc-400 select-none">
              <ol className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                <li className="inline-flex items-center gap-1.5 sm:gap-2">
                  <span className="hover:text-brand-cyan transition-colors duration-150 inline-flex items-center gap-1">
                    Home
                  </span>
                </li>
                <li className="inline-flex items-center gap-1.5 sm:gap-2">
                  <span className="text-zinc-600">/</span>
                  <span className="hover:text-brand-cyan transition-colors duration-150 inline-flex items-center gap-1">
                    Interactive Suite
                  </span>
                </li>
                <li className="inline-flex items-center gap-1.5 sm:gap-2">
                  <span className="text-zinc-600">/</span>
                  <span className="font-bold text-neutral-200">
                    Logical Proof Workspace
                  </span>
                </li>
              </ol>
            </nav>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-2">
              <IconCpu className="w-8 h-8 text-brand-cyan animate-pulse" />
              Logical Proof Canvas
            </h1>
            <p className="text-sm text-slate-400">
              AST Natural Deduction & Distributed Systems Formal Invariant Workbench
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800/80 text-slate-200 text-xs font-semibold">
              <IconLink className="w-4 h-4 text-brand-cyan" />
              Share
            </button>
            <button className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-brand-purple/40 bg-brand-purple/10 text-brand-purple text-xs font-semibold">
              <IconPlus className="w-4 h-4" />
              Custom Studio
            </button>
            <button className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800/80 text-slate-200 text-xs font-semibold">
              <IconDownload className="w-4 h-4" />
              Export
            </button>
            <FieldManualButton manualId="proof" />
          </div>
        </div>

        {/* Curriculum Domain Carousel */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider text-slate-400">Curriculum Invariant Catalog</span>
            <span className="text-xs font-mono text-brand-cyan">
              Status: ⏳ IN PROGRESS
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
            {Array.from({ length: 6 }).map((_, idx) => (
              <div
                key={idx}
                className="flex flex-col text-left p-2.5 rounded-xl border bg-slate-900/60 border-slate-800 h-[62px]"
              >
                <div className="flex items-center justify-between gap-1 mb-1">
                  <span className="w-12 h-3.5 rounded bg-slate-800 animate-pulse" />
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-800 animate-pulse" />
                </div>
                <div className="w-20 h-3 rounded bg-slate-800 mb-1 animate-pulse" />
                <div className="w-16 h-2 rounded bg-slate-800 animate-pulse" />
              </div>
            ))}
          </div>
        </div>

        {/* Workspace Layout: Canvas on Left/Center, Inspector on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Canvas Section */}
          <div className="lg:col-span-8 flex flex-col gap-4">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/80 backdrop-blur overflow-hidden flex flex-col shadow-2xl relative">
              {/* Canvas Header */}
              <div className="px-4 py-3 border-b border-slate-800 flex items-center justify-between bg-slate-950/40 h-[49px]">
                <div className="w-24 h-4 bg-slate-800 rounded animate-pulse" />
                <div className="flex items-center gap-2">
                  <div className="w-14 h-7 bg-slate-800 rounded-lg animate-pulse" />
                  <div className="w-24 h-7 bg-slate-800 rounded-lg animate-pulse" />
                </div>
              </div>

              {/* Tactic Goal Ribbon */}
              <div className="bg-slate-950/60 px-4 py-2 border-b border-slate-800/80 flex items-center justify-between text-xs h-[37px]">
                <div className="w-48 h-4 bg-slate-800 rounded animate-pulse" />
                <div className="w-16 h-4 bg-slate-800 rounded animate-pulse" />
              </div>

              {/* SVG Canvas Area placeholder */}
              <div className="relative w-full h-[420px] bg-gradient-to-b from-slate-950/60 via-slate-900 to-slate-950 select-none overflow-x-auto overflow-y-hidden">
                <div className="relative min-w-[760px] h-full flex items-center justify-center">
                  <svg className="absolute inset-0 w-full h-full pointer-events-none">
                    <defs>
                      <pattern id="skeleton-grid" width="20" height="20" patternUnits="userSpaceOnUse">
                        <circle cx="2" cy="2" r="1" fill="#334155" opacity={0.15} />
                      </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#skeleton-grid)" />
                  </svg>
                  <div className="text-slate-500 font-mono text-xs flex flex-col items-center gap-2">
                    <div className="w-6 h-6 border-2 border-slate-800 border-t-brand-cyan rounded-full animate-spin" />
                    <span>Loading Workspace Canvas...</span>
                  </div>
                </div>
              </div>

              {/* Floating Rule Palette Dock placeholder */}
              <div className="p-3 bg-slate-950/90 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2 h-[57px]">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <div className="w-20 h-4 bg-slate-800 rounded animate-pulse" />
                  <div className="w-16 h-8 bg-slate-800 rounded-lg animate-pulse" />
                  <div className="w-16 h-8 bg-slate-800 rounded-lg animate-pulse" />
                  <div className="w-16 h-8 bg-slate-800 rounded-lg animate-pulse" />
                </div>
                <div className="w-24 h-8 bg-slate-800 rounded-lg animate-pulse" />
              </div>
            </div>
          </div>

          {/* Right Inspector Section */}
          <div className="lg:col-span-4 flex flex-col gap-4">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/80 backdrop-blur overflow-hidden flex flex-col shadow-xl">
              {/* Tab Selector */}
              <div className="grid grid-cols-3 border-b border-slate-800 bg-slate-950/40 text-xs font-medium h-[41px]">
                <div className="border-b-2 border-brand-cyan bg-slate-900 flex items-center justify-center text-slate-400 font-bold">
                  Ledger
                </div>
                <div className="border-transparent flex items-center justify-center text-slate-500">
                  Systems
                </div>
                <div className="border-transparent flex items-center justify-center text-slate-500">
                  Fallacy
                </div>
              </div>

              {/* Tab Content */}
              <div className="p-4 flex flex-col gap-4 min-h-[380px] max-h-[460px] overflow-y-auto">
                <div className="space-y-3">
                  <div className="w-full h-12 bg-slate-800/60 rounded-xl animate-pulse" />
                  <div className="w-full h-12 bg-slate-800/60 rounded-xl animate-pulse" />
                  <div className="w-full h-12 bg-slate-800/60 rounded-xl animate-pulse" />
                  <div className="w-5/6 h-12 bg-slate-800/60 rounded-xl animate-pulse" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const ProofWorkspace = dynamic(
  () => import("./page").then((mod) => mod.ProofWorkspaceClient),
  {
    ssr: false,
    loading: () => <ProofWorkspaceSkeleton />,
  }
);

export default function ProofWorkspacePage() {
  if (typeof process !== "undefined" && process.env.NODE_ENV === "test") {
    return <ProofWorkspaceClient />;
  }
  return <ProofWorkspace />;
}

export function ProofWorkspaceClient() {
  const { params, setParam, setParams } = useStudioHashParams();

  const [activeTheoremId, setActiveTheoremId] = useState<TheoremId>(() => {
    if (typeof window !== "undefined") {
      const rawTh = new URLSearchParams(window.location.hash.slice(1)).get("theorem") as TheoremId;
      if (rawTh && THEOREMS[rawTh]) {
        return rawTh;
      }
    }
    return "modus-ponens";
  });
  const activeTheorem = THEOREMS[activeTheoremId];

  const [edges, setEdges] = useState<Edge[]>(activeTheorem.initialEdges);
  const [selectedNodeIds, setSelectedNodeIds] = useState<string[]>([]);
  const [inspectedNodeId, setInspectedNodeIdState] = useState<string>(() => {
    if (typeof window !== "undefined") {
      const rawNode = new URLSearchParams(window.location.hash.slice(1)).get("inspect");
      if (rawNode) return rawNode;
    }
    return activeTheorem.targetNodeId || "E";
  });
  const [activeTab, setActiveTabState] = useState<"ledger" | "systems" | "fallacy">(() => {
    if (typeof window !== "undefined") {
      const rawTab = new URLSearchParams(window.location.hash.slice(1)).get("tab") as "ledger" | "systems" | "fallacy";
      if (rawTab && ["ledger", "systems", "fallacy"].includes(rawTab)) {
        return rawTab;
      }
    }
    return "ledger";
  });
  const [mobileActiveView, setMobileActiveView] = useState<"canvas" | "ledger" | "systems" | "fallacy" | "terminal">("canvas");
  const [feedbackToast, setFeedbackToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);
  const [currentFallacy, setCurrentFallacy] = useState<FallacyDiagnosis | null>(null);

  // Custom Node drag offsets
  const [nodeOffsets, setNodeOffsets] = useState<Record<string, { x: number; y: number }>>({});
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);

  // Magnetic Snapping & Drag Guides state
  const [isSnappingEnabled, setIsSnappingEnabled] = useState(true);
  const [activeGuides, setActiveGuides] = useState<AlignmentGuide[]>([]);
  const [dragConnection, setDragConnection] = useState<{
    sourceId: string;
    sourceX: number;
    sourceY: number;
    currentX: number;
    currentY: number;
    hoveredTargetId: string | null;
    isValid: boolean;
    ruleBadge?: string;
  } | null>(null);

  // Custom Studio modal state
  const [isCustomStudioOpen, setIsCustomStudioOpen] = useState(false);
  const [customPremise1, setCustomPremise1] = useState("P");
  const [customPremise2, setCustomPremise2] = useState("P -> Q");
  const [customPremise3, setCustomPremise3] = useState("Q -> R");
  const [customGoal, setCustomGoal] = useState("R");

  // Export Modal state
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [exportFormat, setExportFormat] = useState<"lean" | "latex" | "markdown" | "mermaid">("lean");
  const [hasCopiedExport, setHasCopiedExport] = useState(false);

  // CLI Console State
  const [isConsoleOpen, setIsConsoleOpen] = useState(true);
  const [consoleInput, setConsoleInput] = useState("");
  const [consoleLogs, setConsoleLogs] = useState<TerminalLog[]>([
    {
      id: "welcome",
      type: "info",
      text: "Interactive Logic Proof Canvas v3.0.0 · Multi-Theorem Formal Verification Suite\nClick nodes to select premises, fire inference rules from the Rule Palette, or run CLI commands. Type 'help' for command syntax.",
    },
  ]);
  const [history, setHistory] = useState<string[]>([]);
  const [historyIdx, setHistoryIdx] = useState(-1);
  const [liveAnnouncement, setLiveAnnouncement] = useState("");
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationProgress, setSimulationProgress] = useState<{ step: number; total: number; log: string } | null>(null);

  // Refs
  const dragStartRef = useRef<{ startX: number; startY: number; initOffsetX: number; initOffsetY: number } | null>(null);
  const canvasWrapperRef = useRef<HTMLDivElement>(null);
  const lastSnapAudioTimeRef = useRef(0);
  const workerRef = useRef<Worker | null>(null);
  const watchdogRef = useRef<NodeJS.Timeout | null>(null);
  const pendingLogsRef = useRef<TerminalLog[]>([]);
  const nextIdRef = useRef(0);
  const initWorkerRef = useRef<() => void>(() => {});
  const consoleInputRef = useRef<HTMLInputElement>(null);
  const toggleBtnRef = useRef<HTMLButtonElement>(null);
  const lastActiveElementRef = useRef<HTMLElement | null>(null);
  const terminalLogsContainerRef = useRef<HTMLDivElement>(null);
  const svgCanvasRef = useRef<SVGSVGElement>(null);

  const { playSuccess, playAutocomplete, playHover } = useAudio();

  const announceToScreenReader = React.useCallback((text: string) => {
    setLiveAnnouncement("");
    setTimeout(() => {
      setLiveAnnouncement(text);
    }, 10);
  }, []);

  const showToast = React.useCallback((message: string, type: "success" | "error" | "info" = "info") => {
    setFeedbackToast({ message, type });
    setTimeout(() => {
      setFeedbackToast((prev) => (prev?.message === message ? null : prev));
    }, 4000);
  }, []);

  // Synchronize incoming hash state on mount or browser Back/Forward navigation
  useEffect(() => {
    const rawTh = params.theorem as TheoremId | undefined;
    if (rawTh && THEOREMS[rawTh] && rawTh !== activeTheoremId) {
      const nextTh = THEOREMS[rawTh];
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setActiveTheoremId(rawTh);
      setEdges(nextTh.initialEdges);
      setSelectedNodeIds([]);
      setInspectedNodeIdState(nextTh.targetNodeId);
      setNodeOffsets({});
      setCurrentFallacy(null);
    }

    const rawTab = params.tab as "ledger" | "systems" | "fallacy" | undefined;
    if (rawTab && ["ledger", "systems", "fallacy"].includes(rawTab) && rawTab !== activeTab) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setActiveTabState(rawTab);
    }

    const rawInspect = params.inspect;
    if (rawInspect && rawInspect !== inspectedNodeId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setInspectedNodeIdState(rawInspect);
    }
  }, [params, activeTheoremId, activeTab, inspectedNodeId]);

  const setActiveTab = (tab: "ledger" | "systems" | "fallacy") => {
    setActiveTabState(tab);
    setParam("tab", tab === "ledger" ? null : tab, { replace: true });
  };

  const setInspectedNodeId = (nodeId: string) => {
    setInspectedNodeIdState(nodeId);
    setParam("inspect", nodeId === activeTheorem.targetNodeId ? null : nodeId, { replace: true });
  };

  const handleCopyShareLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href).then(() => {
        try {
          playSuccess();
        } catch {}
        showToast("Proof Studio link copied to clipboard with current theorem & tab!", "success");
      });
    }
  };

  const { isC_Proven, isE_Proven } = useMemo(
    () => evaluateProofStatus(edges, activeTheoremId),
    [edges, activeTheoremId]
  );

  const activeTacticHint = useMemo(
    () => getNextTacticHint(edges, activeTheoremId),
    [edges, activeTheoremId]
  );

  const deductionLedger = useMemo(
    () => getDeductionLedger(edges, activeTheoremId),
    [edges, activeTheoremId]
  );

  const activeSourceId =
    dragConnection?.sourceId || (selectedNodeIds.length === 1 ? selectedNodeIds[0] : null);

  const compatibleTargets = useMemo(
    () => (activeSourceId ? getCompatibleTargets(activeSourceId, activeTheoremId, edges) : []),
    [activeSourceId, activeTheoremId, edges]
  );

  const toggleSnapping = React.useCallback(() => {
    setIsSnappingEnabled((prev) => {
      const next = !prev;
      try {
        playAutocomplete();
      } catch {}
      showToast(
        next
          ? "Magnetic Snapping enabled (20px grid & alignment crosshairs)"
          : "Magnetic Snapping disabled (freeform drag)",
        "info"
      );
      announceToScreenReader(
        next ? "Magnetic snapping and alignment guides enabled." : "Magnetic snapping disabled."
      );
      return next;
    });
  }, [playAutocomplete, showToast, announceToScreenReader]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const targetTag = (e.target as HTMLElement)?.tagName?.toLowerCase();
      if (
        targetTag === "input" ||
        targetTag === "textarea" ||
        (e.target as HTMLElement)?.isContentEditable
      ) {
        return;
      }
      if (e.key === "g" || e.key === "G") {
        e.preventDefault();
        toggleSnapping();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [toggleSnapping]);

  const toggleConsole = React.useCallback(() => {
    setIsConsoleOpen((prev) => {
      const next = !prev;
      if (next) {
        lastActiveElementRef.current = document.activeElement as HTMLElement;
        announceToScreenReader("Command console opened split-view alongside proof workspace. Input focused.");
        setTimeout(() => {
          consoleInputRef.current?.focus({ preventScroll: true });
        }, 50);
      } else {
        announceToScreenReader("Command console closed. Focus returned to workspace.");
        setTimeout(() => {
          toggleBtnRef.current?.focus({ preventScroll: true });
        }, 50);
      }
      return next;
    });
  }, [announceToScreenReader]);

  const clearWatchdog = React.useCallback(() => {
    if (watchdogRef.current) {
      clearTimeout(watchdogRef.current);
      watchdogRef.current = null;
    }
  }, []);

  const currentRequestIdRef = useRef(0);

  const handleWatchdogTimeout = React.useCallback(() => {
    if (workerRef.current) {
      workerRef.current.terminate();
    }
    initWorkerRef.current();
    setIsSimulating(false);
    setSimulationProgress(null);
    clearWatchdog();

    nextIdRef.current += 1;
    const outputLogId = `out-timeout-${nextIdRef.current}`;
    setConsoleLogs((prev) => [
      ...prev,
      {
        id: outputLogId,
        type: "error",
        text: "Background calculation terminated by watchdog: execution exceeded 5-second limit (potential infinite loop detected)",
      },
    ]);
    announceToScreenReader("Background calculation terminated by watchdog: execution exceeded 5-second limit.");
  }, [clearWatchdog, announceToScreenReader]);

  const resetWatchdog = React.useCallback(() => {
    clearWatchdog();
    watchdogRef.current = setTimeout(() => {
      handleWatchdogTimeout();
    }, 5000);
  }, [clearWatchdog, handleWatchdogTimeout]);

  const initWorker = React.useCallback(() => {
    if (typeof window !== "undefined" && typeof Worker !== "undefined") {
      if (workerRef.current) {
        workerRef.current.terminate();
      }

      const worker = new Worker(new URL("./proof-worker.ts", import.meta.url));

      worker.onmessage = (event) => {
        const message = event.data;
        if (!message) return;

        // Discard stale in-flight messages from previous request IDs
        if (message.requestId && message.requestId !== currentRequestIdRef.current) {
          return;
        }

        resetWatchdog();

        if (message.type === "progress") {
          pendingLogsRef.current.push({
            id: `sim-${Date.now()}-${Math.random()}`,
            type: "output",
            text: message.log,
          });
          announceToScreenReader(`Simulation update: ${message.log}`);
        } else if (message.type === "done") {
          setIsSimulating(false);
          setSimulationProgress(null);
          clearWatchdog();

          setConsoleLogs((prev) => [
            ...prev,
            {
              id: `sim-done-${Date.now()}`,
              type: "success",
              text: `✔ Background Simulation completed successfully with ${message.stepsCompleted} steps.`,
            },
          ]);
          announceToScreenReader("Background proof simulation completed successfully.");
        } else if (message.type === "error") {
          setIsSimulating(false);
          setSimulationProgress(null);
          clearWatchdog();

          setConsoleLogs((prev) => [
            ...prev,
            {
              id: `sim-err-${Date.now()}`,
              type: "error",
              text: `Background Simulation error: ${message.message}`,
            },
          ]);
          announceToScreenReader(`Background proof simulation error: ${message.message}`);
        }
      };

      workerRef.current = worker;
    }
  }, [clearWatchdog, resetWatchdog, announceToScreenReader]);

  useEffect(() => {
    initWorkerRef.current = initWorker;
  }, [initWorker]);

  useEffect(() => {
    initWorker();

    // 100ms batch logs flush timer
    const flushInterval = setInterval(() => {
      if (pendingLogsRef.current.length > 0) {
        const logsToAppend = [...pendingLogsRef.current];
        pendingLogsRef.current = [];

        setConsoleLogs((prev) => [...prev, ...logsToAppend]);

        const stepLogs = logsToAppend.filter(
          (log) => log.type === "output" && log.text.includes("[Step")
        );
        if (stepLogs.length > 0) {
          const lastStepLog = stepLogs[stepLogs.length - 1];
          const match = lastStepLog.text.match(/\[Step (\d+)\/(\d+)\] (.*)/);
          if (match) {
            const step = parseInt(match[1], 10);
            const total = parseInt(match[2], 10);
            const textLog = match[3];
            setSimulationProgress({ step, total, log: textLog });
          }
        }
      }
    }, 100);

    return () => {
      if (workerRef.current) {
        workerRef.current.terminate();
      }
      clearInterval(flushInterval);
      clearWatchdog();
    };
  }, [initWorker, clearWatchdog]);

  useEffect(() => {
    if (terminalLogsContainerRef.current) {
      terminalLogsContainerRef.current.scrollTop = terminalLogsContainerRef.current.scrollHeight;
    }
  }, [consoleLogs]);

  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey && e.key === "\\") || (e.ctrlKey && e.key === "`")) {
        e.preventDefault();
        if (!isConsoleOpen) {
          toggleConsole();
        } else {
          if (document.activeElement !== consoleInputRef.current) {
            consoleInputRef.current?.focus({ preventScroll: true });
            announceToScreenReader("Focused terminal command input.");
          } else {
            toggleConsole();
          }
        }
      }
    };
    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, [toggleConsole, isConsoleOpen, announceToScreenReader]);

  const handleSwitchTheorem = (newTheoremId: TheoremId) => {
    if (newTheoremId === activeTheoremId) return;
    const nextTh = THEOREMS[newTheoremId];
    if (!nextTh) return;

    if (workerRef.current) {
      currentRequestIdRef.current += 1;
      workerRef.current.postMessage({ type: "ABORT" });
      setIsSimulating(false);
      setSimulationProgress(null);
      clearWatchdog();
    }

    setActiveTheoremId(newTheoremId);
    setEdges(nextTh.initialEdges);
    setSelectedNodeIds([]);
    setInspectedNodeIdState(nextTh.targetNodeId);
    setNodeOffsets({});
    setCurrentFallacy(null);

    setParams(
      {
        theorem: newTheoremId === "modus-ponens" ? null : newTheoremId,
        inspect: null,
      },
      { replace: false }
    );

    try {
      playAutocomplete();
    } catch {}

    showToast(`Switched active theorem scenario to '${nextTh.title}'`, "info");
    announceToScreenReader(`Switched theorem to ${nextTh.title}.`);

    setConsoleLogs((prev) => [
      ...prev,
      {
        id: `switch-${Date.now()}`,
        type: "info",
        text: `Switched active theorem to [${nextTh.title}] · ${nextTh.ruleName}\nGoal: ${nextTh.goalDescription}`,
      },
    ]);
  };

  const handleNodePointerDown = React.useCallback((e: React.PointerEvent, nodeId: string) => {
    e.stopPropagation();
    setDraggingNodeId(nodeId);
    const currentOffset = nodeOffsets[nodeId] || { x: 0, y: 0 };
    dragStartRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      initOffsetX: currentOffset.x,
      initOffsetY: currentOffset.y,
    };
    (e.target as Element).setPointerCapture(e.pointerId);
  }, [nodeOffsets]);

  const handleNodePointerMove = React.useCallback((e: React.PointerEvent, nodeId: string) => {
    if (draggingNodeId !== nodeId || !dragStartRef.current) return;
    const sNode = activeTheorem.nodes.find((n) => n.id === nodeId);
    if (!sNode) return;

    const dx = e.clientX - dragStartRef.current.startX;
    const dy = e.clientY - dragStartRef.current.startY;
    const rawX = sNode.x + dragStartRef.current.initOffsetX + dx;
    const rawY = sNode.y + dragStartRef.current.initOffsetY + dy;

    if (isSnappingEnabled) {
      const peerNodes = activeTheorem.nodes
        .filter((n) => n.id !== nodeId)
        .map((n) => {
          const off = nodeOffsets[n.id] || { x: 0, y: 0 };
          return {
            id: n.id,
            x: n.x + off.x,
            y: n.y + off.y,
            width: 160,
            height: 70,
          };
        });

      const snap = computeMagneticSnap(rawX, rawY, 160, 70, peerNodes, {
        gridSize: 20,
        threshold: 12,
        enableGrid: true,
        enableAlignment: true,
      });

      setActiveGuides(snap.guides);

      if (snap.snappedX || snap.snappedY) {
        const now = typeof performance !== "undefined" ? performance.now() : 0;
        if (now - lastSnapAudioTimeRef.current > 350) {
          lastSnapAudioTimeRef.current = now;
          try {
            playHover();
          } catch {}
        }
      }

      setNodeOffsets((prev) => ({
        ...prev,
        [nodeId]: {
          x: snap.x - sNode.x,
          y: snap.y - sNode.y,
        },
      }));
    } else {
      setActiveGuides([]);
      setNodeOffsets((prev) => ({
        ...prev,
        [nodeId]: {
          x: dragStartRef.current!.initOffsetX + dx,
          y: dragStartRef.current!.initOffsetY + dy,
        },
      }));
    }
  }, [draggingNodeId, activeTheorem.nodes, isSnappingEnabled, nodeOffsets, playHover]);

  const handleNodePointerUp = React.useCallback((e: React.PointerEvent, nodeId: string) => {
    if (draggingNodeId === nodeId) {
      setDraggingNodeId(null);
      dragStartRef.current = null;
      setActiveGuides([]);
      try {
        (e.target as Element).releasePointerCapture(e.pointerId);
      } catch {}
    }
  }, [draggingNodeId]);

  const handleHandlePointerDown = (e: React.PointerEvent, nodeId: string) => {
    e.stopPropagation();
    const sNode = activeTheorem.nodes.find((n) => n.id === nodeId);
    if (!sNode) return;
    const offset = nodeOffsets[nodeId] || { x: 0, y: 0 };
    const sourceX = sNode.x + offset.x + 160;
    const sourceY = sNode.y + offset.y + 35;

    setDragConnection({
      sourceId: nodeId,
      sourceX,
      sourceY,
      currentX: sourceX,
      currentY: sourceY,
      hoveredTargetId: null,
      isValid: false,
    });

    try {
      (e.target as Element).setPointerCapture(e.pointerId);
      playHover();
    } catch {}

    announceToScreenReader(`Started connection drag from Node ${nodeId}. Drag to a compatible target node.`);
  };

  const handleCanvasPointerMove = (e: React.PointerEvent) => {
    if (!dragConnection) return;
    const rect = canvasWrapperRef.current?.getBoundingClientRect();
    if (!rect) return;

    const currentX = e.clientX - rect.left;
    const currentY = e.clientY - rect.top;

    let hoveredTarget: ProofNode | null = null;
    for (const node of activeTheorem.nodes) {
      if (node.id === dragConnection.sourceId) continue;
      const off = nodeOffsets[node.id] || { x: 0, y: 0 };
      const nX = node.x + off.x;
      const nY = node.y + off.y;
      if (currentX >= nX - 10 && currentX <= nX + 170 && currentY >= nY - 10 && currentY <= nY + 85) {
        hoveredTarget = node;
        break;
      }
    }

    const hoveredTargetId = hoveredTarget ? hoveredTarget.id : null;
    let isValid = false;
    let ruleBadge = "";

    if (hoveredTargetId) {
      const validation = canConnect(dragConnection.sourceId, hoveredTargetId, edges, activeTheoremId);
      isValid = validation.allowed;
      if (isValid) {
        const targets = getCompatibleTargets(dragConnection.sourceId, activeTheoremId, edges);
        const found = targets.find((c) => c.targetId === hoveredTargetId);
        ruleBadge = found?.badgeLabel || "Valid Inferred Target";
      }
    }

    setDragConnection((prev) =>
      prev
        ? {
            ...prev,
            currentX,
            currentY,
            hoveredTargetId,
            isValid,
            ruleBadge,
          }
        : null
    );
  };

  const handleCanvasPointerUp = (e: React.PointerEvent) => {
    if (!dragConnection) return;
    try {
      (e.target as Element).releasePointerCapture(e.pointerId);
    } catch {}

    if (dragConnection.hoveredTargetId && dragConnection.isValid) {
      const sId = dragConnection.sourceId;
      const tId = dragConnection.hoveredTargetId;
      setEdges((prev) => [...prev, { source: sId, target: tId }]);
      try {
        playSuccess();
      } catch {}
      showToast(`Connected Node ${sId} to Node ${tId} (${dragConnection.ruleBadge || "Inference"})`, "success");
      announceToScreenReader(`Connected Node ${sId} to Node ${tId} via ${dragConnection.ruleBadge || "deductive rule"}.`);
      setConsoleLogs((prev) => [
        ...prev,
        {
          id: `drag-conn-${Date.now()}`,
          type: "success",
          text: `Connected Node ${sId} → Node ${tId} via interactive drag cord. Rule: ${dragConnection.ruleBadge || "Inference"}`,
        },
      ]);
    } else if (dragConnection.hoveredTargetId && !dragConnection.isValid) {
      const sId = dragConnection.sourceId;
      const tId = dragConnection.hoveredTargetId;
      const fallacy = getFallacyDiagnosis(sId, tId, edges, activeTheoremId);
      setCurrentFallacy(fallacy);
      setActiveTab("fallacy");
      showToast(`Invalid Connection: ${fallacy.fallacyName}`, "error");
      announceToScreenReader(`Connection rejected: ${fallacy.fallacyName}`);
    }

    setDragConnection(null);
  };

  const handleResetLayout = () => {
    setNodeOffsets({});
    setActiveGuides([]);
    setDragConnection(null);
    setEdges(activeTheorem.initialEdges);
    setSelectedNodeIds([]);
    setCurrentFallacy(null);
    try {
      playAutocomplete();
    } catch {}
    showToast("Workspace state reset to default layout.", "info");
    announceToScreenReader("Workspace state reset to default layout.");
  };

  const handleNodeClick = (nodeId: string) => {
    try {
      playHover();
    } catch {}

    setInspectedNodeId(nodeId);

    if (selectedNodeIds.length === 0) {
      setSelectedNodeIds([nodeId]);
      showToast(`Selected Node ${nodeId}. Pick another node or choose an Inference Rule.`, "info");
      announceToScreenReader(`Selected Node ${nodeId}.`);
      return;
    }

    if (selectedNodeIds.includes(nodeId)) {
      setSelectedNodeIds((prev) => prev.filter((id) => id !== nodeId));
      showToast(`Deselected Node ${nodeId}.`, "info");
      announceToScreenReader(`Deselected Node ${nodeId}.`);
      return;
    }

    if (selectedNodeIds.length === 1) {
      const sourceId = selectedNodeIds[0];
      const validation = canConnect(sourceId, nodeId, edges, activeTheoremId);
      if (!validation.allowed) {
        const fallacy = getFallacyDiagnosis(sourceId, nodeId, edges, activeTheoremId);
        setCurrentFallacy(fallacy);
        setActiveTab("fallacy");

        showToast(`Invalid Connection: ${fallacy.fallacyName}`, "error");
        announceToScreenReader(`Connection rejected: ${fallacy.fallacyName}. ${validation.reason}`);
        setConsoleLogs((prev) => [
          ...prev,
          {
            id: `err-${Date.now()}`,
            type: "error",
            text: `[FALLACY DETECTED] ${fallacy.fallacyName}: ${validation.reason}\nFormula: ${fallacy.formalFormula}\nAnalogy: ${fallacy.softwareAnalogy}`,
          },
        ]);
        setSelectedNodeIds([]);
        return;
      }

      const newEdge: Edge = { source: sourceId, target: nodeId };
      setEdges((prev) => [...prev, newEdge]);
      setSelectedNodeIds([]);
      setCurrentFallacy(null);

      try {
        playSuccess();
      } catch {}

      showToast(`✔ Connected Node ${newEdge.source} → Node ${newEdge.target}!`, "success");
      announceToScreenReader(`Successfully connected Node ${newEdge.source} to Node ${newEdge.target}.`);

      const sNode = activeTheorem.nodes.find((n) => n.id === newEdge.source);
      const tNode = activeTheorem.nodes.find((n) => n.id === newEdge.target);

      setConsoleLogs((prev) => [
        ...prev,
        {
          id: `cmd-${Date.now()}`,
          type: "command",
          text: `connect ${newEdge.source} ${newEdge.target}`,
        },
        {
          id: `out-${Date.now()}`,
          type: "success",
          text: `✔ Established edge: Node ${newEdge.source} (${sNode?.label}) → Node ${newEdge.target} (${tNode?.label})`,
        },
      ]);
      return;
    }

    setSelectedNodeIds([nodeId]);
  };

  const handleApplyRule = (ruleId: string) => {
    if (selectedNodeIds.length === 0) {
      showToast("Select at least 1 premise/lemma node before applying a rule.", "info");
      return;
    }

    const selectedNodes = selectedNodeIds
      .map((id) => activeTheorem.nodes.find((n) => n.id === id))
      .filter((n): n is ProofNode => Boolean(n));

    const asts = selectedNodes
      .map((n) => n.ast || parseFormula(n.label))
      .filter((ast): ast is NonNullable<typeof ast> => Boolean(ast));

    const ruleResult = applyRuleToAsts(ruleId, asts);

    if (ruleResult.success && ruleResult.resultAst) {
      try {
        playSuccess();
      } catch {}

      const autoTarget = activeTheorem.nodes.find(
        (n) => n.label === formatFormula(ruleResult.resultAst!) || n.id === activeTheorem.intermediateNodeId || n.id === activeTheorem.targetNodeId
      );

      if (autoTarget) {
        const newEdges: Edge[] = selectedNodeIds.map((s) => ({
          source: s,
          target: autoTarget.id,
          ruleApplied: ruleId.toUpperCase(),
        }));
        setEdges((prev) => [...prev, ...newEdges]);
      }

      setSelectedNodeIds([]);
      setCurrentFallacy(null);
      showToast(`✔ ${ruleResult.explanation}`, "success");
      announceToScreenReader(`Applied rule ${ruleId.toUpperCase()}: ${ruleResult.explanation}`);

      setConsoleLogs((prev) => [
        ...prev,
        {
          id: `cmd-${Date.now()}`,
          type: "command",
          text: `apply ${ruleId} ${selectedNodeIds.join(" ")}`,
        },
        {
          id: `out-${Date.now()}`,
          type: "success",
          text: `✔ ${ruleResult.explanation}`,
        },
      ]);
    } else {
      const sId = selectedNodeIds[0];
      const tId = selectedNodeIds[1] || sId;
      const fallacy = getFallacyDiagnosis(sId, tId, edges, activeTheoremId);
      setCurrentFallacy(fallacy);
      setActiveTab("fallacy");

      showToast(`Rule Application Failed: ${ruleResult.explanation || fallacy.fallacyName}`, "error");
      announceToScreenReader(`Rule failed: ${ruleResult.explanation || fallacy.fallacyName}`);

      setConsoleLogs((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          type: "error",
          text: `[RULE ERROR] ${ruleResult.explanation || fallacy.fallacyName}\n${fallacy.plainEnglish}`,
        },
      ]);
    }
  };

  const handleAutoStep = () => {
    if (isE_Proven) {
      showToast("Goal already fully discharged (Q.E.D.)!", "success");
      return;
    }

    if (!isC_Proven) {
      const [r1, r2] = activeTheorem.intermediateRequires;
      const newEdges: Edge[] = [
        { source: r1, target: activeTheorem.intermediateNodeId },
        { source: r2, target: activeTheorem.intermediateNodeId },
      ];
      setEdges((prev) => [...prev, ...newEdges]);
      showToast(`Auto-Step: Connected premises to intermediate Node ${activeTheorem.intermediateNodeId}`, "success");
    } else {
      const [cr1, cr2] = activeTheorem.conclusionRequires;
      const newEdges: Edge[] = [
        { source: cr1, target: activeTheorem.targetNodeId },
        { source: cr2, target: activeTheorem.targetNodeId },
      ];
      setEdges((prev) => [...prev, ...newEdges]);
      showToast(`Auto-Step: Connected intermediate and premise to Target Node ${activeTheorem.targetNodeId}`, "success");
    }

    try {
      playSuccess();
    } catch {}
  };

  const handleDeleteStep = (stepOrNode: number | string) => {
    const result = pruneStepOrNode(stepOrNode, edges, activeTheoremId);
    if (!result.success) {
      showToast(result.reason, "error");
      announceToScreenReader(result.reason);
      setConsoleLogs((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          type: "error",
          text: `[PRUNE ERROR] ${result.reason}`,
        },
      ]);
      return;
    }

    setEdges(result.newEdges);
    setCurrentFallacy(null);
    showToast(`✔ ${result.reason}`, "info");
    announceToScreenReader(result.reason);

    try {
      playAutocomplete();
    } catch {}

    setConsoleLogs((prev) => [
      ...prev,
      {
        id: `prune-${Date.now()}`,
        type: "info",
        text: `✔ ${result.reason}`,
      },
    ]);
  };

  const handleStartSimulation = (mode: "normal" | "loop" = "normal") => {
    if (isSimulating) return;

    currentRequestIdRef.current += 1;
    const reqId = currentRequestIdRef.current;

    setIsSimulating(true);
    setSimulationProgress({ step: 1, total: 10, log: "Booting Proof Simulation Engine..." });
    resetWatchdog();

    setConsoleLogs((prev) => [
      ...prev,
      {
        id: `sim-start-${Date.now()}`,
        type: "info",
        text: `Starting Proof Graph Simulation for [${activeTheorem.title}] in mode '${mode}'...`,
      },
    ]);

    if (workerRef.current) {
      workerRef.current.postMessage({
        type: "START_SIMULATION",
        requestId: reqId,
        mode,
        theoremId: activeTheoremId,
      });
    }
  };

  const handleConsoleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const rawInput = consoleInput.trim();
    if (!rawInput) return;

    setHistory((prev) => [rawInput, ...prev]);
    setHistoryIdx(-1);
    setConsoleInput("");

    setConsoleLogs((prev) => [
      ...prev,
      {
        id: `cmd-${Date.now()}`,
        type: "command",
        text: rawInput,
      },
    ]);

    const tokens = rawInput.split(/\s+/);
    const op = tokens[0].toLowerCase();

    if (op === "help") {
      setConsoleLogs((prev) => [
        ...prev,
        {
          id: `help-${Date.now()}`,
          type: "info",
          text: `Interactive Proof Workspace CLI v3.0 Commands:
  connect <src> <tgt>    Connect two nodes with deductive edge
  disconnect <src> <tgt> Remove an edge between nodes
  prune <step|node>      Prune a derived step (Step 3/5 or C/E) and dependent edges
  delete-step <n>        Delete a derived deduction step by line number
  apply <rule> <nodes..> Apply an inference rule (mp, mt, hs, ds, res, and_intro)
  autostep               Automatically advance the next valid inference step
  list                   List all nodes and active edges in graph
  inspect <nodeId>       Inspect details of a specific node
  theorem <id>           Switch theorem scenario (mp, mt, hs, ds, res, 2pc, quorum, cache)
  ledger                 Print deduction ledger table
  export <format>        Export proof (lean, latex, markdown, mermaid)
  simulate normal|loop   Run verification engine in background Web Worker
  clear                  Clear terminal buffer
  help                   Print this command reference`,
        },
      ]);
      announceToScreenReader("Printed help manual.");
      return;
    }

    if (op === "clear") {
      setConsoleLogs([]);
      announceToScreenReader("Cleared terminal logs.");
      return;
    }

    if (op === "list") {
      const nodeListStr = activeTheorem.nodes
        .map((n) => `  [Node ${n.id}] ${n.label} (${n.type}) - ${n.description}`)
        .join("\n");
      const edgeListStr =
        edges.length > 0
          ? edges.map((e) => `  ${e.source} -> ${e.target}${e.ruleApplied ? ` [${e.ruleApplied}]` : ""}`).join("\n")
          : "  (None)";

      setConsoleLogs((prev) => [
        ...prev,
        {
          id: `list-${Date.now()}`,
          type: "info",
          text: `Active Theorem: ${activeTheorem.title} (${activeTheorem.category})\nNodes:\n${nodeListStr}\nEdges:\n${edgeListStr}\nStatus: ${isE_Proven ? "✔ Q.E.D." : "⏳ INCOMPLETE"}`,
        },
      ]);
      announceToScreenReader("Listed active nodes and connections.");
      return;
    }

    if (op === "connect") {
      const s = tokens[1]?.toUpperCase();
      const t = tokens[2]?.toUpperCase();
      if (!s || !t) {
        setConsoleLogs((prev) => [
          ...prev,
          {
            id: `err-${Date.now()}`,
            type: "error",
            text: "Usage: connect <sourceNode> <targetNode>",
          },
        ]);
        return;
      }
      handleNodeClick(s);
      handleNodeClick(t);
      return;
    }

    if (op === "disconnect") {
      const s = tokens[1]?.toUpperCase();
      const t = tokens[2]?.toUpperCase();
      if (!s || !t) {
        setConsoleLogs((prev) => [
          ...prev,
          {
            id: `err-${Date.now()}`,
            type: "error",
            text: "Usage: disconnect <sourceNode> <targetNode>",
          },
        ]);
        return;
      }
      setEdges((prev) =>
        prev.filter((e) => !(e.source === s && e.target === t) && !(e.source === t && e.target === s))
      );
      setConsoleLogs((prev) => [
        ...prev,
        {
          id: `disc-${Date.now()}`,
          type: "info",
          text: `Removed edge between Node ${s} and Node ${t}.`,
        },
      ]);
      announceToScreenReader(`Disconnected Node ${s} and Node ${t}.`);
      return;
    }

    if (op === "prune" || op === "delete-step") {
      const target = tokens[1];
      if (!target) {
        setConsoleLogs((prev) => [
          ...prev,
          {
            id: `err-${Date.now()}`,
            type: "error",
            text: "Usage: prune <stepNumber|nodeId> or delete-step <stepNumber>",
          },
        ]);
        return;
      }
      handleDeleteStep(target);
      return;
    }

    if (op === "apply") {
      const rule = tokens[1]?.toLowerCase();
      const nodes = tokens.slice(2).map((n) => n.toUpperCase());
      if (!rule || nodes.length === 0) {
        setConsoleLogs((prev) => [
          ...prev,
          {
            id: `err-${Date.now()}`,
            type: "error",
            text: "Usage: apply <rule> <node1> [node2...]",
          },
        ]);
        return;
      }
      setSelectedNodeIds(nodes);
      handleApplyRule(rule);
      return;
    }

    if (op === "autostep" || op === "solve") {
      handleAutoStep();
      return;
    }

    if (op === "inspect") {
      const nId = tokens[1]?.toUpperCase();
      const node = activeTheorem.nodes.find((n) => n.id === nId);
      if (!node) {
        setConsoleLogs((prev) => [
          ...prev,
          {
            id: `err-${Date.now()}`,
            type: "error",
            text: `Node '${nId}' not found.`,
          },
        ]);
        return;
      }
      setInspectedNodeId(node.id);
      setConsoleLogs((prev) => [
        ...prev,
        {
          id: `insp-${Date.now()}`,
          type: "info",
          text: `[Node ${node.id}] ${node.label}\nType: ${node.type.toUpperCase()}\nFormula: ${node.label}\nDescription: ${node.description}\nMeaning: ${node.meaning}`,
        },
      ]);
      announceToScreenReader(`Inspecting Node ${node.id}.`);
      return;
    }

    if (op === "theorem" || op === "switch") {
      const targetTh = tokens[1]?.toLowerCase();
      const map: Record<string, TheoremId> = {
        mp: "modus-ponens",
        mt: "modus-tollens",
        hs: "hypothetical-syllogism",
        ds: "disjunctive-syllogism",
        res: "resolution",
        "2pc": "two-phase-commit",
        quorum: "quorum-overlap",
        cache: "cache-consistency",
        synod: "paxos-synod",
        paxos: "paxos-synod",
        "paxos-synod": "paxos-synod",
        "paxos-phase2b": "paxos-phase2b",
        paxos2b: "paxos-phase2b",
        phase2b: "paxos-phase2b",
        "2b": "paxos-phase2b",
        bft: "bft-quorum",
        "bft-quorum": "bft-quorum",
        pbft: "bft-quorum",
        "pbft-quorum": "bft-quorum",
        custom: "custom",
      };
      const thId = map[targetTh] || (targetTh as TheoremId);
      if (THEOREMS[thId]) {
        handleSwitchTheorem(thId);
      } else {
        setConsoleLogs((prev) => [
          ...prev,
          {
            id: `err-${Date.now()}`,
            type: "error",
            text: `Unknown theorem ID '${targetTh}'. Available: mp, mt, hs, ds, res, 2pc, quorum, cache, synod, paxos2b, bft, custom.`,
          },
        ]);
      }
      return;
    }

    if (op === "ledger") {
      const ledger = getDeductionLedger(edges, activeTheoremId);
      const textRows = ledger
        .map(
          (s) =>
            `[Step ${s.stepNumber}] ${s.formula.padEnd(14)} | ${s.rule.padEnd(16)} | ${s.isProven ? "✔ PROVEN" : "⏳ PENDING"} | ${s.plainEnglish}`
        )
        .join("\n");
      setConsoleLogs((prev) => [
        ...prev,
        {
          id: `ledger-${Date.now()}`,
          type: "info",
          text: `--- Deduction Ledger: ${activeTheorem.title} ---\n${textRows}`,
        },
      ]);
      announceToScreenReader("Printed deduction ledger.");
      return;
    }

    if (op === "export") {
      const fmt = tokens[1]?.toLowerCase();
      if (fmt === "lean") {
        setConsoleLogs((prev) => [
          ...prev,
          { id: `exp-${Date.now()}`, type: "info", text: exportProofToLean4(activeTheoremId) },
        ]);
      } else if (fmt === "latex") {
        setConsoleLogs((prev) => [
          ...prev,
          { id: `exp-${Date.now()}`, type: "info", text: exportProofToLatex(activeTheoremId) },
        ]);
      } else if (fmt === "markdown") {
        setConsoleLogs((prev) => [
          ...prev,
          { id: `exp-${Date.now()}`, type: "info", text: exportProofToMarkdown(edges, activeTheoremId) },
        ]);
      } else if (fmt === "mermaid") {
        setConsoleLogs((prev) => [
          ...prev,
          { id: `exp-${Date.now()}`, type: "info", text: exportProofToMermaid(edges, activeTheoremId) },
        ]);
      } else {
        setIsExportModalOpen(true);
      }
      return;
    }

    if (op === "simulate") {
      const mode = tokens[1]?.toLowerCase() === "loop" ? "loop" : "normal";
      handleStartSimulation(mode);
      return;
    }

    setConsoleLogs((prev) => [
      ...prev,
      {
        id: `err-${Date.now()}`,
        type: "error",
        text: `Unknown command '${op}'. Type 'help' for available commands.`,
      },
    ]);
  };

  const handleConsoleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowUp") {
      e.preventDefault();
      if (history.length > 0) {
        const nextIdx = Math.min(historyIdx + 1, history.length - 1);
        setHistoryIdx(nextIdx);
        setConsoleInput(history[nextIdx]);
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (historyIdx > 0) {
        const nextIdx = historyIdx - 1;
        setHistoryIdx(nextIdx);
        setConsoleInput(history[nextIdx]);
      } else if (historyIdx === 0) {
        setHistoryIdx(-1);
        setConsoleInput("");
      }
    } else if (e.key === "Tab") {
      e.preventDefault();
      const suggestion = getSuggestion(consoleInput);
      if (suggestion) {
        setConsoleInput(suggestion);
        try {
          playAutocomplete();
        } catch {}
      }
    } else if (e.key === "Escape") {
      e.preventDefault();
      consoleInputRef.current?.blur();
      toggleBtnRef.current?.focus();
    }
  };

  const suggestion = getSuggestion(consoleInput);

  return (
    <div className="min-h-screen bg-brand-dark text-slate-100 flex flex-col font-sans pt-20 pb-12">
      {/* Live Accessibility Announcement Buffer */}
      <div className="sr-only" aria-live="assertive" role="status">
        {liveAnnouncement}
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 w-full flex-1 flex flex-col gap-6">
        {/* Header and Breadcrumbs */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="space-y-1">
            <Breadcrumbs items={[{ label: "Interactive Suite", href: "/" }, { label: "Logical Proof Workspace" }]} />
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-2">
              <IconCpu className="w-8 h-8 text-brand-cyan animate-pulse" />
              Logical Proof Canvas
            </h1>
            <p className="text-sm text-slate-400">
              AST Natural Deduction & Distributed Systems Formal Invariant Workbench
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleCopyShareLink}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800/80 text-slate-200 hover:bg-slate-700 text-xs font-semibold transition"
              title="Copy Shareable Proof Link with Active Theorem & Tab"
            >
              <IconLink className="w-4 h-4 text-brand-cyan" />
              Share
            </button>
            <button
              onClick={() => setIsCustomStudioOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-brand-purple/40 bg-brand-purple/10 text-brand-purple hover:bg-brand-purple/20 text-xs font-semibold transition"
            >
              <IconPlus className="w-4 h-4" />
              Custom Studio
            </button>
            <button
              onClick={() => setIsExportModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800/80 text-slate-200 hover:bg-slate-700 text-xs font-semibold transition"
            >
              <IconDownload className="w-4 h-4" />
              Export
            </button>
            <FieldManualButton manualId="proof" />
          </div>
        </div>

        {/* Curriculum Domain Carousel */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider text-slate-400">Curriculum Invariant Catalog</span>
            <span className="text-xs font-mono text-brand-cyan">
              Status: {isE_Proven ? "✔ Q.E.D. DISCHARGED" : "⏳ IN PROGRESS"}
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
            {(Object.keys(THEOREMS) as TheoremId[]).map((thKey) => {
              const th = THEOREMS[thKey];
              const isActive = thKey === activeTheoremId;
              const { isE_Proven: isThProven } = evaluateProofStatus(
                isActive ? edges : th.initialEdges,
                thKey
              );
              return (
                <button
                  key={thKey}
                  onClick={() => handleSwitchTheorem(thKey)}
                  className={`flex flex-col text-left p-2.5 rounded-xl border transition-all relative overflow-hidden ${
                    isActive
                      ? "bg-slate-800 border-brand-cyan shadow-lg shadow-brand-cyan/10"
                      : "bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-800/50"
                  }`}
                >
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-slate-950 text-slate-400">
                      {th.category}
                    </span>
                    {isThProven ? (
                      <IconShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <span className="w-2 h-2 rounded-full bg-amber-500/80" />
                    )}
                  </div>
                  <span className="text-xs font-bold text-slate-200 line-clamp-1">{th.title}</span>
                  <span className="text-[11px] text-slate-400 line-clamp-1">{th.subtitle}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Mobile View Switcher Tabs (Visible on < lg screens) */}
        <div className="lg:hidden flex items-center bg-slate-900 border border-slate-800 rounded-2xl p-1 gap-1 text-xs font-mono select-none">
          <button
            onClick={() => setMobileActiveView("canvas")}
            className={`flex-1 py-2.5 px-2 rounded-xl text-center font-bold flex items-center justify-center gap-1.5 transition ${
              mobileActiveView === "canvas"
                ? "bg-brand-cyan text-slate-950 shadow-md"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <IconCpu className="w-4 h-4" />
            <span>Canvas</span>
          </button>
          <button
            onClick={() => {
              setMobileActiveView("ledger");
              setActiveTab("ledger");
            }}
            className={`flex-1 py-2.5 px-2 rounded-xl text-center font-bold flex items-center justify-center gap-1.5 transition ${
              mobileActiveView === "ledger"
                ? "bg-brand-cyan text-slate-950 shadow-md"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <IconTable className="w-4 h-4" />
            <span>Ledger</span>
          </button>
          <button
            onClick={() => {
              setMobileActiveView("fallacy");
              setActiveTab("fallacy");
            }}
            className={`flex-1 py-2.5 px-2 rounded-xl text-center font-bold flex items-center justify-center gap-1.5 transition ${
              mobileActiveView === "fallacy"
                ? "bg-brand-cyan text-slate-950 shadow-md"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <IconAlertTriangle className="w-4 h-4" />
            <span>Fallacy</span>
          </button>
          <button
            onClick={() => setMobileActiveView("terminal")}
            className={`flex-1 py-2.5 px-2 rounded-xl text-center font-bold flex items-center justify-center gap-1.5 transition ${
              mobileActiveView === "terminal"
                ? "bg-brand-cyan text-slate-950 shadow-md"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <IconTerminal className="w-4 h-4" />
            <span>Terminal</span>
          </button>
        </div>

        {/* Workspace Layout: Canvas on Left/Center, Inspector on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Canvas Section */}
          <div className={`lg:col-span-8 flex flex-col gap-4 ${mobileActiveView === "canvas" ? "flex" : "hidden lg:flex"}`}>
            <div className="rounded-2xl border border-slate-800 bg-slate-900/80 backdrop-blur overflow-hidden flex flex-col shadow-2xl relative">
              {/* Canvas Header */}
              <div className="px-4 py-3 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-emerald-500/80 animate-ping" />
                  <span className="text-xs font-semibold text-white">{activeTheorem.ruleName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={toggleSnapping}
                    className={`px-2.5 py-1.5 rounded-lg border text-xs font-mono flex items-center gap-1.5 transition ${
                      isSnappingEnabled
                        ? "bg-brand-cyan/15 border-brand-cyan/50 text-brand-cyan shadow-sm shadow-cyan-500/20"
                        : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200"
                    }`}
                    title="Toggle magnetic snapping & alignment guides [Shortcut: G]"
                    aria-pressed={isSnappingEnabled}
                    aria-label={`Magnetic Snapping: ${isSnappingEnabled ? "Enabled" : "Disabled"}. Press G to toggle.`}
                  >
                    <span className="text-[11px] font-bold">SNAP</span>
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        isSnappingEnabled ? "bg-emerald-400 animate-pulse" : "bg-slate-600"
                      }`}
                    />
                    <kbd className="hidden md:inline text-[9px] px-1 py-0.2 rounded bg-slate-950/70 border border-slate-800 text-slate-400 font-mono">
                      G
                    </kbd>
                  </button>
                  <button
                    onClick={handleAutoStep}
                    className="px-2.5 py-1.5 rounded-lg bg-brand-cyan/10 hover:bg-brand-cyan/20 border border-brand-cyan/40 text-brand-cyan text-xs font-mono flex items-center gap-1 transition"
                  >
                    <IconWand className="w-3.5 h-3.5" />
                    Auto-Step
                  </button>
                  <button
                    onClick={handleResetLayout}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
                    title="Reset node positions & connections"
                  >
                    <IconRefresh className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Tactic Goal Ribbon */}
              <div className="bg-slate-950/60 px-4 py-2 border-b border-slate-800/80 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-slate-300">
                  <IconBulb className="w-4 h-4 text-amber-400 shrink-0" />
                  <span className="font-medium text-amber-300/90">{activeTacticHint.title}:</span>
                  <span className="text-slate-400">{activeTacticHint.hint}</span>
                </div>
                <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400 shrink-0">
                  Goal: Node {activeTheorem.targetNodeId}
                </span>
              </div>

              {/* SVG Canvas Area (Responsive scroll wrapper) */}
              <div
                ref={canvasWrapperRef}
                onPointerMove={handleCanvasPointerMove}
                onPointerUp={handleCanvasPointerUp}
                className="relative w-full h-[420px] bg-gradient-to-b from-slate-950/60 via-slate-900 to-slate-950 select-none overflow-x-auto overflow-y-hidden"
              >
                <div className="relative min-w-[760px] h-full">
                  <svg ref={svgCanvasRef} className="absolute inset-0 w-full h-full pointer-events-none">
                    <defs>
                      <pattern id="canvas-grid" width="20" height="20" patternUnits="userSpaceOnUse">
                        <circle cx="2" cy="2" r="1" fill="#334155" opacity={isSnappingEnabled ? 0.45 : 0.15} />
                      </pattern>
                      <marker
                        id="arrow"
                        viewBox="0 0 10 10"
                        refX="8"
                        refY="5"
                        markerWidth="6"
                        markerHeight="6"
                        orient="auto-start-reverse"
                      >
                        <path d="M 0 1 L 10 5 L 0 9 z" fill="#06b6d4" />
                      </marker>
                      <marker
                        id="arrow-emerald"
                        viewBox="0 0 10 10"
                        refX="8"
                        refY="5"
                        markerWidth="6"
                        markerHeight="6"
                        orient="auto-start-reverse"
                      >
                        <path d="M 0 1 L 10 5 L 0 9 z" fill="#10b981" />
                      </marker>
                      <linearGradient id="edgeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#06b6d4" />
                        <stop offset="100%" stopColor="#10b981" />
                      </linearGradient>
                    </defs>

                    {/* Canvas Background Grid */}
                    <rect width="100%" height="100%" fill="url(#canvas-grid)" />

                    {/* Snapping Alignment Guides */}
                    {activeGuides.map((guide, idx) => {
                      if (guide.type === "vertical") {
                        return (
                          <line
                            key={`guide-v-${idx}`}
                            x1={guide.pos}
                            y1={Math.max(0, guide.start)}
                            x2={guide.pos}
                            y2={Math.min(420, guide.end)}
                            stroke="#06b6d4"
                            strokeWidth="1.5"
                            strokeDasharray="4 3"
                            className="animate-pulse"
                          />
                        );
                      }
                      return (
                        <line
                          key={`guide-h-${idx}`}
                          x1={Math.max(0, guide.start)}
                          y1={guide.pos}
                          x2={Math.min(760, guide.end)}
                          y2={guide.pos}
                          stroke="#10b981"
                          strokeWidth="1.5"
                          strokeDasharray="4 3"
                          className="animate-pulse"
                        />
                      );
                    })}

                    {/* Render Bezier Curves for Graph Edges */}
                    {edges.map((edge, idx) => {
                      const sNode = activeTheorem.nodes.find((n) => n.id === edge.source);
                      const tNode = activeTheorem.nodes.find((n) => n.id === edge.target);
                      if (!sNode || !tNode) return null;

                      const sOffset = nodeOffsets[sNode.id] || { x: 0, y: 0 };
                      const tOffset = nodeOffsets[tNode.id] || { x: 0, y: 0 };

                      const x1 = sNode.x + sOffset.x + 80;
                      const y1 = sNode.y + sOffset.y + 35;
                      const x2 = tNode.x + tOffset.x;
                      const y2 = tNode.y + tOffset.y + 35;

                      const dx = Math.abs(x2 - x1) * 0.5;
                      const d = `M ${x1} ${y1} C ${x1 + dx} ${y1}, ${x2 - dx} ${y2}, ${x2} ${y2}`;

                      return (
                        <g key={`edge-${idx}`}>
                          <path
                            d={d}
                            fill="none"
                            stroke="url(#edgeGradient)"
                            strokeWidth="2.5"
                            strokeDasharray="4 2"
                            className="animate-pulse"
                            markerEnd="url(#arrow)"
                          />
                        </g>
                      );
                    })}

                    {/* Interactive Drag-to-Connect Cord */}
                    {dragConnection && (() => {
                      const x1 = dragConnection.sourceX;
                      const y1 = dragConnection.sourceY;
                      const x2 = dragConnection.currentX;
                      const y2 = dragConnection.currentY;
                      const dx = Math.abs(x2 - x1) * 0.5;
                      const d = `M ${x1} ${y1} C ${x1 + dx} ${y1}, ${x2 - dx} ${y2}, ${x2} ${y2}`;
                      const strokeColor = dragConnection.hoveredTargetId
                        ? dragConnection.isValid
                          ? "#10b981"
                          : "#f43f5e"
                        : "#06b6d4";

                      return (
                        <g key="drag-connection-cord">
                          <path
                            d={d}
                            fill="none"
                            stroke={strokeColor}
                            strokeWidth="6"
                            opacity="0.25"
                          />
                          <path
                            d={d}
                            fill="none"
                            stroke={strokeColor}
                            strokeWidth="3"
                            strokeDasharray="6 3"
                            className="animate-pulse"
                            markerEnd={
                              dragConnection.hoveredTargetId && dragConnection.isValid
                                ? "url(#arrow-emerald)"
                                : "url(#arrow)"
                            }
                          />
                          <circle cx={x2} cy={y2} r="5" fill={strokeColor} className="animate-ping" opacity="0.75" />
                          <circle cx={x2} cy={y2} r="4" fill={strokeColor} />
                        </g>
                      );
                    })()}
                  </svg>

                  {/* Node Cards on Canvas */}
                  {activeTheorem.nodes.map((node) => {
                    const offset = nodeOffsets[node.id] || { x: 0, y: 0 };
                    const isSelected = selectedNodeIds.includes(node.id);
                    const isInspected = inspectedNodeId === node.id;
                    const isTarget = node.id === activeTheorem.targetNodeId;
                    const isIntermediate = node.id === activeTheorem.intermediateNodeId;

                    let isNodeProven = true;
                    if (isIntermediate) isNodeProven = isC_Proven;
                    if (isTarget) isNodeProven = isE_Proven;

                    const compTarget = compatibleTargets.find((c) => c.targetId === node.id);
                    const isCompatible = !!compTarget;
                    const isHoveredInDrag = dragConnection?.hoveredTargetId === node.id;
                    const isDragSource = dragConnection?.sourceId === node.id;
                    const isDimmed = !!dragConnection && !isDragSource && !isCompatible && !isHoveredInDrag;

                    return (
                      <motion.div
                        key={node.id}
                        style={{
                          position: "absolute",
                          left: node.x + offset.x,
                          top: node.y + offset.y,
                        }}
                        onPointerDown={(e) => handleNodePointerDown(e, node.id)}
                        onPointerMove={(e) => handleNodePointerMove(e, node.id)}
                        onPointerUp={(e) => handleNodePointerUp(e, node.id)}
                        onClick={() => handleNodeClick(node.id)}
                        className={`group w-40 p-2.5 rounded-xl border cursor-pointer transition-all shadow-md select-none ${
                          isDimmed ? "opacity-40" : "opacity-100"
                        } ${
                          isHoveredInDrag
                            ? dragConnection?.isValid
                              ? "bg-emerald-950/60 border-emerald-400 ring-2 ring-emerald-400/80 shadow-emerald-500/30 scale-105"
                              : "bg-rose-950/60 border-rose-500 ring-2 ring-rose-500/80 shadow-rose-500/30 scale-105"
                            : isCompatible
                            ? "bg-emerald-950/30 border-emerald-500/70 ring-2 ring-emerald-500/50 shadow-emerald-500/20"
                            : isSelected
                            ? "bg-brand-cyan/20 border-brand-cyan ring-2 ring-brand-cyan/50 shadow-cyan-500/20"
                            : isInspected
                            ? "bg-slate-800 border-slate-600 ring-1 ring-slate-400"
                            : "bg-slate-900 border-slate-800 hover:border-slate-700"
                        }`}
                      >
                        {/* Compatible Rule Floating Badge */}
                        {isCompatible && compTarget && (
                          <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-mono text-[9px] font-bold shadow-md shadow-emerald-950/50 flex items-center gap-1 z-30 whitespace-nowrap animate-bounce">
                            <IconSparkles className="w-2.5 h-2.5 shrink-0" />
                            <span>{compTarget.badgeLabel}</span>
                          </div>
                        )}

                        {/* Invalid Hover Floating Badge */}
                        {isHoveredInDrag && !dragConnection?.isValid && (
                          <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-rose-500 text-white font-mono text-[9px] font-bold shadow-md flex items-center gap-1 z-30 whitespace-nowrap">
                            <IconAlertTriangle className="w-2.5 h-2.5 shrink-0" />
                            <span>Invalid Inference</span>
                          </div>
                        )}

                        {/* Node Header & Status */}
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-950 text-slate-300">
                            Node {node.id}
                          </span>
                          <span
                            className={`text-[9px] font-mono px-1 py-0.5 rounded ${
                              isNodeProven
                                ? "bg-emerald-950 text-emerald-400 border border-emerald-800/40"
                                : "bg-amber-950 text-amber-400 border border-amber-800/40"
                            }`}
                          >
                            {isNodeProven ? "PROVEN" : "PENDING"}
                          </span>
                        </div>
                        <div className="font-mono text-sm font-bold text-white mb-0.5">{node.label}</div>
                        <div className="text-[10px] text-slate-400 line-clamp-2 leading-tight">
                          {node.meaning}
                        </div>

                        {/* Connection Anchor Handle Port (Right Edge) */}
                        <button
                          type="button"
                          onPointerDown={(e) => handleHandlePointerDown(e, node.id)}
                          className="absolute -right-2 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-slate-950 border-2 border-brand-cyan/80 hover:border-brand-cyan hover:scale-125 hover:bg-brand-cyan transition-all shadow-md shadow-cyan-500/40 flex items-center justify-center cursor-crosshair z-20 group-hover:opacity-100 opacity-80"
                          title={`Drag connection from Node ${node.id}`}
                          aria-label={`Drag connection handle from Node ${node.id}`}
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-brand-cyan group-hover:bg-slate-950" />
                        </button>
                      </motion.div>
                    );
                  })}
                </div>
              </div>

              {/* Floating Rule Palette Dock */}
              <div className="p-3 bg-slate-950/90 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] font-mono uppercase text-slate-500 mr-1">Rule Palette:</span>
                  {INFERENCE_RULES.slice(0, 6).map((rule) => (
                    <button
                      key={rule.id}
                      onClick={() => handleApplyRule(rule.id)}
                      className="min-h-8 px-2.5 py-1 rounded-lg border border-slate-800 bg-slate-900 hover:bg-slate-800 text-xs font-mono text-slate-300 hover:text-white transition flex items-center gap-1"
                      title={`${rule.name}: ${rule.template}`}
                    >
                      <span className="text-brand-cyan font-bold">{rule.symbol}</span>
                      <span className="text-[11px] text-slate-400 hidden sm:inline">{rule.name}</span>
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleStartSimulation("normal")}
                    disabled={isSimulating}
                    className="min-h-8 px-3 py-1.5 rounded-lg bg-emerald-600/20 border border-emerald-500/40 text-emerald-400 hover:bg-emerald-600/30 text-xs font-mono flex items-center gap-1 transition"
                  >
                    <IconPlayerPlay className="w-3.5 h-3.5" />
                    {isSimulating ? "Simulating..." : "Simulate"}
                  </button>
                </div>
              </div>
            </div>

            {/* Simulation Progress Ribbon */}
            {isSimulating && simulationProgress && (
              <div className="p-3 rounded-xl border border-emerald-800/40 bg-emerald-950/20 text-emerald-300 text-xs flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <IconSparkles className="w-4 h-4 text-emerald-400 animate-spin" />
                  <span>Background Tactic Simulation Running...</span>
                  <span className="text-slate-400 font-mono">
                    [{simulationProgress.step}/{simulationProgress.total}] {simulationProgress.log}
                  </span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
                  THREAD: WEB WORKER (60FPS UI SAFE)
                </span>
              </div>
            )}
          </div>

          {/* Right Inspector Section */}
          <div className={`lg:col-span-4 flex flex-col gap-4 ${mobileActiveView === "ledger" || mobileActiveView === "systems" || mobileActiveView === "fallacy" ? "flex" : "hidden lg:flex"}`}>
            <div className="rounded-2xl border border-slate-800 bg-slate-900/80 backdrop-blur overflow-hidden flex flex-col shadow-xl">
              {/* Tab Selector */}
              <div className="grid grid-cols-3 border-b border-slate-800 bg-slate-950/40 text-xs font-medium">
                <button
                  onClick={() => {
                    setActiveTab("ledger");
                    setMobileActiveView("ledger");
                  }}
                  className={`py-2.5 flex items-center justify-center gap-1.5 border-b-2 transition ${
                    activeTab === "ledger"
                      ? "border-brand-cyan text-brand-cyan bg-slate-900"
                      : "border-transparent text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <IconTable className="w-4 h-4" />
                  Ledger
                </button>
                <button
                  onClick={() => {
                    setActiveTab("systems");
                    setMobileActiveView("systems");
                  }}
                  className={`py-2.5 flex items-center justify-center gap-1.5 border-b-2 transition ${
                    activeTab === "systems"
                      ? "border-brand-cyan text-brand-cyan bg-slate-900"
                      : "border-transparent text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <IconBook className="w-4 h-4" />
                  Systems
                </button>
                <button
                  onClick={() => {
                    setActiveTab("fallacy");
                    setMobileActiveView("fallacy");
                  }}
                  className={`py-2.5 flex items-center justify-center gap-1.5 border-b-2 transition ${
                    activeTab === "fallacy"
                      ? "border-brand-cyan text-brand-cyan bg-slate-900"
                      : "border-transparent text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <IconAlertTriangle className="w-4 h-4" />
                  Fallacy
                </button>
              </div>

              {/* Tab Content */}
              <div className="p-4 flex flex-col gap-4 min-h-[380px] max-h-[460px] overflow-y-auto">
                {activeTab === "ledger" && (
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-slate-300">Formal Fitch Deduction Ledger</span>
                      <span className="text-[10px] font-mono text-slate-500">Lines: {deductionLedger.length}</span>
                    </div>
                    <div className="flex flex-col gap-2">
                      {deductionLedger.map((step) => (
                        <div
                          key={step.stepNumber}
                          className={`p-2.5 rounded-lg border text-xs flex flex-col gap-1 transition ${
                            step.isProven
                              ? "bg-slate-900 border-slate-800"
                              : "bg-slate-950/60 border-slate-900 text-slate-500"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-bold text-slate-400">Step {step.stepNumber}</span>
                              {step.nodeId && (
                                <span className="text-[10px] font-mono px-1.5 py-0.5 text-slate-400 bg-slate-800/60 rounded">
                                  Node {step.nodeId}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-1.5">
                              <span
                                className={`text-[9px] font-mono px-1.5 py-0.5 rounded ${
                                  step.isProven ? "bg-emerald-950 text-emerald-400" : "bg-slate-800 text-slate-500"
                                }`}
                              >
                                {step.isProven ? "✔ PROVEN" : "⏳ PENDING"}
                              </span>
                              {step.isDeletable && (
                                <button
                                  type="button"
                                  onClick={() => handleDeleteStep(step.stepNumber)}
                                  aria-label={`Delete Step ${step.stepNumber} and prune downstream dependencies`}
                                  title={`Delete Step ${step.stepNumber} (prune dependencies)`}
                                  className="p-1 rounded text-slate-400 hover:text-red-400 hover:bg-red-950/50 transition-colors focus:outline-none focus:ring-1 focus:ring-red-500/50"
                                >
                                  <IconX className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </div>
                          <div className="font-mono font-bold text-white text-sm">{step.formula}</div>
                          <div className="text-slate-400 text-[11px]">
                            <span className="text-brand-cyan font-mono">{step.rule}</span> ({step.premises})
                          </div>
                          <div className="text-slate-400 text-[11px] leading-tight">{step.plainEnglish}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === "systems" && (
                  <div className="flex flex-col gap-3 text-xs">
                    <div className="space-y-1">
                      <span className="text-xs font-bold text-white">{activeTheorem.title}</span>
                      <p className="text-slate-400 leading-relaxed">{activeTheorem.scenario}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-2">
                      <span className="font-mono text-brand-cyan font-semibold block">Lean 4 Invariant Model</span>
                      <pre className="font-mono text-[11px] text-slate-300 whitespace-pre-wrap">
                        {activeTheorem.leanCode}
                      </pre>
                    </div>
                    <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
                      <span className="font-mono text-slate-400 font-semibold block">Distributed Systems Invariant</span>
                      <p className="text-slate-300 leading-relaxed">{activeTheorem.goalDescription}</p>
                    </div>
                  </div>
                )}

                {activeTab === "fallacy" && (
                  <div className="flex flex-col gap-3 text-xs">
                    {currentFallacy ? (
                      <InteractiveTruthTable
                        diagnosis={currentFallacy}
                        onClear={() => setCurrentFallacy(null)}
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center text-center p-8 text-slate-500 gap-2">
                        <IconShieldCheck className="w-10 h-10 text-emerald-400/80" />
                        <span className="font-semibold text-slate-300">Zero Active Fallacies</span>
                        <p className="text-[11px] max-w-xs">
                          All current graph connections and premise selections follow valid deductive inference rules.
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Command Console Split-View */}
        <div
          data-keyboard-boundary="true"
          className={`rounded-2xl border border-slate-800 bg-slate-950 overflow-hidden flex flex-col shadow-2xl ${
            mobileActiveView === "terminal" ? "flex" : "hidden lg:flex"
          }`}
        >
          <div className="px-4 py-2 border-b border-slate-800 bg-slate-900/60 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <IconTerminal className="w-4 h-4 text-brand-cyan" />
              <span className="text-xs font-mono font-semibold text-slate-300">proof-cli @ formal-verification</span>
            </div>
            <div className="flex items-center gap-2 text-xs font-mono text-slate-500">
              <span>Toggle: Ctrl + `</span>
              <button
                ref={toggleBtnRef}
                onClick={toggleConsole}
                className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] transition"
              >
                {isConsoleOpen ? "Collapse" : "Expand"}
              </button>
            </div>
          </div>

          {isConsoleOpen && (
            <div className="flex flex-col">
              <div
                ref={terminalLogsContainerRef}
                className="p-4 font-mono text-xs text-slate-300 h-44 overflow-y-auto space-y-1.5 bg-slate-950/80"
              >
                {consoleLogs.map((log) => (
                  <div
                    key={log.id}
                    className={`whitespace-pre-wrap ${
                      log.type === "command"
                        ? "text-brand-cyan font-bold"
                        : log.type === "error"
                        ? "text-red-400 font-semibold"
                        : log.type === "success"
                        ? "text-emerald-400"
                        : "text-slate-300"
                    }`}
                  >
                    {log.type === "command" ? `$ ${log.text}` : log.text}
                  </div>
                ))}
              </div>

              <form onSubmit={handleConsoleSubmit} className="relative border-t border-slate-800 flex items-center">
                <span className="pl-4 text-brand-cyan font-mono text-xs font-bold">$</span>
                <input
                  ref={consoleInputRef}
                  type="text"
                  value={consoleInput}
                  onChange={(e) => setConsoleInput(e.target.value)}
                  onKeyDown={handleConsoleKeyDown}
                  placeholder="Enter logic command (e.g. 'connect A C', 'apply mp A B', 'help')..."
                  className="w-full bg-transparent px-3 py-2.5 font-mono text-xs text-white placeholder-slate-600 focus:outline-none"
                />
                {suggestion && (
                  <span className="absolute left-6 pointer-events-none font-mono text-xs text-slate-600 pl-[1ch]">
                    <span className="invisible">{consoleInput}</span>
                    {suggestion.substring(consoleInput.length)}
                  </span>
                )}
              </form>
            </div>
          )}
        </div>

        {/* Feedback Toast */}
        <AnimatePresence>
          {feedbackToast && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl border text-xs font-medium shadow-2xl flex items-center gap-2 ${
                feedbackToast.type === "success"
                  ? "bg-emerald-950 border-emerald-700 text-emerald-200"
                  : feedbackToast.type === "error"
                  ? "bg-red-950 border-red-700 text-red-200"
                  : "bg-slate-900 border-slate-700 text-slate-200"
              }`}
            >
              <span>{feedbackToast.message}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Export Proof Modal */}
        <AnimatePresence>
          {isExportModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full max-w-2xl rounded-2xl border border-slate-800 bg-slate-900 p-6 flex flex-col gap-4 shadow-2xl"
              >
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <IconDownload className="w-5 h-5 text-brand-cyan" />
                    Export Proof Certificate
                  </h3>
                  <button
                    onClick={() => setIsExportModalOpen(false)}
                    className="p-1 rounded text-slate-400 hover:text-white"
                  >
                    <IconX className="w-5 h-5" />
                  </button>
                </div>
                <div className="flex gap-2">
                  {(["lean", "latex", "markdown", "mermaid"] as const).map((fmt) => (
                    <button
                      key={fmt}
                      onClick={() => setExportFormat(fmt)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-mono uppercase font-bold border transition ${
                        exportFormat === fmt
                          ? "border-brand-cyan bg-brand-cyan/20 text-brand-cyan"
                          : "border-slate-800 bg-slate-950 text-slate-400 hover:text-white"
                      }`}
                    >
                      {fmt}
                    </button>
                  ))}
                </div>
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 max-h-72 overflow-y-auto">
                  <pre className="font-mono text-xs text-slate-300 whitespace-pre-wrap">
                    {exportFormat === "lean" && exportProofToLean4(activeTheoremId)}
                    {exportFormat === "latex" && exportProofToLatex(activeTheoremId)}
                    {exportFormat === "markdown" && exportProofToMarkdown(edges, activeTheoremId)}
                    {exportFormat === "mermaid" && exportProofToMermaid(edges, activeTheoremId)}
                  </pre>
                </div>
                <div className="flex justify-end gap-3 pt-2">
                  <button
                    onClick={() => {
                      const text =
                        exportFormat === "lean"
                          ? exportProofToLean4(activeTheoremId)
                          : exportFormat === "latex"
                          ? exportProofToLatex(activeTheoremId)
                          : exportFormat === "markdown"
                          ? exportProofToMarkdown(edges, activeTheoremId)
                          : exportProofToMermaid(edges, activeTheoremId);
                      navigator.clipboard.writeText(text);
                      setHasCopiedExport(true);
                      setTimeout(() => setHasCopiedExport(false), 2000);
                    }}
                    className="px-4 py-2 rounded-xl bg-brand-cyan hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition"
                  >
                    {hasCopiedExport ? <IconCheck className="w-4 h-4" /> : <IconCopy className="w-4 h-4" />}
                    {hasCopiedExport ? "Copied!" : "Copy to Clipboard"}
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Custom Invariant Studio Modal */}
        <AnimatePresence>
          {isCustomStudioOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full max-w-xl rounded-2xl border border-slate-800 bg-slate-900 p-6 flex flex-col gap-4 shadow-2xl"
              >
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <IconPlus className="w-5 h-5 text-brand-purple" />
                    Custom Invariant Studio
                  </h3>
                  <button
                    onClick={() => setIsCustomStudioOpen(false)}
                    className="p-1 rounded text-slate-400 hover:text-white"
                  >
                    <IconX className="w-5 h-5" />
                  </button>
                </div>
                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block text-slate-400 font-mono mb-1">Premise 1 Formula:</label>
                    <input
                      type="text"
                      value={customPremise1}
                      onChange={(e) => setCustomPremise1(e.target.value)}
                      className="w-full rounded-lg bg-slate-950 border border-slate-800 px-3 py-2 font-mono text-white focus:outline-none focus:border-brand-cyan"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 font-mono mb-1">Premise 2 Formula:</label>
                    <input
                      type="text"
                      value={customPremise2}
                      onChange={(e) => setCustomPremise2(e.target.value)}
                      className="w-full rounded-lg bg-slate-950 border border-slate-800 px-3 py-2 font-mono text-white focus:outline-none focus:border-brand-cyan"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 font-mono mb-1">Premise 3 Formula:</label>
                    <input
                      type="text"
                      value={customPremise3}
                      onChange={(e) => setCustomPremise3(e.target.value)}
                      className="w-full rounded-lg bg-slate-950 border border-slate-800 px-3 py-2 font-mono text-white focus:outline-none focus:border-brand-cyan"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 font-mono mb-1">Target Invariant Goal:</label>
                    <input
                      type="text"
                      value={customGoal}
                      onChange={(e) => setCustomGoal(e.target.value)}
                      className="w-full rounded-lg bg-slate-950 border border-slate-800 px-3 py-2 font-mono text-white focus:outline-none focus:border-brand-cyan"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-3 pt-2">
                  <button
                    onClick={() => {
                      handleSwitchTheorem("custom");
                      setIsCustomStudioOpen(false);
                    }}
                    className="px-4 py-2 rounded-xl bg-brand-cyan hover:bg-cyan-400 text-slate-950 font-bold text-xs transition"
                  >
                    Load into Workspace
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        <NextPrevNav
          prev={{ title: "NeuroRecon CAD Simulator", href: "/neuro" }}
          next={{ title: "Alignment Simulator", href: "/simulator" }}
          backToHub={{ title: "Return to Experience Hub", href: "/" }}
        />
      </div>
    </div>
  );
}
