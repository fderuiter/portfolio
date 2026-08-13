"use client";

import React, { useState, useEffect, useMemo } from "react";
import { 
  IconTerminal, 
  IconHistory, 
  IconCheck, 
  IconArrowBackUp, 
  IconServer,
  IconPlayerPlay,
  IconReload
} from "@tabler/icons-react";

interface ProofNode {
  id: string;
  label: string;
  tactic?: string;
  x: number;
  y: number;
  status: "active" | "solved" | "parent";
}

interface ProofStep {
  label: string;
  command: string;
  nodes: ProofNode[];
  edges: { from: string; to: string }[];
  ramTarget: number;
}

const PROOF_STEPS: ProofStep[] = [
  {
    label: "Initialize Goal",
    command: "Goal Set",
    ramTarget: 34.2,
    nodes: [
      { id: "root", label: "⊢ A ∧ B → B ∧ A", status: "active", x: 400, y: 320 }
    ],
    edges: []
  },
  {
    label: "Implication Introduction",
    command: "intro h",
    ramTarget: 52.8,
    nodes: [
      { id: "root", label: "⊢ A ∧ B → B ∧ A", status: "parent", tactic: "intro h", x: 400, y: 320 },
      { id: "step1_node", label: "h: A ∧ B ⊢ B ∧ A", status: "active", x: 400, y: 240 }
    ],
    edges: [
      { from: "root", to: "step1_node" }
    ]
  },
  {
    label: "Conjunction Elimination",
    command: "destruct h",
    ramTarget: 68.4,
    nodes: [
      { id: "root", label: "⊢ A ∧ B → B ∧ A", status: "parent", tactic: "intro h", x: 400, y: 320 },
      { id: "step1_node", label: "h: A ∧ B ⊢ B ∧ A", status: "parent", tactic: "destruct h", x: 400, y: 240 },
      { id: "step2_node", label: "h1: A, h2: B ⊢ B ∧ A", status: "active", x: 400, y: 160 }
    ],
    edges: [
      { from: "root", to: "step1_node" },
      { from: "step1_node", to: "step2_node" }
    ]
  },
  {
    label: "Conjunction Introduction",
    command: "split",
    ramTarget: 86.7,
    nodes: [
      { id: "root", label: "⊢ A ∧ B → B ∧ A", status: "parent", tactic: "intro h", x: 400, y: 320 },
      { id: "step1_node", label: "h: A ∧ B ⊢ B ∧ A", status: "parent", tactic: "destruct h", x: 400, y: 240 },
      { id: "step2_node", label: "h1: A, h2: B ⊢ B ∧ A", status: "parent", tactic: "split", x: 400, y: 160 },
      { id: "subgoal1", label: "h1: A, h2: B ⊢ B", status: "active", x: 220, y: 80 },
      { id: "subgoal2", label: "h1: A, h2: B ⊢ A", status: "active", x: 580, y: 80 }
    ],
    edges: [
      { from: "root", to: "step1_node" },
      { from: "step1_node", to: "step2_node" },
      { from: "step2_node", to: "subgoal1" },
      { from: "step2_node", to: "subgoal2" }
    ]
  },
  {
    label: "Resolve Left Subgoal",
    command: "apply h2",
    ramTarget: 48.1,
    nodes: [
      { id: "root", label: "⊢ A ∧ B → B ∧ A", status: "parent", tactic: "intro h", x: 400, y: 320 },
      { id: "step1_node", label: "h: A ∧ B ⊢ B ∧ A", status: "parent", tactic: "destruct h", x: 400, y: 240 },
      { id: "step2_node", label: "h1: A, h2: B ⊢ B ∧ A", status: "parent", tactic: "split", x: 400, y: 160 },
      { id: "subgoal1", label: "h1: A, h2: B ⊢ B", status: "parent", tactic: "apply h2", x: 220, y: 80 },
      { id: "subgoal1_qed", label: "QED (h2 matched)", status: "solved", x: 220, y: 20 },
      { id: "subgoal2", label: "h1: A, h2: B ⊢ A", status: "active", x: 580, y: 80 }
    ],
    edges: [
      { from: "root", to: "step1_node" },
      { from: "step1_node", to: "step2_node" },
      { from: "step2_node", to: "subgoal1" },
      { from: "step2_node", to: "subgoal2" },
      { from: "subgoal1", to: "subgoal1_qed" }
    ]
  },
  {
    label: "Resolve Right Subgoal",
    command: "apply h1",
    ramTarget: 39.5,
    nodes: [
      { id: "root", label: "⊢ A ∧ B → B ∧ A", status: "parent", tactic: "intro h", x: 400, y: 320 },
      { id: "step1_node", label: "h: A ∧ B ⊢ B ∧ A", status: "parent", tactic: "destruct h", x: 400, y: 240 },
      { id: "step2_node", label: "h1: A, h2: B ⊢ B ∧ A", status: "parent", tactic: "split", x: 400, y: 160 },
      { id: "subgoal1", label: "h1: A, h2: B ⊢ B", status: "parent", tactic: "apply h2", x: 220, y: 80 },
      { id: "subgoal1_qed", label: "QED (h2 matched)", status: "solved", x: 220, y: 20 },
      { id: "subgoal2", label: "h1: A, h2: B ⊢ A", status: "parent", tactic: "apply h1", x: 580, y: 80 },
      { id: "subgoal2_qed", label: "QED (h1 matched)", status: "solved", x: 580, y: 20 }
    ],
    edges: [
      { from: "root", to: "step1_node" },
      { from: "step1_node", to: "step2_node" },
      { from: "step2_node", to: "subgoal1" },
      { from: "step2_node", to: "subgoal2" },
      { from: "subgoal1", to: "subgoal1_qed" },
      { from: "subgoal2", to: "subgoal2_qed" }
    ]
  }
];

