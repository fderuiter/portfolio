export type NodeType =
  | "Equality"
  | "Inequality"
  | "Implication"
  | "Operator"
  | "Variable"
  | "Constant"
  | "Boolean"
  | "Function";

export interface ASTNode {
  id: string;
  type: NodeType;
  value: string | number | boolean;
  children?: ASTNode[];
  metadata?: Record<string, unknown>;
}

export type TacticId =
  | "rfl"
  | "rw"
  | "simp"
  | "decide"
  | "omega"
  | "linarith"
  | "intro"
  | "sorry";

export interface TacticResult {
  success: boolean;
  newAST?: ASTNode;
  ramConsumed: number;
  message: string;
  isProofComplete?: boolean;
}

export type TacticFunction = (
  targetNode: ASTNode,
  globalAST: ASTNode,
  hypotheses: ASTNode[],
  arg?: string
) => TacticResult;

export interface TacticDef {
  id: TacticId;
  name: string;
  label: string;
  description: string;
  baseRamCost: number;
  failureCost: number;
  hypothesisTarget?: string;
  execute: TacticFunction;
}

export interface PuzzlerLevelDef {
  id: number | string;
  title: string;
  subtitle: string;
  description: string;
  initialRam: number;
  goldRamTarget: number;
  silverRamTarget: number;
  hypotheses: ASTNode[];
  goal: ASTNode;
  availableTactics: (TacticId | { id: TacticId; hypothesis?: string; labelOverride?: string })[];
}

export interface CompilerLogEntry {
  id: string;
  timestamp: string;
  type: "info" | "success" | "warning" | "error";
  text: string;
}

export interface LevelScore {
  levelId: string | number;
  completed: boolean;
  usedSorry: boolean;
  remainingRam: number;
  stars: number; // 0 (sorry), 1 (bronze), 2 (silver), 3 (gold)
  morality: number; // 100 for true proof, -100 for sorry
  timestamp: number;
}

export interface GameProgressState {
  completedLevels: Record<string | number, LevelScore>;
  currentLevelIndex: number;
}
