"use client";

import React, { useState, useCallback, useSyncExternalStore } from "react";
import { PanInfo } from "framer-motion";
import { useAudio } from "@/components/providers/AudioProvider";
import { puzzleLevels } from "@/lib/quasi-perfect/levels";
import { tacticDefs } from "@/lib/quasi-perfect/tactics";
import {
  ASTNode,
  CompilerLogEntry,
  GameProgressState,
  LevelScore,
  PuzzlerLevelDef,
} from "@/lib/quasi-perfect/types";
import { cloneAST, findNodeById, isProofComplete } from "@/lib/quasi-perfect/engine";
import { ExpressionTree } from "./ExpressionTree";
import { TacticHand } from "./TacticHand";
import { RAMGauge } from "./RAMGauge";
import { TerminalLog } from "./TerminalLog";
import { VictoryModal } from "./VictoryModal";

const STORAGE_KEY = "quasi_perfect_puzzler_progress_v1";

// SSR-Safe localStorage sync subscriber
function subscribeProgress(callback: () => void) {
  if (typeof window === "undefined") return () => {};
  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
}

function getProgressSnapshot(): string {
  if (typeof window === "undefined") return "{}";
  try {
    return localStorage.getItem(STORAGE_KEY) || "{}";
  } catch {
    return "{}";
  }
}

function getProgressServerSnapshot(): string {
  return "{}";
}

interface StepHistory {
  goalAST: ASTNode;
  ram: number;
  logText: string;
}

