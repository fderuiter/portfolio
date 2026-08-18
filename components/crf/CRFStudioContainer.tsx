"use client";

import React, { useState, useCallback, useEffect } from "react";
import { useClipboard } from "@/hooks/useClipboard";
import {
  StudyProtocol,
  StudioMode,
  StudioTheme,
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
import dynamic from "next/dynamic";
import { AcrfOverlayViewer } from "./Modes/AcrfOverlayViewer";
import { ExportImportModal } from "./Modes/ExportImportModal";
const ExportDocumentModal = dynamic(
  () => import("./Modes/ExportDocumentModal").then((mod) => ({ default: mod.ExportDocumentModal })),
  { ssr: false }
);
import { BrandingConfigModal } from "./Branding/BrandingConfigModal";
import { DiagnosticsDrawer } from "./DiagnosticsDrawer";
import {
  VisitMatrixEditorSkeleton,
  RuleGraphStudioSkeleton,
  LiveEdcSimulatorSkeleton,
  WorkflowWizardModalSkeleton,
} from "./Skeletons";

const VisitMatrixEditor = dynamic(
  () => import("./Modes/VisitMatrixEditor").then((mod) => mod.VisitMatrixEditor),
  {
    ssr: false,
    loading: () => <VisitMatrixEditorSkeleton />,
  }
);

const RuleGraphStudio = dynamic(
  () => import("./Modes/RuleGraphStudio").then((mod) => mod.RuleGraphStudio),
  {
    ssr: false,
    loading: () => <RuleGraphStudioSkeleton />,
  }
);

const LiveEdcSimulator = dynamic(
  () => import("./Modes/LiveEdcSimulator").then((mod) => mod.LiveEdcSimulator),
  {
    ssr: false,
    loading: () => <LiveEdcSimulatorSkeleton />,
  }
);

const WorkflowWizardModal = dynamic(
  () => import("./Wizard/WorkflowWizardModal").then((mod) => mod.WorkflowWizardModal),
  {
    ssr: false,
    loading: () => <WorkflowWizardModalSkeleton />,
  }
);
import { SpotlightTourOverlay } from "./Wizard/SpotlightTourOverlay";
import { getStudyBranding } from "@/lib/crf/branding-defaults";
import { useStudioHashParams } from "@/hooks/useStudioHashParams";
import { useAudio } from "@/components/providers/AudioProvider";
import {
  IconFileSpreadsheet,
  IconLayoutGrid,
  IconAdjustments,
  IconSparkles,
  IconX,
  IconCheck,
} from "@tabler/icons-react";

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

  const { params, setParam, setParams } = useStudioHashParams();
  const { playSuccess } = useAudio();
  const [copyToast, setCopyToast] = useState<string | null>(null);

  // Studio Navigation & Selection State
  const [activeMode, setActiveModeState] = useState<StudioMode>(() => {
    if (typeof window !== "undefined") {
      const rawMode = new URLSearchParams(window.location.hash.slice(1)).get("mode") as StudioMode;
      if (rawMode && ["designer", "matrix", "rules", "edc", "acrf", "export"].includes(rawMode)) {
        return rawMode;
      }
    }
    return "designer";
  });

  const [activeFormId, setActiveFormIdState] = useState<string>(() => {
    if (typeof window !== "undefined") {
      const rawForm = new URLSearchParams(window.location.hash.slice(1)).get("form");
      if (rawForm && study.forms.some((f) => f.id === rawForm)) {
        return rawForm;
      }
    }
    return study.forms[0]?.id || "";
  });

  const [selectedFieldId, setSelectedFieldIdState] = useState<string | null>(() => {
    if (typeof window !== "undefined") {
      return new URLSearchParams(window.location.hash.slice(1)).get("field") || null;
    }
    return null;
  });

  const [theme, setTheme] = useState<StudioTheme>(() => {
    if (typeof window !== "undefined") {
      const rawTheme = new URLSearchParams(window.location.hash.slice(1)).get("theme") as StudioTheme;
      if (rawTheme === "light" || rawTheme === "dark") {
        return rawTheme;
      }
      try {
        if (typeof window.localStorage?.getItem === "function") {
          const cached = localStorage.getItem("crf_studio_theme") as StudioTheme;
          if (cached === "light" || cached === "dark") {
            return cached;
          }
        }
      } catch {
        // Fallback to dark
      }
    }
    return "dark";
  });

  const [viewport, setViewport] = useState<DeviceViewport>("desktop");

  // Sidebar Visibility / Collapse States for Desktop & Laptop
  const [isLeftSidebarOpen, setIsLeftSidebarOpen] = useState(true);
  const [isRightInspectorOpen, setIsRightInspectorOpen] = useState(true);

  // Mobile Stack Navigation View: "forms" | "canvas" | "inspector"
  const [mobileActiveView, setMobileActiveView] = useState<"forms" | "canvas" | "inspector">("canvas");
  const [isMobileWidgetDrawerOpen, setIsMobileWidgetDrawerOpen] = useState(false);

  // Modals & Panels State
  const [isScaffolderOpen, setIsScaffolderOpen] = useState(false);
  const [isDiagnosticsOpen, setIsDiagnosticsOpen] = useState(false);
  const [isBrandingOpen, setIsBrandingOpen] = useState(false);
  const [isExportDocModalOpen, setIsExportDocModalOpen] = useState(false);
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [isSpotlightTourOpen, setIsSpotlightTourOpen] = useState(false);
  const [leftTab, setLeftTabState] = useState<"forms" | "palette">(() => {
    if (typeof window !== "undefined") {
      const rawTab = new URLSearchParams(window.location.hash.slice(1)).get("tab");
      if (rawTab === "forms" || rawTab === "palette") return rawTab;
    }
    return "forms";
  });

  // Synchronize incoming hash state on mount or browser Back/Forward navigation
  useEffect(() => {
    const targetMode = (params.mode as StudioMode | undefined) || "designer";
    if (["designer", "matrix", "rules", "edc", "acrf", "export"].includes(targetMode)) {
      if (targetMode !== activeMode) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setActiveModeState(targetMode);
      }
    }

    const defaultFormId = study.forms[0]?.id || "";
    const targetForm = params.form && study.forms.some((f) => f.id === params.form)
      ? params.form
      : defaultFormId;
    if (targetForm && targetForm !== activeFormId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setActiveFormIdState(targetForm);
    }

    const targetField = params.field || null;
    if (targetField !== selectedFieldId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSelectedFieldIdState(targetField);
    }

    const targetTab = params.tab === "palette" ? "palette" : "forms";
    if (targetTab !== leftTab) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLeftTabState(targetTab);
    }

    const rawTheme = params.theme as StudioTheme | undefined;
    if (rawTheme && (rawTheme === "light" || rawTheme === "dark")) {
      if (rawTheme !== theme) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setTheme(rawTheme);
      }
    } else if (params.theme === "" && theme !== "dark") {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setTheme("dark");
    }
  }, [params, study.forms, activeMode, activeFormId, selectedFieldId, leftTab, theme]);

  // Synchronized Setters with Hybrid Navigation
  const setActiveMode = useCallback(
    (mode: StudioMode) => {
      setActiveModeState(mode);
      setParam("mode", mode === "designer" ? null : mode, { replace: false });
    },
    [setParam]
  );

  const setActiveFormId = useCallback(
    (formId: string) => {
      setActiveFormIdState(formId);
      const isDefault = formId === study.forms[0]?.id;
      setParams(
        {
          form: isDefault ? null : formId,
          field: null,
        },
        { replace: true }
      );
    },
    [setParams, study.forms]
  );

  const setSelectedFieldId = useCallback(
    (fieldId: string | null) => {
      setSelectedFieldIdState(fieldId);
      setParam("field", fieldId, { replace: true });
    },
    [setParam]
  );

  const setLeftTab = useCallback(
    (tab: "forms" | "palette") => {
      setLeftTabState(tab);
      setParam("tab", tab === "forms" ? null : tab, { replace: true });
    },
    [setParam]
  );

  const handleToggleTheme = useCallback(() => {
    const nextTheme: StudioTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    if (typeof window !== "undefined") {
      try {
        if (typeof window.localStorage?.setItem === "function") {
          localStorage.setItem("crf_studio_theme", nextTheme);
        }
      } catch {
        // Ignore localstorage errors in restricted contexts
      }
    }
    setParam("theme", nextTheme === "dark" ? null : nextTheme, { replace: true });
  }, [theme, setParam]);

  const { copy: copyShareLink } = useClipboard({
    successMessage: "Link copied to clipboard with current studio view!",
    onSuccess: () => {
      try {
        playSuccess();
      } catch {}
      setCopyToast("Link copied to clipboard with current studio view!");
      setTimeout(() => setCopyToast(null), 3500);
    },
  });

  const handleCopyShareLink = useCallback(() => {
    if (typeof window !== "undefined") {
      copyShareLink(window.location.href);
    }
  }, [copyShareLink]);

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

  // Global Keyboard Shortcuts (Undo, Redo, Sidebar Toggles, Mode Switching, Hotkeys)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const isInput =
        target?.tagName === "INPUT" ||
        target?.tagName === "TEXTAREA" ||
        target?.tagName === "SELECT" ||
        target?.isContentEditable ||
        !!target?.closest?.("[data-keyboard-boundary]");

      // Undo / Redo
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "z") {
        if (e.shiftKey) {
          e.preventDefault();
          handleRedo();
        } else {
          e.preventDefault();
          handleUndo();
        }
        return;
      }

      // Quick Scaffolder (⌘K / Ctrl+K)
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsScaffolderOpen(true);
        return;
      }

      // Toggle Left Sidebar (⌘B / Ctrl+B)
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "b") {
        e.preventDefault();
        setIsLeftSidebarOpen((prev) => !prev);
        return;
      }

      // Toggle Right Inspector (⌘I / Ctrl+I)
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "i") {
        e.preventDefault();
        setIsRightInspectorOpen((prev) => !prev);
        return;
      }

      // Escape key to close mobile drawers or clear selection
      if (e.key === "Escape") {
        setIsMobileWidgetDrawerOpen(false);
        if (selectedFieldId) {
          setSelectedFieldId(null);
        }
      }

      if (!isInput) {
        if (e.key === "?" || e.key === "F1") {
          e.preventDefault();
          setIsWizardOpen((prev) => !prev);
        } else if (e.key === "1") {
          setActiveMode("designer");
        } else if (e.key === "2") {
          setActiveMode("matrix");
        } else if (e.key === "3") {
          setActiveMode("rules");
        } else if (e.key === "4") {
          setActiveMode("edc");
        } else if (e.key === "5") {
          setActiveMode("acrf");
        } else if (e.key === "6") {
          setActiveMode("export");
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleUndo, handleRedo, selectedFieldId, setActiveMode, setSelectedFieldId]);

  const activeForm = study.forms.find((f) => f.id === activeFormId) || study.forms[0];
  const allFields = activeForm ? activeForm.sections.flatMap((s) => s.fields) : [];
  const selectedField = allFields.find((f) => f.id === selectedFieldId) || null;

  // Select Field on Mobile automatically slides in Inspector or updates tab
  const handleSelectField = (fieldId: string | null) => {
    setSelectedFieldId(fieldId);
    if (fieldId && typeof window !== "undefined" && window.innerWidth < 768) {
      setMobileActiveView("inspector");
    }
  };

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
    setMobileActiveView("canvas");
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
    setMobileActiveView("canvas");
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
    setMobileActiveView("canvas");
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
    setIsMobileWidgetDrawerOpen(false);
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

  const handleSaveCodelist = useCallback(
    (newCodelist: import("@/lib/crf/types").CodelistDefinition) => {
      updateStudyWithHistory({
        ...study,
        codelists: [...study.codelists.filter((cl) => cl.id !== newCodelist.id), newCodelist],
      });
    },
    [study, updateStudyWithHistory]
  );

  const activeBranding = getStudyBranding(study);

  return (
    <div
      data-studio-theme={theme}
      data-keyboard-boundary="true"
      style={
        {
          "--brand-primary": activeBranding.primaryColor || "#0284c7",
          "--brand-accent": activeBranding.accentColor || "#0ea5e9",
        } as React.CSSProperties
      }
      className={`flex flex-col h-[calc(100vh-4rem)] max-h-[calc(100vh-4rem)] ${
        theme === "light" ? "bg-slate-50 text-slate-900" : "bg-zinc-950 text-foreground"
      } overflow-hidden relative`}
    >
      {/* Studio Header Bar */}
      <StudioHeader
        study={study}
        activeMode={activeMode}
        canUndo={history.length > 0}
        canRedo={future.length > 0}
        theme={theme}
        onToggleTheme={handleToggleTheme}
        isLeftSidebarOpen={isLeftSidebarOpen}
        isRightInspectorOpen={isRightInspectorOpen}
        onToggleLeftSidebar={() => setIsLeftSidebarOpen((prev) => !prev)}
        onToggleRightInspector={() => setIsRightInspectorOpen((prev) => !prev)}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onChangeMode={setActiveMode}
        onSelectPreset={handleSelectPreset}
        onOpenDiagnostics={() => setIsDiagnosticsOpen(true)}
        onOpenCdashScaffolder={() => setIsScaffolderOpen(true)}
        onOpenBranding={() => setIsBrandingOpen(true)}
        onOpenExportDocument={() => setIsExportDocModalOpen(true)}
        onOpenWizard={() => setIsWizardOpen(true)}
        onStartSpotlightTour={() => setIsSpotlightTourOpen(true)}
        onCopyShareLink={handleCopyShareLink}
      />

      {/* Copy Toast Alert */}
      {copyToast && (
        <div
          role="status"
          aria-live="polite"
          className="absolute top-16 right-6 z-50 flex items-center gap-2 bg-emerald-950 border border-emerald-500/50 text-emerald-200 text-xs font-mono px-3.5 py-2 rounded-xl shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-top-2 duration-150"
        >
          <IconCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{copyToast}</span>
        </div>
      )}

      {/* Main Workspace Body based on Mode */}
      <div className="flex-1 flex overflow-hidden relative">
        {activeMode === "designer" && activeForm && (
          <>
            {/* Desktop / Tablet Left Sidebar: Forms Navigator & Widget Palette */}
            {isLeftSidebarOpen && (
              <aside className="hidden md:flex w-64 lg:w-72 bg-zinc-950 border-r border-zinc-850 flex-col shrink-0 transition-all">
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
                    Palette
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
            )}

            {/* Mobile Stack Views (Visible only on < md screens) */}
            <div className="md:hidden flex-1 flex flex-col overflow-hidden">
              {mobileActiveView === "forms" && (
                <div className="flex-1 overflow-y-auto p-4 bg-zinc-950">
                  <FormsNavigator
                    forms={study.forms}
                    activeFormId={activeForm.id}
                    onSelectForm={(id) => {
                      setActiveFormId(id);
                      setSelectedFieldId(null);
                      setMobileActiveView("canvas");
                    }}
                    onAddForm={handleAddForm}
                    onDuplicateForm={handleDuplicateForm}
                    onDeleteForm={handleDeleteForm}
                    onOpenCdashScaffolder={() => setIsScaffolderOpen(true)}
                  />
                </div>
              )}

              {mobileActiveView === "canvas" && (
                <main className="flex-1 flex flex-col overflow-hidden">
                  <FormCanvas
                    form={activeForm}
                    selectedFieldId={selectedFieldId}
                    viewport={viewport}
                    codelists={study.codelists}
                    onChangeViewport={setViewport}
                    onSelectField={handleSelectField}
                    onUpdateFormMeta={handleUpdateFormMeta}
                    onAddSection={handleAddSection}
                    onDeleteSection={handleDeleteSection}
                    onUpdateSectionTitle={handleUpdateSectionTitle}
                    onDuplicateField={handleDuplicateField}
                    onDeleteField={handleDeleteField}
                    onUpdateField={handleUpdateField}
                    onOpenPalette={() => setIsMobileWidgetDrawerOpen(true)}
                  />
                </main>
              )}

              {mobileActiveView === "inspector" && (
                <div className="flex-1 overflow-y-auto bg-zinc-950">
                  <InspectorPanel
                    form={activeForm}
                    selectedField={selectedField}
                    codelists={study.codelists}
                    onClose={() => {
                      setSelectedFieldId(null);
                      setMobileActiveView("canvas");
                    }}
                    onUpdateField={handleUpdateField}
                    onUpdateFormMeta={handleUpdateFormMeta}
                    onUpdateRules={handleUpdateRules}
                    onSaveCodelist={handleSaveCodelist}
                  />
                </div>
              )}
            </div>

            {/* Center Canvas for Desktop/Tablet (Visible on md+ screens) */}
            <main className="hidden md:flex flex-1 flex-col overflow-hidden">
              <FormCanvas
                form={activeForm}
                selectedFieldId={selectedFieldId}
                viewport={viewport}
                codelists={study.codelists}
                onChangeViewport={setViewport}
                onSelectField={handleSelectField}
                onUpdateFormMeta={handleUpdateFormMeta}
                onAddSection={handleAddSection}
                onDeleteSection={handleDeleteSection}
                onUpdateSectionTitle={handleUpdateSectionTitle}
                onDuplicateField={handleDuplicateField}
                onDeleteField={handleDeleteField}
                onUpdateField={handleUpdateField}
                onOpenPalette={() => {
                  setIsLeftSidebarOpen(true);
                  setLeftTab("palette");
                }}
              />
            </main>

            {/* Desktop / Tablet Right Inspector Panel */}
            {isRightInspectorOpen && (
              <aside className="hidden md:flex w-72 lg:w-96 bg-zinc-950 shrink-0 flex-col transition-all">
                <InspectorPanel
                  form={activeForm}
                  selectedField={selectedField}
                  codelists={study.codelists}
                  onClose={() => setSelectedFieldId(null)}
                  onUpdateField={handleUpdateField}
                  onUpdateFormMeta={handleUpdateFormMeta}
                  onUpdateRules={handleUpdateRules}
                  onSaveCodelist={handleSaveCodelist}
                />
              </aside>
            )}
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

      {/* Mobile Stack Bottom Navigation Bar (Visible only in Designer mode on mobile < md) */}
      {activeMode === "designer" && (
        <nav
          aria-label="Mobile View Navigation"
          className="md:hidden flex items-center justify-around border-t border-zinc-800 bg-zinc-950/95 backdrop-blur-lg px-2 py-1.5 z-20"
        >
          <button
            onClick={() => setMobileActiveView("forms")}
            className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-xl transition-all ${
              mobileActiveView === "forms"
                ? "text-brand-cyan font-bold bg-brand-cyan/10"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <IconFileSpreadsheet className="w-4 h-4" />
            <span className="text-[10px] font-mono">Forms ({study.forms.length})</span>
          </button>

          <button
            onClick={() => setMobileActiveView("canvas")}
            className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-xl transition-all ${
              mobileActiveView === "canvas"
                ? "text-brand-cyan font-bold bg-brand-cyan/10"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <IconLayoutGrid className="w-4 h-4" />
            <span className="text-[10px] font-mono">Canvas</span>
          </button>

          <button
            onClick={() => setMobileActiveView("inspector")}
            className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-xl transition-all ${
              mobileActiveView === "inspector"
                ? "text-brand-cyan font-bold bg-brand-cyan/10"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <IconAdjustments className="w-4 h-4" />
            <span className="text-[10px] font-mono truncate max-w-[80px]">
              {selectedField ? selectedField.variableName : "Inspector"}
            </span>
          </button>
        </nav>
      )}

      {/* Mobile Widget Palette Slide-Up Bottom Sheet */}
      {isMobileWidgetDrawerOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs md:hidden"
            onClick={() => setIsMobileWidgetDrawerOpen(false)}
          />
          <div className="fixed bottom-0 inset-x-0 z-50 max-h-[75vh] bg-zinc-950 border-t border-zinc-800 rounded-t-3xl p-4 overflow-y-auto md:hidden shadow-2xl space-y-3 animate-in slide-in-from-bottom duration-200">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-850">
              <div className="flex items-center gap-2">
                <IconSparkles className="w-4 h-4 text-brand-cyan" />
                <span className="text-xs font-mono font-bold text-white uppercase">
                  Add Clinical Widget
                </span>
              </div>
              <button
                onClick={() => setIsMobileWidgetDrawerOpen(false)}
                className="p-1 rounded-full bg-zinc-900 text-zinc-400 hover:text-white"
                aria-label="Close Widget Palette"
              >
                <IconX className="w-4 h-4" />
              </button>
            </div>
            <WidgetPalette onAddField={handleAddField} />
          </div>
        </>
      )}

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
          setMobileActiveView("canvas");
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

      {/* 5-Stage Interactive Clinical Walkthrough Wizard */}
      <WorkflowWizardModal
        isOpen={isWizardOpen}
        onClose={() => setIsWizardOpen(false)}
        onSwitchMode={setActiveMode}
        onLoadPreset={handleSelectPreset}
        onStartSpotlightTour={() => setIsSpotlightTourOpen(true)}
      />

      {/* Interactive UI Spotlight Tour */}
      <SpotlightTourOverlay
        isOpen={isSpotlightTourOpen}
        onClose={() => setIsSpotlightTourOpen(false)}
      />
    </div>
  );
};
