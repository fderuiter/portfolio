"use client";

import React, { useState } from "react";
import { CRFForm, CRFField, CodelistDefinition, EditCheckRule } from "@/lib/crf/types";
import { FieldPropertiesTab } from "./FieldPropertiesTab";
import { LogicRulesTab } from "./LogicRulesTab";
import { CdiscMetadataTab } from "./CdiscMetadataTab";
import { BufferedInput } from "./BufferedInput";
import {
  IconAdjustments,
  IconMathFunction,
  IconDatabase,
  IconX,
  IconFileSpreadsheet,
} from "@tabler/icons-react";

interface InspectorPanelProps {
  form: CRFForm;
  selectedField: CRFField | null;
  codelists: CodelistDefinition[];
  onClose: () => void;
  onUpdateField: (fieldId: string, updates: Partial<CRFField>) => void;
  onUpdateFormMeta: (updates: Partial<CRFForm>) => void;
  onUpdateRules: (rules: EditCheckRule[]) => void;
  onSaveCodelist?: (codelist: CodelistDefinition) => void;
}

type InspectorTab = "properties" | "logic" | "cdash";

const InspectorPanelComponent: React.FC<InspectorPanelProps> = ({
  form,
  selectedField,
  codelists,
  onClose,
  onUpdateField,
  onUpdateFormMeta,
  onUpdateRules,
  onSaveCodelist,
}) => {
  const [activeTab, setActiveTab] = useState<InspectorTab>("properties");
  const allFields = form.sections.flatMap((s) => s.fields);

  return (
    <div className="flex flex-col h-full bg-zinc-950/90 border-l border-zinc-800/80">
      {/* Top Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800/80 bg-zinc-900/60">
        <div className="flex items-center gap-2 min-w-0">
          <span className="p-1 rounded bg-brand-cyan/10 border border-brand-cyan/30 text-brand-cyan">
            {selectedField ? <IconAdjustments className="w-4 h-4" /> : <IconFileSpreadsheet className="w-4 h-4" />}
          </span>
          <div className="min-w-0">
            <h3 className="text-xs font-bold text-white font-mono truncate">
              {selectedField ? selectedField.variableName : form.name}
            </h3>
            <p className="text-[10px] text-zinc-400 font-mono">
              {selectedField ? "Field Property Inspector" : "Form-Level Settings"}
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1 text-zinc-500 hover:text-white rounded hover:bg-zinc-800 transition-colors"
          title="Deselect"
        >
          <IconX className="w-4 h-4" />
        </button>
      </div>

      {/* Tabs Switcher */}
      <div className="flex border-b border-zinc-800 bg-zinc-950/60">
        <button
          onClick={() => setActiveTab("properties")}
          className={`flex-1 py-2 text-center text-xs font-mono transition-colors border-b-2 flex items-center justify-center gap-1.5 ${
            activeTab === "properties"
              ? "border-brand-cyan text-brand-cyan font-bold bg-zinc-900/40"
              : "border-transparent text-zinc-400 hover:text-zinc-200"
          }`}
        >
          <IconAdjustments className="w-3.5 h-3.5" />
          <span>Properties</span>
        </button>

        <button
          onClick={() => setActiveTab("logic")}
          className={`flex-1 py-2 text-center text-xs font-mono transition-colors border-b-2 flex items-center justify-center gap-1.5 ${
            activeTab === "logic"
              ? "border-brand-cyan text-brand-cyan font-bold bg-zinc-900/40"
              : "border-transparent text-zinc-400 hover:text-zinc-200"
          }`}
        >
          <IconMathFunction className="w-3.5 h-3.5" />
          <span>Edit Checks</span>
        </button>

        <button
          onClick={() => setActiveTab("cdash")}
          className={`flex-1 py-2 text-center text-xs font-mono transition-colors border-b-2 flex items-center justify-center gap-1.5 ${
            activeTab === "cdash"
              ? "border-brand-cyan text-brand-cyan font-bold bg-zinc-900/40"
              : "border-transparent text-zinc-400 hover:text-zinc-200"
          }`}
        >
          <IconDatabase className="w-3.5 h-3.5" />
          <span>CDASH / aCRF</span>
        </button>
      </div>

      {/* Tab Body */}
      <div className="flex-1 overflow-y-auto">
        {selectedField ? (
          <>
            {activeTab === "properties" && (
              <FieldPropertiesTab
                field={selectedField}
                allFieldsInForm={allFields}
                codelists={codelists}
                onUpdateField={(updates) => onUpdateField(selectedField.id, updates)}
                onSaveToStudyCodelist={onSaveCodelist}
              />
            )}

            {activeTab === "logic" && (
              <LogicRulesTab
                form={form}
                selectedField={selectedField}
                onUpdateRules={onUpdateRules}
              />
            )}

            {activeTab === "cdash" && (
              <CdiscMetadataTab
                field={selectedField}
                form={form}
                onUpdateField={(updates) => onUpdateField(selectedField.id, updates)}
              />
            )}
          </>
        ) : (
          <div className="p-4 space-y-4">
            <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-3">
              <div className="text-xs font-bold text-white font-mono">Form-Level Configuration</div>
              <div>
                <label className="block text-[10px] font-mono text-zinc-400 mb-1">Form Name</label>
                <BufferedInput
                  type="text"
                  value={form.name}
                  onCommit={(val) => onUpdateFormMeta({ name: val })}
                  className="w-full px-2.5 py-1 bg-zinc-950 border border-zinc-800 rounded text-xs text-white"
                />
              </div>
              <div>
                <label className="block text-[10px] font-mono text-zinc-400 mb-1">CDASH Domain</label>
                <BufferedInput
                  type="text"
                  value={form.domain}
                  transform={(v) => v.toUpperCase()}
                  onCommit={(val) => onUpdateFormMeta({ domain: val })}
                  className="w-full px-2.5 py-1 bg-zinc-950 border border-zinc-800 rounded text-xs text-white font-mono uppercase"
                />
              </div>
              <div>
                <label className="flex items-center gap-2 cursor-pointer select-none pt-1">
                  <input
                    type="checkbox"
                    checked={form.isLogForm || false}
                    onChange={(e) => onUpdateFormMeta({ isLogForm: e.target.checked })}
                    className="rounded border-zinc-700 bg-zinc-900 text-brand-cyan focus:ring-0"
                  />
                  <span className="text-xs text-zinc-300">Continuous Log Form (e.g. AE / ConMeds)</span>
                </label>
              </div>
            </div>

            <LogicRulesTab
              form={form}
              selectedField={null}
              onUpdateRules={onUpdateRules}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export const InspectorPanel = React.memo(InspectorPanelComponent);
