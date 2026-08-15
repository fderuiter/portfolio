"use client";

import React, { useState, useCallback, useEffect } from "react";
import {
  StudyProtocol,
  StudioMode,
  DeviceViewport,
  CRFForm,
  CRFField,
  CRFSection,
  EditCheckRule,
  StudyVisit,
} from "@/lib/crf/types";
import { STUDY_PRESETS } from "@/lib/crf/presets";
import { ONCOLOGY_RECIST_PRESET } from "@/lib/crf/presets/oncology-recist";
import { StudioHeader } from "./StudioHeader";
import { FormsNavigator } from "./LeftSidebar/FormsNavigator";
import { WidgetPalette } from "./LeftSidebar/WidgetPalette";
import { CdashScaffolderModal } from "./LeftSidebar/CdashScaffolderModal";
import { FormCanvas } from "./CenterCanvas/FormCanvas";
import { InspectorPanel } from "./RightInspector/InspectorPanel";
import { VisitMatrixEditor } from "./Modes/VisitMatrixEditor";
import { RuleGraphStudio } from "./Modes/RuleGraphStudio";
import { LiveEdcSimulator } from "./Modes/LiveEdcSimulator";
import { AcrfOverlayViewer } from "./Modes/AcrfOverlayViewer";
import { ExportImportModal } from "./Modes/ExportImportModal";
import { ExportDocumentModal } from "./Modes/ExportDocumentModal";
import { BrandingConfigModal } from "./Branding/BrandingConfigModal";
import { DiagnosticsDrawer } from "./DiagnosticsDrawer";
import { getStudyBranding } from "@/lib/crf/branding-defaults";

