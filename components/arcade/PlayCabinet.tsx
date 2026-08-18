"use client";

import React, { useState, useEffect } from "react";
import { IconPlayerPlay, IconPower, IconTerminal, IconAdjustmentsHorizontal, IconDice } from "@tabler/icons-react";
import {
  ArcadeBaseGameConfig,
  PreflightControlField,
  getGamePreflightFields,
} from "@/lib/arcade-config";

interface ControlItem {
  key: string;
  action: string;
}

export interface PlayCabinetProps {
  title: string;
  subtitle?: string;
  accentColor: "amber" | "red" | "purple" | "emerald" | "rose";
  icon: React.ReactNode;
  instructions: string;
  controls: ControlItem[];
  importComponent: () => Promise<unknown>;
  gameId?: string;
  preflightOptions?: PreflightControlField[];
  initialConfig?: ArcadeBaseGameConfig;
  onConfigChange?: (config: ArcadeBaseGameConfig) => void;
  children: React.ReactNode | ((config: ArcadeBaseGameConfig) => React.ReactNode);
}

function cloneWithProps(children: React.ReactNode, config: ArcadeBaseGameConfig): React.ReactNode {
  if (typeof children === "function") {
    return (children as (cfg: ArcadeBaseGameConfig) => React.ReactNode)(config);
  }
  if (!React.isValidElement(children)) {
    return children;
  }

  const element = children as React.ReactElement<Record<string, unknown>>;
  const elementProps = element.props || {};

  const newProps: Record<string, unknown> = {
    ...config,
    initialConfig: config,
    ...elementProps,
  };

  if (elementProps.children && React.isValidElement(elementProps.children)) {
    newProps.children = cloneWithProps(elementProps.children, config);
  }

  return React.cloneElement(element, newProps);
}

