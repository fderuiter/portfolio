import { z } from "zod";

export const BaseGameConfigSchema = z.object({
  gameId: z.string(),
  playerName: z.string().min(1, "Player name is required").default("Player"),
  difficulty: z.enum(["easy", "medium", "hard"]).default("medium"),
});

export type BaseGameConfig = z.infer<typeof BaseGameConfigSchema>;

// 1. Clinical Trial Chaos Schema
export const ClinicalChaosConfigSchema = BaseGameConfigSchema.extend({
  sdtmDomains: z.array(z.enum(["DM", "VS", "AE", "LB"])).min(1, "Select at least one SDTM domain").default(["DM", "VS", "AE", "LB"]),
  validationErrorThreshold: z.number().min(0, "Min 0").max(100, "Max 100").default(30),
});

export type ClinicalChaosConfig = z.infer<typeof ClinicalChaosConfigSchema>;

// 2. Garmin Watch Simulator Schema
export const GarminWatchConfigSchema = BaseGameConfigSchema.extend({
  deviceTarget: z.enum(["fenix", "forerunner", "edge"]).default("fenix"),
  bezelTheme: z.enum(["slate", "solar", "cyan", "neon"]).default("slate"),
  initialAllocationsKb: z.number().min(1, "Min 1KB").max(256, "Max 256KB").default(20),
}).refine((data) => {
  const limits: Record<string, number> = { fenix: 32, forerunner: 64, edge: 128 };
  const limit = limits[data.deviceTarget] || 32;
  return data.initialAllocationsKb <= limit;
}, {
  message: "Initial allocations exceed the device target's memory limit!",
  path: ["initialAllocationsKb"],
});

export type GarminWatchConfig = z.infer<typeof GarminWatchConfigSchema>;

// 3. Laser Loon Schema
export const LaserLoonConfigSchema = BaseGameConfigSchema.extend({
  laserType: z.enum(["ruby-laser", "cyan-pulse", "aurora-wave", "ice-cannon"]).default("ruby-laser"),
  initialAct: z.number().min(1).max(4).default(1),
});

export type LaserLoonConfig = z.infer<typeof LaserLoonConfigSchema>;

// 4. Retro Labyrinth Schema
export const RetroLabyrinthConfigSchema = BaseGameConfigSchema.extend({
  cyberdeckClass: z.enum(["script_kiddie", "cryptanalyst", "apt_specialist", "hardware_hacker"]).default("script_kiddie"),
  dungeonSize: z.enum(["small", "medium", "large"]).default("medium"),
  securityTier: z.number().min(1).max(5).default(1),
  startingExploit: z.enum(["buffer_overflow", "sql_injection", "auth_bypass", "none"]).default("none"),
});

export type RetroLabyrinthConfig = z.infer<typeof RetroLabyrinthConfigSchema>;

// 5. Working with Duck Schema
export const WorkingWithDuckConfigSchema = BaseGameConfigSchema.extend({
  puppyState: z.enum(["happy", "playful", "sleepy"]).default("happy"),
  officeBoundariesX: z.number().min(10).max(200).default(50),
  officeBoundariesY: z.number().min(10).max(200).default(50),
  levelSprint: z.number().min(1).max(5).default(1),
});

export type WorkingWithDuckConfig = z.infer<typeof WorkingWithDuckConfigSchema>;

// 6. Quasi-Perfect Puzzler Schema
export const QuasiPuzzlerConfigSchema = BaseGameConfigSchema.extend({
  proofGoal: z.enum(["identity", "double_negation", "modus_ponens", "syllogism"]).default("identity"),
  tacticSelections: z.array(z.string()).default(["intro", "apply", "cases", "exact"]),
  handLimit: z.number().min(2).max(10).default(5),
});

export type QuasiPuzzlerConfig = z.infer<typeof QuasiPuzzlerConfigSchema>;

export type AnyGameConfig =
  | ClinicalChaosConfig
  | GarminWatchConfig
  | LaserLoonConfig
  | RetroLabyrinthConfig
  | WorkingWithDuckConfig
  | QuasiPuzzlerConfig;

export const gameSchemas: Record<string, z.ZodTypeAny> = {
  "clinical-chaos": ClinicalChaosConfigSchema,
  "garmin-watch": GarminWatchConfigSchema,
  "laser-loon": LaserLoonConfigSchema,
  "retro-labyrinth": RetroLabyrinthConfigSchema,
  "working-with-duck": WorkingWithDuckConfigSchema,
  "quasi-puzzler": QuasiPuzzlerConfigSchema,
};
