import { StudyProtocol } from "./types";

/**
 * Escapes XML special characters
 */
function escapeXml(unsafe: string): string {
  if (!unsafe) return "";
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
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
    case "partial_date":
      return "date";
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
  const studyOid = `STUDY.${study.protocolNumber.replace(/[^A-Za-z0-9_]/g, "_")}`;
  const metaOid = `MDV.${study.version || "1.0"}`;

  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<ODM xmlns="http://www.cdisc.org/ns/odm/v1.3"
     xmlns:ds="http://www.w3.org/2000/09/xmldsig#"
     xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
     xmlns:def="http://www.cdisc.org/ns/def/v2.1"
     FileType="Snapshot"
     FileOID="ODM.${study.protocolNumber}.${Date.now()}"
     CreationDateTime="${timestamp}"
     ODMVersion="1.3.2">
  <Study OID="${studyOid}">
    <GlobalVariables>
      <StudyName>${escapeXml(study.studyName)}</StudyName>
      <StudyDescription>Protocol ${escapeXml(study.protocolNumber)} - ${escapeXml(study.phase)}</StudyDescription>
      <ProtocolName>${escapeXml(study.protocolNumber)}</ProtocolName>
    </GlobalVariables>
    <MetaDataVersion OID="${metaOid}" Name="Protocol Definition Version ${escapeXml(study.version)}">
      <Protocol>
`;

  // StudyEventRefs
  study.visits.forEach((v, idx) => {
    xml += `        <StudyEventRef StudyEventOID="${escapeXml(v.oid)}" OrderNumber="${idx + 1}" Mandatory="Yes"/>\n`;
  });

  xml += `      </Protocol>\n\n`;

  // StudyEventDefs (Visits)
  study.visits.forEach((v) => {
    xml += `      <StudyEventDef OID="${escapeXml(v.oid)}" Name="${escapeXml(v.name)}" Repeating="${v.isRepeating ? "Yes" : "No"}" Type="${v.visitType}">\n`;
    v.assignedFormIds.forEach((fId, fIdx) => {
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
        xml += `        <ItemRef ItemOID="${itemOid}" OrderNumber="${fIdx + 1}" Mandatory="${field.required ? "Yes" : "No"}"/>\n`;
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

  xml += `    </MetaDataVersion>
  </Study>
</ODM>`;

  return xml;
}
