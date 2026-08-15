"use client";

import React from "react";
import { CRFField, CodelistDefinition, ClinicalDataType } from "@/lib/crf/types";
import { IconMathFunction, IconInfoCircle } from "@tabler/icons-react";

interface FieldPropertiesTabProps {
  field: CRFField;
  allFieldsInForm: CRFField[];
  codelists: CodelistDefinition[];
  onUpdateField: (updates: Partial<CRFField>) => void;
}

const DATA_TYPES: { type: ClinicalDataType; label: string }[] = [
  { type: "text", label: "Single-Line Text" },
  { type: "textarea", label: "Multiline Textarea" },
  { type: "number", label: "Decimal Number (Float)" },
  { type: "integer", label: "Integer Count" },
  { type: "date", label: "Standard Date" },
  { type: "partial_date", label: "Partial Date (UN-UNK-YYYY)" },
  { type: "datetime", label: "Date & Time Stamp" },
  { type: "time", label: "Time" },
  { type: "radio", label: "Radio Button Group" },
  { type: "single_select", label: "Dropdown Select (Codelist)" },
  { type: "checkbox", label: "Single Checkbox" },
  { type: "calculated", label: "Calculated Field (AST Formula)" },
  { type: "vas_scale", label: "Visual Analog Scale (VAS 0-100mm)" },
  { type: "signature", label: "21 CFR Part 11 Electronic Signature" },
];

