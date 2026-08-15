"use client";

import React, { useState } from "react";
import { StudyProtocol, StudyVisit } from "@/lib/crf/types";
import {
  IconCalendar,
  IconPlus,
  IconTrash,
  IconCheck,
} from "@tabler/icons-react";

interface VisitMatrixEditorProps {
  study: StudyProtocol;
  onUpdateVisits: (visits: StudyVisit[]) => void;
}

export const VisitMatrixEditor: React.FC<VisitMatrixEditorProps> = ({
  study,
  onUpdateVisits,
}) => {
  const [editingVisitId, setEditingVisitId] = useState<string | null>(null);

  const handleToggleFormAtVisit = (visitId: string, formId: string) => {
    const updated = study.visits.map((v) => {
      if (v.id !== visitId) return v;
      const assigned = v.assignedFormIds.includes(formId)
        ? v.assignedFormIds.filter((id) => id !== formId)
        : [...v.assignedFormIds, formId];
      return { ...v, assignedFormIds: assigned };
    });
    onUpdateVisits(updated);
  };

  const handleAddVisit = () => {
    const nextIdx = study.visits.length + 1;
    const newVisit: StudyVisit = {
      id: `v_cycle_${Date.now()}`,
      oid: `SE.VISIT_${nextIdx}`,
      name: `Visit ${nextIdx} (Day ${(nextIdx - 1) * 28})`,
      visitType: "Scheduled",
      targetDay: (nextIdx - 1) * 28,
      windowBefore: 3,
      windowAfter: 3,
      assignedFormIds: study.forms.filter((f) => !f.isLogForm).map((f) => f.id),
    };
    onUpdateVisits([...study.visits, newVisit]);
  };

  const handleDeleteVisit = (visitId: string) => {
    onUpdateVisits(study.visits.filter((v) => v.id !== visitId));
  };

  const handleUpdateVisit = (visitId: string, updates: Partial<StudyVisit>) => {
    onUpdateVisits(study.visits.map((v) => (v.id === visitId ? { ...v, ...updates } : v)));
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-zinc-950 p-4 sm:p-6 overflow-y-auto">
      {/* Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-6 mb-6 border-b border-zinc-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-brand-cyan/10 border border-brand-cyan/30 text-brand-cyan">
              <IconCalendar className="w-5 h-5" />
            </span>
            <h1 className="text-lg font-bold text-white font-mono">
              Protocol Visit Schedule Matrix (Schedule of Assessments)
            </h1>
          </div>
          <p className="text-xs text-zinc-400 font-sans mt-1">
            Map clinical forms to protocol visits, define visit target day offsets, and configure allowable window tolerances (± days).
          </p>
        </div>

        <button
          onClick={handleAddVisit}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-cyan text-black hover:bg-white font-mono text-xs font-bold transition-all shadow-sm"
        >
          <IconPlus className="w-4 h-4" />
          <span>Add Protocol Visit</span>
        </button>
      </div>

      {/* Interactive Matrix Table */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 overflow-x-auto shadow-xl">
        <table className="w-full text-left border-collapse min-w-[700px]">
          <thead>
            <tr className="border-b border-zinc-800 bg-zinc-950/80">
              <th className="p-4 text-xs font-mono font-bold text-zinc-400 w-64 uppercase tracking-wider">
                Protocol Forms ({study.forms.length})
              </th>
              {study.visits.map((visit) => (
                <th
                  key={visit.id}
                  className="p-3 text-center border-l border-zinc-800/80 min-w-[130px]"
                >
                  <div className="space-y-1">
                    <div className="text-xs font-bold font-mono text-white truncate max-w-[140px] mx-auto">
                      {visit.name}
                    </div>
                    <div className="text-[10px] font-mono text-brand-cyan">
                      Day {visit.targetDay} (±{visit.windowBefore}d)
                    </div>
                    <div className="flex items-center justify-center gap-1.5 pt-1">
                      <button
                        onClick={() => setEditingVisitId(editingVisitId === visit.id ? null : visit.id)}
                        className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-zinc-800 hover:bg-zinc-750 text-zinc-300"
                      >
                        {editingVisitId === visit.id ? "Done" : "Edit"}
                      </button>
                      {study.visits.length > 1 && (
                        <button
                          onClick={() => handleDeleteVisit(visit.id)}
                          className="text-[9px] font-mono text-zinc-500 hover:text-red-400 p-0.5"
                          title="Delete Visit"
                        >
                          <IconTrash className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/60 font-mono text-xs">
            {study.forms.map((form) => (
              <tr key={form.id} className="hover:bg-zinc-850/40 transition-colors">
                <td className="p-3.5 pl-4">
                  <div className="flex items-center gap-2">
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-zinc-900 border border-zinc-800 text-brand-cyan">
                      {form.domain}
                    </span>
                    <span className="font-sans font-semibold text-zinc-200 text-xs truncate">
                      {form.name}
                    </span>
                    {form.isLogForm && (
                      <span className="text-[9px] font-mono text-purple-400 bg-purple-500/10 px-1 rounded border border-purple-500/20">
                        LOG
                      </span>
                    )}
                  </div>
                </td>

                {study.visits.map((visit) => {
                  const isAssigned = visit.assignedFormIds.includes(form.id);

                  return (
                    <td
                      key={visit.id}
                      onClick={() => handleToggleFormAtVisit(visit.id, form.id)}
                      className="p-3 text-center border-l border-zinc-800/60 cursor-pointer hover:bg-brand-cyan/5 transition-colors"
                    >
                      <div className="flex items-center justify-center">
                        <div
                          className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-all ${
                            isAssigned
                              ? "bg-brand-cyan border-brand-cyan text-black font-bold shadow-sm"
                              : "bg-zinc-900 border-zinc-800 text-transparent hover:border-zinc-700"
                          }`}
                        >
                          <IconCheck className="w-3.5 h-3.5 stroke-[3]" />
                        </div>
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Selected Visit Quick Configuration Drawer */}
      {editingVisitId && (
        <div className="mt-6 p-4 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-3">
          {(() => {
            const v = study.visits.find((item) => item.id === editingVisitId);
            if (!v) return null;

            return (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-bold text-white font-mono">
                    Configure Visit: {v.name}
                  </div>
                  <button
                    onClick={() => setEditingVisitId(null)}
                    className="text-xs text-brand-cyan font-mono hover:underline"
                  >
                    Done Editing
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
                  <div>
                    <label className="block text-[10px] font-mono text-zinc-400 mb-1">Visit Name</label>
                    <input
                      type="text"
                      value={v.name}
                      onChange={(e) => handleUpdateVisit(v.id, { name: e.target.value })}
                      className="w-full px-2.5 py-1.5 bg-zinc-950 border border-zinc-700 rounded-lg text-white font-sans"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono text-zinc-400 mb-1">Target Day Offset</label>
                    <input
                      type="number"
                      value={v.targetDay}
                      onChange={(e) => handleUpdateVisit(v.id, { targetDay: parseInt(e.target.value, 10) || 0 })}
                      className="w-full px-2.5 py-1.5 bg-zinc-950 border border-zinc-700 rounded-lg text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono text-zinc-400 mb-1">Window Before (- Days)</label>
                    <input
                      type="number"
                      value={v.windowBefore}
                      onChange={(e) => handleUpdateVisit(v.id, { windowBefore: parseInt(e.target.value, 10) || 0 })}
                      className="w-full px-2.5 py-1.5 bg-zinc-950 border border-zinc-700 rounded-lg text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono text-zinc-400 mb-1">Window After (+ Days)</label>
                    <input
                      type="number"
                      value={v.windowAfter}
                      onChange={(e) => handleUpdateVisit(v.id, { windowAfter: parseInt(e.target.value, 10) || 0 })}
                      className="w-full px-2.5 py-1.5 bg-zinc-950 border border-zinc-700 rounded-lg text-white font-mono"
                    />
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
};
