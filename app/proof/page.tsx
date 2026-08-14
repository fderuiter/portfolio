"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  IconTerminal,
  IconCornerDownLeft
} from "@tabler/icons-react";
import { getSuggestion, evaluateProofStatus } from "@/lib/proof-utils";

const IconCheck = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const IconPlay = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <polygon points="5 3 19 12 5 21" />
  </svg>
);

interface Node {
  id: string;
  label: string;
  type: "premise" | "intermediate" | "conclusion";
  description: string;
  x: number; // visual representation
  y: number;
}

interface Edge {
  source: string;
  target: string;
}

interface TerminalLog {
  id: string;
  type: "command" | "output" | "error" | "info" | "success";
  text: string;
}

const DEFAULT_NODES: Node[] = [
  { id: "A", label: "P", type: "premise", description: "Premise P: The system is under test.", x: 100, y: 150 },
  { id: "B", label: "P → Q", type: "premise", description: "Premise P → Q: If the system is under test, then bugs will be caught.", x: 100, y: 300 },
  { id: "C", label: "Q", type: "intermediate", description: "Intermediate Conclusion Q: Bugs will be caught.", x: 350, y: 225 },
  { id: "D", label: "Q → R", type: "premise", description: "Premise Q → R: If bugs are caught, then reliability is guaranteed.", x: 350, y: 375 },
  { id: "E", label: "R", type: "conclusion", description: "Conclusion R: Reliability is guaranteed.", x: 600, y: 300 }
];

