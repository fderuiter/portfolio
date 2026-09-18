"use client";

import React, { useMemo, useRef, useEffect, useCallback } from "react";
import {
  IconFlask2,
  IconX,
  IconSparkles,
  IconRefresh,
  IconAlertTriangle,
  IconCircleCheck,
  IconEyeOff,
  IconHelpCircle,
} from "@tabler/icons-react";
import type { CRFField, CRFForm, CodelistDefinition } from "@/lib/crf/types";
import {
  runFormTest,
  fillSampleValues,
  resetScopeValues,
  setScopedValue,
  getScopedValue,
  buildScopedKey,
  type FormTestScope,
  type ConditionalFieldValues,
} from "@/lib/crf";

interface FormTestDockProps {
  isOpen: boolean;
  form: CRFForm | null;
  values: ConditionalFieldValues;
  scope: FormTestScope;
  /** Study codelists, so coded fields are filled with real option codes. */
  codelists?: CodelistDefinition[];
  onChangeValues: (next: ConditionalFieldValues) => void;
  onClose: () => void;
}

const RESULT_TONE: Record<string, string> = {
  true: "text-emerald-400 border-emerald-500/30 bg-emerald-500/10",
  false: "text-zinc-400 border-zinc-800 bg-zinc-950",
  missing: "text-amber-400 border-amber-500/30 bg-amber-500/10",
  incompatible: "text-red-400 border-red-500/30 bg-red-500/10",
};

const RESULT_LABEL: Record<string, string> = {
  true: "Fired",
  false: "Not fired",
  missing: "Waiting on input",
  incompatible: "Cannot evaluate",
};

/**
 * In-builder test dock (#541).
 *
 * Sits beneath the designer rather than replacing it, so an author can edit a
 * form and exercise it without losing their place. It renders nothing of its
 * own logic: every result comes from `runFormTest`, which composes the same
 * calculation, rule and conditional-visibility runtimes the EDC simulator
 * uses.
 */
