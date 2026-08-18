import { createSeededRandom } from "@/lib/game-utils";

export interface ArcadeBaseGameConfig {
  difficulty?: string;
  gameMode?: string;
  seed?: number | string;
  speedMultiplier?: number;
  startingAct?: number;
  initialLevel?: number;
  startingLevelIndex?: number;
  laserType?: string;
  ramLimit?: number;
  deviceTarget?: string;
  bezelTheme?: string;
  startingStress?: number;
  cyberdeckClass?: string;
  startingWeapon?: string;
  [key: string]: unknown;
}

export interface WorkingWithDuckConfig {
  initialLevel?: number;
  mode?: "campaign" | "endless";
  difficulty?: "chill" | "standard" | "chaos";
  seed?: number | string;
  speedMultiplier?: number;
}

export interface LaserLoonConfig {
  mode?: "campaign" | "arcade";
  difficulty?: "easy" | "normal" | "hard";
  startingAct?: number;
  laserType?: "ruby-laser" | "cryo-beam" | "tremolo-pulse";
  seed?: number | string;
  speedMultiplier?: number;
}

export interface QuasiPuzzlerConfig {
  gameMode?: "story" | "speedrun" | "sandbox";
  difficulty?: "story" | "hacker" | "expert";
  startingLevelIndex?: number;
  ramLimit?: number;
  seed?: number | string;
  speedMultiplier?: number;
}

export interface GarminWatchConfig {
  deviceTarget?: "fenix7" | "forerunner955" | "epix2";
  bezelTheme?: "slate" | "solar" | "cyan" | "neon";
  difficulty?: "relaxed" | "standard" | "strict";
  seed?: number | string;
  speedMultiplier?: number;
}

export interface ClinicalChaosConfig {
  gameMode?: "standard" | "time-attack" | "auditor-crunch";
  difficulty?: "standard" | "hardcore" | "audit-crunch";
  startingStress?: number;
  seed?: number | string;
  speedMultiplier?: number;
}

export interface RetroLabyrinthConfig {
  difficulty?: "easy" | "normal" | "nightmare";
  cyberdeckClass?: "kernel-hacker" | "script-kiddie" | "cypher-punk";
  startingWeapon?: "git-init" | "npm-install" | "git-push-force";
  seed?: number | string;
  speedMultiplier?: number;
}

export function parseSeed(seed?: number | string): number {
  if (seed === undefined || seed === null || seed === "") {
    return Math.floor(Math.random() * 2147483647);
  }
  if (typeof seed === "number") {
    return Math.abs(Math.floor(seed)) || 12345;
  }
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash) || 12345;
}

export function getSeededRng(seed?: number | string) {
  return createSeededRandom(parseSeed(seed));
}

export interface PreflightControlField {
  id: string;
  label: string;
  type: "select" | "number" | "text";
  options?: { label: string; value: string | number }[];
  defaultValue: string | number;
}

