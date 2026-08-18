"use client";

import React, { useState } from "react";
import { StudyProtocol, FieldAliasMapping, ProtocolRelease } from "@/lib/crf/types";
import {
  buildFieldAliasMap,
  detectTypeIncompatibilities,
  getNextReleaseVersion,
} from "@/lib/crf/alias-mapping";
import {
  IconRocket,
  IconX,
  IconCheck,
  IconAlertTriangle,
  IconArrowRight,
  IconShieldCheck,
  IconHistory,
} from "@tabler/icons-react";

interface PublishReleaseModalProps {
  isOpen: boolean;
  publishedStudy: StudyProtocol;
  draftStudy: StudyProtocol;
  onClose: () => void;
  onPublish: (publishedStudy: StudyProtocol, newRelease: ProtocolRelease, aliasMappings: FieldAliasMapping[]) => void;
}

export const PublishReleaseModal: React.FC<PublishReleaseModalProps> = ({
  isOpen,
  publishedStudy,
  draftStudy,
  onClose,
  onPublish,
}) => {
  const currentPubVer = publishedStudy.publishedVersion || publishedStudy.version || "1.0.0";
  const defaultNextVer = getNextReleaseVersion(currentPubVer, "minor");

  const [versionInput, setVersionInput] = useState(defaultNextVer);
  const [releaseNotes, setReleaseNotes] = useState(
    "Protocol amendment and CDASH variable standardization"
  );
  const [publisherName, setPublisherName] = useState("Dr. Sarah Jenkins (Lead Designer)");

  if (!isOpen) return null;

  const aliasMappings = buildFieldAliasMap(publishedStudy, draftStudy, versionInput);
  const typeNotices = detectTypeIncompatibilities(publishedStudy, draftStudy);

  const handleConfirmPublish = () => {
    const newRelease: ProtocolRelease = {
      version: versionInput,
      publishedAt: new Date().toISOString(),
      publishedBy: publisherName,
      notes: releaseNotes,
      protocolSnapshot: JSON.parse(JSON.stringify(draftStudy)),
      fieldAliasMap: aliasMappings,
    };

    const cumulativeAliasMap = [...(publishedStudy.fieldAliasMap || []), ...aliasMappings];
    const cumulativeReleases = [...(publishedStudy.releases || []), newRelease];

    const updatedPublishedProtocol: StudyProtocol = {
      ...draftStudy,
      version: versionInput,
      publishedVersion: versionInput,
      isDraftModified: false,
      lastModified: new Date().toISOString().slice(0, 10),
      releases: cumulativeReleases,
      fieldAliasMap: cumulativeAliasMap,
    };

    onPublish(updatedPublishedProtocol, newRelease, aliasMappings);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="bg-zinc-900 border border-zinc-700 rounded-2xl w-full max-w-2xl p-6 space-y-5 shadow-2xl overflow-hidden text-zinc-100 font-sans">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-zinc-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-brand-cyan/10 border border-brand-cyan/20 text-brand-cyan">
              <IconRocket className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base font-bold font-mono text-white flex items-center gap-2">
                <span>Publish Protocol Release</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-brand-cyan/20 text-brand-cyan border border-brand-cyan/30">
                  {currentPubVer} → v{versionInput}
                </span>
              </h2>
              <p className="text-xs text-zinc-400 font-sans">
                Build automated field alias maps and deploy draft updates to live EDC simulator sessions.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <IconX className="w-5 h-5" />
          </button>
        </div>

        {/* Release Config Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-mono text-xs">
          <div>
            <label className="block text-[10px] text-zinc-400 mb-1 font-semibold uppercase tracking-wider">
              Target Release Version
            </label>
            <input
              type="text"
              value={versionInput}
              onChange={(e) => setVersionInput(e.target.value)}
              className="w-full px-3 py-2 bg-zinc-950 border border-zinc-700 rounded-xl text-white focus:border-brand-cyan focus:outline-none"
              placeholder="e.g. 1.1.0"
            />
          </div>

          <div>
            <label className="block text-[10px] text-zinc-400 mb-1 font-semibold uppercase tracking-wider">
              Published By
            </label>
            <input
              type="text"
              value={publisherName}
              onChange={(e) => setPublisherName(e.target.value)}
              className="w-full px-3 py-2 bg-zinc-950 border border-zinc-700 rounded-xl text-white focus:border-brand-cyan focus:outline-none font-sans"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-[10px] text-zinc-400 mb-1 font-semibold uppercase tracking-wider">
              Protocol Release & Amendment Notes
            </label>
            <textarea
              rows={2}
              value={releaseNotes}
              onChange={(e) => setReleaseNotes(e.target.value)}
              className="w-full px-3 py-2 bg-zinc-950 border border-zinc-700 rounded-xl text-white focus:border-brand-cyan focus:outline-none font-sans text-xs resize-none"
              placeholder="Describe protocol changes, field variable updates, or CDASH modifications..."
            />
          </div>
        </div>

        {/* Data Type Incompatibility Warnings */}
        {typeNotices.length > 0 && (
          <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 space-y-2 text-xs">
            <div className="flex items-center gap-2 font-bold font-mono">
              <IconAlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Incompatible Data Type Notice ({typeNotices.length})</span>
            </div>
            <div className="space-y-1.5 font-mono text-[11px] text-amber-200/90 pl-6">
              {typeNotices.map((notice, idx) => (
                <div key={idx} className="bg-amber-950/40 p-2 rounded border border-amber-500/20">
                  <span className="font-bold text-white">{notice.variableName}</span>: {notice.previousType} → {notice.newType} ({notice.formName})
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Automated Field Alias Mapping Section */}
        <div className="space-y-2">
          <div className="flex items-center justify-between font-mono text-xs">
            <span className="font-bold text-white flex items-center gap-2">
              <IconHistory className="w-4 h-4 text-brand-cyan" />
              <span>Automated Field Alias Table</span>
            </span>
            <span className="text-zinc-400 text-[11px]">
              {aliasMappings.length} {aliasMappings.length === 1 ? "mapping" : "mappings"} generated
            </span>
          </div>

          {aliasMappings.length === 0 ? (
            <div className="p-4 text-center rounded-xl bg-zinc-950 border border-zinc-800 text-xs font-mono text-zinc-500">
              No variable renames or field data type changes detected in draft. Release will increment protocol version smoothly.
            </div>
          ) : (
            <div className="max-h-40 overflow-y-auto rounded-xl border border-zinc-800 bg-zinc-950 p-2 space-y-1.5 font-mono text-xs">
              {aliasMappings.map((map) => (
                <div
                  key={map.id}
                  className="flex items-center justify-between p-2 rounded-lg bg-zinc-900 border border-zinc-850"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-zinc-400 font-bold">{map.legacyVariableName}</span>
                    <IconArrowRight className="w-3.5 h-3.5 text-brand-cyan" />
                    <span className="text-emerald-400 font-bold">{map.currentVariableName}</span>
                    <span className="text-[10px] text-zinc-500">({map.fieldId})</span>
                  </div>
                  {map.dataTypeChanged && (
                    <span className="px-1.5 py-0.5 rounded text-[9px] bg-purple-500/20 text-purple-300 border border-purple-500/30">
                      Type Changed
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Guardrails Summary Notice */}
        <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center gap-3 text-xs text-zinc-400">
          <IconShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>
            Publishing preserves all active subject records, open queries, and 21 CFR Part 11 e-signatures without resetting EDC simulator sessions.
          </span>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-2 border-t border-zinc-800 font-mono text-xs">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirmPublish}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-brand-cyan text-black font-bold hover:bg-white transition-all shadow-md"
          >
            <IconCheck className="w-4 h-4" />
            <span>Confirm &amp; Publish Protocol Release</span>
          </button>
        </div>
      </div>
    </div>
  );
};
