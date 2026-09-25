import { ONCOLOGY_RECIST_PRESET } from "@/lib/crf/presets";
import type { StudyProtocol } from "@/lib/crf/types";

export const EXPORT_SCOPE_SENTINELS = [
  {
    formName: "EXPORT_SCOPE_FORM_A_SENTINEL",
    fieldLabel: "EXPORT_SCOPE_FIELD_A_SENTINEL",
    variableName: "EXPSCOPEA",
  },
  {
    formName: "EXPORT_SCOPE_FORM_B_SENTINEL",
    fieldLabel: "EXPORT_SCOPE_FIELD_B_SENTINEL",
    variableName: "EXPSCOPEB",
  },
  {
    formName: "EXPORT_SCOPE_FORM_C_SENTINEL",
    fieldLabel: "EXPORT_SCOPE_FIELD_C_SENTINEL",
    variableName: "EXPSCOPEC",
  },
] as const;

export function createExportScopeStudy(): StudyProtocol {
  const study = structuredClone(ONCOLOGY_RECIST_PRESET);
  study.forms = study.forms.slice(0, EXPORT_SCOPE_SENTINELS.length);

  study.forms.forEach((form, index) => {
    const sentinel = EXPORT_SCOPE_SENTINELS[index];
    const firstField = form.sections[0]?.fields[0];

    if (!sentinel || !firstField) {
      throw new Error(
        `Export scope fixture is missing form or field ${index}.`
      );
    }

    form.name = sentinel.formName;
    firstField.label = sentinel.fieldLabel;
    firstField.variableName = sentinel.variableName;
  });

  return study;
}