export const FormTestDock: React.FC<FormTestDockProps> = ({
  isOpen,
  form,
  values,
  scope,
  codelists,
  onChangeValues,
  onClose,
}) => {
  const closeRef = useRef<HTMLButtonElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);

  // Restore focus to whatever opened the dock, so keyboard users are not
  // dropped at the top of the document when it closes.
  useEffect(() => {
    if (isOpen) {
      previouslyFocused.current = document.activeElement as HTMLElement | null;
      const id = window.setTimeout(() => closeRef.current?.focus?.(), 50);
      return () => window.clearTimeout(id);
    }
    previouslyFocused.current?.focus?.();
  }, [isOpen]);

  const report = useMemo(
    () => (form ? runFormTest(form, values, scope) : null),
    [form, values, scope]
  );

  const handleFieldChange = useCallback(
    (field: CRFField, raw: string) => {
      const numeric =
        field.dataType === "number" ||
        field.dataType === "integer" ||
        field.dataType === "vas_scale" ||
        field.dataType === "nrs_scale";
      const parsed = numeric ? (raw === "" ? null : Number(raw)) : raw;
      onChangeValues(setScopedValue(values, scope, field.id, parsed));
    },
    [onChangeValues, scope, values]
  );

  if (!isOpen || !form || !report) return null;

  const fields = (form.sections || []).flatMap((section) => section.fields);

  return (
    <div
      role="region"
      aria-label="Form test dock"
      data-keyboard-boundary
      className="border-t border-zinc-800 bg-zinc-950 text-zinc-200 flex flex-col max-h-[60vh] min-h-[16rem] shadow-2xl relative z-20 motion-safe:animate-in motion-safe:slide-in-from-bottom-5 motion-safe:duration-200"
    >
      {/* Title bar */}
      <div className="flex items-center justify-between gap-2 px-3 sm:px-4 py-2 bg-zinc-900/90 border-b border-zinc-800 shrink-0 flex-wrap">
        <div className="flex items-center gap-2 min-w-0">
          <IconFlask2 className="w-4 h-4 text-brand-cyan shrink-0" />
          <span className="text-xs font-bold text-white tracking-wide truncate">
            Test {form.name}
          </span>
          <span className="text-[10px] font-mono text-zinc-500 hidden sm:inline truncate">
            {scope.subjectId} · {scope.visitId}
          </span>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={() =>
              onChangeValues(fillSampleValues(form, values, scope, codelists))
            }
            className="inline-flex items-center gap-1 px-2.5 py-1.5 min-h-[36px] rounded-lg text-[11px] font-mono bg-zinc-950 hover:bg-zinc-800 text-zinc-300 hover:text-brand-cyan border border-zinc-800 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-cyan"
          >
            <IconSparkles className="w-3 h-3" />
            <span>Fill sample</span>
          </button>
          <button
            type="button"
            onClick={() =>
              onChangeValues(resetScopeValues(form, values, scope))
            }
            className="inline-flex items-center gap-1 px-2.5 py-1.5 min-h-[36px] rounded-lg text-[11px] font-mono bg-zinc-950 hover:bg-zinc-800 text-zinc-300 hover:text-amber-400 border border-zinc-800 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-cyan"
          >
            <IconRefresh className="w-3 h-3" />
            <span>Reset</span>
          </button>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Close form test dock"
            className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-zinc-950 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-cyan"
          >
            <IconX className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Scope note: what Fill sample and Reset actually touch. */}
      <p className="px-3 sm:px-4 py-1.5 text-[10px] text-zinc-500 border-b border-zinc-900 shrink-0">
        Fill sample and Reset affect only{" "}
        <span className="font-mono text-zinc-400">{form.name}</span> for subject{" "}
        <span className="font-mono text-zinc-400">{scope.subjectId}</span> at
        visit <span className="font-mono text-zinc-400">{scope.visitId}</span>.
        Other subjects and visits are untouched.
      </p>

      {/* Status strip */}
      <div className="flex items-center gap-3 px-3 sm:px-4 py-1.5 border-b border-zinc-900 text-[10px] font-mono shrink-0 overflow-x-auto scrollbar-none">
        <span className="text-zinc-400 whitespace-nowrap">
          {report.summary.fieldsVisible} visible
        </span>
        {report.summary.fieldsHidden > 0 && (
          <span className="text-zinc-500 whitespace-nowrap inline-flex items-center gap-1">
            <IconEyeOff className="w-3 h-3" />
            {report.summary.fieldsHidden} hidden
          </span>
        )}
        <span className="text-emerald-400 whitespace-nowrap">
          {report.summary.rulesFired} rules fired
        </span>
        {report.summary.rulesUndecidable > 0 && (
          <span className="text-amber-400 whitespace-nowrap inline-flex items-center gap-1">
            <IconHelpCircle className="w-3 h-3" />
            {report.summary.rulesUndecidable} waiting on input
          </span>
        )}
        {report.summary.openQueries > 0 && (
          <span className="text-amber-300 whitespace-nowrap">
            {report.summary.openQueries} queries
          </span>
        )}
        <span
          className={
            report.summary.unsatisfiedRequired > 0
              ? "text-red-400 whitespace-nowrap"
              : "text-emerald-400 whitespace-nowrap"
          }
        >
          {report.summary.unsatisfiedRequired} required unanswered
        </span>
      </div>

      {/* Body: adapts to available width rather than forcing a split frame. */}
      <div className="flex-1 overflow-y-auto grid grid-cols-1 lg:grid-cols-2 gap-4 p-3 sm:p-4 min-h-0">
        {/* Inputs */}
        <section aria-label="Synthetic inputs" className="min-w-0 space-y-2">
          <h3 className="text-[10px] font-mono uppercase tracking-wide text-zinc-500">
            Inputs
          </h3>
          {fields.map((field) => {
            const state = report.conditional.fields[field.id];
            if (state && !state.visible) return null;
            if (field.dataType === "calculated") return null;

            const inputId = `test-dock-${field.id}`;
            const raw = getScopedValue(values, scope, field.id);

            return (
              <div key={field.id} className="min-w-0">
                <label
                  htmlFor={inputId}
                  className="block text-[11px] text-zinc-300 mb-1 break-words"
                >
                  {field.label}
                  {state?.required && (
                    <span className="text-red-400 ml-0.5">*</span>
                  )}
                  <span className="ml-1.5 text-[10px] font-mono text-zinc-600">
                    {field.variableName}
                  </span>
                </label>
                <input
                  id={inputId}
                  data-testid={buildScopedKey(scope, field.id)}
                  type={
                    field.dataType === "number" ||
                    field.dataType === "integer" ||
                    field.dataType === "vas_scale" ||
                    field.dataType === "nrs_scale"
                      ? "number"
                      : "text"
                  }
                  value={raw === null || raw === undefined ? "" : String(raw)}
                  onChange={(e) => handleFieldChange(field, e.target.value)}
                  className="w-full px-2.5 py-1.5 min-h-[36px] text-xs bg-zinc-900 border border-zinc-700 rounded-lg text-white focus:border-brand-cyan focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-cyan"
                />
              </div>
            );
          })}
        </section>

        {/* Explained results */}
        <section aria-label="Explained results" className="min-w-0 space-y-3">
          <div>
            <h3 className="text-[10px] font-mono uppercase tracking-wide text-zinc-500 mb-1.5">
              Calculations
            </h3>
            {report.calculations.length === 0 ? (
              <p className="text-[11px] text-zinc-600">
                This form has no calculated fields.
              </p>
            ) : (
              <ul className="space-y-1.5">
                {report.calculations.map((calc) => (
                  <li
                    key={calc.fieldId}
                    className="rounded-lg border border-zinc-800 bg-zinc-950 p-2 min-w-0"
                  >
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <span className="text-[11px] text-zinc-300 break-words min-w-0">
                        {calc.label}
                      </span>
                      <span
                        className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${
                          calc.derivation.status === "success"
                            ? "text-emerald-400 border-emerald-500/30 bg-emerald-500/10"
                            : calc.derivation.status === "missing_inputs"
                              ? "text-amber-400 border-amber-500/30 bg-amber-500/10"
                              : "text-red-400 border-red-500/30 bg-red-500/10"
                        }`}
                      >
                        {calc.derivation.status === "success"
                          ? (calc.derivation.formattedResult ??
                            String(calc.derivation.result))
                          : calc.derivation.status.replace(/_/g, " ")}
                      </span>
                    </div>
                    <p className="text-[10px] font-mono text-zinc-500 mt-1 break-words">
                      {calc.derivation.formula}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div>
            <h3 className="text-[10px] font-mono uppercase tracking-wide text-zinc-500 mb-1.5">
              Rules
            </h3>
            {report.rules.length === 0 ? (
              <p className="text-[11px] text-zinc-600">
                This form has no rules yet.
              </p>
            ) : (
              <ul className="space-y-1.5">
                {report.rules.map((rule) => (
                  <li
                    key={rule.ruleId}
                    className={`rounded-lg border p-2 min-w-0 ${RESULT_TONE[rule.result]}`}
                  >
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <span className="text-[11px] break-words min-w-0">
                        {rule.ruleName}
                      </span>
                      <span className="text-[10px] font-mono shrink-0">
                        {RESULT_LABEL[rule.result]}
                      </span>
                    </div>
                    <p className="text-[10px] text-zinc-400 mt-1 break-words">
                      {rule.explanation.summary}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {report.unsatisfiedRequired.length > 0 && (
            <div>
              <h3 className="text-[10px] font-mono uppercase tracking-wide text-zinc-500 mb-1.5 inline-flex items-center gap-1">
                <IconAlertTriangle className="w-3 h-3 text-red-400" />
                Required and unanswered
              </h3>
              <ul className="space-y-1">
                {report.unsatisfiedRequired.map((state) => (
                  <li
                    key={state.fieldId}
                    className="text-[11px] text-red-300 font-mono break-words"
                  >
                    {state.variableName}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {report.unsatisfiedRequired.length === 0 &&
            report.summary.openQueries === 0 && (
              <p className="text-[11px] text-emerald-400 inline-flex items-center gap-1">
                <IconCircleCheck className="w-3.5 h-3.5" />
                No outstanding queries or unanswered required fields.
              </p>
            )}
        </section>
      </div>
    </div>
  );
};