export function getGamePreflightFields(gameIdOrTitle: string): PreflightControlField[] {
  const normalized = gameIdOrTitle.toLowerCase();

  if (normalized.includes("duck")) {
    return [
      {
        id: "difficulty",
        label: "Puppy Mood / Decay",
        type: "select",
        options: [
          { label: "Chill Puppy", value: "chill" },
          { label: "Standard Walk", value: "standard" },
          { label: "Puppy Zoomies", value: "chaos" },
        ],
        defaultValue: "standard",
      },
      {
        id: "gameMode",
        label: "Game Mode",
        type: "select",
        options: [
          { label: "Sprint Campaign", value: "campaign" },
          { label: "Endless Park", value: "endless" },
        ],
        defaultValue: "campaign",
      },
      {
        id: "initialLevel",
        label: "Starting Sprint Level",
        type: "select",
        options: [
          { label: "Sprint 1: The Little Prince", value: 1 },
          { label: "Sprint 2: Pant Leg Bandit", value: 2 },
          { label: "Sprint 3: Soulful Puppy Gaze", value: 3 },
          { label: "Sprint 5: Bucket Hat Hypebeast", value: 5 },
        ],
        defaultValue: 1,
      },
      {
        id: "speedMultiplier",
        label: "Game Speed",
        type: "select",
        options: [
          { label: "0.75x Chill", value: 0.75 },
          { label: "1.0x Normal", value: 1.0 },
          { label: "1.5x Fast", value: 1.5 },
        ],
        defaultValue: 1.0,
      },
      {
        id: "seed",
        label: "Deterministic Random Seed",
        type: "text",
        defaultValue: 12345,
      },
    ];
  }

  if (normalized.includes("laser") || normalized.includes("loon")) {
    return [
      {
        id: "difficulty",
        label: "Difficulty Level",
        type: "select",
        options: [
          { label: "Calm Lake", value: "easy" },
          { label: "Capitol Quest", value: "normal" },
          { label: "Red Tape Chaos", value: "hard" },
        ],
        defaultValue: "normal",
      },
      {
        id: "gameMode",
        label: "Campaign / Arcade Mode",
        type: "select",
        options: [
          { label: "4-Act Campaign", value: "campaign" },
          { label: "Timed Arcade Blitz", value: "arcade" },
        ],
        defaultValue: "campaign",
      },
      {
        id: "startingAct",
        label: "Starting Campaign Act",
        type: "select",
        options: [
          { label: "Act 1: Lake Minnetonka", value: 1 },
          { label: "Act 2: Red Tape Bureaucracy", value: 2 },
          { label: "Act 3: Paul Bunyan's Axe", value: 3 },
          { label: "Act 4: Capitol Dome", value: 4 },
        ],
        defaultValue: 1,
      },
      {
        id: "laserType",
        label: "Optic Laser Weapon",
        type: "select",
        options: [
          { label: "Ruby Laser", value: "ruby-laser" },
          { label: "Cryo Beam", value: "cryo-beam" },
          { label: "Tremolo Pulse", value: "tremolo-pulse" },
        ],
        defaultValue: "ruby-laser",
      },
      {
        id: "seed",
        label: "Deterministic Random Seed",
        type: "text",
        defaultValue: 12345,
      },
    ];
  }

  if (normalized.includes("quasi") || normalized.includes("puzzler") || normalized.includes("lean")) {
    return [
      {
        id: "gameMode",
        label: "Puzzler Mode",
        type: "select",
        options: [
          { label: "Story Mode", value: "story" },
          { label: "Hacker Speedrun", value: "speedrun" },
          { label: "Free Sandbox", value: "sandbox" },
        ],
        defaultValue: "story",
      },
      {
        id: "difficulty",
        label: "Proof Rigor",
        type: "select",
        options: [
          { label: "Story (Casual)", value: "story" },
          { label: "Hacker (Strict)", value: "hacker" },
          { label: "Expert (Zero Morality)", value: "expert" },
        ],
        defaultValue: "story",
      },
      {
        id: "ramLimit",
        label: "RAM Gauge Budget",
        type: "select",
        options: [
          { label: "99 MB Standard", value: 99 },
          { label: "64 MB Strict", value: 64 },
          { label: "32 MB Hardcore", value: 32 },
        ],
        defaultValue: 99,
      },
      {
        id: "seed",
        label: "Deterministic Random Seed",
        type: "text",
        defaultValue: 12345,
      },
    ];
  }

  if (normalized.includes("garmin") || normalized.includes("watch") || normalized.includes("runner")) {
    return [
      {
        id: "deviceTarget",
        label: "Device Target Hardware",
        type: "select",
        options: [
          { label: "Fēnix 5 (32KB RAM)", value: "fenix" },
          { label: "Forerunner 245 (64KB RAM)", value: "forerunner" },
          { label: "Epix 2 (128KB RAM)", value: "epix" },
          { label: "Edge 1030 (256KB RAM)", value: "edge" },
        ],
        defaultValue: "fenix",
      },
      {
        id: "bezelTheme",
        label: "Smartwatch Bezel Style",
        type: "select",
        options: [
          { label: "Slate Grey", value: "slate" },
          { label: "Solar Gold", value: "solar" },
          { label: "Marine Cyan", value: "cyan" },
          { label: "Neon Lime", value: "neon" },
        ],
        defaultValue: "slate",
      },
      {
        id: "difficulty",
        label: "GC Pressure / Condensation",
        type: "select",
        options: [
          { label: "Relaxed GC", value: "relaxed" },
          { label: "Standard GC", value: "standard" },
          { label: "Strict 32KB GC", value: "strict" },
        ],
        defaultValue: "standard",
      },
      {
        id: "seed",
        label: "Deterministic Random Seed",
        type: "text",
        defaultValue: 12345,
      },
    ];
  }

  if (normalized.includes("clinical") || normalized.includes("chaos") || normalized.includes("cdisc")) {
    return [
      {
        id: "gameMode",
        label: "Compliance Mode",
        type: "select",
        options: [
          { label: "Standard Audit", value: "standard" },
          { label: "21 CFR Speedrun", value: "time-attack" },
          { label: "FDA Inspection Crunch", value: "auditor-crunch" },
        ],
        defaultValue: "standard",
      },
      {
        id: "difficulty",
        label: "Inspection Scrutiny",
        type: "select",
        options: [
          { label: "Standard Audit", value: "standard" },
          { label: "Hardcore Protocol", value: "hardcore" },
          { label: "BIMO Lockdown", value: "audit-crunch" },
        ],
        defaultValue: "standard",
      },
      {
        id: "startingStress",
        label: "Initial Auditor Stress",
        type: "select",
        options: [
          { label: "0% Calm", value: 0 },
          { label: "25% Elevated", value: 25 },
          { label: "50% Critical", value: 50 },
        ],
        defaultValue: 0,
      },
      {
        id: "seed",
        label: "Deterministic Random Seed",
        type: "text",
        defaultValue: 12345,
      },
    ];
  }

  if (normalized.includes("retro") || normalized.includes("labyrinth") || normalized.includes("roguelike")) {
    return [
      {
        id: "difficulty",
        label: "Dungeon Difficulty",
        type: "select",
        options: [
          { label: "Junior Dev (Easy)", value: "easy" },
          { label: "Senior Architect (Normal)", value: "normal" },
          { label: "On-Call Outage (Nightmare)", value: "nightmare" },
        ],
        defaultValue: "normal",
      },
      {
        id: "cyberdeckClass",
        label: "Cyberdeck Hacker Class",
        type: "select",
        options: [
          { label: "Kernel Hacker", value: "kernel-hacker" },
          { label: "Script Kiddie", value: "script-kiddie" },
          { label: "Cypher Punk", value: "cypher-punk" },
        ],
        defaultValue: "kernel-hacker",
      },
      {
        id: "startingWeapon",
        label: "Starting Weapon Tool",
        type: "select",
        options: [
          { label: "Git Init", value: "git-init" },
          { label: "NPM Install", value: "npm-install" },
          { label: "Git Push -f", value: "git-push-force" },
        ],
        defaultValue: "git-init",
      },
      {
        id: "seed",
        label: "Deterministic Random Seed",
        type: "text",
        defaultValue: 12345,
      },
    ];
  }

  // Default fallback fields
  return [
    {
      id: "difficulty",
      label: "Difficulty Level",
      type: "select",
      options: [
        { label: "Casual", value: "easy" },
        { label: "Standard", value: "normal" },
        { label: "Hardcore", value: "hard" },
      ],
      defaultValue: "normal",
    },
    {
      id: "seed",
      label: "Deterministic Random Seed",
      type: "text",
      defaultValue: 12345,
    },
  ];
}
