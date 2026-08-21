"use client";

import React, { useState, useEffect, useRef, useId } from "react";
import {
  IconSearch,
  IconSparkles,
  IconComponents,
  IconFolderPlus,
  IconX,
  IconHeartRateMonitor,
  IconPill,
  IconAlertTriangle,
  IconUserCheck,
  IconTestPipe,
  IconMoodSmile,
  IconActivity,
  IconTarget,
  IconForms,
  IconCalendar,
  IconSignature,
  IconMathFunction,
  IconClock,
  IconList,
  IconCheck,
} from "@tabler/icons-react";
import {
  searchSlashCommands,
  SlashCommandItem,
  ClinicalSmartBlockDefinition,
  instantiateSmartBlock,
  instantiateAtomicField,
} from "@/lib/crf/smart-blocks-engine";
import { CRFSection, CRFField, EditCheckRule } from "@/lib/crf/types";

export interface SlashCommandMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onInsertSmartBlock: (block: { section: CRFSection; rules: EditCheckRule[] }) => void;
  onInsertField: (field: CRFField, targetSectionId?: string, targetIndex?: number) => void;
  onInsertSection: () => void;
  targetSectionId?: string;
  targetIndex?: number;
  initialQuery?: string;
}

export const SlashCommandMenu: React.FC<SlashCommandMenuProps> = ({
  isOpen,
  onClose,
  onInsertSmartBlock,
  onInsertField,
  onInsertSection,
  targetSectionId,
  targetIndex,
  initialQuery = "",
}) => {
  const [query, setQuery] = useState(initialQuery);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const menuId = useId();

  const filteredCommands = searchSlashCommands(query);

  useEffect(() => {
    if (isOpen) {
      setQuery(initialQuery);
      setSelectedIndex(0);
      setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      }, 50);
    }
  }, [isOpen, initialQuery]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Keep selected item visible during arrow navigation
  useEffect(() => {
    if (listRef.current) {
      const selectedEl = listRef.current.querySelector<HTMLElement>(`[data-index="${selectedIndex}"]`);
      if (selectedEl) {
        selectedEl.scrollIntoView({ block: "nearest" });
      }
    }
  }, [selectedIndex]);

  if (!isOpen) return null;

  const handleSelect = (item: SlashCommandItem) => {
    if (item.action === "insert_smart_block" && item.smartBlockId) {
      const result = instantiateSmartBlock(item.smartBlockId);
      onInsertSmartBlock(result);
    } else if (item.action === "insert_field") {
      const newField = instantiateAtomicField(item.id);
      onInsertField(newField, targetSectionId, targetIndex);
    } else if (item.action === "insert_section") {
      onInsertSection();
    }
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (filteredCommands.length > 0 ? (prev + 1) % filteredCommands.length : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (filteredCommands.length > 0 ? (prev - 1 + filteredCommands.length) % filteredCommands.length : 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const current = filteredCommands[selectedIndex];
      if (current) {
        handleSelect(current);
      }
    } else if (e.key === "Escape") {
      e.preventDefault();
      onClose();
    }
  };

  const renderIcon = (item: SlashCommandItem) => {
    if (item.category === "smart_block") {
      switch (item.smartBlockId) {
        case "vitals":
          return <IconHeartRateMonitor className="w-4 h-4 text-emerald-400" />;
        case "recist":
          return <IconTarget className="w-4 h-4 text-brand-cyan" />;
        case "conmeds":
          return <IconPill className="w-4 h-4 text-amber-400" />;
        case "ae":
          return <IconAlertTriangle className="w-4 h-4 text-red-400" />;
        case "demographics":
          return <IconUserCheck className="w-4 h-4 text-indigo-400" />;
        case "labs":
          return <IconTestPipe className="w-4 h-4 text-blue-400" />;
        case "pro":
          return <IconMoodSmile className="w-4 h-4 text-purple-400" />;
        case "ecg":
          return <IconActivity className="w-4 h-4 text-pink-400" />;
        default:
          return <IconSparkles className="w-4 h-4 text-brand-cyan" />;
      }
    }

    if (item.category === "layout") {
      return <IconFolderPlus className="w-4 h-4 text-brand-cyan" />;
    }

    switch (item.id) {
      case "date":
      case "datetime":
        return <IconCalendar className="w-4 h-4 text-emerald-400" />;
      case "time":
        return <IconClock className="w-4 h-4 text-blue-400" />;
      case "calc":
        return <IconMathFunction className="w-4 h-4 text-brand-cyan" />;
      case "signature":
        return <IconSignature className="w-4 h-4 text-purple-400" />;
      case "radio":
      case "select":
      case "multiselect":
        return <IconList className="w-4 h-4 text-amber-400" />;
      default:
        return <IconForms className="w-4 h-4 text-zinc-400" />;
    }
  };

  const smartBlocks = filteredCommands.filter((c) => c.category === "smart_block");
  const widgets = filteredCommands.filter((c) => c.category === "widget");
  const layouts = filteredCommands.filter((c) => c.category === "layout");

  let globalIndexCounter = 0;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={`${menuId}-title`}
      className="fixed inset-0 z-50 flex items-start justify-center pt-24 sm:pt-32 px-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg rounded-2xl bg-zinc-950 border border-zinc-800 shadow-2xl overflow-hidden flex flex-col max-h-[75vh] animate-in zoom-in-95 duration-150"
      >
        {/* Search Header */}
        <div className="flex items-center gap-2.5 px-3.5 py-3 border-b border-zinc-800/80 bg-zinc-900/60">
          <IconSearch className="w-4 h-4 text-zinc-400 shrink-0" />
          <input
            ref={inputRef}
            id={`${menuId}-input`}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a command or block (e.g. /vitals, /date, /recist)..."
            className="flex-1 bg-transparent text-sm text-white placeholder-zinc-500 focus:outline-none font-mono"
            role="combobox"
            aria-expanded="true"
            aria-controls={`${menuId}-list`}
            aria-autocomplete="list"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="p-1 rounded hover:bg-zinc-800 text-zinc-400 hover:text-white"
              title="Clear search"
            >
              <IconX className="w-3.5 h-3.5" />
            </button>
          )}
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-zinc-700">
            ESC
          </span>
        </div>

        {/* Results List */}
        <div
          ref={listRef}
          id={`${menuId}-list`}
          role="listbox"
          className="flex-1 overflow-y-auto p-2 space-y-3"
        >
          {filteredCommands.length === 0 ? (
            <div className="py-8 text-center text-zinc-500 font-mono text-xs">
              No matching clinical blocks or widgets for &quot;{query}&quot;
            </div>
          ) : (
            <>
              {/* Group 1: Clinical Smart Blocks */}
              {smartBlocks.length > 0 && (
                <div className="space-y-1">
                  <div className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 font-semibold px-2 py-1 flex items-center gap-1.5">
                    <IconSparkles className="w-3 h-3 text-brand-cyan" />
                    <span>Clinical Smart Blocks</span>
                  </div>
                  {smartBlocks.map((item) => {
                    const currentIndex = globalIndexCounter++;
                    const isSelected = currentIndex === selectedIndex;
                    return (
                      <div
                        key={item.id}
                        data-index={currentIndex}
                        role="option"
                        aria-selected={isSelected}
                        onClick={() => handleSelect(item)}
                        onMouseEnter={() => setSelectedIndex(currentIndex)}
                        className={`flex items-start gap-3 p-2.5 rounded-xl cursor-pointer transition-all border ${
                          isSelected
                            ? "bg-zinc-900 border-brand-cyan/40 shadow-sm"
                            : "bg-zinc-950/40 border-transparent hover:bg-zinc-900/60"
                        }`}
                      >
                        <div className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 shrink-0 mt-0.5">
                          {renderIcon(item)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs font-bold text-white font-mono flex items-center gap-2 truncate">
                              <span>{item.title}</span>
                              <span className="text-[10px] text-brand-cyan bg-brand-cyan/10 px-1.5 py-0.2 rounded border border-brand-cyan/20">
                                {item.command}
                              </span>
                            </span>
                            {item.badge && (
                              <span className="text-[9px] font-mono text-zinc-400 bg-zinc-900 px-1.5 py-0.5 rounded border border-zinc-800 shrink-0">
                                {item.badge}
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-zinc-400 mt-0.5 leading-snug font-sans">
                            {item.description}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Group 2: Form Field Widgets */}
              {widgets.length > 0 && (
                <div className="space-y-1">
                  <div className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 font-semibold px-2 py-1 flex items-center gap-1.5">
                    <IconComponents className="w-3 h-3 text-zinc-400" />
                    <span>Clinical Form Fields</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                    {widgets.map((item) => {
                      const currentIndex = globalIndexCounter++;
                      const isSelected = currentIndex === selectedIndex;
                      return (
                        <div
                          key={item.id}
                          data-index={currentIndex}
                          role="option"
                          aria-selected={isSelected}
                          onClick={() => handleSelect(item)}
                          onMouseEnter={() => setSelectedIndex(currentIndex)}
                          className={`flex items-center gap-2.5 p-2 rounded-xl cursor-pointer transition-all border ${
                            isSelected
                              ? "bg-zinc-900 border-brand-cyan/40 shadow-sm"
                              : "bg-zinc-950/40 border-transparent hover:bg-zinc-900/60"
                          }`}
                        >
                          <div className="p-1.5 rounded-lg bg-zinc-900 border border-zinc-800 shrink-0">
                            {renderIcon(item)}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-1">
                              <span className="text-xs font-medium text-zinc-200 truncate">
                                {item.title}
                              </span>
                              <span className="text-[9px] font-mono text-zinc-500">
                                {item.command}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Group 3: Layout Containers */}
              {layouts.length > 0 && (
                <div className="space-y-1">
                  <div className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 font-semibold px-2 py-1 flex items-center gap-1.5">
                    <IconFolderPlus className="w-3 h-3 text-zinc-400" />
                    <span>Layout & Structure</span>
                  </div>
                  {layouts.map((item) => {
                    const currentIndex = globalIndexCounter++;
                    const isSelected = currentIndex === selectedIndex;
                    return (
                      <div
                        key={item.id}
                        data-index={currentIndex}
                        role="option"
                        aria-selected={isSelected}
                        onClick={() => handleSelect(item)}
                        onMouseEnter={() => setSelectedIndex(currentIndex)}
                        className={`flex items-center gap-2.5 p-2.5 rounded-xl cursor-pointer transition-all border ${
                          isSelected
                            ? "bg-zinc-900 border-brand-cyan/40 shadow-sm"
                            : "bg-zinc-950/40 border-transparent hover:bg-zinc-900/60"
                        }`}
                      >
                        <div className="p-1.5 rounded-lg bg-zinc-900 border border-zinc-800 shrink-0">
                          {renderIcon(item)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-1">
                            <span className="text-xs font-bold text-white font-mono">
                              {item.title}
                            </span>
                            <span className="text-[9px] font-mono text-brand-cyan">
                              {item.command}
                            </span>
                          </div>
                          <p className="text-[11px] text-zinc-400 leading-snug mt-0.5">
                            {item.description}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer Shortcut Bar */}
        <div className="px-3.5 py-2 border-t border-zinc-800/80 bg-zinc-900/40 flex items-center justify-between text-[11px] font-mono text-zinc-500">
          <div className="flex items-center gap-3">
            <span>↑↓ Navigate</span>
            <span>↵ Select</span>
            <span>ESC Close</span>
          </div>
          <span className="text-[10px] text-brand-cyan">Clinical Smart Blocks v2.0</span>
        </div>
      </div>
    </div>
  );
};
