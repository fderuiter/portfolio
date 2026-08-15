import { PuzzlerLevelDef } from "./types";

export const puzzleLevels: PuzzlerLevelDef[] = [
  {
    id: 1,
    title: "The Identity Crisis",
    subtitle: "Level 1 · Reflexivity",
    description: "Prove that an arbitrary variable equals itself (x = x).",
    initialRam: 16,
    goldRamTarget: 15,
    silverRamTarget: 8,
    hypotheses: [],
    goal: {
      id: "eq-lvl1",
      type: "Equality",
      value: "=",
      children: [
        { id: "var-x1", type: "Variable", value: "x" },
        { id: "var-x2", type: "Variable", value: "x" },
      ],
    },
    availableTactics: ["rfl", "sorry"],
  },
  {
    id: 2,
    title: "The Art of Substitution",
    subtitle: "Level 2 · Rewriting",
    description: "Prove a = c using hypotheses h1: a = b and h2: b = c.",
    initialRam: 16,
    goldRamTarget: 11,
    silverRamTarget: 6,
    hypotheses: [
      {
        id: "hyp-h1",
        type: "Equality",
        value: "=",
        metadata: { name: "h1" },
        children: [
          { id: "var-a-h1", type: "Variable", value: "a" },
          { id: "var-b-h1", type: "Variable", value: "b" },
        ],
      },
      {
        id: "hyp-h2",
        type: "Equality",
        value: "=",
        metadata: { name: "h2" },
        children: [
          { id: "var-b-h2", type: "Variable", value: "b" },
          { id: "var-c-h2", type: "Variable", value: "c" },
        ],
      },
    ],
    goal: {
      id: "eq-lvl2",
      type: "Equality",
      value: "=",
      children: [
        { id: "var-a-goal", type: "Variable", value: "a" },
        { id: "var-c-goal", type: "Variable", value: "c" },
      ],
    },
    availableTactics: [
      { id: "rw", hypothesis: "h1", labelOverride: "rw [h1]" },
      { id: "rw", hypothesis: "h2", labelOverride: "rw [h2]" },
      "rfl",
      "sorry",
    ],
  },
  {
    id: 3,
    title: "Brute Force is Expensive",
    subtitle: "Level 3 · Memory Economics",
    description: "Prove x + 0 = x. Notice that 'simp' burns 6 GB of Lean RAM, whereas 'rw [add_zero]' costs only 2 GB.",
    initialRam: 7,
    goldRamTarget: 4,
    silverRamTarget: 1,
    hypotheses: [
      {
        id: "hyp-add-zero",
        type: "Equality",
        value: "=",
        metadata: { name: "add_zero" },
        children: [
          {
            id: "expr-x-plus-zero",
            type: "Operator",
            value: "+",
            children: [
              { id: "var-x-h", type: "Variable", value: "x" },
              { id: "const-0-h", type: "Constant", value: 0 },
            ],
          },
          { id: "var-x-rhs", type: "Variable", value: "x" },
        ],
      },
    ],
    goal: {
      id: "eq-lvl3",
      type: "Equality",
      value: "=",
      children: [
        {
          id: "expr-x-plus-0",
          type: "Operator",
          value: "+",
          children: [
            { id: "var-x-goal", type: "Variable", value: "x" },
            { id: "const-0-goal", type: "Constant", value: 0 },
          ],
        },
        { id: "var-x-target", type: "Variable", value: "x" },
      ],
    },
    availableTactics: [
      { id: "rw", hypothesis: "add_zero", labelOverride: "rw [add_zero]" },
      "simp",
      "rfl",
      "sorry",
    ],
  },
  {
    id: 4,
    title: "Concrete Reality",
    subtitle: "Level 4 · Decidable Arithmetic",
    description: "Prove 2 + 2 = 4 using decidable arithmetic evaluation.",
    initialRam: 10,
    goldRamTarget: 6,
    silverRamTarget: 3,
    hypotheses: [],
    goal: {
      id: "eq-lvl4",
      type: "Equality",
      value: "=",
      children: [
        {
          id: "expr-2-plus-2",
          type: "Operator",
          value: "+",
          children: [
            { id: "const-2-left", type: "Constant", value: 2 },
            { id: "const-2-right", type: "Constant", value: 2 },
          ],
        },
        { id: "const-4-goal", type: "Constant", value: 4 },
      ],
    },
    availableTactics: ["decide", "simp", "rfl", "sorry"],
  },
  {
    id: 5,
    title: "Odd Quasiperfect Candidate",
    subtitle: "Level 5 · Linear Presburger System",
    description: "Prove 3x + 2y ≤ 5x + y given 0 ≤ x and y ≤ 2x using linear decision procedures.",
    initialRam: 14,
    goldRamTarget: 4,
    silverRamTarget: 2,
    hypotheses: [
      {
        id: "hyp-hx",
        type: "Inequality",
        value: "≤",
        metadata: { name: "hx" },
        children: [
          { id: "const-0-hx", type: "Constant", value: 0 },
          { id: "var-x-hx", type: "Variable", value: "x" },
        ],
      },
      {
        id: "hyp-hy",
        type: "Inequality",
        value: "≤",
        metadata: { name: "hy" },
        children: [
          { id: "var-y-hy", type: "Variable", value: "y" },
          {
            id: "expr-2x-hy",
            type: "Operator",
            value: "*",
            children: [
              { id: "const-2-hy", type: "Constant", value: 2 },
              { id: "var-x-hy2", type: "Variable", value: "x" },
            ],
          },
        ],
      },
    ],
    goal: {
      id: "ineq-lvl5",
      type: "Inequality",
      value: "≤",
      children: [
        {
          id: "expr-lhs-lvl5",
          type: "Operator",
          value: "+",
          children: [
            {
              id: "term-3x",
              type: "Operator",
              value: "*",
              children: [
                { id: "c3", type: "Constant", value: 3 },
                { id: "vx", type: "Variable", value: "x" },
              ],
            },
            {
              id: "term-2y",
              type: "Operator",
              value: "*",
              children: [
                { id: "c2", type: "Constant", value: 2 },
                { id: "vy", type: "Variable", value: "y" },
              ],
            },
          ],
        },
        {
          id: "expr-rhs-lvl5",
          type: "Operator",
          value: "+",
          children: [
            {
              id: "term-5x",
              type: "Operator",
              value: "*",
              children: [
                { id: "c5", type: "Constant", value: 5 },
                { id: "vx2", type: "Variable", value: "x" },
              ],
            },
            { id: "term-y-alone", type: "Variable", value: "y" },
          ],
        },
      ],
    },
    availableTactics: ["omega", "linarith", "simp", "sorry"],
  },
];
