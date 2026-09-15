"use client";

import React, { useState, useRef, useMemo, useCallback } from "react";
import {
  CRFForm,
  CRFField,
  CRFSection,
  CodelistDefinition,
  ClinicalDataType,
  StudyProtocol,
  StudioMode,
} from "@/lib/crf/types";
import { validateCdashVariableName } from "@/lib/crf/precision-date";
import {
  IconTable,
  IconCheck,
  IconAlertTriangle,
  IconX,
  IconCopy,
  IconClipboard,
  IconSearch,
  IconArrowLeft,
  IconSparkles,
  IconInfoCircle,
  IconFilter,
} from "@tabler/icons-react";

export interface BatchFieldUpdate {
  fieldId: string;
  updates: Partial<CRFField>;
  newVariableName?: string;
}

interface ActiveFormGridEditorProps {
  study: StudyProtocol;
  activeForm: CRFForm;
  selectedFieldId: string | null;
  codelists: CodelistDefinition[];
  onSelectField: (fieldId: string | null) => void;
  onUpdateField: (fieldId: string, updates: Partial<CRFField>) => void;
  onBatchUpdateFields: (batch: BatchFieldUpdate[]) => void;
  onRenameFieldEverywhere: (
    fieldId: string,
    newVarName: string,
    newLabel?: string
  ) => void;
  onSwitchMode: (mode: StudioMode) => void;
}

const DATA_TYPES: ClinicalDataType[] = [
  "text",
  "textarea",
  "number",
  "integer",
  "date",
  "partial_date",
  "precision_date",
  "time",
  "datetime",
  "single_select",
  "multi_select",
  "radio",
  "checkbox",
  "vas_scale",
  "nrs_scale",
  "calculated",
  "repeating_table",
  "signature",
];

const REQUIREMENT_TIERS = [
  { value: "optional", label: "Optional" },
  { value: "hard_stop", label: "Hard Stop" },
  { value: "auto_query", label: "Auto Query" },
];

export interface GridCellLocation {
  rowIndex: number;
  colIndex: number;
}

export interface CellValidationError {
  rowIndex: number;
  colKey: keyof CRFField | "variableName";
  message: string;
}

export interface ParsedPasteRow {
  fieldId: string;
  variableName: string;
  label: string;
  dataType: ClinicalDataType;
  required: boolean;
  columnSpan: number;
  codelistId?: string;
  unit?: string;
  requirementTier?: "optional" | "hard_stop" | "auto_query";
  description?: string;
}

export interface PastePreviewItem {
  rowNumber: number;
  fieldId: string;
  sectionTitle: string;
  current: CRFField;
  proposed: Partial<CRFField> & { variableName: string };
  errors: CellValidationError[];
}

