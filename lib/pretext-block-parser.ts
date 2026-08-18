import { 
  walkRichInlineLineRanges, 
  materializeRichInlineLineRange,
  prepareRichInline,
  type PreparedRichInline,
  type RichInlineLineRange
} from "@chenglou/pretext/rich-inline";
import { parseMarkdownToRichItems, type ExtendedRichInlineItem } from "@/hooks/usePretextLayout";
import { resolveThemeFonts } from "@/lib/layout-config";

export type StructuredBlockType = "paragraph" | "code" | "log" | "diff";

export interface StructuredBlock {
  type: StructuredBlockType;
  language?: string;
  raw: string;
  lines: string[];
}

export interface PreparedBlock {
  type: StructuredBlockType;
  language?: string;
  lines: string[];
  raw: string;
  prepared?: PreparedRichInline | null;
  items?: ExtendedRichInlineItem[];
}

export const BLOCK_LAYOUT_CONFIG = {
  LINE_HEIGHT: 18,        // 18px per line for code / log / diff monospace blocks
  BLOCK_PADDING: 18,      // 8px top + 8px bottom + 2px border
  PARAGRAPH_GAP: 12,      // 12px gap between blocks
  PARAGRAPH_LINE_HEIGHT: 20, // standard paragraph text line height
};

const LOG_PATTERN = /^(\[\s*(ERROR|WARN|INFO|DEBUG|FATAL|TRACE)\s*\]|\d{4}-\d{2}-\d{2}|\d{2}:\d{2}:\d{2}|(ERROR|WARN|INFO|DEBUG|FATAL):)/i;
const DIFF_PATTERN = /^([+-]{1}[^+-]|@@|[*]{3}|---|\+\+\+)/;

/**
 * Identifies multi-line log blocks, structured code diffs, code blocks,
 * and standard markdown paragraphs from input text.
 */
export function parsePretextBlocks(text: string): StructuredBlock[] {
  if (!text || !text.trim()) return [];

  const blocks: StructuredBlock[] = [];
  const lines = text.split(/\r?\n/);
  let inFencedBlock = false;
  let currentLanguage = "";
  let currentBuffer: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // Check for fenced code block toggle: ``` or <pre><code>
    if (trimmed.startsWith("```")) {
      if (inFencedBlock) {
        // End of fenced block
        inFencedBlock = false;
        let blockType: StructuredBlockType = "code";
        const langLower = (currentLanguage || "").toLowerCase();

        if (langLower === "log" || langLower === "terminal" || langLower === "console") {
          blockType = "log";
        } else if (langLower === "diff" || langLower === "patch") {
          blockType = "diff";
        } else if (!langLower) {
          // Auto-detect based on buffer contents
          const isLog = currentBuffer.some((l) => LOG_PATTERN.test(l.trim()));
          const isDiff = currentBuffer.some((l) => DIFF_PATTERN.test(l.trim()));
          if (isDiff) blockType = "diff";
          else if (isLog) blockType = "log";
        }

        blocks.push({
          type: blockType,
          language: currentLanguage || blockType,
          raw: currentBuffer.join("\n"),
          lines: [...currentBuffer],
        });

        currentLanguage = "";
        currentBuffer = [];
      } else {
        // Start of fenced block
        if (currentBuffer.length > 0) {
          flushParagraphBuffer(currentBuffer, blocks);
          currentBuffer = [];
        }
        inFencedBlock = true;
        currentLanguage = trimmed.slice(3).trim();
      }
      continue;
    }

    if (inFencedBlock) {
      currentBuffer.push(line);
      continue;
    }

    // Outside fenced blocks: check for unfenced consecutive log or diff lines
    if (LOG_PATTERN.test(trimmed) || DIFF_PATTERN.test(trimmed)) {
      // Look ahead to see if next line also matches log/diff
      const nextLine = lines[i + 1]?.trim() || "";
      const prevLineIsLogDiff = currentBuffer.length > 0 && (LOG_PATTERN.test(currentBuffer[currentBuffer.length - 1].trim()) || DIFF_PATTERN.test(currentBuffer[currentBuffer.length - 1].trim()));
      
      if (prevLineIsLogDiff || LOG_PATTERN.test(nextLine) || DIFF_PATTERN.test(nextLine)) {
        if (currentBuffer.length > 0 && !prevLineIsLogDiff) {
          flushParagraphBuffer(currentBuffer, blocks);
          currentBuffer = [];
        }

        let isDiff = DIFF_PATTERN.test(trimmed);
        if (!isDiff && currentBuffer.length > 0) {
          isDiff = currentBuffer.some((l) => DIFF_PATTERN.test(l.trim()));
        }

        currentBuffer.push(line);

        // Check if block ends on this line
        const peekNext = lines[i + 1]?.trim() || "";
        if (!peekNext || (!LOG_PATTERN.test(peekNext) && !DIFF_PATTERN.test(peekNext))) {
          const type: StructuredBlockType = isDiff ? "diff" : "log";
          blocks.push({
            type,
            language: type,
            raw: currentBuffer.join("\n"),
            lines: [...currentBuffer],
          });
          currentBuffer = [];
        }
        continue;
      }
    }

    // Blank line indicates paragraph boundary
    if (trimmed === "") {
      if (currentBuffer.length > 0) {
        flushParagraphBuffer(currentBuffer, blocks);
        currentBuffer = [];
      }
    } else {
      currentBuffer.push(line);
    }
  }

  if (currentBuffer.length > 0) {
    if (inFencedBlock) {
      blocks.push({
        type: "code",
        language: currentLanguage || "code",
        raw: currentBuffer.join("\n"),
        lines: [...currentBuffer],
      });
    } else {
      flushParagraphBuffer(currentBuffer, blocks);
    }
  }

  return blocks;
}