export const CRFStudioContainer: React.FC = () => {
  // Study State & History
  const [study, setStudy] = useState<StudyProtocol>(() => {
    // Check if user has a custom cached default branding profile in localStorage
    if (typeof window !== "undefined") {
      try {
        const cached = localStorage.getItem("crf_studio_default_branding");
        if (cached) {
          const parsedBranding = JSON.parse(cached);
          return {
            ...ONCOLOGY_RECIST_PRESET,
            branding: parsedBranding,
          };
        }
      } catch {
        // Fallback to preset
      }
    }
    return ONCOLOGY_RECIST_PRESET;
  });
  const [history, setHistory] = useState<StudyProtocol[]>([]);
  const [future, setFuture] = useState<StudyProtocol[]>([]);

  // Studio Navigation & Selection State
  const [activeMode, setActiveMode] = useState<StudioMode>("designer");
  const [activeFormId, setActiveFormId] = useState<string>(study.forms[0]?.id || "");
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);
  const [viewport, setViewport] = useState<DeviceViewport>("desktop");

  // Modals & Panels State
  const [isScaffolderOpen, setIsScaffolderOpen] = useState(false);
  const [isDiagnosticsOpen, setIsDiagnosticsOpen] = useState(false);
  const [isBrandingOpen, setIsBrandingOpen] = useState(false);
  const [isExportDocModalOpen, setIsExportDocModalOpen] = useState(false);
  const [leftTab, setLeftTab] = useState<"forms" | "palette">("forms");

  // Push new state onto undo history stack
  const updateStudyWithHistory = useCallback(
    (newStudy: StudyProtocol) => {
      setHistory((prev) => [...prev.slice(-20), study]);
      setFuture([]);
      setStudy(newStudy);
    },
    [study]
  );

  const handleUndo = useCallback(() => {
    if (history.length === 0) return;
    const previous = history[history.length - 1];
    const newHistory = history.slice(0, history.length - 1);

    setFuture((prev) => [study, ...prev]);
    setHistory(newHistory);
    setStudy(previous);
  }, [history, study]);

  const handleRedo = useCallback(() => {
    if (future.length === 0) return;
    const next = future[0];
    const newFuture = future.slice(1);

    setHistory((prev) => [...prev, study]);
    setFuture(newFuture);
    setStudy(next);
  }, [future, study]);

  // Keyboard Shortcuts (Undo, Redo)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "z") {
        if (e.shiftKey) {
          e.preventDefault();
          handleRedo();
        } else {
          e.preventDefault();
          handleUndo();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleUndo, handleRedo]);

  const activeForm = study.forms.find((f) => f.id === activeFormId) || study.forms[0];
  const allFields = activeForm ? activeForm.sections.flatMap((s) => s.fields) : [];
  const selectedField = allFields.find((f) => f.id === selectedFieldId) || null;

  // Preset Selector Handler
  const handleSelectPreset = (presetId: string) => {
    const found = STUDY_PRESETS.find((p) => p.id === presetId);
    if (found) {
      updateStudyWithHistory(found.study);
      setActiveFormId(found.study.forms[0]?.id || "");
      setSelectedFieldId(null);
    }
  };

  // Form CRUD
  const handleAddForm = () => {
    const newForm: CRFForm = {
      id: `form_custom_${Date.now()}`,
      name: `New Custom Form ${study.forms.length + 1}`,
      domain: "CRF",
      description: "Custom clinical observation module",
      version: "1.0",
      rules: [],
      sections: [
        {
          id: `sec_init_${Date.now()}`,
          title: "General Section",
          fields: [],
        },
      ],
    };

    updateStudyWithHistory({
      ...study,
      forms: [...study.forms, newForm],
    });
    setActiveFormId(newForm.id);
    setSelectedFieldId(null);
  };

  const handleDuplicateForm = (formId: string) => {
    const formToDup = study.forms.find((f) => f.id === formId);
    if (!formToDup) return;

    const dupForm: CRFForm = {
      ...JSON.parse(JSON.stringify(formToDup)),
      id: `form_dup_${Date.now()}`,
      name: `${formToDup.name} (Copy)`,
    };

    updateStudyWithHistory({
      ...study,
      forms: [...study.forms, dupForm],
    });
    setActiveFormId(dupForm.id);
  };

  const handleDeleteForm = (formId: string) => {
    if (study.forms.length <= 1) return;
    const remaining = study.forms.filter((f) => f.id !== formId);
    updateStudyWithHistory({
      ...study,
      forms: remaining,
    });
    setActiveFormId(remaining[0].id);
    setSelectedFieldId(null);
  };

  const handleInjectCdashForm = (newForm: CRFForm) => {
    updateStudyWithHistory({
      ...study,
      forms: [...study.forms, newForm],
    });
    setActiveFormId(newForm.id);
    setSelectedFieldId(null);
  };

  const handleUpdateFormMeta = (updates: Partial<CRFForm>) => {
    if (!activeForm) return;
    const updatedForms = study.forms.map((f) => (f.id === activeForm.id ? { ...f, ...updates } : f));
    updateStudyWithHistory({ ...study, forms: updatedForms });
  };

  // Section CRUD
  const handleAddSection = () => {
    if (!activeForm) return;
    const newSection: CRFSection = {
      id: `sec_${Date.now()}`,
      title: `Section ${activeForm.sections.length + 1}`,
      fields: [],
    };
    const updatedForm: CRFForm = {
      ...activeForm,
      sections: [...activeForm.sections, newSection],
    };
    handleUpdateFormMeta(updatedForm);
  };

  const handleDeleteSection = (sectionId: string) => {
    if (!activeForm || activeForm.sections.length <= 1) return;
    const updatedSections = activeForm.sections.filter((s) => s.id !== sectionId);
    handleUpdateFormMeta({ sections: updatedSections });
  };

  const handleUpdateSectionTitle = (sectionId: string, title: string) => {
    if (!activeForm) return;
    const updatedSections = activeForm.sections.map((s) =>
      s.id === sectionId ? { ...s, title } : s
    );
    handleUpdateFormMeta({ sections: updatedSections });
  };

  // Field CRUD
  const handleAddField = (field: CRFField) => {
    if (!activeForm) return;
    const targetSection = activeForm.sections[0];
    if (!targetSection) return;

    const updatedSections = activeForm.sections.map((s, idx) =>
      idx === 0 ? { ...s, fields: [...s.fields, field] } : s
    );

    handleUpdateFormMeta({ sections: updatedSections });
    setSelectedFieldId(field.id);
  };

  const handleUpdateField = (fieldId: string, updates: Partial<CRFField>) => {
    if (!activeForm) return;
    const updatedSections = activeForm.sections.map((s) => ({
      ...s,
      fields: s.fields.map((f) => (f.id === fieldId ? { ...f, ...updates } : f)),
    }));
    handleUpdateFormMeta({ sections: updatedSections });
  };

  const handleDuplicateField = (sectionId: string, fieldId: string) => {
    if (!activeForm) return;
    const updatedSections = activeForm.sections.map((s) => {
      if (s.id !== sectionId) return s;
      const fIdx = s.fields.findIndex((f) => f.id === fieldId);
      if (fIdx === -1) return s;

      const original = s.fields[fIdx];
      const duplicated: CRFField = {
        ...JSON.parse(JSON.stringify(original)),
        id: `f_${Date.now()}`,
        variableName: `${original.variableName}_COPY`,
        label: `${original.label} (Copy)`,
      };

      const newFields = [...s.fields];
      newFields.splice(fIdx + 1, 0, duplicated);
      return { ...s, fields: newFields };
    });

    handleUpdateFormMeta({ sections: updatedSections });
  };

  const handleDeleteField = (sectionId: string, fieldId: string) => {
    if (!activeForm) return;
    const updatedSections = activeForm.sections.map((s) => ({
      ...s,
      fields: s.fields.filter((f) => f.id !== fieldId),
    }));
    handleUpdateFormMeta({ sections: updatedSections });
    if (selectedFieldId === fieldId) {
      setSelectedFieldId(null);
    }
  };

  const handleUpdateRules = (rules: EditCheckRule[]) => {
    handleUpdateFormMeta({ rules });
  };

  const handleUpdateVisits = (visits: StudyVisit[]) => {
    updateStudyWithHistory({ ...study, visits });
  };

  const handleUpdateBranding = (newBranding: import("@/lib/crf/types").StudyBranding) => {
    updateStudyWithHistory({
      ...study,
      branding: newBranding,
    });
  };

  const activeBranding = getStudyBranding(study);

  return (
    <div
      style={
        {
          "--brand-primary": activeBranding.primaryColor || "#0284c7",
          "--brand-accent": activeBranding.accentColor || "#0ea5e9",
        } as React.CSSProperties
      }
      className="flex flex-col h-[calc(100vh-4rem)] max-h-[calc(100vh-4rem)] bg-zinc-950 text-foreground overflow-hidden"
    >
      {/* Studio Header Bar */}
      <StudioHeader
        study={study}
        activeMode={activeMode}
        canUndo={history.length > 0}
        canRedo={future.length > 0}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onChangeMode={setActiveMode}
        onSelectPreset={handleSelectPreset}
        onOpenDiagnostics={() => setIsDiagnosticsOpen(true)}
        onOpenCdashScaffolder={() => setIsScaffolderOpen(true)}
        onOpenBranding={() => setIsBrandingOpen(true)}
        onOpenExportDocument={() => setIsExportDocModalOpen(true)}
      />

      {/* Main Workspace Body based on Mode */}
      <div className="flex-1 flex overflow-hidden">
        {activeMode === "designer" && activeForm && (
          <>
            {/* Left Sidebar: Forms Navigator & Widget Palette */}
            <aside className="w-64 sm:w-72 bg-zinc-950 border-r border-zinc-850 flex flex-col shrink-0">
              {/* Left Sub-Tabs */}
              <div className="flex border-b border-zinc-850 bg-zinc-900/40">
                <button
                  onClick={() => setLeftTab("forms")}
                  className={`flex-1 py-2 text-xs font-mono transition-colors border-b-2 ${
                    leftTab === "forms"
                      ? "border-brand-cyan text-brand-cyan font-bold bg-zinc-900/60"
                      : "border-transparent text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  Forms ({study.forms.length})
                </button>
                <button
                  onClick={() => setLeftTab("palette")}
                  className={`flex-1 py-2 text-xs font-mono transition-colors border-b-2 ${
                    leftTab === "palette"
                      ? "border-brand-cyan text-brand-cyan font-bold bg-zinc-900/60"
                      : "border-transparent text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  Widget Palette
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-3">
                {leftTab === "forms" ? (
                  <FormsNavigator
                    forms={study.forms}
                    activeFormId={activeForm.id}
                    onSelectForm={(id) => {
                      setActiveFormId(id);
                      setSelectedFieldId(null);
                    }}
                    onAddForm={handleAddForm}
                    onDuplicateForm={handleDuplicateForm}
                    onDeleteForm={handleDeleteForm}
                    onOpenCdashScaffolder={() => setIsScaffolderOpen(true)}
                  />
                ) : (
                  <WidgetPalette onAddField={handleAddField} />
                )}
              </div>
            </aside>

            {/* Center Canvas: Responsive 12-Column Layout */}
            <main className="flex-1 flex flex-col overflow-hidden">
              <FormCanvas
                form={activeForm}
                selectedFieldId={selectedFieldId}
                viewport={viewport}
                codelists={study.codelists}
                onChangeViewport={setViewport}
                onSelectField={setSelectedFieldId}
                onUpdateFormMeta={handleUpdateFormMeta}
                onAddSection={handleAddSection}
                onDeleteSection={handleDeleteSection}
                onUpdateSectionTitle={handleUpdateSectionTitle}
                onDuplicateField={handleDuplicateField}
                onDeleteField={handleDeleteField}
                onUpdateField={handleUpdateField}
                onOpenPalette={() => setLeftTab("palette")}
              />
            </main>

            {/* Right Inspector Panel */}
            <aside className="w-80 sm:w-96 bg-zinc-950 shrink-0 flex flex-col">
              <InspectorPanel
                form={activeForm}
                selectedField={selectedField}
                codelists={study.codelists}
                onClose={() => setSelectedFieldId(null)}
                onUpdateField={handleUpdateField}
                onUpdateFormMeta={handleUpdateFormMeta}
                onUpdateRules={handleUpdateRules}
              />
            </aside>
          </>
        )}

        {activeMode === "matrix" && (
          <VisitMatrixEditor study={study} onUpdateVisits={handleUpdateVisits} />
        )}

        {activeMode === "rules" && <RuleGraphStudio study={study} />}

        {activeMode === "edc" && <LiveEdcSimulator study={study} />}

        {activeMode === "acrf" && (
          <AcrfOverlayViewer
            study={study}
            activeFormId={activeFormId}
            onOpenExportModal={() => setIsExportDocModalOpen(true)}
            onOpenBranding={() => setIsBrandingOpen(true)}
          />
        )}

        {activeMode === "export" && (
          <ExportImportModal
            study={study}
            onImportStudy={(imported) => {
              updateStudyWithHistory(imported);
              setActiveFormId(imported.forms[0]?.id || "");
              setSelectedFieldId(null);
            }}
            onOpenExportDocument={() => setIsExportDocModalOpen(true)}
            onOpenBranding={() => setIsBrandingOpen(true)}
          />
        )}
      </div>

      {/* Modals & Drawers */}
      <CdashScaffolderModal
        isOpen={isScaffolderOpen}
        onClose={() => setIsScaffolderOpen(false)}
        onInjectForm={handleInjectCdashForm}
      />

      <DiagnosticsDrawer
        isOpen={isDiagnosticsOpen}
        study={study}
        onClose={() => setIsDiagnosticsOpen(false)}
        onSelectForm={(fId) => {
          setActiveFormId(fId);
          setActiveMode("designer");
        }}
        onUpdateStudy={updateStudyWithHistory}
      />

      {isBrandingOpen && (
        <BrandingConfigModal
          initialBranding={getStudyBranding(study)}
          onSave={handleUpdateBranding}
          onClose={() => setIsBrandingOpen(false)}
        />
      )}

      {isExportDocModalOpen && (
        <ExportDocumentModal
          study={study}
          activeFormId={activeFormId}
          onClose={() => setIsExportDocModalOpen(false)}
          onOpenBranding={() => {
            setIsExportDocModalOpen(false);
            setIsBrandingOpen(true);
          }}
        />
      )}
    </div>
  );
};
