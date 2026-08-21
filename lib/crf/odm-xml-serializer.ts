import { StudyProtocol, EditCheckRule, AstCondition, CRFField } from "./types";
import { escapeXml } from "../utils";
import { isSingleFormRule } from "./expression-evaluator";

/**
 * Formats an AstCondition into a CDISC ODM formal expression string
 */
export function compileConditionToOdm(cond: AstCondition, fieldsList: CRFField[] = []): string {
  const field = fieldsList.find((f) => f.id === cond.fieldId || f.variableName === cond.fieldId);
  const varName = field ? field.variableName : cond.fieldId;

  const formatVal = (v: string | number | boolean | string[]): string => {
    if (Array.isArray(v)) return `(${v.map((item) => `"${item}"`).join(", ")})`;
    if (typeof v === "string") return `"${v}"`;
    return String(v);
  };

  switch (cond.operator) {
    case "eq":
      return `${varName} == ${formatVal(cond.value)}`;
    case "neq":
      return `${varName} != ${formatVal(cond.value)}`;
    case "gt":
      return `${varName} > ${cond.value}`;
    case "gte":
      return `${varName} >= ${cond.value}`;
    case "lt":
      return `${varName} < ${cond.value}`;
    case "lte":
      return `${varName} <= ${cond.value}`;
    case "in":
      return `${varName} IN ${formatVal(cond.value)}`;
    case "contains":
      return `CONTAINS(${varName}, ${formatVal(cond.value)})`;
    case "is_empty":
      return `IS_EMPTY(${varName})`;
    case "is_not_empty":
      return `IS_NOT_EMPTY(${varName})`;
    default:
      return `${varName} ${cond.operator} ${formatVal(cond.value)}`;
  }
}

/**
 * Compiles a single-form EditCheckRule into a formal ODM expression
 */
export function compileRuleToOdmExpression(rule: EditCheckRule, fieldsList: CRFField[] = []): string {
  const conds = rule.conditions.map((c) => compileConditionToOdm(c, fieldsList));
  const operator = rule.logicalOperator === "OR" ? " OR " : " AND ";
  let expr = conds.length > 1 ? conds.map((c) => `(${c})`).join(operator) : conds[0] || "";

  if (rule.formulaExpression) {
    expr = expr ? `${expr} => ${rule.targetFieldId} = ${rule.formulaExpression}` : `${rule.targetFieldId} = ${rule.formulaExpression}`;
  }
  return expr;
}

/**
 * Maps ClinicalDataType to CDISC ODM DataType
 */
function mapDataTypeToOdm(type: string): string {
  switch (type) {
    case "integer":
      return "integer";
    case "number":
    case "calculated":
    case "vas_scale":
    case "nrs_scale":
      return "float";
    case "date":
      return "date";
    case "partial_date":
    case "precision_date":
      return "partialDate";
    case "time":
      return "time";
    case "datetime":
      return "datetime";
    case "single_select":
    case "radio":
    case "checkbox":
    case "multi_select":
      return "text";
    default:
      return "text";
  }
}

/**
 * Serializes a StudyProtocol into standard CDISC ODM-XML v1.3.2 format
 */
