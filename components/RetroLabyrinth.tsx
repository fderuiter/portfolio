"use client";

import React, { useState, useEffect, useRef, useCallback, useSyncExternalStore } from "react";
import { useTelemetry } from "@/hooks/useTelemetry";
import { useAudio } from "@/components/providers/AudioProvider";
import {
  IconTrophy,
  IconRefresh,
  IconArrowRight,
  IconCheck,
  IconFileText,
  IconMaximize,
  IconMinimize,
} from "@tabler/icons-react";
import {
  ActiveSideEffect,
  BossState,
  DEFAULT_WEAPONS,
  DungeonRoom,
  Enemy,
  FloatingNotification,
  ItemPickup,
  ParticleEffect,
  Weapon,
  WeaponId,
  calculateFOV,
  computeShortestTour,
  fireWeapon,
  generateClassicStage1,
  generateClassicStage2,
  generateRoguelikeCampaign,
  generateTSPRoom,
  renderWireframeMesh,
  updateEnemyAI,
  updateFaceForgeBoss,
  updateTSPMovingWalls,
  STAGE_1_MAZE,
} from "@/lib/dungeon";

const MAZE = STAGE_1_MAZE;

const START_X = 1;
const START_Y = 1;
const EXIT_X = 13;
const EXIT_Y = 7;

interface Drone {
  x: number;
  y: number;
  dir: "left" | "right" | "up" | "down";
  minX: number;
  maxX: number;
}

interface RetroLabyrinthProps {
  isMounted: boolean;
}

const subscribeHighScore = (callback: () => void) => {
  if (typeof window === "undefined") return () => {};
  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
};
const getHighScoreSnapshot = () => {
  try {
    return localStorage.getItem("retro_labyrinth_highscore") || "0";
  } catch {
    return "0";
  }
};
const getHighScoreServerSnapshot = () => "0";

