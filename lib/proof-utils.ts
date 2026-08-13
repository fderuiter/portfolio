/**
 * Logic Proof Workspace & Terminal Core Business Logic Utilities
 */

export interface Edge {
  source: string;
  target: string;
}

export const VALID_NODE_IDS = ["A", "B", "C", "D", "E"];
export const VALID_COMMANDS = ["connect", "disconnect", "list", "clear", "help", "simulate"];

/**
 * Checks if a given string is a valid Node ID.
 */
export function isValidNode(nodeId: string): boolean {
  return VALID_NODE_IDS.includes(nodeId.toUpperCase());
}

/**
 * Calculates inline autocomplete suggestion based on the current console input.
 */
export function getSuggestion(inputVal: string): string {
  const trimmed = inputVal.trim();
  if (!inputVal) return "";

  const tokens = inputVal.split(/\s+/);
  const firstWord = tokens[0].toLowerCase();

  // 1. If only typing the command name (first word)
  if (tokens.length === 1 && !inputVal.endsWith(" ")) {
    const match = VALID_COMMANDS.find((cmd) => cmd.startsWith(trimmed.toLowerCase()));
    if (match && match !== trimmed.toLowerCase()) {
      return match;
    }
  }

  // 2. If first word is "connect" or "disconnect"
  if (tokens.length > 1 && (firstWord === "connect" || firstWord === "disconnect")) {
    const secondWord = tokens[1]?.toUpperCase() || "";
    const thirdWord = tokens[2]?.toUpperCase() || "";

    if (tokens.length === 2 && !inputVal.endsWith(" ")) {
      // Autocomplete second token (source node)
      const matchNode = VALID_NODE_IDS.find((id) => id.startsWith(secondWord));
      if (matchNode && matchNode !== secondWord) {
        return `${tokens[0]} ${matchNode}`;
      }
      if (VALID_NODE_IDS.includes(secondWord)) {
        return `${tokens[0]} ${secondWord} `;
      }
    }

    if (tokens.length === 2 && inputVal.endsWith(" ")) {
      // Prompt for second node
      return `${tokens[0]} ${secondWord} `;
    }

    if (tokens.length === 3 && !inputVal.endsWith(" ")) {
      // Autocomplete third token (target node)
      const matchNode = VALID_NODE_IDS.find((id) => id.startsWith(thirdWord));
      if (matchNode && matchNode !== tokens[2]) {
        return `${tokens[0]} ${tokens[1]} ${matchNode}`;
      }
    }
  }

  // 3. If first word is "simulate"
  if (firstWord === "simulate") {
    const secondWord = tokens[1]?.toLowerCase() || "";

    if (tokens.length === 2 && !inputVal.endsWith(" ")) {
      // Autocomplete second token ("normal" or "loop")
      const subCommands = ["normal", "loop"];
      const matchSub = subCommands.find((sub) => sub.startsWith(secondWord));
      if (matchSub && matchSub !== secondWord) {
        return `${tokens[0]} ${matchSub}`;
      }
    }

    if (tokens.length === 2 && inputVal.endsWith(" ")) {
      // If just typed "simulate " with a space, suggest "simulate normal" by default
      return `${tokens[0]} normal`;
    }
  }

  return "";
}

/**
 * Evaluates the proof's logical progress based on current connections/edges.
 * Modus Ponens: A (P) and B (P -> Q) yields C (Q)
 * Modus Ponens: C (Q) and D (Q -> R) yields E (R)
 */
export function evaluateProofStatus(edges: Edge[]): { isC_Proven: boolean; isE_Proven: boolean } {
  // Check connections for Node C
  const hasAToC = edges.some((e) => (e.source === "A" && e.target === "C") || (e.source === "C" && e.target === "A"));
  const hasBToC = edges.some((e) => (e.source === "B" && e.target === "C") || (e.source === "C" && e.target === "B"));
  const isC_Proven = hasAToC && hasBToC;

  // Check connections for Node E
  const hasCToE = edges.some((e) => (e.source === "C" && e.target === "E") || (e.source === "E" && e.target === "C"));
  const hasDToE = edges.some((e) => (e.source === "D" && e.target === "E") || (e.source === "E" && e.target === "D"));
  const isE_Proven = isC_Proven && hasCToE && hasDToE;

  return { isC_Proven, isE_Proven };
}