export function ActiveFormGridEditor({
  study: _study,
  activeForm,
  selectedFieldId,
  codelists,
  onSelectField,
  onUpdateField,
  onBatchUpdateFields,
  onRenameFieldEverywhere,
  onSwitchMode,
}: ActiveFormGridEditorProps) {
  // Flatten fields with section context
  const flatFields = useMemo(() => {
    if (!activeForm || !activeForm.sections) return [];
    const result: Array<{ section: CRFSection; field: CRFField }> = [];
    for (const sec of activeForm.sections) {
      for (const fld of sec.fields) {
        result.push({ section: sec, field: fld });
      }
    }
    return result;
  }, [activeForm]);

  const [searchQuery, setSearchQuery] = useState("");
  const filteredFields = useMemo(() => {
    if (!searchQuery.trim()) return flatFields;
    const q = searchQuery.toLowerCase().trim();
    return flatFields.filter(
      (item) =>
        item.field.variableName.toLowerCase().includes(q) ||
        item.field.label.toLowerCase().includes(q) ||
        item.field.id.toLowerCase().includes(q) ||
        item.section.title.toLowerCase().includes(q)
    );
  }, [flatFields, searchQuery]);

  // Focus and cell selection state
  const [focusedCell, setFocusedCell] = useState<GridCellLocation | null>(null);
  const [editingCell, setEditingCell] = useState<GridCellLocation | null>(null);

  // Paste Modal & Preview State
  const [isPasteModalOpen, setIsPasteModalOpen] = useState(false);
  const [pasteRawText, setPasteRawText] = useState("");
  const [pastePreview, setPastePreview] = useState<PastePreviewItem[] | null>(
    null
  );
  const [pasteErrorBanner, setPasteErrorBanner] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const gridContainerRef = useRef<HTMLDivElement>(null);

  const COLUMN_KEYS = useMemo(
    () => [
      "id",
      "variableName",
      "label",
      "dataType",
      "required",
      "columnSpan",
      "codelistId",
      "unit",
      "requirementTier",
      "description",
    ],
    []
  );

  // Synchronize focused cell when selectedFieldId changes externally
  const [prevSelectedId, setPrevSelectedId] = useState<string | null>(
    selectedFieldId
  );
  if (selectedFieldId !== prevSelectedId) {
    setPrevSelectedId(selectedFieldId);
    if (selectedFieldId && filteredFields.length > 0) {
      const idx = filteredFields.findIndex(
        (item) => item.field.id === selectedFieldId
      );
      if (idx !== -1 && (!focusedCell || focusedCell.rowIndex !== idx)) {
        setFocusedCell({ rowIndex: idx, colIndex: 1 }); // Focus variableName column
      }
    }
  }

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Keyboard navigation handler for the grid
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (editingCell) {
      if (e.key === "Escape") {
        setEditingCell(null);
        e.preventDefault();
        e.stopPropagation();
      }
      return;
    }

    if (!focusedCell && filteredFields.length > 0) {
      if (
        e.key === "ArrowDown" ||
        e.key === "ArrowUp" ||
        e.key === "ArrowLeft" ||
        e.key === "ArrowRight" ||
        e.key === "Enter"
      ) {
        setFocusedCell({ rowIndex: 0, colIndex: 1 });
        e.preventDefault();
        return;
      }
    }

    if (!focusedCell) return;

    const maxRow = filteredFields.length - 1;
    const maxCol = COLUMN_KEYS.length - 1;

    switch (e.key) {
      case "ArrowUp":
        e.preventDefault();
        if (focusedCell.rowIndex > 0) {
          const nextRow = focusedCell.rowIndex - 1;
          setFocusedCell({ ...focusedCell, rowIndex: nextRow });
          onSelectField(filteredFields[nextRow].field.id);
        }
        break;

      case "ArrowDown":
        e.preventDefault();
        if (focusedCell.rowIndex < maxRow) {
          const nextRow = focusedCell.rowIndex + 1;
          setFocusedCell({ ...focusedCell, rowIndex: nextRow });
          onSelectField(filteredFields[nextRow].field.id);
        }
        break;

      case "ArrowLeft":
        e.preventDefault();
        if (focusedCell.colIndex > 0) {
          setFocusedCell({
            ...focusedCell,
            colIndex: focusedCell.colIndex - 1,
          });
        }
        break;

      case "ArrowRight":
        e.preventDefault();
        if (focusedCell.colIndex < maxCol) {
          setFocusedCell({
            ...focusedCell,
            colIndex: focusedCell.colIndex + 1,
          });
        }
        break;

      case "Tab":
        e.preventDefault();
        if (e.shiftKey) {
          if (focusedCell.colIndex > 0) {
            setFocusedCell({
              ...focusedCell,
              colIndex: focusedCell.colIndex - 1,
            });
          } else if (focusedCell.rowIndex > 0) {
            const nextRow = focusedCell.rowIndex - 1;
            setFocusedCell({ rowIndex: nextRow, colIndex: maxCol });
            onSelectField(filteredFields[nextRow].field.id);
          }
        } else {
          if (focusedCell.colIndex < maxCol) {
            setFocusedCell({
              ...focusedCell,
              colIndex: focusedCell.colIndex + 1,
            });
          } else if (focusedCell.rowIndex < maxRow) {
            const nextRow = focusedCell.rowIndex + 1;
            setFocusedCell({ rowIndex: nextRow, colIndex: 0 });
            onSelectField(filteredFields[nextRow].field.id);
          }
        }
        break;

      case "Enter":
        e.preventDefault();
        // ID column (0) is read-only stable identity
        if (focusedCell.colIndex !== 0) {
          setEditingCell({ ...focusedCell });
        }
        break;

      case "Escape":
        e.preventDefault();
        setFocusedCell(null);
        setEditingCell(null);
        break;

      default:
        // Shortcut to trigger paste modal with Cmd/Ctrl+V
        if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "v") {
          e.preventDefault();
          setIsPasteModalOpen(true);
        }
        break;
    }
  };

  // Helper to commit direct cell edits
  const handleCellChange = (
    field: CRFField,
    key: keyof CRFField,
    val: unknown
  ) => {
    if (key === "variableName") {
      const newVar = String(val).trim().toUpperCase();
      if (newVar && newVar !== field.variableName) {
        onRenameFieldEverywhere(field.id, newVar, field.label);
        showToast(`Renamed variable to '${newVar}' (Sentinel refactored)`);
      }
    } else {
      onUpdateField(field.id, { [key]: val });
    }
  };

  // Validate paste text and generate preview
  const parseAndValidatePaste = useCallback(
    (text: string): { items: PastePreviewItem[]; totalErrors: number } => {
      const lines = text
        .split(/\r?\n/)
        .map((l) => l.trim())
        .filter((l) => l.length > 0);

      const items: PastePreviewItem[] = [];
      let totalErrors = 0;

      // Detect header row if first row's first column is a header label like 'variablename' or 'variable'
      let startIdx = 0;
      if (lines.length > 0) {
        const firstRowCells = lines[0]
          .toLowerCase()
          .split("\t")
          .map((c) => c.trim());
        const firstCol = firstRowCells[0];
        if (
          firstCol === "variablename" ||
          firstCol === "variable_name" ||
          firstCol === "variable" ||
          firstCol === "varname"
        ) {
          startIdx = 1; // Skip header
        }
      }

      // Track variable names inside the batch to catch intra-batch collisions
      const batchVars = new Set<string>();

      for (let i = startIdx; i < lines.length; i++) {
        const line = lines[i];
        const cells = line.split("\t").map((c) => c.trim());

        // Target field index mapping: row i-startIdx maps to flatFields[targetIdx]
        const targetIdx = i - startIdx;
        if (targetIdx >= flatFields.length) {
          break; // Don't overflow form bounds
        }

        const targetItem = flatFields[targetIdx];
        const currentField = targetItem.field;
        const rowErrors: CellValidationError[] = [];

        // Columns expected in TSV order:
        // [0] VariableName, [1] Label, [2] DataType, [3] Required, [4] ColumnSpan, [5] CodelistId, [6] Unit, [7] RequirementTier, [8] Description
        // OR if 1 column: VariableName
        const rawVarName = cells[0] || currentField.variableName;
        const rawLabel = cells.length > 1 ? cells[1] : currentField.label;
        const rawDataType = cells.length > 2 ? cells[2] : currentField.dataType;
        const rawRequired =
          cells.length > 3 ? cells[3] : String(currentField.required);
        const rawSpan =
          cells.length > 4 ? cells[4] : String(currentField.columnSpan);
        const rawCodelist =
          cells.length > 5 ? cells[5] : currentField.codelistId;
        const rawUnit = cells.length > 6 ? cells[6] : currentField.unit;
        const rawReqTier =
          cells.length > 7 ? cells[7] : currentField.requirementTier;
        const rawDesc = cells.length > 8 ? cells[8] : currentField.description;

        // 1. Validate Variable Name
        const cleanVar = rawVarName.trim().toUpperCase();
        if (!cleanVar) {
          rowErrors.push({
            rowIndex: i,
            colKey: "variableName",
            message: "Variable name cannot be empty.",
          });
        } else {
          const vRes = validateCdashVariableName(cleanVar);
          if (!vRes.isValid) {
            rowErrors.push({
              rowIndex: i,
              colKey: "variableName",
              message: vRes.error || "Invalid CDASH variable format.",
            });
          } else if (batchVars.has(cleanVar)) {
            rowErrors.push({
              rowIndex: i,
              colKey: "variableName",
              message: `Duplicate variable '${cleanVar}' in paste payload.`,
            });
          } else {
            // Check collision with other form fields not in this row
            const collision = flatFields.some(
              (f, idx) =>
                idx !== targetIdx &&
                f.field.variableName.toUpperCase() === cleanVar
            );
            if (collision) {
              rowErrors.push({
                rowIndex: i,
                colKey: "variableName",
                message: `Variable '${cleanVar}' conflicts with existing field in form.`,
              });
            } else {
              batchVars.add(cleanVar);
            }
          }
        }

        // 2. Validate Data Type
        const cleanType = rawDataType.toLowerCase() as ClinicalDataType;
        if (rawDataType && !DATA_TYPES.includes(cleanType)) {
          rowErrors.push({
            rowIndex: i,
            colKey: "dataType",
            message: `Invalid data type '${rawDataType}'.`,
          });
        }

        // 3. Validate Required
        let parsedRequired = currentField.required;
        if (rawRequired !== undefined) {
          const lReq = String(rawRequired).toLowerCase();
          if (["true", "1", "yes", "y", "req"].includes(lReq)) {
            parsedRequired = true;
          } else if (["false", "0", "no", "n", "opt"].includes(lReq)) {
            parsedRequired = false;
          } else {
            rowErrors.push({
              rowIndex: i,
              colKey: "required",
              message: `Must be true/false or yes/no (got '${rawRequired}').`,
            });
          }
        }

        // 4. Validate Column Span
        let parsedSpan = currentField.columnSpan;
        if (rawSpan !== undefined && rawSpan !== "") {
          const num = parseInt(rawSpan, 10);
          if (isNaN(num) || num < 1 || num > 12) {
            rowErrors.push({
              rowIndex: i,
              colKey: "columnSpan",
              message: `Column span must be an integer between 1 and 12 (got '${rawSpan}').`,
            });
          } else {
            parsedSpan = num;
          }
        }

        // 5. Validate Requirement Tier
        let parsedTier = currentField.requirementTier;
        if (rawReqTier !== undefined && rawReqTier !== "") {
          const cleanTier = rawReqTier.toLowerCase();
          if (["optional", "hard_stop", "auto_query"].includes(cleanTier)) {
            parsedTier = cleanTier as "optional" | "hard_stop" | "auto_query";
          } else {
            rowErrors.push({
              rowIndex: i,
              colKey: "requirementTier",
              message: `Must be optional, hard_stop, or auto_query (got '${rawReqTier}').`,
            });
          }
        }

        totalErrors += rowErrors.length;

        items.push({
          rowNumber: targetIdx + 1,
          fieldId: currentField.id,
          sectionTitle: targetItem.section.title,
          current: currentField,
          proposed: {
            variableName: cleanVar,
            label: rawLabel || currentField.label,
            dataType: DATA_TYPES.includes(cleanType)
              ? cleanType
              : currentField.dataType,
            required: parsedRequired,
            columnSpan: parsedSpan,
            codelistId: rawCodelist || currentField.codelistId,
            unit: rawUnit || currentField.unit,
            requirementTier: parsedTier,
            description: rawDesc || currentField.description,
          },
          errors: rowErrors,
        });
      }

      return { items, totalErrors };
    },
    [flatFields]
  );

  const handleProcessPasteText = () => {
    if (!pasteRawText.trim()) {
      setPasteErrorBanner("Please paste tabular metadata text first.");
      return;
    }

    const { items, totalErrors } = parseAndValidatePaste(pasteRawText);
    setPastePreview(items);
    if (totalErrors > 0) {
      setPasteErrorBanner(
        `Found ${totalErrors} validation error(s). Please fix the text or selection before committing.`
      );
    } else {
      setPasteErrorBanner(null);
    }
  };

  const handleCommitBatchPaste = () => {
    if (!pastePreview || pastePreview.length === 0) return;

    // Reject commit if any row contains validation errors
    const hasErrors = pastePreview.some((item) => item.errors.length > 0);
    if (hasErrors) {
      setPasteErrorBanner(
        "Cannot commit batch: Paste payload contains invalid cells. Invalid paste cannot partially overwrite the draft."
      );
      return;
    }

    // Prepare atomic batch updates
    const batchUpdates: BatchFieldUpdate[] = pastePreview.map((item) => ({
      fieldId: item.fieldId,
      updates: {
        label: item.proposed.label,
        dataType: item.proposed.dataType,
        required: item.proposed.required,
        columnSpan: item.proposed.columnSpan,
        codelistId: item.proposed.codelistId,
        unit: item.proposed.unit,
        requirementTier: item.proposed.requirementTier,
        description: item.proposed.description,
      },
      newVariableName: item.proposed.variableName,
    }));

    onBatchUpdateFields(batchUpdates);
    setIsPasteModalOpen(false);
    setPasteRawText("");
    setPastePreview(null);
    showToast(
      `Committed batch metadata update (${batchUpdates.length} fields updated atomically with 1 undo unit).`
    );
  };

  const handleExportTsv = () => {
    const headers = [
      "VariableName",
      "Label",
      "DataType",
      "Required",
      "ColumnSpan",
      "CodelistId",
      "Unit",
      "RequirementTier",
      "Description",
    ];
    const rows = flatFields.map(({ field }) => [
      field.variableName,
      field.label,
      field.dataType,
      field.required ? "true" : "false",
      field.columnSpan,
      field.codelistId || "",
      field.unit || "",
      field.requirementTier || "optional",
      field.description || "",
    ]);

    const tsvContent = [
      headers.join("\t"),
      ...rows.map((r) => r.join("\t")),
    ].join("\n");

    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(tsvContent);
      showToast("Copied active form TSV metadata grid to clipboard.");
    }
  };

  return (
    <div
      ref={gridContainerRef}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      className="flex-1 flex flex-col h-full bg-zinc-950 text-zinc-100 outline-none select-none overflow-hidden"
    >
      {/* Toast Notification */}
      {toastMessage && (
        <div className="absolute top-4 right-4 z-50 bg-emerald-950/90 text-emerald-200 border border-emerald-800/80 px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2 text-xs font-mono animate-in fade-in slide-in-from-top-2">
          <IconCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Grid Header Toolbar */}
      <div className="px-6 py-3.5 border-b border-zinc-800/80 bg-zinc-900/60 flex flex-wrap items-center justify-between gap-4 shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => onSwitchMode("designer")}
            className="p-1.5 rounded-lg bg-zinc-800/60 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-700/60 transition-colors text-xs flex items-center gap-1.5"
            title="Return to Canvas"
          >
            <IconArrowLeft className="w-4 h-4" />
            <span className="font-medium hidden sm:inline">Canvas</span>
          </button>
          <div>
            <div className="flex items-center gap-2">
              <IconTable className="w-5 h-5 text-amber-400" />
              <h2 className="text-sm font-semibold text-zinc-100 tracking-tight">
                Active-Form Grid Metadata Editor
              </h2>
              <span className="text-[10px] font-mono uppercase bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded-md">
                {activeForm?.name || "Form"} ({flatFields.length} fields)
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 mt-0.5">
              Edit variables, labels, and types directly. Sentinel automatically
              updates rule references on rename.
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Search Input */}
          <div className="relative w-48 sm:w-64">
            <IconSearch className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-zinc-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search fields or variables..."
              className="w-full pl-8 pr-3 py-1.5 bg-zinc-950/80 border border-zinc-800 rounded-lg text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-amber-500/60"
            />
          </div>

          <button
            onClick={handleExportTsv}
            className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-700/80 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors"
            title="Copy entire form metadata grid as TSV"
          >
            <IconCopy className="w-3.5 h-3.5 text-zinc-400" />
            <span>Copy TSV</span>
          </button>

          <button
            onClick={() => setIsPasteModalOpen(true)}
            className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-zinc-950 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <IconClipboard className="w-3.5 h-3.5" />
            <span>Paste / Batch Update</span>
          </button>
        </div>
      </div>

      {/* Grid Container */}
      <div className="flex-1 overflow-auto p-4 bg-zinc-950/90">
        {filteredFields.length === 0 ? (
          <div className="p-12 text-center text-zinc-500 flex flex-col items-center justify-center">
            <IconFilter className="w-8 h-8 mb-2 opacity-50 text-zinc-400" />
            <p className="text-sm">No metadata fields found matching query.</p>
          </div>
        ) : (
          <div className="border border-zinc-800 rounded-xl overflow-hidden shadow-2xl bg-zinc-900/40">
            <table
              role="grid"
              className="w-full text-left border-collapse text-xs"
            >
              <thead>
                <tr className="bg-zinc-900 border-b border-zinc-800 text-[11px] font-mono text-zinc-400 uppercase tracking-wider">
                  <th className="py-2.5 px-3 w-12 text-center border-r border-zinc-800">
                    #
                  </th>
                  <th className="py-2.5 px-3 min-w-[130px] border-r border-zinc-800">
                    Field ID (Stable)
                  </th>
                  <th className="py-2.5 px-3 min-w-[150px] border-r border-zinc-800 text-amber-400">
                    Variable Name
                  </th>
                  <th className="py-2.5 px-3 min-w-[200px] border-r border-zinc-800">
                    Question Label
                  </th>
                  <th className="py-2.5 px-3 min-w-[130px] border-r border-zinc-800">
                    Data Type
                  </th>
                  <th className="py-2.5 px-3 w-20 border-r border-zinc-800 text-center">
                    Req
                  </th>
                  <th className="py-2.5 px-3 w-20 border-r border-zinc-800 text-center">
                    Span
                  </th>
                  <th className="py-2.5 px-3 min-w-[150px] border-r border-zinc-800">
                    Codelist
                  </th>
                  <th className="py-2.5 px-3 min-w-[90px] border-r border-zinc-800">
                    Unit
                  </th>
                  <th className="py-2.5 px-3 min-w-[110px] border-r border-zinc-800">
                    Tier
                  </th>
                  <th className="py-2.5 px-3 min-w-[200px]">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-850">
                {filteredFields.map(({ section: _section, field }, rIdx) => {
                  const isRowFocused = focusedCell?.rowIndex === rIdx;
                  const isRowSelected = selectedFieldId === field.id;

                  return (
                    <tr
                      key={field.id}
                      onClick={() => {
                        setFocusedCell({ rowIndex: rIdx, colIndex: 1 });
                        onSelectField(field.id);
                      }}
                      className={`transition-colors ${
                        isRowSelected
                          ? "bg-amber-500/10"
                          : isRowFocused
                            ? "bg-zinc-850/70"
                            : "hover:bg-zinc-900/50"
                      }`}
                    >
                      {/* Row Index */}
                      <td className="py-2 px-3 text-center text-zinc-500 font-mono text-[10px] border-r border-zinc-850">
                        {rIdx + 1}
                      </td>

                      {/* Stable Identity Field ID (Immutable) */}
                      <td
                        className={`py-1.5 px-3 font-mono text-[11px] text-zinc-400 border-r border-zinc-850 ${
                          focusedCell?.rowIndex === rIdx &&
                          focusedCell?.colIndex === 0
                            ? "ring-2 ring-amber-500/80 bg-amber-500/10"
                            : ""
                        }`}
                      >
                        <span className="px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300">
                          {field.id}
                        </span>
                      </td>

                      {/* Variable Name (Editable, triggers Sentinel) */}
                      <td
                        className={`py-1.5 px-3 font-mono font-semibold border-r border-zinc-850 text-amber-300 ${
                          focusedCell?.rowIndex === rIdx &&
                          focusedCell?.colIndex === 1
                            ? "ring-2 ring-amber-500/80 bg-amber-500/10"
                            : ""
                        }`}
                      >
                        {editingCell?.rowIndex === rIdx &&
                        editingCell?.colIndex === 1 ? (
                          <input
                            type="text"
                            autoFocus
                            defaultValue={field.variableName}
                            onBlur={(e) => {
                              handleCellChange(
                                field,
                                "variableName",
                                e.target.value
                              );
                              setEditingCell(null);
                            }}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                handleCellChange(
                                  field,
                                  "variableName",
                                  (e.target as HTMLInputElement).value
                                );
                                setEditingCell(null);
                              }
                            }}
                            className="w-full bg-zinc-950 border border-amber-500 px-1.5 py-0.5 rounded text-amber-300 font-mono text-xs focus:outline-none"
                          />
                        ) : (
                          <span
                            onDoubleClick={() =>
                              setEditingCell({ rowIndex: rIdx, colIndex: 1 })
                            }
                            className="cursor-pointer hover:underline"
                          >
                            {field.variableName}
                          </span>
                        )}
                      </td>

                      {/* Question Label */}
                      <td
                        className={`py-1.5 px-3 border-r border-zinc-850 text-zinc-200 ${
                          focusedCell?.rowIndex === rIdx &&
                          focusedCell?.colIndex === 2
                            ? "ring-2 ring-amber-500/80 bg-amber-500/10"
                            : ""
                        }`}
                      >
                        {editingCell?.rowIndex === rIdx &&
                        editingCell?.colIndex === 2 ? (
                          <input
                            type="text"
                            autoFocus
                            defaultValue={field.label}
                            onBlur={(e) => {
                              handleCellChange(field, "label", e.target.value);
                              setEditingCell(null);
                            }}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                handleCellChange(
                                  field,
                                  "label",
                                  (e.target as HTMLInputElement).value
                                );
                                setEditingCell(null);
                              }
                            }}
                            className="w-full bg-zinc-950 border border-amber-500 px-1.5 py-0.5 rounded text-zinc-200 text-xs focus:outline-none"
                          />
                        ) : (
                          <span
                            onDoubleClick={() =>
                              setEditingCell({ rowIndex: rIdx, colIndex: 2 })
                            }
                            className="cursor-pointer hover:text-white"
                          >
                            {field.label}
                          </span>
                        )}
                      </td>

                      {/* Data Type */}
                      <td
                        className={`py-1.5 px-3 border-r border-zinc-850 font-mono text-[11px] text-sky-400 ${
                          focusedCell?.rowIndex === rIdx &&
                          focusedCell?.colIndex === 3
                            ? "ring-2 ring-amber-500/80 bg-amber-500/10"
                            : ""
                        }`}
                      >
                        <select
                          value={field.dataType}
                          onChange={(e) =>
                            handleCellChange(
                              field,
                              "dataType",
                              e.target.value as ClinicalDataType
                            )
                          }
                          className="bg-zinc-900 border border-zinc-700/80 rounded px-1.5 py-0.5 text-xs text-sky-300 focus:outline-none focus:border-amber-500"
                        >
                          {DATA_TYPES.map((dt) => (
                            <option key={dt} value={dt}>
                              {dt}
                            </option>
                          ))}
                        </select>
                      </td>

                      {/* Required Checkbox */}
                      <td
                        className={`py-1.5 px-3 border-r border-zinc-850 text-center ${
                          focusedCell?.rowIndex === rIdx &&
                          focusedCell?.colIndex === 4
                            ? "ring-2 ring-amber-500/80 bg-amber-500/10"
                            : ""
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={field.required}
                          onChange={(e) =>
                            handleCellChange(
                              field,
                              "required",
                              e.target.checked
                            )
                          }
                          className="rounded border-zinc-700 bg-zinc-900 text-amber-500 focus:ring-amber-500/50"
                        />
                      </td>

                      {/* Column Span */}
                      <td
                        className={`py-1.5 px-3 border-r border-zinc-850 text-center font-mono ${
                          focusedCell?.rowIndex === rIdx &&
                          focusedCell?.colIndex === 5
                            ? "ring-2 ring-amber-500/80 bg-amber-500/10"
                            : ""
                        }`}
                      >
                        <select
                          value={field.columnSpan}
                          onChange={(e) =>
                            handleCellChange(
                              field,
                              "columnSpan",
                              parseInt(e.target.value, 10)
                            )
                          }
                          className="bg-zinc-900 border border-zinc-700/80 rounded px-1.5 py-0.5 text-xs text-zinc-200 focus:outline-none"
                        >
                          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((s) => (
                            <option key={s} value={s}>
                              {s} col
                            </option>
                          ))}
                        </select>
                      </td>

                      {/* Codelist Selection */}
                      <td
                        className={`py-1.5 px-3 border-r border-zinc-850 ${
                          focusedCell?.rowIndex === rIdx &&
                          focusedCell?.colIndex === 6
                            ? "ring-2 ring-amber-500/80 bg-amber-500/10"
                            : ""
                        }`}
                      >
                        <select
                          value={field.codelistId || ""}
                          onChange={(e) =>
                            handleCellChange(
                              field,
                              "codelistId",
                              e.target.value || undefined
                            )
                          }
                          className="bg-zinc-900 border border-zinc-700/80 rounded px-1.5 py-0.5 text-xs text-purple-300 focus:outline-none w-full"
                        >
                          <option value="">-- None --</option>
                          {codelists.map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.name} ({c.options.length} opts)
                            </option>
                          ))}
                        </select>
                      </td>

                      {/* Unit */}
                      <td
                        className={`py-1.5 px-3 border-r border-zinc-850 text-zinc-300 font-mono ${
                          focusedCell?.rowIndex === rIdx &&
                          focusedCell?.colIndex === 7
                            ? "ring-2 ring-amber-500/80 bg-amber-500/10"
                            : ""
                        }`}
                      >
                        {editingCell?.rowIndex === rIdx &&
                        editingCell?.colIndex === 7 ? (
                          <input
                            type="text"
                            autoFocus
                            defaultValue={field.unit || ""}
                            onBlur={(e) => {
                              handleCellChange(field, "unit", e.target.value);
                              setEditingCell(null);
                            }}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                handleCellChange(
                                  field,
                                  "unit",
                                  (e.target as HTMLInputElement).value
                                );
                                setEditingCell(null);
                              }
                            }}
                            className="w-full bg-zinc-950 border border-amber-500 px-1.5 py-0.5 rounded text-zinc-200 text-xs focus:outline-none"
                          />
                        ) : (
                          <span
                            onDoubleClick={() =>
                              setEditingCell({ rowIndex: rIdx, colIndex: 7 })
                            }
                            className="cursor-pointer hover:text-white"
                          >
                            {field.unit || "-"}
                          </span>
                        )}
                      </td>

                      {/* Requirement Tier */}
                      <td
                        className={`py-1.5 px-3 border-r border-zinc-850 ${
                          focusedCell?.rowIndex === rIdx &&
                          focusedCell?.colIndex === 8
                            ? "ring-2 ring-amber-500/80 bg-amber-500/10"
                            : ""
                        }`}
                      >
                        <select
                          value={field.requirementTier || "optional"}
                          onChange={(e) =>
                            handleCellChange(
                              field,
                              "requirementTier",
                              e.target.value
                            )
                          }
                          className="bg-zinc-900 border border-zinc-700/80 rounded px-1.5 py-0.5 text-xs text-zinc-300 focus:outline-none"
                        >
                          {REQUIREMENT_TIERS.map((t) => (
                            <option key={t.value} value={t.value}>
                              {t.label}
                            </option>
                          ))}
                        </select>
                      </td>

                      {/* Description / Hint */}
                      <td
                        className={`py-1.5 px-3 text-zinc-400 ${
                          focusedCell?.rowIndex === rIdx &&
                          focusedCell?.colIndex === 9
                            ? "ring-2 ring-amber-500/80 bg-amber-500/10"
                            : ""
                        }`}
                      >
                        {editingCell?.rowIndex === rIdx &&
                        editingCell?.colIndex === 9 ? (
                          <input
                            type="text"
                            autoFocus
                            defaultValue={field.description || ""}
                            onBlur={(e) => {
                              handleCellChange(
                                field,
                                "description",
                                e.target.value
                              );
                              setEditingCell(null);
                            }}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                handleCellChange(
                                  field,
                                  "description",
                                  (e.target as HTMLInputElement).value
                                );
                                setEditingCell(null);
                              }
                            }}
                            className="w-full bg-zinc-950 border border-amber-500 px-1.5 py-0.5 rounded text-zinc-200 text-xs focus:outline-none"
                          />
                        ) : (
                          <span
                            onDoubleClick={() =>
                              setEditingCell({ rowIndex: rIdx, colIndex: 9 })
                            }
                            className="cursor-pointer hover:text-zinc-200 truncate block max-w-xs"
                          >
                            {field.description || "-"}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Paste & Batch Update Modal */}
      {isPasteModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-950">
              <div className="flex items-center gap-2.5">
                <IconClipboard className="w-5 h-5 text-amber-400" />
                <div>
                  <h3 className="text-sm font-semibold text-zinc-100">
                    Paste / Batch Metadata Update
                  </h3>
                  <p className="text-[11px] text-zinc-400">
                    Paste tab-separated (TSV) columns from Excel / Sheets.
                    Validated before atomic batch commit.
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsPasteModalOpen(false);
                  setPasteRawText("");
                  setPastePreview(null);
                }}
                className="p-1 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white"
              >
                <IconX className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 flex-1 overflow-y-auto space-y-4">
              {pasteErrorBanner && (
                <div className="p-3 bg-red-950/80 border border-red-800 rounded-xl text-red-200 text-xs flex items-start gap-2">
                  <IconAlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <span>{pasteErrorBanner}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                  Paste TSV Data (Columns: VariableName \t Label \t DataType \t
                  Required \t Span \t Codelist \t Unit \t RequirementTier \t
                  Description)
                </label>
                <textarea
                  rows={6}
                  value={pasteRawText}
                  onChange={(e) => {
                    setPasteRawText(e.target.value);
                    setPastePreview(null);
                    setPasteErrorBanner(null);
                  }}
                  placeholder={`DM_AGE\tAge in Years\tnumber\ttrue\t6\t\tyears\thard_stop\tSubject age\nSYSBP\tSystolic Blood Pressure\tnumber\ttrue\t6\t\tmmHg\thard_stop\tSystolic BP`}
                  className="w-full p-3 bg-zinc-950 border border-zinc-800 rounded-xl text-xs font-mono text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleProcessPasteText}
                  className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-100 rounded-xl text-xs font-medium border border-zinc-700 transition-colors flex items-center gap-1.5"
                >
                  <IconSparkles className="w-4 h-4 text-amber-400" />
                  <span>Validate & Preview Batch</span>
                </button>
              </div>

              {/* Paste Preview Table */}
              {pastePreview && (
                <div className="space-y-3 pt-2 border-t border-zinc-800">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-semibold text-zinc-200 uppercase tracking-wider font-mono">
                      Batch Preview ({pastePreview.length} fields)
                    </h4>
                    {pastePreview.some((p) => p.errors.length > 0) ? (
                      <span className="text-[11px] font-mono text-red-400 bg-red-950/60 border border-red-800 px-2.5 py-0.5 rounded-md flex items-center gap-1">
                        <IconAlertTriangle className="w-3.5 h-3.5" />
                        Invalid batch payload (Fix errors to commit)
                      </span>
                    ) : (
                      <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800 px-2.5 py-0.5 rounded-md flex items-center gap-1">
                        <IconCheck className="w-3.5 h-3.5" />
                        All fields valid (Ready for atomic commit)
                      </span>
                    )}
                  </div>

                  <div className="border border-zinc-800 rounded-xl overflow-hidden max-h-60 overflow-y-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-zinc-950 border-b border-zinc-800 text-[10px] font-mono text-zinc-400 uppercase">
                          <th className="py-2 px-3 w-10">#</th>
                          <th className="py-2 px-3">Variable Name</th>
                          <th className="py-2 px-3">Label</th>
                          <th className="py-2 px-3">Data Type</th>
                          <th className="py-2 px-3">Req</th>
                          <th className="py-2 px-3">Span</th>
                          <th className="py-2 px-3">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-850">
                        {pastePreview.map((item) => {
                          const isError = item.errors.length > 0;
                          return (
                            <tr
                              key={item.fieldId}
                              className={
                                isError ? "bg-red-950/20" : "bg-zinc-900/30"
                              }
                            >
                              <td className="py-2 px-3 font-mono text-[10px] text-zinc-500">
                                {item.rowNumber}
                              </td>
                              <td className="py-2 px-3 font-mono font-medium text-amber-300">
                                {item.proposed.variableName}
                              </td>
                              <td className="py-2 px-3 text-zinc-200">
                                {item.proposed.label}
                              </td>
                              <td className="py-2 px-3 font-mono text-sky-400">
                                {item.proposed.dataType}
                              </td>
                              <td className="py-2 px-3 text-center">
                                {item.proposed.required ? "Yes" : "No"}
                              </td>
                              <td className="py-2 px-3 text-center font-mono">
                                {item.proposed.columnSpan}
                              </td>
                              <td className="py-2 px-3">
                                {isError ? (
                                  <div className="text-[11px] text-red-400 flex items-center gap-1">
                                    <IconAlertTriangle className="w-3.5 h-3.5 shrink-0" />
                                    <span>{item.errors[0].message}</span>
                                  </div>
                                ) : (
                                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
                                    Valid
                                  </span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3.5 bg-zinc-950 border-t border-zinc-800 flex items-center justify-between">
              <div className="text-[11px] text-zinc-400 flex items-center gap-1">
                <IconInfoCircle className="w-4 h-4 text-zinc-500" />
                <span>Atomically updates study protocol with 1 undo unit.</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsPasteModalOpen(false);
                    setPasteRawText("");
                    setPastePreview(null);
                  }}
                  className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl text-xs font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={
                    !pastePreview ||
                    pastePreview.length === 0 ||
                    pastePreview.some((p) => p.errors.length > 0)
                  }
                  onClick={handleCommitBatchPaste}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 disabled:hover:bg-amber-500 text-zinc-950 rounded-xl text-xs font-semibold transition-colors shadow-sm"
                >
                  Commit Batch Update
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
