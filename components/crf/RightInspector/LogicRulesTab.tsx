"use client";

import React, { useState } from "react";
import { CRFForm, CRFField, EditCheckRule, AstCondition } from "@/lib/crf/types";
import { IconPlus, IconTrash } from "@tabler/icons-react";

interface LogicRulesTabProps {
  form: CRFForm;
  selectedField: CRFField | null;
  onUpdateRules: (rules: EditCheckRule[]) => void;
}

export const LogicRulesTab: React.FC<LogicRulesTabProps> = ({
  form,
  selectedField,
  onUpdateRules,
}) => {
  const allFields = form.sections.flatMap((s) => s.fields);
  const [editingRuleId, setEditingRuleId] = useState<string | null>(null);

  const handleAddRule = () => {
    const newRule: EditCheckRule = {
      id: `rule_${Date.now()}`,
      name: selectedField ? `Rule for ${selectedField.variableName}` : "New Clinical Edit Check",
      description: "Conditional logic rule",
      triggerFieldIds: selectedField ? [selectedField.id] : allFields[0] ? [allFields[0].id] : [],
      actionType: "raise_query",
      targetFieldId: selectedField ? selectedField.id : allFields[0] ? allFields[0].id : "",
      conditions: [
        {
          fieldId: selectedField ? selectedField.id : allFields[0] ? allFields[0].id : "",
          operator: "gt",
          value: 100,
        },
      ],
      logicalOperator: "AND",
      querySeverity: "warning",
      queryMessage: "Value exceeds protocol threshold. Please confirm.",
    };

    onUpdateRules([...form.rules, newRule]);
    setEditingRuleId(newRule.id);
  };

  const handleDeleteRule = (ruleId: string) => {
    onUpdateRules(form.rules.filter((r) => r.id !== ruleId));
  };

  const handleUpdateRule = (ruleId: string, updates: Partial<EditCheckRule>) => {
    onUpdateRules(
      form.rules.map((r) => (r.id === ruleId ? { ...r, ...updates } : r))
    );
  };

  const handleAddCondition = (rule: EditCheckRule) => {
    const newCond: AstCondition = {
      fieldId: allFields[0] ? allFields[0].id : "",
      operator: "eq",
      value: "",
    };
    handleUpdateRule(rule.id, { conditions: [...rule.conditions, newCond] });
  };

  const handleUpdateCondition = (rule: EditCheckRule, idx: number, updates: Partial<AstCondition>) => {
    const newConds = rule.conditions.map((c, i) => (i === idx ? { ...c, ...updates } : c));
    handleUpdateRule(rule.id, { conditions: newConds });
  };

  const handleDeleteCondition = (rule: EditCheckRule, idx: number) => {
    const newConds = rule.conditions.filter((_, i) => i !== idx);
    handleUpdateRule(rule.id, { conditions: newConds });
  };

  // Filter rules relevant to selected field or show all if none selected
  const relevantRules = selectedField
    ? form.rules.filter(
        (r) => r.targetFieldId === selectedField.id || r.triggerFieldIds.includes(selectedField.id)
      )
    : form.rules;

  return (
    <div className="space-y-4 p-4 text-xs font-sans">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[11px] font-mono uppercase text-zinc-400 font-semibold">
            {selectedField ? `Rules for ${selectedField.variableName}` : "Form Edit Checks"} ({relevantRules.length})
          </span>
        </div>
        <button
          onClick={handleAddRule}
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-brand-cyan/20 hover:bg-brand-cyan text-brand-cyan hover:text-black font-mono text-xs font-bold transition-all"
        >
          <IconPlus className="w-3.5 h-3.5" />
          <span>Add Rule</span>
        </button>
      </div>

      {relevantRules.length === 0 ? (
        <div className="p-6 rounded-xl border border-dashed border-zinc-800 text-center space-y-2">
          <p className="text-zinc-400 font-mono text-xs">No active edit checks or logic rules.</p>
          <p className="text-[11px] text-zinc-500">
            Create conditional show/hide branching, cross-field validation range checks, or automated discrepancy queries.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {relevantRules.map((rule) => {
            const isEditing = editingRuleId === rule.id;

            return (
              <div
                key={rule.id}
                className="p-3.5 rounded-xl bg-zinc-950/70 border border-zinc-800 space-y-3"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="space-y-0.5 min-w-0">
                    <div className="text-xs font-bold text-white font-mono truncate">
                      {rule.name}
                    </div>
                    <div className="flex items-center gap-2 text-[10px] font-mono text-zinc-400">
                      <span className="px-1.5 py-0.2 rounded bg-zinc-900 border border-zinc-800 text-brand-cyan">
                        {rule.actionType}
                      </span>
                      <span>Target: {allFields.find((f) => f.id === rule.targetFieldId)?.variableName || rule.targetFieldId}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setEditingRuleId(isEditing ? null : rule.id)}
                      className="px-2 py-0.5 rounded bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-mono text-[11px]"
                    >
                      {isEditing ? "Close" : "Configure"}
                    </button>
                    <button
                      onClick={() => handleDeleteRule(rule.id)}
                      className="p-1 text-zinc-500 hover:text-red-400 transition-colors"
                      title="Delete Rule"
                    >
                      <IconTrash className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {isEditing && (
                  <div className="pt-3 border-t border-zinc-850 space-y-3">
                    <div>
                      <label className="block text-[10px] font-mono text-zinc-500 mb-1">Rule Name</label>
                      <input
                        type="text"
                        value={rule.name}
                        onChange={(e) => handleUpdateRule(rule.id, { name: e.target.value })}
                        className="w-full px-2.5 py-1 bg-zinc-900 border border-zinc-800 rounded text-xs text-white"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] font-mono text-zinc-500 mb-1">Action Type</label>
                        <select
                          value={rule.actionType}
                          onChange={(e) =>
                            handleUpdateRule(rule.id, { actionType: e.target.value as EditCheckRule["actionType"] })
                          }
                          className="w-full px-2 py-1 bg-zinc-900 border border-zinc-800 rounded text-xs text-white"
                        >
                          <option value="show_field">Show Field</option>
                          <option value="hide_field">Hide Field</option>
                          <option value="require_field">Make Field Mandatory</option>
                          <option value="raise_query">Raise EDC Discrepancy Query</option>
                          <option value="set_value">Set Derived Value (Formula)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] font-mono text-zinc-500 mb-1">Target Field</label>
                        <select
                          value={rule.targetFieldId}
                          onChange={(e) => handleUpdateRule(rule.id, { targetFieldId: e.target.value })}
                          className="w-full px-2 py-1 bg-zinc-900 border border-zinc-800 rounded text-xs text-white"
                        >
                          {allFields.map((f) => (
                            <option key={f.id} value={f.id}>
                              {f.variableName} ({f.label.slice(0, 20)}...)
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Conditions */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono text-zinc-400 font-semibold uppercase">
                          Conditions ({rule.logicalOperator})
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() =>
                              handleUpdateRule(rule.id, {
                                logicalOperator: rule.logicalOperator === "AND" ? "OR" : "AND",
                              })
                            }
                            className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-zinc-900 border border-zinc-800 text-brand-cyan"
                          >
                            Toggle {rule.logicalOperator === "AND" ? "OR" : "AND"}
                          </button>
                          <button
                            onClick={() => handleAddCondition(rule)}
                            className="text-[10px] font-mono text-brand-cyan hover:underline"
                          >
                            + Condition
                          </button>
                        </div>
                      </div>

                      {rule.conditions.map((cond, cIdx) => (
                        <div key={cIdx} className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 space-y-1.5">
                          <div className="flex items-center gap-1.5">
                            <select
                              value={cond.fieldId}
                              onChange={(e) => handleUpdateCondition(rule, cIdx, { fieldId: e.target.value })}
                              className="flex-1 px-1.5 py-1 bg-zinc-950 border border-zinc-800 rounded text-[11px] text-white font-mono"
                            >
                              {allFields.map((f) => (
                                <option key={f.id} value={f.id}>
                                  {f.variableName}
                                </option>
                              ))}
                            </select>

                            <select
                              value={cond.operator}
                              onChange={(e) =>
                                handleUpdateCondition(rule, cIdx, {
                                  operator: e.target.value as AstCondition["operator"],
                                })
                              }
                              className="w-24 px-1.5 py-1 bg-zinc-950 border border-zinc-800 rounded text-[11px] text-white font-mono"
                            >
                              <option value="eq">== (Equals)</option>
                              <option value="neq">!= (Not Equals)</option>
                              <option value="gt">&gt; (Greater)</option>
                              <option value="gte">&gt;= (Greater/Eq)</option>
                              <option value="lt">&lt; (Less)</option>
                              <option value="lte">&lt;= (Less/Eq)</option>
                              <option value="is_empty">Is Empty</option>
                              <option value="is_not_empty">Is Not Empty</option>
                            </select>

                            {cond.operator !== "is_empty" && cond.operator !== "is_not_empty" && (
                              <input
                                type="text"
                                value={String(cond.value)}
                                onChange={(e) => handleUpdateCondition(rule, cIdx, { value: e.target.value })}
                                className="w-20 px-1.5 py-1 bg-zinc-950 border border-zinc-800 rounded text-[11px] text-white font-mono"
                                placeholder="Value"
                              />
                            )}

                            {rule.conditions.length > 1 && (
                              <button
                                onClick={() => handleDeleteCondition(rule, cIdx)}
                                className="p-1 text-zinc-500 hover:text-red-400"
                              >
                                <IconTrash className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Query Message if Action is raise_query */}
                    {rule.actionType === "raise_query" && (
                      <div className="space-y-2 pt-1 border-t border-zinc-850">
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-[10px] font-mono text-zinc-500 mb-1">
                              Query Severity
                            </label>
                            <select
                              value={rule.querySeverity || "warning"}
                              onChange={(e) =>
                                handleUpdateRule(rule.id, {
                                  querySeverity: e.target.value as EditCheckRule["querySeverity"],
                                })
                              }
                              className="w-full px-2 py-1 bg-zinc-900 border border-zinc-800 rounded text-xs text-white"
                            >
                              <option value="info">Info / Notice</option>
                              <option value="warning">Warning (Requires Explanation)</option>
                              <option value="error">Hard Error (Blocks Submission)</option>
                            </select>
                          </div>
                        </div>

                        <div>
                          <label className="block text-[10px] font-mono text-zinc-500 mb-1">
                            Query Text (Discrepancy message shown to site)
                          </label>
                          <textarea
                            rows={2}
                            value={rule.queryMessage || ""}
                            onChange={(e) => handleUpdateRule(rule.id, { queryMessage: e.target.value })}
                            className="w-full px-2.5 py-1.5 bg-zinc-900 border border-zinc-800 rounded text-xs text-zinc-200 resize-none font-sans"
                            placeholder="e.g. Diastolic Blood Pressure exceeds systolic threshold."
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