export const PlayCabinet: React.FC<PlayCabinetProps> = ({
  title,
  subtitle,
  accentColor,
  icon,
  instructions,
  controls,
  importComponent,
  gameId,
  preflightOptions,
  initialConfig,
  onConfigChange,
  children,
}) => {
  const [isLaunched, setIsLaunched] = useState(false);
  const [isPrefetched, setIsPrefetched] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isWarmingUp, setIsWarmingUp] = useState(false);
  const [bootProgress, setBootProgress] = useState(0);

  const fields = preflightOptions || getGamePreflightFields(gameId || title);

  const [config, setConfig] = useState<ArcadeBaseGameConfig>(() => {
    const defaults: ArcadeBaseGameConfig = {};
    fields.forEach((f) => {
      defaults[f.id] = f.defaultValue;
    });
    return { ...defaults, ...initialConfig };
  });

  const handleFieldChange = (id: string, value: string | number) => {
    const updated = { ...config, [id]: value };
    setConfig(updated);
    if (onConfigChange) onConfigChange(updated);
  };

  const handleRandomizeSeed = () => {
    const newSeed = Math.floor(Math.random() * 899999 + 100000);
    handleFieldChange("seed", newSeed);
  };

  const colors = {
    amber: {
      border: "border-amber-500/30",
      borderHover: "hover:border-amber-400/50",
      bgGlow: "bg-amber-500/5",
      text: "text-amber-400",
      textDark: "text-amber-600",
      shadow: "shadow-amber-500/10",
      buttonBg: "bg-amber-500",
      buttonHover: "hover:bg-amber-400",
      buttonBorder: "border-amber-700",
      buttonShadow: "shadow-amber-500/40",
      accent: "amber",
    },
    red: {
      border: "border-red-500/30",
      borderHover: "hover:border-red-400/50",
      bgGlow: "bg-red-500/5",
      text: "text-red-400",
      textDark: "text-red-600",
      shadow: "shadow-red-500/10",
      buttonBg: "bg-red-500",
      buttonHover: "hover:bg-red-400",
      buttonBorder: "border-red-700",
      buttonShadow: "shadow-red-500/40",
      accent: "red",
    },
    purple: {
      border: "border-purple-500/30",
      borderHover: "hover:border-purple-400/50",
      bgGlow: "bg-purple-500/5",
      text: "text-purple-400",
      textDark: "text-purple-600",
      shadow: "shadow-purple-500/10",
      buttonBg: "bg-purple-500",
      buttonHover: "hover:bg-purple-400",
      buttonBorder: "border-purple-700",
      buttonShadow: "shadow-purple-500/40",
      accent: "purple",
    },
    emerald: {
      border: "border-emerald-500/30",
      borderHover: "hover:border-emerald-400/50",
      bgGlow: "bg-emerald-500/5",
      text: "text-emerald-400",
      textDark: "text-emerald-600",
      shadow: "shadow-emerald-500/10",
      buttonBg: "bg-emerald-500",
      buttonHover: "hover:bg-emerald-400",
      buttonBorder: "border-emerald-700",
      buttonShadow: "shadow-emerald-500/40",
      accent: "emerald",
    },
    rose: {
      border: "border-rose-500/30",
      borderHover: "hover:border-rose-400/50",
      bgGlow: "bg-rose-500/5",
      text: "text-rose-400",
      textDark: "text-rose-600",
      shadow: "shadow-rose-500/10",
      buttonBg: "bg-rose-500",
      buttonHover: "hover:bg-rose-400",
      buttonBorder: "border-rose-700",
      buttonShadow: "shadow-rose-500/40",
      accent: "rose",
    },
  }[accentColor];

  const handlePrefetch = () => {
    if (!isPrefetched) {
      setIsPrefetched(true);
      importComponent()
        .then(() => {
          setIsLoaded(true);
        })
        .catch((err) => {
          console.error("Prefetch failed:", err);
          setIsPrefetched(false);
        });
    }
  };

  const handleLaunch = () => {
    handlePrefetch();
    setIsWarmingUp(true);
    setBootProgress(0);
  };

  useEffect(() => {
    if (!isWarmingUp) return;

    const updateProgress = () => {
      setBootProgress((prev) => {
        // If loaded, we can accelerate to 100 quickly
        if (isLoaded) {
          const next = prev + Math.floor(Math.random() * 30) + 15;
          if (next >= 100) {
            setIsLaunched(true);
            setIsWarmingUp(false);
            return 100;
          }
          return next;
        } else {
          // If not loaded, we cap it at 85 until loaded is true
          if (prev >= 85) {
            return 85;
          }
          return prev + Math.floor(Math.random() * 10) + 5;
        }
      });
    };

    const timer = setInterval(updateProgress, 100);
    return () => clearInterval(timer);
  }, [isWarmingUp, isLoaded]);

  const handleExit = () => {
    setIsLaunched(false);
    setIsWarmingUp(false);
    setBootProgress(0);
  };

  if (isLaunched) {
    return (
      <div className="relative w-full flex flex-col items-center">
        {/* Game Area Container with Reset Cabinet Button overlay */}
        <div className="w-full relative">
          {typeof children === "function"
            ? (children as (cfg: ArcadeBaseGameConfig) => React.ReactNode)(config)
            : cloneWithProps(children as React.ReactElement, config)}
        </div>
        
        {/* Discrete Retro Controller Menu */}
        <div className="mt-4 flex items-center justify-between w-full border border-zinc-800 bg-zinc-900/60 rounded-2xl px-4 py-2 font-mono text-xs text-zinc-500">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="uppercase tracking-wider">Cabinet Engaged</span>
            {config.seed !== undefined && (
              <span className="ml-2 text-[10px] text-zinc-400 bg-zinc-950 px-2 py-0.5 rounded border border-zinc-800">
                SEED: {String(config.seed)}
              </span>
            )}
          </div>
          <button
            onClick={handleExit}
            className={`px-3 py-1 bg-zinc-950 text-zinc-400 hover:text-white rounded-lg border border-zinc-800 transition-all font-bold uppercase text-[10px] tracking-wider flex items-center gap-1 hover:bg-zinc-900 hover:border-zinc-700`}
          >
            <IconPower className="w-3.5 h-3.5 text-red-500" />
            <span>Reset Cabinet</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`w-full ${colors.shadow} transition-all duration-300`}>
      {/* Static Retro Cabinet Preview Screen with scanlines */}
      <div 
        className="w-full min-h-[420px] rounded-2xl border border-zinc-800 bg-zinc-950 flex flex-col justify-between p-6 sm:p-8 relative overflow-hidden select-none"
        style={{
          backgroundImage: "radial-gradient(circle at center, #09090b 40%, #020202 100%)"
        }}
      >
        {/* Scanlines Effect */}
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,255,255,0),rgba(255,255,255,0)_50%,rgba(0,0,0,0.45)_50%,rgba(0,0,0,0.45))] bg-[size:100%_4px] pointer-events-none z-10" />

        {isWarmingUp ? (
          /* CRT Warming up / Booting Screen */
          <div className="flex-1 flex flex-col justify-between font-mono text-xs text-emerald-400 z-10 p-2">
            <div className="space-y-1.5 uppercase tracking-wide">
              <div className="flex items-center gap-2 text-[10px]">
                <IconTerminal className="w-4 h-4 text-emerald-500" />
                <span>SYSTEM DIAGNOSTICS DEPLOYING...</span>
              </div>
              <div className="text-zinc-600 mt-2">=================================</div>
              <div>&gt; INITIALIZING PORT CLIENT... <span className="text-emerald-500">OK</span></div>
              <div>&gt; ISOLATING ENGINE MEMORY... <span className="text-emerald-500">COMPLETE</span></div>
              <div>&gt; APPLYING PRE-FLIGHT PROPS... <span className="text-emerald-500">APPLIED</span></div>
              <div>&gt; INITIALIZING SEED ({String(config.seed)})... <span className="text-emerald-500">DETERMINISTIC</span></div>
              <div>&gt; CONSTRUCTING AUDIO GRAPH... <span className="text-emerald-500">READY</span></div>
              {bootProgress > 50 && (
                <div>&gt; ESTABLISHING BUFFER CANVAS PORT... <span className="text-emerald-500">STABLE</span></div>
              )}
              {bootProgress > 75 && (
                <div>&gt; DYNAMICALLY MOUNTING GAME CHUNK... <span className="text-emerald-500">MOUNTED</span></div>
              )}
            </div>

            <div className="space-y-2 mt-4">
              <div className="flex justify-between items-center text-[10px]">
                <span className="animate-pulse">Warming up CRT display...</span>
                <span>{bootProgress}%</span>
              </div>
              <div className="w-full h-2.5 bg-zinc-900 rounded-full border border-zinc-800 overflow-hidden shadow-[0_0_8px_#10b981]">
                <div 
                  className="h-full w-full bg-emerald-500 origin-left transform-gpu"
                  style={{
                    transform: `scaleX(${bootProgress / 100})`,
                    transformOrigin: "left",
                    willChange: "transform",
                  }}
                />
              </div>
            </div>
          </div>
        ) : (
          /* Static Screen Idle State */
          <>
            {/* Header Status Bar */}
            <div className="flex items-center justify-between border-b border-zinc-800/80 pb-4 font-mono text-[10px] text-zinc-500 z-10">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${isPrefetched ? "bg-amber-400" : "bg-zinc-600"} animate-pulse`} />
                <span className="uppercase tracking-wider">
                  {isPrefetched ? (isLoaded ? "Engine Cached" : "Prefetching Engine...") : "Cabinet Standby"}
                </span>
              </div>
              <span className="uppercase tracking-widest text-[9px] text-zinc-600">FDR PORTFOLIO ARCADE v2.6</span>
            </div>

            {/* Cabinet Game Display Details */}
            <div className="flex-1 flex flex-col items-center justify-center text-center my-4 max-w-2xl mx-auto z-10 w-full">
              <div className={`p-3.5 rounded-full bg-zinc-900/60 border border-zinc-800/80 text-white mb-3 shadow-inner group-hover:scale-105 transition-transform`}>
                {icon}
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold font-mono text-white tracking-tight uppercase">
                {title}
              </h2>
              {subtitle && (
                <p className={`text-[10px] font-mono ${colors.text} uppercase tracking-widest mt-1 font-bold`}>
                  {subtitle}
                </p>
              )}
              <p className="text-xs text-zinc-400 font-mono mt-2 leading-relaxed max-w-lg">
                {instructions}
              </p>

              {/* Dynamic Pre-flight Parameter Selector Panel */}
              <div className="mt-5 w-full bg-zinc-900/70 border border-zinc-800/90 rounded-xl p-3.5 font-mono text-xs text-left shadow-inner">
                <div className="flex items-center justify-between border-b border-zinc-800/80 pb-2 mb-3">
                  <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-zinc-300">
                    <IconAdjustmentsHorizontal className={`w-4 h-4 ${colors.text}`} />
                    <span>Pre-Flight Launch Configuration</span>
                  </div>
                  <div className="text-[9px] uppercase tracking-widest text-zinc-500">
                    Prop Injection Active
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {fields.map((field) => {
                    if (field.id === "seed") {
                      return (
                        <div key={field.id} className="sm:col-span-2 lg:col-span-1 space-y-1">
                          <label className="block text-[10px] uppercase font-bold text-zinc-400 tracking-wider">
                            {field.label}
                          </label>
                          <div className="flex items-center gap-1.5">
                            <input
                              type="text"
                              value={String(config[field.id] ?? field.defaultValue)}
                              onChange={(e) => handleFieldChange(field.id, e.target.value)}
                              className="w-full bg-zinc-950 border border-zinc-700/80 rounded px-2.5 py-1 text-xs text-amber-300 font-bold focus:outline-none focus:border-amber-500"
                              placeholder="e.g. 12345"
                            />
                            <button
                              type="button"
                              onClick={handleRandomizeSeed}
                              title="Randomize Seed"
                              className="px-2 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded border border-zinc-700 flex items-center gap-1 text-[10px] font-bold whitespace-nowrap transition-colors"
                            >
                              <IconDice className="w-3.5 h-3.5 text-amber-400" />
                              <span>Rand</span>
                            </button>
                          </div>
                        </div>
                      );
                    }

                    return (
                      <div key={field.id} className="space-y-1">
                        <label className="block text-[10px] uppercase font-bold text-zinc-400 tracking-wider">
                          {field.label}
                        </label>
                        <select
                          value={String(config[field.id] ?? field.defaultValue)}
                          onChange={(e) => {
                            const val = field.options?.find((o) => String(o.value) === e.target.value)?.value;
                            handleFieldChange(field.id, val !== undefined ? val : e.target.value);
                          }}
                          className="w-full bg-zinc-950 border border-zinc-700/80 rounded px-2.5 py-1 text-xs text-zinc-200 font-bold focus:outline-none focus:border-amber-500 cursor-pointer"
                        >
                          {field.options?.map((opt) => (
                            <option key={String(opt.value)} value={String(opt.value)}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Bottom Actions & Controls HUD */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center pt-4 border-t border-zinc-800/60 z-10">
              {/* Controls display */}
              <div className="hidden md:flex flex-wrap gap-2 font-mono text-[10px]">
                {controls.slice(0, 3).map((ctrl, idx) => (
                  <div key={idx} className="flex items-center gap-1.5 bg-zinc-900/80 border border-zinc-800/80 px-2 py-1 rounded-md text-zinc-400">
                    <span className="px-1.5 py-0.5 bg-zinc-950 text-white border border-zinc-700 rounded text-[9px] font-bold">
                      {ctrl.key}
                    </span>
                    <span>{ctrl.action}</span>
                  </div>
                ))}
              </div>

              {/* Glowing Play Button */}
              <div className="flex justify-end w-full">
                <button
                  onMouseEnter={handlePrefetch}
                  onFocus={handlePrefetch}
                  onClick={handleLaunch}
                  className={`w-full md:w-auto px-8 py-3.5 ${colors.buttonBg} ${colors.buttonHover} text-black font-extrabold rounded-xl border-b-4 ${colors.buttonBorder} hover:border-b-2 active:border-b-0 active:translate-y-1 transition-all duration-70s flex items-center justify-center gap-2 font-mono text-xs sm:text-sm tracking-wider shadow-lg ${colors.buttonShadow} uppercase`}
                >
                  <IconPlayerPlay className="w-4 h-4 fill-black text-black" />
                  <span>Launch Cabinet</span>
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