export function ProofAssistant() {
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [ramUsage, setRamUsage] = useState<number>(34.2);
  const [typedCommand, setTypedCommand] = useState<string>("");
  const [errorText, setErrorText] = useState<string>("");
  
  // Noise state for real-time telemetry fluctuations
  const [noise, setNoise] = useState<number>(0);

  // We enforce layout safety by not calling clientHeight, offsetWidth, etc.
  // Dynamic smooth transition hook for telemetry using purely React state + requestAnimationFrame
  const activeStepConfig = useMemo(() => PROOF_STEPS[currentStep], [currentStep]);
  const baseTarget = activeStepConfig.ramTarget;
  const successAnimation = currentStep === PROOF_STEPS.length - 1;
  
  // Maintain a smooth interpolator to targetRam = baseTarget + noise
  useEffect(() => {
    let active = true;
    const animate = () => {
      if (!active) return;
      
      const target = baseTarget + noise;
      setRamUsage(prev => {
        const diff = target - prev;
        if (Math.abs(diff) < 0.05) {
          return target;
        }
        return prev + diff * 0.12; // Beautiful fluid spring interpolation
      });
      
      requestAnimationFrame(animate);
    };
    
    const frameId = requestAnimationFrame(animate);
    return () => {
      active = false;
      cancelAnimationFrame(frameId);
    };
  }, [baseTarget, noise]);

  // Telemetry fluctuation loop (simulates CPU/RAM activity in high-frequency solver loops)
  useEffect(() => {
    const interval = setInterval(() => {
      // Small randomized fluctuations between -0.4% and +0.4% to simulate telemetry activity
      setNoise((Math.random() - 0.5) * 0.8);
    }, 150);
    return () => clearInterval(interval);
  }, []);

  // Handle click to execute tactic
  const handleExecuteTactic = (tactic: string) => {
    setErrorText("");
    const nextStep = currentStep + 1;
    if (nextStep < PROOF_STEPS.length) {
      const expectedCommand = PROOF_STEPS[nextStep].command;
      if (tactic.trim().toLowerCase() === expectedCommand.toLowerCase()) {
        setCurrentStep(nextStep);
        setTypedCommand("");
      } else {
        setErrorText(`Tactic "${tactic}" cannot be applied in the current proof state.`);
      }
    }
  };

  // Handle custom typed command submission
  const handleCommandSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!typedCommand.trim()) return;
    
    setErrorText("");
    const nextStep = currentStep + 1;
    if (nextStep < PROOF_STEPS.length) {
      const expectedCommand = PROOF_STEPS[nextStep].command;
      if (typedCommand.trim().toLowerCase() === expectedCommand.toLowerCase()) {
        setCurrentStep(nextStep);
        setTypedCommand("");
      } else {
        setErrorText(`Syntax error: "${typedCommand}" is not a valid tactic for this branch.`);
      }
    } else {
      setErrorText("Proof is already completed. Reset to run tactics again.");
    }
  };

  // Rollback to specific step
  const handleRollback = (stepIndex: number) => {
    setErrorText("");
    if (stepIndex >= 0 && stepIndex < PROOF_STEPS.length) {
      setCurrentStep(stepIndex);
    }
  };

  // Reset the entire interactive session
  const handleReset = () => {
    setErrorText("");
    setCurrentStep(0);
    setTypedCommand("");
  };

  // Get active tactic name for the next step button
  const nextTacticAvailable = useMemo(() => {
    if (currentStep < PROOF_STEPS.length - 1) {
      return PROOF_STEPS[currentStep + 1].command;
    }
    return null;
  }, [currentStep]);

  return (
    <div className="w-full flex flex-col gap-6 bg-zinc-950/40 border border-zinc-900 rounded-2xl p-5 md:p-8 backdrop-blur-md relative overflow-hidden">
      {/* Background radial effects */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-brand-cyan/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-brand-blue/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Header section with telemetry simulation stats */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-zinc-900 pb-5 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
            <span className="text-xs font-mono font-bold tracking-widest text-zinc-400">PROVER MAIN ENGINE</span>
          </div>
          <h3 className="text-lg font-bold text-neutral-100 font-sans mt-1">Proof-State Tree & Telemetry Gauge</h3>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl px-3.5 py-1.5 text-right font-mono">
            <span className="text-[10px] block text-zinc-500 font-bold uppercase tracking-wider">AST Depth</span>
            <span className="text-xs text-brand-cyan font-bold">L-{4 + currentStep}</span>
          </div>
          <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl px-3.5 py-1.5 text-right font-mono">
            <span className="text-[10px] block text-zinc-500 font-bold uppercase tracking-wider">Solver Ticks</span>
            <span className="text-xs text-brand-blue font-bold">#{142 + currentStep * 11}</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Proof Script & Command panel on Left, SVG Canvas on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* Left Side: Proof history and tactic inputs (4 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-5 justify-between">
          <div className="flex flex-col gap-4">
            
            {/* Interactive Proof Script History */}
            <div className="bg-zinc-900/40 border border-zinc-900/80 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <IconHistory className="w-4 h-4 text-zinc-400" />
                <h4 className="text-xs font-mono font-bold text-zinc-300 uppercase tracking-wider">Proof Script History</h4>
              </div>

              <div className="flex flex-col gap-2 max-h-[180px] overflow-y-auto pr-1">
                {PROOF_STEPS.slice(0, currentStep + 1).map((step, idx) => (
                  <div 
                    key={idx} 
                    className={`flex items-center justify-between text-xs font-mono p-2 rounded-lg transition-colors ${
                      idx === currentStep 
                        ? "bg-brand-cyan/5 border border-brand-cyan/20 text-brand-cyan" 
                        : "bg-zinc-900/60 border border-zinc-800/40 text-zinc-400"
                    }`}
                  >
                    <div className="flex items-center gap-2 overflow-hidden truncate mr-2">
                      <span className="text-[10px] text-zinc-600">0{idx}</span>
                      <span className="font-bold text-zinc-200">{step.command}</span>
                      <span className="text-[10px] text-zinc-500 truncate">({step.label})</span>
                    </div>
                    
                    <button
                      onClick={() => handleRollback(idx)}
                      disabled={idx === currentStep}
                      className={`p-1 rounded hover:bg-zinc-800 transition-colors cursor-pointer group flex items-center gap-1 text-[10px] ${
                        idx === currentStep 
                          ? "opacity-50 pointer-events-none text-zinc-600" 
                          : "text-zinc-400 hover:text-brand-cyan"
                      }`}
                      title={`Rollback proof state to Step ${idx}`}
                    >
                      <IconArrowBackUp className="w-3.5 h-3.5 transition-transform group-hover:-rotate-45" />
                      Rollback
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Live Goal Context */}
            <div className="bg-zinc-900/40 border border-zinc-900/80 rounded-xl p-4 font-mono">
              <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block mb-1">Active Subgoal</span>
              {currentStep < PROOF_STEPS.length - 1 ? (
                <div className="text-sm font-bold text-neutral-100 flex items-center gap-2">
                  <span className="text-brand-cyan">&gt;</span>
                  <span className="text-zinc-200">
                    {PROOF_STEPS[currentStep].nodes.find(n => n.status === "active")?.label || "Checking goals..."}
                  </span>
                </div>
              ) : (
                <div className="text-sm font-bold text-success flex items-center gap-2">
                  <IconCheck className="w-4 h-4 text-success" />
                  <span>Q.E.D. Proof Fully Verified!</span>
                </div>
              )}
            </div>

            {/* Quick-Click Tactic Badges */}
            <div className="bg-zinc-900/40 border border-zinc-900/80 rounded-xl p-4">
              <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block mb-2.5">Available Tactical Inferences</span>
              
              {nextTacticAvailable ? (
                <div className="flex flex-col gap-2">
                  <p className="text-[11px] text-zinc-400 font-sans leading-relaxed">
                    Click the tactic badge below to branch or solve the proof tree, or enter it in the shell prompt.
                  </p>
                  <div className="flex flex-wrap gap-2 mt-1">
                    <button
                      onClick={() => handleExecuteTactic(nextTacticAvailable)}
                      className="px-3 py-1.5 text-xs font-mono font-bold bg-brand-cyan/10 border border-brand-cyan/30 text-brand-cyan rounded-lg hover:bg-brand-cyan/20 hover:border-brand-cyan/50 cursor-pointer select-none transition-all duration-300 flex items-center gap-1.5 shadow-[0_0_10px_rgba(6,182,212,0.05)] active:scale-95"
                    >
                      <IconPlayerPlay className="w-3 h-3 fill-brand-cyan" />
                      {nextTacticAvailable}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  <p className="text-[11px] text-zinc-400 leading-relaxed font-sans">
                    All tactics successfully executed. The proof-state tree is logically sound and checked.
                  </p>
                  <button
                    onClick={handleReset}
                    className="px-3 py-1.5 text-xs font-mono font-bold bg-zinc-900 border border-zinc-800 text-zinc-300 rounded-lg hover:bg-zinc-800 hover:text-white cursor-pointer select-none transition-colors flex items-center gap-1.5 self-start active:scale-95"
                  >
                    <IconReload className="w-3 h-3" />
                    Reset Proof Tree
                  </button>
                </div>
              )}
            </div>

          </div>

          {/* Prompt CLI Bar */}
          <form onSubmit={handleCommandSubmit} className="mt-2">
            <div className="relative flex items-center bg-zinc-900/80 border border-zinc-800 focus-within:border-brand-cyan/60 rounded-xl px-3 py-2.5 transition-colors">
              <IconTerminal className="w-4 h-4 text-zinc-500 mr-2" />
              <input 
                type="text"
                placeholder={nextTacticAvailable ? `Type tactic (e.g. '${nextTacticAvailable}') ...` : "Proof solved."}
                disabled={!nextTacticAvailable}
                value={typedCommand}
                onChange={(e) => setTypedCommand(e.target.value)}
                className="bg-transparent text-xs font-mono text-neutral-100 placeholder-zinc-600 focus:outline-none w-full"
              />
              {nextTacticAvailable && (
                <button 
                  type="submit"
                  className="text-[10px] font-mono font-bold text-brand-cyan hover:text-brand-cyan/80 px-2 py-0.5 rounded border border-brand-cyan/20 bg-brand-cyan/5 cursor-pointer select-none transition-all active:scale-95"
                >
                  RUN
                </button>
              )}
            </div>
            {errorText && (
              <p className="text-[10px] font-mono text-error mt-1.5 pl-1 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-error" />
                {errorText}
              </p>
            )}
          </form>

        </div>

        {/* Right Side: Declarative SVG Proof Tree (7 cols) */}
        <div className="lg:col-span-7 bg-zinc-950 border border-zinc-900/80 rounded-2xl p-3 md:p-5 flex items-center justify-center relative min-h-[360px]">
          
          {/* Symmetrical Grid lines overlay for engineering blueprint feel */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(63,63,70,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(63,63,70,0.03)_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none rounded-2xl" />

          {/* QED Watermark Backdrop on Proof completion */}
          {successAnimation && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
              <span className="text-[120px] font-black font-mono text-success/[0.03] select-none tracking-widest uppercase animate-pulse">
                QED
              </span>
            </div>
          )}

          {/* SVG Frame Canvas */}
          <svg 
            viewBox="0 0 800 360" 
            className="w-full h-full relative z-10 select-none overflow-visible"
          >
            {/* SVG Gradients definitions */}
            <defs>
              <linearGradient id="parent-active-grad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="var(--color-brand-cyan)" stopOpacity="0.4" />
                <stop offset="100%" stopColor="var(--color-brand-cyan)" stopOpacity="0.05" />
              </linearGradient>
              <linearGradient id="solved-path-grad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="var(--color-success)" stopOpacity="0.5" />
                <stop offset="100%" stopColor="var(--color-success)" stopOpacity="0.1" />
              </linearGradient>
            </defs>

            {/* Connected Node Paths (SVG Edges) - Clean declarative path layout */}
            {activeStepConfig.edges.map((edge, idx) => {
              const fromNode = activeStepConfig.nodes.find(n => n.id === edge.from);
              const toNode = activeStepConfig.nodes.find(n => n.id === edge.to);
              
              if (!fromNode || !toNode) return null;

              // Compute smooth cubic bezier coordinates for fluid layout
              const midY = (fromNode.y + toNode.y) / 2;
              const pathD = `M ${fromNode.x} ${fromNode.y} C ${fromNode.x} ${midY}, ${toNode.x} ${midY}, ${toNode.x} ${toNode.y}`;
              
              // Highlight completed/solved path branches
              const isSolvedPath = fromNode.status === "parent" && toNode.status === "solved";
              const strokeColor = isSolvedPath ? "var(--color-success)" : "var(--color-brand-cyan)";
              const strokeOpacity = isSolvedPath ? "0.6" : "0.35";
              const strokeDash = isSolvedPath ? "none" : "5 3";

              return (
                <g key={`edge-${idx}`}>
                  {/* Outer glowing trace path for visual depth */}
                  <path
                    d={pathD}
                    fill="none"
                    stroke={strokeColor}
                    strokeWidth="4"
                    strokeOpacity="0.12"
                    className="transition-all duration-500 ease-in-out"
                  />
                  {/* Core layout line */}
                  <path
                    d={pathD}
                    fill="none"
                    stroke={strokeColor}
                    strokeWidth="1.5"
                    strokeOpacity={strokeOpacity}
                    strokeDasharray={strokeDash}
                    className="transition-all duration-500 ease-in-out"
                  />
                </g>
              );
            })}

            {/* Tree Nodes - Clean declarative mapping coordinates with absolute coordinates */}
            {activeStepConfig.nodes.map((node) => {
              const isActive = node.status === "active";
              const isSolved = node.status === "solved";
              const isParent = node.status === "parent";

              let borderColor = "var(--color-border)";
              let ringGlow = "none";

              if (isActive) {
                borderColor = "var(--color-brand-cyan)";
                ringGlow = "0 0 12px rgba(6, 182, 212, 0.25)";
              } else if (isSolved) {
                borderColor = "var(--color-success)";
                ringGlow = "0 0 12px rgba(16, 185, 129, 0.25)";
              } else if (isParent) {
                borderColor = "var(--color-brand-blue)";
              }

              return (
                <g 
                  key={node.id} 
                  transform={`translate(${node.x}, ${node.y})`}
                  className="transition-transform duration-500 ease-in-out cursor-default"
                >
                  {/* Interactive Tactic Label displayed directly above parent connector nodes */}
                  {node.tactic && (
                    <g transform="translate(0, -38)">
                      <rect
                        x="-45"
                        y="-10"
                        width="90"
                        height="18"
                        rx="4"
                        className="fill-zinc-900 stroke-zinc-800"
                        strokeWidth="1"
                      />
                      <text
                        textAnchor="middle"
                        y="2"
                        className="fill-brand-cyan font-mono text-[9px] font-bold"
                      >
                        {node.tactic}
                      </text>
                    </g>
                  )}

                  {/* Node container shape */}
                  <rect
                    x="-100"
                    y="-22"
                    width="200"
                    height="44"
                    rx="8"
                    fill="#09090b"
                    stroke={borderColor}
                    strokeWidth={isActive ? "2" : "1"}
                    style={{ filter: ringGlow !== "none" ? `drop-shadow(${ringGlow})` : "none" }}
                    className="transition-all duration-300"
                  />

                  {/* Active node status pulse ring */}
                  {isActive && (
                    <rect
                      x="-104"
                      y="-26"
                      width="208"
                      height="52"
                      rx="10"
                      fill="none"
                      stroke="var(--color-brand-cyan)"
                      strokeWidth="1"
                      strokeOpacity="0.2"
                      className="animate-ping"
                      style={{ transformOrigin: "0 0" }}
                    />
                  )}

                  {/* Inner Node Text Formulation */}
                  <text
                    textAnchor="middle"
                    y="4"
                    className={`font-mono text-[10px] font-semibold ${
                      isSolved 
                        ? "fill-success" 
                        : isActive 
                        ? "fill-brand-cyan" 
                        : isParent 
                        ? "fill-zinc-400" 
                        : "fill-zinc-500"
                    }`}
                  >
                    {node.label}
                  </text>
                  
                  {/* Symmetrical left-right anchor points */}
                  <circle cx="0" cy="22" r="3" fill={borderColor} />
                  <circle cx="0" cy="-22" r="3" fill={borderColor} />
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      {/* Bottom Section: RAM Telemetry & GPU Compositor Monitor HUD */}
      <div 
        style={{
          "--ram-progress": ramUsage.toFixed(1),
        } as React.CSSProperties}
        className="mt-4 border-t border-zinc-900 pt-6 flex flex-col md:flex-row items-center justify-between gap-6 bg-zinc-900/10 rounded-xl p-4 border border-zinc-900/60"
      >
        
        {/* Left metrics info */}
        <div className="flex items-center gap-3.5">
          <div className="p-2.5 rounded-lg bg-zinc-900 border border-zinc-800 text-brand-cyan">
            <IconServer className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-mono font-bold text-neutral-200">TELEMETRY_ENGINE: RAM_USAGE</span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-brand-cyan/10 text-brand-cyan border border-brand-cyan/10">COMPOSITOR ACTIVE</span>
            </div>
            <p className="text-[11px] text-zinc-500 leading-relaxed max-w-sm mt-0.5">
              State ticks bypass DOM measurements, rendering transitions on the GPU thread using CSS custom variable <code className="text-brand-cyan font-bold text-[10px]">--ram-progress</code>.
            </p>
          </div>
        </div>

        {/* HUD Gauges: Circular & Linear progress bar synchronized via --ram-progress variable */}
        <div className="flex flex-col sm:flex-row items-center gap-6 w-full md:w-auto">
          
          {/* Synchronized Linear Progress Gauge */}
          <div className="flex flex-col gap-1 w-full sm:w-48">
            <div className="flex justify-between text-[10px] font-mono text-zinc-400 font-bold">
              <span>SOLVER MONITOR</span>
              <span className="text-brand-cyan font-semibold">{ramUsage.toFixed(1)}%</span>
            </div>
            <div className="relative w-full h-3 bg-zinc-950 border border-zinc-900 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-brand-cyan to-brand-blue transition-all duration-150 ease-out shadow-[0_0_8px_rgba(6,182,212,0.4)]"
                style={{ width: "calc(var(--ram-progress) * 1%)" }}
              />
            </div>
          </div>

          {/* Synchronized Circular Telemetry Indicator */}
          <div className="flex items-center gap-3">
            <div className="relative w-14 h-14">
              <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
                <path
                  className="stroke-zinc-900 fill-none"
                  strokeWidth="3.5"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="stroke-brand-cyan fill-none transition-all duration-150 ease-out shadow-sm"
                  strokeWidth="3.5"
                  strokeDasharray="100, 100"
                  style={{
                    strokeDashoffset: "calc(100 - var(--ram-progress))"
                  }}
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center font-mono text-[9px] text-zinc-400 font-bold">
                {Math.round(ramUsage)}%
              </div>
            </div>

            <div className="font-mono text-[10px] text-zinc-500 flex flex-col">
              <span className="text-zinc-400 font-bold uppercase tracking-wider">Heap Alloc</span>
              <span>{(ramUsage * 12.4).toFixed(0)} MB / 2048 MB</span>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
