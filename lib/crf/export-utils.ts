/**
 * CRF Export Utility Helpers
 * Shared options parsing and value extraction routines
 */

import { StudyProtocol, CRFField, CodelistOption } from "./types";
import { STANDARD_CODELISTS } from "./cdisc-controlled-terminology";

/**
 * Retrieves field options from custom options or referenced codelists.
 */
export function getFieldOptions(field: CRFField, study: StudyProtocol): CodelistOption[] {
  if (field.customOptions && field.customOptions.length > 0) {
    return field.customOptions;
  }
  if (field.codelistId) {
    const cl = study.codelists?.find((c) => c.id === field.codelistId) ||
               STANDARD_CODELISTS.find((c) => c.id === field.codelistId);
    if (cl && cl.options && cl.options.length > 0) {
      return cl.options;
    }
  }
  if (field.dataType === "checkbox" || field.dataType === "multi_select") {
    const nyCodelist = STANDARD_CODELISTS.find((c) => c.id === "CL_NY");
    if (nyCodelist) return nyCodelist.options;
  }
  return [];
}

/**
 * Parses a comma-separated multi-select EDC response string
 * and checks whether a specific option code is selected.
 * Returns 'Y' if selected, 'N' if absent/unselected.
 */
export function parseMultiSelectValue(
  edcValue: string | string[] | null | undefined,
  optionCode: string
): "Y" | "N" {
  if (!edcValue) return "N";
  let selectedCodes: string[] = [];
  if (Array.isArray(edcValue)) {
    selectedCodes = edcValue.map((s) => String(s).trim().toUpperCase());
  } else if (typeof edcValue === "string") {
    selectedCodes = edcValue.split(",").map((s) => s.trim().toUpperCase());
  }
  const normalizedTarget = optionCode.trim().toUpperCase();
  return selectedCodes.includes(normalizedTarget) ? "Y" : "N";
}
