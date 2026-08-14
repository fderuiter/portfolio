import fs from "fs";

export interface ScanMatch {
  lineNumber: number;
  category: string;
  matchedText: string;
  lineContent: string;
}

export const SECRET_PATTERNS = [
  {
    category: "Database Connection String (with credentials)",
    regex: /(?:postgres|postgresql|mongodb|mongodb\+srv|redis|rediss|mysql):\/\/[^:\s]+:[^@\s]+@[^\s]+/gi,
  },
  {
    category: "Database Connection Pattern",
    regex: /(?:postgres|postgresql|mongodb|mongodb\+srv|redis|rediss|mysql):\/\/[^\s/]+/gi,
  },
  {
    category: "Generic API Key/Secret/Password",
    regex: /(?:api[_-]?key|secret[_-]?key|private[_-]?key|password|auth[_-]?token|access[_-]?token|session[_-]?token)\s*[:=]\s*['"`][a-zA-Z0-9_.-]{16,}['"`]/gi,
  },
  {
    category: "AWS Access Key",
    regex: /AKIA[0-9A-Z]{16}/gi,
  },
  {
    category: "GitHub Access Token",
    regex: /(?:ghp_[a-zA-Z0-9]{36}|github_pat_[a-zA-Z0-9]{82})/gi,
  },
  {
    category: "Private Key (PEM)",
    regex: /-----BEGIN [A-Z ]+ PRIVATE KEY-----/gi,
  },
];

/**
 * Scans a given string for sensitive credential patterns.
 * @param text The text to scan.
 * @returns An array of matching elements with line number and category.
 */
export function scanText(text: string): ScanMatch[] {
  const matches: ScanMatch[] = [];
  const lines = text.split(/\r?\n/);

  for (let idx = 0; idx < lines.length; idx++) {
    const line = lines[idx];
    const lineNumber = idx + 1;

    for (const pattern of SECRET_PATTERNS) {
      // Reset regex index for safety since some have global 'g' flag
      pattern.regex.lastIndex = 0;

      const result = line.match(pattern.regex);
      if (result) {
        matches.push({
          lineNumber,
          category: pattern.category,
          matchedText: result[0],
          lineContent: line.trim(),
        });
        // Avoid adding duplicate matches for the same line with the same pattern
        break;
      }
    }
  }

  return matches;
}

/**
 * Scans a file by reading its contents and checking line-by-line.
 * @param filePath Path to the file to scan.
 * @returns An array of matches.
 */
export function scanFile(filePath: string): ScanMatch[] {
  try {
    if (!fs.existsSync(filePath)) {
      return [];
    }
    const stat = fs.statSync(filePath);
    if (!stat.isFile()) {
      return [];
    }
    const content = fs.readFileSync(filePath, "utf-8");
    return scanText(content);
  } catch (error) {
    console.error(`Error scanning file ${filePath}:`, error);
    return [];
  }
}
