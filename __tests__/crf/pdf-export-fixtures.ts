import { ONCOLOGY_RECIST_PRESET } from "@/lib/crf/presets";

export function createNearFooterSectionStudy() {
  const study = structuredClone(ONCOLOGY_RECIST_PRESET);
  const form = study.forms[0]!;
  const section = form.sections[0]!;
  const sourceField = section.fields[0]!;
  const expandedFields = Array.from({ length: 8 }, (_, index) => ({
    ...sourceField,
    id: `boundary-field-${index}`,
    label: `Boundary field ${index} with a longer prompt to fill the page`,
    description:
      "A clinical observation value and its collection context must remain legible in the generated regulatory document.",
  }));
  const boundaryField = {
    ...sourceField,
    id: "boundary-footer-safety-field",
    label: "Boundary footer safety field",
  };

  form.sections = [
    { ...section, title: "Preceding section", fields: expandedFields },
    {
      ...section,
      title: "Near-footer boundary",
      fields: [boundaryField],
    },
  ];
  study.forms = [form];

  return study;
}