export const QuasiPerfectPuzzler: React.FC = () => {
  const { playNote, playSuccess } = useAudio();

  const [currentLevelIndex, setCurrentLevelIndex] = useState<number>(0);
  const currentLevel: PuzzlerLevelDef = puzzleLevels[currentLevelIndex] || puzzleLevels[0];

  const [goalAST, setGoalAST] = useState<ASTNode>(() => cloneAST(currentLevel.goal));
  const [currentRam, setCurrentRam] = useState<number>(currentLevel.initialRam);
  const [history, setHistory] = useState<StepHistory[]>([]);
  const [redoHistory, setRedoHistory] = useState<StepHistory[]>([]);

  const [selectedTacticIndex, setSelectedTacticIndex] = useState<number | null>(null);
  const [selectedTargetId, setSelectedTargetId] = useState<string | null>(null);
  const [hoveredTargetId, setHoveredTargetId] = useState<string | null>(null);

  const [levelSolved, setLevelSolved] = useState<boolean>(false);
  const [currentScore, setCurrentScore] = useState<LevelScore | null>(null);

  const [logs, setLogs] = useState<CompilerLogEntry[]>(() => [
    {
      id: "init-1",
      timestamp: "00:00:01",
      type: "info",
      text: `Lean 4 server initialized. Loaded ${currentLevel.title}.`,
    },
  ]);

  // SSR-Safe progress state
  const rawProgress = useSyncExternalStore(
    subscribeProgress,
    getProgressSnapshot,
    getProgressServerSnapshot
  );

  const parsedProgress: GameProgressState = React.useMemo(() => {
    try {
      return JSON.parse(rawProgress) as GameProgressState;
    } catch {
      return { completedLevels: {}, currentLevelIndex: 0 };
    }
  }, [rawProgress]);

  const saveProgress = useCallback((score: LevelScore) => {
    if (typeof window === "undefined") return;
    try {
      const existing: GameProgressState = JSON.parse(
        localStorage.getItem(STORAGE_KEY) || "{}"
      );
      const updated: GameProgressState = {
        currentLevelIndex: existing.currentLevelIndex || 0,
        completedLevels: {
          ...(existing.completedLevels || {}),
          [score.levelId]: score,
        },
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      window.dispatchEvent(new Event("storage"));
    } catch {
      // Storage unavailable or disabled
    }
  }, []);

  const addLog = useCallback(
    (text: string, type: "info" | "success" | "warning" | "error" = "info") => {
      const entry: CompilerLogEntry = {
        id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        timestamp: new Date().toLocaleTimeString("en-US", { hour12: false }),
        type,
        text,
      };
      setLogs((prev) => [...prev, entry]);
    },
    []
  );

  const loadLevel = useCallback(
    (index: number) => {
      const targetLvl = puzzleLevels[index] || puzzleLevels[0];
      setCurrentLevelIndex(index);
      setGoalAST(cloneAST(targetLvl.goal));
      setCurrentRam(targetLvl.initialRam);
      setHistory([]);
      setRedoHistory([]);
      setSelectedTacticIndex(null);
      setSelectedTargetId(null);
      setHoveredTargetId(null);
      setLevelSolved(false);
      setCurrentScore(null);
      setLogs([
        {
          id: `lvl-${targetLvl.id}-${Date.now()}`,
          timestamp: new Date().toLocaleTimeString("en-US", { hour12: false }),
          type: "info",
          text: `Loaded [${targetLvl.subtitle}]: ${targetLvl.title}. RAM: ${targetLvl.initialRam} GB.`,
        },
      ]);
    },
    []
  );

  // Execute a tactic on a given target AST node
  const executeTacticOnNode = useCallback(
    (tacticIdx: number, targetNodeId: string | null) => {
      if (levelSolved) return;

      const tacticItem = currentLevel.availableTactics[tacticIdx];
      if (!tacticItem) return;

      const tacticId = typeof tacticItem === "string" ? tacticItem : tacticItem.id;
      const hypothesisArg = typeof tacticItem === "object" ? tacticItem.hypothesis : undefined;
      const tactic = tacticDefs[tacticId];

      if (!tactic) return;

      // Check RAM availability
      if (currentRam < tactic.baseRamCost && tactic.id !== "sorry") {
        addLog(
          `FATAL ERROR: Insufficient RAM for tactic '${tactic.name}'. Required: ${tactic.baseRamCost} GB, Available: ${currentRam.toFixed(1)} GB.`,
          "error"
        );
        playNote(130.81, 0.2); // Error buzz
        return;
      }

      // Resolve target node (or fallback to root goal)
      const targetNode = targetNodeId
        ? findNodeById(goalAST, targetNodeId) || goalAST
        : goalAST;

      // Execute tactic reducer
      const result = tactic.execute(
        targetNode,
        goalAST,
        currentLevel.hypotheses,
        hypothesisArg
      );

      if (result.success && result.newAST) {
        // Successful step
        const nextRam = Math.max(0, currentRam - result.ramConsumed);
        setHistory((prev) => [
          ...prev,
          { goalAST: cloneAST(goalAST), ram: currentRam, logText: result.message },
        ]);
        setRedoHistory([]);
        setGoalAST(result.newAST);
        setCurrentRam(nextRam);
        setSelectedTacticIndex(null);
        setSelectedTargetId(null);
        addLog(result.message, tactic.id === "sorry" ? "warning" : "success");

        // Play feedback sounds
        if (tactic.id === "sorry") {
          playNote(329.63, 0.15);
          setTimeout(() => playNote(220, 0.3), 120);
        } else {
          playNote(659.25, 0.08);
          setTimeout(() => playNote(880, 0.1), 70);
        }

        // Check level win condition
        const isComplete = result.isProofComplete || isProofComplete(result.newAST);
        if (isComplete) {
          setLevelSolved(true);
          const usedSorry =
            tactic.id === "sorry" || !!result.newAST.metadata?.provedViaSorry;

          let stars = 1;
          if (!usedSorry) {
            if (nextRam >= currentLevel.goldRamTarget) stars = 3;
            else if (nextRam >= currentLevel.silverRamTarget) stars = 2;
          } else {
            stars = 0;
          }

          const score: LevelScore = {
            levelId: currentLevel.id,
            completed: true,
            usedSorry,
            remainingRam: nextRam,
            stars,
            morality: usedSorry ? -100 : 100,
            timestamp: Date.now(),
          };

          setCurrentScore(score);
          saveProgress(score);

          if (!usedSorry) {
            playSuccess();
            addLog(`✔ Q.E.D. Goal closed! Theorem verified in ${nextRam.toFixed(1)} GB.`, "success");
          } else {
            addLog("▲ Goal admitted via 'sorry'. Morality Penalty: -100 applied.", "warning");
          }
        }
      } else {
        // Failed step: deduct failure penalty
        const nextRam = Math.max(0, currentRam - result.ramConsumed);
        setCurrentRam(nextRam);
        addLog(result.message, "error");
        playNote(130.81, 0.2); // Low error buzz

        if (nextRam <= 0) {
          addLog("FATAL ERROR: Lean Language Server crashed (OOM). Garbage collector forsaken.", "error");
          playNote(98, 0.4); // Crash rumble
        }
      }
    },
    [
      levelSolved,
      currentLevel,
      currentRam,
      goalAST,
      addLog,
      playNote,
      playSuccess,
      saveProgress,
    ]
  );

  // Drag-and-drop collision detection
  const handleCardDragEnd = useCallback(
    (tacticIdx: number, event: MouseEvent | TouchEvent | PointerEvent, _info: PanInfo) => {
      const clientX = "clientX" in event ? event.clientX : (event as TouchEvent).changedTouches?.[0]?.clientX;
      const clientY = "clientY" in event ? event.clientY : (event as TouchEvent).changedTouches?.[0]?.clientY;

      if (typeof clientX === "number" && typeof clientY === "number") {
        const elementsUnderPoint = document.elementsFromPoint(clientX, clientY);
        let targetNodeId: string | null = null;

        for (const el of elementsUnderPoint) {
          const nodeId = el.getAttribute("data-node-id") || el.closest("[data-node-id]")?.getAttribute("data-node-id");
          if (nodeId) {
            targetNodeId = nodeId;
            break;
          }
        }

        executeTacticOnNode(tacticIdx, targetNodeId);
      }
      setHoveredTargetId(null);
    },
    [executeTacticOnNode]
  );

  // Node selection / tap handler
  const handleSelectTarget = useCallback(
    (nodeId: string) => {
      playNote(440, 0.05);
      if (selectedTacticIndex !== null) {
        // If card was already selected, execute immediately on this tapped node
        executeTacticOnNode(selectedTacticIndex, nodeId);
      } else {
        // Otherwise toggle selection of this node
        setSelectedTargetId((prev) => (prev === nodeId ? null : nodeId));
      }
    },
    [selectedTacticIndex, executeTacticOnNode, playNote]
  );

  // Card selection / tap handler
  const handleSelectTactic = useCallback(
    (tacticIdx: number) => {
      playNote(523.25, 0.05);
      if (selectedTargetId !== null) {
        // If node was already selected, execute immediately with this card
        executeTacticOnNode(tacticIdx, selectedTargetId);
      } else {
        // Otherwise toggle selection of this card
        setSelectedTacticIndex((prev) => (prev === tacticIdx ? null : tacticIdx));
      }
    },
    [selectedTargetId, executeTacticOnNode, playNote]
  );

  // Undo step
  const handleUndo = useCallback(() => {
    if (history.length === 0) return;
    const last = history[history.length - 1];
    setRedoHistory((prev) => [
      ...prev,
      { goalAST: cloneAST(goalAST), ram: currentRam, logText: "Undo" },
    ]);
    setGoalAST(cloneAST(last.goalAST));
    setCurrentRam(last.ram);
    setHistory((prev) => prev.slice(0, -1));
    setLevelSolved(false);
    setCurrentScore(null);
    addLog("Reverted last tactic step via undo.", "info");
    playNote(392, 0.05);
  }, [history, goalAST, currentRam, addLog, playNote]);

  // Redo step
  const handleRedo = useCallback(() => {
    if (redoHistory.length === 0) return;
    const next = redoHistory[redoHistory.length - 1];
    setHistory((prev) => [
      ...prev,
      { goalAST: cloneAST(goalAST), ram: currentRam, logText: "Redo" },
    ]);
    setGoalAST(cloneAST(next.goalAST));
    setCurrentRam(next.ram);
    setRedoHistory((prev) => prev.slice(0, -1));
    addLog("Restored tactic step via redo.", "info");
    playNote(493.88, 0.05);
  }, [redoHistory, goalAST, currentRam, addLog, playNote]);

  // Reset current level
  const handleResetLevel = useCallback(() => {
    loadLevel(currentLevelIndex);
    playNote(261.63, 0.1);
  }, [loadLevel, currentLevelIndex, playNote]);

  const isOOM = currentRam <= 0 && !levelSolved;

  return (
    <section
      aria-labelledby="quasi-puzzler-heading"
      className="relative rounded-2xl border border-brand-cyan/30 bg-zinc-950/90 p-5 font-mono shadow-[0_0_35px_-10px_rgba(6,182,212,0.35)]"
    >
      {/* 1. Header & Level Picker */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-brand-cyan">
              Formal Methods Arcade · Lean 4 Simulator
            </span>
            <span className="rounded-full bg-cyan-500/10 border border-cyan-500/30 px-2 py-0.2 text-[9px] font-semibold text-cyan-300">
              Interactive AST
            </span>
          </div>
          <h2 id="quasi-puzzler-heading" className="mt-1 text-2xl font-bold text-zinc-100">
            Quasi-Perfect Puzzler
          </h2>
        </div>

        {/* Level Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-1.5">
          {puzzleLevels.map((lvl, idx) => {
            const isCurrent = idx === currentLevelIndex;
            const lvlProgress = parsedProgress.completedLevels?.[lvl.id];
            return (
              <button
                key={lvl.id}
                type="button"
                onClick={() => loadLevel(idx)}
                className={`rounded-lg px-2.5 py-1 text-xs font-bold transition-colors ${
                  isCurrent
                    ? "bg-brand-cyan text-black shadow-[0_0_10px_rgba(6,182,212,0.5)]"
                    : lvlProgress?.completed
                    ? "bg-zinc-800 text-emerald-300 hover:bg-zinc-700"
                    : "bg-zinc-900 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200"
                }`}
              >
                L{lvl.id}
                {lvlProgress?.completed && !lvlProgress.usedSorry && (
                  <span className="ml-1 text-[10px] text-amber-400">★</span>
                )}
                {lvlProgress?.usedSorry && (
                  <span className="ml-1 text-[10px] text-rose-400">⚠</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Level Header & Actions */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 bg-zinc-900/40 border border-zinc-850 rounded-xl p-3.5">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-brand-cyan">
            {currentLevel.subtitle}
          </span>
          <h3 className="text-base font-bold text-zinc-100">{currentLevel.title}</h3>
          <p className="mt-0.5 text-xs text-zinc-400 max-w-xl">{currentLevel.description}</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleUndo}
            disabled={history.length === 0 || levelSolved}
            className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-xs font-bold text-zinc-300 hover:bg-zinc-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            ↶ Undo
          </button>
          <button
            type="button"
            onClick={handleRedo}
            disabled={redoHistory.length === 0 || levelSolved}
            className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-xs font-bold text-zinc-300 hover:bg-zinc-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            ↷ Redo
          </button>
          <button
            type="button"
            onClick={handleResetLevel}
            className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-xs font-bold text-zinc-300 hover:bg-zinc-800 transition-colors"
          >
            ↺ Reset
          </button>
        </div>
      </div>

      {/* 3. Lean Server RAM Gauge */}
      <div className="mt-4">
        <RAMGauge currentRam={currentRam} initialRam={currentLevel.initialRam} />
      </div>

      {/* 4. OOM Server Crash Alert */}
      {isOOM && (
        <div className="mt-4 rounded-xl border border-rose-500/50 bg-rose-950/40 p-4 text-center">
          <p className="text-sm font-bold text-rose-300">
            💥 FATAL ERROR: Lean Language Server Crashed (OOM)
          </p>
          <p className="mt-1 text-xs text-zinc-400">
            Available RAM was completely exhausted before closing the goal.
          </p>
          <button
            type="button"
            onClick={handleResetLevel}
            className="mt-3 rounded-lg bg-rose-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-rose-500 transition-colors"
          >
            Reboot Server & Retry Level
          </button>
        </div>
      )}

      {/* 5. Main Proof Expression Tree Canvas */}
      <div className="mt-4">
        <ExpressionTree
          goalAST={goalAST}
          hypotheses={currentLevel.hypotheses}
          selectedTargetId={selectedTargetId}
          hoveredTargetId={hoveredTargetId}
          onSelectTarget={handleSelectTarget}
          onHoverTarget={setHoveredTargetId}
          isProofComplete={levelSolved}
        />
      </div>

      {/* 6. Tactic Hand */}
      <div className="mt-4">
        <TacticHand
          availableTactics={currentLevel.availableTactics}
          currentRam={currentRam}
          selectedTacticIndex={selectedTacticIndex}
          onSelectTactic={handleSelectTactic}
          onCardDragStart={(idx) => {
            setSelectedTacticIndex(idx);
            playNote(523.25, 0.03);
          }}
          onCardDragEnd={handleCardDragEnd}
          isProofComplete={levelSolved}
        />
      </div>

      {/* 7. Diagnostic Terminal Log */}
      <div className="mt-4">
        <TerminalLog logs={logs} />
      </div>

      {/* 8. Victory / Morality Modal */}
      {levelSolved && currentScore && (
        <VictoryModal
          score={currentScore}
          totalLevels={puzzleLevels.length}
          currentLevelIndex={currentLevelIndex}
          onNextLevel={() => {
            if (currentLevelIndex < puzzleLevels.length - 1) {
              loadLevel(currentLevelIndex + 1);
            }
          }}
          onRestartLevel={handleResetLevel}
        />
      )}
    </section>
  );
};
