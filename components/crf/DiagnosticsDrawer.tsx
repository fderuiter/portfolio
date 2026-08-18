"use client";

import React, { useState } from "react";
import { StudyProtocol, ComplianceViolation, ComplianceSeverity } from "@/lib/crf/types";
import { lintForm } from "@/lib/crf/ast-evaluator";
import {
  validateStudyCompliance,
  autoFixViolation,
  autoFixAllViolations,
} from "@/lib/crf/cdisc-conformance-linter";
import {
  IconCheck,
  IconX,
  IconShieldCheck,
  IconMathFunction,
  IconWand,
  IconArrowRight,
} from "@tabler/icons-react";
import { useFocusTrap } from "@/hooks/useFocusTrap";

interface DiagnosticsDrawerProps {
  isOpen: boolean;
  study: StudyProtocol;
  onClose: () => void;
  onSelectForm: (formId: string, fieldId?: string) => void;
  onUpdateStudy?: (updated: StudyProtocol) => void;
}

export const DiagnosticsDrawer: React.FC<DiagnosticsDrawerProps> = ({
  isOpen,
  study,
  onClose,
  onSelectForm,
  onUpdateStudy,
}) => {
  const [selectedTab, setSelectedTab] = useState<"form_logic" | "regulatory" | null>(null);
  const [filterSeverity, setFilterSeverity] = useState<"all" | ComplianceSeverity>("all");
  const [fixedNotice, setFixedNotice] = useState<string | null>(null);

  const containerRef = useFocusTrap<HTMLDivElement>(isOpen, {
    onEscape: onClose,
    returnFocus: true,
  });

  if (!isOpen) return null;

  // 1. AST Lint Diagnostics (Form Logic)
  interface FormLogicDiagnosticItem {
    id: string;
    formId: string;
    formName: string;
    fieldId?: string;
    message: string;
    severity: "error" | "warning" | "info";
    location: string;
  }

  const astDiagnostics: FormLogicDiagnosticItem[] = [];
  study.forms.forEach((form) => {
    const items = lintForm(form);
    const fields = form.sections.flatMap((s) => s.fields);
    items.forEach((item) => {
      const matchedField = fields.find((f) => item.id.includes(f.id));
      astDiagnostics.push({
        id: item.id,
        formId: form.id,
        formName: form.name,
        fieldId: matchedField?.id,
        message: item.message,
        severity: item.severity,
        location: item.location,
      });
    });
  });

  // 2. CDISC Conformance & Regulatory Engine Violations
  const complianceViolations = validateStudyCompliance(study);

  // Active Tab Selection (Defaults to whichever category has issues if unselected)
  const activeTab =
    selectedTab ??
    (astDiagnostics.length > 0
      ? "form_logic"
      : complianceViolations.length > 0
      ? "regulatory"
      : "form_logic");

  // Filtered issue lists based on severity
  const filteredAstDiagnostics = astDiagnostics.filter((d) =>
    filterSeverity === "all" ? true : d.severity === filterSeverity
  );

  const filteredComplianceViolations = complianceViolations.filter((v) =>
    filterSeverity === "all" ? true : v.severity === filterSeverity
  );

  const totalIssues = astDiagnostics.length + complianceViolations.length;

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
    <div
      ref={containerRef}
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-sm"
    >
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
                Real-time validation for form logic, missing core variables, and SDTM limits.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors shrink-0"
            aria-label="Close Diagnostics Studio"
          >
            <IconX className="w-5 h-5" />
          </button>
        </div>

        {/* Primary Drawer Category Tabs: Form Logic & Regulatory Conformance */}
        <div className="flex border-b border-zinc-800 bg-zinc-950/60 px-4 sm:px-6">
          <button
            role="tab"
            aria-selected={activeTab === "form_logic"}
            onClick={() => setSelectedTab("form_logic")}
            className={`flex items-center gap-2 py-3 px-4 font-mono text-xs font-bold border-b-2 transition-all ${
              activeTab === "form_logic"
                ? "border-brand-cyan text-brand-cyan bg-brand-cyan/5"
                : "border-transparent text-zinc-400 hover:text-white"
            }`}
          >
            <IconMathFunction className="w-4 h-4" />
            <span>Form Logic</span>
            <span
              className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                activeTab === "form_logic"
                  ? "bg-brand-cyan/20 text-brand-cyan font-bold"
                  : "bg-zinc-800 text-zinc-400"
              }`}
            >
              {filteredAstDiagnostics.length}
            </span>
          </button>

          <button
            role="tab"
            aria-selected={activeTab === "regulatory"}
            onClick={() => setSelectedTab("regulatory")}
            className={`flex items-center gap-2 py-3 px-4 font-mono text-xs font-bold border-b-2 transition-all ${
              activeTab === "regulatory"
                ? "border-brand-cyan text-brand-cyan bg-brand-cyan/5"
                : "border-transparent text-zinc-400 hover:text-white"
            }`}
          >
            <IconShieldCheck className="w-4 h-4" />
            <span>Regulatory Conformance</span>
            <span
              className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                activeTab === "regulatory"
                  ? "bg-brand-cyan/20 text-brand-cyan font-bold"
                  : "bg-zinc-800 text-zinc-400"
              }`}
            >
              {filteredComplianceViolations.length}
            </span>
          </button>
        </div>

        {/* Severity Filters & Auto-Fix Action Bar */}
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
              All ({activeTab === "form_logic" ? astDiagnostics.length : complianceViolations.length})
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
              <span className="text-[10px] bg-red-500/30 px-1.5 py-0.2 rounded">
                {activeTab === "form_logic"
                  ? astDiagnostics.filter((d) => d.severity === "error").length
                  : complianceViolations.filter((v) => v.severity === "error").length}
              </span>
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
              <span className="text-[10px] bg-amber-500/30 px-1.5 py-0.2 rounded">
                {activeTab === "form_logic"
                  ? astDiagnostics.filter((d) => d.severity === "warning").length
                  : complianceViolations.filter((v) => v.severity === "warning").length}
              </span>
            </button>
          </div>

          {activeTab === "regulatory" &&
            complianceViolations.some((v) => v.autoFixAvailable) &&
            onUpdateStudy && (
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
          {totalIssues === 0 ? (
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
          ) : activeTab === "form_logic" ? (
            filteredAstDiagnostics.length === 0 ? (
              <div className="p-8 rounded-2xl bg-zinc-950/60 border border-zinc-800 text-center space-y-3">
                <div className="w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto">
                  <IconCheck className="w-5 h-5" />
                </div>
                <div className="text-sm font-bold text-white font-mono">
                  No Form Logic Issues Found
                </div>
                <p className="text-xs text-zinc-400 max-w-md mx-auto">
                  All expressions, field references, variable definitions, and edit check rules are valid.
                </p>
                {complianceViolations.length > 0 && (
                  <button
                    onClick={() => setSelectedTab("regulatory")}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-brand-cyan font-mono text-xs transition-all"
                  >
                    <span>Switch to Regulatory Conformance ({complianceViolations.length} violations)</span>
                    <IconArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {filteredAstDiagnostics.map((item) => (
                  <div
                    key={item.id}
                    className={`p-4 rounded-xl border font-mono text-xs space-y-2 transition-all ${
                      item.severity === "error"
                        ? "bg-red-500/5 border-red-500/30"
                        : "bg-amber-500/5 border-amber-500/30"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              item.severity === "error"
                                ? "bg-red-500/20 text-red-400 border border-red-500/40"
                                : "bg-amber-500/20 text-amber-400 border border-amber-500/40"
                            }`}
                          >
                            {item.severity}
                          </span>
                          <span className="font-bold text-white">Form: {item.formName}</span>
                          <span className="text-zinc-400 text-[11px]">({item.location})</span>
                        </div>
                        <p className="text-xs text-zinc-300 font-sans">{item.message}</p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => {
                            onSelectForm(item.formId, item.fieldId);
                            onClose();
                          }}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-brand-cyan/15 hover:bg-brand-cyan/25 border border-brand-cyan/40 text-brand-cyan text-[11px] font-mono transition-colors"
                        >
                          <span>{item.fieldId ? "Inspect Field →" : "Inspect Form →"}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : filteredComplianceViolations.length === 0 ? (
            <div className="p-8 rounded-2xl bg-zinc-950/60 border border-zinc-800 text-center space-y-3">
              <div className="w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto">
                <IconCheck className="w-5 h-5" />
              </div>
              <div className="text-sm font-bold text-white font-mono">
                No Regulatory Conformance Violations Found
              </div>
              <p className="text-xs text-zinc-400 max-w-md mx-auto">
                All domain fields and visit assignments satisfy CDASH 2.2 and SDTMIG v3.4 rules.
              </p>
              {astDiagnostics.length > 0 && (
                <button
                  onClick={() => setSelectedTab("form_logic")}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-brand-cyan font-mono text-xs transition-all"
                >
                  <span>Switch to Form Logic ({astDiagnostics.length} errors)</span>
                  <IconArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredComplianceViolations.map((v) => (
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
                      <div className="flex items-center gap-2 flex-wrap">
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
                          onSelectForm(v.formId, v.fieldId);
                          onClose();
                        }}
                        className="text-[11px] font-mono text-zinc-400 hover:text-white underline ml-1"
                      >
                        {v.fieldId ? "Inspect Field →" : "Inspect Form →"}
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
            Close Diagnostics Studio
          </button>
        </div>
      </div>
    </div>
  );
};
