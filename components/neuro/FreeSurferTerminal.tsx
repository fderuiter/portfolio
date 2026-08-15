"use client";

import React, { useState, useRef, useEffect } from "react";
import { TerminalLog } from "@/lib/neuro/types";
import { IconTerminal, IconCornerDownLeft, IconTrash } from "@tabler/icons-react";

interface FreeSurferTerminalProps {
  logs: TerminalLog[];
  onExecuteCommand: (cmd: string) => void;
  onClearLogs: () => void;
}

export const FreeSurferTerminal: React.FC<FreeSurferTerminalProps> = ({
  logs,
  onExecuteCommand,
  onClearLogs,
}) => {
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [historyIdx, setHistoryIdx] = useState(-1);
  const logContainerRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Auto-scroll logs to bottom on new message
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed) return;

    onExecuteCommand(trimmed);
    setHistory((prev) => [...prev, trimmed]);
    setHistoryIdx(-1);
    setInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowUp") {
      e.preventDefault();
      if (history.length > 0) {
        const nextIdx = historyIdx === -1 ? history.length - 1 : Math.max(0, historyIdx - 1);
        setHistoryIdx(nextIdx);
        setInput(history[nextIdx] || "");
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (historyIdx !== -1) {
        const nextIdx = historyIdx + 1;
        if (nextIdx < history.length) {
          setHistoryIdx(nextIdx);
          setInput(history[nextIdx]);
        } else {
          setHistoryIdx(-1);
          setInput("");
        }
      }
    }
  };

  const quickCommands = [
    "recon-all -autorecon2-cp",
    "freeview -f lh.pial:edgecolor=red",
    "stats",
    "euler",
    "help",
  ];

  return (
    <div className="bg-zinc-950 rounded-2xl border border-zinc-800/80 overflow-hidden flex flex-col h-[280px]">
      {/* Terminal Bar Header */}
      <div className="bg-zinc-900/90 border-b border-zinc-800 px-3 py-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <IconTerminal className="w-4 h-4 text-brand-cyan" />
          <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">
            FreeSurfer 7.4.1 CLI Terminal
          </span>
          <span className="text-[10px] font-mono text-zinc-400">
            [SUBJECT: sub-01 · ENVIRONMENT: Linux x86_64]
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Quick command buttons */}
          <div className="hidden md:flex items-center gap-1">
            {quickCommands.map((cmd) => (
              <button
                key={cmd}
                onClick={() => onExecuteCommand(cmd)}
                className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors border border-zinc-700"
              >
                {cmd}
              </button>
            ))}
          </div>

          <button
            onClick={onClearLogs}
            title="Clear terminal buffer"
            className="p-1 rounded text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <IconTrash className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Log Output Screen */}
      <div
        ref={logContainerRef}
        className="flex-1 p-3 overflow-y-auto font-mono text-xs space-y-1.5 scrollbar-thin scrollbar-thumb-zinc-800"
      >
        {logs.map((log) => (
          <div key={log.id} className="leading-relaxed flex items-start gap-2">
            <span className="text-zinc-400 select-none">[{log.timestamp}]</span>
            {log.type === "command" ? (
              <div className="flex items-center gap-1 text-brand-cyan font-bold">
                <span className="text-zinc-400 select-none">freesurfer@node-01:~$</span>
                <span>{log.text}</span>
              </div>
            ) : log.type === "success" ? (
              <span className="text-emerald-400">{log.text}</span>
            ) : log.type === "error" ? (
              <span className="text-rose-400">{log.text}</span>
            ) : log.type === "info" ? (
              <span className="text-amber-300">{log.text}</span>
            ) : (
              <span className="text-zinc-300 whitespace-pre-wrap">{log.text}</span>
            )}
          </div>
        ))}
      </div>

      {/* CLI Input Prompt */}
      <form
        onSubmit={handleSubmit}
        className="border-t border-zinc-800/80 bg-zinc-900/60 p-2 flex items-center gap-2"
      >
        <span className="text-xs font-mono text-brand-cyan select-none pl-1">
          freesurfer@node-01:~$
        </span>
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Enter FreeSurfer command (e.g. recon-all -autorecon2-cp, stats, help)..."
          className="flex-1 bg-transparent text-xs font-mono text-white placeholder-zinc-400 focus:outline-none"
        />
        <button
          type="submit"
          className="p-1 rounded text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
        >
          <IconCornerDownLeft className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
