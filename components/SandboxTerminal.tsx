"use client";

import React, { useState, useRef, useEffect } from "react";
import { hexToRgba } from "@/lib/utils";
import { designManifest } from "@/lib/design-manifest";
import { IconTerminal, IconCornerDownLeft, IconCircle } from "@tabler/icons-react";

interface LogItem {
  id: string;
  type: "command" | "output" | "error" | "info";
  text: string;
  jsonPayload?: unknown;
}

const COMMAND_REGISTRY: Record<string, { description: string; payload: unknown }> = {
  "imednet studies list": {
    description: "Retrieve a list of all active clinical trials from the iMednet EDC platform.",
    payload: [
      {
        studyID: "BRIGHT-01",
        name: "Phase III Pediatric Leukemia Study",
        status: "ACTIVE",
        subjectsCount: 142,
        version: "v4.2.1",
      },
      {
        studyID: "ONCO-2026",
        name: "Advanced Melanoma Immunotherapy Trial",
        status: "ENROLLING",
        subjectsCount: 89,
        version: "v1.0.8",
      },
      {
        studyID: "CARDIO-REF",
        name: "Congestive Heart Failure Observational Registry",
        status: "COMPLETED",
        subjectsCount: 310,
        version: "v2.5.0",
      }
    ],
  },
  "imednet subjects get --id 123": {
    description: "Query specific details and records for subject 123 (HIPAA-anonymized).",
    payload: {
      subjectID: "SUB-123",
      studyID: "BRIGHT-01",
      siteID: 401,
      enrollmentDate: "2025-11-12",
      status: "COMPLETED",
      recordsCount: 18,
      complianceScore: "98.4%",
      demographics: {
        age: 11,
        gender: "F",
        ethnicity: "ANONYMIZED_UNDER_HIPAA_SAFE_HARBOR",
      },
      lastVisit: "2026-05-10T14:30Z",
    },
  },
  "imednet records search --study BRIGHT-01": {
    description: "Search dynamic patient records and EDC form entries matching active trials.",
    payload: {
      studyID: "BRIGHT-01",
      totalRecordsMatched: 3,
      domain: "VS (Vital Signs)",
      results: [
        {
          subjectID: "SUB-101",
          visitName: "Week 4 Follow-up",
          heartRate: 72,
          tempCelsius: 36.8,
          systolicBP: 110,
          diastolicBP: 72,
          timestamp: "2026-05-20T08:30Z",
        },
        {
          subjectID: "SUB-102",
          visitName: "Week 4 Follow-up",
          heartRate: 84,
          tempCelsius: 37.1,
          systolicBP: 115,
          diastolicBP: 76,
          timestamp: "2026-05-20T09:15Z",
        },
        {
          subjectID: "SUB-103",
          visitName: "Week 4 Follow-up",
          heartRate: 68,
          tempCelsius: 36.6,
          systolicBP: 108,
          diastolicBP: 70,
          timestamp: "2026-05-20T10:00Z",
        }
      ],
    },
  },
};

// Pure ID Generator outside rendering pipeline to satisfy react-hooks/purity rules
let idCounter = 0;
function generateLogId(): string {
  idCounter += 1;
  return `log-entry-${idCounter}`;
}

