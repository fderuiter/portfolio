import { StudyProtocol, CRFForm } from "./types";

/**
 * Maps ClinicalDataType to FHIR QuestionnaireItemType
 */
function mapToFhirItemType(type: string): string {
  switch (type) {
    case "integer":
      return "integer";
    case "number":
    case "calculated":
    case "vas_scale":
    case "nrs_scale":
      return "decimal";
    case "date":
    case "partial_date":
      return "date";
    case "time":
      return "time";
    case "datetime":
      return "dateTime";
    case "single_select":
    case "radio":
      return "choice";
    case "multi_select":
    case "checkbox":
      return "open-choice";
    case "textarea":
      return "text";
    case "text":
      return "string";
    case "repeating_table":
      return "group";
    default:
      return "string";
  }
}

/**
 * Converts a CRFForm into an HL7 FHIR R4 Questionnaire Resource
 */
export function exportFormToFhirQuestionnaire(form: CRFForm, study: StudyProtocol): object {
  return {
    resourceType: "Questionnaire",
    id: `crf-${form.id.toLowerCase().replace(/[^a-z0-9-]/g, "-")}`,
    url: `https://clinicaltrials.gov/fhir/Questionnaire/${study.protocolNumber}/${form.domain || form.id}`,
    identifier: [
      {
        system: "urn:ietf:rfc:3986",
        value: `urn:uuid:${form.id}`,
      },
    ],
    version: form.version || "1.0",
    name: form.name.replace(/[^A-Za-z0-9]/g, ""),
    title: form.name,
    status: "active",
    date: new Date().toISOString().split("T")[0],
    publisher: study.sponsor || "Clinical Study Sponsor",
    description: form.description
      ? `${form.description} • Schedule Consultation: /schedule`
      : "Schedule Consultation: /schedule",
    item: form.sections.map((sec, sIdx) => ({
      linkId: `section-${sIdx + 1}`,
      text: sec.title,
      type: "group",
      item: sec.fields.map((field) => {
        const itemObj: Record<string, unknown> = {
          linkId: field.variableName || field.id,
          text: field.label,
          type: mapToFhirItemType(field.dataType),
          required: !!field.required,
        };

        if (field.unit) {
          itemObj.extension = [
            {
              url: "http://hl7.org/fhir/StructureDefinition/questionnaire-unit",
              valueCoding: {
                system: "http://unitsofmeasure.org",
                code: field.unit,
                display: field.unit,
              },
            },
          ];
        }

        // Codelist options
        const codelist = study.codelists.find((cl) => cl.id === field.codelistId);
        const options = field.customOptions || codelist?.options;
        if (options && options.length > 0) {
          itemObj.answerOption = options.map((opt) => ({
            valueCoding: {
              system: codelist?.nciCodelistCode
                ? `http://ncithesaurus-stage.nci.nih.gov/ncitbrowser/${codelist.nciCodelistCode}`
                : "https://cdisc.org/terminology",
              code: opt.code,
              display: opt.label,
            },
          }));
        }

        return itemObj;
      }),
    })),
  };
}