export const RetroLabyrinth: React.FC<RetroLabyrinthProps> = ({ isMounted }) => {
  const rawHighScore = useSyncExternalStore(
    subscribeHighScore,
    getHighScoreSnapshot,
    getHighScoreServerSnapshot
  );
  const loadedHighScore = parseInt(rawHighScore, 10) || 0;

  // Game mode & stage
  const [gameMode, setGameMode] = useState<"roguelike" | "classic">("roguelike");
  const [stage, setStage] = useState<number>(1);
  const [roomIndex, setRoomIndex] = useState<number>(0);
  const [campaignRooms, setCampaignRooms] = useState<DungeonRoom[]>(() =>
    generateRoguelikeCampaign()
  );

  // Active room & grid
  const [currentMaze, setCurrentMaze] = useState<string[][]>(STAGE_1_MAZE);
  const [playerPosition, setPlayerPosition] = useState({ x: START_X, y: START_Y });
  const [playerHp, setPlayerHp] = useState(100);
  const [maxPlayerHp] = useState(100);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const effectiveHighScore = Math.max(highScore, loadedHighScore);
  const [movesCount, setMovesCount] = useState(0);

  // Game lifecycle status
  const [gameStatus, setGameStatus] = useState<"playing" | "victory" | "caught" | "timesheet">("playing");
  const [isFocused, setIsFocused] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  // Combat & Weapons
  const [weapons, setWeapons] = useState<Record<WeaponId, Weapon>>(DEFAULT_WEAPONS);
  const [activeWeaponId, setActiveWeaponId] = useState<WeaponId>("npm_install");
  const [dronesStunned, setDronesStunned] = useState(false);
  const [activeSideEffect, setActiveSideEffect] = useState<ActiveSideEffect | null>(null);

  // Room Entities
  const [enemies, setEnemies] = useState<Enemy[]>([]);
  const [items, setItems] = useState<ItemPickup[]>([]);
  const [boss, setBoss] = useState<BossState | undefined>(undefined);
  const [tspNodes, setTspNodes] = useState(generateTSPRoom().tspNodes || []);
  const [tspWalls, setTspWalls] = useState(generateTSPRoom().tspMovingWalls || []);

  // Backward compatibility state for Stage 2 Drone
  const [drones, setDrones] = useState<Drone[]>([]);

  // Field of View & Exploration
  const [exploredMap, setExploredMap] = useState<boolean[][]>(() =>
    Array.from({ length: 9 }, () => Array(15).fill(false))
  );
  const [visibleMap, setVisibleMap] = useState<boolean[][]>(() =>
    Array.from({ length: 9 }, () => Array(15).fill(true))
  );

  // FX: Particles & Floating texts
  const particlesRef = useRef<ParticleEffect[]>([]);
  const floatingTextsRef = useRef<FloatingNotification[]>([]);
  const animFrameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);
  const cursorGridPosRef = useRef<{ x: number; y: number } | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { recordEvent } = useTelemetry();
  const { playNote, playSuccess } = useAudio();

  // Focus management
  const handleFocus = () => setIsFocused(true);
  const handleBlur = () => setIsFocused(false);

  // Initialize or Switch to a specific Room / Stage
  const loadRoom = useCallback(
    (mode: "roguelike" | "classic", targetStageOrIndex: number) => {
      setGameMode(mode);
      setMovesCount(0);
      setDronesStunned(false);
      setActiveSideEffect(null);
      setGameStatus("playing");

      if (mode === "classic") {
        setStage(targetStageOrIndex);
        const classicRoom =
          targetStageOrIndex === 2 ? generateClassicStage2() : generateClassicStage1();
        setCurrentMaze(classicRoom.grid);
        setPlayerPosition({ x: classicRoom.startX, y: classicRoom.startY });
        setEnemies(classicRoom.enemies);
        setItems([]);
        setBoss(undefined);
        if (targetStageOrIndex === 2) {
          setDrones([{ x: 6, y: 5, dir: "right", minX: 5, maxX: 9 }]);
        } else {
          setDrones([]);
        }
        // Initialize full visibility for classic baseline
        setVisibleMap(Array.from({ length: 9 }, () => Array(15).fill(true)));
        setExploredMap(Array.from({ length: 9 }, () => Array(15).fill(true)));
      } else {
        const campaign = generateRoguelikeCampaign();
        setCampaignRooms(campaign);
        const idx = Math.max(0, Math.min(campaign.length - 1, targetStageOrIndex));
        setRoomIndex(idx);
        const currentRoom = campaign[idx];
        setStage(idx + 1);
        setCurrentMaze(currentRoom.grid);
        setPlayerPosition({ x: currentRoom.startX, y: currentRoom.startY });
        setEnemies(currentRoom.enemies);
        setItems(currentRoom.items);
        setBoss(currentRoom.boss);
        setTspNodes(currentRoom.tspNodes || []);
        setTspWalls(currentRoom.tspMovingWalls || []);
        setDrones(
          currentRoom.enemies
            .filter((e) => e.type === "drone")
            .map((d) => ({
              x: d.x,
              y: d.y,
              dir: d.patrolDir,
              minX: d.minX ?? 0,
              maxX: d.maxX ?? 14,
            }))
        );

        // Compute initial FOV
        const fov = calculateFOV(currentRoom.grid, currentRoom.startX, currentRoom.startY, 7);
        setVisibleMap(fov.visible);
        setExploredMap(fov.explored);
      }
    },
    []
  );

  // Switch Stage (classic support)
  const switchStage = useCallback(
    (stgNum: number) => {
      loadRoom("classic", stgNum);
    },
    [loadRoom]
  );

  // Restart current stage
  const handleRestart = useCallback(() => {
    if (gameMode === "classic") {
      loadRoom("classic", stage);
    } else {
      loadRoom("roguelike", roomIndex);
    }
  }, [gameMode, stage, roomIndex, loadRoom]);

  // Advance to next room in roguelike campaign
  const handleNextRoom = useCallback(() => {
    if (roomIndex < campaignRooms.length - 1) {
      loadRoom("roguelike", roomIndex + 1);
    } else {
      // Loop or restart campaign
      loadRoom("roguelike", 0);
    }
  }, [roomIndex, campaignRooms.length, loadRoom]);

  // Switch to Roguelike Campaign
  const startRoguelikeCampaign = useCallback(() => {
    setPlayerHp(100);
    setScore(0);
    loadRoom("roguelike", 0);
  }, [loadRoom]);

  // Attempt player move
  const tryMove = useCallback(
    (dx: number, dy: number) => {
      if (gameStatus !== "playing") return;

      const nextX = playerPosition.x + dx;
      const nextY = playerPosition.y + dy;

      // Boundary & Wall check
      if (
        nextY >= 0 &&
        nextY < currentMaze.length &&
        nextX >= 0 &&
        nextX < currentMaze[0].length &&
        currentMaze[nextY][nextX] !== "#" &&
        currentMaze[nextY][nextX] !== "W"
      ) {
        const nextMoves = movesCount + 1;
        setPlayerPosition({ x: nextX, y: nextY });
        setMovesCount(nextMoves);

        // Sound feedback
        playNote(523.25 + (nextX + nextY) * 20, 0.02);

        // Update FOV in Roguelike mode
        if (gameMode === "roguelike") {
          const fov = calculateFOV(currentMaze, nextX, nextY, 7, exploredMap);
          setVisibleMap(fov.visible);
          setExploredMap(fov.explored);
        }

        // Room 1 (TSP): Dynamic wall shifting & node collection
        if (gameMode === "roguelike" && roomIndex === 0) {
          const { updatedGrid, updatedWalls } = updateTSPMovingWalls(
            currentMaze,
            tspWalls,
            nextMoves
          );
          setCurrentMaze(updatedGrid);
          setTspWalls(updatedWalls);

          // Check TSP landmark visits
          setTspNodes((prev) =>
            prev.map((node) => {
              if (!node.visited && node.x === nextX && node.y === nextY) {
                playSuccess();
                setScore((s) => s + 200);
                floatingTextsRef.current.push({
                  id: `tsp-node-${Date.now()}`,
                  x: nextX,
                  y: nextY,
                  text: "TSP LANDMARK VISITED! +200 PTS",
                  color: "#06b6d4",
                  alpha: 1,
                  vy: -0.02,
                });
                return { ...node, visited: true };
              }
              return node;
            })
          );
        }

        // Item Collection check
        setItems((prevItems) =>
          prevItems.map((item) => {
            if (!item.collected && item.x === nextX && item.y === nextY) {
              playNote(784, 0.1);
              if (item.itemId === "node_modules") {
                setWeapons((w) => ({
                  ...w,
                  npm_install: {
                    ...w.npm_install,
                    ammo: Math.min(w.npm_install.maxAmmo, w.npm_install.ammo + 4),
                  },
                }));
                setScore((s) => s + 100);
              } else if (item.itemId === "coffee") {
                setPlayerHp((hp) => Math.min(maxPlayerHp, hp + 25));
                setScore((s) => s + 100);
              } else if (item.itemId === "git_stash") {
                setWeapons((w) => ({
                  ...w,
                  git_force_push: {
                    ...w.git_force_push,
                    ammo: Math.min(w.git_force_push.maxAmmo, w.git_force_push.ammo + 1),
                  },
                }));
                setScore((s) => s + 200);
              } else if (item.itemId === "commit_token") {
                setScore((s) => s + 500);
              }

              floatingTextsRef.current.push({
                id: `pickup-${Date.now()}`,
                x: nextX,
                y: nextY,
                text: item.name,
                color: item.color,
                alpha: 1,
                vy: -0.03,
              });

              return { ...item, collected: true };
            }
            return item;
          })
        );

        // Room 4 (Billable Hours): Chest / Timesheet trigger
        if (
          gameMode === "roguelike" &&
          roomIndex === 3 &&
          currentMaze[nextY][nextX] === "T"
        ) {
          setGameStatus("timesheet");
          playNote(440, 0.15);
          return;
        }

        // Enemy collision check
        if (!dronesStunned) {
          const hitEnemy = enemies.find(
            (e) => e.x === nextX && e.y === nextY && e.state !== "stunned"
          );
          if (hitEnemy) {
            setPlayerHp((hp) => {
              const nextHp = hp - 25;
              if (nextHp <= 0) {
                setGameStatus("caught");
                playNote(200, 0.25);
                return 0;
              }
              return nextHp;
            });
            playNote(220, 0.2);
          }

          // Legacy Drone check
          if (drones.some((d) => d.x === nextX && d.y === nextY)) {
            setGameStatus("caught");
            playNote(200, 0.2);
            return;
          }
        }

        // Exit reached
        if (nextX === EXIT_X && nextY === EXIT_Y) {
          setGameStatus("victory");
          playSuccess();
          const finalScore = score + Math.max(100, 1000 - nextMoves * 20);
          setScore(finalScore);
          if (finalScore > effectiveHighScore) {
            setHighScore(finalScore);
            if (typeof window !== "undefined") {
              localStorage.setItem("retro_labyrinth_highscore", finalScore.toString());
            }
          }
          recordEvent("labyrinth_solved", "project_click").catch((err) => {
            console.error("Failed to record telemetry for labyrinth solution:", err);
          });
        }
      }
    },
    [
      gameStatus,
      playerPosition,
      currentMaze,
      movesCount,
      playNote,
      playSuccess,
      gameMode,
      exploredMap,
      roomIndex,
      tspWalls,
      dronesStunned,
      enemies,
      drones,
      score,
      effectiveHighScore,
      maxPlayerHp,
      recordEvent,
    ]
  );

  // Trigger Active Weapon
  const handleFireWeapon = useCallback(
    (wId: WeaponId) => {
      if (gameStatus !== "playing") return;

      const nowMs = Date.now();
      const res = fireWeapon(
        wId,
        weapons,
        playerPosition.x,
        playerPosition.y,
        playerHp,
        maxPlayerHp,
        enemies,
        boss,
        nowMs
      );

      if (!res.success) {
        floatingTextsRef.current.push({
          id: `ammo-err-${nowMs}`,
          x: playerPosition.x,
          y: playerPosition.y,
          text: res.message,
          color: "#f43f5e",
          alpha: 1,
          vy: -0.02,
        });
        return;
      }

      setWeapons(res.updatedWeapons);
      setEnemies(res.updatedEnemies);
      setBoss(res.updatedBoss);
      setPlayerHp(res.updatedPlayerHp);
      setScore((s) => s + res.scoreGained);

      // Play audio feedback for weapon
      if (wId === "npm_install") {
        playNote(330, 0.18);
      } else if (wId === "git_force_push") {
        playNote(110, 0.35);
      } else if (wId === "stack_overflow") {
        playSuccess();
      } else if (wId === "emp_blast") {
        setDronesStunned(true);
        playNote(880, 0.15);
        setTimeout(() => setDronesStunned(false), 4000);
      }

      if (res.activeSideEffect) {
        setActiveSideEffect(res.activeSideEffect);
      }

      // Add particles
      particlesRef.current.push(...res.particles);

      // Floating message
      floatingTextsRef.current.push({
        id: `weap-msg-${nowMs}`,
        x: playerPosition.x,
        y: playerPosition.y,
        text: res.message,
        color: wId === "git_force_push" ? "#ef4444" : "#f59e0b",
        alpha: 1,
        vy: -0.03,
      });
    },
    [gameStatus, weapons, playerPosition, playerHp, maxPlayerHp, enemies, boss, playNote, playSuccess]
  );

  // Submit billable hours timesheet in Room 4
  const handleSubmitTimesheet = useCallback(() => {
    setGameStatus("playing");
    playSuccess();
    setScore((s) => s + 500);

    // Turn chest tile into floor
    const updatedGrid = currentMaze.map((row) =>
      row.map((cell) => (cell === "T" ? " " : cell))
    );
    setCurrentMaze(updatedGrid);

    floatingTextsRef.current.push({
      id: `timesheet-done-${Date.now()}`,
      x: playerPosition.x,
      y: playerPosition.y,
      text: "TIMESHEET LOGGED: +0.25h (+500 PTS)",
      color: "#10b981",
      alpha: 1,
      vy: -0.03,
    });
  }, [currentMaze, playSuccess, playerPosition.x, playerPosition.y]);

  // Keyboard controls
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
    if (gameStatus !== "playing") {
      if (gameStatus === "timesheet" && e.key === "Enter") {
        e.preventDefault();
        handleSubmitTimesheet();
      }
      return;
    }

    const key = e.key;
    const interceptKeys = [
      "ArrowUp",
      "ArrowDown",
      "ArrowLeft",
      "ArrowRight",
      "w",
      "a",
      "s",
      "d",
      "W",
      "A",
      "S",
      "D",
      " ",
      "1",
      "2",
      "3",
    ];

    if (interceptKeys.includes(key)) {
      e.preventDefault();
    } else {
      return;
    }

    // Check if keybinds are currently scrambled by Stack Overflow copy-paste
    const isScrambled =
      activeSideEffect?.type === "scrambled_keys" &&
      activeSideEffect.expiresAt > Date.now();

    if (key === "1") {
      setActiveWeaponId("npm_install");
      handleFireWeapon("npm_install");
    } else if (key === "2") {
      setActiveWeaponId("git_force_push");
      handleFireWeapon("git_force_push");
    } else if (key === "3") {
      setActiveWeaponId("stack_overflow");
      handleFireWeapon("stack_overflow");
    } else if (key === " ") {
      // Trigger EMP Blast or active weapon
      handleFireWeapon("emp_blast");
    } else if (key === "ArrowUp" || key.toLowerCase() === "w") {
      tryMove(0, isScrambled ? 1 : -1);
    } else if (key === "ArrowDown" || key.toLowerCase() === "s") {
      tryMove(0, isScrambled ? -1 : 1);
    } else if (key === "ArrowLeft" || key.toLowerCase() === "a") {
      tryMove(isScrambled ? 1 : -1, 0);
    } else if (key === "ArrowRight" || key.toLowerCase() === "d") {
      tryMove(isScrambled ? -1 : 1, 0);
    }
  }, [
    activeSideEffect,
    gameStatus,
    handleFireWeapon,
    handleSubmitTimesheet,
    tryMove,
  ]);

  // BlinkBrowse cursor movement handler
  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (gameMode !== "roguelike" || roomIndex !== 2 || gameStatus !== "playing") return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const cellW = canvas.width / currentMaze[0].length;
    const cellH = canvas.height / currentMaze.length;

    const gridX = Math.floor(x / cellW);
    const gridY = Math.floor(y / cellH);

    cursorGridPosRef.current = { x: gridX, y: gridY };

    // Chaotic steering: nudge player towards cursor periodically
    if (Math.random() < 0.2) {
      const dx = gridX > playerPosition.x ? 1 : gridX < playerPosition.x ? -1 : 0;
      const dy = gridY > playerPosition.y ? 1 : gridY < playerPosition.y ? -1 : 0;
      if (dx !== 0 || dy !== 0) {
        tryMove(dx, dy);
      }
    }
  };

  // Main Real-Time Game Loop (Boss update, Enemy AI, Particles, CRT Canvas)
  useEffect(() => {
    if (!isMounted) return;

    let isRunning = true;

    const loop = (timestamp: number) => {
      if (!isRunning) return;

      if (!lastTimeRef.current) lastTimeRef.current = timestamp;
      const deltaMs = timestamp - lastTimeRef.current;
      lastTimeRef.current = timestamp;

      // 1. Update active side effect expiry
      if (activeSideEffect && activeSideEffect.expiresAt <= timestamp) {
        setActiveSideEffect(null);
      }

      // 2. Update Enemy AI
      if (gameStatus === "playing" && enemies.length > 0 && deltaMs > 0) {
        // Run AI step every ~400ms
        if (Math.random() < 0.05) {
          const { updatedEnemies, damageToPlayer, caughtPlayer } = updateEnemyAI(
            enemies,
            currentMaze,
            playerPosition.x,
            playerPosition.y,
            deltaMs
          );
          setEnemies(updatedEnemies);

          if (damageToPlayer > 0) {
            setPlayerHp((hp) => {
              const nextHp = hp - damageToPlayer;
              if (nextHp <= 0 || caughtPlayer) {
                setGameStatus("caught");
                return 0;
              }
              return nextHp;
            });
            playNote(220, 0.1);
          }
        }
      }

      // 3. Update FaceForge Boss
      if (gameStatus === "playing" && boss && !boss.defeated && gameMode === "roguelike") {
        const { updatedBoss, spawnedDamage } = updateFaceForgeBoss(
          boss,
          playerPosition.x,
          playerPosition.y,
          timestamp,
          currentMaze[0].length,
          currentMaze.length
        );
        setBoss(updatedBoss);

        if (spawnedDamage > 0) {
          setPlayerHp((hp) => {
            const nextHp = hp - spawnedDamage;
            if (nextHp <= 0) {
              setGameStatus("caught");
              return 0;
            }
            return nextHp;
          });
          playNote(200, 0.15);
          floatingTextsRef.current.push({
            id: `mesh-hit-${timestamp}`,
            x: playerPosition.x,
            y: playerPosition.y,
            text: `-${spawnedDamage} HP (Mesh Hit!)`,
            color: "#ef4444",
            alpha: 1,
            vy: -0.02,
          });
        }
      }

      // 4. Update Classic Drones
      if (
        gameStatus === "playing" &&
        !dronesStunned &&
        drones.length > 0 &&
        gameMode === "classic"
      ) {
        if (Math.random() < 0.04) {
          setDrones((prev) =>
            prev.map((d) => {
              let nextX = d.x;
              let nextDir = d.dir;
              if (d.dir === "right") {
                if (nextX >= d.maxX) {
                  nextDir = "left";
                  nextX -= 1;
                } else {
                  nextX += 1;
                }
              } else {
                if (nextX <= d.minX) {
                  nextDir = "right";
                  nextX += 1;
                } else {
                  nextX -= 1;
                }
              }

              if (nextX === playerPosition.x && d.y === playerPosition.y) {
                setGameStatus("caught");
                playNote(220, 0.2);
              }

              return { ...d, x: nextX, dir: nextDir };
            })
          );
        }
      }

      // 5. Draw Canvas Frame
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext("2d");
        if (ctx) {
          const width = canvas.width;
          const height = canvas.height;
          const cols = currentMaze[0]?.length || 15;
          const rows = currentMaze.length || 9;
          const cellW = width / cols;
          const cellH = height / rows;

          // Clear screen
          ctx.fillStyle = "#09090b";
          ctx.fillRect(0, 0, width, height);

          // Draw Grid Tiles with FOV Fog of War
          for (let y = 0; y < rows; y++) {
            for (let x = 0; x < cols; x++) {
              const cell = currentMaze[y][x];
              const px = x * cellW;
              const py = y * cellH;

              const isVis = visibleMap[y]?.[x] ?? true;
              const isExp = exploredMap[y]?.[x] ?? true;

              if (!isExp && gameMode === "roguelike") {
                // Unexplored: Pitch black
                ctx.fillStyle = "#050507";
                ctx.fillRect(px, py, cellW, cellH);
                continue;
              }

              if (cell === "#") {
                ctx.fillStyle = isVis ? "#171717" : "#0d0d0d";
                ctx.fillRect(px, py, cellW, cellH);

                ctx.strokeStyle = isVis
                  ? "rgba(6, 182, 212, 0.25)"
                  : "rgba(6, 182, 212, 0.08)";
                ctx.lineWidth = 1;
                ctx.strokeRect(px + 0.5, py + 0.5, cellW - 1, cellH - 1);
              } else if (cell === "W") {
                // Dynamic moving wall in TSP room
                ctx.fillStyle = isVis ? "#3b0764" : "#1e0833";
                ctx.fillRect(px, py, cellW, cellH);
                ctx.strokeStyle = "#c084fc";
                ctx.lineWidth = 1.5;
                ctx.strokeRect(px + 1, py + 1, cellW - 2, cellH - 2);

                ctx.fillStyle = "#e9d5ff";
                ctx.font = "bold 8px monospace";
                ctx.textAlign = "center";
                ctx.textBaseline = "middle";
                ctx.fillText("TSP", px + cellW / 2, py + cellH / 2);
              } else if (cell === "T") {
                // Chest in Billable Hours room
                ctx.fillStyle = "rgba(245, 158, 11, 0.2)";
                ctx.fillRect(px, py, cellW, cellH);
                ctx.strokeStyle = "#f59e0b";
                ctx.strokeRect(px + 2, py + 2, cellW - 4, cellH - 4);
                ctx.font = "10px monospace";
                ctx.textAlign = "center";
                ctx.textBaseline = "middle";
                ctx.fillText("📦", px + cellW / 2, py + cellH / 2);
              } else if (x === EXIT_X && y === EXIT_Y) {
                // Exit Portal
                ctx.fillStyle = "rgba(16, 185, 129, 0.2)";
                ctx.fillRect(px, py, cellW, cellH);

                ctx.strokeStyle = "#10b981";
                ctx.lineWidth = 1.5;
                ctx.strokeRect(px + 1.5, py + 1.5, cellW - 3, cellH - 3);

                ctx.fillStyle = "#10b981";
                ctx.font = "bold 9px monospace";
                ctx.textAlign = "center";
                ctx.textBaseline = "middle";
                ctx.fillText("E", px + cellW / 2, py + cellH / 2);
              } else {
                // Path dots
                ctx.fillStyle = `rgba(6, 182, 212, ${isVis ? 0.15 : 0.04})`;
                ctx.beginPath();
                ctx.arc(px + cellW / 2, py + cellH / 2, 1.5, 0, Math.PI * 2);
                ctx.fill();
              }
            }
          }

          // TSP Route Line in Room 1
          if (gameMode === "roguelike" && roomIndex === 0) {
            const { tour } = computeShortestTour(
              playerPosition.x,
              playerPosition.y,
              tspNodes,
              EXIT_X,
              EXIT_Y
            );

            ctx.save();
            ctx.strokeStyle = "rgba(34, 211, 238, 0.4)";
            ctx.setLineDash([3, 3]);
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            tour.forEach((pt, idx) => {
              const ptX = pt.x * cellW + cellW / 2;
              const ptY = pt.y * cellH + cellH / 2;
              if (idx === 0) ctx.moveTo(ptX, ptY);
              else ctx.lineTo(ptX, ptY);
            });
            ctx.stroke();
            ctx.restore();

            // Draw landmark nodes
            tspNodes.forEach((node) => {
              const nx = node.x * cellW + cellW / 2;
              const ny = node.y * cellH + cellH / 2;
              ctx.fillStyle = node.visited ? "#10b981" : "#06b6d4";
              ctx.beginPath();
              ctx.arc(nx, ny, 4, 0, Math.PI * 2);
              ctx.fill();
            });
          }

          // Draw Pickups
          items.forEach((item) => {
            if (item.collected) return;
            const ix = item.x * cellW + cellW / 2;
            const iy = item.y * cellH + cellH / 2;
            ctx.font = "10px monospace";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(item.symbol, ix, iy);
          });

          // Draw Enemies
          enemies.forEach((enemy) => {
            const ex = enemy.x * cellW + cellW / 2;
            const ey = enemy.y * cellH + cellH / 2;

            ctx.fillStyle =
              enemy.state === "stunned"
                ? "rgba(56, 189, 248, 0.3)"
                : enemy.state === "chase"
                ? "rgba(239, 68, 68, 0.4)"
                : "rgba(245, 158, 11, 0.3)";
            ctx.beginPath();
            ctx.arc(ex, ey, 8, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = enemy.state === "stunned" ? "#38bdf8" : enemy.color;
            ctx.beginPath();
            ctx.arc(ex, ey, 3.5, 0, Math.PI * 2);
            ctx.fill();
          });

          // Draw Classic Stage 2 Drones
          drones.forEach((d) => {
            const dX = d.x * cellW + cellW / 2;
            const dY = d.y * cellH + cellH / 2;

            ctx.fillStyle = dronesStunned
              ? "rgba(56, 189, 248, 0.3)"
              : "rgba(239, 68, 68, 0.3)";
            ctx.beginPath();
            ctx.arc(dX, dY, 8, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = dronesStunned ? "#38bdf8" : "#ef4444";
            ctx.beginPath();
            ctx.arc(dX, dY, 3.5, 0, Math.PI * 2);
            ctx.fill();
          });

          // Draw 3D Wireframe FaceForge Boss in Room 2
          if (boss && !boss.defeated && gameMode === "roguelike" && roomIndex === 1) {
            const bossCenterX = boss.x * cellW + cellW / 2;
            const bossCenterY = boss.y * cellH + cellH / 2;
            renderWireframeMesh(ctx, boss.mesh, bossCenterX, bossCenterY, true);

            // Draw Boss Projectiles
            boss.projectiles.forEach((p) => {
              if (!p.alive) return;
              const pX = p.x * cellW + cellW / 2;
              const pY = p.y * cellH + cellH / 2;
              renderWireframeMesh(ctx, p.mesh, pX, pY, false);
            });
          }

          // Draw BlinkBrowse Eye-tracking cursor crosshair in Room 3
          if (gameMode === "roguelike" && roomIndex === 2 && cursorGridPosRef.current) {
            const cX = cursorGridPosRef.current.x * cellW + cellW / 2;
            const cY = cursorGridPosRef.current.y * cellH + cellH / 2;

            ctx.strokeStyle = "rgba(56, 189, 248, 0.6)";
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.arc(cX, cY, 9, 0, Math.PI * 2);
            ctx.stroke();

            ctx.fillStyle = "#38bdf8";
            ctx.beginPath();
            ctx.arc(cX, cY, 2, 0, Math.PI * 2);
            ctx.fill();
          }

          // Draw Player
          const pX = playerPosition.x * cellW + cellW / 2;
          const pY = playerPosition.y * cellH + cellH / 2;

          const glowGradient = ctx.createRadialGradient(pX, pY, 2, pX, pY, 14);
          glowGradient.addColorStop(0, "rgba(6, 182, 212, 0.8)");
          glowGradient.addColorStop(1, "rgba(6, 182, 212, 0)");
          ctx.fillStyle = glowGradient;
          ctx.beginPath();
          ctx.arc(pX, pY, 14, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = "#06b6d4";
          ctx.beginPath();
          ctx.arc(pX, pY, 4.5, 0, Math.PI * 2);
          ctx.fill();

          // Draw Particles
          particlesRef.current = particlesRef.current.filter((p) => {
            p.x += p.vx * 0.05;
            p.y += p.vy * 0.05;
            p.alpha -= p.decay;

            if (p.alpha <= 0) return false;

            const partX = p.x * cellW + cellW / 2;
            const partY = p.y * cellH + cellH / 2;

            ctx.save();
            ctx.globalAlpha = Math.max(0, p.alpha);
            if (p.char) {
              ctx.fillStyle = p.color;
              ctx.font = "bold 7px monospace";
              ctx.fillText(p.char, partX, partY);
            } else {
              ctx.fillStyle = p.color;
              ctx.beginPath();
              ctx.arc(partX, partY, p.radius, 0, Math.PI * 2);
              ctx.fill();
            }
            ctx.restore();

            return true;
          });

          // Draw Floating Text Notifications
          floatingTextsRef.current = floatingTextsRef.current.filter((ft) => {
            ft.y += ft.vy;
            ft.alpha -= 0.02;

            if (ft.alpha <= 0) return false;

            const tX = ft.x * cellW + cellW / 2;
            const tY = ft.y * cellH + cellH / 2;

            ctx.save();
            ctx.globalAlpha = Math.max(0, ft.alpha);
            ctx.fillStyle = ft.color;
            ctx.font = "bold 8px monospace";
            ctx.textAlign = "center";
            ctx.fillText(ft.text, tX, tY);
            ctx.restore();

            return true;
          });

          // CRT Scanline Overlay
          ctx.save();
          ctx.fillStyle = "rgba(0, 0, 0, 0.12)";
          for (let y = 0; y < height; y += 3) {
            ctx.fillRect(0, y, width, 1);
          }
          ctx.restore();

          // Dark Vignette Overlay
          const vignette = ctx.createRadialGradient(
            width / 2,
            height / 2,
            width * 0.3,
            width / 2,
            height / 2,
            width * 0.7
          );
          vignette.addColorStop(0, "rgba(0, 0, 0, 0)");
          vignette.addColorStop(1, "rgba(0, 0, 0, 0.65)");
          ctx.fillStyle = vignette;
          ctx.fillRect(0, 0, width, height);
        }
      }

      animFrameRef.current = requestAnimationFrame(loop);
    };

    animFrameRef.current = requestAnimationFrame(loop);

    return () => {
      isRunning = false;
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [
    isMounted,
    currentMaze,
    playerPosition,
    visibleMap,
    exploredMap,
    enemies,
    drones,
    dronesStunned,
    items,
    boss,
    tspNodes,
    gameMode,
    roomIndex,
    gameStatus,
    activeSideEffect,
    playNote,
  ]);

  // Generate ASCII fallback string for SSR
  const renderAsciiFallback = () => {
    return MAZE.map((row, y) =>
      row
        .map((cell, x) => {
          if (cell === "#") return "█";
          if (x === START_X && y === START_Y) return "@";
          if (x === EXIT_X && y === EXIT_Y) return "E";
          return "·";
        })
        .join(" ")
    ).join("\n");
  };

  if (!isMounted) {
    return (
      <div className="relative w-full h-[240px] bg-neutral-950/80 border border-neutral-900 rounded-2xl flex flex-col items-center justify-center font-mono select-none overflow-hidden my-6">
        <div className="absolute top-3 left-4 right-4 flex justify-between items-center text-[10px] font-bold text-neutral-500 uppercase tracking-wider">
          <span>SYSTEM_LABYRINTH.EXE</span>
          <span className="text-neutral-600">OFFLINE</span>
        </div>

        <pre className="text-[10px] sm:text-[11px] leading-4 tracking-normal text-brand-cyan/60 font-mono select-none text-center p-2">
          {renderAsciiFallback()}
        </pre>

        <div className="absolute bottom-3 left-4 right-4 text-center text-[9px] font-bold text-neutral-500 uppercase tracking-widest">
          [INITIALIZING LABYRINTH ENGINE...]
        </div>
      </div>
    );
  }

  const currentRoom =
    gameMode === "roguelike"
      ? campaignRooms[roomIndex] || campaignRooms[0]
      : stage === 2
      ? generateClassicStage2()
      : generateClassicStage1();

  return (
    <div className="w-full flex flex-col items-center select-none my-6">
      {/* Top HUD Banner: Mode, Campaign Stage & Expand Toggle */}
      <div className="mb-2 w-full flex flex-wrap items-center justify-between gap-2 px-1">
        <span
          className={`inline-flex items-center gap-2 px-3 py-1 rounded-full font-mono text-[10px] font-bold uppercase tracking-wider border transition-all duration-300 ${
            isFocused
              ? "bg-brand-cyan/10 text-brand-cyan border-brand-cyan/30 shadow-[0_0_10px_rgba(34,211,238,0.15)] animate-pulse"
              : "bg-neutral-950 text-neutral-500 border-neutral-900"
          }`}
        >
          <span
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              isFocused
                ? "bg-brand-cyan shadow-[0_0_8px_rgba(6,182,212,0.8)]"
                : "bg-neutral-700"
            }`}
          />
          {isFocused ? "Labyrinth Controls: ACTIVE" : "Click Maze to Focus & Play"}
        </span>

        {/* Mode Selector & Room Navigation */}
        <div className="flex items-center gap-1 bg-neutral-900 p-0.5 rounded-lg text-[9px] font-mono">
          <button
            onClick={startRoguelikeCampaign}
            className={`px-2 py-0.5 rounded cursor-pointer transition-colors ${
              gameMode === "roguelike"
                ? "bg-brand-cyan text-black font-bold"
                : "text-neutral-400 hover:text-white"
            }`}
          >
            Graveyard Roguelike
          </button>
          <button
            onClick={() => switchStage(1)}
            className={`px-2 py-0.5 rounded cursor-pointer transition-colors ${
              gameMode === "classic" && stage === 1
                ? "bg-brand-cyan text-black font-bold"
                : "text-neutral-400 hover:text-white"
            }`}
          >
            Subnet 01
          </button>
          <button
            onClick={() => switchStage(2)}
            className={`px-2 py-0.5 rounded cursor-pointer transition-colors ${
              gameMode === "classic" && stage === 2
                ? "bg-brand-cyan text-black font-bold"
                : "text-neutral-400 hover:text-white"
            }`}
          >
            Subnet 02 (Firewall)
          </button>
          <button
            onClick={() => setIsExpanded((prev) => !prev)}
            title="Toggle Expanded View"
            className="px-1.5 py-0.5 rounded text-neutral-400 hover:text-white hover:bg-neutral-800 cursor-pointer"
          >
            {isExpanded ? (
              <IconMinimize className="w-3 h-3" />
            ) : (
              <IconMaximize className="w-3 h-3" />
            )}
          </button>
        </div>
      </div>

      {/* Main Focusable Game Container */}
      <div
        ref={containerRef}
        tabIndex={0}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        data-keyboard-boundary="true"
        className={`relative w-full ${
          isExpanded ? "h-[380px]" : "h-[290px]"
        } bg-neutral-950/90 border rounded-2xl flex flex-col items-center justify-between p-2.5 overflow-hidden outline-none transition-all duration-300 ${
          isFocused
            ? "border-brand-cyan ring-2 ring-brand-cyan/10 shadow-[0_0_20px_rgba(34,211,238,0.1)] scale-[1.005]"
            : "border-neutral-900"
        }`}
      >
        {/* Header HUD: Room Title, HP, Score */}
        <div className="w-full flex justify-between items-center text-[10px] font-bold font-mono px-2 py-0.5 border-b border-neutral-900/60">
          <div className="flex items-center gap-2">
            <span className="text-neutral-400">SYSTEM_LABYRINTH.EXE · {currentRoom.badge}</span>
            <span className="text-brand-cyan/80 text-[9px] hidden sm:inline truncate max-w-[160px]">
              [{currentRoom.title}]
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Player HP */}
            <div className="flex items-center gap-1 text-[9px]">
              <span className="text-neutral-500">HP</span>
              <div className="w-16 h-2 bg-neutral-900 rounded-full overflow-hidden border border-neutral-800">
                <div
                  className={`h-full transition-all duration-200 ${
                    playerHp > 50
                      ? "bg-emerald-500"
                      : playerHp > 25
                      ? "bg-amber-500"
                      : "bg-rose-500 animate-pulse"
                  }`}
                  style={{ width: `${Math.max(0, playerHp)}%` }}
                />
              </div>
              <span className="text-neutral-300 font-bold">{playerHp}</span>
            </div>

            {/* Score & High Score */}
            <div className="text-[9px] text-neutral-400 flex items-center gap-1.5">
              <span>SCORE: <strong className="text-brand-cyan font-bold">{score}</strong></span>
              <span className="text-neutral-600">|</span>
              <span>HI: <strong className="text-amber-400 font-bold">{effectiveHighScore}</strong></span>
            </div>

            <span
              className={
                isFocused ? "text-brand-cyan animate-pulse" : "text-neutral-500"
              }
            >
              {isFocused ? "● LIVE" : "IDLE"}
            </span>
          </div>
        </div>

        {/* Active Side-Effect Warning Banner */}
        {activeSideEffect && (
          <div className="w-full bg-rose-950/60 border border-rose-800/60 rounded px-2 py-0.5 my-0.5 flex items-center justify-between text-[9px] font-mono text-rose-300 animate-pulse">
            <span>⚠️ {activeSideEffect.title}: {activeSideEffect.description}</span>
            <span className="font-bold">ACTIVE</span>
          </div>
        )}

        {/* Game Canvas Container */}
        <div
          className={`relative ${
            isExpanded ? "w-[360px] h-[216px]" : "w-[240px] h-[144px]"
          } flex items-center justify-center`}
        >
          <canvas
            ref={canvasRef}
            width={240}
            height={144}
            onMouseMove={handleCanvasMouseMove}
            className={`block ${
              isExpanded ? "w-[360px] h-[216px]" : "w-[240px] h-[144px]"
            } rounded-lg border border-neutral-900/60 bg-neutral-950 cursor-crosshair`}
          />

          {/* Victory Overlay */}
          {gameStatus === "victory" && (
            <div className="absolute inset-0 bg-neutral-950/95 backdrop-blur-sm flex flex-col items-center justify-center text-center p-3 rounded-lg border border-brand-cyan/30 z-30">
              <div className="w-7 h-7 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mb-1 text-emerald-400 animate-bounce">
                <IconTrophy className="w-4 h-4" />
              </div>
              <h3 className="text-emerald-400 font-bold text-xs uppercase tracking-widest">
                CORE RESOLVED
              </h3>
              <p className="text-[9px] text-neutral-400 mt-0.5 leading-relaxed">
                Solved in <span className="font-bold text-brand-cyan">{movesCount}</span> moves. Rating: ⭐⭐⭐
              </p>
              <p className="text-[9px] text-neutral-400">
                Final Score: <span className="font-bold text-brand-cyan">{score}</span>
              </p>
              <div className="flex gap-2 mt-2">
                {gameMode === "roguelike" && roomIndex < campaignRooms.length - 1 ? (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleNextRoom();
                      containerRef.current?.focus();
                    }}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-brand-cyan hover:bg-cyan-400 text-black text-[9px] font-bold rounded-lg transition-all cursor-pointer shadow-md"
                  >
                    <span>Next Graveyard</span>
                    <IconArrowRight className="w-3 h-3" />
                  </button>
                ) : (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRestart();
                      containerRef.current?.focus();
                    }}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 hover:border-brand-cyan/40 text-neutral-200 hover:text-brand-cyan text-[9px] font-bold rounded-lg transition-all cursor-pointer"
                  >
                    <IconRefresh className="w-3 h-3" />
                    Play Again
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Caught / Game Over Overlay */}
          {gameStatus === "caught" && (
            <div className="absolute inset-0 bg-neutral-950/95 backdrop-blur-sm flex flex-col items-center justify-center text-center p-3 rounded-lg border border-rose-500/30 z-30">
              <h3 className="text-rose-400 font-bold text-xs uppercase tracking-widest">
                SYSTEM CORRUPTION DETECTED
              </h3>
              <p className="text-[9px] text-neutral-400 mt-1">
                Dead code and sentinel drones intercepted your trace.
              </p>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleRestart();
                  containerRef.current?.focus();
                }}
                className="mt-2 px-3 py-1 bg-neutral-900 text-rose-300 border border-rose-800 hover:bg-rose-950 text-[9px] font-bold rounded cursor-pointer transition-colors"
              >
                RETRY STAGE
              </button>
            </div>
          )}

          {/* Billable Hours Timesheet Modal (Room 4) */}
          {gameStatus === "timesheet" && (
            <div className="absolute inset-0 bg-neutral-950/95 backdrop-blur-sm flex flex-col items-center justify-center text-center p-3 rounded-lg border border-amber-500/40 z-40">
              <div className="w-7 h-7 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mb-1 text-amber-400">
                <IconFileText className="w-4 h-4" />
              </div>
              <h3 className="text-amber-400 font-bold text-xs uppercase tracking-wider font-mono">
                BILLABLE HOURS INTERRUPT
              </h3>
              <p className="text-[9px] text-neutral-400 mt-0.5 leading-tight font-mono">
                Opening this abandoned repo chest requires logging 0.25h of admin work.
              </p>
              <div className="w-full max-w-[210px] bg-neutral-900/90 border border-neutral-800 rounded p-1.5 my-1.5 text-left font-mono text-[8px] space-y-0.5 text-neutral-300">
                <div>CLIENT: <span className="text-brand-cyan">Abandoned Repos LLC</span></div>
                <div>TASK: <span className="text-amber-300">JIRA-404: Refactor Legacy Rust</span></div>
                <div>HOURS: <span className="text-emerald-400 font-bold">0.25 hrs (Admin)</span></div>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleSubmitTimesheet();
                  containerRef.current?.focus();
                }}
                className="inline-flex items-center gap-1 px-3 py-1 bg-amber-500 hover:bg-amber-400 text-black text-[9px] font-bold rounded-md transition-all cursor-pointer shadow-md"
              >
                <IconCheck className="w-3 h-3" />
                Submit Timesheet & Open Vault [ENTER]
              </button>
            </div>
          )}
        </div>

        {/* Weapons Hotbar & Controls Footer */}
        <div className="w-full flex flex-col gap-1 px-2 pt-1 border-t border-neutral-900/60">
          <div className="flex flex-wrap items-center justify-between gap-1 text-[8px] font-mono">
            {/* Weapon Hotkeys */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                onClick={() => handleFireWeapon("npm_install")}
                className={`px-1.5 py-0.5 rounded border flex items-center gap-1 transition-all cursor-pointer ${
                  activeWeaponId === "npm_install"
                    ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                    : "bg-neutral-900 text-neutral-400 border-neutral-800 hover:text-neutral-200"
                }`}
              >
                <span className="font-bold">[1] npm i</span>
                <span className="text-amber-400">({weapons.npm_install.ammo})</span>
              </button>

              <button
                onClick={() => handleFireWeapon("git_force_push")}
                className={`px-1.5 py-0.5 rounded border flex items-center gap-1 transition-all cursor-pointer ${
                  activeWeaponId === "git_force_push"
                    ? "bg-rose-500/20 text-rose-300 border-rose-500/40"
                    : "bg-neutral-900 text-neutral-400 border-neutral-800 hover:text-neutral-200"
                }`}
              >
                <span className="font-bold">[2] git push -f</span>
                <span className="text-rose-400">({weapons.git_force_push.ammo})</span>
              </button>

              <button
                onClick={() => handleFireWeapon("stack_overflow")}
                className={`px-1.5 py-0.5 rounded border flex items-center gap-1 transition-all cursor-pointer ${
                  activeWeaponId === "stack_overflow"
                    ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                    : "bg-neutral-900 text-neutral-400 border-neutral-800 hover:text-neutral-200"
                }`}
              >
                <span className="font-bold">[3] StackOverflow</span>
                <span className="text-emerald-400">({weapons.stack_overflow.ammo})</span>
              </button>

              <button
                onClick={() => handleFireWeapon("emp_blast")}
                className="px-1.5 py-0.5 rounded border bg-neutral-900 text-cyan-400 border-cyan-800/40 hover:bg-cyan-950 cursor-pointer"
              >
                <span className="font-bold">[SPACE] EMP</span>
              </button>
            </div>

            {/* Controls string */}
            <div className="text-neutral-500 uppercase tracking-wider hidden md:block">
              WASD / ARROWS · SPACE: EMP
            </div>
          </div>

          {/* On-screen Touch D-Pad for Mobile Navigation */}
          <div className="flex items-center justify-center gap-1 pt-1 sm:hidden">
            <button
              type="button"
              onClick={() => {
                const isScrambled = activeSideEffect?.type === "scrambled_keys" && activeSideEffect.expiresAt > Date.now();
                tryMove(isScrambled ? 1 : -1, 0);
              }}
              aria-label="Move Left"
              className="w-7 h-7 rounded bg-zinc-900 border border-zinc-800 active:bg-brand-cyan/20 active:border-brand-cyan text-zinc-300 text-xs font-bold flex items-center justify-center cursor-pointer"
            >
              ◀
            </button>
            <div className="flex flex-col gap-1">
              <button
                type="button"
                onClick={() => {
                  const isScrambled = activeSideEffect?.type === "scrambled_keys" && activeSideEffect.expiresAt > Date.now();
                  tryMove(0, isScrambled ? 1 : -1);
                }}
                aria-label="Move Up"
                className="w-7 h-7 rounded bg-zinc-900 border border-zinc-800 active:bg-brand-cyan/20 active:border-brand-cyan text-zinc-300 text-xs font-bold flex items-center justify-center cursor-pointer"
              >
                ▲
              </button>
              <button
                type="button"
                onClick={() => {
                  const isScrambled = activeSideEffect?.type === "scrambled_keys" && activeSideEffect.expiresAt > Date.now();
                  tryMove(0, isScrambled ? -1 : 1);
                }}
                aria-label="Move Down"
                className="w-7 h-7 rounded bg-zinc-900 border border-zinc-800 active:bg-brand-cyan/20 active:border-brand-cyan text-zinc-300 text-xs font-bold flex items-center justify-center cursor-pointer"
              >
                ▼
              </button>
            </div>
            <button
              type="button"
              onClick={() => {
                const isScrambled = activeSideEffect?.type === "scrambled_keys" && activeSideEffect.expiresAt > Date.now();
                tryMove(isScrambled ? -1 : 1, 0);
              }}
              aria-label="Move Right"
              className="w-7 h-7 rounded bg-zinc-900 border border-zinc-800 active:bg-brand-cyan/20 active:border-brand-cyan text-zinc-300 text-xs font-bold flex items-center justify-center cursor-pointer"
            >
              ▶
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