export const FieldPropertiesTab: React.FC<FieldPropertiesTabProps> = ({
  field,
  allFieldsInForm,
  codelists,
  onUpdateField,
}) => {
  return (
    <div className="space-y-4 p-4 text-xs font-sans">
      {/* Variable Name & Display Label */}
      <div>
        <label className="block text-[11px] font-mono text-zinc-400 mb-1">
          CDASH / SDTM Variable Name <span className="text-brand-cyan">*</span>
        </label>
        <input
          type="text"
          value={field.variableName}
          onChange={(e) => onUpdateField({ variableName: e.target.value.toUpperCase() })}
          className="w-full px-2.5 py-1.5 bg-zinc-950 border border-zinc-800 rounded-lg text-white font-mono uppercase focus:border-brand-cyan focus:outline-none"
          placeholder="e.g. BRTHYR, SYSBP, AETERM"
        />
      </div>

      <div>
        <label className="block text-[11px] font-mono text-zinc-400 mb-1">
          Question Text / Form Label <span className="text-brand-cyan">*</span>
        </label>
        <input
          type="text"
          value={field.label}
          onChange={(e) => onUpdateField({ label: e.target.value })}
          className="w-full px-2.5 py-1.5 bg-zinc-950 border border-zinc-800 rounded-lg text-white font-sans focus:border-brand-cyan focus:outline-none"
          placeholder="e.g. Systolic Blood Pressure"
        />
      </div>

      <div>
        <label className="block text-[11px] font-mono text-zinc-400 mb-1">
          Instruction / Clinical Description
        </label>
        <textarea
          rows={2}
          value={field.description || ""}
          onChange={(e) => onUpdateField({ description: e.target.value })}
          className="w-full px-2.5 py-1.5 bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-300 font-sans focus:border-brand-cyan focus:outline-none resize-none"
          placeholder="e.g. Measure after patient has been sitting for 5 minutes."
        />
      </div>

      {/* Data Type & Grid Width */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-[11px] font-mono text-zinc-400 mb-1">
            Data Type
          </label>
          <select
            value={field.dataType}
            onChange={(e) => onUpdateField({ dataType: e.target.value as ClinicalDataType })}
            className="w-full px-2.5 py-1.5 bg-zinc-950 border border-zinc-800 rounded-lg text-white font-sans focus:border-brand-cyan focus:outline-none"
          >
            {DATA_TYPES.map((dt) => (
              <option key={dt.type} value={dt.type}>
                {dt.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-mono text-zinc-400 mb-1">
            Grid Width ({field.columnSpan}/12)
          </label>
          <select
            value={field.columnSpan}
            onChange={(e) => onUpdateField({ columnSpan: parseInt(e.target.value, 10) })}
            className="w-full px-2.5 py-1.5 bg-zinc-950 border border-zinc-800 rounded-lg text-white font-mono focus:border-brand-cyan focus:outline-none"
          >
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((col) => (
              <option key={col} value={col}>
                {col} {col === 12 ? "(Full Width)" : col === 6 ? "(Half Width)" : col === 4 ? "(1/3 Width)" : "cols"}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Required & ReadOnly Toggles */}
      <div className="flex items-center gap-6 p-2.5 rounded-xl bg-zinc-950/60 border border-zinc-850">
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={field.required}
            onChange={(e) => onUpdateField({ required: e.target.checked })}
            className="rounded border-zinc-700 bg-zinc-900 text-brand-cyan focus:ring-0"
          />
          <span className="text-xs text-zinc-300 font-medium">Mandatory Field</span>
        </label>

        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={field.readOnly || false}
            onChange={(e) => onUpdateField({ readOnly: e.target.checked })}
            className="rounded border-zinc-700 bg-zinc-900 text-brand-cyan focus:ring-0"
          />
          <span className="text-xs text-zinc-300 font-medium">Read-Only</span>
        </label>
      </div>

      {/* Specific Properties for Numeric Fields */}
      {(field.dataType === "number" || field.dataType === "integer" || field.dataType === "calculated") && (
        <div className="space-y-3 pt-2 border-t border-zinc-850">
          <div className="text-[11px] font-mono text-zinc-400 font-semibold uppercase">
            Numeric Boundaries &amp; Units
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block text-[10px] font-mono text-zinc-500 mb-1">Unit</label>
              <input
                type="text"
                value={field.unit || ""}
                onChange={(e) => onUpdateField({ unit: e.target.value })}
                className="w-full px-2 py-1 bg-zinc-950 border border-zinc-800 rounded text-xs text-white font-mono"
                placeholder="mmHg, kg, °C"
              />
            </div>
            <div>
              <label className="block text-[10px] font-mono text-zinc-500 mb-1">Min Value</label>
              <input
                type="number"
                value={field.minValue !== undefined ? field.minValue : ""}
                onChange={(e) =>
                  onUpdateField({ minValue: e.target.value === "" ? undefined : parseFloat(e.target.value) })
                }
                className="w-full px-2 py-1 bg-zinc-950 border border-zinc-800 rounded text-xs text-white font-mono"
                placeholder="None"
              />
            </div>
            <div>
              <label className="block text-[10px] font-mono text-zinc-500 mb-1">Max Value</label>
              <input
                type="number"
                value={field.maxValue !== undefined ? field.maxValue : ""}
                onChange={(e) =>
                  onUpdateField({ maxValue: e.target.value === "" ? undefined : parseFloat(e.target.value) })
                }
                className="w-full px-2 py-1 bg-zinc-950 border border-zinc-800 rounded text-xs text-white font-mono"
                placeholder="None"
              />
            </div>
          </div>
        </div>
      )}

      {/* Codelist Selector for Select / Radio */}
      {(field.dataType === "single_select" || field.dataType === "radio" || field.dataType === "multi_select") && (
        <div className="space-y-2 pt-2 border-t border-zinc-850">
          <div className="text-[11px] font-mono text-zinc-400 font-semibold uppercase">
            Controlled Terminology Codelist
          </div>
          <select
            value={field.codelistId || ""}
            onChange={(e) => onUpdateField({ codelistId: e.target.value || undefined })}
            className="w-full px-2.5 py-1.5 bg-zinc-950 border border-zinc-800 rounded-lg text-white font-sans focus:border-brand-cyan focus:outline-none"
          >
            <option value="">-- Select Standard Codelist --</option>
            {codelists.map((cl) => (
              <option key={cl.id} value={cl.id}>
                {cl.name} ({cl.options.length} items)
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Dynamic AST Formula Builder for Calculated Fields */}
      {field.dataType === "calculated" && (
        <div className="space-y-2.5 pt-2 border-t border-zinc-850">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono text-brand-cyan font-semibold uppercase flex items-center gap-1">
              <IconMathFunction className="w-3.5 h-3.5" />
              AST Dynamic Formula
            </span>
          </div>

          <textarea
            rows={2}
            value={field.calculationFormula || ""}
            onChange={(e) => onUpdateField({ calculationFormula: e.target.value })}
            className="w-full px-2.5 py-1.5 bg-zinc-950 border border-brand-cyan/40 rounded-lg text-brand-cyan font-mono text-xs focus:border-brand-cyan focus:outline-none resize-none"
            placeholder="e.g. weight / ((height/100) * (height/100))"
          />

          <div className="p-2.5 rounded-lg bg-zinc-950 border border-zinc-850 space-y-1.5">
            <div className="text-[10px] font-mono text-zinc-400 flex items-center gap-1">
              <IconInfoCircle className="w-3 h-3 text-brand-cyan" />
              <span>Available Form Variables to reference:</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {allFieldsInForm
                .filter((f) => f.id !== field.id)
                .map((f) => (
                  <button
                    key={f.id}
                    onClick={() => {
                      const cur = field.calculationFormula || "";
                      onUpdateField({ calculationFormula: `${cur} ${f.variableName}`.trim() });
                    }}
                    className="px-1.5 py-0.5 rounded bg-zinc-900 hover:bg-brand-cyan/20 border border-zinc-800 text-[10px] font-mono text-zinc-300 hover:text-brand-cyan transition-colors"
                  >
                    {f.variableName}
                  </button>
                ))}
            </div>
            <div className="text-[10px] text-zinc-500 font-mono pt-1">
              Functions: <code>round(x, n)</code>, <code>sqrt(x)</code>, <code>abs(x)</code>, <code>max(a, b)</code>
            </div>
          </div>
        </div>
      )}

      {/* VAS scale labels */}
      {field.dataType === "vas_scale" && (
        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-zinc-850">
          <div>
            <label className="block text-[10px] font-mono text-zinc-500 mb-1">Min Label (0mm)</label>
            <input
              type="text"
              value={field.scaleMinLabel || ""}
              onChange={(e) => onUpdateField({ scaleMinLabel: e.target.value })}
              className="w-full px-2 py-1 bg-zinc-950 border border-zinc-800 rounded text-xs text-white"
              placeholder="e.g. No Pain"
            />
          </div>
          <div>
            <label className="block text-[10px] font-mono text-zinc-500 mb-1">Max Label (100mm)</label>
            <input
              type="text"
              value={field.scaleMaxLabel || ""}
              onChange={(e) => onUpdateField({ scaleMaxLabel: e.target.value })}
              className="w-full px-2 py-1 bg-zinc-950 border border-zinc-800 rounded text-xs text-white"
              placeholder="e.g. Worst Pain"
            />
          </div>
        </div>
      )}
    </div>
  );
};
