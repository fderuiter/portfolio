"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  IconTerminal,
  IconSparkles,
  IconRefresh,
  IconBulb,
  IconShieldCheck,
  IconX,
  IconBolt,
  IconBook,
  IconTable,
  IconAlertTriangle,
  IconDownload,
  IconCopy,
  IconCheck,
  IconArrowsMove,
  IconCode,
} from "@tabler/icons-react";
import {
  getSuggestion,
  evaluateProofStatus,
  canConnect,
  getNextTacticHint,
  getFallacyDiagnosis,
  getDeductionLedger,
  exportProofToLean4,
  exportProofToLatex,
  exportProofToMarkdown,
  exportProofToMermaid,
  THEOREMS,
  TheoremId,
  Edge,
  FallacyDiagnosis,
} from "@/lib/proof-utils";
import { FieldManualButton } from "@/components/FieldManualButton";
import { useAudio } from "@/components/providers/AudioProvider";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { NextPrevNav } from "@/components/ui/NextPrevNav";

interface TerminalLog {
  id: string;
  type: "command" | "output" | "error" | "info" | "success";
  text: string;
}

export default function ProofWorkspacePage() {
  const [activeTheoremId, setActiveTheoremId] = useState<TheoremId>("modus-ponens");
  const activeTheorem = THEOREMS[activeTheoremId];

  const [edges, setEdges] = useState<Edge[]>(activeTheorem.initialEdges);
  const [selectedSourceId, setSelectedSourceId] = useState<string | null>(null);
  const [inspectedNodeId, setInspectedNodeId] = useState<string>("E");
  const [activeTab, setActiveTab] = useState<"inspector" | "ledger" | "fallacy">("inspector");
  const [feedbackToast, setFeedbackToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);
  const [currentFallacy, setCurrentFallacy] = useState<FallacyDiagnosis | null>(null);

  // Custom node drag positions (offset relative to default coordinates)
  const [nodeOffsets, setNodeOffsets] = useState<Record<string, { x: number; y: number }>>({});
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);
  const dragStartRef = useRef<{ startX: number; startY: number; initOffsetX: number; initOffsetY: number } | null>(null);

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
      text: "Interactive Logic Proof Canvas v3.0.0 · Multi-Theorem Formal Verification Suite\nClick nodes directly to connect, use the Guided Assistant, or run CLI commands. Type 'help' for command syntax.",
    },
  ]);
  const [history, setHistory] = useState<string[]>([]);
  const [historyIdx, setHistoryIdx] = useState(-1);
  const [liveAnnouncement, setLiveAnnouncement] = useState("");

  const { playSuccess, playAutocomplete, playHover } = useAudio();

  // Web Worker, Watchdog, Throttling States & Refs
  const workerRef = useRef<Worker | null>(null);
  const watchdogRef = useRef<NodeJS.Timeout | null>(null);
  const pendingLogsRef = useRef<TerminalLog[]>([]);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationProgress, setSimulationProgress] = useState<{ step: number; total: number; log: string } | null>(null);
  const nextIdRef = useRef(0);
  const initWorkerRef = useRef<() => void>(() => {});

  // Ref tracking for focus restoration
  const consoleInputRef = useRef<HTMLInputElement>(null);
  const toggleBtnRef = useRef<HTMLButtonElement>(null);
  const lastActiveElementRef = useRef<HTMLElement | null>(null);
  const terminalLogsContainerRef = useRef<HTMLDivElement>(null);
  const svgCanvasRef = useRef<SVGSVGElement>(null);

  // Helper to trigger screen reader announcement within 100ms
  const announceToScreenReader = (text: string) => {
    setLiveAnnouncement("");
    setTimeout(() => {
      setLiveAnnouncement(text);
    }, 10);
  };

  const showToast = (message: string, type: "success" | "error" | "info" = "info") => {
    setFeedbackToast({ message, type });
    setTimeout(() => {
      setFeedbackToast((prev) => (prev?.message === message ? null : prev));
    }, 4000);
  };

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
  }, []);

  // Helper to clear watchdog
  const clearWatchdog = React.useCallback(() => {
    if (watchdogRef.current) {
      clearTimeout(watchdogRef.current);
      watchdogRef.current = null;
    }
  }, []);

  // Handle watchdog timeout termination and recovery
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
  }, [clearWatchdog]);

  // Helper to reset watchdog for another 5 seconds (5000ms)
  const resetWatchdog = React.useCallback(() => {
    clearWatchdog();
    watchdogRef.current = setTimeout(() => {
      handleWatchdogTimeout();
    }, 5000);
  }, [clearWatchdog, handleWatchdogTimeout]);

  // Helper to lazily initialize/re-initialize the Web Worker
  const initWorker = React.useCallback(() => {
    if (typeof window !== "undefined") {
      if (workerRef.current) {
        workerRef.current.terminate();
      }

      const worker = new Worker(new URL("./proof-worker.ts", import.meta.url));

      worker.onmessage = (event) => {
        const message = event.data;
        if (!message) return;

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
  }, [clearWatchdog, resetWatchdog]);

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

  // Global Keyboard Shortcut handler for toggling split-view: Ctrl + \ or Ctrl + `
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
  }, [toggleConsole, isConsoleOpen]);

  // Handle switching active theorem scenario
  const handleSwitchTheorem = (newTheoremId: TheoremId) => {
    if (newTheoremId === activeTheoremId) return;
    const nextTh = THEOREMS[newTheoremId];
    if (!nextTh) return;

    setActiveTheoremId(newTheoremId);
    setEdges(nextTh.initialEdges);
    setSelectedSourceId(null);
    setInspectedNodeId(nextTh.targetNodeId);
    setNodeOffsets({});
    setCurrentFallacy(null);

    try {
      playAutocomplete();
    } catch {}

    showToast(`Switched active theorem scenario to '${nextTh.title}' (${nextTh.subtitle})`, "info");
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

  // Node Drag Handlers in SVG Canvas
  const handleNodePointerDown = (e: React.PointerEvent, nodeId: string) => {
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
  };

  const handleNodePointerMove = (e: React.PointerEvent, nodeId: string) => {
    if (draggingNodeId !== nodeId || !dragStartRef.current) return;
    const dx = e.clientX - dragStartRef.current.startX;
    const dy = e.clientY - dragStartRef.current.startY;
    setNodeOffsets((prev) => ({
      ...prev,
      [nodeId]: {
        x: dragStartRef.current!.initOffsetX + dx,
        y: dragStartRef.current!.initOffsetY + dy,
      },
    }));
  };

  const handleNodePointerUp = (e: React.PointerEvent, nodeId: string) => {
    if (draggingNodeId === nodeId) {
      setDraggingNodeId(null);
      dragStartRef.current = null;
      try {
        (e.target as Element).releasePointerCapture(e.pointerId);
      } catch {}
    }
  };

  const handleResetLayout = () => {
    setNodeOffsets({});
    try {
      playAutocomplete();
    } catch {}
    showToast("Node coordinates reset to canonical layout.", "info");
    announceToScreenReader("Node coordinates reset to default layout.");
  };

  // Visual Node Connection / Selection Click Handler
  const handleNodeClick = (nodeId: string) => {
    try {
      playHover();
    } catch {}

    setInspectedNodeId(nodeId);

    if (!selectedSourceId) {
      // Pick as source
      setSelectedSourceId(nodeId);
      showToast(`Selected Node ${nodeId} as premise source. Click a target node to connect.`, "info");
      announceToScreenReader(`Selected source Node ${nodeId}. Click target node.`);
      return;
    }

    if (selectedSourceId === nodeId) {
      // Deselect
      setSelectedSourceId(null);
      showToast(`Deselected Node ${nodeId}.`, "info");
      announceToScreenReader(`Deselected Node ${nodeId}.`);
      return;
    }

    // Attempt connection from selectedSourceId -> nodeId
    const validation = canConnect(selectedSourceId, nodeId, edges, activeTheoremId);
    if (!validation.allowed) {
      const fallacy = getFallacyDiagnosis(selectedSourceId, nodeId, edges, activeTheoremId);
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
      setSelectedSourceId(null);
      return;
    }

    // Valid connection!
    const newEdge: Edge = { source: selectedSourceId, target: nodeId };
    setEdges((prev) => [...prev, newEdge]);
    setSelectedSourceId(null);
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
  };

  const handleDisconnectEdge = (source: string, target: string) => {
    setEdges((prev) =>
      prev.filter(
        (e) =>
          !(
            (e.source === source && e.target === target) ||
            (e.source === target && e.target === source)
          )
      )
    );

    try {
      playAutocomplete();
    } catch {}

    showToast(`Disconnected edge between Node ${source} and Node ${target}.`, "info");
    announceToScreenReader(`Disconnected edge between Node ${source} and Node ${target}.`);

    setConsoleLogs((prev) => [
      ...prev,
      {
        id: `cmd-${Date.now()}`,
        type: "command",
        text: `disconnect ${source} ${target}`,
      },
      {
        id: `out-${Date.now()}`,
        type: "output",
        text: `Disconnected edge between Node ${source} and Node ${target}.`,
      },
    ]);
  };

  const handleApplyNextTactic = () => {
    const hint = getNextTacticHint(edges, activeTheoremId);
    if (hint.isCompleted || !hint.suggestedSource || !hint.suggestedTarget) {
      showToast("Proof theorem is already fully discharged!", "success");
      return;
    }

    const s = hint.suggestedSource;
    const t = hint.suggestedTarget;
    const newEdge: Edge = { source: s, target: t };

    setEdges((prev) => [...prev, newEdge]);
    setInspectedNodeId(t);
    try {
      playSuccess();
    } catch {}

    showToast(`Applied Tactic: Connected Node ${s} → Node ${t}`, "success");
    announceToScreenReader(`Applied tactic: connected Node ${s} to Node ${t}`);

    setConsoleLogs((prev) => [
      ...prev,
      {
        id: `cmd-${Date.now()}`,
        type: "command",
        text: `connect ${s} ${t}`,
      },
      {
        id: `out-${Date.now()}`,
        type: "success",
        text: `✔ Tactic Applied: ${hint.hint}`,
      },
    ]);
  };

  const handleResetProof = () => {
    setEdges(activeTheorem.initialEdges);
    setSelectedSourceId(null);
    setInspectedNodeId(activeTheorem.targetNodeId);
    setCurrentFallacy(null);
    try {
      playAutocomplete();
    } catch {}

    showToast(`Proof canvas reset to initial premises for ${activeTheorem.title}.`, "info");
    announceToScreenReader(`Proof canvas reset to initial premises for ${activeTheorem.title}.`);

    setConsoleLogs((prev) => [
      ...prev,
      {
        id: `out-${Date.now()}`,
        type: "info",
        text: `↺ Proof canvas reset to initial premises for [${activeTheorem.title}].`,
      },
    ]);
  };

  // Command executor
  const runCommand = (cmdStr: string) => {
    const trimmed = cmdStr.trim();
    if (!trimmed) return;

    const commandLogId = `cmd-${Date.now()}`;
    setConsoleLogs((prev) => [...prev, { id: commandLogId, type: "command", text: trimmed }]);
    setConsoleInput("");

    setHistory((prev) => {
      const filtered = prev.filter((h) => h !== trimmed);
      return [...filtered, trimmed];
    });
    setHistoryIdx(-1);

    const tokens = trimmed.split(/\s+/);
    const op = tokens[0].toLowerCase();
    const arg1 = tokens[1]?.toUpperCase();
    const arg2 = tokens[2]?.toUpperCase();

    const outputLogId = `out-${Date.now()}`;

    if (op === "help") {
      const helpText =
        "Supported Formal Logic Commands:\n" +
        "  theorem <id>               - Switch theorem: mp, mt, hs, ds, res\n" +
        "  connect <node1> <node2>    - Connect source node to target node\n" +
        "  disconnect <node1> <node2> - Remove connection between two nodes\n" +
        "  inspect <node>             - Inspect proposition, rule, and status of a node\n" +
        "  tactic                     - Automatically apply the next valid deduction step\n" +
        "  ledger                     - Print formatted ASCII deduction proof ledger\n" +
        "  export [lean|latex|md|mer] - Export formal proof code to console\n" +
        "  list                       - List active theorem nodes & connections\n" +
        "  simulate [normal|loop]     - Run background tactic simulation (normal/loop)\n" +
        "  clear                      - Clear the console logs\n" +
        "  help                       - Show this help menu";
      setConsoleLogs((prev) => [...prev, { id: outputLogId, type: "info", text: helpText }]);
      announceToScreenReader("Help menu printed.");
      return;
    }

    if (op === "clear") {
      setConsoleLogs([]);
      announceToScreenReader("Console logs cleared.");
      return;
    }

    if (op === "theorem" || op === "switch") {
      const targetTh = tokens[1]?.toLowerCase();
      const map: Record<string, TheoremId> = {
        mp: "modus-ponens",
        "modus-ponens": "modus-ponens",
        mt: "modus-tollens",
        "modus-tollens": "modus-tollens",
        hs: "hypothetical-syllogism",
        "hypothetical-syllogism": "hypothetical-syllogism",
        ds: "disjunctive-syllogism",
        "disjunctive-syllogism": "disjunctive-syllogism",
        res: "resolution",
        resolution: "resolution",
      };

      if (!targetTh || !map[targetTh]) {
        setConsoleLogs((prev) => [
          ...prev,
          {
            id: outputLogId,
            type: "error",
            text: "Syntax Error: 'theorem' requires a valid theorem ID: mp, mt, hs, ds, or res. Example: 'theorem mt'",
          },
        ]);
        announceToScreenReader("Syntax error in theorem switch command.");
        return;
      }

      handleSwitchTheorem(map[targetTh]);
      return;
    }

    if (op === "tactic") {
      handleApplyNextTactic();
      return;
    }

    if (op === "inspect") {
      if (!arg1 || !activeTheorem.nodes.some((n) => n.id === arg1)) {
        setConsoleLogs((prev) => [
          ...prev,
          {
            id: outputLogId,
            type: "error",
            text: `Invalid Node ID '${tokens[1]}'. Choose from: ${activeTheorem.nodes.map((n) => n.id).join(", ")}`,
          },
        ]);
        announceToScreenReader("Invalid node specified for inspect.");
        return;
      }

      const node = activeTheorem.nodes.find((n) => n.id === arg1)!;
      const { isC_Proven, isE_Proven } = evaluateProofStatus(edges, activeTheoremId);
      let isNodeProven = true;
      if (node.id === "C") isNodeProven = isC_Proven;
      if (node.id === "E") isNodeProven = isE_Proven;

      setInspectedNodeId(arg1);
      setActiveTab("inspector");

      const nodeText =
        `[INSPECT NODE ${node.id}]\n` +
        `Proposition: ${node.label} (${node.type.toUpperCase()})\n` +
        `Status: ${isNodeProven ? "✔ PROVEN / SATISFIED" : "⏳ PENDING DISCHARGE"}\n` +
        `Description: ${node.description}\n` +
        `Meaning: ${node.meaning}`;

      setConsoleLogs((prev) => [...prev, { id: outputLogId, type: "info", text: nodeText }]);
      announceToScreenReader(`Inspected Node ${node.id}`);
      return;
    }

    if (op === "ledger") {
      const ledger = getDeductionLedger(edges, activeTheoremId);
      const rows = ledger
        .map(
          (s) =>
            `| ${s.stepNumber} | ${s.formula.padEnd(8)} | ${s.rule.padEnd(16)} | ${s.premises.padEnd(12)} | ${s.isProven ? "PROVEN" : "PENDING"} |`
        )
        .join("\n");
      const ledgerText =
        `Deduction Ledger: ${activeTheorem.title} (${activeTheorem.ruleName})\n` +
        `+---+----------+------------------+--------------+---------+\n` +
        `| # | Formula  | Rule             | Premises     | Status  |\n` +
        `+---+----------+------------------+--------------+---------+\n` +
        `${rows}\n` +
        `+---+----------+------------------+--------------+---------+`;

      setConsoleLogs((prev) => [...prev, { id: outputLogId, type: "output", text: ledgerText }]);
      announceToScreenReader("Printed deduction ledger.");
      return;
    }

    if (op === "export") {
      const fmt = tokens[1]?.toLowerCase() || "lean";
      let code = "";
      if (fmt === "lean" || fmt === "lean4") code = exportProofToLean4(activeTheoremId);
      else if (fmt === "latex" || fmt === "tex") code = exportProofToLatex(activeTheoremId);
      else if (fmt === "md" || fmt === "markdown") code = exportProofToMarkdown(edges, activeTheoremId);
      else if (fmt === "mer" || fmt === "mermaid") code = exportProofToMermaid(edges, activeTheoremId);
      else {
        setConsoleLogs((prev) => [
          ...prev,
          {
            id: outputLogId,
            type: "error",
            text: "Supported export formats: lean, latex, markdown, mermaid. Example: 'export lean'",
          },
        ]);
        return;
      }

      setConsoleLogs((prev) => [
        ...prev,
        {
          id: outputLogId,
          type: "success",
          text: `--- Formal Proof Export (${fmt.toUpperCase()}) ---\n${code}`,
        },
      ]);
      announceToScreenReader(`Exported proof in ${fmt} format.`);
      return;
    }

    if (op === "list") {
      const activeNodesText = activeTheorem.nodes
        .map((node) => {
          const outConnections = edges.filter((e) => e.source === node.id).map((e) => e.target);
          const connectionStr =
            outConnections.length > 0 ? `connected to [${outConnections.join(", ")}]` : "no outgoing connections";
          return `• Node ${node.id} (${node.label}): ${node.description} [${connectionStr}]`;
        })
        .join("\n");

      setConsoleLogs((prev) => [
        ...prev,
        {
          id: outputLogId,
          type: "output",
          text: `Active [${activeTheorem.title}] Logic Nodes & Connections:\n${activeNodesText}`,
        },
      ]);
      announceToScreenReader("Listed active proof nodes and connections.");
      return;
    }

    if (op === "connect") {
      if (!arg1 || !arg2) {
        setConsoleLogs((prev) => [
          ...prev,
          {
            id: outputLogId,
            type: "error",
            text: "Syntax Error: 'connect' requires two node arguments. Example: 'connect C E'",
          },
        ]);
        announceToScreenReader("Syntax error in connect command.");
        return;
      }

      const validation = canConnect(arg1, arg2, edges, activeTheoremId);
      if (!validation.allowed) {
        const fallacy = getFallacyDiagnosis(arg1, arg2, edges, activeTheoremId);
        setCurrentFallacy(fallacy);
        setActiveTab("fallacy");

        setConsoleLogs((prev) => [
          ...prev,
          {
            id: outputLogId,
            type: "error",
            text: `[FALLACY DETECTED] ${fallacy.fallacyName}: ${validation.reason}\n${fallacy.softwareAnalogy}`,
          },
        ]);
        announceToScreenReader(`Connection error: ${fallacy.fallacyName}`);
        return;
      }

      setEdges((prev) => [...prev, { source: arg1, target: arg2 }]);
      setCurrentFallacy(null);
      setInspectedNodeId(arg2);

      try {
        playSuccess();
      } catch {}
      setConsoleLogs((prev) => [
        ...prev,
        {
          id: outputLogId,
          type: "success",
          text: `✔ Established connection: Node ${arg1} → Node ${arg2}`,
        },
      ]);
      announceToScreenReader(`Connected Node ${arg1} to Node ${arg2}`);
      return;
    }

    if (op === "disconnect") {
      if (!arg1 || !arg2) {
        setConsoleLogs((prev) => [
          ...prev,
          {
            id: outputLogId,
            type: "error",
            text: "Syntax Error: 'disconnect' requires two node arguments. Example: 'disconnect C E'",
          },
        ]);
        announceToScreenReader("Syntax error in disconnect command.");
        return;
      }

      const exists = edges.some(
        (e) =>
          (e.source === arg1 && e.target === arg2) ||
          (e.source === arg2 && e.target === arg1)
      );

      if (!exists) {
        setConsoleLogs((prev) => [
          ...prev,
          {
            id: outputLogId,
            type: "error",
            text: `No active connection found between Node ${arg1} and Node ${arg2}.`,
          },
        ]);
        announceToScreenReader("No connection found to disconnect.");
        return;
      }

      setEdges((prev) =>
        prev.filter(
          (e) =>
            !(
              (e.source === arg1 && e.target === arg2) ||
              (e.source === arg2 && e.target === arg1)
            )
        )
      );
      try {
        playAutocomplete();
      } catch {}
      setConsoleLogs((prev) => [
        ...prev,
        {
          id: outputLogId,
          type: "output",
          text: `✔ Severed connection: Node ${arg1} ↛ Node ${arg2}`,
        },
      ]);
      announceToScreenReader(`Disconnected Node ${arg1} from Node ${arg2}`);
      return;
    }

    if (op === "simulate") {
      const subOp = tokens[1]?.toLowerCase() || "normal";
      if (subOp !== "normal" && subOp !== "loop") {
        setConsoleLogs((prev) => [
          ...prev,
          {
            id: outputLogId,
            type: "error",
            text: "Invalid simulate mode. Supported modes: 'normal' or 'loop'.",
          },
        ]);
        announceToScreenReader("Invalid simulate mode.");
        return;
      }

      setIsSimulating(true);
      if (subOp === "normal") {
        const stepCount = activeTheorem.simulationSteps.length;
        setSimulationProgress({ step: 0, total: stepCount, log: `Initializing [${activeTheorem.title}] background tactic worker...` });
        setConsoleLogs((prev) => [
          ...prev,
          {
            id: outputLogId,
            type: "info",
            text: `Starting [${activeTheorem.title}] formal tactic simulation on background thread. Watchdog timer armed (5s)...`,
          },
        ]);
        announceToScreenReader("Starting standard tactic simulation on background thread.");
      } else {
        setSimulationProgress({ step: 0, total: 1, log: "Starting loop simulation (watchdog test)..." });
        setConsoleLogs((prev) => [
          ...prev,
          {
            id: outputLogId,
            type: "info",
            text: "Starting loop simulation on background thread. Watchdog timer armed (5s)...",
          },
        ]);
        announceToScreenReader("Starting loop simulation. Watchdog timer armed.");
      }

      resetWatchdog();

      if (workerRef.current) {
        workerRef.current.postMessage({
          type: "START_SIMULATION",
          mode: subOp as "normal" | "loop",
          theoremId: activeTheoremId,
        });
      } else {
        initWorker();
        setTimeout(() => {
          workerRef.current?.postMessage({
            type: "START_SIMULATION",
            mode: subOp as "normal" | "loop",
            theoremId: activeTheoremId,
          });
        }, 50);
      }
      return;
    }

    setConsoleLogs((prev) => [
      ...prev,
      {
        id: outputLogId,
        type: "error",
        text: `Unrecognized command: '${tokens[0]}'. Type 'help' to review supported registry entries.`,
      },
    ]);
    announceToScreenReader(`Command unrecognized: '${tokens[0]}'. Please try again or type help.`);
  };

  const suggestion = getSuggestion(consoleInput);

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      runCommand(consoleInput);
    } else if (e.key === "Escape") {
      e.preventDefault();
      consoleInputRef.current?.blur();
      toggleBtnRef.current?.focus({ preventScroll: true });
      announceToScreenReader("Console input blurred. Focus returned to toggle button.");
    } else if (e.key === "Tab") {
      e.preventDefault();
      if (suggestion) {
        setConsoleInput(suggestion);
      }
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (history.length === 0) return;
      const nextIdx = historyIdx === -1 ? history.length - 1 : Math.max(0, historyIdx - 1);
      setHistoryIdx(nextIdx);
      setConsoleInput(history[nextIdx]);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (historyIdx === -1) return;
      const nextIdx = historyIdx + 1;
      if (nextIdx >= history.length) {
        setHistoryIdx(-1);
        setConsoleInput("");
      } else {
        setHistoryIdx(nextIdx);
        setConsoleInput(history[nextIdx]);
      }
    }
  };

  const { isC_Proven, isE_Proven } = evaluateProofStatus(edges, activeTheoremId);
  const tacticHint = getNextTacticHint(edges, activeTheoremId);
  const deductionLedger = getDeductionLedger(edges, activeTheoremId);
  const inspectedNode = activeTheorem.nodes.find((n) => n.id === inspectedNodeId) || activeTheorem.nodes[0];

  const handleCopyExportCode = () => {
    let code = "";
    if (exportFormat === "lean") code = exportProofToLean4(activeTheoremId);
    if (exportFormat === "latex") code = exportProofToLatex(activeTheoremId);
    if (exportFormat === "markdown") code = exportProofToMarkdown(edges, activeTheoremId);
    if (exportFormat === "mermaid") code = exportProofToMermaid(edges, activeTheoremId);

    navigator.clipboard.writeText(code);
    setHasCopiedExport(true);
    try {
      playSuccess();
    } catch {}
    showToast(`Copied ${exportFormat.toUpperCase()} proof code to clipboard!`, "success");
    setTimeout(() => setHasCopiedExport(false), 3000);
  };

  return (
    <div className="bg-zinc-950 min-h-screen text-foreground overflow-x-hidden flex flex-col font-sans">
      {/* Screen reader ARIA live region */}
      <div aria-live="assertive" aria-atomic="true" className="sr-only">
        {liveAnnouncement}
      </div>

      {/* Main Container */}
      <div className="flex-1 pt-24 pb-8 px-4 sm:px-6 flex flex-col gap-6 max-w-7xl mx-auto w-full">
        {/* Navigation Breadcrumbs */}
        <Breadcrumbs
          items={[
            { label: "Systems", href: "/#case-studies" },
            { label: "Proof Workspace" },
          ]}
        />

        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-900 pb-5">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse"></span>
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-400">
                Formal Verification Workspace
              </span>
              <span className="text-xs font-mono text-zinc-600">· Propositional Logic Engine v3.0</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mt-1">
              Logical Proof Canvas
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 font-sans mt-0.5 max-w-2xl">
              {activeTheorem.scenario} Select nodes to wire deductive inference rules and inspect real-time mathematical ledgers.
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap self-start sm:self-center">
            {/* Export Proof Button */}
            <button
              onClick={() => setIsExportModalOpen(true)}
              className="px-3.5 py-1.5 text-xs font-mono font-bold bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800 hover:border-cyan-500/40 text-cyan-300 rounded-xl transition-all cursor-pointer flex items-center gap-2"
            >
              <IconDownload className="w-4 h-4 text-cyan-400" />
              <span>Export Proof</span>
            </button>

            {/* Field Manual Trigger */}
            <FieldManualButton manualId="proof" label="Field Manual" />

            {/* Split Console Toggle */}
            <button
              ref={toggleBtnRef}
              onClick={toggleConsole}
              aria-expanded={isConsoleOpen}
              aria-label={isConsoleOpen ? "Close interactive text console" : "Open interactive text console"}
              className="px-3.5 py-1.5 text-xs font-mono font-bold bg-zinc-900/60 hover:bg-zinc-800 border border-zinc-800 hover:border-cyan-500/40 text-zinc-300 hover:text-cyan-400 rounded-xl transition-all cursor-pointer flex items-center gap-2"
            >
              <IconTerminal className="w-4 h-4 text-cyan-400" />
              <span>{isConsoleOpen ? "Hide CLI" : "Show CLI"}</span>
              <kbd className="hidden sm:inline-block text-[10px] text-zinc-500 bg-zinc-950 px-1.5 py-0.5 rounded border border-zinc-800">
                Ctrl+\
              </kbd>
            </button>
          </div>
        </div>

        {/* Theorem Selector Toolbar */}
        <div className="bg-zinc-900/60 border border-zinc-800/90 rounded-2xl p-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <IconCode className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-mono font-bold text-zinc-400 uppercase tracking-wider">
              Theorem Catalog:
            </span>
          </div>

          <div className="flex items-center gap-2 flex-wrap flex-1 justify-start sm:justify-end">
            {(Object.keys(THEOREMS) as TheoremId[]).map((tId) => {
              const th = THEOREMS[tId];
              const isActive = tId === activeTheoremId;
              return (
                <button
                  key={tId}
                  onClick={() => handleSwitchTheorem(tId)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-mono font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                    isActive
                      ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 shadow-md shadow-cyan-500/10"
                      : "bg-zinc-950/60 text-zinc-400 hover:text-zinc-200 border border-zinc-800 hover:border-zinc-700"
                  }`}
                >
                  <span>{th.title}</span>
                  <span className="text-[10px] opacity-60 hidden md:inline">({th.category})</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Guided Proof Assistant & Theorem Inspector Tray */}
        <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-4 sm:p-5 relative overflow-hidden backdrop-blur-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5 flex-1">
            <div
              className={`p-2.5 rounded-xl shrink-0 ${
                isE_Proven
                  ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-400"
                  : "bg-cyan-500/10 border border-cyan-500/30 text-cyan-400"
              }`}
            >
              {isE_Proven ? <IconShieldCheck className="w-5 h-5" /> : <IconBulb className="w-5 h-5" />}
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-400">
                  {activeTheorem.title} Assistant
                </span>
                <span
                  className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                    isE_Proven
                      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                      : isC_Proven
                      ? "bg-cyan-500/10 text-cyan-400 border-cyan-500/30"
                      : "bg-zinc-800 text-zinc-400 border-zinc-700"
                  }`}
                >
                  {isE_Proven ? "STEP 2/2 · Q.E.D. PROVEN" : isC_Proven ? "STEP 1/2 · IN PROGRESS" : "STEP 0/2 · INCOMPLETE"}
                </span>
              </div>
              <h2 className="text-sm sm:text-base font-bold text-white font-sans">{tacticHint.title}</h2>
              <p className="text-xs text-zinc-300 font-sans leading-relaxed">{tacticHint.hint}</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2.5 shrink-0 self-end md:self-center w-full md:w-auto justify-end">
            <button
              onClick={handleResetLayout}
              title="Reset node positions to default layout"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-semibold text-zinc-400 hover:text-zinc-200 bg-zinc-950/60 hover:bg-zinc-900 border border-zinc-800 rounded-xl transition-all cursor-pointer"
            >
              <IconArrowsMove className="w-3.5 h-3.5" />
              <span>Reset Layout</span>
            </button>

            <button
              onClick={handleResetProof}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-semibold text-zinc-400 hover:text-zinc-200 bg-zinc-950/60 hover:bg-zinc-900 border border-zinc-800 rounded-xl transition-all cursor-pointer"
            >
              <IconRefresh className="w-3.5 h-3.5" />
              <span>Reset Proof</span>
            </button>

            {!isE_Proven && (
              <button
                onClick={handleApplyNextTactic}
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-mono font-bold uppercase tracking-wider text-black bg-cyan-400 hover:bg-cyan-300 rounded-xl transition-all shadow-md shadow-cyan-500/10 cursor-pointer"
              >
                <IconBolt className="w-4 h-4 text-black fill-black" />
                <span>Apply Next Tactic</span>
              </button>
            )}
          </div>
        </div>

        {/* Workspace Canvas & Split View Console & Explanation Suite */}
        <div className="flex flex-col lg:flex-row gap-6 relative min-h-[520px]">
          {/* Left / Center: Interactive Graphical Canvas */}
          <div className="flex-1 flex flex-col bg-zinc-950 border border-zinc-900 rounded-3xl relative overflow-hidden p-4 sm:p-6 min-h-[460px]">
            {/* Toast Overlay */}
            <AnimatePresence>
              {feedbackToast && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className={`absolute top-4 left-4 right-4 z-30 px-4 py-2.5 rounded-xl border text-xs font-mono font-medium flex items-center justify-between shadow-lg backdrop-blur-md ${
                    feedbackToast.type === "success"
                      ? "bg-emerald-950/90 text-emerald-300 border-emerald-500/40"
                      : feedbackToast.type === "error"
                      ? "bg-rose-950/90 text-rose-300 border-rose-500/40"
                      : "bg-zinc-900/90 text-cyan-300 border-cyan-500/40"
                  }`}
                >
                  <span>{feedbackToast.message}</span>
                  <button
                    onClick={() => setFeedbackToast(null)}
                    className="p-1 hover:text-white cursor-pointer"
                  >
                    <IconX className="w-3.5 h-3.5" />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Q.E.D Celebration Banner */}
            <AnimatePresence>
              {isE_Proven && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute top-4 left-4 right-4 z-20 bg-gradient-to-r from-emerald-950/95 via-zinc-950/95 to-emerald-950/95 border border-emerald-500/50 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-2xl shadow-emerald-950/40"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="p-3 bg-emerald-500/20 border border-emerald-500/40 rounded-2xl text-emerald-400">
                      <IconSparkles className="w-6 h-6 animate-spin" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-extrabold text-emerald-400 uppercase tracking-wider">
                          Theorem Discharged (Q.E.D.)
                        </span>
                      </div>
                      <h3 className="text-base sm:text-lg font-extrabold text-white">
                        {activeTheorem.title}: {activeTheorem.nodes.find((n) => n.id === activeTheorem.targetNodeId)?.description}
                      </h3>
                      <p className="text-xs text-zinc-300 font-sans mt-0.5">
                        Formal verification complete. Mathematical soundness achieved without sorry.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1.5 bg-emerald-900/50 border border-emerald-500/40 rounded-xl text-xs font-mono font-bold text-emerald-300">
                      VERIFICATION: 100%
                    </span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Simulation Progress Widget */}
            {isSimulating && simulationProgress && (
              <div className="absolute top-4 left-4 right-4 bg-zinc-950/95 border border-cyan-500/30 rounded-xl p-4 flex flex-col gap-3 shadow-lg shadow-cyan-500/5 z-20">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping"></span>
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                      Background Tactic Simulation Running...
                    </h3>
                  </div>
                  <span className="text-[10px] font-mono text-zinc-500 bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800">
                    THREAD: WEB WORKER (60FPS UI SAFE)
                  </span>
                </div>

                <div className="w-full bg-zinc-900 h-2 rounded-full overflow-hidden border border-zinc-800">
                  <div
                    className="bg-cyan-400 h-full rounded-full transition-all duration-300"
                    style={{ width: `${(simulationProgress.step / Math.max(1, simulationProgress.total)) * 100}%` }}
                  />
                </div>

                <div className="flex justify-between items-center text-[10px] font-mono">
                  <span className="text-zinc-400 truncate max-w-[70%]">{simulationProgress.log}</span>
                  <span className="text-cyan-400 font-bold">
                    STEP {simulationProgress.step} / {simulationProgress.total}
                  </span>
                </div>
              </div>
            )}

            {/* Canvas Viewport Area */}
            <div
              className="flex-1 relative bg-zinc-950/80 rounded-2xl border border-zinc-900 overflow-hidden flex items-center justify-center p-2 min-h-[380px]"
              role="region"
              aria-label="Formal logic proof graph canvas"
            >
              {/* Responsive SVG Layer */}
              <svg
                ref={svgCanvasRef}
                viewBox="0 0 720 440"
                className="w-full h-full max-h-[460px] select-none"
                preserveAspectRatio="xMidYMid meet"
              >
                <defs>
                  <marker
                    id="cyan-arrow"
                    viewBox="0 0 10 10"
                    refX="6"
                    refY="5"
                    markerWidth="6"
                    markerHeight="6"
                    orient="auto-start-reverse"
                  >
                    <path d="M 0 2 L 8 5 L 0 8 z" fill="#22d3ee" />
                  </marker>
                  <marker
                    id="emerald-arrow"
                    viewBox="0 0 10 10"
                    refX="6"
                    refY="5"
                    markerWidth="6"
                    markerHeight="6"
                    orient="auto-start-reverse"
                  >
                    <path d="M 0 2 L 8 5 L 0 8 z" fill="#10b981" />
                  </marker>
                </defs>

                {/* Drawn Connecting Edges */}
                {edges.map((edge, idx) => {
                  const sNode = activeTheorem.nodes.find((n) => n.id === edge.source);
                  const tNode = activeTheorem.nodes.find((n) => n.id === edge.target);
                  if (!sNode || !tNode) return null;

                  const sOffset = nodeOffsets[edge.source] || { x: 0, y: 0 };
                  const tOffset = nodeOffsets[edge.target] || { x: 0, y: 0 };

                  const sx = sNode.x + sOffset.x;
                  const sy = sNode.y + sOffset.y;
                  const tx = tNode.x + tOffset.x;
                  const ty = tNode.y + tOffset.y;

                  const isEdgeProven =
                    (edge.target === "C" && isC_Proven) ||
                    (edge.target === "E" && isE_Proven);

                  return (
                    <g key={`edge-group-${idx}`} className="cursor-pointer group">
                      {/* Thick transparent stroke for easier click target */}
                      <path
                        d={`M ${sx} ${sy} L ${tx} ${ty}`}
                        stroke="transparent"
                        strokeWidth="24"
                        onClick={() => handleDisconnectEdge(edge.source, edge.target)}
                      />

                      {/* Visible dashed line */}
                      <path
                        d={`M ${sx} ${sy} L ${tx} ${ty}`}
                        stroke={isEdgeProven ? "#10b981" : "#22d3ee"}
                        strokeWidth="2.5"
                        strokeDasharray="5 5"
                        className="animate-[dash_10s_linear_infinite]"
                        markerEnd={isEdgeProven ? "url(#emerald-arrow)" : "url(#cyan-arrow)"}
                        onClick={() => handleDisconnectEdge(edge.source, edge.target)}
                      />

                      {/* Disconnect indicator on hover */}
                      <circle
                        cx={(sx + tx) / 2}
                        cy={(sy + ty) / 2}
                        r="12"
                        className="fill-zinc-950 stroke-zinc-800 group-hover:stroke-rose-500 transition-colors"
                        onClick={() => handleDisconnectEdge(edge.source, edge.target)}
                      />
                      <text
                        x={(sx + tx) / 2}
                        y={(sy + ty) / 2 + 3.5}
                        textAnchor="middle"
                        className="text-[9px] font-mono fill-zinc-500 group-hover:fill-rose-400 font-bold select-none pointer-events-none"
                      >
                        ✕
                      </text>
                    </g>
                  );
                })}

                {/* Render Nodes inside SVG with Dragging and Inspection Support */}
                {activeTheorem.nodes.map((node) => {
                  let isNodeProven = true;
                  if (node.id === "C") isNodeProven = isC_Proven;
                  if (node.id === "E") isNodeProven = isE_Proven;

                  const isSelected = selectedSourceId === node.id;
                  const isInspected = inspectedNodeId === node.id;
                  const isValidTarget =
                    selectedSourceId !== null &&
                    selectedSourceId !== node.id &&
                    canConnect(selectedSourceId, node.id, edges, activeTheoremId).allowed;

                  const offset = nodeOffsets[node.id] || { x: 0, y: 0 };
                  const nx = node.x + offset.x;
                  const ny = node.y + offset.y;

                  return (
                    <g
                      key={node.id}
                      transform={`translate(${nx}, ${ny})`}
                      onClick={() => handleNodeClick(node.id)}
                      onPointerDown={(e) => handleNodePointerDown(e, node.id)}
                      onPointerMove={(e) => handleNodePointerMove(e, node.id)}
                      onPointerUp={(e) => handleNodePointerUp(e, node.id)}
                      className="cursor-pointer group"
                    >
                      {/* Selection Glow Halos */}
                      {isSelected && (
                        <circle
                          r="58"
                          className="fill-cyan-500/10 stroke-cyan-400 stroke-2 animate-ping opacity-60"
                        />
                      )}
                      {isValidTarget && (
                        <circle
                          r="56"
                          className="fill-emerald-500/10 stroke-emerald-400 stroke-2 stroke-dasharray-4 animate-pulse"
                        />
                      )}
                      {isInspected && !isSelected && (
                        <circle
                          r="54"
                          className="fill-indigo-500/10 stroke-indigo-400/80 stroke-1"
                        />
                      )}

                      {/* Node Card Background */}
                      <rect
                        x="-70"
                        y="-40"
                        width="140"
                        height="80"
                        rx="16"
                        className={`transition-all duration-300 ${
                          isSelected
                            ? "fill-zinc-950 stroke-cyan-400 stroke-2 filter drop-shadow-[0_0_12px_rgba(6,182,212,0.4)]"
                            : isNodeProven
                            ? "fill-zinc-950/95 stroke-emerald-500/60 group-hover:stroke-emerald-400 stroke-[1.5]"
                            : isValidTarget
                            ? "fill-zinc-950 stroke-emerald-400/80 stroke-2"
                            : "fill-zinc-950/90 stroke-zinc-800 group-hover:stroke-zinc-700 stroke-1"
                        }`}
                      />

                      {/* Node ID Badge */}
                      <text
                        x="-56"
                        y="-22"
                        className="text-[10px] font-mono font-extrabold fill-zinc-500 tracking-wider select-none"
                      >
                        NODE {node.id}
                      </text>

                      {/* Proven / Active Indicator Dot */}
                      <circle
                        cx="54"
                        cy="-24"
                        r="4"
                        className={isNodeProven ? "fill-emerald-400" : "fill-zinc-700"}
                      />

                      {/* Logic Label */}
                      <text
                        x="0"
                        y="6"
                        textAnchor="middle"
                        className="text-base font-extrabold fill-white font-mono select-none"
                      >
                        {node.label}
                      </text>

                      {/* Type subtitle */}
                      <text
                        x="0"
                        y="24"
                        textAnchor="middle"
                        className="text-[10px] font-mono fill-zinc-500 uppercase tracking-wider select-none"
                      >
                        {node.type}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>

            {/* Bottom Status / Legend bar */}
            <div className="mt-4 pt-3 border-t border-zinc-900 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono text-zinc-500">
              <div className="flex items-center gap-4 flex-wrap">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  <span>Proven Hypothesis</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
                  <span>Selected Source</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-zinc-700"></span>
                  <span>Unproven Goal</span>
                </span>
              </div>

              <div className="text-[11px] text-zinc-500">
                Click source → target to connect · Drag nodes to reposition · Click ✕ to disconnect
              </div>
            </div>
          </div>

          {/* Right Side: Tabbed Explanation Suite (Inspector / Ledger / Fallacy) & Split CLI */}
          <div className="w-full lg:w-[440px] flex flex-col gap-4">
            {/* Integrated Explanation Suite */}
            <div className="bg-zinc-950 border border-zinc-900 rounded-3xl p-4 flex flex-col min-h-[300px] shadow-xl">
              {/* Tab Navigation Header */}
              <div className="flex items-center justify-between border-b border-zinc-900 pb-3 mb-3">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setActiveTab("inspector")}
                    className={`px-3 py-1 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                      activeTab === "inspector"
                        ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
                        : "text-zinc-400 hover:text-zinc-200"
                    }`}
                  >
                    <IconBook className="w-3.5 h-3.5" />
                    <span>Logic Inspector</span>
                  </button>

                  <button
                    onClick={() => setActiveTab("ledger")}
                    className={`px-3 py-1 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                      activeTab === "ledger"
                        ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
                        : "text-zinc-400 hover:text-zinc-200"
                    }`}
                  >
                    <IconTable className="w-3.5 h-3.5" />
                    <span>Deduction Ledger</span>
                  </button>

                  <button
                    onClick={() => setActiveTab("fallacy")}
                    className={`px-3 py-1 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                      activeTab === "fallacy"
                        ? "bg-rose-500/20 text-rose-300 border border-rose-500/40"
                        : "text-zinc-400 hover:text-zinc-200"
                    }`}
                  >
                    <IconAlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                    <span>Fallacy Engine</span>
                  </button>
                </div>
              </div>

              {/* Tab 1: Logic Inspector */}
              {activeTab === "inspector" && inspectedNode && (
                <div className="space-y-3 font-sans text-xs flex-1 flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-white bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800">
                          NODE {inspectedNode.id}
                        </span>
                        <span className="text-sm font-mono font-extrabold text-cyan-300">
                          {inspectedNode.label}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-400">
                        {inspectedNode.type}
                      </span>
                    </div>

                    <div className="bg-zinc-900/60 rounded-xl p-3 border border-zinc-800/80 space-y-1">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 font-bold">
                        Formal Proposition
                      </span>
                      <p className="text-zinc-200 font-medium leading-relaxed">{inspectedNode.description}</p>
                    </div>

                    <div className="bg-zinc-900/40 rounded-xl p-3 border border-zinc-800/60 space-y-1">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-400 font-bold">
                        Plain-English Interpretation
                      </span>
                      <p className="text-zinc-300 leading-relaxed">{inspectedNode.meaning}</p>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-zinc-900/80 text-[11px] font-mono text-zinc-500 flex justify-between items-center">
                    <span>Inference Rule: {activeTheorem.ruleName}</span>
                    <button
                      onClick={() => setSelectedSourceId(inspectedNode.id)}
                      className="text-cyan-400 hover:text-cyan-300 font-bold underline cursor-pointer"
                    >
                      Connect From Here
                    </button>
                  </div>
                </div>
              )}

              {/* Tab 2: Deduction Ledger */}
              {activeTab === "ledger" && (
                <div className="space-y-2 flex-1 overflow-y-auto max-h-[320px] font-mono text-[11px] pr-1">
                  <div className="text-zinc-400 text-xs font-bold mb-2">
                    Deduction Proof Derivation Ledger
                  </div>
                  {deductionLedger.map((step) => (
                    <div
                      key={step.stepNumber}
                      className={`p-2.5 rounded-xl border flex flex-col gap-1 ${
                        step.isProven
                          ? "bg-emerald-950/20 border-emerald-500/30 text-zinc-300"
                          : "bg-zinc-900/40 border-zinc-800 text-zinc-400"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white">#{step.stepNumber}</span>
                          <code className="text-cyan-300 font-bold text-xs bg-zinc-950 px-1.5 py-0.5 rounded border border-zinc-800">
                            {step.formula}
                          </code>
                          <span className="text-zinc-400 text-[10px]">{step.rule}</span>
                        </div>
                        <span
                          className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${
                            step.isProven
                              ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                              : "bg-zinc-800 text-zinc-500 border-zinc-700"
                          }`}
                        >
                          {step.isProven ? "✔ PROVEN" : "⏳ PENDING"}
                        </span>
                      </div>
                      <p className="font-sans text-[11px] text-zinc-400 leading-snug">{step.plainEnglish}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Tab 3: Fallacy Engine */}
              {activeTab === "fallacy" && (
                <div className="space-y-3 font-sans text-xs flex-1 flex flex-col">
                  {currentFallacy ? (
                    <div className="space-y-3">
                      <div className="bg-rose-950/30 border border-rose-500/40 rounded-xl p-3 space-y-1">
                        <div className="flex items-center gap-1.5 text-rose-400 font-mono font-bold text-xs">
                          <IconAlertTriangle className="w-4 h-4" />
                          <span>{currentFallacy.fallacyName}</span>
                        </div>
                        <div className="font-mono text-[11px] text-rose-300/90">{currentFallacy.formalFormula}</div>
                        <p className="text-zinc-300 text-xs mt-1 leading-relaxed">{currentFallacy.plainEnglish}</p>
                      </div>

                      <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-3 space-y-1">
                        <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400 font-bold">
                          Real-World Engineering Failure Case
                        </span>
                        <p className="text-zinc-300 text-xs leading-relaxed">{currentFallacy.softwareAnalogy}</p>
                      </div>

                      <div className="space-y-1.5">
                        <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 font-bold">
                          Truth Table Counterexample
                        </span>
                        <div className="overflow-x-auto border border-zinc-800 rounded-xl">
                          <table className="w-full text-[10px] font-mono">
                            <thead className="bg-zinc-900 text-zinc-400">
                              <tr>
                                <th className="p-1.5 text-center">P</th>
                                <th className="p-1.5 text-center">Q</th>
                                <th className="p-1.5 text-center">Premise 1</th>
                                <th className="p-1.5 text-center">Premise 2</th>
                                <th className="p-1.5 text-center">Conclusion</th>
                              </tr>
                            </thead>
                            <tbody>
                              {currentFallacy.truthTable.map((row, idx) => (
                                <tr
                                  key={idx}
                                  className={`border-t border-zinc-800/60 ${
                                    row.isCounterexample ? "bg-rose-950/40 text-rose-300 font-bold" : "text-zinc-400"
                                  }`}
                                >
                                  <td className="p-1 text-center">{row.p ? "T" : "F"}</td>
                                  <td className="p-1 text-center">{row.q ? "T" : "F"}</td>
                                  <td className="p-1 text-center">{row.premise1 ? "T" : "F"}</td>
                                  <td className="p-1 text-center">{row.premise2 ? "T" : "F"}</td>
                                  <td className="p-1 text-center">{row.conclusion ? "T" : "F"}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-4 space-y-2 text-zinc-500">
                      <IconShieldCheck className="w-8 h-8 text-emerald-400" />
                      <div className="font-bold text-zinc-300 text-sm">Fallacy Engine Armed</div>
                      <p className="text-xs leading-relaxed max-w-xs">
                        Attempting any invalid connection (such as Affirming the Consequent, Circular Reasoning, or Type Mismatch) will trigger an instant diagnosis with Truth Table counterexamples.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Split CLI Console */}
            {isConsoleOpen && (
              <div
                id="proof-cli"
                data-keyboard-boundary="true"
                className="w-full bg-zinc-950 border border-zinc-900 rounded-3xl p-4 flex flex-col h-[380px] shadow-xl"
              >
                <div className="flex justify-between items-center pb-3 border-b border-zinc-900 mb-3">
                  <div className="flex items-center gap-2">
                    <IconTerminal className="w-4 h-4 text-cyan-400" />
                    <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                      Deductive Proof Terminal
                    </span>
                  </div>
                  <button
                    onClick={() => setConsoleLogs([])}
                    className="text-[10px] font-mono text-zinc-500 hover:text-zinc-300 cursor-pointer"
                  >
                    Clear
                  </button>
                </div>

                {/* Logs Area */}
                <div ref={terminalLogsContainerRef} className="flex-1 overflow-y-auto space-y-2 font-mono text-xs pr-1 select-text">
                  {consoleLogs.map((log) => (
                    <div
                      key={log.id}
                      className={`leading-relaxed break-words whitespace-pre-wrap rounded-lg p-2 ${
                        log.type === "command"
                          ? "text-cyan-300 bg-zinc-900/50"
                          : log.type === "success"
                          ? "text-emerald-400 bg-emerald-950/20"
                          : log.type === "error"
                          ? "text-rose-400 bg-rose-950/20"
                          : log.type === "info"
                          ? "text-zinc-400 bg-zinc-900/30"
                          : "text-zinc-300"
                      }`}
                    >
                      {log.type === "command" && <span className="text-zinc-500 mr-1.5">&gt;</span>}
                      {log.text}
                    </div>
                  ))}
                </div>

                {/* Autocomplete Suggestion Hint */}
                {suggestion && (
                  <div className="text-[10px] font-mono text-zinc-500 px-2 py-1 bg-zinc-900/50 rounded-lg border border-zinc-800/80 mb-2 flex items-center justify-between">
                    <span>
                      Tab: <code className="text-cyan-400">{consoleInput}{suggestion.substring(consoleInput.length)}</code>
                    </span>
                    <span>[TAB] to accept</span>
                  </div>
                )}

                {/* Input Form */}
                <div className="pt-2 border-t border-zinc-900 flex items-center gap-2">
                  <span className="text-cyan-400 font-mono text-xs font-bold">&gt;</span>
                  <input
                    ref={consoleInputRef}
                    type="text"
                    value={consoleInput}
                    onChange={(e) => setConsoleInput(e.target.value)}
                    onKeyDown={handleInputKeyDown}
                    placeholder="Type 'connect C E', 'theorem mt', or 'help'..."
                    className="flex-1 bg-transparent border-0 text-xs font-mono text-white placeholder-zinc-600 focus:outline-none"
                    aria-label="Interactive Proof CLI command input"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Proof Export Modal */}
        <AnimatePresence>
          {isExportModalOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
              onClick={() => setIsExportModalOpen(false)}
            >
              <motion.div
                initial={{ scale: 0.95, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 20 }}
                className="bg-zinc-950 border border-zinc-800 rounded-3xl p-6 max-w-2xl w-full shadow-2xl space-y-4"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between border-b border-zinc-900 pb-4">
                  <div className="flex items-center gap-2">
                    <IconDownload className="w-5 h-5 text-cyan-400" />
                    <h3 className="text-lg font-bold text-white font-sans">
                      Export Formal Proof: {activeTheorem.title}
                    </h3>
                  </div>
                  <button
                    onClick={() => setIsExportModalOpen(false)}
                    className="p-1 text-zinc-400 hover:text-white cursor-pointer"
                  >
                    <IconX className="w-5 h-5" />
                  </button>
                </div>

                {/* Format Selector Tabs */}
                <div className="flex items-center gap-2 border-b border-zinc-900 pb-3">
                  {(["lean", "latex", "markdown", "mermaid"] as const).map((fmt) => (
                    <button
                      key={fmt}
                      onClick={() => setExportFormat(fmt)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold uppercase transition-all cursor-pointer ${
                        exportFormat === fmt
                          ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
                          : "bg-zinc-900/60 text-zinc-400 hover:text-zinc-200 border border-zinc-800"
                      }`}
                    >
                      {fmt === "lean" ? "Lean 4 Code" : fmt === "latex" ? "LaTeX Proof" : fmt === "markdown" ? "Markdown Table" : "Mermaid Diagram"}
                    </button>
                  ))}
                </div>

                {/* Code Preview Box */}
                <div className="relative bg-zinc-900/70 border border-zinc-800 rounded-2xl p-4 font-mono text-xs text-zinc-200 overflow-x-auto max-h-[280px]">
                  <pre className="whitespace-pre">
                    {exportFormat === "lean" && exportProofToLean4(activeTheoremId)}
                    {exportFormat === "latex" && exportProofToLatex(activeTheoremId)}
                    {exportFormat === "markdown" && exportProofToMarkdown(edges, activeTheoremId)}
                    {exportFormat === "mermaid" && exportProofToMermaid(edges, activeTheoremId)}
                  </pre>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <span className="text-xs font-mono text-zinc-500">
                    Status: {isE_Proven ? "100% Formally Verified" : "Partial Derivation"}
                  </span>
                  <button
                    onClick={handleCopyExportCode}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-400 hover:bg-cyan-300 text-black font-mono font-bold text-xs rounded-xl transition-all cursor-pointer shadow-md shadow-cyan-500/10"
                  >
                    {hasCopiedExport ? <IconCheck className="w-4 h-4" /> : <IconCopy className="w-4 h-4" />}
                    <span>{hasCopiedExport ? "Copied to Clipboard!" : "Copy Code"}</span>
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Sequential Next / Prev Flow */}
        <NextPrevNav
          prev={{
            title: "Platform Transparency Hub",
            href: "/transparency",
            label: "Verification Hub",
            tag: "Audit Logs & Security",
          }}
          next={{
            title: "Incident Alignment Simulator",
            href: "/simulator",
            label: "Architecture Simulator",
            tag: "Incident Commander",
          }}
          backToHub={{
            title: "View Work Showcase",
            href: "/#case-studies",
          }}
        />
      </div>
    </div>
  );
}
