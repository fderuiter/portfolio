"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import Link from "next/link";
import { useTelemetry } from "@/hooks/useTelemetry";
import { getClosestMatches, type CaseStudyItem } from "@/lib/search-utils";
import { useSearch } from "@/components/providers/SearchProvider";
import { generateDungeon, type DungeonState, type ArchivedRepoData } from "@/lib/dungeon-generator";

export default function NotFound() {
  const [mousePos, setMousePos] = useState({ x: 200, y: 200 });
  const [normalized, setNormalized] = useState({ x: 0.5, y: 0.5 });
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const hasTracked = useRef(false);
  const [invalidPath, setInvalidPath] = useState<string>("");
  const [caseStudies, setCaseStudies] = useState<CaseStudyItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Dungeon state
  const [repo, setRepo] = useState<ArchivedRepoData | null>(null);
  const [dungeon, setDungeon] = useState<DungeonState | null>(null);
  const [dungeonStatus, setDungeonStatus] = useState<"playing" | "won" | "lost" | "loading">("loading");
  const [gameLogs, setGameLogs] = useState<string[]>([]);

  const { recordEvent } = useTelemetry();
  const { openSearch } = useSearch();

  // Capture the path and track telemetry safely on-mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const currentPath = window.location.pathname;
      setTimeout(() => {
        setInvalidPath(currentPath);
      }, 0);

      if (!hasTracked.current) {
        hasTracked.current = true;
        recordEvent(currentPath, "route_error").catch((err: unknown) => {
          const errStr = err instanceof Error ? err.message : String(err);
          console.error("Failed to record route error telemetry:", errStr);
        });
      }
    }
  }, [recordEvent]);

  // Automatically center the cursor on first mount / resize
  useEffect(() => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setMousePos({ x: rect.width / 2, y: rect.height / 2 });
    }
  }, []);

  // Fetch the active case studies client-side from /api/case-studies
  useEffect(() => {
    const fetchStudies = async () => {
      try {
        const res = await fetch("/api/case-studies");
        if (res.ok) {
          const data = await res.json();
          setCaseStudies(data);
        }
      } catch (err: unknown) {
        const errStr = err instanceof Error ? err.message : String(err);
        console.error("Failed to fetch case studies for recovery suggestions:", errStr);
      } finally {
        setLoading(false);
      }
    };
    fetchStudies();
  }, []);

  // Fetch random archived repository and generate dungeon on-mount
  useEffect(() => {
    const fetchRandomRepo = async () => {
      try {
        const res = await fetch("/api/repositories/random");
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.repository) {
            setRepo(data.repository);
            const initialDungeon = generateDungeon(data.repository);
            setDungeon(initialDungeon);
            setDungeonStatus("playing");
            setGameLogs([
              `Entering the dungeon of "${data.repository.name}"!`,
              `Derived from: ${data.repository.commitCount} commits, ${data.repository.stars} stars.`,
              "Use WASD, Arrow keys, or the on-screen buttons to move and attack.",
            ]);
            return;
          }
        }
      } catch (err: unknown) {
        const errStr = err instanceof Error ? err.message : String(err);
        console.error("Failed to fetch random archived codebase, using fallback:", errStr);
      }
      // Fallback
      setRepo(null);
      const fallbackDungeon = generateDungeon(null);
      setDungeon(fallbackDungeon);
      setDungeonStatus("playing");
      setGameLogs([
        "Offline/Fallback mode activated.",
        "Use WASD, Arrow keys, or the on-screen buttons to explore.",
      ]);
    };

    fetchRandomRepo();
  }, []);

  // Player movement function
  const movePlayer = (dx: number, dy: number) => {
    if (!dungeon || dungeonStatus !== "playing") return;

    const nextX = dungeon.player.x + dx;
    const nextY = dungeon.player.y + dy;

    // Check bounds
    if (nextX < 0 || nextX >= dungeon.size || nextY < 0 || nextY >= dungeon.size) return;

    const cell = dungeon.grid[nextY][nextX];

    // If Wall
    if (cell === "#") {
      setGameLogs((prev) => [`Ouch! You bumped into a wall.`, ...prev].slice(0, 8));
      return;
    }

    const nextGrid = dungeon.grid.map((row) => [...row]);
    const nextPlayer = { ...dungeon.player };
    const nextEnemies = dungeon.enemies.map((e) => ({ ...e }));
    const nextLoot = dungeon.loot.map((l) => ({ ...l }));
    let nextStatus: "playing" | "won" | "lost" | "loading" = dungeonStatus;
    const newLogs = [...gameLogs];

    // If Enemy
    if (cell === "E") {
      const enemyIdx = nextEnemies.findIndex((e) => e.x === nextX && e.y === nextY);
      if (enemyIdx !== -1) {
        const enemy = nextEnemies[enemyIdx];
        // Player attacks enemy
        enemy.hp -= nextPlayer.atk;
        newLogs.unshift(`You hit ${enemy.name} for ${nextPlayer.atk} dmg! (${Math.max(0, enemy.hp)}/${enemy.maxHp} HP left)`);

        if (enemy.hp <= 0) {
          newLogs.unshift(`You defeated ${enemy.name}!`);
          nextEnemies.splice(enemyIdx, 1);
          // Move player into that cell
          nextGrid[dungeon.player.y][dungeon.player.x] = ".";
          nextPlayer.x = nextX;
          nextPlayer.y = nextY;
          nextGrid[nextY][nextX] = "@";
        } else {
          // Enemy counter-attacks
          nextPlayer.hp -= enemy.atk;
          newLogs.unshift(`${enemy.name} counter-attacks for ${enemy.atk} dmg!`);

          if (nextPlayer.hp <= 0) {
            nextPlayer.hp = 0;
            newLogs.unshift(`Game Over! You were defeated by ${enemy.name}.`);
            nextStatus = "lost";
          }
        }
      }
    }
    // If Loot
    else if (cell === "L") {
      const lootIdx = nextLoot.findIndex((l) => l.x === nextX && l.y === nextY);
      if (lootIdx !== -1) {
        const item = nextLoot[lootIdx];
        if (item.type === "weapon") {
          nextPlayer.atk += item.value;
          nextPlayer.weaponName = item.name;
          newLogs.unshift(`You found: ${item.name}! Attack power boosted.`);
        } else {
          nextPlayer.hp = Math.min(nextPlayer.maxHp, nextPlayer.hp + item.value);
          newLogs.unshift(`You consumed: ${item.name}! Restored ${item.value} HP.`);
        }
        nextLoot.splice(lootIdx, 1);
        
        // Move player
        nextGrid[dungeon.player.y][dungeon.player.x] = ".";
        nextPlayer.x = nextX;
        nextPlayer.y = nextY;
        nextGrid[nextY][nextX] = "@";
      }
    }
    // If Exit Door
    else if (cell === "D") {
      newLogs.unshift(`Success! You escaped the dungeon of "${repo ? repo.name : "Offline Codebase"}"!`);
      nextStatus = "won";
      
      // Move player
      nextGrid[dungeon.player.y][dungeon.player.x] = ".";
      nextPlayer.x = nextX;
      nextPlayer.y = nextY;
      nextGrid[nextY][nextX] = "@";
    }
    // If empty floor
    else if (cell === ".") {
      nextGrid[dungeon.player.y][dungeon.player.x] = ".";
      nextPlayer.x = nextX;
      nextPlayer.y = nextY;
      nextGrid[nextY][nextX] = "@";
    }

    setDungeon({
      ...dungeon,
      grid: nextGrid,
      player: nextPlayer,
      enemies: nextEnemies,
      loot: nextLoot,
    });
    setDungeonStatus(nextStatus);
    setGameLogs(newLogs.slice(0, 8));
  };

  // Setup keyboard listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (dungeonStatus !== "playing") return;

      const key = e.key.toLowerCase();
      if (key === "w" || key === "arrowup") {
        e.preventDefault();
        movePlayer(0, -1);
      } else if (key === "s" || key === "arrowdown") {
        e.preventDefault();
        movePlayer(0, 1);
      } else if (key === "a" || key === "arrowleft") {
        e.preventDefault();
        movePlayer(-1, 0);
      } else if (key === "d" || key === "arrowright") {
        e.preventDefault();
        movePlayer(1, 0);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [dungeon, dungeonStatus, gameLogs]);

  // Compute up to three closest matching case studies
  const matches = useMemo(() => {
    return getClosestMatches(invalidPath, caseStudies);
  }, [invalidPath, caseStudies]);

  const handleSuggestionClick = (slug: string) => {
    recordEvent(slug, "project_click").catch((err: unknown) => {
      const errStr = err instanceof Error ? err.message : String(err);
      console.error("Failed to record telemetry suggestion click:", errStr);
    });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Constrain within bounds
    const boundedX = Math.max(0, Math.min(x, rect.width));
    const boundedY = Math.max(0, Math.min(y, rect.height));

    const normX = boundedX / rect.width;
    const normY = boundedY / rect.height;

    setMousePos({ x: boundedX, y: boundedY });
    setNormalized({ x: normX, y: normY });

    // Tilt calculations
    const maxTilt = 8; // degrees max tilt
    const tiltX = -(normY - 0.5) * maxTilt;
    const tiltY = (normX - 0.5) * maxTilt;
    setTilt({ x: tiltX, y: tiltY });
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      // Smoothly animate back to center
      setTilt({ x: 0, y: 0 });
      setNormalized({ x: 0.5, y: 0.5 });
      setMousePos({ x: rect.width / 2, y: rect.height / 2 });
    }
    setIsHovered(false);
  };

  return (
    <main className="min-h-screen py-32 px-6 flex flex-col items-center justify-center bg-brand-dark text-foreground relative overflow-hidden select-none">
      {/* Background Blurs */}
      <div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-brand-cyan/5 blur-[120px] pointer-events-none transition-all duration-700" 
        style={{
          transform: `translate(-50%, -50%) translate(${(normalized.x - 0.5) * 40}px, ${(normalized.y - 0.5) * 40}px)`
        }}
      />
      
      <div 
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          transform: `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
          transition: isHovered ? "none" : "transform 0.5s cubic-bezier(0.25, 1, 0.5, 1)"
        }}
        className="relative z-10 w-full max-w-2xl p-8 bg-neutral-950/40 border border-neutral-900 rounded-3xl backdrop-blur-xl text-center shadow-2xl overflow-hidden group"
      >
        {/* Spotlight overlay effect following the mouse */}
        <div 
          className="absolute inset-0 pointer-events-none transition-opacity duration-300"
          style={{
            background: `radial-gradient(180px circle at ${mousePos.x}px ${mousePos.y}px, rgba(6, 182, 212, 0.08), transparent 80%)`,
            opacity: isHovered ? 1 : 0
          }}
        />

        {/* Lightweight grid background that shifts slightly */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.03]">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid-pattern" width="16" height="16" patternUnits="userSpaceOnUse">
                <path d="M 16 0 L 0 0 0 16" fill="none" stroke="currentColor" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid-pattern)" />
          </svg>
        </div>

        {/* Interactive target reticle/crosshair indicator */}
        <div 
          className="absolute pointer-events-none mix-blend-screen transition-all duration-75"
          style={{
            left: `${mousePos.x}px`,
            top: `${mousePos.y}px`,
            transform: "translate(-50%, -50%)",
            opacity: isHovered ? 0.75 : 0.2
          }}
        >
          {/* Target Reticle circle */}
          <div className="w-12 h-12 rounded-full border border-brand-cyan/30 flex items-center justify-center animate-spin">
            <div className="w-1.5 h-1.5 rounded-full bg-brand-cyan" />
          </div>
          {/* Subtle crosshairs extending from reticle */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-[1px] bg-brand-cyan/20 pointer-events-none" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-20 w-[1px] bg-brand-cyan/20 pointer-events-none" />
        </div>

        <span className="inline-block px-3 py-1 text-xs font-mono font-bold bg-neutral-900 border border-neutral-800 text-brand-cyan rounded-md mb-6 relative">
          ERROR 404
        </span>

        {/* Dynamic Coordinate readout displaying interactivity in real-time */}
        <div className="absolute top-4 right-4 font-mono text-[9px] text-neutral-600 space-y-0.5 text-right hidden sm:block">
          <div>LOC_X: {Math.round(mousePos.x)}px</div>
          <div>LOC_Y: {Math.round(mousePos.y)}px</div>
          <div>NORM: {normalized.x.toFixed(2)}, {normalized.y.toFixed(2)}</div>
        </div>

        <h1 className="text-4xl font-extrabold tracking-tight mb-4 select-none text-white">
          Route Unresolved
        </h1>

        <p className="text-sm text-neutral-400 leading-relaxed mb-6 select-none">
          The requested system node could not be resolved. Explore our procedurally generated codebase dungeon crawl below while you find your bearings.
        </p>

        {/* Playable Dungeon Section */}
        {dungeon ? (
          <div className="my-6 p-4 bg-neutral-950 border border-neutral-800 rounded-2xl text-left relative z-20">
            <span className="block text-[10px] font-mono font-bold text-neutral-400 uppercase tracking-widest mb-3 text-center">
              🕹️ Archived Dungeon Explorer
            </span>

            {/* Scale Explanation of metrics */}
            <div className="mb-4 text-[10px] font-mono text-neutral-400 border border-neutral-900 bg-neutral-900/30 p-2.5 rounded-xl space-y-1">
              {dungeon.scaleExplanation.map((line, idx) => (
                <div key={idx} className="truncate">
                  {idx === 0 ? <strong className="text-brand-cyan">{line}</strong> : line}
                </div>
              ))}
            </div>

            {/* Grid & Sidebar Layout */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-center">
              {/* Dungeon Map Grid */}
              <div className="p-3 bg-neutral-900 border border-neutral-800 rounded-xl font-mono text-xs select-none tracking-widest leading-none">
                {dungeon.grid.map((row, y) => (
                  <div key={y} className="flex justify-center h-4">
                    {row.map((char, x) => {
                      let color = "text-neutral-600";
                      const bg = "";
                      if (char === "@") {
                        color = "text-brand-cyan font-bold animate-pulse";
                      } else if (char === "E") {
                        color = "text-red-500 font-bold";
                      } else if (char === "L") {
                        color = "text-emerald-400 font-bold";
                      } else if (char === "D") {
                        color = "text-amber-500 font-bold underline";
                      } else if (char === "#") {
                        color = "text-neutral-700 bg-neutral-800/40";
                      } else if (char === ".") {
                        color = "text-neutral-500/60";
                      }
                      return (
                        <span key={x} className={`inline-block w-4 text-center font-bold ${color} ${bg}`}>
                          {char}
                        </span>
                      );
                    })}
                  </div>
                ))}
              </div>

              {/* Status and Log Column */}
              <div className="w-full flex-1 flex flex-col gap-3 font-mono">
                {/* Stats */}
                <div className="p-2.5 bg-neutral-900/60 border border-neutral-900 rounded-xl text-xs space-y-1.5">
                  <div className="flex justify-between items-center text-neutral-300">
                    <span>HP:</span>
                    <span className="font-bold text-brand-cyan">
                      {dungeon.player.hp}/{dungeon.player.maxHp}
                    </span>
                  </div>
                  {/* Health Bar */}
                  <div className="w-full h-1.5 bg-neutral-950 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-brand-cyan transition-all duration-300"
                      style={{ width: `${(dungeon.player.hp / dungeon.player.maxHp) * 100}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-neutral-400 text-[10px]">
                    <span>Atk: <strong className="text-neutral-200">{dungeon.player.atk}</strong></span>
                    <span className="truncate max-w-[120px]">Weapon: <strong className="text-neutral-200">{dungeon.player.weaponName}</strong></span>
                  </div>
                </div>

                {/* Game Action Log */}
                <div className="h-28 overflow-y-auto p-2 bg-neutral-950 border border-neutral-900 rounded-xl text-[10px] space-y-1 font-mono text-zinc-400">
                  {gameLogs.map((log, idx) => (
                    <div key={idx} className={idx === 0 ? "text-brand-cyan font-semibold" : ""}>
                      &gt; {log}
                    </div>
                  ))}
                  {gameLogs.length === 0 && <div className="text-neutral-600">Use D-Pad or Keys to start.</div>}
                </div>
              </div>
            </div>

            {/* Game Result Overlays */}
            {dungeonStatus !== "playing" && (
              <div className="mt-4 p-3 border rounded-xl text-center font-mono text-xs">
                {dungeonStatus === "won" && (
                  <div className="space-y-2">
                    <div className="text-emerald-400 font-bold">✨ YOU ESCAPED SUCCESSFULLY! ✨</div>
                    <p className="text-neutral-400 text-[10px]">You have successfully navigated the archived codebase.</p>
                    <button 
                      onClick={() => {
                        const nextDungeon = generateDungeon(repo);
                        setDungeon(nextDungeon);
                        setDungeonStatus("playing");
                        setGameLogs(["Restarted! Explore and find the exit.", ...gameLogs.slice(0, 3)]);
                      }}
                      className="px-3 py-1 bg-brand-cyan/10 hover:bg-brand-cyan/20 border border-brand-cyan/30 text-brand-cyan rounded text-[10px] font-bold cursor-pointer"
                    >
                      Play Again
                    </button>
                  </div>
                )}
                {dungeonStatus === "lost" && (
                  <div className="space-y-2">
                    <div className="text-red-500 font-bold">💀 GAME OVER - EXCEPTION TRIPPED 💀</div>
                    <p className="text-neutral-400 text-[10px]">Your connection was terminated by compilation errors.</p>
                    <button 
                      onClick={() => {
                        const nextDungeon = generateDungeon(repo);
                        setDungeon(nextDungeon);
                        setDungeonStatus("playing");
                        setGameLogs(["Revived! Have another try.", ...gameLogs.slice(0, 3)]);
                      }}
                      className="px-3 py-1 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-500 rounded text-[10px] font-bold cursor-pointer"
                    >
                      Revive Branch
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* D-Pad controls for touch / non-keyboard players */}
            <div className="mt-4 flex flex-col items-center gap-1 sm:hidden">
              <button 
                onClick={() => movePlayer(0, -1)}
                className="w-10 h-10 bg-neutral-900 border border-neutral-800 rounded-xl flex items-center justify-center text-neutral-400 active:bg-brand-cyan/10 active:text-brand-cyan font-bold"
              >
                ▲
              </button>
              <div className="flex gap-4">
                <button 
                  onClick={() => movePlayer(-1, 0)}
                  className="w-10 h-10 bg-neutral-900 border border-neutral-800 rounded-xl flex items-center justify-center text-neutral-400 active:bg-brand-cyan/10 active:text-brand-cyan font-bold"
                >
                  ◀
                </button>
                <div className="w-10" />
                <button 
                  onClick={() => movePlayer(1, 0)}
                  className="w-10 h-10 bg-neutral-900 border border-neutral-800 rounded-xl flex items-center justify-center text-neutral-400 active:bg-brand-cyan/10 active:text-brand-cyan font-bold"
                >
                  ▶
                </button>
              </div>
              <button 
                onClick={() => movePlayer(0, 1)}
                className="w-10 h-10 bg-neutral-900 border border-neutral-800 rounded-xl flex items-center justify-center text-neutral-400 active:bg-brand-cyan/10 active:text-brand-cyan font-bold"
              >
                ▼
              </button>
              <span className="text-[9px] text-neutral-600 mt-1 font-mono">Mobile D-Pad Controls</span>
            </div>
          </div>
        ) : (
          <div className="my-6 p-6 bg-neutral-950/40 border border-neutral-900 rounded-2xl flex flex-col items-center justify-center">
            <span className="animate-pulse text-xs font-mono text-neutral-500">
              Initializing procedural generator mapping...
            </span>
          </div>
        )}

        {/* Display Attempted Invalid URL Path */}
        {invalidPath && (
          <div className="mb-6 p-4 bg-neutral-950/80 border border-neutral-900/60 rounded-2xl text-left">
            <span className="block text-[10px] font-mono font-bold text-neutral-500 uppercase tracking-wider mb-1.5">
              Attempted System Path
            </span>
            <div className="font-mono text-xs text-brand-cyan/90 break-all select-all font-semibold">
              {invalidPath}
            </div>
          </div>
        )}

        {/* Closest Matching Case Study Suggestions */}
        {loading ? (
          <div className="mb-6 p-4 bg-neutral-950/40 border border-neutral-900/40 rounded-2xl flex items-center justify-center">
            <span className="animate-pulse text-xs font-mono text-neutral-500">
              Querying active partitions...
            </span>
          </div>
        ) : matches.length > 0 ? (
          <div className="mb-6 text-left">
            <span className="block text-[10px] font-mono font-bold text-neutral-400 uppercase tracking-widest mb-3">
              Dynamic Recovery Routes
            </span>
            <div className="space-y-3">
              {matches.map((study) => {
                const tagsList = typeof study.tags === "string"
                  ? study.tags.split(",").map((t: string) => t.trim())
                  : Array.isArray(study.tags)
                    ? study.tags
                    : [];

                return (
                  <Link
                    key={study.id}
                    href={`/case-studies/${study.slug}`}
                    onClick={() => handleSuggestionClick(study.slug)}
                    className="group block p-4 bg-neutral-950/60 hover:bg-neutral-900/60 border border-neutral-900 hover:border-brand-cyan/40 rounded-2xl transition-all duration-300 backdrop-blur-sm"
                  >
                    <div className="flex justify-between items-start gap-2 mb-1">
                      <h4 className="text-sm font-bold text-neutral-200 group-hover:text-brand-cyan transition-colors duration-250">
                        {study.title}
                      </h4>
                      <span className="shrink-0 px-2 py-0.5 text-[9px] font-mono font-bold bg-neutral-900 border border-neutral-800 text-brand-blue rounded">
                        {study.primary_language}
                      </span>
                    </div>
                    {tagsList.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2.5">
                        {tagsList.slice(0, 3).map((tag: string, idx: number) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 text-[9px] font-mono bg-neutral-900/50 border border-neutral-800/50 text-neutral-400 rounded-md"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ) : null}

        <div className="flex flex-col gap-3 mt-4 relative z-20">
          <button
            onClick={openSearch}
            className="inline-flex items-center justify-center w-full px-6 py-3 text-sm font-bold bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 hover:border-brand-cyan/40 text-brand-cyan rounded-2xl transition-all duration-300 shadow-lg cursor-pointer"
          >
            Search Site
          </button>

          <Link
            href="/"
            className="inline-flex items-center justify-center w-full px-6 py-3 text-sm font-semibold bg-transparent border border-neutral-900 hover:border-neutral-800 text-neutral-400 rounded-2xl transition-all duration-300 cursor-pointer"
          >
            Return to Core
          </Link>
        </div>
      </div>
    </main>
  );
}
