"use client";

import React from "react";
import { ASTNode } from "@/lib/quasi-perfect/types";
import { renderASTString } from "@/lib/quasi-perfect/engine";
import { ASTNodeView } from "./ASTNodeView";

interface ExpressionTreeProps {
  goalAST: ASTNode;
  hypotheses: ASTNode[];
  selectedTargetId: string | null;
  hoveredTargetId: string | null;
  onSelectTarget: (nodeId: string) => void;
  onHoverTarget: (nodeId: string | null) => void;
  isProofComplete?: boolean;
}

export const ExpressionTree: React.FC<ExpressionTreeProps> = ({
  goalAST,
  hypotheses,
  selectedTargetId,
  hoveredTargetId,
  onSelectTarget,
  onHoverTarget,
  isProofComplete = false,
}) => {
  const mathematicalNotation = renderASTString(goalAST);

  return (
    <div className="w-full flex flex-col gap-4">
      {/* 1. Hypotheses Panel (Lean Proof Context) */}
      {hypotheses.length > 0 && (
        <div className="rounded-xl border border-zinc-800/80 bg-zinc-950/60 p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
              Active Hypotheses Context (Γ)
            </span>
            <span className="text-[10px] text-zinc-500 font-mono">
              {hypotheses.length} in context
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            {hypotheses.map((hyp) => {
              const hypName = (hyp.metadata?.name as string) || "h";
              const hypFormula = renderASTString(hyp);
              return (
                <div
                  key={hyp.id}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-purple-500/30 bg-purple-950/20 px-2.5 py-1 text-xs font-mono text-purple-200"
                >
                  <span className="font-bold text-purple-400">{hypName}:</span>
                  <span>{hypFormula}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 2. Main Goal Tree Container */}
      <div className="relative flex flex-col items-center justify-center rounded-2xl border border-zinc-800 bg-zinc-950/90 p-6 min-h-[220px] overflow-x-auto">
        {/* Goal Formula Banner */}
        <div className="w-full flex items-center justify-between border-b border-zinc-800/70 pb-3 mb-6">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-brand-cyan tracking-wider font-mono">
              GOAL ⊢
            </span>
            <span className="text-sm font-semibold font-mono text-zinc-200">
              {isProofComplete ? "Q.E.D. (Proof Complete)" : mathematicalNotation}
            </span>
          </div>

          <div className="text-[10px] text-zinc-500 font-mono">
            {isProofComplete ? (
              <span className="text-emerald-400 font-bold">✔ Closed</span>
            ) : (
              <span>Target: {selectedTargetId ? `node #${selectedTargetId}` : "Root Goal"}</span>
            )}
          </div>
        </div>

        {/* The Node Graph Tree */}
        <div className="w-full flex items-center justify-center py-2">
          <ASTNodeView
            node={goalAST}
            isRoot={true}
            selectedTargetId={selectedTargetId}
            hoveredTargetId={hoveredTargetId}
            onSelectTarget={onSelectTarget}
            onHoverTarget={onHoverTarget}
            isInteractive={!isProofComplete}
          />
        </div>

        {/* Tree Instructions Footer */}
        {!isProofComplete && (
          <div className="mt-4 text-center">
            <p className="text-[11px] text-zinc-500 font-mono">
              {selectedTargetId ? (
                <span className="text-brand-cyan">
                  Node selected! Tap or drop a tactic card to execute.
                </span>
              ) : (
                <span>
                  Drag a tactic card onto any target node, or tap a node then tap a card.
                </span>
              )}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
