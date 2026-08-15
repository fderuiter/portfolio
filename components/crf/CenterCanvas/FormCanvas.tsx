"use client";

import React, { useState } from "react";
import {
  IconFolderPlus,
  IconTrash,
  IconPlus,
  IconEdit,
  IconCheck,
  IconArrowUp,
  IconArrowDown,
} from "@tabler/icons-react";
import { CRFForm, CRFField, CodelistDefinition, DeviceViewport } from "@/lib/crf/types";
import { FieldRenderer } from "./FieldRenderer";
import { ViewportSwitcher } from "./ViewportSwitcher";

interface FormCanvasProps {
  form: CRFForm;
  selectedFieldId: string | null;
  viewport: DeviceViewport;
  codelists: CodelistDefinition[];
  onChangeViewport: (vp: DeviceViewport) => void;
  onSelectField: (fieldId: string | null) => void;
  onUpdateFormMeta: (updates: Partial<CRFForm>) => void;
  onAddSection: () => void;
  onDeleteSection: (sectionId: string) => void;
  onUpdateSectionTitle: (sectionId: string, title: string) => void;
  onDuplicateField: (sectionId: string, fieldId: string) => void;
  onDeleteField: (sectionId: string, fieldId: string) => void;
  onUpdateField?: (fieldId: string, updates: Partial<CRFField>) => void;
  onOpenPalette: () => void;
}

