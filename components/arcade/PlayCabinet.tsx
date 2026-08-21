"use client";

import React, { useState, useEffect } from "react";
import { IconPlayerPlay, IconPower, IconTerminal, IconAdjustments } from "@tabler/icons-react";
import { PreGameSetupWizard, getSavedSetupConfig, GameSetupConfig } from "@/components/arcade/PreGameSetupWizard";

interface ControlItem {
  key: string;
  action: string;
}

interface PlayCabinetProps {
  gameId?: string;
  title: string;
  subtitle?: string;
  accentColor: "amber" | "red" | "purple" | "emerald" | "rose";
  icon: React.ReactNode;
  instructions: string;
  controls: ControlItem[];
  importComponent: () => Promise<unknown>;
  statusAnnouncement?: string;
  controlDock?: React.ReactNode;
  onLaunch?: () => void;
  onExit?: () => void;
  children: React.ReactNode;
}

export const PlayCabinet: React.FC<PlayCabinetProps> = ({
  gameId: rawGameId,
  title,
  subtitle,
  accentColor,
  icon,
  instructions,
  controls,
  importComponent,
  statusAnnouncement,
  controlDock,
  onLaunch,
  onExit,
  children,
}) => {
  const gameId = rawGameId || title.toLowerCase().replace(/[^a-z0-9]/g, "-");
  const [isLaunched, setIsLaunched] = useState(false);
  const [isPrefetched, setIsPrefetched] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isWarmingUp, setIsWarmingUp] = useState(false);
  const [bootProgress, setBootProgress] = useState(0);

  const [showWizard, setShowWizard] = useState(false);
  const [setupConfig, setSetupConfig] = useState<GameSetupConfig>(() => getSavedSetupConfig(gameId));

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
  }[accentColor || "amber"] || {
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
  };

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
    onLaunch?.();
  };

  useEffect(() => {
    if (!isWarmingUp) return;

    const updateProgress = () => {
      setBootProgress((prev) => {
        if (isLoaded) {
          const next = prev + Math.floor(Math.random() * 30) + 25;
          if (next >= 100) {
            setIsLaunched(true);
            setShowWizard(true);
            setIsWarmingUp(false);
            return 100;
          }
          return next;
        } else {
          if (prev >= 85) {
            return 85;
          }
          return prev + Math.floor(Math.random() * 10) + 10;
        }
      });
    };

    const timer = setInterval(updateProgress, 60);
    return () => clearInterval(timer);
  }, [isWarmingUp, isLoaded]);

  const handleExit = () => {
    setIsLaunched(false);
    setIsWarmingUp(false);
    setBootProgress(0);
    onExit?.();
  };

  if (isLaunched) {
    const bezelClasses = {
      classic: "border-amber-800/80 shadow-[0_0_30px_rgba(217,119,6,0.15)]",
      neon: "border-cyan-500/80 shadow-[0_0_30px_rgba(6,182,212,0.25)]",
      woodgrain: "border-yellow-600/80 shadow-[0_0_30px_rgba(234,179,8,0.2)]",
      minimal: "border-zinc-800/80 shadow-[0_0_30px_rgba(0,0,0,0.5)]",
    }[setupConfig.bezelStyle] || "border-zinc-800";

    return (
      <div
        className="relative w-full flex flex-col items-center max-w-full min-w-0 @container"
        style={
          {
            "--layout-dock-height": controlDock ? "120px" : "0px",
          } as React.CSSProperties
        }
      >
        {/* Accessible screen reader live status mirror */}
        <div
          role="region"
          aria-label="Game Telemetry & Status Announcements"
          aria-live="polite"
          aria-atomic="true"
          className="sr-only"
        >
          {statusAnnouncement || `${title} cabinet active.`}
        </div>

        {/* Game Area Container with Dynamic Viewport Height Budgeting */}
        <div
          className={`w-full relative rounded-2xl border-2 transition-all duration-300 overflow-hidden max-h-[var(--layout-viewport-budget,calc(100dvh-var(--header-height,80px)-var(--footer-height,48px)))] max-h-[calc(100dvh-var(--header-height,80px)-var(--footer-height,48px))] min-h-[280px] flex items-center justify-center bg-black ${bezelClasses}`}
        >
          {children}

          {/* 3-Step Setup Wizard Overlay prior to active gameplay / when reconfiguring */}
          <PreGameSetupWizard
            gameId={gameId}
            gameTitle={title}
            isOpen={showWizard}
            isCircularDisplay={gameId === "garmin-watch"}
            onComplete={(cfg) => {
              setSetupConfig(cfg);
              setShowWizard(false);
            }}
            onCancel={() => setShowWizard(false)}
          />
        </div>

        {/* Optional Control Dock Slot (e.g. Virtual Gamepad, Bezel cluster) */}
        {controlDock && (
          <div className="w-full mt-3 flex justify-center">
            {controlDock}
          </div>
        )}

        {/* Discrete Retro Controller Menu */}
        <div className="mt-4 flex items-center justify-between w-full border border-zinc-800 bg-zinc-900/60 rounded-2xl px-4 py-2 font-mono text-xs text-zinc-500 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="uppercase tracking-wider">Cabinet Engaged</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowWizard(true)}
              className="px-3 py-1 bg-zinc-950 text-amber-400 hover:text-amber-300 rounded-lg border border-amber-500/30 transition-all font-bold uppercase text-[10px] tracking-wider flex items-center gap-1 hover:bg-zinc-900 hover:border-amber-500/50 cursor-pointer focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:outline-none"
            >
              <IconAdjustments className="w-3.5 h-3.5 text-amber-400" />
              <span>Setup Wizard</span>
            </button>

            <button
              onClick={handleExit}
              className="px-3 py-1 bg-zinc-950 text-zinc-400 hover:text-white rounded-lg border border-zinc-800 transition-all font-bold uppercase text-[10px] tracking-wider flex items-center gap-1 hover:bg-zinc-900 hover:border-zinc-700 cursor-pointer focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:outline-none"
            >
              <IconPower className="w-3.5 h-3.5 text-red-500" />
              <span>Reset Cabinet</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`w-full ${colors.shadow} transition-all duration-300`}>
      {/* Static Retro Cabinet Preview Screen with scanlines */}
      <div 
        className="w-full aspect-[16/10] min-h-[380px] rounded-2xl border border-zinc-800 bg-zinc-950 flex flex-col justify-between p-6 sm:p-8 relative overflow-hidden select-none"
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
            <div className="flex-1 flex flex-col items-center justify-center text-center my-6 max-w-xl mx-auto z-10">
              <div className={`p-4 rounded-full bg-zinc-900/60 border border-zinc-800/80 text-white mb-4 shadow-inner group-hover:scale-105 transition-transform`}>
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
              <p className="text-xs text-zinc-400 font-mono mt-3 leading-relaxed">
                {instructions}
              </p>
            </div>

            {/* Bottom Actions & Controls HUD */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center pt-4 border-t border-zinc-800/60 z-10">
              {/* Controls display */}
              <div className="hidden md:flex flex-wrap gap-2 font-mono text-[10px]">
                {controls?.slice(0, 3).map((ctrl, idx) => (
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
