"use client";

import React, { useState, useEffect } from "react";
import { StudyProtocol, ComplianceViolation, ComplianceSeverity } from "@/lib/crf/types";
import {
  validateStudyCompliance,
  autoFixViolation,
  autoFixAllViolations,
} from "@/lib/crf/cdisc-conformance-linter";
import {
  IconCheck,
  IconX,
  IconShieldCheck,
  IconWand,
} from "@tabler/icons-react";
import { useFocusTrap } from "@/hooks/useFocusTrap";

interface DiagnosticsDrawerProps {
  isOpen: boolean;
  study: StudyProtocol;
  onClose: () => void;
  onSelectForm: (formId: string) => void;
  onUpdateStudy?: (updated: StudyProtocol) => void;
}

export const DiagnosticsDrawer: React.FC<DiagnosticsDrawerProps> = ({
  isOpen,
  study,
  onClose,
  onSelectForm,
  onUpdateStudy,
}) => {
  const [filterSeverity, setFilterSeverity] = useState<"all" | ComplianceSeverity>("all");
  const [fixedNotice, setFixedNotice] = useState<string | null>(null);
  const [astDiagnostics, setAstDiagnostics] = useState<{ formName: string; formId: string; message: string; severity: string }[]>([]);

  useEffect(() => {
    let isMounted = true;
    import("@/lib/crf/ast-evaluator").then(({ lintForm }) => {
      if (!isMounted) return;
      const diags: { formName: string; formId: string; message: string; severity: string }[] = [];
      study.forms.forEach((form) => {
        const items = lintForm(form);
        items.forEach((item) => {
          diags.push({
            formName: form.name,
            formId: form.id,
            message: item.message,
            severity: item.severity,
          });
        });
      });
      setAstDiagnostics(diags);
    });
    return () => {
      isMounted = false;
    };
  }, [study]);

  const containerRef = useFocusTrap<HTMLDivElement>(isOpen, {
    onEscape: onClose,
    returnFocus: true,
  });

  if (!isOpen) return null;

  // 2. CDISC Conformance & Regulatory Engine Violations
  const complianceViolations = validateStudyCompliance(study);

  const totalErrors =
    complianceViolations.filter((v) => v.severity === "error").length +
    astDiagnostics.filter((d) => d.severity === "error").length;

  const totalWarnings =
    complianceViolations.filter((v) => v.severity === "warning").length +
    astDiagnostics.filter((d) => d.severity === "warning").length;

  const filteredViolations = complianceViolations.filter((v) =>
    filterSeverity === "all" ? true : v.severity === filterSeverity
  );

  const handleFixSingle = (violation: ComplianceViolation) => {
    if (!onUpdateStudy) return;
    const fixed = autoFixViolation(study, violation);
    onUpdateStudy(fixed);
    setFixedNotice(`Remediated ${violation.ruleId}: ${violation.suggestedFix}`);
    setTimeout(() => setFixedNotice(null), 3000);
  };

  const handleFixAll = () => {
    if (!onUpdateStudy) return;
    const { updatedStudy, fixedCount } = autoFixAllViolations(study);
    onUpdateStudy(updatedStudy);
    setFixedNotice(`Successfully auto-fixed ${fixedCount} compliance issues across the study!`);
    setTimeout(() => setFixedNotice(null), 4000);
  };

  return (
    <div ref={containerRef} role="dialog" aria-modal="true" className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-zinc-900 border border-zinc-700/80 rounded-2xl w-full max-w-3xl max-h-[92vh] sm:max-h-[88vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-zinc-800 bg-zinc-950/70">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="p-1.5 sm:p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-brand-cyan shrink-0">
              <IconShieldCheck className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <h3 className="text-xs sm:text-base font-bold text-white font-mono flex items-center gap-2 flex-wrap">
                <span className="truncate">CDISC Conformance &amp; Regulatory Validation Studio</span>
                <span className="text-[9px] sm:text-[10px] bg-brand-cyan/15 text-brand-cyan px-1.5 sm:px-2 py-0.5 rounded border border-brand-cyan/30">
                  CDASH 2.2 / SDTMIG v3.4
                </span>
              </h3>
              <p className="text-[11px] sm:text-xs text-zinc-400 font-sans truncate sm:whitespace-normal">
                Real-time validation for missing core variables and SDTM limits with 1-Click Auto-Fix.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors shrink-0"
          >
            <IconX className="w-5 h-5" />
          </button>
        </div>

        {/* Severity Filter Tabs & Auto-Fix All Action */}
        <div className="px-4 sm:px-6 py-2.5 sm:py-3 border-b border-zinc-800 bg-zinc-950/40 flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setFilterSeverity("all")}
              className={`px-3 py-1 rounded-lg text-xs font-mono transition-all ${
                filterSeverity === "all"
                  ? "bg-zinc-800 text-white font-bold"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              All Issues ({complianceViolations.length + astDiagnostics.length})
            </button>
            <button
              onClick={() => setFilterSeverity("error")}
              className={`px-3 py-1 rounded-lg text-xs font-mono transition-all flex items-center gap-1 ${
                filterSeverity === "error"
                  ? "bg-red-500/20 text-red-400 border border-red-500/30 font-bold"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              <span>Errors</span>
              <span className="text-[10px] bg-red-500/30 px-1.5 py-0.2 rounded">{totalErrors}</span>
            </button>
            <button
              onClick={() => setFilterSeverity("warning")}
              className={`px-3 py-1 rounded-lg text-xs font-mono transition-all flex items-center gap-1 ${
                filterSeverity === "warning"
                  ? "bg-amber-500/20 text-amber-400 border border-amber-500/30 font-bold"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              <span>Warnings</span>
              <span className="text-[10px] bg-amber-500/30 px-1.5 py-0.2 rounded">{totalWarnings}</span>
            </button>
          </div>

          {complianceViolations.some((v) => v.autoFixAvailable) && onUpdateStudy && (
            <button
              onClick={handleFixAll}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand-cyan hover:bg-white text-black font-mono text-xs font-bold transition-all shadow-sm"
            >
              <IconWand className="w-3.5 h-3.5" />
              <span>1-Click Auto-Fix All</span>
            </button>
          )}
        </div>

        {/* Action Notice Alert */}
        {fixedNotice && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-mono flex items-center gap-2 animate-in fade-in">
            <IconCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{fixedNotice}</span>
          </div>
        )}

        {/* Diagnostics Results Body */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {complianceViolations.length === 0 && astDiagnostics.length === 0 ? (
            <div className="p-8 rounded-2xl bg-zinc-950/60 border border-zinc-800 text-center space-y-2">
              <div className="w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto">
                <IconCheck className="w-5 h-5" />
              </div>
              <div className="text-sm font-bold text-white font-mono">
                100% CDISC &amp; SDTM Compliant
              </div>
              <p className="text-xs text-zinc-400">
                All forms, variable identifiers, formulas, codelists, and Schedule of Activities visits conform strictly to CDASH 2.2 and SDTMIG v3.4.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredViolations.map((v) => (
                <div
                  key={v.id}
                  className={`p-4 rounded-xl border font-mono text-xs space-y-2 transition-all ${
                    v.severity === "error"
                      ? "bg-red-500/5 border-red-500/30"
                      : "bg-amber-500/5 border-amber-500/30"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            v.severity === "error"
                              ? "bg-red-500/20 text-red-400 border border-red-500/40"
                              : "bg-amber-500/20 text-amber-400 border border-amber-500/40"
                          }`}
                        >
                          {v.ruleId}
                        </span>
                        <span className="font-bold text-white">Form: {v.formName}</span>
                        {v.variableName && (
                          <span className="text-brand-cyan">({v.variableName})</span>
                        )}
                      </div>
                      <p className="text-xs text-zinc-300 font-sans">{v.message}</p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {v.autoFixAvailable && onUpdateStudy && (
                        <button
                          onClick={() => handleFixSingle(v)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-brand-cyan/15 hover:bg-brand-cyan/25 border border-brand-cyan/40 text-brand-cyan text-[11px] font-mono transition-colors"
                          title="Apply instant schema fix"
                        >
                          <IconWand className="w-3 h-3" />
                          <span>Fix Rule</span>
                        </button>
                      )}

                      <button
                        onClick={() => {
                          onSelectForm(v.formId);
                          onClose();
                        }}
                        className="text-[11px] font-mono text-zinc-400 hover:text-white underline ml-1"
                      >
                        Inspect Form →
                      </button>
                    </div>
                  </div>

                  {v.suggestedFix && (
                    <div className="text-[10px] text-zinc-500 font-sans pt-1 border-t border-zinc-800">
                      Suggested Remedy: <span className="text-zinc-300 font-mono">{v.suggestedFix}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-zinc-800 bg-zinc-950/80 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg text-xs font-mono transition-colors"
          >
            Close Conformance Studio
          </button>
        </div>
      </div>
    </div>
  );
};
