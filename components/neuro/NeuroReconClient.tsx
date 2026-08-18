"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useClipboard } from "@/hooks/useClipboard";
import {
  ControlPoint,
  DatasetSource,
  QAMetrics,
  ScenarioId,
  ScoreState,
  SurfaceMode,
  TerminalLog,
  ToolMode,
  VoxelCoord,
  VoxelEdit,
} from "@/lib/neuro/types";
import { SCENARIOS, SCENARIO_LIST, DATASET_CONFIGS } from "@/lib/neuro/scenarios";
import { generateSyntheticVolume, SyntheticVolume, VOLUME_SIZE } from "@/lib/neuro/volume-generator";
import { evaluateQAMetrics } from "@/lib/neuro/qa-engine";
import { MultiPlanarSliceViewer } from "./MultiPlanarSliceViewer";
import dynamic from "next/dynamic";

const Brain3DViewerSkeleton: React.FC = () => {
  return (
    <div 
      className="relative w-full h-[460px] bg-zinc-950 rounded-2xl border border-zinc-800/80 overflow-hidden flex flex-col justify-between p-4 select-none animate-pulse"
      data-testid="brain-3d-skeleton"
    >
      {/* Skeleton Header */}
      <div className="flex items-center gap-2 bg-zinc-900/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-zinc-800 text-xs font-mono w-max">
        <div className="w-1.5 h-1.5 rounded-full bg-brand-cyan/60 animate-ping" />
        <span className="font-semibold text-zinc-400 uppercase tracking-wider">
          Initializing 3D Engine...
        </span>
      </div>

      {/* Skeleton Center pulsing graphic */}
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
        <div className="relative">
          <div className="absolute -inset-4 rounded-full bg-brand-cyan/5 blur-xl animate-pulse" />
          <Icon3dCubeSphere className="w-16 h-16 text-brand-cyan/40 animate-pulse relative z-10" />
        </div>
        <div className="text-center space-y-1 relative z-10">
          <p className="text-sm font-bold font-mono text-zinc-300">
            NeuroRecon 3D Viewer
          </p>
          <p className="text-[11px] font-mono text-brand-cyan/60">
            Loading heavy WebGL visualizer and 3D brain mesh...
          </p>
        </div>
      </div>

      {/* Skeleton Footer */}
      <div className="flex items-center justify-between text-xs font-mono text-zinc-500 bg-zinc-900/40 backdrop-blur-md px-3 py-1.5 rounded-xl border border-zinc-800/60 w-full mt-auto">
        <span>PREPARING T1 MESH BUFFER</span>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-brand-cyan/30 animate-pulse" />
          <span className="text-[10px]">STANDBY</span>
        </div>
      </div>
    </div>
  );
};

const Brain3DViewer = dynamic(
  () => import("./Brain3DViewer").then((mod) => mod.Brain3DViewer),
  {
    ssr: false,
    loading: () => <Brain3DViewerSkeleton />,
  }
);
import { NeuroToolbar } from "./NeuroToolbar";
import { NeuroMetricsPanel } from "./NeuroMetricsPanel";
import { FreeSurferTerminal } from "./FreeSurferTerminal";
import { NeuroFieldManual } from "./NeuroFieldManual";
import { useAudio } from "@/components/providers/AudioProvider";
import { useTelemetry } from "@/hooks/useTelemetry";
import { useStudioHashParams } from "@/hooks/useStudioHashParams";
import {
  IconBrain,
  IconCheck,
  IconArrowRight,
  IconInfoCircle,
  Icon3dCubeSphere,
  IconLayersSubtract,
  IconShieldCheck,
  IconLink,
} from "@tabler/icons-react";

