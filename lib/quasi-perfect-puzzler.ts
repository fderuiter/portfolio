import { puzzleLevels } from "./quasi-perfect/levels";
import { tacticDefs } from "./quasi-perfect/tactics";
import { PuzzlerLevelDef } from "./quasi-perfect/types";

export * from "./quasi-perfect";

export type PuzzlerTacticId = "simp" | "rw" | "linarith" | "omega" | "decide" | "sorry";

export interface PuzzlerTactic {
  id: PuzzlerTacticId;
  label: string;
  memoryCostGb: number;
  description: string;
}

export interface PuzzlerLevel {
  id: string;
  title: string;
  goal: string;
  prompt: string;
  tactics: PuzzlerTacticId[];
}

export const puzzlerTactics: Record<PuzzlerTacticId, PuzzlerTactic> = {
  simp: { id: "simp", label: "simp", memoryCostGb: tacticDefs.simp.baseRamCost, description: tacticDefs.simp.description },
  rw: { id: "rw", label: "rw [h1]", memoryCostGb: tacticDefs.rw.baseRamCost, description: tacticDefs.rw.description },
  linarith: { id: "linarith", label: "linarith", memoryCostGb: tacticDefs.linarith.baseRamCost, description: tacticDefs.linarith.description },
  omega: { id: "omega", label: "omega", memoryCostGb: tacticDefs.omega.baseRamCost, description: tacticDefs.omega.description },
  decide: { id: "decide", label: "decide", memoryCostGb: tacticDefs.decide.baseRamCost, description: tacticDefs.decide.description },
  sorry: { id: "sorry", label: "Use sorry", memoryCostGb: tacticDefs.sorry.baseRamCost, description: tacticDefs.sorry.description },
};

export const puzzlerLevels: readonly PuzzlerLevel[] = puzzleLevels.map((lvl: PuzzlerLevelDef) => ({
  id: String(lvl.id),
  title: lvl.title,
  goal: `⊢ ${lvl.description}`,
  prompt: lvl.description,
  tactics: lvl.availableTactics.map((t) => (typeof t === "string" ? t : t.id)) as PuzzlerTacticId[],
}));
