"use client";

import React, { useState, useRef, useEffect } from "react";
import { hexToRgba } from "@/lib/utils";
import { designManifest } from "@/lib/design-manifest";
import { IconTerminal, IconCornerDownLeft, IconCircle } from "@tabler/icons-react";
import { usePersistentState } from "@/hooks/usePersistentState";
import { useAnnouncer } from "@/components/providers/A11yProvider";
import { useAudio } from "@/components/providers/AudioProvider";

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
      complianceScore: "[VERIFY_SECURITY_LOGS]",
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
  const { announce } = useAnnouncer();
  const { playKeystroke, playAutocomplete, playSuccess } = useAudio();
  const [input, setInput] = useState("");
  const [logs, setLogs] = useState<LogItem[]>([
    {
      id: "init",
      type: "info",
      text: "iMednet Python SDK CLI Sandbox [Version 2.3.1]\nType 'help' to list available commands. Click the badges below for instant inputs.",
    },
  ]);
  const [commandHistory, setCommandHistory] = usePersistentState<string[]>("sandbox_terminal_history", []);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [isExecuting, setIsExecuting] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const logsContainerRef = useRef<HTMLDivElement>(null);

  // Focus terminal input on body clicks without shifting viewport
  const handleTerminalClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const selection = window.getSelection();
    if (selection && selection.toString()) {
      return;
    }
    if ((e.target as HTMLElement).closest("a, button, input")) {
      return;
    }
    inputRef.current?.focus({ preventScroll: true });
  };

  // Scroll to bottom internally when logs update
  useEffect(() => {
    if (logsContainerRef.current) {
      logsContainerRef.current.scrollTop = logsContainerRef.current.scrollHeight;
    }
  }, [logs]);

  // Execute terminal commands
  const executeCommand = React.useCallback((cmdText: string) => {
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
    announce("Command execution started", "polite");

    // Simulated short response lag for realism
    setTimeout(() => {
      setIsExecuting(false);
      const outputId = generateLogId();

      if (trimmed === "clear") {
        setLogs([]);
        announce("Console cleared", "polite");
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
        announce("Help menu loaded displaying available SDK commands.", "polite");
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
        playSuccess();
        if (trimmed === "imednet studies list") {
          announce("Command execution completed. Returned active clinical trials: BRIGHT-01, ONCO-2026, and CARDIO-REF.", "polite");
        } else if (trimmed === "imednet subjects get --id 123") {
          announce("Command execution completed. Returned clinical records and HIPAA-anonymized demographics for subject 123.", "polite");
        } else if (trimmed === "imednet records search --study BRIGHT-01") {
          announce("Command execution completed. Returned 3 vital sign records matching study BRIGHT-01.", "polite");
        } else {
          announce("Command execution completed. Standard JSON payload results rendered.", "polite");
        }
      } else {
        setLogs((prev) => [
          ...prev,
          {
            id: outputId,
            type: "error",
            text: `Command not found: '${trimmed}'. Type 'help' to review supported registry entries.`,
          },
        ]);
        announce(`Command execution failed. Unknown command: '${trimmed}'.`, "polite");
      }
    }, 450);
  }, [setCommandHistory, setHistoryIndex, setIsExecuting, setInput, setLogs, announce, playSuccess]);

  // Typing animation state/ref
  const typingTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Setup/Teardown interactive console API and custom greeting log
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Strict constraint check: Only enable this on the specific SDK case study page
    if (!window.location.pathname.includes("/case-studies/imednet-python-sdk")) {
      return;
    }

    const terminalApi = {
      run: (cmdText: string) => {
        if (typeof cmdText !== "string") {
          console.error("terminal.run: command must be a string.");
          return;
        }
        // Safely dispatch custom event to update the terminal UI asynchronously without triggering full-page react hydration cycles
        window.dispatchEvent(new CustomEvent("terminal:run", { detail: { command: cmdText } }));
      },
      help: () => {
        console.log(
          "Supported API commands:\n" +
          "  imednet.run('imednet studies list')\n" +
          "  imednet.run('imednet subjects get --id 123')\n" +
          "  imednet.run('imednet records search --study BRIGHT-01')\n" +
          "  imednet.run('help')\n" +
          "  imednet.run('clear')"
        );
      }
    };

    const anyWindow = window as any; // eslint-disable-line @typescript-eslint/no-explicit-any
    anyWindow.terminal = terminalApi;
    anyWindow.imednet = terminalApi;

    // Interactive custom styled greeting in console
    console.log(
      `%c╔══════════════════════════════════════════════════════════════════════════╗\n` +
      `║               iMednet SDK Developer Console Sandbox                      ║\n` +
      `╚══════════════════════════════════════════════════════════════════════════╝\n` +
      `Welcome, developer! You've unlocked the interactive CLI simulator console API.\n` +
      `Try programmatically controlling the on-page terminal bento-card from here!\n\n` +
      `Run this function to query the simulated SDK API directly:\n` +
      `  %cimednet.run("imednet studies list")%c\n\n` +
      `Supported Commands:\n` +
      `  • imednet.run("imednet studies list")\n` +
      `  • imednet.run("imednet subjects get --id 123")\n` +
      `  • imednet.run("imednet records search --study BRIGHT-01")\n` +
      `  • imednet.run("help")\n` +
      `  • imednet.run("clear")`,
      "color: #06b6d4; font-weight: bold;",
      "color: #10b981; font-weight: bold; background: #18181b; padding: 2px 4px; border-radius: 4px;",
      "color: inherit;"
    );

    return () => {
      // Clean up global namespace completely on unmount (prevent leakage to other pages)
      delete anyWindow.terminal;
      delete anyWindow.imednet;
    };
  }, []);

  // Handle incoming terminal:run custom events
  useEffect(() => {
    const handleRunEvent = (e: Event) => {
      const customEvent = e as CustomEvent<{ command: string }>;
      if (!customEvent.detail || typeof customEvent.detail.command !== "string") return;

      const command = customEvent.detail.command;

      // Cancel any ongoing typing animation
      if (typingTimerRef.current) {
        clearInterval(typingTimerRef.current);
        typingTimerRef.current = null;
      }

      if (isExecuting) {
        console.warn("Terminal is currently executing a command. Please wait.");
        return;
      }

      // Clear input state and focus element without shifting viewport
      setInput("");
      inputRef.current?.focus({ preventScroll: true });

      let currentIndex = 0;
      let currentTyped = "";

      // Performance Isolation: Simulate typing asynchronously using non-blocking setInterval
      typingTimerRef.current = setInterval(() => {
        if (currentIndex < command.length) {
          const char = command[currentIndex];
          currentTyped += char;
          setInput(currentTyped);
          playKeystroke(char.charCodeAt(0));

          // Translate into simulated keystroke events inside the terminal interface
          const inputEl = inputRef.current;
          if (inputEl) {
            const keyEventInit = { key: char, bubbles: true, cancelable: true };
            inputEl.dispatchEvent(new KeyboardEvent("keydown", keyEventInit));
            inputEl.dispatchEvent(new KeyboardEvent("keypress", keyEventInit));
            inputEl.dispatchEvent(new Event("input", { bubbles: true }));
            inputEl.dispatchEvent(new KeyboardEvent("keyup", keyEventInit));
          }

          currentIndex++;
        } else {
          // Done typing! Clear interval and execute the command
          if (typingTimerRef.current) {
            clearInterval(typingTimerRef.current);
            typingTimerRef.current = null;
          }

          // Delay execution slightly to feel natural (keystroke evaluation delay)
          setTimeout(() => {
            executeCommand(command);
          }, 100);
        }
      }, 40); // 40ms typing speed
    };

    window.addEventListener("terminal:run", handleRunEvent);

    return () => {
      window.removeEventListener("terminal:run", handleRunEvent);
      if (typingTimerRef.current) {
        clearInterval(typingTimerRef.current);
      }
    };
  }, [isExecuting, executeCommand, playKeystroke]);

  // Handle key triggers (Enter, Up, Down, Tab, Escape)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key.length === 1) {
      playKeystroke(e.key.charCodeAt(0));
    }

    if (e.key === "Enter") {
      executeCommand(input);
    } else if (e.key === "Tab") {
      const trimmed = input.trim().toLowerCase();
      if (trimmed) {
        const VALID_COMMANDS = [
          "imednet studies list",
          "imednet subjects get --id 123",
          "imednet records search --study BRIGHT-01",
          "clear",
          "help"
        ];

        const matched = VALID_COMMANDS.find((c) => c.toLowerCase().startsWith(trimmed));
        if (matched) {
          e.preventDefault();
          setInput(matched);
          playAutocomplete();
        }
      }
    } else if (e.key === "Escape") {
      inputRef.current?.blur();
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
      if (trimmed === '"[VERIFY_SECURITY_LOGS]"') {
        return (
          <a
            href="/proof"
            className="text-brand-cyan underline font-bold cursor-pointer hover:text-brand-cyan/80 focus:outline-none focus:ring-2 focus:ring-brand-cyan/50 focus:ring-offset-1 focus:ring-offset-zinc-950 rounded"
          >
            [LIVE_VERIFICATION_LINK]
          </a>
        );
      }
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
            className="px-3 py-1.5 text-[10px] font-mono font-bold bg-zinc-900/40 border border-zinc-900 hover:border-brand-cyan/40 text-brand-cyan/90 hover:text-brand-cyan rounded-xl transition-all duration-200 hover:scale-[1.02] active:scale-95 hover:bg-brand-cyan/5 hover:shadow-[0_0_12px_rgba(6,182,212,0.15)] cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand-cyan/50 focus:ring-offset-1 focus:ring-offset-zinc-950"
          >
            {cmd}
          </button>
        ))}
      </div>

      {/* Terminal Main Window Frame */}
      <div
        role="region"
        aria-label="Interactive Terminal Sandbox"
        aria-busy={isExecuting}
        onClick={handleTerminalClick}
        style={{ "--term-glow": `0 0 35px ${hexToRgba(designManifest.colors["brand-cyan"], 0.02)}` } as React.CSSProperties}
        className="w-full border border-zinc-900 focus-within:border-brand-cyan/40 bg-zinc-950/80 rounded-2xl overflow-hidden shadow-[var(--term-glow)] focus-within:shadow-[0_0_40px_rgba(6,182,212,0.08),0_0_80px_rgba(6,182,212,0.02)] relative backdrop-blur-md cursor-text transition-all duration-300"
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
        <div
          ref={logsContainerRef}
          role="log"
          aria-label="Terminal output log"
          className="p-5 font-mono text-[11px] leading-relaxed max-h-[380px] overflow-y-auto space-y-4 text-zinc-300"
        >
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
            className="p-1.5 text-zinc-600 hover:text-brand-cyan hover:bg-brand-cyan/10 active:scale-90 disabled:text-zinc-800 disabled:hover:text-zinc-800 disabled:hover:bg-transparent transition-all rounded-lg cursor-pointer focus:outline-none focus:text-brand-cyan focus:ring-2 focus:ring-brand-cyan/50 focus:ring-offset-1 focus:ring-offset-zinc-950"
            title="Execute Command (Enter)"
          >
            <IconCornerDownLeft className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