export const NeuroReconClient: React.FC = () => {
  const { playNote, playSuccess } = useAudio();
  const { recordEvent } = useTelemetry();
  const { params, setParam, setParams } = useStudioHashParams();
  const [copyToast, setCopyToast] = useState<string | null>(null);

  const [activeScenarioId, setActiveScenarioId] = useState<ScenarioId>(() => {
    if (typeof window !== "undefined") {
      const rawSc = new URLSearchParams(window.location.hash.slice(1)).get("scenario") as ScenarioId;
      if (rawSc && SCENARIOS[rawSc]) {
        return rawSc;
      }
    }
    return "dura_inclusion";
  });
  const currentScenario = SCENARIOS[activeScenarioId];

  const [volume, setVolume] = useState<SyntheticVolume>(() =>
    generateSyntheticVolume(activeScenarioId)
  );

  const [crosshair, setCrosshair] = useState<VoxelCoord>(currentScenario.targetCoords);
  const [toolMode, setToolModeState] = useState<ToolMode>(() => {
    if (typeof window !== "undefined") {
      const rawTool = new URLSearchParams(window.location.hash.slice(1)).get("tool") as ToolMode;
      if (rawTool && ["inspect", "control_point", "paint", "erase"].includes(rawTool)) {
        return rawTool;
      }
    }
    return currentScenario.recommendedTool;
  });
  const [brushRadius, setBrushRadius] = useState<number>(2);
  const [surfaceMode, setSurfaceMode] = useState<SurfaceMode>("pial");
  const [showPialContour, setShowPialContour] = useState(true);
  const [showWmContour, setShowWmContour] = useState(true);
  const [viewMode, setViewModeState] = useState<"split" | "3d" | "2d">(() => {
    if (typeof window !== "undefined") {
      const rawView = new URLSearchParams(window.location.hash.slice(1)).get("view") as "split" | "3d" | "2d";
      if (rawView && ["split", "3d", "2d"].includes(rawView)) {
        return rawView;
      }
    }
    return "split";
  });
  const [activeDataset, setActiveDatasetState] = useState<DatasetSource>(() => {
    if (typeof window !== "undefined") {
      const rawDs = new URLSearchParams(window.location.hash.slice(1)).get("dataset") as DatasetSource;
      if (rawDs && ["case_study", "mni152", "oasis"].includes(rawDs)) {
        return rawDs;
      }
    }
    return "case_study";
  });

  const [controlPoints, setControlPoints] = useState<ControlPoint[]>([]);
  const [voxelEdits, setVoxelEdits] = useState<VoxelEdit[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isFieldManualOpen, setIsFieldManualOpen] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const reconTimerRef = React.useRef<NodeJS.Timeout | null>(null);

  const [scoreState, setScoreState] = useState<ScoreState>({
    score: 1200,
    multiplier: 1,
    streak: 0,
    resolvedScenarios: [],
  });

  const [logs, setLogs] = useState<TerminalLog[]>([
    {
      id: "log-init-1",
      type: "info",
      text: "FreeSurfer v7.4.1 (Linux x86_64) environment loaded.",
      timestamp: "00:00:01",
    },
    {
      id: "log-init-2",
      type: "output",
      text: `Loaded subject sub-01 [Scenario: ${currentScenario.title}]`,
      timestamp: "00:00:02",
    },
    {
      id: "log-init-3",
      type: "output",
      text: `Initial Euler χ = ${currentScenario.initialEuler}, Target = ${currentScenario.targetEuler}. ${currentScenario.initialDefects} defect voxels detected.`,
      timestamp: "00:00:03",
    },
  ]);

  // Switch Scenario Handler
  const handleSelectScenario = useCallback((scenarioId: ScenarioId) => {
    if (reconTimerRef.current !== null) {
      clearTimeout(reconTimerRef.current);
      reconTimerRef.current = null;
      setIsProcessing(false);
    }

    setActiveScenarioId(scenarioId);
    const newConfig = SCENARIOS[scenarioId];
    const newVol = generateSyntheticVolume(scenarioId);
    setVolume(newVol);
    setCrosshair(newConfig.targetCoords);
    setToolModeState(newConfig.recommendedTool);
    setControlPoints([]);
    setVoxelEdits([]);
    setShowSuccessModal(false);

    setParams(
      {
        scenario: scenarioId === "dura_inclusion" ? null : scenarioId,
        tool: null,
      },
      { replace: false }
    );

    setLogs((prev) => [
      ...prev,
      {
        id: `log-sw-${Date.now()}`,
        type: "command",
        text: `switch-scenario --case=${scenarioId}`,
        timestamp: new Date().toLocaleTimeString(),
      },
      {
        id: `log-sw-out-${Date.now()}`,
        type: "info",
        text: `Loaded ${newConfig.title}. ${newConfig.defectDescription}`,
        timestamp: new Date().toLocaleTimeString(),
      },
    ]);

    recordEvent("neuro", "project_click");
  }, [setParams, recordEvent]);

  // Synchronize incoming hash state on mount or browser Back/Forward navigation
  useEffect(() => {
    const rawSc = params.scenario as ScenarioId | undefined;
    if (rawSc && SCENARIOS[rawSc] && rawSc !== activeScenarioId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      handleSelectScenario(rawSc);
    }
    const rawView = params.view as "split" | "3d" | "2d" | undefined;
    if (rawView && ["split", "3d", "2d"].includes(rawView) && rawView !== viewMode) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setViewModeState(rawView);
    }
    const rawDs = params.dataset as DatasetSource | undefined;
    if (rawDs && ["case_study", "mni152", "oasis"].includes(rawDs) && rawDs !== activeDataset) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setActiveDatasetState(rawDs);
    }
    const rawTool = params.tool as ToolMode | undefined;
    if (rawTool && ["inspect", "control_point", "paint", "erase"].includes(rawTool) && rawTool !== toolMode) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setToolModeState(rawTool);
    }
  }, [params, activeScenarioId, viewMode, activeDataset, toolMode, handleSelectScenario]);

  const setViewMode = (mode: "split" | "3d" | "2d") => {
    setViewModeState(mode);
    setParam("view", mode === "split" ? null : mode, { replace: true });
  };

  const setActiveDataset = (dataset: DatasetSource) => {
    setActiveDatasetState(dataset);
    setParam("dataset", dataset === "case_study" ? null : dataset, { replace: true });
  };

  const setToolMode = useCallback((tool: ToolMode) => {
    setToolModeState(tool);
    setParam("tool", tool === currentScenario.recommendedTool ? null : tool, { replace: true });
  }, [currentScenario.recommendedTool, setParam]);

  const { copy: copyShareLink } = useClipboard({
    successMessage: "NeuroRecon Studio link copied to clipboard!",
    onSuccess: () => {
      try {
        playSuccess();
      } catch {}
      setCopyToast("NeuroRecon Studio link copied to clipboard!");
      setTimeout(() => setCopyToast(null), 3500);
    },
  });

  const handleCopyShareLink = () => {
    if (typeof window !== "undefined") {
      copyShareLink(window.location.href);
    }
  };

  useEffect(() => {
    return () => {
      if (reconTimerRef.current !== null) {
        clearTimeout(reconTimerRef.current);
        reconTimerRef.current = null;
      }
    };
  }, []);

  // Evaluate QA metrics
  const qaMetrics: QAMetrics = evaluateQAMetrics(
    currentScenario,
    volume,
    controlPoints,
    voxelEdits
  );

  // Add Control Point Handler
  const handleAddControlPoint = (point: Omit<ControlPoint, "id" | "timestamp">) => {
    const newCP: ControlPoint = {
      ...point,
      id: `cp-${Date.now()}`,
      timestamp: Date.now(),
    };
    setControlPoints((prev) => [...prev, newCP]);
    playNote(620, 0.08); // Pleasant high tick

    setLogs((prev) => [
      ...prev,
      {
        id: `log-cp-${Date.now()}`,
        type: "info",
        text: `Added Control Point at (${point.x}, ${point.y}, ${point.z}) with target intensity 110.`,
        timestamp: new Date().toLocaleTimeString(),
      },
    ]);
  };

  // Apply Voxel Edits Handler
  const handleApplyVoxelEdits = (edits: VoxelEdit[]) => {
    setVoxelEdits((prev) => [...prev, ...edits]);

    // Mutate live volume buffers for instant rendering
    const size = VOLUME_SIZE;
    edits.forEach((e) => {
      const idx = e.z * size * size + e.y * size + e.x;
      if (e.layer === "brainmask") {
        volume.brainmask[idx] = e.newValue;
      } else if (e.layer === "wm") {
        volume.wmMask[idx] = e.newValue;
        volume.rawT1[idx] = e.newValue === 1 ? 110 : 70;
      }
    });

    playNote(toolMode === "paint" ? 480 : 340, 0.05);
  };

  // Reset Scenario Edits
  const handleReset = () => {
    if (reconTimerRef.current !== null) {
      clearTimeout(reconTimerRef.current);
      reconTimerRef.current = null;
      setIsProcessing(false);
    }

    const freshVol = generateSyntheticVolume(activeScenarioId);
    setVolume(freshVol);
    setControlPoints([]);
    setVoxelEdits([]);
    setCrosshair(currentScenario.targetCoords);
    playNote(300, 0.1);

    setLogs((prev) => [
      ...prev,
      {
        id: `log-rst-${Date.now()}`,
        type: "command",
        text: "mri_restore_checkpoint --reset",
        timestamp: new Date().toLocaleTimeString(),
      },
      {
        id: `log-rst-out-${Date.now()}`,
        type: "info",
        text: "Reset all manual voxel edits and control points to baseline.",
        timestamp: new Date().toLocaleTimeString(),
      },
    ]);
  };

  // Run recon-all Pipeline Execution
  const handleRunRecon = useCallback(() => {
    if (reconTimerRef.current !== null) {
      clearTimeout(reconTimerRef.current);
    }

    setIsProcessing(true);
    playNote(520, 0.15);

    const cmdStr =
      toolMode === "control_point"
        ? "recon-all -s sub-01 -autorecon2-cp"
        : activeScenarioId === "topological_handle"
        ? "recon-all -s sub-01 -autorecon2-wm -fix-topology"
        : "recon-all -s sub-01 -autorecon2 -autorecon3";

    setLogs((prev) => [
      ...prev,
      {
        id: `log-run-${Date.now()}`,
        type: "command",
        text: cmdStr,
        timestamp: new Date().toLocaleTimeString(),
      },
    ]);

    reconTimerRef.current = setTimeout(() => {
      reconTimerRef.current = null;
      setIsProcessing(false);
      const metrics = evaluateQAMetrics(currentScenario, volume, controlPoints, voxelEdits);

      if (metrics.isResolved) {
        playSuccess();
        setShowSuccessModal(true);
        setScoreState((prev) => ({
          score: prev.score + 500 * prev.multiplier,
          multiplier: Math.min(4, prev.multiplier + 1),
          streak: prev.streak + 1,
          resolvedScenarios: Array.from(new Set([...prev.resolvedScenarios, activeScenarioId])),
        }));

        setLogs((prev) => [
          ...prev,
          {
            id: `log-res-succ-${Date.now()}`,
            type: "success",
            text: `[PASSED] ${currentScenario.successMessage} Euler χ = ${metrics.eulerCharacteristic}, Dice = ${(metrics.diceScore * 100).toFixed(1)}%. +500 PTS`,
            timestamp: new Date().toLocaleTimeString(),
          },
        ]);

        recordEvent("neuro", "project_click");
      } else {
        playNote(380, 0.1);
        setLogs((prev) => [
          ...prev,
          {
            id: `log-res-prog-${Date.now()}`,
            type: "info",
            text: `[INCOMPLETE] Recon executed. Remaining defects: ${metrics.defectCount}. Euler χ = ${metrics.eulerCharacteristic}. Continue manual correction.`,
            timestamp: new Date().toLocaleTimeString(),
          },
        ]);
      }
    }, 850);
  }, [toolMode, activeScenarioId, currentScenario, volume, controlPoints, voxelEdits, playNote, playSuccess, recordEvent, setLogs]);

  // CLI Command Execution Router
  const handleExecuteCliCommand = (cmd: string) => {
    const trimmed = cmd.trim().toLowerCase();
    const timestamp = new Date().toLocaleTimeString();

    setLogs((prev) => [
      ...prev,
      { id: `cmd-${Date.now()}`, type: "command", text: cmd, timestamp },
    ]);

    if (trimmed.startsWith("recon-all")) {
      handleRunRecon();
    } else if (trimmed === "help") {
      setLogs((prev) => [
        ...prev,
        {
          id: `out-help-${Date.now()}`,
          type: "output",
          text: `Available FreeSurfer commands:\n  recon-all -autorecon2-cp  : Re-run normalization with control points\n  recon-all -autorecon3     : Re-run pial surface & morphometry\n  freeview -f <mesh>        : Inspect surface meshes\n  stats                     : Print cortical & subcortical volume metrics\n  euler                     : Display Euler characteristic diagnostics\n  cp list                   : List active control point anchors\n  clear                     : Clear terminal log buffer`,
          timestamp,
        },
      ]);
    } else if (trimmed === "stats") {
      setLogs((prev) => [
        ...prev,
        {
          id: `out-stats-${Date.now()}`,
          type: "output",
          text: `Morphometric Stats (aseg.stats / aparc.stats):\n  Total Intracranial Volume (eTIV): 1,482,910 mm³\n  Total Gray Matter Volume: 712,450 mm³\n  Total White Matter Volume: 489,120 mm³\n  Mean Cortical Thickness: ${qaMetrics.meanCorticalThicknessMm} mm\n  Dice Ground Truth Similarity: ${(qaMetrics.diceScore * 100).toFixed(1)}%\n  Topological Defect Count: ${qaMetrics.defectCount}`,
          timestamp,
        },
      ]);
    } else if (trimmed === "euler") {
      setLogs((prev) => [
        ...prev,
        {
          id: `out-euler-${Date.now()}`,
          type: "output",
          text: `Euler Characteristic: χ = ${qaMetrics.eulerCharacteristic} (Target = ${currentScenario.targetEuler})\nFormula: χ = V - E + F = 2 - 2g (g = genus / handles)\nStatus: ${
            qaMetrics.eulerCharacteristic === currentScenario.targetEuler
              ? "Valid 2-Sphere Topology ($S^2$)"
              : "Defect present (Genus g >= 1)"
          }`,
          timestamp,
        },
      ]);
    } else if (trimmed === "cp list") {
      if (controlPoints.length === 0) {
        setLogs((prev) => [
          ...prev,
          { id: `out-cp-empty-${Date.now()}`, type: "info", text: "No control points placed yet. Use tool [2] or 'C' key.", timestamp },
        ]);
      } else {
        const cpListStr = controlPoints
          .map((cp, idx) => `  ${idx + 1}. [${cp.label || "CP"}] (${cp.x}, ${cp.y}, ${cp.z}) -> Target Int: ${cp.intensity}`)
          .join("\n");
        setLogs((prev) => [
          ...prev,
          { id: `out-cp-list-${Date.now()}`, type: "output", text: `Active Control Points (${controlPoints.length}):\n${cpListStr}`, timestamp },
        ]);
      }
    } else if (trimmed.startsWith("dataset")) {
      const parts = trimmed.split(" ");
      const target = parts[1];
      if (target === "mni152" || target === "oasis" || target === "cases" || target === "case_study") {
        const dId = target === "cases" ? "case_study" : (target as DatasetSource);
        setActiveDataset(dId);
        if (dId !== "case_study") {
          handleSelectScenario("sandbox");
        }
        setLogs((prev) => [
          ...prev,
          {
            id: `out-ds-${Date.now()}`,
            type: "success",
            text: `Active dataset set to: ${DATASET_CONFIGS[dId].name} (${DATASET_CONFIGS[dId].sourceRepo})`,
            timestamp,
          },
        ]);
      } else {
        setLogs((prev) => [
          ...prev,
          {
            id: `out-ds-list-${Date.now()}`,
            type: "info",
            text: `Available datasets:\n  dataset cases   : FreeSurfer Clinical QA Cases 01-04\n  dataset mni152  : Real Human MNI152 ICBM 2009c 3D GLB\n  dataset oasis   : Real Human OASIS-1 3T Scan OBJ`,
            timestamp,
          },
        ]);
      }
    } else if (trimmed === "clear") {
      setLogs([]);
    } else {
      setLogs((prev) => [
        ...prev,
        {
          id: `out-err-${Date.now()}`,
          type: "error",
          text: `Command not recognized: '${cmd}'. Type 'help' for FreeSurfer syntax guide.`,
          timestamp,
        },
      ]);
    }
  };

  // Keyboard Shortcuts Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Avoid hotkeys when typing in input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      if (e.key === "1" || e.key.toLowerCase() === "v") {
        setToolMode("inspect");
      } else if (e.key === "2" || e.key.toLowerCase() === "c") {
        setToolMode("control_point");
      } else if (e.key === "3" || e.key.toLowerCase() === "b") {
        setToolMode("paint");
      } else if (e.key === "4" || e.key.toLowerCase() === "e") {
        setToolMode("erase");
      } else if (e.key === " " && !isProcessing) {
        e.preventDefault();
        handleRunRecon();
      } else if (e.key.toLowerCase() === "m" || e.key === "?") {
        setIsFieldManualOpen((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isProcessing, handleRunRecon, setToolMode]);

  // Next Scenario Advancer
  const handleAdvanceNextScenario = () => {
    setShowSuccessModal(false);
    const currIdx = SCENARIO_LIST.indexOf(activeScenarioId);
    if (currIdx < SCENARIO_LIST.length - 1) {
      handleSelectScenario(SCENARIO_LIST[currIdx + 1]);
    } else {
      handleSelectScenario("sandbox");
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Banner / Scenario Selector Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-zinc-900/90 border border-zinc-800 p-4 rounded-3xl backdrop-blur-xl">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-brand-cyan/10 border border-brand-cyan/20 flex items-center justify-center text-brand-cyan shadow-inner">
            <IconBrain className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-brand-cyan">
                {currentScenario.badge}
              </span>
              <span className="text-xs font-mono text-zinc-400">·</span>
              <span className="text-xs font-mono text-zinc-400">
                Difficulty: {currentScenario.difficulty}
              </span>
            </div>
            <h1 className="text-lg sm:text-xl font-bold text-white font-mono">
              {currentScenario.title}
            </h1>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 self-stretch md:self-auto">
          {/* Share Link Button */}
          <button
            onClick={handleCopyShareLink}
            className="flex items-center gap-1.5 px-3 py-2 bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 rounded-xl text-xs font-mono text-zinc-300 hover:text-white transition-all shadow-sm"
            title="Copy Shareable Link for Current Scenario & View"
          >
            <IconLink className="w-3.5 h-3.5 text-brand-cyan" />
            <span>Share</span>
          </button>

          {/* Dataset Source Selector */}
          <div className="flex items-center gap-1 bg-zinc-950 p-1 rounded-xl border border-zinc-800 text-xs font-mono">
            {(["case_study", "mni152", "oasis"] as DatasetSource[]).map((dId) => {
              const dCfg = DATASET_CONFIGS[dId];
              const isSelected = activeDataset === dId;
              return (
                <button
                  key={dId}
                  onClick={() => {
                    setActiveDataset(dId);
                    if (dId !== "case_study") {
                      handleSelectScenario("sandbox");
                    }
                    playNote(440, 0.08);
                  }}
                  title={dCfg.subtitle}
                  className={`px-2.5 py-1 rounded-lg transition-all ${
                    isSelected
                      ? "bg-zinc-800 text-white font-bold border border-zinc-700 shadow-sm"
                      : "text-zinc-400 hover:text-white"
                  }`}
                >
                  <span>{dId === "case_study" ? "QA Scenarios" : dId === "mni152" ? "MNI152 (GLB)" : "OASIS (OBJ)"}</span>
                </button>
              );
            })}
          </div>

          {/* Scenario Carousel Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 bg-zinc-950 p-1.5 rounded-2xl border border-zinc-800 self-stretch md:self-auto overflow-x-auto">
            {SCENARIO_LIST.map((scId, idx) => {
              const isResolved = scoreState.resolvedScenarios.includes(scId);
              const isActive = activeScenarioId === scId;
              return (
                <button
                  key={scId}
                  onClick={() => handleSelectScenario(scId)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono transition-all whitespace-nowrap ${
                    isActive
                      ? "bg-brand-cyan text-zinc-950 font-bold shadow-md"
                      : "text-zinc-400 hover:text-white hover:bg-zinc-900"
                  }`}
                >
                  <span>{scId === "sandbox" ? "Sandbox" : `Case 0${idx + 1}`}</span>
                  {isResolved && <IconCheck className="w-3.5 h-3.5 text-emerald-400" />}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Live FreeSurfer QA HUD Metrics */}
      <NeuroMetricsPanel
        scenario={currentScenario}
        metrics={qaMetrics}
        scoreState={scoreState}
      />

      {/* Explanatory Lore Banner */}
      <div className="bg-zinc-900/60 border border-zinc-800/80 p-4 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <IconInfoCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
          <div className="text-xs space-y-1">
            <p className="text-zinc-200 leading-relaxed font-sans">
              <strong className="text-amber-400 font-mono uppercase tracking-wider">
                Defect Diagnosis:{" "}
              </strong>
              {currentScenario.defectDescription}
            </p>
            <p className="text-zinc-400 leading-relaxed">
              <strong className="text-brand-cyan font-mono uppercase tracking-wider">
                Remediation Protocol:{" "}
              </strong>
              {currentScenario.lore.remediationProtocol}
            </p>
          </div>
        </div>

        {/* View Mode Splitter */}
        <div className="flex items-center gap-1 bg-zinc-950 p-1 rounded-xl border border-zinc-800 text-xs font-mono self-end md:self-auto">
          <button
            onClick={() => setViewMode("split")}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-all ${
              viewMode === "split"
                ? "bg-zinc-800 text-white font-bold"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            <span>Split 3D/2D</span>
          </button>
          <button
            onClick={() => setViewMode("3d")}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-all ${
              viewMode === "3d"
                ? "bg-zinc-800 text-white font-bold"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            <Icon3dCubeSphere className="w-3.5 h-3.5" />
            <span>3D Only</span>
          </button>
          <button
            onClick={() => setViewMode("2d")}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-all ${
              viewMode === "2d"
                ? "bg-zinc-800 text-white font-bold"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            <IconLayersSubtract className="w-3.5 h-3.5" />
            <span>2D Only</span>
          </button>
        </div>
      </div>

      {/* Freeview Tool Palette Toolbar */}
      <NeuroToolbar
        toolMode={toolMode}
        brushRadius={brushRadius}
        showPialContour={showPialContour}
        showWmContour={showWmContour}
        isProcessing={isProcessing}
        onToolModeChange={setToolMode}
        onBrushRadiusChange={setBrushRadius}
        onTogglePialContour={() => setShowPialContour((prev) => !prev)}
        onToggleWmContour={() => setShowWmContour((prev) => !prev)}
        onRunRecon={handleRunRecon}
        onReset={handleReset}
        onOpenFieldManual={() => setIsFieldManualOpen(true)}
      />

      {/* Main Viewport Canvas Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* 3D Brain Surface Canvas (Span 5 or 12 or 0) */}
        {(viewMode === "split" || viewMode === "3d") && (
          <div
            className={`h-[460px] ${
              viewMode === "3d" ? "lg:col-span-12" : "lg:col-span-5"
            }`}
          >
            <Brain3DViewer
              surfaceMode={surfaceMode}
              crosshair={crosshair}
              modelUrl={DATASET_CONFIGS[activeDataset].modelUrl}
              onSurfaceChange={setSurfaceMode}
              onCrosshairChange={setCrosshair}
            />
          </div>
        )}

        {/* 2D Multi-Planar Orthoview Slices (Span 7 or 12 or 0) */}
        {(viewMode === "split" || viewMode === "2d") && (
          <div
            className={`h-[460px] ${
              viewMode === "2d" ? "lg:col-span-12" : "lg:col-span-7"
            }`}
          >
            <MultiPlanarSliceViewer
              volume={volume}
              crosshair={crosshair}
              toolMode={toolMode}
              brushRadius={brushRadius}
              showPialContour={showPialContour}
              showWmContour={showWmContour}
              controlPoints={controlPoints}
              onCrosshairChange={setCrosshair}
              onAddControlPoint={handleAddControlPoint}
              onApplyVoxelEdits={handleApplyVoxelEdits}
            />
          </div>
        )}
      </div>

      {/* FreeSurfer Interactive CLI Terminal */}
      <FreeSurferTerminal
        logs={logs}
        onExecuteCommand={handleExecuteCliCommand}
        onClearLogs={() => setLogs([])}
      />

      {/* Field Manual Modal */}
      <NeuroFieldManual
        isOpen={isFieldManualOpen}
        onClose={() => setIsFieldManualOpen(false)}
      />

      {/* Case Resolution Celebration Modal */}
      <AnimatePresence>
        {showSuccessModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="w-full max-w-lg bg-zinc-900 border border-emerald-500/40 rounded-3xl p-6 shadow-2xl space-y-5 text-center relative overflow-hidden"
            >
              <div className="absolute -top-24 -right-24 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

              <div className="w-16 h-16 rounded-3xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mx-auto shadow-inner">
                <IconShieldCheck className="w-8 h-8" />
              </div>

              <div className="space-y-2">
                <span className="text-xs font-mono font-bold uppercase tracking-widest text-emerald-400">
                  RECON-ALL PIPELINE PASS
                </span>
                <h3 className="text-xl font-bold text-white font-mono">
                  Defect Corrected & Verified!
                </h3>
                <p className="text-xs text-zinc-300 leading-relaxed font-sans">
                  {currentScenario.successMessage}
                </p>
              </div>

              {/* Stats pill */}
              <div className="grid grid-cols-3 gap-2 bg-zinc-950 p-3 rounded-2xl border border-zinc-800 text-xs font-mono">
                <div>
                  <div className="text-zinc-400">EULER</div>
                  <div className="font-bold text-emerald-400">χ = {qaMetrics.eulerCharacteristic}</div>
                </div>
                <div>
                  <div className="text-zinc-400">DICE</div>
                  <div className="font-bold text-brand-cyan">
                    {(qaMetrics.diceScore * 100).toFixed(1)}%
                  </div>
                </div>
                <div>
                  <div className="text-zinc-400">SCORE</div>
                  <div className="font-bold text-amber-400">+500 PTS</div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  onClick={() => setShowSuccessModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-mono transition-all"
                >
                  Stay in Current Case
                </button>
                <button
                  onClick={handleAdvanceNextScenario}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-cyan hover:bg-brand-cyan/90 text-zinc-950 font-mono font-bold text-xs shadow-lg shadow-brand-cyan/20 transition-all"
                >
                  <span>Advance Next Case</span>
                  <IconArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Share Toast Notification */}
      <AnimatePresence>
        {copyToast && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 15 }}
            className="fixed bottom-6 right-6 z-50 px-4 py-2.5 rounded-xl border border-brand-cyan/40 bg-zinc-900/95 text-xs font-mono text-brand-cyan shadow-2xl flex items-center gap-2 backdrop-blur-md"
          >
            <IconLink className="w-4 h-4 text-brand-cyan" />
            <span>{copyToast}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