function flushParagraphBuffer(buffer: string[], blocks: StructuredBlock[]) {
  const content = buffer.join("\n").trim();
  if (!content) return;
  blocks.push({
    type: "paragraph",
    raw: content,
    lines: [content],
  });
}

/**
 * Pre-prepares a list of structured blocks for offscreen measurement.
 */
export function preparePretextBlocks(
  text: string,
  fontSize: number = 14,
  fontFamilyVariable: string = "--font-inter"
): PreparedBlock[] {
  const blocks = parsePretextBlocks(text);
  const { baseFont, boldFont, italicFont, codeFont } = resolveThemeFonts(fontSize, fontFamilyVariable);

  return blocks.map((block) => {
    if (block.type === "paragraph") {
      const items = parseMarkdownToRichItems(block.raw, baseFont, boldFont, italicFont, codeFont);
      const prepared = prepareRichInline(items);
      return {
        ...block,
        items,
        prepared,
      };
    }
    return {
      ...block,
    };
  });
}

/**
 * Calculates the accurate offscreen height of a structured block prior to layout scheduling.
 */
export function calculateBlockHeight(
  block: PreparedBlock | StructuredBlock,
  containerWidth: number,
  lineHeight: number = BLOCK_LAYOUT_CONFIG.PARAGRAPH_LINE_HEIGHT
): number {
  if (block.type === "paragraph") {
    const preparedBlock = block as PreparedBlock;
    if (preparedBlock.prepared) {
      const linesRanges: RichInlineLineRange[] = [];
      walkRichInlineLineRanges(preparedBlock.prepared, containerWidth, (range) => {
        linesRanges.push(range);
      });
      const lineCount = Math.max(linesRanges.length, 1);
      return lineCount * lineHeight;
    }
    // Fallback estimation based on text length
    const estLines = Math.max(Math.ceil((block.raw.length * 8) / containerWidth), 1);
    return estLines * lineHeight;
  }

  // Code, Log, and Diff blocks
  // Accounts for discrete line count, line wrapping for extra long lines, plus block padding and borders
  const discreteLineCount = Math.max(block.lines.length, 1);
  const approxCharsPerLine = Math.max(Math.floor((containerWidth - 24) / 7), 20);
  
  let totalWrappedLines = 0;
  for (const line of block.lines) {
    const lineLen = line.length;
    if (lineLen === 0) {
      totalWrappedLines += 1;
    } else {
      totalWrappedLines += Math.max(Math.ceil(lineLen / approxCharsPerLine), 1);
    }
  }

  const effectiveLines = Math.max(totalWrappedLines, discreteLineCount);
  return effectiveLines * BLOCK_LAYOUT_CONFIG.LINE_HEIGHT + BLOCK_LAYOUT_CONFIG.BLOCK_PADDING;
}