export function exportStudyToCdiscOdmXml(study: StudyProtocol): string {
  const timestamp = new Date().toISOString();
  const protoNum = study.protocolNumber || "STUDY01";
  const studyOid = `STUDY.${protoNum.replace(/[^A-Za-z0-9_]/g, "_")}`;
  const metaOid = `MDV.${study.version || "1.0"}`;
  const studyTitle = study.studyName || protoNum;

  // Flatten all fields across forms for OID & rule compilation
  const allFields = study.forms.flatMap((f) => f.sections.flatMap((s) => s.fields));

  // Collect single-form rules
  const singleFormRules: EditCheckRule[] = [];
  const processedRuleIds = new Set<string>();

  study.forms.forEach((form) => {
    (form.rules || []).forEach((rule) => {
      if (isSingleFormRule(rule) && !processedRuleIds.has(rule.id)) {
        processedRuleIds.add(rule.id);
        singleFormRules.push(rule);
      }
    });
  });

  (study.rules || []).forEach((rule) => {
    if (isSingleFormRule(rule) && !processedRuleIds.has(rule.id)) {
      processedRuleIds.add(rule.id);
      singleFormRules.push(rule);
    }
  });

  // Map targetFieldId to rule for CollectionExceptionConditionOID
  const fieldTargetRules = new Map<string, string>();
  singleFormRules.forEach((rule) => {
    if (rule.targetFieldId) {
      fieldTargetRules.set(rule.targetFieldId, rule.id);
    }
  });

  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<!-- Schedule Consultation: /schedule -->
<ODM xmlns="http://www.cdisc.org/ns/odm/v1.3"
     xmlns:ds="http://www.w3.org/2000/09/xmldsig#"
     xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
     xmlns:def="http://www.cdisc.org/ns/def/v2.1"
     FileType="Snapshot"
     FileOID="ODM.${protoNum}.${Date.now()}"
     CreationDateTime="${timestamp}"
     ODMVersion="1.3.2">
  <Study OID="${studyOid}">
    <GlobalVariables>
      <StudyName>${escapeXml(studyTitle)}</StudyName>
      <StudyDescription>Protocol ${escapeXml(protoNum)} - ${escapeXml(study.phase || "")} • Schedule Consultation: /schedule</StudyDescription>
      <ProtocolName>${escapeXml(protoNum)}</ProtocolName>
    </GlobalVariables>
    <MetaDataVersion OID="${metaOid}" Name="Protocol Definition Version ${escapeXml(study.version || "1.0")}">
      <Protocol>
`;

  // StudyEventRefs
  study.visits.forEach((v, idx) => {
    const vOid = v.oid || v.id || `VIS_${idx + 1}`;
    xml += `        <StudyEventRef StudyEventOID="${escapeXml(vOid)}" OrderNumber="${idx + 1}" Mandatory="Yes"/>\n`;
  });

  xml += `      </Protocol>\n\n`;

  // StudyEventDefs (Visits)
  study.visits.forEach((v, idx) => {
    const vOid = v.oid || v.id || `VIS_${idx + 1}`;
    const formIds = v.assignedFormIds || [];
    xml += `      <StudyEventDef OID="${escapeXml(vOid)}" Name="${escapeXml(v.name)}" Repeating="${v.isRepeating ? "Yes" : "No"}" Type="${v.visitType || "Scheduled"}">\n`;
    formIds.forEach((fId: string, fIdx: number) => {
      xml += `        <FormRef FormOID="FORM.${escapeXml(fId)}" OrderNumber="${fIdx + 1}" Mandatory="Yes"/>\n`;
    });
    xml += `      </StudyEventDef>\n`;
  });

  xml += `\n`;

  // FormDefs
  study.forms.forEach((form) => {
    const formOid = `FORM.${form.id}`;
    xml += `      <FormDef OID="${formOid}" Name="${escapeXml(form.name)}" Repeating="${form.isLogForm ? "Yes" : "No"}">\n`;
    form.sections.forEach((sec, sIdx) => {
      const igOid = `IG.${form.domain || "CRF"}.${sec.id}`;
      xml += `        <ItemGroupRef ItemGroupOID="${igOid}" OrderNumber="${sIdx + 1}" Mandatory="Yes"/>\n`;
    });
    xml += `      </FormDef>\n`;
  });

  xml += `\n`;

  // ItemGroupDefs (Sections)
  study.forms.forEach((form) => {
    form.sections.forEach((sec) => {
      const igOid = `IG.${form.domain || "CRF"}.${sec.id}`;
      xml += `      <ItemGroupDef OID="${igOid}" Name="${escapeXml(sec.title)}" Repeating="${sec.isRepeating ? "Yes" : "No"}">\n`;
      sec.fields.forEach((field, fIdx) => {
        const itemOid = `IT.${field.variableName || field.id}`;
        const targetRuleId = fieldTargetRules.get(field.id) || fieldTargetRules.get(field.variableName);
        const condAttr = targetRuleId ? ` CollectionExceptionConditionOID="CND.${escapeXml(targetRuleId)}"` : "";
        xml += `        <ItemRef ItemOID="${itemOid}" OrderNumber="${fIdx + 1}" Mandatory="${field.required ? "Yes" : "No"}"${condAttr}/>\n`;
      });
      xml += `      </ItemGroupDef>\n`;
    });
  });

  xml += `\n`;

  // ItemDefs (Fields)
  const processedItems = new Set<string>();
  const customFieldCodelists: Map<string, import("./types").CodelistDefinition> = new Map();

  study.forms.forEach((form) => {
    form.sections.forEach((sec) => {
      sec.fields.forEach((field) => {
        const itemOid = `IT.${field.variableName || field.id}`;
        if (processedItems.has(itemOid)) return;
        processedItems.add(itemOid);

        let effectiveCodelistId = field.codelistId;
        if (!effectiveCodelistId && field.customOptions && field.customOptions.length > 0) {
          effectiveCodelistId = `CL_${field.variableName || field.id}`;
          if (!customFieldCodelists.has(effectiveCodelistId)) {
            customFieldCodelists.set(effectiveCodelistId, {
              id: effectiveCodelistId,
              name: `${field.label || field.variableName} (Field Codelist)`,
              options: field.customOptions,
              isStandard: false,
            });
          }
        }

        const odmType = mapDataTypeToOdm(field.dataType);
        const codelistAttr = effectiveCodelistId ? ` CodeListOID="${escapeXml(effectiveCodelistId)}"` : "";

        xml += `      <ItemDef OID="${itemOid}" Name="${escapeXml(field.variableName)}" DataType="${odmType}"${codelistAttr}>\n`;
        xml += `        <Description><TranslatedText xml:lang="en">${escapeXml(field.label)}</TranslatedText></Description>\n`;
        if (field.cdashMetadata) {
          xml += `        <def:AnnotatedCRF>
          <def:DocumentRef leafID="aCRF"/>
          <def:PDFPageRef PageRefs="1" FirstPage="1" LastPage="1" Type="Physical"/>
        </def:AnnotatedCRF>\n`;
        }
        xml += `      </ItemDef>\n`;
      });
    });
  });

  xml += `\n`;

  // CodeLists (Study Codelists + Inline Custom Codelists)
  const allCodelists: import("./types").CodelistDefinition[] = [
    ...study.codelists,
    ...Array.from(customFieldCodelists.values()).filter(
      (ccl) => !study.codelists.some((cl) => cl.id === ccl.id)
    ),
  ];

  allCodelists.forEach((cl) => {
    const nciAttr = cl.nciCodelistCode ? ` def:NCICode="${escapeXml(cl.nciCodelistCode)}"` : "";
    xml += `      <CodeList OID="${escapeXml(cl.id)}" Name="${escapeXml(cl.name)}" DataType="text"${nciAttr}>\n`;
    cl.options.forEach((opt) => {
      const optNci = opt.nciCode ? ` def:NCICode="${escapeXml(opt.nciCode)}"` : "";
      xml += `        <CodeListItem CodedValue="${escapeXml(opt.code)}"${optNci}>\n`;
      xml += `          <Decode><TranslatedText xml:lang="en">${escapeXml(opt.label)}</TranslatedText></Decode>\n`;
      xml += `        </CodeListItem>\n`;
    });
    xml += `      </CodeList>\n`;
  });

  // ConditionDefs (Single-Form Edit Check Rules)
  if (singleFormRules.length > 0) {
    xml += `\n`;
    singleFormRules.forEach((rule) => {
      const cndOid = `CND.${rule.id}`;
      const expr = compileRuleToOdmExpression(rule, allFields);
      const desc = rule.queryMessage || rule.description || rule.name;
      xml += `      <ConditionDef OID="${escapeXml(cndOid)}" Name="${escapeXml(rule.name)}">\n`;
      xml += `        <Description><TranslatedText xml:lang="en">${escapeXml(desc)}</TranslatedText></Description>\n`;
      xml += `        <FormalExpression Context="CRFStudio">${escapeXml(expr)}</FormalExpression>\n`;
      xml += `      </ConditionDef>\n`;
    });
  }

  xml += `    </MetaDataVersion>
  </Study>
</ODM>`;

  return xml;
}

export const serializeStudyToOdmXml = exportStudyToCdiscOdmXml;

