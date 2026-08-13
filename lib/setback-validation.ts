import { scanText } from "./validation-scanner";

export interface SetbackInput {
  title: string;
  editorial_content: string;
}

const UNPROFESSIONAL_WORDS = [
  "lazy", "stupid", "idiot", "hate", "crap", "shit", "fuck", "damn",
  "garbage", "trash", "clueless", "useless", "awful", "terrible"
];

/**
 * Validates a setback record before insertion into the database.
 * Returns a list of error messages. Empty list means the setback is valid.
 */
export function validateSetback(setback: SetbackInput): string[] {
  const errors: string[] = [];

  // Check missing fields
  if (!setback.title) {
    errors.push("Missing required field: title");
  }
  if (!setback.editorial_content) {
    errors.push("Missing required field: editorial_content");
  }

  // Length rules
  if (setback.title) {
    if (setback.title.length < 10 || setback.title.length > 100) {
      errors.push("Title must be between 10 and 100 characters.");
    }
  }
  if (setback.editorial_content) {
    if (setback.editorial_content.length < 20 || setback.editorial_content.length > 500) {
      errors.push("Content must be between 20 and 500 characters.");
    }
  }

  // Character rules (no HTML tags)
  const htmlTagRegex = /<[^>]+>/;
  if (setback.title && htmlTagRegex.test(setback.title)) {
    errors.push("HTML tags are not allowed in setback title.");
  }
  if (setback.editorial_content && htmlTagRegex.test(setback.editorial_content)) {
    errors.push("HTML tags are not allowed in setback content.");
  }

  // Tone rules (unprofessional content check)
  if (setback.title || setback.editorial_content) {
    const combinedText = `${setback.title || ""} ${setback.editorial_content || ""}`;
    const wordPattern = new RegExp(`\\b(${UNPROFESSIONAL_WORDS.join("|")})\\b`, "i");
    if (wordPattern.test(combinedText)) {
      errors.push("Content contains unprofessional tone or negative/sensitive language.");
    }
  }

  // Sensitive content verification (scanText checks for DB URIs, AWS keys, etc.)
  if (setback.title) {
    const matches = scanText(setback.title);
    if (matches.length > 0) {
      errors.push(`Sensitive or credential information detected in setback title: [${matches[0].category}]`);
    }
  }
  if (setback.editorial_content) {
    const matches = scanText(setback.editorial_content);
    if (matches.length > 0) {
      errors.push(`Sensitive or credential information detected in setback content: [${matches[0].category}]`);
    }
  }

  return errors;
}
