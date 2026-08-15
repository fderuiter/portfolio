/**
 * Cybersecurity Hex Matrix Buffer & Sequence Bypass Minigame Engine
 */

import { HexCell, HexMatrixPuzzle } from "./types";

const HEX_BYTE_POOL = ["1C", "E9", "7A", "BD", "55", "FF", "A3", "4D", "3B", "C2"];

/**
 * Generates a procedurally solvable Hex Matrix Buffer bypass puzzle.
 * Uses alternating row/column constraint rules inspired by cybernetic hacking matrices.
 */
export function generateHexMatrixPuzzle(difficulty: number = 1): HexMatrixPuzzle {
  const size = difficulty > 2 ? 5 : 4;
  const grid: HexCell[][] = [];

  for (let r = 0; r < size; r++) {
    const row: HexCell[] = [];
    for (let c = 0; c < size; c++) {
      const randomByte = HEX_BYTE_POOL[Math.floor(Math.random() * HEX_BYTE_POOL.length)];
      row.push({
        row: r,
        col: c,
        byte: randomByte,
        selected: false,
      });
    }
    grid.push(row);
  }

  // Construct a guaranteed solvable target sequence
  const sequenceLength = Math.min(4, Math.max(2, difficulty + 1));
  const targetSequence: string[] = [];

  let curRow = 0;
  let curCol = Math.floor(Math.random() * size);
  let isRowMove = true;

  for (let i = 0; i < sequenceLength; i++) {
    if (isRowMove) {
      curCol = Math.floor(Math.random() * size);
      targetSequence.push(grid[curRow][curCol].byte);
      isRowMove = false;
    } else {
      curRow = Math.floor(Math.random() * size);
      targetSequence.push(grid[curRow][curCol].byte);
      isRowMove = true;
    }
  }

  const maxBufferSize = sequenceLength + 2;
  const timeLimit = Math.max(12, 25 - difficulty * 3);

  return {
    grid,
    targetSequence,
    currentInput: [],
    maxBufferSize,
    timeRemainingSeconds: timeLimit,
    activeAxis: "row",
    activeIndex: 0,
    solved: false,
    failed: false,
    rewardCrypto: 150 * difficulty + 100,
    rewardBypassChips: difficulty >= 3 ? 1 : 0,
  };
}

/**
 * Checks if target sequence exists as a continuous subsequence in the current buffer.
 */
export function isSequenceMatched(buffer: string[], target: string[]): boolean {
  if (target.length === 0) return true;
  if (buffer.length < target.length) return false;

  for (let i = 0; i <= buffer.length - target.length; i++) {
    let match = true;
    for (let j = 0; j < target.length; j++) {
      if (buffer[i + j] !== target[j]) {
        match = false;
        break;
      }
    }
    if (match) return true;
  }
  return false;
}

/**
 * Selects a hex matrix cell and processes the next step in the bypass sequence.
 */
export function selectHexCell(
  puzzle: HexMatrixPuzzle,
  row: number,
  col: number
): { puzzle: HexMatrixPuzzle; message: string; soundType: "click" | "match" | "fail" } {
  if (puzzle.solved || puzzle.failed) {
    return { puzzle, message: "Puzzle already finished", soundType: "click" };
  }

  // Validate active row/col constraint
  if (puzzle.activeAxis === "row" && row !== puzzle.activeIndex) {
    return { puzzle, message: `Must select from Row ${puzzle.activeIndex + 1}`, soundType: "fail" };
  }
  if (puzzle.activeAxis === "col" && col !== puzzle.activeIndex) {
    return {
      puzzle,
      message: `Must select from Column ${puzzle.activeIndex + 1}`,
      soundType: "fail",
    };
  }

  const cell = puzzle.grid[row]?.[col];
  if (!cell || cell.selected) {
    return { puzzle, message: "Cell already utilized", soundType: "fail" };
  }

  // Clone grid and mark cell selected
  const newGrid = puzzle.grid.map((r, rIdx) =>
    r.map((c, cIdx) => (rIdx === row && cIdx === col ? { ...c, selected: true } : { ...c }))
  );

  const newInput = [...puzzle.currentInput, cell.byte];
  const matched = isSequenceMatched(newInput, puzzle.targetSequence);

  if (matched) {
    return {
      puzzle: {
        ...puzzle,
        grid: newGrid,
        currentInput: newInput,
        solved: true,
        failed: false,
      },
      message: `BYPASS VERIFIED! Decrypted +${puzzle.rewardCrypto} Crypto!`,
      soundType: "match",
    };
  }

  if (newInput.length >= puzzle.maxBufferSize) {
    return {
      puzzle: {
        ...puzzle,
        grid: newGrid,
        currentInput: newInput,
        failed: true,
      },
      message: "BUFFER OVERFLOW! Encryption lock triggered.",
      soundType: "fail",
    };
  }

  // Alternate axis for next selection
  const nextAxis = puzzle.activeAxis === "row" ? "col" : "row";
  const nextIndex = puzzle.activeAxis === "row" ? col : row;

  return {
    puzzle: {
      ...puzzle,
      grid: newGrid,
      currentInput: newInput,
      activeAxis: nextAxis,
      activeIndex: nextIndex,
    },
    message: `Injected byte [${cell.byte}]. Buffer: ${newInput.join(" ")}`,
    soundType: "click",
  };
}

/**
 * Instantly solves the puzzle using a hardware bypass chip.
 */
export function consumeBypassChip(puzzle: HexMatrixPuzzle): HexMatrixPuzzle {
  return {
    ...puzzle,
    solved: true,
    failed: false,
    currentInput: [...puzzle.targetSequence],
  };
}