export const FormCanvas: React.FC<FormCanvasProps> = ({
  form,
  selectedFieldId,
  viewport,
  codelists,
  onChangeViewport,
  onSelectField,
  onUpdateFormMeta,
  onAddSection,
  onDeleteSection,
  onUpdateSectionTitle,
  onDuplicateField,
  onDeleteField,
  onUpdateField,
  onOpenPalette,
}) => {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleInput, setTitleInput] = useState(form.name);
  const [descInput, setDescInput] = useState(form.description);
  const [domainInput, setDomainInput] = useState(form.domain);

  const [editingSectionId, setEditingSectionId] = useState<string | null>(null);
  const [sectionTitleInput, setSectionTitleInput] = useState("");

  // Drag and drop tracking state
  const [draggedFieldInfo, setDraggedFieldInfo] = useState<{
    sectionId: string;
    fieldId: string;
  } | null>(null);
  const [dropTargetInfo, setDropTargetInfo] = useState<{
    sectionId: string;
    targetIndex: number;
  } | null>(null);

  const handleSaveTitle = () => {
    onUpdateFormMeta({
      name: titleInput,
      description: descInput,
      domain: domainInput.toUpperCase(),
    });
    setIsEditingTitle(false);
  };

  // Section reordering
  const handleMoveSection = (sectionIndex: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? sectionIndex - 1 : sectionIndex + 1;
    if (targetIndex < 0 || targetIndex >= form.sections.length) return;

    const newSections = [...form.sections];
    const [moved] = newSections.splice(sectionIndex, 1);
    newSections.splice(targetIndex, 0, moved);
    onUpdateFormMeta({ sections: newSections });
  };

  // Drag & drop field reordering
  const handleFieldDragStart = (e: React.DragEvent, sectionId: string, fieldId: string) => {
    e.stopPropagation();
    setDraggedFieldInfo({ sectionId, fieldId });
    e.dataTransfer.setData("text/plain", JSON.stringify({ sectionId, fieldId }));
  };

  const handleFieldDragOver = (e: React.DragEvent, sectionId: string, targetIndex: number) => {
    e.preventDefault();
    e.stopPropagation();
    setDropTargetInfo({ sectionId, targetIndex });
  };

  const handleFieldDrop = (e: React.DragEvent, targetSectionId: string, targetIndex: number) => {
    e.preventDefault();
    e.stopPropagation();

    if (!draggedFieldInfo) {
      setDropTargetInfo(null);
      return;
    }

    const { sectionId: sourceSectionId, fieldId: sourceFieldId } = draggedFieldInfo;

    // Find source field
    const sourceSec = form.sections.find((s) => s.id === sourceSectionId);
    const draggedField = sourceSec?.fields.find((f) => f.id === sourceFieldId);

    if (!draggedField) {
      setDraggedFieldInfo(null);
      setDropTargetInfo(null);
      return;
    }

    const updatedSections = form.sections.map((section) => {
      let fields = [...section.fields];

      // Remove from source
      if (section.id === sourceSectionId) {
        fields = fields.filter((f) => f.id !== sourceFieldId);
      }

      // Insert into target
      if (section.id === targetSectionId) {
        const adjustedIndex =
          section.id === sourceSectionId &&
          sourceSec &&
          sourceSec.fields.findIndex((f) => f.id === sourceFieldId) < targetIndex
            ? Math.max(0, targetIndex - 1)
            : targetIndex;

        fields.splice(adjustedIndex, 0, draggedField);
      }

      return { ...section, fields };
    });

    onUpdateFormMeta({ sections: updatedSections });
    setDraggedFieldInfo(null);
    setDropTargetInfo(null);
  };

  // Viewport container width constraints
  const viewportWidthClass = {
    desktop: "w-full max-w-5xl",
    tablet: "w-full max-w-2xl",
    mobile: "w-full max-w-sm",
  }[viewport];

  return (
    <div
      onClick={() => onSelectField(null)}
      className="flex-1 flex flex-col h-full bg-zinc-950/80 overflow-y-auto p-4 sm:p-6 transition-all"
    >
      {/* Top Canvas Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6 pb-4 border-b border-zinc-800/80">
        <div className="flex items-center gap-3">
          <span className="font-mono text-xs font-bold text-zinc-400">
            Form Layout Canvas
          </span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-900 text-brand-cyan border border-zinc-800">
            12-Column Drag &amp; Drop Grid
          </span>
        </div>

        <div className="flex items-center gap-3">
          <ViewportSwitcher
            viewport={viewport}
            onChangeViewport={onChangeViewport}
            gridCols={12}
          />
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAddSection();
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-850 hover:bg-zinc-800 border border-zinc-700/80 text-zinc-200 text-xs font-mono transition-all shadow-sm"
          >
            <IconFolderPlus className="w-4 h-4 text-brand-cyan" />
            <span>Add Section</span>
          </button>
        </div>
      </div>

      {/* Main Canvas Scroll Area with Centered Viewport */}
      <div className="flex-1 flex justify-center pb-24">
        <div className={`${viewportWidthClass} transition-all duration-300 space-y-6`}>
          {/* Form Header Card */}
          <div className="p-5 rounded-2xl bg-zinc-900/70 border border-zinc-800/80 shadow-lg relative group">
            {isEditingTitle ? (
              <div className="space-y-3" onClick={(e) => e.stopPropagation()}>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div className="sm:col-span-3">
                    <label className="block text-[11px] font-mono text-zinc-400 mb-1">
                      Form Display Name
                    </label>
                    <input
                      type="text"
                      value={titleInput}
                      onChange={(e) => setTitleInput(e.target.value)}
                      className="w-full px-3 py-1.5 bg-zinc-950 border border-zinc-700 rounded-lg text-sm text-white font-sans"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-mono text-zinc-400 mb-1">
                      CDASH Domain
                    </label>
                    <input
                      type="text"
                      value={domainInput}
                      onChange={(e) => setDomainInput(e.target.value)}
                      className="w-full px-3 py-1.5 bg-zinc-950 border border-zinc-700 rounded-lg text-sm text-white font-mono uppercase"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-zinc-400 mb-1">
                    Form Description &amp; Scope
                  </label>
                  <textarea
                    rows={2}
                    value={descInput}
                    onChange={(e) => setDescInput(e.target.value)}
                    className="w-full px-3 py-1.5 bg-zinc-950 border border-zinc-700 rounded-lg text-xs text-zinc-300 font-sans resize-none"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-1">
                  <button
                    onClick={() => setIsEditingTitle(false)}
                    className="px-3 py-1 text-xs font-mono rounded bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveTitle}
                    className="inline-flex items-center gap-1 px-3 py-1 text-xs font-mono font-bold rounded bg-brand-cyan text-black hover:bg-white transition-all"
                  >
                    <IconCheck className="w-3.5 h-3.5" />
                    <span>Save Form Details</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2.5">
                    <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-brand-cyan/15 text-brand-cyan border border-brand-cyan/30">
                      {form.domain || "CRF"}
                    </span>
                    <h1 className="text-lg sm:text-xl font-extrabold text-white font-mono">
                      {form.name}
                    </h1>
                    {form.isLogForm && (
                      <span className="text-[10px] font-mono text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">
                        Log Form
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-zinc-400 font-sans leading-relaxed max-w-2xl">
                    {form.description || "No description provided."}
                  </p>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setTitleInput(form.name);
                    setDescInput(form.description);
                    setDomainInput(form.domain);
                    setIsEditingTitle(true);
                  }}
                  className="p-1.5 rounded-lg bg-zinc-800/80 hover:bg-zinc-700 text-zinc-400 hover:text-white border border-zinc-700/60 transition-all opacity-0 group-hover:opacity-100"
                  title="Edit Form Properties"
                >
                  <IconEdit className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Form Sections */}
          {form.sections.map((section, sIdx) => {
            const isEditingSec = editingSectionId === section.id;

            return (
              <div
                key={section.id}
                onDragOver={(e) => handleFieldDragOver(e, section.id, section.fields.length)}
                onDrop={(e) => handleFieldDrop(e, section.id, section.fields.length)}
                className="p-4 sm:p-5 rounded-2xl bg-zinc-900/40 border border-zinc-800/80 space-y-4"
              >
                {/* Section Header */}
                <div className="flex items-center justify-between border-b border-zinc-800/60 pb-3">
                  {isEditingSec ? (
                    <div className="flex items-center gap-2 flex-1 max-w-md" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="text"
                        value={sectionTitleInput}
                        onChange={(e) => setSectionTitleInput(e.target.value)}
                        className="w-full px-2.5 py-1 bg-zinc-950 border border-zinc-700 rounded-md text-xs text-white"
                        autoFocus
                      />
                      <button
                        onClick={() => {
                          onUpdateSectionTitle(section.id, sectionTitleInput);
                          setEditingSectionId(null);
                        }}
                        className="p-1 rounded bg-brand-cyan text-black"
                      >
                        <IconCheck className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-zinc-400">
                        §{sIdx + 1}.
                      </span>
                      <h2 className="text-sm font-bold text-zinc-100 font-mono">
                        {section.title}
                      </h2>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingSectionId(section.id);
                          setSectionTitleInput(section.title);
                        }}
                        className="p-1 text-zinc-500 hover:text-zinc-300 transition-colors"
                        title="Rename Section"
                      >
                        <IconEdit className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}

                  <div className="flex items-center gap-1.5">
                    {/* Section Move Up / Down Buttons */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMoveSection(sIdx, "up");
                      }}
                      disabled={sIdx === 0}
                      className="p-1 rounded hover:bg-zinc-800 text-zinc-500 hover:text-white disabled:opacity-25"
                      title="Move Section Up"
                    >
                      <IconArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMoveSection(sIdx, "down");
                      }}
                      disabled={sIdx === form.sections.length - 1}
                      className="p-1 rounded hover:bg-zinc-800 text-zinc-500 hover:text-white disabled:opacity-25"
                      title="Move Section Down"
                    >
                      <IconArrowDown className="w-3.5 h-3.5" />
                    </button>

                    <span className="text-[10px] font-mono text-zinc-500 ml-2">
                      {section.fields.length} {section.fields.length === 1 ? "field" : "fields"}
                    </span>
                    {form.sections.length > 1 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteSection(section.id);
                        }}
                        className="p-1 text-zinc-500 hover:text-red-400 transition-colors ml-1"
                        title="Delete Section"
                      >
                        <IconTrash className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* 12-Column Responsive Grid */}
                {section.fields.length === 0 ? (
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenPalette();
                    }}
                    className="p-8 border-2 border-dashed border-zinc-800 hover:border-brand-cyan/40 rounded-xl text-center cursor-pointer transition-all bg-zinc-950/30 group"
                  >
                    <IconPlus className="w-6 h-6 text-zinc-600 group-hover:text-brand-cyan mx-auto mb-2 transition-colors" />
                    <p className="text-xs text-zinc-400 font-mono">
                      No fields in this section yet.
                    </p>
                    <p className="text-[11px] text-zinc-500 mt-1">
                      Click to choose a widget from the palette or drag and drop items here.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-12 gap-3 sm:gap-4">
                    {section.fields.map((field, fIdx) => (
                      <React.Fragment key={field.id}>
                        {/* Drop indicator line if dragging over this position */}
                        {dropTargetInfo?.sectionId === section.id &&
                          dropTargetInfo?.targetIndex === fIdx &&
                          draggedFieldInfo?.fieldId !== field.id && (
                            <div className="col-span-12 h-1 bg-brand-cyan rounded-full animate-pulse my-1" />
                          )}

                        <FieldRenderer
                          field={field}
                          isSelected={field.id === selectedFieldId}
                          codelists={codelists}
                          onSelect={() => onSelectField(field.id)}
                          onDuplicate={() => onDuplicateField(section.id, field.id)}
                          onDelete={() => onDeleteField(section.id, field.id)}
                          onUpdateField={(updates) => {
                            if (onUpdateField) {
                              onUpdateField(field.id, updates);
                            }
                          }}
                          onDragStart={(e) => handleFieldDragStart(e, section.id, field.id)}
                          onDragOver={(e) => handleFieldDragOver(e, section.id, fIdx)}
                          onDrop={(e) => handleFieldDrop(e, section.id, fIdx)}
                        />
                      </React.Fragment>
                    ))}
                  </div>
                )}
              </div>
            );
          })}

          {/* Bottom Add Section Button */}
          <div className="pt-2 text-center">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onAddSection();
              }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-zinc-300 hover:text-white text-xs font-mono transition-all"
            >
              <IconPlus className="w-4 h-4 text-brand-cyan" />
              <span>Add New Section to Form</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
