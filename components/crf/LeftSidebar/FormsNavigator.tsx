"use client";

import React from "react";
import {
  IconFileSpreadsheet,
  IconPlus,
  IconTrash,
  IconCopy,
  IconSparkles,
} from "@tabler/icons-react";
import { CRFForm } from "@/lib/crf/types";

interface FormsNavigatorProps {
  forms: CRFForm[];
  activeFormId: string;
  onSelectForm: (formId: string) => void;
  onAddForm: () => void;
  onDuplicateForm: (formId: string) => void;
  onDeleteForm: (formId: string) => void;
  onOpenCdashScaffolder: () => void;
}

export const FormsNavigator: React.FC<FormsNavigatorProps> = ({
  forms,
  activeFormId,
  onSelectForm,
  onAddForm,
  onDuplicateForm,
  onDeleteForm,
  onOpenCdashScaffolder,
}) => {
  return (
    <div className="space-y-3 flex flex-col h-full">
      <div className="flex items-center justify-between px-1">
        <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 font-semibold">
          Protocol Forms ({forms.length})
        </span>
        <button
          onClick={onAddForm}
          className="inline-flex items-center gap-1 px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-mono transition-colors"
          title="Add New Blank Form"
        >
          <IconPlus className="w-3.5 h-3.5" />
          <span>New</span>
        </button>
      </div>

      {/* 1-Click CDASH Scaffolder CTA */}
      <button
        onClick={onOpenCdashScaffolder}
        className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-brand-cyan/10 hover:bg-brand-cyan/20 border border-brand-cyan/30 text-brand-cyan text-xs font-mono font-bold transition-colors transition-shadow shadow-sm group"
      >
        <IconSparkles className="w-4 h-4 group-hover:scale-110 transition-transform" />
        <span>+ CDASH Standard Form</span>
      </button>

      {/* Forms List */}
      <div className="space-y-1.5 overflow-y-auto flex-1 pr-0.5">
        {forms.map((form) => {
          const isActive = form.id === activeFormId;
          const fieldCount = form.sections.reduce((acc, s) => acc + s.fields.length, 0);

          return (
            <div
              key={form.id}
              onClick={() => onSelectForm(form.id)}
              className={`group relative p-2.5 rounded-xl border cursor-pointer transition-colors ${
                isActive
                  ? "bg-brand-cyan/10 border-brand-cyan/40 shadow-sm"
                  : "bg-zinc-950/60 border-zinc-850 hover:border-zinc-700 hover:bg-zinc-900/60"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className={`p-1.5 rounded-lg border shrink-0 ${
                      isActive
                        ? "bg-brand-cyan text-black border-brand-cyan"
                        : "bg-zinc-900 text-zinc-400 border-zinc-800"
                    }`}
                  >
                    <IconFileSpreadsheet className="w-4 h-4" />
                  </span>
                  <div className="min-w-0">
                    <div
                      className={`text-xs font-bold font-sans truncate ${
                        isActive ? "text-white" : "text-zinc-300"
                      }`}
                    >
                      {form.name}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] font-mono font-semibold px-1.5 py-0.2 rounded bg-zinc-850 text-zinc-400 border border-zinc-750">
                        {form.domain || "CRF"}
                      </span>
                      <span className="text-[10px] text-zinc-500 font-mono">
                        {fieldCount} {fieldCount === 1 ? "field" : "fields"}
                      </span>
                      {form.isLogForm && (
                        <span className="text-[9px] font-mono text-purple-400 bg-purple-500/10 px-1 rounded border border-purple-500/20">
                          LOG
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Quick actions on hover */}
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDuplicateForm(form.id);
                    }}
                    className="p-1 rounded hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
                    title="Duplicate Form"
                  >
                    <IconCopy className="w-3.5 h-3.5" />
                  </button>
                  {forms.length > 1 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteForm(form.id);
                      }}
                      className="p-1 rounded hover:bg-red-500/20 text-zinc-400 hover:text-red-400 transition-colors"
                      title="Delete Form"
                    >
                      <IconTrash className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
