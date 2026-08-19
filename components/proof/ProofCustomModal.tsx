"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { IconPlus, IconX } from "@tabler/icons-react";

interface ProofCustomModalProps {
  isOpen: boolean;
  onClose: () => void;
  customPremise1: string;
  customPremise2: string;
  customPremise3: string;
  customGoal: string;
  setCustomPremise1: (val: string) => void;
  setCustomPremise2: (val: string) => void;
  setCustomPremise3: (val: string) => void;
  setCustomGoal: (val: string) => void;
  onLoadIntoWorkspace: () => void;
}

export const ProofCustomModal: React.FC<ProofCustomModalProps> = ({
  isOpen,
  onClose,
  customPremise1,
  customPremise2,
  customPremise3,
  customGoal,
  setCustomPremise1,
  setCustomPremise2,
  setCustomPremise3,
  setCustomGoal,
  onLoadIntoWorkspace,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-900 p-6 flex flex-col gap-4 shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <IconPlus className="w-5 h-5 text-brand-purple" />
                Custom Invariant Studio
              </h3>
              <button
                onClick={onClose}
                aria-label="Close Custom Studio Modal"
                className="p-1 rounded text-slate-400 hover:text-white cursor-pointer"
              >
                <IconX className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 font-mono mb-1">Premise 1 Formula:</label>
                <input
                  type="text"
                  value={customPremise1}
                  onChange={(e) => setCustomPremise1(e.target.value)}
                  className="w-full rounded-lg bg-slate-950 border border-slate-800 px-3 py-2 font-mono text-white focus:outline-none focus:border-brand-cyan"
                />
              </div>
              <div>
                <label className="block text-slate-400 font-mono mb-1">Premise 2 Formula:</label>
                <input
                  type="text"
                  value={customPremise2}
                  onChange={(e) => setCustomPremise2(e.target.value)}
                  className="w-full rounded-lg bg-slate-950 border border-slate-800 px-3 py-2 font-mono text-white focus:outline-none focus:border-brand-cyan"
                />
              </div>
              <div>
                <label className="block text-slate-400 font-mono mb-1">Premise 3 Formula:</label>
                <input
                  type="text"
                  value={customPremise3}
                  onChange={(e) => setCustomPremise3(e.target.value)}
                  className="w-full rounded-lg bg-slate-950 border border-slate-800 px-3 py-2 font-mono text-white focus:outline-none focus:border-brand-cyan"
                />
              </div>
              <div>
                <label className="block text-slate-400 font-mono mb-1">Target Invariant Goal:</label>
                <input
                  type="text"
                  value={customGoal}
                  onChange={(e) => setCustomGoal(e.target.value)}
                  className="w-full rounded-lg bg-slate-950 border border-slate-800 px-3 py-2 font-mono text-white focus:outline-none focus:border-brand-cyan"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={onLoadIntoWorkspace}
                className="px-4 py-2 rounded-xl bg-brand-cyan hover:bg-cyan-400 text-slate-950 font-bold text-xs transition cursor-pointer active:scale-[0.98]"
              >
                Load into Workspace
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