export const SandboxTerminal: React.FC = () => {
  const [input, setInput] = useState("");
  const [logs, setLogs] = useState<LogItem[]>([
    {
      id: "init",
      type: "info",
      text: "iMednet Python SDK CLI Sandbox [Version 2.3.1]\nType 'help' to list available commands. Click the badges below for instant inputs.",
    },
  ]);
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [isExecuting, setIsExecuting] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Focus terminal input on body clicks
  const handleTerminalClick = () => {
    inputRef.current?.focus();
  };

  // Scroll to bottom when logs update
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  // Execute terminal commands
  const executeCommand = (cmdText: string) => {
    const trimmed = cmdText.trim();
    if (!trimmed) return;

    // Add command to output log
    const cmdId = generateLogId();
    setLogs((prev) => [...prev, { id: cmdId, type: "command", text: trimmed }]);
    setInput("");

    // Add to command history list
    setCommandHistory((prev) => {
      const filtered = prev.filter((c) => c !== trimmed);
      return [...filtered, trimmed];
    });
    setHistoryIndex(-1);
    setIsExecuting(true);

    // Simulated short response lag for realism
    setTimeout(() => {
      setIsExecuting(false);
      const outputId = generateLogId();

      if (trimmed === "clear") {
        setLogs([]);
        return;
      }

      if (trimmed === "help") {
        setLogs((prev) => [
          ...prev,
          {
            id: outputId,
            type: "info",
            text: `Available Curated Clinical EDC SDK Commands:\n\n` +
              `  imednet studies list                   -> List active clinical trials\n` +
              `  imednet subjects get --id 123          -> Retrieve patient demographics\n` +
              `  imednet records search --study BRIGHT-01 -> Search electronic vital records\n` +
              `  clear                                  -> Clear the terminal console\n` +
              `  help                                   -> View available command registry`,
          },
        ]);
        return;
      }

      const match = COMMAND_REGISTRY[trimmed];
      if (match) {
        setLogs((prev) => [
          ...prev,
          {
            id: outputId,
            type: "output",
            text: "",
            jsonPayload: match.payload,
          },
        ]);
      } else {
        setLogs((prev) => [
          ...prev,
          {
            id: outputId,
            type: "error",
            text: `Command not found: '${trimmed}'. Type 'help' to review supported registry entries.`,
          },
        ]);
      }
    }, 450);
  };

  // Handle key triggers (Enter, Up, Down, Tab)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      executeCommand(input);
    } else if (e.key === "Tab") {
      e.preventDefault();
      const trimmed = input.trim().toLowerCase();
      if (!trimmed) return;

      const VALID_COMMANDS = [
        "imednet studies list",
        "imednet subjects get --id 123",
        "imednet records search --study BRIGHT-01",
        "clear",
        "help"
      ];

      const matched = VALID_COMMANDS.find((c) => c.toLowerCase().startsWith(trimmed));
      if (matched) {
        setInput(matched);
      }
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (commandHistory.length === 0) return;
      const nextIndex = historyIndex === -1 ? commandHistory.length - 1 : Math.max(0, historyIndex - 1);
      setHistoryIndex(nextIndex);
      setInput(commandHistory[nextIndex]);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (historyIndex === -1) return;
      const nextIndex = historyIndex + 1;
      if (nextIndex >= commandHistory.length) {
        setHistoryIndex(-1);
        setInput("");
      } else {
        setHistoryIndex(nextIndex);
        setInput(commandHistory[nextIndex]);
      }
    }
  };

  // Beautiful token highlighting for JSON payloads
  const renderJsonPayload = (payload: unknown): React.ReactNode => {
    const str = JSON.stringify(payload, null, 2);
    
    const highlightValue = (valStr: string) => {
      const trimmed = valStr.trim();
      if (trimmed.startsWith('"')) {
        return <span className="text-emerald-400">{trimmed}</span>;
      }
      if (trimmed === "true" || trimmed === "false") {
        return <span className="text-amber-500 font-bold">{trimmed}</span>;
      }
      if (trimmed === "null") {
        return <span className="text-red-400 italic">{trimmed}</span>;
      }
      if (!isNaN(Number(trimmed.replace(/,$/, "")))) {
        return <span className="text-blue-400 font-medium">{trimmed}</span>;
      }
      return <span className="text-zinc-300">{valStr}</span>;
    };

    return (
      <pre className="font-mono text-[11px] leading-relaxed text-zinc-300 overflow-x-auto select-text pt-2">
        <code>
          {str.split("\n").map((line, idx) => {
            const keyRegex = /^(\s*)"([^"]+)":/;
            const keyMatch = line.match(keyRegex);
            if (keyMatch) {
              const spaces = keyMatch[1];
              const key = keyMatch[2];
              const rest = line.substring(keyMatch[0].length);
              return (
                <div key={idx} className="hover:bg-zinc-900/40 px-1 rounded transition-colors">
                  {spaces}
                  <span className="text-purple-400">&quot;{key}&quot;</span>:
                  {highlightValue(rest)}
                </div>
              );
            }
            return <div key={idx} className="px-1">{line}</div>;
          })}
        </code>
      </pre>
    );
  };

  return (
    <div className="w-full flex flex-col items-center">
      {/* Curved Command Badges Row */}
      <div className="flex flex-wrap gap-2 mb-4 w-full select-none">
        {Object.keys(COMMAND_REGISTRY).map((cmd) => (
          <button
            key={cmd}
            onClick={() => executeCommand(cmd)}
            disabled={isExecuting}
            className="px-3 py-1.5 text-[10px] font-mono font-bold bg-zinc-900/40 border border-zinc-900 hover:border-brand-cyan/40 text-brand-cyan/90 hover:text-brand-cyan rounded-xl transition-all hover:scale-[1.02] cursor-pointer"
          >
            {cmd}
          </button>
        ))}
      </div>

      {/* Terminal Main Window Frame */}
      <div
        onClick={handleTerminalClick}
        style={{ "--term-glow": `0 0 35px ${hexToRgba(designManifest.colors["brand-cyan"], 0.02)}` } as React.CSSProperties}
        className="w-full border border-zinc-900 bg-zinc-950/80 rounded-2xl overflow-hidden shadow-[var(--term-glow)] relative backdrop-blur-md cursor-text"
      >
        {/* Terminal Header */}
        <div className="border-b border-zinc-900/60 bg-zinc-950/90 px-4 py-3.5 flex justify-between items-center select-none">
          <div className="flex items-center gap-2">
            <IconCircle className="w-3 h-3 fill-red-500/80 stroke-none" />
            <IconCircle className="w-3 h-3 fill-yellow-500/80 stroke-none" />
            <IconCircle className="w-3 h-3 fill-green-500/80 stroke-none" />
            <span className="text-[10px] font-mono font-bold text-zinc-500 tracking-wider ml-2 uppercase">
              imednet-python-sdk // interactive CLI shell
            </span>
          </div>
          <IconTerminal className="w-4 h-4 text-zinc-600" />
        </div>

        {/* Console logs output viewport */}
        <div className="p-5 font-mono text-[11px] leading-relaxed max-h-[380px] overflow-y-auto space-y-4 text-zinc-300">
          {logs.map((log) => (
            <div key={log.id} className="space-y-1">
              {log.type === "command" && (
                <div className="flex items-center gap-2 text-zinc-400 font-bold select-none">
                  <span className="text-zinc-600 font-bold">~</span>
                  <span className="text-zinc-400 font-bold">imednet-sdk $</span>
                  <span className="text-zinc-100 font-bold select-text">{log.text}</span>
                </div>
              )}
              {log.type === "info" && (
                <div className="text-zinc-500 whitespace-pre-wrap leading-relaxed select-text">
                  {log.text}
                </div>
              )}
              {log.type === "error" && (
                <div className="text-red-400/90 font-medium select-text">
                  ✖ {log.text}
                </div>
              )}
              {log.type === "output" && log.jsonPayload !== undefined && (
                <div className="bg-zinc-950 border border-zinc-900/50 rounded-xl p-3.5 mt-1">
                  <div className="flex items-center justify-between border-b border-zinc-900 pb-2 mb-2 text-[9px] text-zinc-500 select-none">
                    <span>200 OK // TRANSACTION RETRUSTED</span>
                    <span>JSON PAYLOAD</span>
                  </div>
                  {renderJsonPayload(log.jsonPayload)}
                </div>
              )}
            </div>
          ))}

          {/* Loading execution state */}
          {isExecuting && (
            <div className="flex items-center gap-2 text-brand-cyan/80 font-bold italic select-none">
              <span className="animate-pulse">◌</span>
              <span>Executing clinical API query...</span>
            </div>
          )}

          {/* Auto-scroll target ref */}
          <div ref={scrollRef} />
        </div>

        {/* Live Input Field Prompt */}
        <div className="border-t border-zinc-900/60 bg-zinc-950/60 px-5 py-3.5 flex items-center gap-2">
          <span className="text-zinc-600 font-bold font-mono text-[11px] select-none">~</span>
          <span className="text-zinc-400 font-bold font-mono text-[11px] select-none">imednet-sdk $</span>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isExecuting}
            placeholder="Type 'help' or execute dynamic clinical queries..."
            className="flex-1 bg-transparent border-none outline-none font-mono text-[11px] text-zinc-100 placeholder-zinc-700 caret-brand-cyan select-text"
            autoCapitalize="off"
            autoComplete="off"
            autoCorrect="off"
            spellCheck="false"
          />
          <button
            onClick={() => executeCommand(input)}
            disabled={isExecuting || !input.trim()}
            className="p-1 text-zinc-600 hover:text-brand-cyan disabled:text-zinc-800 disabled:hover:text-zinc-800 transition-colors cursor-pointer"
            title="Execute Command (Enter)"
          >
            <IconCornerDownLeft className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
