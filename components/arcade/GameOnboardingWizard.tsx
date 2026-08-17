"use client";

import React, { useState, useEffect } from "react";
import { z } from "zod";
import {
  IconArrowLeft,
  IconArrowRight,
  IconCheck,
  IconAlertTriangle,
  IconPlayerPlay,
  IconUser,
  IconSettings,
  IconDeviceGamepad,
} from "@tabler/icons-react";
import {
  gameSchemas,
  AnyGameConfig,
} from "@/lib/game-config-schemas";

interface GameOnboardingWizardProps {
  gameId: string;
  isOpen: boolean;
  onClose: () => void;
  onComplete: (config: AnyGameConfig) => void;
}

export const GameOnboardingWizard: React.FC<GameOnboardingWizardProps> = ({
  gameId,
  isOpen,
  onClose,
  onComplete,
}) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Form states matching BaseGameConfigSchema
  const [playerName, setPlayerName] = useState("Player");
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">("medium");

  // Game-specific form states
  // 1. Clinical Chaos
  const [sdtmDomains, setSdtmDomains] = useState<("DM" | "VS" | "AE" | "LB")[]>(["DM", "VS", "AE", "LB"]);
  const [validationErrorThreshold, setValidationErrorThreshold] = useState(30);

  // 2. Garmin Watch
  const [deviceTarget, setDeviceTarget] = useState<"fenix" | "forerunner" | "edge">("fenix");
  const [bezelTheme, setBezelTheme] = useState<"slate" | "solar" | "cyan" | "neon">("slate");
  const [initialAllocationsKb, setInitialAllocationsKb] = useState(20);

  // 3. Laser Loon
  const [laserType, setLaserType] = useState<"ruby-laser" | "cyan-pulse" | "aurora-wave" | "ice-cannon">("ruby-laser");
  const [initialAct, setInitialAct] = useState(1);

  // 4. Retro Labyrinth
  const [cyberdeckClass, setCyberdeckClass] = useState<"script_kiddie" | "cryptanalyst" | "apt_specialist" | "hardware_hacker">("script_kiddie");
  const [dungeonSize, setDungeonSize] = useState<"small" | "medium" | "large">("medium");
  const [securityTier, setSecurityTier] = useState(1);
  const [startingExploit, setStartingExploit] = useState<"buffer_overflow" | "sql_injection" | "auth_bypass" | "none">("none");

  // 5. Working with Duck
  const [puppyState, setPuppyState] = useState<"happy" | "playful" | "sleepy">("happy");
  const [officeBoundariesX, setOfficeBoundariesX] = useState(50);
  const [officeBoundariesY, setOfficeBoundariesY] = useState(50);
  const [levelSprint, setLevelSprint] = useState(1);

  // 6. Quasi-Perfect Puzzler
  const [proofGoal, setProofGoal] = useState<"identity" | "double_negation" | "modus_ponens" | "syllogism">("identity");
  const [tacticSelections, setTacticSelections] = useState<string[]>(["intro", "apply", "cases", "exact"]);
  const [handLimit, setHandLimit] = useState(5);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        setStep(1);
        setErrors({});
      }, 0);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Compile full config for validation
  const getFullConfig = (): AnyGameConfig => {
    const base = { gameId, playerName, difficulty };
    switch (gameId) {
      case "clinical-chaos":
        return { ...base, sdtmDomains, validationErrorThreshold } as unknown as AnyGameConfig;
      case "garmin-watch":
        return { ...base, deviceTarget, bezelTheme, initialAllocationsKb } as unknown as AnyGameConfig;
      case "laser-loon":
        return { ...base, laserType, initialAct } as unknown as AnyGameConfig;
      case "retro-labyrinth":
        return { ...base, cyberdeckClass, dungeonSize, securityTier, startingExploit } as unknown as AnyGameConfig;
      case "working-with-duck":
        return { ...base, puppyState, officeBoundariesX, officeBoundariesY, levelSprint } as unknown as AnyGameConfig;
      case "quasi-puzzler":
        return { ...base, proofGoal, tacticSelections, handLimit } as unknown as AnyGameConfig;
      default:
        return base as unknown as AnyGameConfig;
    }
  };

  const validateStep = (targetStep: number): boolean => {
    const schema = gameSchemas[gameId];
    if (!schema) return true;

    const currentConfig = getFullConfig();
    setErrors({});

    if (targetStep === 1) {
      // Validate Player Name and general fields
      if (!playerName.trim()) {
        setErrors({ playerName: "Player name is required" });
        return false;
      }
      return true;
    }

    if (targetStep === 2) {
      // Validate game-specific configuration using schema
      const result = schema.safeParse(currentConfig);
      if (!result.success) {
        const fieldErrors: Record<string, string> = {};
        result.error.issues.forEach((err: z.ZodIssue) => {
          const path = err.path.join(".");
          fieldErrors[path] = err.message;
        });
        setErrors(fieldErrors);
        return false;
      }
      return true;
    }

    return true;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep((prev) => (prev < 3 ? (prev + 1) as 1 | 2 | 3 : prev));
    }
  };

  const handleBack = () => {
    setErrors({});
    setStep((prev) => (prev > 1 ? (prev - 1) as 1 | 2 | 3 : prev));
  };

  const handleLaunch = () => {
    if (validateStep(2)) {
      onComplete(getFullConfig());
    }
  };

  const toggleSdtmDomain = (domain: "DM" | "VS" | "AE" | "LB") => {
    setSdtmDomains((prev) =>
      prev.includes(domain) ? prev.filter((d) => d !== domain) : [...prev, domain]
    );
  };

  const toggleTacticSelection = (tactic: string) => {
    setTacticSelections((prev) =>
      prev.includes(tactic) ? prev.filter((t) => t !== tactic) : [...prev, tactic]
    );
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-xl rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4 mb-4">
          <div>
            <h2 className="text-xl font-bold font-mono text-white flex items-center gap-2">
              <IconSettings className="w-5 h-5 text-emerald-400" />
              <span>Configure Game Setup</span>
            </h2>
            <p className="text-xs text-zinc-400 font-mono">Standardized Pre-Game Configuration Standard</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-zinc-900 text-zinc-400 hover:text-white transition-colors"
            aria-label="Close configuration wizard"
          >
            <span className="text-xl font-bold font-sans">×</span>
          </button>
        </div>

        {/* Progress bar */}
        <div className="flex items-center justify-between gap-2 mb-6 font-mono text-xs">
          <div className={`flex-1 text-center py-1.5 rounded-lg border transition-all ${step === 1 ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30 font-bold" : "bg-zinc-900/40 text-zinc-500 border-zinc-800/50"}`}>
            1. General Info
          </div>
          <div className={`flex-1 text-center py-1.5 rounded-lg border transition-all ${step === 2 ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30 font-bold" : "bg-zinc-900/40 text-zinc-500 border-zinc-800/50"}`}>
            2. Game Settings
          </div>
          <div className={`flex-1 text-center py-1.5 rounded-lg border transition-all ${step === 3 ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30 font-bold" : "bg-zinc-900/40 text-zinc-500 border-zinc-800/50"}`}>
            3. Launch Game
          </div>
        </div>

        {/* Form Body - Scrollable */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1 mb-6">
          {step === 1 && (
            <div className="space-y-4 font-mono">
              <div className="flex items-center gap-2 text-sm text-zinc-300 border-b border-zinc-900 pb-2 mb-2 font-bold">
                <IconUser className="w-4 h-4 text-emerald-400" />
                <span>Player Profile &amp; General Mode</span>
              </div>

              <div>
                <label className="block text-xs text-zinc-400 mb-1.5 uppercase">Player Name</label>
                <input
                  type="text"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors"
                  placeholder="Enter custom nickname"
                />
                {errors.playerName && (
                  <p className="text-xs text-rose-500 mt-1 flex items-center gap-1">
                    <IconAlertTriangle className="w-3.5 h-3.5" />
                    <span>{errors.playerName}</span>
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs text-zinc-400 mb-1.5 uppercase">Difficulty Tier</label>
                <div className="grid grid-cols-3 gap-2">
                  {(["easy", "medium", "hard"] as const).map((diff) => (
                    <button
                      key={diff}
                      type="button"
                      onClick={() => setDifficulty(diff)}
                      className={`py-2 rounded-lg border text-xs capitalize transition-all ${
                        difficulty === diff
                          ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/50 font-bold"
                          : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white"
                      }`}
                    >
                      {diff}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4 font-mono">
              <div className="flex items-center gap-2 text-sm text-zinc-300 border-b border-zinc-900 pb-2 mb-2 font-bold">
                <IconDeviceGamepad className="w-4 h-4 text-emerald-400" />
                <span>Specialized Game-Specific Parameters</span>
              </div>

              {/* 1. Clinical Chaos fields */}
              {gameId === "clinical-chaos" && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs text-zinc-400 mb-1.5 uppercase">Active CDISC SDTM Domains</label>
                    <div className="grid grid-cols-4 gap-2">
                      {(["DM", "VS", "AE", "LB"] as const).map((domain) => {
                        const active = sdtmDomains.includes(domain);
                        return (
                          <button
                            key={domain}
                            type="button"
                            onClick={() => toggleSdtmDomain(domain)}
                            className={`py-2 rounded-lg border text-xs font-bold transition-all ${
                              active
                                ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/50"
                                : "bg-zinc-900 border-zinc-800 text-zinc-500 hover:text-zinc-300"
                            }`}
                          >
                            {domain}
                          </button>
                        );
                      })}
                    </div>
                    {errors.sdtmDomains && (
                      <p className="text-xs text-rose-500 mt-1 flex items-center gap-1">
                        <IconAlertTriangle className="w-3.5 h-3.5" />
                        <span>{errors.sdtmDomains}</span>
                      </p>
                    )}
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="block text-xs text-zinc-400 uppercase">Initial Auditor Suspicion</label>
                      <span className="text-xs text-emerald-400 font-bold">{validationErrorThreshold}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={validationErrorThreshold}
                      onChange={(e) => setValidationErrorThreshold(parseInt(e.target.value, 10))}
                      className="w-full accent-emerald-500 h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer"
                    />
                    <p className="text-[10px] text-zinc-500 mt-1">Starting level of FDA auditor concern/scrutiny.</p>
                  </div>
                </div>
              )}

              {/* 2. Garmin Watch fields */}
              {gameId === "garmin-watch" && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs text-zinc-400 mb-1.5 uppercase">Device Target Profile</label>
                    <div className="grid grid-cols-3 gap-2">
                      {(["fenix", "forerunner", "edge"] as const).map((device) => {
                        const labels = { fenix: "Fenix (32KB)", forerunner: "Forerunner (64KB)", edge: "Edge (128KB)" };
                        return (
                          <button
                            key={device}
                            type="button"
                            onClick={() => setDeviceTarget(device)}
                            className={`py-2 px-1 rounded-lg border text-xs font-bold transition-all ${
                              deviceTarget === device
                                ? "bg-amber-500/20 text-amber-400 border-amber-500/50"
                                : "bg-zinc-900 border-zinc-800 text-zinc-500 hover:text-zinc-300"
                            }`}
                          >
                            {labels[device]}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs text-zinc-400 mb-1.5 uppercase">Bezel Visual Theme</label>
                    <div className="grid grid-cols-4 gap-2">
                      {(["slate", "solar", "cyan", "neon"] as const).map((theme) => (
                        <button
                          key={theme}
                          type="button"
                          onClick={() => setBezelTheme(theme)}
                          className={`py-2 rounded-lg border text-xs capitalize transition-all ${
                            bezelTheme === theme
                              ? "bg-zinc-800 text-white border-zinc-600 font-bold"
                              : "bg-zinc-900 border-zinc-800 text-zinc-500 hover:text-zinc-300"
                          }`}
                        >
                          {theme}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="block text-xs text-zinc-400 uppercase">Initial Allocated Heap RAM</label>
                      <span className="text-xs text-amber-400 font-bold">{initialAllocationsKb} KB</span>
                    </div>
                    <input
                      type="number"
                      value={initialAllocationsKb}
                      onChange={(e) => setInitialAllocationsKb(parseInt(e.target.value, 10) || 0)}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                    />
                    <p className="text-[10px] text-zinc-500 mt-1">
                      Must not exceed the selected profile limit! (32KB fenix, 64KB forerunner, 128KB edge)
                    </p>
                    {errors.initialAllocationsKb && (
                      <p className="text-xs text-rose-500 mt-1.5 flex items-start gap-1">
                        <IconAlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                        <span>{errors.initialAllocationsKb}</span>
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* 3. Laser Loon fields */}
              {gameId === "laser-loon" && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs text-zinc-400 mb-1.5 uppercase">Starting Weapon Type</label>
                    <div className="grid grid-cols-2 gap-2">
                      {(["ruby-laser", "cyan-pulse", "aurora-wave", "ice-cannon"] as const).map((laser) => {
                        const labels = {
                          "ruby-laser": "Ruby Laser (Heat)",
                          "cyan-pulse": "Cyan Pulse (Shock)",
                          "aurora-wave": "Aurora Wave (Wide)",
                          "ice-cannon": "Ice Cannon (Freeze)"
                        };
                        return (
                          <button
                            key={laser}
                            type="button"
                            onClick={() => setLaserType(laser)}
                            className={`py-2.5 px-2 rounded-lg border text-xs font-bold text-left transition-all ${
                              laserType === laser
                                ? "bg-rose-500/20 text-rose-300 border-rose-500/50"
                                : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white"
                            }`}
                          >
                            {labels[laser]}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs text-zinc-400 mb-1.5 uppercase">Starting Campaign Act</label>
                    <div className="grid grid-cols-4 gap-2">
                      {([1, 2, 3, 4]).map((act) => (
                        <button
                          key={act}
                          type="button"
                          onClick={() => setInitialAct(act)}
                          className={`py-2 rounded-lg border text-xs font-bold transition-all ${
                            initialAct === act
                              ? "bg-rose-500/20 text-rose-300 border-rose-500/50"
                              : "bg-zinc-900 border-zinc-800 text-zinc-500 hover:text-zinc-300"
                          }`}
                        >
                          Act {act}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* 4. Retro Labyrinth fields */}
              {gameId === "retro-labyrinth" && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs text-zinc-400 mb-1.5 uppercase">Starter Cyberdeck Class</label>
                    <select
                      value={cyberdeckClass}
                      onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setCyberdeckClass(e.target.value as "script_kiddie" | "cryptanalyst" | "apt_specialist" | "hardware_hacker")}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                    >
                      <option value="script_kiddie">Script Kiddie (Basic Hacker)</option>
                      <option value="cryptanalyst">Cryptanalyst (RAM Optimized)</option>
                      <option value="apt_specialist">APT Specialist (Damage Heavy)</option>
                      <option value="hardware_hacker">Hardware Hacker (Tanky Specs)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs text-zinc-400 mb-1.5 uppercase">Dungeon Size</label>
                    <div className="grid grid-cols-3 gap-2">
                      {(["small", "medium", "large"] as const).map((size) => (
                        <button
                          key={size}
                          type="button"
                          onClick={() => setDungeonSize(size)}
                          className={`py-2 rounded-lg border text-xs capitalize transition-all ${
                            dungeonSize === size
                              ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/50 font-bold"
                              : "bg-zinc-900 border-zinc-800 text-zinc-500 hover:text-zinc-300"
                          }`}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="block text-xs text-zinc-400 uppercase">Security Tier Level</label>
                      <span className="text-xs text-emerald-400 font-bold">Tier {securityTier}</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="5"
                      value={securityTier}
                      onChange={(e) => setSecurityTier(parseInt(e.target.value, 10))}
                      className="w-full accent-emerald-500 h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-zinc-400 mb-1.5 uppercase">Starting Passive Exploit (CVE)</label>
                    <div className="grid grid-cols-2 gap-2">
                      {(["buffer_overflow", "sql_injection", "auth_bypass", "none"] as const).map((exp) => {
                        const labels = {
                          buffer_overflow: "Buffer Overflow",
                          sql_injection: "SQL Injection",
                          auth_bypass: "Auth Bypass",
                          none: "No Exploit"
                        };
                        return (
                          <button
                            key={exp}
                            type="button"
                            onClick={() => setStartingExploit(exp)}
                            className={`py-2 px-1.5 rounded-lg border text-[11px] font-bold transition-all ${
                              startingExploit === exp
                                ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/50"
                                : "bg-zinc-900 border-zinc-800 text-zinc-500 hover:text-zinc-300"
                            }`}
                          >
                            {labels[exp]}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* 5. Working with Duck fields */}
              {gameId === "working-with-duck" && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs text-zinc-400 mb-1.5 uppercase">Initial Puppy Behavior State</label>
                    <div className="grid grid-cols-3 gap-2">
                      {(["happy", "playful", "sleepy"] as const).map((mood) => (
                        <button
                          key={mood}
                          type="button"
                          onClick={() => setPuppyState(mood)}
                          className={`py-2 rounded-lg border text-xs capitalize transition-all ${
                            puppyState === mood
                              ? "bg-pink-500/20 text-pink-300 border-pink-500/50 font-bold"
                              : "bg-zinc-900 border-zinc-800 text-zinc-500 hover:text-zinc-300"
                          }`}
                        >
                          {mood}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="block text-xs text-zinc-400 uppercase">Office Safety Boundary X</label>
                      <span className="text-xs text-pink-300 font-bold">{officeBoundariesX}px</span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="200"
                      value={officeBoundariesX}
                      onChange={(e) => setOfficeBoundariesX(parseInt(e.target.value, 10))}
                      className="w-full accent-pink-500 h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="block text-xs text-zinc-400 uppercase">Office Safety Boundary Y</label>
                      <span className="text-xs text-pink-300 font-bold">{officeBoundariesY}px</span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="200"
                      value={officeBoundariesY}
                      onChange={(e) => setOfficeBoundariesY(parseInt(e.target.value, 10))}
                      className="w-full accent-pink-500 h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-zinc-400 mb-1.5 uppercase">Starting Level Sprint</label>
                    <div className="grid grid-cols-5 gap-2">
                      {([1, 2, 3, 4, 5]).map((sprint) => (
                        <button
                          key={sprint}
                          type="button"
                          onClick={() => setLevelSprint(sprint)}
                          className={`py-2 rounded-lg border text-xs font-bold transition-all ${
                            levelSprint === sprint
                              ? "bg-pink-500/20 text-pink-300 border-pink-500/50"
                              : "bg-zinc-900 border-zinc-800 text-zinc-500 hover:text-zinc-300"
                          }`}
                        >
                          S{sprint}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* 6. Quasi-Perfect Puzzler fields */}
              {gameId === "quasi-puzzler" && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs text-zinc-400 mb-1.5 uppercase">Proof Goal Theorem Target</label>
                    <select
                      value={proofGoal}
                      onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setProofGoal(e.target.value as "identity" | "double_negation" | "modus_ponens" | "syllogism")}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
                    >
                      <option value="identity">Identity (P ⊢ P)</option>
                      <option value="double_negation">Double Negation (P ⊢ ¬¬P)</option>
                      <option value="modus_ponens">Modus Ponens (P ∧ (P → Q) ⊢ Q)</option>
                      <option value="syllogism">Hypothetical Syllogism</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs text-zinc-400 mb-1.5 uppercase">Verified Tactic Selections</label>
                    <div className="grid grid-cols-2 gap-2">
                      {(["intro", "apply", "cases", "exact"] as const).map((tactic) => {
                        const active = tacticSelections.includes(tactic);
                        return (
                          <button
                            key={tactic}
                            type="button"
                            onClick={() => toggleTacticSelection(tactic)}
                            className={`py-2 px-1 rounded-lg border text-xs font-bold transition-all ${
                              active
                                ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/50"
                                : "bg-zinc-900 border-zinc-800 text-zinc-500 hover:text-zinc-300"
                            }`}
                          >
                            {tactic.toUpperCase()}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="block text-xs text-zinc-400 uppercase">Tactic Hand Limit</label>
                      <span className="text-xs text-cyan-300 font-bold">{handLimit} Tactics</span>
                    </div>
                    <input
                      type="range"
                      min="2"
                      max="10"
                      value={handLimit}
                      onChange={(e) => setHandLimit(parseInt(e.target.value, 10))}
                      className="w-full accent-cyan-500 h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4 font-mono text-sm text-zinc-300">
              <div className="flex items-center gap-2 text-sm text-zinc-300 border-b border-zinc-900 pb-2 mb-2 font-bold">
                <IconCheck className="w-5 h-5 text-emerald-400" />
                <span>Verification &amp; Config Handshake</span>
              </div>

              <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 space-y-2.5 text-xs text-zinc-400">
                <div className="flex justify-between border-b border-zinc-800 pb-1">
                  <span className="uppercase">Game Profile Target:</span>
                  <span className="text-white font-bold">{gameId}</span>
                </div>
                <div className="flex justify-between border-b border-zinc-800 pb-1">
                  <span className="uppercase">Player Nickname:</span>
                  <span className="text-white font-bold">{playerName}</span>
                </div>
                <div className="flex justify-between border-b border-zinc-800 pb-1">
                  <span className="uppercase">Global Difficulty:</span>
                  <span className="text-emerald-400 font-bold uppercase">{difficulty}</span>
                </div>

                {/* Game specific summaries */}
                {gameId === "clinical-chaos" && (
                  <>
                    <div className="flex justify-between border-b border-zinc-800 pb-1">
                      <span className="uppercase">SDTM Active Domains:</span>
                      <span className="text-emerald-300 font-bold">{sdtmDomains.join(", ")}</span>
                    </div>
                    <div className="flex justify-between pb-1">
                      <span className="uppercase">Initial Auditing Scrutiny:</span>
                      <span className="text-emerald-300 font-bold">{validationErrorThreshold}%</span>
                    </div>
                  </>
                )}

                {gameId === "garmin-watch" && (
                  <>
                    <div className="flex justify-between border-b border-zinc-800 pb-1">
                      <span className="uppercase">Device Specs Profiles:</span>
                      <span className="text-amber-400 font-bold uppercase">{deviceTarget}</span>
                    </div>
                    <div className="flex justify-between border-b border-zinc-800 pb-1">
                      <span className="uppercase">Watch Shell Theme:</span>
                      <span className="text-white capitalize">{bezelTheme}</span>
                    </div>
                    <div className="flex justify-between pb-1">
                      <span className="uppercase">Heap Memory Pre-allocation:</span>
                      <span className="text-amber-400 font-bold">{initialAllocationsKb} KB / {deviceTarget === "fenix" ? 32 : deviceTarget === "forerunner" ? 64 : 128} KB limit</span>
                    </div>
                  </>
                )}

                {gameId === "laser-loon" && (
                  <>
                    <div className="flex justify-between border-b border-zinc-800 pb-1">
                      <span className="uppercase">Assigned Starting Laser:</span>
                      <span className="text-rose-300 font-bold capitalize">{laserType.replace("-", " ")}</span>
                    </div>
                    <div className="flex justify-between pb-1">
                      <span className="uppercase">Starting Act Level:</span>
                      <span className="text-rose-300 font-bold">Act {initialAct}</span>
                    </div>
                  </>
                )}

                {gameId === "retro-labyrinth" && (
                  <>
                    <div className="flex justify-between border-b border-zinc-800 pb-1">
                      <span className="uppercase">Cyberdeck Hardware Class:</span>
                      <span className="text-emerald-400 font-bold capitalize">{cyberdeckClass.replace("_", " ")}</span>
                    </div>
                    <div className="flex justify-between border-b border-zinc-800 pb-1">
                      <span className="uppercase">Grid Dimensions Tier:</span>
                      <span className="text-white capitalize">{dungeonSize}</span>
                    </div>
                    <div className="flex justify-between border-b border-zinc-800 pb-1">
                      <span className="uppercase">Dungeon Security Level:</span>
                      <span className="text-white font-bold">Tier {securityTier}</span>
                    </div>
                    <div className="flex justify-between pb-1">
                      <span className="uppercase">Assigned CVE Modifiers:</span>
                      <span className="text-emerald-400 font-bold capitalize">{startingExploit.replace("_", " ")}</span>
                    </div>
                  </>
                )}

                {gameId === "working-with-duck" && (
                  <>
                    <div className="flex justify-between border-b border-zinc-800 pb-1">
                      <span className="uppercase">Starting Puppy Mood:</span>
                      <span className="text-pink-300 font-bold capitalize">{puppyState}</span>
                    </div>
                    <div className="flex justify-between border-b border-zinc-800 pb-1">
                      <span className="uppercase">Safety Play Boundaries:</span>
                      <span className="text-white">{officeBoundariesX}px × {officeBoundariesY}px</span>
                    </div>
                    <div className="flex justify-between pb-1">
                      <span className="uppercase">Target Level Sprint:</span>
                      <span className="text-pink-300 font-bold">Level {levelSprint}</span>
                    </div>
                  </>
                )}

                {gameId === "quasi-puzzler" && (
                  <>
                    <div className="flex justify-between border-b border-zinc-800 pb-1">
                      <span className="uppercase">Proof Theorem Target Goal:</span>
                      <span className="text-cyan-300 font-bold capitalize">{proofGoal.replace("_", " ")}</span>
                    </div>
                    <div className="flex justify-between border-b border-zinc-800 pb-1">
                      <span className="uppercase">Enabled Tactician Subgoals:</span>
                      <span className="text-white">{tacticSelections.map((t) => t.toUpperCase()).join(", ")}</span>
                    </div>
                    <div className="flex justify-between pb-1">
                      <span className="uppercase">Starting Hand Limit:</span>
                      <span className="text-cyan-300 font-bold">{handLimit} Tactics</span>
                    </div>
                  </>
                )}
              </div>

              <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-xl p-3.5 text-center text-xs text-emerald-400/90 font-mono">
                🚀 Dynamic client-side configurations validated. Ready to handshake and initialize active canvas loops!
              </div>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-between border-t border-zinc-800 pt-4 font-mono">
          <button
            type="button"
            onClick={handleBack}
            disabled={step === 1}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs border border-zinc-800 text-zinc-400 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-colors"
          >
            <IconArrowLeft className="w-3.5 h-3.5" />
            <span>Back</span>
          </button>

          {step < 3 ? (
            <button
              type="button"
              onClick={handleNext}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs bg-emerald-500 text-black font-bold hover:bg-emerald-400 transition-colors"
            >
              <span>Next Step</span>
              <IconArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleLaunch}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-lg text-xs bg-emerald-500 text-black font-bold hover:bg-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all animate-pulse"
            >
              <IconPlayerPlay className="w-3.5 h-3.5" />
              <span>Launch Simulator</span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
