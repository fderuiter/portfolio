"use client";

import React, { useState } from "react";
import {
  IconTrash,
  IconCopy,
  IconMathFunction,
  IconWriting,
  IconGripVertical,
  IconEdit,
  IconCheck,
  IconShieldCheck,
  IconArrowUp,
  IconArrowDown,
  IconDots,
} from "@tabler/icons-react";
import { CRFField, CodelistDefinition } from "@/lib/crf/types";

interface FieldRendererProps {
  field: CRFField;
  isSelected: boolean;
  onSelect: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  canMoveUp?: boolean;
  canMoveDown?: boolean;
  onUpdateField?: (updates: Partial<CRFField>) => void;
  onDragStart?: (e: React.DragEvent) => void;
  onDragOver?: (e: React.DragEvent) => void;
  onDrop?: (e: React.DragEvent) => void;
  codelists: CodelistDefinition[];
}

export const FieldRenderer: React.FC<FieldRendererProps> = ({
  field,
  isSelected,
  onSelect,
  onDuplicate,
  onDelete,
  onMoveUp,
  onMoveDown,
  canMoveUp,
  canMoveDown,
  onUpdateField,
  onDragStart,
  onDragOver,
  onDrop,
  codelists,
}) => {
  const [isInlineEditing, setIsInlineEditing] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [labelInput, setLabelInput] = useState(field.label);
  const [varInput, setVarInput] = useState(field.variableName);

  const codelist = codelists.find((cl) => cl.id === field.codelistId);
  const options = field.customOptions || codelist?.options;

  // Responsive Grid column span mapping (Full width on mobile xs, user span on sm+)
  const colSpanClasses: Record<number, string> = {
    1: "col-span-12 sm:col-span-1",
    2: "col-span-12 sm:col-span-2",
    3: "col-span-12 sm:col-span-3",
    4: "col-span-12 sm:col-span-4",
    5: "col-span-12 sm:col-span-5",
    6: "col-span-12 sm:col-span-6",
    7: "col-span-12 sm:col-span-7",
    8: "col-span-12 sm:col-span-8",
    9: "col-span-12 sm:col-span-9",
    10: "col-span-12 sm:col-span-10",
    11: "col-span-12 sm:col-span-11",
    12: "col-span-12 sm:col-span-12",
  };

  const spanClass = colSpanClasses[field.columnSpan] || "col-span-12 sm:col-span-6";

  const handleSaveInline = () => {
    if (onUpdateField) {
      onUpdateField({
        label: labelInput,
        variableName: varInput.toUpperCase(),
      });
    }
    setIsInlineEditing(false);
  };

  const handleAdjustSpan = (delta: number) => {
    if (!onUpdateField) return;
    const newSpan = Math.max(1, Math.min(12, field.columnSpan + delta));
    onUpdateField({ columnSpan: newSpan });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      if (!isInlineEditing) {
        e.preventDefault();
        onSelect();
      }
    }
  };

  return (
    <div
      data-field-id={field.id}
      role="button"
      tabIndex={0}
      aria-label={`Field ${field.variableName}: ${field.label}`}
      aria-pressed={isSelected}
      draggable
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onKeyDown={handleKeyDown}
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
      className={`${spanClass} group relative p-3 sm:p-4 rounded-2xl border transition-all cursor-pointer select-none outline-none focus-visible:ring-2 focus-visible:ring-brand-cyan focus-visible:border-brand-cyan ${
        isSelected
          ? "bg-zinc-900/95 border-brand-cyan shadow-[0_0_24px_rgba(6,182,212,0.18)] ring-1 ring-brand-cyan/60"
          : "bg-zinc-950/80 border-zinc-800/80 hover:border-zinc-700 hover:bg-zinc-900/50"
      }`}
    >
      {/* Field Top Meta Bar */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-1.5 min-w-0 flex-wrap">
          <div
            className="cursor-grab active:cursor-grabbing p-1 text-zinc-600 hover:text-zinc-300 hidden sm:block"
            title="Drag to reorder"
          >
            <IconGripVertical className="w-3.5 h-3.5" />
          </div>

          <span className="font-mono text-[10px] font-bold text-brand-cyan bg-brand-cyan/10 px-1.5 py-0.5 rounded border border-brand-cyan/20 truncate">
            {field.variableName}
          </span>
          <span className="font-mono text-[10px] text-zinc-500 bg-zinc-900 px-1.5 py-0.5 rounded border border-zinc-800">
            {field.dataType}
          </span>

          {/* Quick Column Span Controls (Hidden on narrow mobile screens) */}
          <div className="hidden sm:flex items-center bg-zinc-900 border border-zinc-800 rounded px-1 py-0.5 text-[9px] font-mono text-zinc-400 gap-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleAdjustSpan(-1);
              }}
              disabled={field.columnSpan <= 1}
              className="hover:text-white disabled:opacity-30 px-0.5"
              title="Shrink column span"
            >
              -
            </button>
            <span className="text-zinc-300 font-bold">{field.columnSpan}/12</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleAdjustSpan(1);
              }}
              disabled={field.columnSpan >= 12}
              className="hover:text-white disabled:opacity-30 px-0.5"
              title="Expand column span"
            >
              +
            </button>

            <div className="h-2.5 w-px bg-zinc-800 mx-0.5" />

            {[3, 6, 12].map((s) => (
              <button
                key={s}
                onClick={(e) => {
                  e.stopPropagation();
                  onUpdateField?.({ columnSpan: s });
                }}
                className={`px-1 py-0.2 rounded text-[8px] font-bold ${
                  field.columnSpan === s
                    ? "bg-brand-cyan/20 text-brand-cyan border border-brand-cyan/40"
                    : "text-zinc-500 hover:text-zinc-200"
                }`}
                title={`Set width to ${s} columns (${Math.round((s / 12) * 100)}%)`}
              >
                {s}c
              </button>
            ))}
          </div>

          {/* Quick Required Toggle */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onUpdateField?.({ required: !field.required });
            }}
            className={`px-1.5 py-0.5 rounded text-[9px] font-mono transition-colors border ${
              field.required
                ? "bg-red-500/15 text-red-400 border-red-500/30 font-bold"
                : "bg-zinc-900 text-zinc-600 border-zinc-800 hover:text-zinc-400"
            }`}
            title={field.required ? "Required question (click to make optional)" : "Optional question (click to make required)"}
          >
            {field.required ? "* Req" : "Opt"}
          </button>

          {field.sdvVerified && (
            <span className="inline-flex items-center gap-0.5 font-mono text-[9px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
              <IconShieldCheck className="w-3 h-3" />
              <span>SDV</span>
            </span>
          )}
        </div>

        {/* Action icons (Desktop hover + Mobile touch menu) */}
        <div className="flex items-center gap-1">
          {/* Touch Move Up/Down Controls for touch devices & smaller screens */}
          {onMoveUp && canMoveUp && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onMoveUp();
              }}
              className="p-1 rounded bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white sm:hidden"
              title="Move Up"
              aria-label="Move Field Up"
            >
              <IconArrowUp className="w-3.5 h-3.5" />
            </button>
          )}

          {onMoveDown && canMoveDown && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onMoveDown();
              }}
              className="p-1 rounded bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white sm:hidden"
              title="Move Down"
              aria-label="Move Field Down"
            >
              <IconArrowDown className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Desktop Hover Actions */}
          <div
            className={`hidden sm:flex items-center gap-1 transition-opacity ${
              isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-100"
            }`}
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (isInlineEditing) {
                  handleSaveInline();
                } else {
                  setLabelInput(field.label);
                  setVarInput(field.variableName);
                  setIsInlineEditing(true);
                }
              }}
              className="p-1 rounded hover:bg-zinc-800 text-zinc-400 hover:text-brand-cyan transition-colors"
              title={isInlineEditing ? "Save Inline Edit" : "Quick Edit"}
            >
              {isInlineEditing ? <IconCheck className="w-3.5 h-3.5 text-emerald-400" /> : <IconEdit className="w-3.5 h-3.5" />}
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDuplicate();
              }}
              className="p-1 rounded hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
              title="Duplicate Field"
            >
              <IconCopy className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="p-1 rounded hover:bg-red-500/20 text-zinc-400 hover:text-red-400 transition-colors"
              title="Delete Field"
            >
              <IconTrash className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Mobile Touch 3-Dot Kebab Menu */}
          <div className="relative sm:hidden">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsMobileMenuOpen((prev) => !prev);
              }}
              className="p-1 rounded bg-zinc-900 text-zinc-400 hover:text-white"
              title="Field Actions"
              aria-label="Field Actions"
            >
              <IconDots className="w-3.5 h-3.5" />
            </button>

            {isMobileMenuOpen && (
              <>
                <div
                  className="fixed inset-0 z-30"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsMobileMenuOpen(false);
                  }}
                />
                <div className="absolute right-0 top-full mt-1 w-36 bg-zinc-900 border border-zinc-800 rounded-xl shadow-xl p-1 z-40 space-y-0.5">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsMobileMenuOpen(false);
                      setLabelInput(field.label);
                      setVarInput(field.variableName);
                      setIsInlineEditing(true);
                    }}
                    className="w-full flex items-center gap-2 px-2 py-1.5 text-xs text-zinc-300 hover:text-white hover:bg-zinc-800 rounded-lg"
                  >
                    <IconEdit className="w-3.5 h-3.5 text-brand-cyan" />
                    <span>Quick Edit</span>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsMobileMenuOpen(false);
                      onDuplicate();
                    }}
                    className="w-full flex items-center gap-2 px-2 py-1.5 text-xs text-zinc-300 hover:text-white hover:bg-zinc-800 rounded-lg"
                  >
                    <IconCopy className="w-3.5 h-3.5 text-zinc-400" />
                    <span>Duplicate</span>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsMobileMenuOpen(false);
                      onDelete();
                    }}
                    className="w-full flex items-center gap-2 px-2 py-1.5 text-xs text-red-400 hover:bg-red-500/20 rounded-lg"
                  >
                    <IconTrash className="w-3.5 h-3.5 text-red-400" />
                    <span>Delete</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Field Label & Inline Edit Mode */}
      {isInlineEditing ? (
        <div
          className="mb-2 space-y-1.5 p-2 bg-zinc-900 border border-brand-cyan/40 rounded-xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div>
            <label className="block text-[9px] font-mono text-zinc-400">Prompt / Label</label>
            <input
              type="text"
              value={labelInput}
              onChange={(e) => setLabelInput(e.target.value)}
              className="w-full px-2 py-1 text-xs bg-zinc-950 border border-zinc-700 rounded text-white font-sans"
            />
          </div>
          <div>
            <label className="block text-[9px] font-mono text-zinc-400">SDTM Variable (Max 8 chars)</label>
            <input
              type="text"
              maxLength={8}
              value={varInput}
              onChange={(e) => setVarInput(e.target.value)}
              className="w-full px-2 py-1 text-xs bg-zinc-950 border border-zinc-700 rounded text-brand-cyan font-mono uppercase"
            />
          </div>
          <div className="flex justify-end gap-1.5 pt-1">
            <button
              onClick={() => setIsInlineEditing(false)}
              className="px-2 py-0.5 text-[10px] font-mono bg-zinc-800 text-zinc-300 rounded"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveInline}
              className="px-2 py-0.5 text-[10px] font-mono font-bold bg-brand-cyan text-black rounded"
            >
              Save
            </button>
          </div>
        </div>
      ) : (
        <div className="mb-2">
          <label className="block text-xs font-semibold text-zinc-100 leading-snug">
            {field.label}
            {field.required && <span className="text-red-400 ml-0.5">*</span>}
          </label>
          {field.description && (
            <p className="text-[11px] text-zinc-400 mt-0.5 font-sans leading-normal">
              {field.description}
            </p>
          )}
        </div>
      )}

      {/* Interactive Mock Input Preview */}
      <div className="pointer-events-none opacity-85">
        {field.dataType === "text" && (
          <input
            type="text"
            readOnly
            placeholder={field.placeholder || "Enter text..."}
            className="w-full px-2.5 py-1.5 text-xs bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-400"
          />
        )}

        {field.dataType === "textarea" && (
          <textarea
            readOnly
            rows={2}
            placeholder={field.placeholder || "Enter narrative..."}
            className="w-full px-2.5 py-1.5 text-xs bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-400 resize-none"
          />
        )}

        {(field.dataType === "number" || field.dataType === "integer") && (
          <div className="relative">
            <input
              type="text"
              readOnly
              placeholder={field.placeholder || "0.0"}
              className="w-full px-2.5 py-1.5 text-xs bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-400"
            />
            {field.unit && (
              <span className="absolute right-2.5 top-1.5 text-[11px] font-mono text-zinc-500">
                {field.unit}
              </span>
            )}
          </div>
        )}

        {(field.dataType === "date" || field.dataType === "partial_date" || field.dataType === "datetime" || field.dataType === "time") && (
          <input
            type="text"
            readOnly
            placeholder={field.placeholder || (field.dataType === "partial_date" ? "YYYY-MM-DD (or YYYY)" : "YYYY-MM-DD")}
            className="w-full px-2.5 py-1.5 text-xs bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-400 font-mono"
          />
        )}

        {(field.dataType === "radio" || field.dataType === "multi_select") && (
          <div className="space-y-1.5 pt-0.5">
            {(options || [{ code: "Y", label: "Yes", order: 1 }, { code: "N", label: "No", order: 2 }]).map((opt) => (
              <div key={opt.code} className="flex items-center gap-2 text-xs text-zinc-300">
                <div
                  className={`w-3.5 h-3.5 border border-zinc-700 bg-zinc-900 flex items-center justify-center ${
                    field.dataType === "radio" ? "rounded-full" : "rounded"
                  }`}
                />
                <span>{opt.label}</span>
              </div>
            ))}
          </div>
        )}

        {field.dataType === "single_select" && (
          <div className="w-full px-2.5 py-1.5 text-xs bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-400 flex items-center justify-between">
            <span>{options && options.length > 0 ? `-- Select from ${options.length} options --` : "-- Select --"}</span>
            <span className="text-[10px] text-zinc-600">▼</span>
          </div>
        )}

        {field.dataType === "checkbox" && (
          <div className="flex items-center gap-2 text-xs text-zinc-300 pt-0.5">
            <div className="w-3.5 h-3.5 rounded border border-zinc-700 bg-zinc-900" />
            <span>Confirm / Check</span>
          </div>
        )}

        {field.dataType === "calculated" && (
          <div className="p-2 rounded-lg bg-brand-cyan/5 border border-brand-cyan/20 flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-brand-cyan font-mono text-[11px]">
              <IconMathFunction className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">{field.calculationFormula || "f(x)"}</span>
            </div>
            {field.unit && <span className="text-[10px] font-mono text-zinc-400 ml-1">{field.unit}</span>}
          </div>
        )}

        {field.dataType === "vas_scale" && (
          <div className="space-y-1.5 pt-1">
            <div className="w-full h-2 bg-zinc-800 rounded-full relative overflow-hidden">
              <div className="w-1/3 h-full bg-gradient-to-r from-emerald-500 to-amber-500" />
            </div>
            <div className="flex justify-between text-[10px] text-zinc-400 font-mono">
              <span>{field.scaleMinLabel || "0 mm"}</span>
              <span>{field.scaleMaxLabel || "100 mm"}</span>
            </div>
          </div>
        )}

        {field.dataType === "signature" && (
          <div className="p-2.5 rounded-lg border border-dashed border-zinc-700 bg-zinc-900/60 flex items-center justify-between text-zinc-400 text-xs">
            <div className="flex items-center gap-2 font-mono text-[11px]">
              <IconWriting className="w-4 h-4 text-rose-400" />
              <span>21 CFR Part 11 Electronic Signature Stamp</span>
            </div>
            <span className="text-[10px] font-mono bg-zinc-800 px-2 py-0.5 rounded text-zinc-300">
              Pending
            </span>
          </div>
        )}
      </div>

      {/* CDASH SDTM Annotation Tag */}
      {field.cdashMetadata && (
        <div className="mt-2.5 pt-2 border-t border-zinc-850 flex items-center justify-between text-[10px] font-mono text-zinc-500">
          <span>SDTM: {field.cdashMetadata.acrfAnnotation}</span>
          <span className="text-zinc-600">Core: {field.cdashMetadata.core}</span>
        </div>
      )}
    </div>
  );
};
