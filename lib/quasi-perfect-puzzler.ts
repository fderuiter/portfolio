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
  simp: { id: "simp", label: "simp", memoryCostGb: 2, description: "Simplify a bounded expression." },
  rw: { id: "rw", label: "rw [h1]", memoryCostGb: 1, description: "Rewrite using a known equality." },
  linarith: { id: "linarith", label: "linarith", memoryCostGb: 3, description: "Close a linear arithmetic goal." },
  omega: { id: "omega", label: "omega", memoryCostGb: 4, description: "Reason over Presburger arithmetic." },
  decide: { id: "decide", label: "decide", memoryCostGb: 1, description: "Resolve a decidable finite proposition." },
  sorry: { id: "sorry", label: "Use sorry", memoryCostGb: 0, description: "End the level with a morality penalty." },
};

export const puzzlerLevels: readonly PuzzlerLevel[] = [
  {
    id: "odd-quasiperfect",
    title: "Odd Quasiperfect Candidate",
    goal: "⊢ n = σ(n) - 1 → False",
    prompt: "Reduce the contradiction without exhausting the simulated Lean server.",
    tactics: ["simp", "rw", "omega", "sorry"],
  },
];
