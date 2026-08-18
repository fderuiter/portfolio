"use client";

import React, { useState } from "react";
import { CopyButton } from "@/components/CopyButton";
import { StudyProtocol } from "@/lib/crf/types";
import { exportStudyToCdiscOdmXml } from "@/lib/crf/odm-xml-serializer";
import { exportFormToFhirQuestionnaire } from "@/lib/crf/fhir-questionnaire";
import { exportStudyToSas } from "@/lib/crf/export-sas";
import { exportStudyToR } from "@/lib/crf/export-r";
import {
  IconDownload,
  IconUpload,
  IconCode,
  IconFileSpreadsheet,
  IconFlame,
  IconPalette,
  IconFileText,
  IconTerminal,
  IconFileCode,
  IconAdjustments,
} from "@tabler/icons-react";

interface ExportImportModalProps {
  study: StudyProtocol;
  onImportStudy: (importedStudy: StudyProtocol) => void;
  onOpenExportDocument?: () => void;
  onOpenBranding?: () => void;
}

type ExportTab = "odm" | "sas" | "r" | "json" | "fhir" | "sdtm_spec";

export const ExportImportModal: React.FC<ExportImportModalProps> = ({
  study,
  onImportStudy,
  onOpenExportDocument,
  onOpenBranding,
}) => {
  const [activeTab, setActiveTab] = useState<ExportTab>("odm");
  const [selectedFormId, setSelectedFormId] = useState<string>("all");
  const [importJsonText, setImportJsonText] = useState("");
  const [importError, setImportError] = useState<string | null>(null);

  // Serialized formats
  const odmXmlContent = exportStudyToCdiscOdmXml(study);
  const jsonBundleContent = JSON.stringify(study, null, 2);
  const selectedForm = selectedFormId === "all" ? undefined : study.forms.find((f) => f.id === selectedFormId);
  const targetFormForFhir = selectedForm || study.forms[0] || {
    id: "crf-1",
    name: "General Form",
    domain: "DM",
    description: "",
    version: "1.0",
    sections: [],
    rules: [],
  };
  const fhirContent = JSON.stringify(
    exportFormToFhirQuestionnaire(targetFormForFhir, study),
    null,
    2
  );

  const sasContent = exportStudyToSas(study, {
    selectedFormId: selectedFormId === "all" ? undefined : selectedFormId,
    includeSampleData: true,
    includeProcContents: true,
    includeProcFreq: true,
  });

  const rContent = exportStudyToR(study, {
    selectedFormId: selectedFormId === "all" ? undefined : selectedFormId,
    includeSampleData: true,
    includeGlimpse: true,
    useLabelledPackage: true,
  });

  const getActiveContent = () => {
    switch (activeTab) {
      case "odm":
        return odmXmlContent;
      case "sas":
        return sasContent;
      case "r":
        return rContent;
      case "json":
        return jsonBundleContent;
      case "fhir":
        return fhirContent;
      default:
        return jsonBundleContent;
    }
  };

  const handleDownload = () => {
    let filename = `study-${study.protocolNumber}.json`;
    let mimeType = "application/json";
    const content = getActiveContent();
    const domainSuffix = selectedForm ? `-${selectedForm.domain || selectedForm.id}` : "";

    if (activeTab === "odm") {
      filename = `study-${study.protocolNumber}-odm.xml`;
      mimeType = "application/xml";
    } else if (activeTab === "sas") {
      filename = `study-${study.protocolNumber}${domainSuffix}.sas`;
      mimeType = "text/x-sas";
    } else if (activeTab === "r") {
      filename = `study-${study.protocolNumber}${domainSuffix}.R`;
      mimeType = "text/x-r";
    } else if (activeTab === "fhir") {
      filename = `fhir-questionnaire-${study.protocolNumber}${domainSuffix}.json`;
      mimeType = "application/json";
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handlePerformImport = () => {
    setImportError(null);
    try {
      const parsed = JSON.parse(importJsonText);
      if (!parsed.protocolNumber || !Array.isArray(parsed.forms)) {
        throw new Error("Invalid Study Protocol JSON: Missing 'protocolNumber' or 'forms' array.");
      }
      onImportStudy(parsed);
      setImportJsonText("");
    } catch (err: unknown) {
      setImportError((err as Error).message || "Invalid JSON syntax");
    }
  };

  // Compile SDTM variables for specification table, filtered by selectedFormId if applicable
  const formsForSpec = selectedFormId === "all"
    ? study.forms
    : study.forms.filter((f) => f.id === selectedFormId);

  const specFields = formsForSpec.flatMap((f) =>
    f.sections.flatMap((s) => s.fields.map((field) => ({ field, form: f })))
  );

  return (
    <div className="flex-1 flex flex-col h-full bg-zinc-950 p-4 sm:p-6 overflow-y-auto space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-zinc-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-purple-500/10 border border-purple-500/30 text-purple-400">
              <IconCode className="w-5 h-5" />
            </span>
            <h1 className="text-lg font-bold text-white font-mono">
              CDISC Standards &amp; Interoperability Exporter
            </h1>
          </div>
          <p className="text-xs text-zinc-400 font-sans mt-1">
            Export study protocols and CRFs to CDISC ODM-XML, SAS programs (PROC FORMAT &amp; ATTRIB), R tidyverse tibbles, HL7 FHIR Questionnaires, and JSON Study Bundles.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {onOpenBranding && (
            <button
              onClick={onOpenBranding}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 text-xs font-mono transition-all"
            >
              <IconPalette className="w-4 h-4 text-brand-cyan" />
              <span>Branding</span>
            </button>
          )}

          {onOpenExportDocument && (
            <button
              onClick={onOpenExportDocument}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-mono text-xs font-bold transition-all shadow-sm"
            >
              <IconFileText className="w-4 h-4" />
              <span>Export Word / PDF</span>
            </button>
          )}

          <CopyButton
            text={() => getActiveContent()}
            label="Copy Code"
            copiedLabel="Copied!"
            successMessage="Export code copied to clipboard"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-850 hover:bg-zinc-800 border border-zinc-750 text-zinc-200 text-xs font-mono transition-all cursor-pointer"
          />
          <button
            onClick={handleDownload}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-brand-cyan text-black hover:bg-white font-mono text-xs font-bold transition-all shadow-sm"
          >
            <IconDownload className="w-4 h-4" />
            <span>Download File</span>
          </button>
        </div>
      </div>

      {/* Domain / Form Filter Control */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-zinc-900/60 border border-zinc-800">
        <div className="flex items-center gap-2 text-xs font-mono text-zinc-300">
          <IconAdjustments className="w-4 h-4 text-brand-cyan" />
          <span className="font-bold">Domain &amp; Form Scope:</span>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={selectedFormId}
            onChange={(e) => setSelectedFormId(e.target.value)}
            className="px-3 py-1.5 bg-zinc-950 border border-zinc-800 rounded-lg text-xs font-mono text-zinc-200 focus:border-brand-cyan focus:outline-none"
            aria-label="Filter export domain scope"
          >
            <option value="all">All Study Domains (Full Protocol Suite)</option>
            {study.forms.map((form) => (
              <option key={form.id} value={form.id}>
                {form.domain ? `[${form.domain}] ` : ""}{form.name}
              </option>
            ))}
          </select>
          {selectedFormId !== "all" && (
            <button
              onClick={() => setSelectedFormId("all")}
              className="text-[11px] font-mono text-zinc-400 hover:text-brand-cyan underline"
            >
              Reset to Full Study
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-zinc-800 gap-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab("odm")}
          className={`px-3 sm:px-4 py-2 text-xs font-mono transition-colors border-b-2 flex items-center gap-2 whitespace-nowrap ${
            activeTab === "odm"
              ? "border-brand-cyan text-brand-cyan font-bold"
              : "border-transparent text-zinc-400 hover:text-zinc-200"
          }`}
        >
          <IconCode className="w-4 h-4" />
          <span>CDISC ODM-XML</span>
        </button>

        <button
          onClick={() => setActiveTab("sas")}
          className={`px-3 sm:px-4 py-2 text-xs font-mono transition-colors border-b-2 flex items-center gap-2 whitespace-nowrap ${
            activeTab === "sas"
              ? "border-brand-cyan text-brand-cyan font-bold"
              : "border-transparent text-zinc-400 hover:text-zinc-200"
          }`}
        >
          <IconTerminal className="w-4 h-4 text-emerald-400" />
          <span>SAS Script (.sas)</span>
        </button>

        <button
          onClick={() => setActiveTab("r")}
          className={`px-3 sm:px-4 py-2 text-xs font-mono transition-colors border-b-2 flex items-center gap-2 whitespace-nowrap ${
            activeTab === "r"
              ? "border-brand-cyan text-brand-cyan font-bold"
              : "border-transparent text-zinc-400 hover:text-zinc-200"
          }`}
        >
          <IconFileCode className="w-4 h-4 text-sky-400" />
          <span>R Scaffolding (.R)</span>
        </button>

        <button
          onClick={() => setActiveTab("fhir")}
          className={`px-3 sm:px-4 py-2 text-xs font-mono transition-colors border-b-2 flex items-center gap-2 whitespace-nowrap ${
            activeTab === "fhir"
              ? "border-brand-cyan text-brand-cyan font-bold"
              : "border-transparent text-zinc-400 hover:text-zinc-200"
          }`}
        >
          <IconFlame className="w-4 h-4 text-orange-400" />
          <span>HL7 FHIR R4</span>
        </button>

        <button
          onClick={() => setActiveTab("sdtm_spec")}
          className={`px-3 sm:px-4 py-2 text-xs font-mono transition-colors border-b-2 flex items-center gap-2 whitespace-nowrap ${
            activeTab === "sdtm_spec"
              ? "border-brand-cyan text-brand-cyan font-bold"
              : "border-transparent text-zinc-400 hover:text-zinc-200"
          }`}
        >
          <IconFileSpreadsheet className="w-4 h-4" />
          <span>SDTM Mapping Specs</span>
        </button>

        <button
          onClick={() => setActiveTab("json")}
          className={`px-3 sm:px-4 py-2 text-xs font-mono transition-colors border-b-2 flex items-center gap-2 whitespace-nowrap ${
            activeTab === "json"
              ? "border-brand-cyan text-brand-cyan font-bold"
              : "border-transparent text-zinc-400 hover:text-zinc-200"
          }`}
        >
          <IconCode className="w-4 h-4" />
          <span>JSON Study Bundle</span>
        </button>
      </div>

      {/* Main Tab Content */}
      {activeTab === "sdtm_spec" ? (
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 overflow-x-auto shadow-xl">
          <table className="w-full text-left border-collapse text-xs font-mono">
            <thead>
              <tr className="border-b border-zinc-800 bg-zinc-950/80 text-zinc-400">
                <th className="p-3">Domain</th>
                <th className="p-3">Form</th>
                <th className="p-3">Variable (CDASH)</th>
                <th className="p-3">Label</th>
                <th className="p-3">Data Type</th>
                <th className="p-3">Core</th>
                <th className="p-3">aCRF Overlay Tag</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-850">
              {specFields.map(({ field, form }) => (
                <tr key={`${form.id}_${field.id}`} className="hover:bg-zinc-850/40">
                  <td className="p-3 font-bold text-brand-cyan">{form.domain}</td>
                  <td className="p-3 text-zinc-300 font-sans">{form.name}</td>
                  <td className="p-3 font-bold text-white">{field.variableName}</td>
                  <td className="p-3 text-zinc-300 font-sans">{field.label}</td>
                  <td className="p-3 text-zinc-500">{field.dataType}</td>
                  <td className="p-3 text-zinc-400">{field.cdashMetadata?.core || (field.required ? "R" : "O")}</td>
                  <td className="p-3 text-sky-400">
                    {field.cdashMetadata?.acrfAnnotation || `${form.domain}.${field.variableName}`}
                  </td>
                </tr>
              ))}
              {specFields.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-4 text-center text-zinc-500">
                    No fields found for selected form/domain scope.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4 font-mono text-xs overflow-x-auto max-h-[450px]">
          <pre className="text-zinc-300 whitespace-pre-wrap leading-relaxed">
            {getActiveContent()}
          </pre>
        </div>
      )}

      {/* Import Section */}
      <div className="p-5 rounded-2xl bg-zinc-900/40 border border-zinc-800 space-y-3">
        <div className="flex items-center gap-2">
          <IconUpload className="w-4 h-4 text-brand-cyan" />
          <h2 className="text-xs font-bold text-white font-mono uppercase">
            Lossless Protocol Import (JSON Study Bundle)
          </h2>
        </div>

        <textarea
          rows={3}
          value={importJsonText}
          onChange={(e) => setImportJsonText(e.target.value)}
          placeholder="Paste exported StudyProtocol JSON here to load..."
          className="w-full p-3 bg-zinc-950 border border-zinc-800 rounded-xl text-xs font-mono text-zinc-300 focus:border-brand-cyan focus:outline-none"
        />

        {importError && (
          <div className="p-2.5 rounded-lg bg-red-500/10 border border-red-500/30 text-xs text-red-400 font-mono">
            {importError}
          </div>
        )}

        <div className="flex justify-end">
          <button
            onClick={handlePerformImport}
            disabled={!importJsonText.trim()}
            className="px-4 py-2 bg-zinc-800 hover:bg-brand-cyan text-white hover:text-black font-mono text-xs font-bold rounded-xl transition-all disabled:opacity-40 disabled:pointer-events-none"
          >
            Import Protocol into Studio
          </button>
        </div>
      </div>
    </div>
  );
};