export default function ProofWorkspacePage() {
  const [nodes] = useState<Node[]>(DEFAULT_NODES);
  const [edges, setEdges] = useState<Edge[]>([
    { source: "A", target: "C" },
    { source: "B", target: "C" }
  ]);
  
  const [isConsoleOpen, setIsConsoleOpen] = useState(true);
  const [consoleInput, setConsoleInput] = useState("");
  const [consoleLogs, setConsoleLogs] = useState<TerminalLog[]>([
    {
      id: "welcome",
      type: "info",
      text: "Interactive Logic Proof CLI v1.0.0\nType 'help' to review list of active commands. Press 'Tab' to autocomplete."
    }
  ]);
  const [history, setHistory] = useState<string[]>([]);
  const [historyIdx, setHistoryIdx] = useState(-1);
  const [liveAnnouncement, setLiveAnnouncement] = useState("");
  
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
  const terminalLogsEndRef = useRef<HTMLDivElement>(null);

  // Helper to trigger 100ms screen reader announcement
  const announceToScreenReader = (text: string) => {
    setLiveAnnouncement("");
    setTimeout(() => {
      setLiveAnnouncement(text);
    }, 10);
  };

  const toggleConsole = React.useCallback(() => {
    setIsConsoleOpen((prev) => {
      const next = !prev;
      if (next) {
        lastActiveElementRef.current = document.activeElement as HTMLElement;
        announceToScreenReader("Command console opened split-view alongside proof workspace. Input focused.");
        setTimeout(() => {
          consoleInputRef.current?.focus();
        }, 50);
      } else {
        announceToScreenReader("Command console closed. Focus returned to workspace.");
        setTimeout(() => {
          toggleBtnRef.current?.focus();
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
        text: "Background calculation terminated by watchdog: execution exceeded 5-second limit (potential infinite loop detected)"
      }
    ]);
    announceToScreenReader("Background calculation terminated by watchdog: execution exceeded 5-second limit.");
  }, [clearWatchdog]);

  // Helper to reset watchdog for another 5 seconds
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

      // Next.js standard URL loader for Web Workers
      const worker = new Worker(new URL("./proof-worker.ts", import.meta.url));

      worker.onmessage = (event) => {
        const message = event.data;
        if (!message) return;

        // Reset the watchdog timeout since the worker is active and responsive
        resetWatchdog();

        if (message.type === "progress") {
          pendingLogsRef.current.push({
            id: `sim-${Date.now()}-${Math.random()}`,
            type: "output",
            text: message.log
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
              text: `✔ Background Simulation completed successfully with ${message.stepsCompleted} steps.`
            }
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
              text: `Background Simulation error: ${message.message}`
            }
          ]);
          announceToScreenReader(`Background proof simulation error: ${message.message}`);
        }
      };

      workerRef.current = worker;
    }
  }, [clearWatchdog, resetWatchdog]);

  // Synchronize initWorkerRef.current to point to the latest initWorker function
  useEffect(() => {
    initWorkerRef.current = initWorker;
  }, [initWorker]);

  // Setup/Teardown Web Worker and Batch Throttler
  useEffect(() => {
    initWorker();

    // 100ms batch logs flush timer to maintain high-FPS UI performance
    const flushInterval = setInterval(() => {
      if (pendingLogsRef.current.length > 0) {
        const logsToAppend = [...pendingLogsRef.current];
        pendingLogsRef.current = [];

        setConsoleLogs((prev) => [...prev, ...logsToAppend]);

        // Extract latest step info for real-time progress metrics rendering
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

  // Auto-scroll terminal logs
  useEffect(() => {
    terminalLogsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [consoleLogs]);

  // Global Keyboard Shortcut handler for toggling split-view: Ctrl + \ or Ctrl + `
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey && e.key === "\\") || (e.ctrlKey && e.key === "`")) {
        e.preventDefault();
        if (!isConsoleOpen) {
          toggleConsole();
        } else {
          // If already open, check focus location
          if (document.activeElement !== consoleInputRef.current) {
            consoleInputRef.current?.focus();
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

  // Command executor
  const runCommand = (cmdStr: string) => {
    const trimmed = cmdStr.trim();
    if (!trimmed) return;

    // Log the typed command
    const commandLogId = `cmd-${Date.now()}`;
    setConsoleLogs((prev) => [...prev, { id: commandLogId, type: "command", text: trimmed }]);
    setConsoleInput("");

    // Update history queue
    setHistory((prev) => {
      const filtered = prev.filter((h) => h !== trimmed);
      return [...filtered, trimmed];
    });
    setHistoryIdx(-1);

    // Parse command arguments
    const tokens = trimmed.split(/\s+/);
    const op = tokens[0].toLowerCase();
    const arg1 = tokens[1]?.toUpperCase();
    const arg2 = tokens[2]?.toUpperCase();

    const outputLogId = `out-${Date.now()}`;

    if (op === "help") {
      const helpText = 
        "Supported Commands:\n" +
        "  connect <node1> <node2>    - Connect source node to target node\n" +
        "  disconnect <node1> <node2> - Remove connection between two nodes\n" +
        "  list                       - List all active logic nodes & their connections\n" +
        "  simulate [normal|loop]     - Run background tactic simulation (normal/loop)\n" +
        "  clear                      - Clear the console logs\n" +
        "  help                       - Show this help dialogue";
      setConsoleLogs((prev) => [...prev, { id: outputLogId, type: "info", text: helpText }]);
      announceToScreenReader("Help menu printed. Listing available commands: connect, disconnect, list, simulate, clear, and help.");
      return;
    }

    if (op === "clear") {
      setConsoleLogs([]);
      announceToScreenReader("Console logs cleared.");
      return;
    }

    if (op === "list") {
      const activeNodesText = DEFAULT_NODES.map((node) => {
        const outConnections = edges.filter((e) => e.source === node.id).map((e) => e.target);
        const connectionStr = outConnections.length > 0 ? `connected to [${outConnections.join(", ")}]` : "no outgoing connections";
        return `• Node ${node.id} (${node.label}): ${node.description} [${connectionStr}]`;
      }).join("\n");

      setConsoleLogs((prev) => [
        ...prev,
        {
          id: outputLogId,
          type: "output",
          text: `Active Proof Canvas Logic Nodes & Connections:\n${activeNodesText}`
        }
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
            text: "Syntax Error: 'connect' command requires source and target node IDs. Example: connect A C"
          }
        ]);
        announceToScreenReader("Syntax error: connect command requires two node parameters.");
        return;
      }

      const validIds = DEFAULT_NODES.map((n) => n.id);
      if (!validIds.includes(arg1) || !validIds.includes(arg2)) {
        setConsoleLogs((prev) => [
          ...prev,
          {
            id: outputLogId,
            type: "error",
            text: `Validation Error: Invalid node IDs [${arg1}, ${arg2}]. Valid node IDs are: ${validIds.join(", ")}`
          }
        ]);
        announceToScreenReader(`Validation error: node IDs must be chosen from ${validIds.join(", ")}.`);
        return;
      }

      if (arg1 === arg2) {
        setConsoleLogs((prev) => [
          ...prev,
          {
            id: outputLogId,
            type: "error",
            text: "Validation Error: Cannot connect a node to itself."
          }
        ]);
        announceToScreenReader("Validation error: Self connections are not allowed.");
        return;
      }

      // Check if connection already exists
      const alreadyExists = edges.some(
        (e) => (e.source === arg1 && e.target === arg2) || (e.source === arg2 && e.target === arg1)
      );
      if (alreadyExists) {
        setConsoleLogs((prev) => [
          ...prev,
          {
            id: outputLogId,
            type: "error",
            text: `Connection already exists between Node ${arg1} and Node ${arg2}.`
          }
        ]);
        announceToScreenReader(`Connection between Node ${arg1} and Node ${arg2} already exists.`);
        return;
      }

      // Add connection
      setEdges((prev) => [...prev, { source: arg1, target: arg2 }]);
      setConsoleLogs((prev) => [
        ...prev,
        {
          id: outputLogId,
          type: "success",
          text: `Success: Connection successfully established from Node ${arg1} to Node ${arg2}.`
        }
      ]);
      announceToScreenReader(`Connection established successfully: Node ${arg1} is now connected to Node ${arg2}.`);
      return;
    }

    if (op === "disconnect") {
      if (!arg1 || !arg2) {
        setConsoleLogs((prev) => [
          ...prev,
          {
            id: outputLogId,
            type: "error",
            text: "Syntax Error: 'disconnect' command requires source and target node IDs. Example: disconnect A C"
          }
        ]);
        announceToScreenReader("Syntax error: disconnect command requires two node parameters.");
        return;
      }

      const connectionIndex = edges.findIndex(
        (e) => (e.source === arg1 && e.target === arg2) || (e.source === arg2 && e.target === arg1)
      );

      if (connectionIndex === -1) {
        setConsoleLogs((prev) => [
          ...prev,
          {
            id: outputLogId,
            type: "error",
            text: `No connection found between Node ${arg1} and Node ${arg2}.`
          }
        ]);
        announceToScreenReader(`No connection exists between Node ${arg1} and Node ${arg2} to disconnect.`);
        return;
      }

      setEdges((prev) => prev.filter((_, idx) => idx !== connectionIndex));
      setConsoleLogs((prev) => [
        ...prev,
        {
          id: outputLogId,
          type: "success",
          text: `Success: Connection between Node ${arg1} and Node ${arg2} has been severed.`
        }
      ]);
      announceToScreenReader(`Connection removed: Node ${arg1} is no longer connected to Node ${arg2}.`);
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
            text: `Syntax Error: Unknown simulation type '${tokens[1]}'. Supported types: 'normal', 'loop'.`
          }
        ]);
        announceToScreenReader(`Syntax error: Unknown simulation type '${tokens[1]}'.`);
        return;
      }

      if (isSimulating) {
        setConsoleLogs((prev) => [
          ...prev,
          {
            id: outputLogId,
            type: "error",
            text: "Simulation Error: A tactic simulation is already active in the background."
          }
        ]);
        announceToScreenReader("A tactic simulation is already active.");
        return;
      }

      // Initialize state
      setIsSimulating(true);
      if (subOp === "normal") {
        setSimulationProgress({ step: 0, total: 10, log: "Initializing background tactic simulation..." });
        setConsoleLogs((prev) => [
          ...prev,
          {
            id: outputLogId,
            type: "info",
            text: "Starting standard tactic simulation on background thread..."
          }
        ]);
        announceToScreenReader("Starting standard tactic simulation on background thread.");
      } else {
        setSimulationProgress({ step: 0, total: 1, log: "Starting loop simulation (watchdog test)..." });
        setConsoleLogs((prev) => [
          ...prev,
          {
            id: outputLogId,
            type: "info",
            text: "Starting loop simulation on background thread. Watchdog timer armed (5s)..."
          }
        ]);
        announceToScreenReader("Starting loop simulation. Watchdog timer armed.");
      }

      // Arm watchdog timer for 5 seconds
      resetWatchdog();

      // Trigger simulation in the worker
      if (workerRef.current) {
        workerRef.current.postMessage({
          type: "START_SIMULATION",
          mode: subOp as "normal" | "loop"
        });
      } else {
        // Fallback in case worker is somehow uninitialized
        initWorker();
        setTimeout(() => {
          workerRef.current?.postMessage({
            type: "START_SIMULATION",
            mode: subOp as "normal" | "loop"
          });
        }, 50);
      }
      return;
    }

    // Command unrecognized
    setConsoleLogs((prev) => [
      ...prev,
      {
        id: outputLogId,
        type: "error",
        text: `Unrecognized command: '${tokens[0]}'. Type 'help' to review supported registry entries.`
      }
    ]);
    announceToScreenReader(`Command unrecognized: '${tokens[0]}'. Please try again or type help.`);
  };

  const suggestion = getSuggestion(consoleInput);

  // Keyboard Handlers inside Console Input
  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      runCommand(consoleInput);
    } else if (e.key === "Escape") {
      e.preventDefault();
      consoleInputRef.current?.blur();
      toggleBtnRef.current?.focus();
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

  // Proof verification status calculation
  const { isC_Proven, isE_Proven } = evaluateProofStatus(edges);

  return (
    <div className="bg-zinc-950 min-h-screen text-foreground overflow-hidden flex flex-col font-sans">
      {/* Screen reader ARIA live region for instant state broadcast */}
      <div aria-live="assertive" aria-atomic="true" className="sr-only">
        {liveAnnouncement}
      </div>

      <div className="flex-1 pt-24 pb-6 px-6 flex flex-col md:flex-row gap-6 relative max-w-7xl mx-auto w-full h-[calc(100vh-6rem)]">
        
        {/* Left Workspace Panel: Graphical Flow Canvas */}
        <div className="flex-1 flex flex-col border border-zinc-900 bg-zinc-950/40 rounded-3xl relative overflow-hidden backdrop-blur-md p-6 h-full min-h-[400px]">
          
          {/* Workspace Title bar */}
          <div className="flex justify-between items-center mb-6 border-b border-zinc-900 pb-4">
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-brand-cyan animate-pulse"></span>
                Logical Proof Canvas
              </h1>
              <p className="text-xs text-zinc-500 font-mono mt-0.5">
                Target: Prove Conclusion R (Node E) using interactive steps
              </p>
            </div>

            <button
              ref={toggleBtnRef}
              onClick={toggleConsole}
              aria-expanded={isConsoleOpen}
              aria-label={isConsoleOpen ? "Close interactive text console" : "Open interactive text console"}
              className="px-3.5 py-1.5 text-xs font-mono font-bold bg-zinc-900/50 border border-zinc-800 hover:border-brand-cyan/40 text-zinc-300 hover:text-brand-cyan rounded-xl transition-all cursor-pointer"
            >
              {isConsoleOpen ? "Hide Console (Ctrl+\\)" : "Show Console (Ctrl+\\)"}
            </button>
          </div>

          {/* Interactive visual canvas workspace */}
          <div 
            className="flex-1 relative bg-zinc-950 rounded-2xl border border-zinc-900/60 overflow-hidden"
            role="region"
            aria-label="Logic proof canvas editor. Keyboard users can use the command console on the right side to build edges."
          >
            {/* Simulation Progress Widget */}
            {isSimulating && simulationProgress && (
              <div className="absolute top-4 left-4 right-4 bg-zinc-950/95 border border-brand-cyan/30 rounded-xl p-4 flex flex-col gap-3 shadow-lg shadow-brand-cyan/5 z-20 animate-in fade-in slide-in-from-top-4 duration-300">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-brand-cyan animate-ping"></span>
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                      Background Tactic Simulation Running...
                    </h3>
                  </div>
                  <span className="text-[10px] font-mono text-zinc-500 bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800">
                    THREAD: WEB WORKER (60FPS UI SAFE)
                  </span>
                </div>
                
                {/* Progress bar */}
                <div className="w-full bg-zinc-900 h-2 rounded-full overflow-hidden border border-zinc-800">
                  <div 
                    className="bg-brand-cyan h-full rounded-full transition-all duration-300" 
                    style={{ width: `${(simulationProgress.step / simulationProgress.total) * 100}%` }}
                  />
                </div>

                <div className="flex justify-between items-center text-[10px] font-mono">
                  <span className="text-zinc-400 truncate max-w-[70%]">
                    {simulationProgress.log}
                  </span>
                  <span className="text-brand-cyan font-bold">
                    STEP {simulationProgress.step} / {simulationProgress.total}
                  </span>
                </div>
              </div>
            )}

            {/* SVG Connecting Edges Layer */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none select-none z-0">
              <defs>
                <marker
                  id="arrow"
                  viewBox="0 0 10 10"
                  refX="6"
                  refY="5"
                  markerWidth="6"
                  markerHeight="6"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 2 L 8 5 L 0 8 z" fill="#06b6d4" />
                </marker>
              </defs>

              {edges.map((edge, idx) => {
                const sNode = DEFAULT_NODES.find((n) => n.id === edge.source);
                const tNode = DEFAULT_NODES.find((n) => n.id === edge.target);
                if (!sNode || !tNode) return null;

                // Simple path calculation from source coordinates to target
                return (
                  <path
                    key={`edge-${idx}`}
                    d={`M ${sNode.x} ${sNode.y} L ${tNode.x} ${tNode.y}`}
                    stroke="#06b6d4"
                    strokeWidth="2.5"
                    strokeDasharray="4 4"
                    className="animate-[dash_10s_linear_infinite]"
                    markerEnd="url(#arrow)"
                  />
                );
              })}
            </svg>

            {/* Logical nodes visual layers */}
            {nodes.map((node) => {
              // Calculate connections for the accessible label
              const targets = edges.filter((e) => e.source === node.id).map((e) => e.target);
              const incoming = edges.filter((e) => e.target === node.id).map((e) => e.source);
              const connectionInfo = 
                (targets.length > 0 ? ` Connected to: ${targets.join(", ")}.` : "") +
                (incoming.length > 0 ? ` Receives input from: ${incoming.join(", ")}.` : "");

              // Determine status style
              let isNodeProven = true;
              if (node.id === "C") isNodeProven = isC_Proven;
              if (node.id === "E") isNodeProven = isE_Proven;

              return (
                <div
                  key={node.id}
                  style={{ left: `${node.x - 70}px`, top: `${node.y - 40}px` }}
                  className={`absolute w-[140px] px-3.5 py-3 rounded-2xl border bg-zinc-950/90 flex flex-col justify-center transition-all duration-350 z-10 select-none cursor-pointer focus-visible:ring-2 focus-visible:ring-brand-cyan focus-visible:outline-none ${
                    isNodeProven
                      ? "border-emerald-500/50 hover:border-emerald-400"
                      : "border-zinc-800 hover:border-brand-cyan/40"
                  }`}
                  tabIndex={0}
                  role="article"
                  aria-label={`Node ${node.id}: ${node.type}. Content is ${node.description}.${connectionInfo}`}
                >
                  <div className="flex justify-between items-center mb-1 select-none">
                    <span className="text-[10px] font-mono font-extrabold text-zinc-500 tracking-wider">
                      NODE {node.id}
                    </span>
                    <span className={`w-2 h-2 rounded-full ${
                      isNodeProven ? "bg-emerald-500" : "bg-zinc-700"
                    }`} />
                  </div>
                  <div className="text-sm font-extrabold text-white font-mono select-none">
                    {node.label}
                  </div>
                  <div className="text-[10px] text-zinc-500 truncate select-none mt-0.5">
                    {node.type}
                  </div>
                </div>
              );
            })}

            {/* Proof Status Widget */}
            <div className="absolute bottom-4 left-4 right-4 bg-zinc-950/80 border border-zinc-900 rounded-xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 select-none">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg flex items-center justify-center ${
                  isE_Proven ? "bg-emerald-950 text-emerald-400 border border-emerald-900" : "bg-zinc-900 text-zinc-500 border border-zinc-850"
                }`}>
                  {isE_Proven ? <IconCheck className="w-5 h-5" /> : <IconPlay className="w-5 h-5" />}
                </div>
                <div>
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                    Proof Completion Status
                  </h3>
                  <p className="text-[11px] text-zinc-500 mt-0.5">
                    {isE_Proven 
                      ? "Congratulations! The goal R has been successfully verified."
                      : isC_Proven 
                      ? "Step 1 complete (Q is proven). Now connect C and D to E to finish." 
                      : "Required: Connect premises A & B to C, then connect C & D to E."}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 text-[10px] font-mono">
                <span className="text-zinc-600">ACTIVE EDGES:</span>
                <span className="text-brand-cyan font-bold bg-brand-cyan/5 px-2.5 py-1 border border-brand-cyan/20 rounded-md">
                  {edges.length}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Split Panel: Accessible Command Terminal Console */}
        {isConsoleOpen && (
          <div 
            data-keyboard-boundary="true"
            className="w-full md:w-[420px] border border-zinc-900 bg-zinc-950/80 rounded-3xl overflow-hidden flex flex-col relative backdrop-blur-md h-full"
          >
            
            {/* Terminal Window Header */}
            <div className="border-b border-zinc-900/60 bg-zinc-950/90 px-5 py-4 flex justify-between items-center select-none">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
                <div className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
                <span className="text-[10px] font-mono font-bold text-zinc-500 tracking-wider ml-2 uppercase">
                  proof-engine // bash CLI
                </span>
              </div>
              <IconTerminal className="w-4 h-4 text-zinc-600" />
            </div>

            {/* Console Log view area */}
            <div 
              className="flex-1 p-5 font-mono text-[11px] leading-relaxed overflow-y-auto space-y-3.5 scrollbar-thin text-zinc-300"
              role="log"
              aria-label="Command history and terminal outputs"
            >
              {consoleLogs.map((log) => (
                <div key={log.id} className="space-y-1">
                  {log.type === "command" && (
                    <div className="flex items-center gap-2 text-zinc-400 font-bold select-none">
                      <span className="text-zinc-600 font-bold">~</span>
                      <span className="text-zinc-400 font-bold">proof-cli $</span>
                      <span className="text-zinc-100 font-bold select-text">{log.text}</span>
                    </div>
                  )}
                  {log.type === "info" && (
                    <div className="text-zinc-500 whitespace-pre-wrap leading-relaxed select-text">
                      {log.text}
                    </div>
                  )}
                  {log.type === "error" && (
                    <div className="text-red-400/90 font-semibold select-text">
                      ✖ {log.text}
                    </div>
                  )}
                  {log.type === "success" && (
                    <div className="text-emerald-400 font-semibold select-text">
                      ✔ {log.text}
                    </div>
                  )}
                  {log.type === "output" && (
                    <div className="text-zinc-300 whitespace-pre-wrap select-text leading-relaxed">
                      {log.text}
                    </div>
                  )}
                </div>
              ))}
              <div ref={terminalLogsEndRef} />
            </div>

            {/* Input prompt container with ghost text auto-complete */}
            <div className="border-t border-zinc-900/60 bg-zinc-950/60 px-5 py-4 flex flex-col gap-2">
              
              <div className="flex items-center gap-2 relative">
                <span className="text-zinc-600 font-bold font-mono text-[11px] select-none">~</span>
                <span className="text-zinc-400 font-bold font-mono text-[11px] select-none">proof-cli $</span>
                
                <div className="flex-1 relative flex items-center min-h-[1.5rem]">
                  {/* Ghost text for autocomplete preview */}
                  {suggestion && (
                    <div className="absolute inset-0 pointer-events-none font-mono text-[11px] text-zinc-700 flex items-center select-none z-0">
                      <span>{consoleInput}</span>
                      <span>{suggestion.substring(consoleInput.length)}</span>
                    </div>
                  )}
                  
                  <input
                    ref={consoleInputRef}
                    type="text"
                    value={consoleInput}
                    onChange={(e) => setConsoleInput(e.target.value)}
                    onKeyDown={handleInputKeyDown}
                    placeholder="Type commands to connect nodes..."
                    className="w-full bg-transparent border-none outline-none font-mono text-[11px] text-zinc-100 placeholder-zinc-700 caret-brand-cyan z-10 select-text"
                    autoCapitalize="off"
                    autoComplete="off"
                    autoCorrect="off"
                    spellCheck="false"
                    aria-label="Terminal command input"
                  />
                </div>

                <button
                  onClick={() => runCommand(consoleInput)}
                  disabled={!consoleInput.trim()}
                  className="p-1 text-zinc-600 hover:text-brand-cyan disabled:text-zinc-800 disabled:hover:text-zinc-800 transition-colors cursor-pointer"
                  title="Execute Command (Enter)"
                >
                  <IconCornerDownLeft className="w-4 h-4" />
                </button>
              </div>

              {/* Autocomplete helper suggestion notice */}
              {suggestion && (
                <div className="text-[10px] font-mono text-zinc-500 flex justify-between select-none px-6">
                  <span>Press <kbd className="bg-zinc-900 border border-zinc-800 px-1 rounded-md text-zinc-400 text-[9px]">TAB</kbd> to autocomplete</span>
                  <span>Suggestion: {suggestion}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
