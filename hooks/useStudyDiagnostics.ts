"use client";

import { useMemo } from "react";
import { StudyProtocol, ComplianceViolation } from "@/lib/crf/types";
import { lintForm, DiagnosticItem } from "@/lib/crf/form-linter";
import { validateStudyCompliance } from "@/lib/crf/cdisc-conformance-linter";

export interface FormLogicDiagnostic extends DiagnosticItem {
  formId: string;
  formName: string;
}

export interface StudyDiagnostics {
  formLogicIssues: FormLogicDiagnostic[];
  regulatoryViolations: ComplianceViolation[];
  totalIssues: number;
  formLogicCount: number;
  regulatoryCount: number;
  formLogicErrorsCount: number;
  formLogicWarningsCount: number;
  regulatoryErrorsCount: number;
  regulatoryWarningsCount: number;
  totalErrorsCount: number;
  totalWarningsCount: number;
}

/**
 * Custom React Hook that computes unified diagnostic counts and categorized lists
 * for form logic errors and regulatory compliance violations across a study protocol.
 *
 * @param study - The study protocol object
 * @returns Unified diagnostic lists and counts for form logic and regulatory compliance
 */
export function useStudyDiagnostics(study: StudyProtocol): StudyDiagnostics {
  return useMemo(() => {
    const formLogicIssues: FormLogicDiagnostic[] = [];

    if (study && Array.isArray(study.forms)) {
      study.forms.forEach((form) => {
        const items = lintForm(form);
        items.forEach((item) => {
          formLogicIssues.push({
            ...item,
            formId: form.id,
            formName: form.name,
          });
        });
      });
    }

    const regulatoryViolations: ComplianceViolation[] = study
      ? validateStudyCompliance(study)
      : [];

    const formLogicCount = formLogicIssues.length;
    const regulatoryCount = regulatoryViolations.length;
    const totalIssues = formLogicCount + regulatoryCount;

    const formLogicErrorsCount = formLogicIssues.filter(
      (i) => i.severity === "error"
    ).length;
    const formLogicWarningsCount = formLogicIssues.filter(
      (i) => i.severity === "warning"
    ).length;

    const regulatoryErrorsCount = regulatoryViolations.filter(
      (v) => v.severity === "error"
    ).length;
    const regulatoryWarningsCount = regulatoryViolations.filter(
      (v) => v.severity === "warning"
    ).length;

    const totalErrorsCount = formLogicErrorsCount + regulatoryErrorsCount;
    const totalWarningsCount = formLogicWarningsCount + regulatoryWarningsCount;

    return {
      formLogicIssues,
      regulatoryViolations,
      totalIssues,
      formLogicCount,
      regulatoryCount,
      formLogicErrorsCount,
      formLogicWarningsCount,
      regulatoryErrorsCount,
      regulatoryWarningsCount,
      totalErrorsCount,
      totalWarningsCount,
    };
  }, [study]);
}
