"use client";

import React, { useState, useEffect, useRef, useId, useMemo } from "react";
import { hexToRgba } from "@/lib/utils";
import { designManifest } from "@/lib/design-manifest";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { IconSearch, IconTerminal, IconFileCode, IconDirections, IconCornerDownLeft, IconCalendar, IconBrain, IconFileSpreadsheet } from "@tabler/icons-react";
import { filterFuzzySearch } from "@/lib/search-utils";
import { useSearch } from "@/components/providers/SearchProvider";
import { useAudio } from "@/components/providers/AudioProvider";

interface SearchCaseStudy {
  id: string;
  slug: string;
  title: string;
  primary_language: string;
  tags: string;
}

interface PaletteItem {
  id: string;
  title: string;
  subtitle: string;
  category: "case-study" | "navigation";
  url: string;
  icon: React.ReactNode;
  techStack?: string[];
  highlights?: string[];
  status?: string;
  description?: string;
  badge?: string;
}

interface CommandPaletteModalProps {
  onClose: () => void;
  studies: SearchCaseStudy[];
}

const CommandPaletteModal: React.FC<CommandPaletteModalProps> = ({ onClose, studies }) => {
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const { playHover, playSubmit } = useAudio();

  const router = useRouter();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const searchId = useId();

  // 1. Body scroll locking and focus trap management
  useEffect(() => {
    // Lock parent layout scrollbars
    document.body.style.overflow = "hidden";

    // Auto-focus input after transition has completed
    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 150);

    return () => {
      document.body.style.overflow = "";
      clearTimeout(timer);
    };
  }, []);

  // 2. Compile indexable items from static navigations and Neon DB records
  const allItems = useMemo(() => {
    const staticNavs: PaletteItem[] = [
      {
        id: "nav-work",
        title: "Work Showcase Feed",
        subtitle: "Jump to Bento grid clinical & architectural case studies",
        category: "navigation",
        url: "/#case-studies",
        icon: <IconDirections className="w-4 h-4 text-brand-cyan" />,
        badge: "Showcase",
        status: "Production Feed",
        description: "Comprehensive portfolio showcase featuring interactive clinical systems, formal logic tools, arcade game engines, and full-stack architectural case studies.",
        techStack: ["Next.js 16", "React 19", "Tailwind CSS", "TypeScript"],
        highlights: [
          "Interactive bento-box case study grid",
          "Live telemetry event logging",
          "Direct GitHub repository & demo links"
        ]
      },
      {
        id: "nav-about",
        title: "About System Architect",
        subtitle: "Read professional credentials, skills grid, and career timeline",
        category: "navigation",
        url: "/#about",
        icon: <IconDirections className="w-4 h-4 text-brand-cyan" />,
        badge: "Bio & Skills",
        status: "Verified Credentials",
        description: "Professional background, verified clinical architecture experience, full-stack skills breakdown, and career timeline.",
        techStack: ["TypeScript", "Distributed Systems", "CDISC Standards", "Cloud Architecture"],
        highlights: [
          "Interactive skills matrix with audio feedback",
          "FDA & regulatory compliance track record",
          "Architecture decision records (ADRs)"
        ]
      },
      {
        id: "nav-contact",
        title: "Say Hi & Connect",
        subtitle: "Drop a line, book a chat, or check out GitHub and LinkedIn",
        category: "navigation",
        url: "/#contact",
        icon: <IconDirections className="w-4 h-4 text-brand-cyan" />,
        badge: "Direct Connect",
        status: "Open for Sync",
        description: "Direct channels for collaboration, technical discussions, code reviews, and project advisory.",
        techStack: ["Web API", "Calendly Sync", "PGP Key", "Open Source"],
        highlights: [
          "30-minute friendly technical sync",
          "Direct verified social links",
          "PGP security verification"
        ]
      },
      {
        id: "nav-arcade",
        title: "Arcade Games Hub",
        subtitle: "Launch interactive games, physics engines, and systems simulators",
        category: "navigation",
        url: "/arcade",
        icon: <IconTerminal className="w-4 h-4 text-brand-cyan" />,
        badge: "Arcade Hub",
        status: "Interactive 60 FPS",
        description: "Suite of playable 2D/3D browser games and systems engineering simulators built on bare-metal HTML5 Canvas and Web Audio APIs.",
        techStack: ["Canvas 2D", "Web Audio API", "Framer Motion", "Physics Engine"],
        highlights: [
          "Zero-dependency custom physics engines",
          "Synthesized 8-bit & retro audio chips",
          "Virtual D-Pad touch controls on mobile"
        ]
      },
      {
        id: "nav-case-studies",
        title: "Engineering Case Studies Hub",
        subtitle: "Full Bento showcase of clinical data & architectural systems",
        category: "navigation",
        url: "/case-studies",
        icon: <IconDirections className="w-4 h-4 text-brand-cyan" />,
        badge: "Case Studies",
        status: "Interactive Showcase",
        description: "Comprehensive portfolio showcase featuring interactive clinical systems, formal logic tools, live telemetry feeds, and full-stack architectural case studies.",
        techStack: ["Next.js 16", "React 19", "Tailwind CSS", "TypeScript"],
        highlights: [
          "Interactive bento-box case study grid",
          "Live telemetry and commit logs",
          "Deep architectural retrospectives"
        ]
      },
      {
        id: "nav-laser-loon",
        title: "Laser Loon: Quest for the State Flag",
        subtitle: "Playable civic physics shooter — pilot F277 Laser Loon on the Road to the Capitol",
        category: "navigation",
        url: "/arcade/laser-loon",
        icon: <IconTerminal className="w-4 h-4 text-red-400" />,
        badge: "Physics Shooter",
        status: "60 FPS Arcade",
        description: "Action physics shooter featuring trajectory raycasting, multi-tiered enemy waves, particle explosions, and synthesized chiptune audio.",
        techStack: ["Canvas 2D", "Vector Physics", "Web Audio API", "Particle Systems"],
        highlights: [
          "High-performance 60 FPS particle engine",
          "Multi-stage boss battle mechanics",
          "Accessible keyboard & virtual D-Pad controls"
        ]
      },
      {
        id: "nav-quasi-puzzler",
        title: "Quasi-Perfect Puzzler",
        subtitle: "Formal-methods arcade scaffold — tactics, proof goals, and simulated Lean RAM",
        category: "navigation",
        url: "/arcade/quasi-puzzler",
        icon: <IconTerminal className="w-4 h-4 text-brand-cyan" />,
        badge: "Logic Puzzler",
        status: "Formal Tactics",
        description: "Gamified formal verification scaffold teaching tactic discharge, lemma substitution, and simulated Lean RAM memory management.",
        techStack: ["Lean 4 Grammar", "AST Validator", "State Machine", "Canvas 2D"],
        highlights: [
          "Simulated theorem goal discharges",
          "Bounded RAM consumption constraints",
          "Interactive theorem tree visualizer"
        ]
      },
      {
        id: "nav-clinical-chaos",
        title: "Clinical Trial Chaos: CDISC Compliance Arcade",
        subtitle: "Fast-paced CDISC mapping & 21 CFR Part 11 electronic signature compliance arcade under FDA auditor pressure",
        category: "navigation",
        url: "/arcade/clinical-chaos",
        icon: <IconTerminal className="w-4 h-4 text-brand-cyan" />,
        badge: "Regulatory Arcade",
        status: "Audit Simulation",
        description: "Fast-paced clinical data management arcade simulating high-pressure FDA audit inspections, CDASH mapping, and e-signature locks.",
        techStack: ["CDASH Standards", "21 CFR Part 11", "Canvas 2D", "Timer Engine"],
        highlights: [
          "Real-time CDASH domain variable mapping",
          "Discrepancy query resolution clock",
          "Audit trail integrity scoring"
        ]
      },
      {
        id: "nav-garmin-watch",
        title: "Garmin Connect IQ 32KB Memory Runner",
        subtitle: "Retro smartwatch engineering game — survive strict 32KB RAM, GC freezes, and thermal overheating",
        category: "navigation",
        url: "/arcade/garmin-watch",
        icon: <IconTerminal className="w-4 h-4 text-brand-cyan" />,
        badge: "Embedded Systems",
        status: "32KB Memory Limit",
        description: "Constrained embedded systems runner simulating Connect IQ Monkey C memory allocators, mark-sweep garbage collection, and thermal throttling.",
        techStack: ["Connect IQ Specs", "Memory Profiler", "GC Simulator", "Canvas 2D"],
        highlights: [
          "32KB hard heap budget simulation",
          "Mark-and-sweep GC freeze penalties",
          "Thermal envelope clock management"
        ]
      },
      {
        id: "nav-working-with-duck",
        title: "Working With Duck: Pet Simulation Arcade",
        subtitle: "Multitasking & puppy management game — balance coding deadlines against Duck's zoomies, potty breaks, and belly rubs",
        category: "navigation",
        url: "/arcade/working-with-duck",
        icon: <IconTerminal className="w-4 h-4 text-amber-400" />,
        badge: "Pet Simulation",
        status: "Puppy AI Active",
        description: "Whimsical multitasking simulator balancing software release deadlines with duck-tolling retriever puppy needs and chaotic zoomies.",
        techStack: ["Behavior Tree AI", "State Machine", "Web Audio API", "Canvas 2D"],
        highlights: [
          "Autonomous puppy mood & energy engine",
          "Simulated sprint deadline crunch",
          "Interactive belly rub & treat triggers"
        ]
      },
      {
        id: "nav-retro-labyrinth",
        title: "Retro Labyrinth: Graveyard Roguelike",
        subtitle: "Roguelike dungeon crawler exploring abandoned repos — TSP dynamic walls, 3D wireframe boss, and developer weapons",
        category: "navigation",
        url: "/arcade/retro-labyrinth",
        icon: <IconTerminal className="w-4 h-4 text-brand-cyan" />,
        badge: "Dungeon Roguelike",
        status: "Procedural Maze",
        description: "Procedural retro roguelike exploring graveyard codebases with traveling salesperson wall generation, raycast lighting, and 3D wireframes.",
        techStack: ["TSP Algorithms", "Raycasting 3D", "Procedural Generation", "Canvas 2D"],
        highlights: [
          "Dynamic graph-based maze generation",
          "Wireframe 3D vector boss rendering",
          "CRT phosphor scanline post-processing"
        ]
      },
      {
        id: "nav-proof",
        title: "Logical Proof Workspace",
        subtitle: "Construct and verify logic graphs using fully accessible CLI terminal",
        category: "navigation",
        url: "/proof",
        icon: <IconTerminal className="w-4 h-4 text-brand-cyan" />,
        badge: "Formal Verification",
        status: "Theorem Engine",
        description: "High-assurance formal logic studio for proving distributed systems invariants, checking fallacy ASTs, and exporting Lean 4 proofs.",
        techStack: ["Lean 4", "Propositional AST", "DAG Engine", "Web Workers"],
        highlights: [
          "AST-level Fallacy counterexample engine",
          "Distributed consensus theorem templates",
          "Multi-format Lean 4 & LaTeX export"
        ]
      },
      {
        id: "nav-neuro",
        title: "NeuroRecon: FreeSurfer Pipeline Simulator",
        subtitle: "Interactive neuroimaging CAD workspace — repair 3D cortical surfaces, control points & 2D MRI slices",
        category: "navigation",
        url: "/neuro",
        icon: <IconBrain className="w-4 h-4 text-brand-cyan" />,
        badge: "Neuroimaging CAD",
        status: "WebGL 3D Active",
        description: "Multi-planar MRI volumetric viewer and 3D cortical mesh reconstruction simulator with real-time pial/white-matter boundary editing.",
        techStack: ["Three.js", "WebGL 2", "Marching Cubes", "Medical Imaging"],
        highlights: [
          "Coronal, Sagittal, and Axial slice views",
          "Automated 3D surface mesh generation",
          "Context loss auto-recovery handler"
        ]
      },
      {
        id: "nav-crf",
        title: "CRF Studio: Clinical Form & Protocol Designer",
        subtitle: "Zero-latency 12-column visual CRF builder, AST edit check logic, CDISC CDASH/ODM-XML, and live Part 11 EDC simulator",
        category: "navigation",
        url: "/crf",
        icon: <IconFileSpreadsheet className="w-4 h-4 text-brand-cyan" />,
        badge: "Clinical Data Suite",
        status: "21 CFR Part 11",
        description: "Zero-latency visual CRF designer, AST edit check engine, NCI Thesaurus terminology mapper, and full 21 CFR Part 11 EDC simulation.",
        techStack: ["CDISC ODM-XML", "NCI Thesaurus", "Zero-Eval AST", "FHIR SDC"],
        highlights: [
          "12-column clinical grid & visit schedule",
          "Automated CDASH regulatory remediation",
          "Multi-role simulated investigator sign-off"
        ]
      },
      {
        id: "nav-simulator",
        title: "Engineering Alignment Simulator",
        subtitle: "Incident triage, architecture dilemmas, and candidate compatibility arcade",
        category: "navigation",
        url: "/simulator",
        icon: <IconDirections className="w-4 h-4 text-brand-cyan" />,
        badge: "Systems Simulator",
        status: "Incident Triage",
        description: "Interactive architecture triage game exploring distributed system trade-offs, outage root causes, and engineering leadership decisions.",
        techStack: ["State Machine", "Decision Trees", "Telemetry Hooks", "Framer Motion"],
        highlights: [
          "Live incident triage scenarios",
          "Candidate alignment benchmark scoring",
          "Detailed post-mortem decision reports"
        ]
      },
      {
        id: "nav-schedule",
        title: "Say Hi / Book a Chat",
        subtitle: "Book a friendly 30-minute sync to chat about code, projects, or ideas",
        category: "navigation",
        url: "/schedule",
        icon: <IconCalendar className="w-4 h-4 text-brand-cyan" />,
        badge: "Sync Scheduler",
        status: "Live Calendar",
        description: "Frictionless calendar booking for 30-minute technical chats, architecture brainstorms, or informal introductory conversations.",
        techStack: ["Next.js 16", "Calendar API", "Timezone Engine", "WCAG 2.1 AA"],
        highlights: [
          "Timezone-aware slot availability",
          "Accessible keyboard-driven date selection",
          "Zero-friction confirmation workflow"
        ]
      },
    ];

    const studyItems: PaletteItem[] = studies.map((study) => {
      const parsedTags = study.tags
        ? study.tags.split(",").map((t) => t.trim()).filter(Boolean)
        : [];
      return {
        id: study.id,
        title: study.title,
        subtitle: `${study.primary_language} — ${study.tags}`,
        category: "case-study",
        url: `/case-studies/${study.slug}`,
        icon: <IconFileCode className="w-4 h-4 text-brand-blue" />,
        badge: "Case Study",
        status: "Architectural Case",
        description: `In-depth technical breakdown covering architecture decisions, production trade-offs, and software craftsmanship for ${study.title}.`,
        techStack: [study.primary_language, ...parsedTags].filter(Boolean),
        highlights: [
          "Production architecture and trade-off analysis",
          "Source code snippets and design patterns",
          "Measured performance benchmarks & metrics"
        ]
      };
    });

    return [...staticNavs, ...studyItems];
  }, [studies]);

  // 3. In-Memory Fuzzy filtering matching queries against titles or tags
  const filteredItems = useMemo(() => {
    return filterFuzzySearch(query, allItems);
  }, [allItems, query]);

  // 4. Keyboard Control Handlers (↑↓, Enter, Escape)
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (filteredItems.length === 0) {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((prev) => (prev + 1) % filteredItems.length);
      playHover();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((prev) => (prev - 1 + filteredItems.length) % filteredItems.length);
      playHover();
    } else if (e.key === "Escape") {
      e.preventDefault();
      onClose();
    } else if (e.key === "Enter") {
      e.preventDefault();
      const selected = filteredItems[activeIndex];
      if (selected) {
        handleSelectItem(selected);
      }
    }
  };

  const handleSelectItem = (item: PaletteItem) => {
    if (typeof playSubmit === "function") {
      playSubmit();
    }
    onClose();
    // Handle in-page dynamic smooth scrolls
    if (item.url.startsWith("/#")) {
      const targetId = item.url.substring(2);
      const targetElement = document.getElementById(targetId);
      if (targetElement) {
        router.push("/");
        // Allow thread transition to complete
        setTimeout(() => {
          targetElement.scrollIntoView({ behavior: "smooth" });
        }, 100);
      } else {
        router.push(item.url);
      }
    } else {
      router.push(item.url);
    }
  };

  // Close when clicking directly on the backdrop container
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const activeItem = filteredItems[activeIndex] || filteredItems[0];

  return (
    <div
      onClick={handleBackdropClick}
      className="fixed inset-0 z-[9999] flex items-start justify-center pt-[max(1.5rem,env(safe-area-inset-top)+1rem)] sm:pt-[12vh] px-3 sm:px-4 pb-[max(1.5rem,env(safe-area-inset-bottom)+1rem)] bg-zinc-950/85 backdrop-blur-md transition-all duration-300 overflow-y-auto"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.97, y: -8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.97, y: -8 }}
        transition={{ duration: 0.18, ease: "easeOut" }}
        ref={containerRef}
        style={{ "--cmd-glow": `0 0 50px ${hexToRgba(designManifest.colors["brand-cyan"], 0.06)}` } as React.CSSProperties}
        className="w-full max-w-3xl bg-zinc-900/95 border border-zinc-800/90 backdrop-blur-2xl shadow-[var(--cmd-glow)] rounded-3xl overflow-hidden flex flex-col relative my-auto sm:my-0 max-h-[85vh]"
      >
        {/* Circular glow visual elements inside modal */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-brand-cyan/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-brand-blue/5 rounded-full blur-3xl pointer-events-none" />

        {/* Input Header container */}
        <div className="relative z-10 flex items-center border-b border-zinc-800/60 p-3 sm:p-4 gap-2 sm:gap-3">
          <IconSearch className="w-5 h-5 text-zinc-500 flex-shrink-0" />
          <input
            ref={inputRef}
            id={searchId}
            type="text"
            placeholder="Search cases, tools, games, sections..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActiveIndex(0);
            }}
            onKeyDown={handleKeyDown}
            role="combobox"
            aria-expanded={true}
            aria-autocomplete="list"
            aria-controls="palette-results-list"
            aria-activedescendant={activeItem ? `palette-option-${activeItem.id}` : undefined}
            aria-haspopup="listbox"
            aria-label="Spotlight command palette search"
            className="w-full bg-transparent text-sm sm:text-base text-neutral-100 placeholder-zinc-500 focus:outline-none font-sans"
          />
          <button
            type="button"
            onClick={onClose}
            aria-label="Close command search"
            className="min-h-10 min-w-10 flex items-center justify-center text-xs font-mono font-bold tracking-wider text-zinc-300 px-2.5 py-1 bg-zinc-950 border border-zinc-700 hover:border-brand-cyan/40 hover:text-brand-cyan rounded-xl cursor-pointer select-none transition"
          >
            ESC
          </button>
        </div>

        {/* Master-Detail Split Grid */}
        <div className="relative z-10 flex-1 grid grid-cols-1 md:grid-cols-12 min-h-0 divide-y md:divide-y-0 md:divide-x divide-zinc-800/60 overflow-hidden">
          {/* Left: Results List section */}
          <div className="col-span-12 md:col-span-7 flex flex-col min-h-0 max-h-[380px] overflow-hidden">
            {filteredItems.length > 0 ? (
              <div
                id="palette-results-list"
                role="listbox"
                aria-label="Search outcomes list"
                className="flex-1 max-h-[380px] overflow-y-auto p-2.5 space-y-1 scrollbar-none"
              >
                {filteredItems.map((item, index) => {
                  const isActive = index === activeIndex;
                  return (
                    <div
                      key={item.id}
                      id={`palette-option-${item.id}`}
                      role="option"
                      aria-selected={isActive}
                      aria-describedby={isActive ? "palette-preview-pane" : undefined}
                      onClick={() => handleSelectItem(item)}
                      style={{ "--cmd-item-glow": hexToRgba(designManifest.colors["brand-cyan"], 0.04) } as React.CSSProperties}
                      onMouseEnter={() => {
                        if (index !== activeIndex) {
                          setActiveIndex(index);
                          playHover();
                        }
                      }}
                      onMouseOver={() => {
                        if (index !== activeIndex) {
                          setActiveIndex(index);
                          playHover();
                        }
                      }}
                      onPointerEnter={() => {
                        if (index !== activeIndex) {
                          setActiveIndex(index);
                          playHover();
                        }
                      }}
                      className={`flex items-center gap-3.5 px-3.5 py-3 rounded-xl cursor-pointer select-none transition-all duration-200 border ${
                        isActive
                          ? "bg-zinc-950 border-brand-cyan/25 shadow-[0_0_15px_var(--cmd-item-glow)]"
                          : "bg-transparent border-transparent hover:bg-zinc-950/40"
                      }`}
                    >
                      {/* Left icon wrapper */}
                      <span
                        className={`w-8 h-8 rounded-lg border flex items-center justify-center transition-colors duration-300 flex-shrink-0 ${
                          isActive
                            ? "bg-brand-cyan/10 border-brand-cyan/30 text-brand-cyan"
                            : "bg-zinc-950 border-zinc-900 text-zinc-400"
                        }`}
                      >
                        {item.icon}
                      </span>

                      {/* Dynamic label strings */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <span
                            className={`text-[10px] font-mono font-bold uppercase tracking-wider transition-colors ${
                              isActive ? "text-brand-cyan" : "text-zinc-400"
                            }`}
                          >
                            {item.badge || (item.category === "case-study" ? "Case Study" : "Site Channel")}
                          </span>
                          {item.status && (
                            <span className="hidden sm:inline-block text-[9px] font-mono text-zinc-400 border border-zinc-800/80 px-1.5 py-0.2 rounded">
                              {item.status}
                            </span>
                          )}
                        </div>
                        <div
                          className={`text-sm font-semibold truncate transition-colors ${
                            isActive ? "text-white" : "text-neutral-300"
                          }`}
                        >
                          {item.title}
                        </div>
                        <div className="text-xs text-zinc-400 truncate mt-0.5">
                          {item.subtitle}
                        </div>
                      </div>

                      {/* Right Enter Shortcut icon */}
                      {isActive && (
                        <span className="text-xs font-mono text-zinc-400 flex items-center gap-1 animate-pulse flex-shrink-0 select-none">
                          <span className="hidden sm:inline">Select</span>
                          <IconCornerDownLeft className="w-3.5 h-3.5 text-brand-cyan" />
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex-1 max-h-[380px] overflow-y-auto p-2.5 space-y-1 scrollbar-none py-12 text-center select-none">
                <p className="text-sm text-zinc-400 italic">No outcomes match search query.</p>
                <p className="text-xs font-mono text-zinc-400 mt-1 uppercase tracking-widest">
                  Try searching other tags
                </p>
              </div>
            )}
          </div>

          {/* Right: Contextual Preview Pane (Desktop >= 768px) */}
          <div
            id="palette-preview-pane"
            aria-live="polite"
            className="hidden md:flex md:col-span-5 flex-col justify-between p-4 bg-zinc-950/60 min-h-0 overflow-y-auto max-h-[380px] scrollbar-none"
          >
            {activeItem ? (
              <motion.div
                key={activeItem.id}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.12, ease: "easeOut" }}
                className="flex flex-col h-full justify-between gap-3"
              >
                {/* Top section: Badges, Title, Description */}
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-brand-cyan/10 text-brand-cyan border border-brand-cyan/20">
                      {activeItem.badge || (activeItem.category === "case-study" ? "Case Study" : "Navigation")}
                    </span>
                    {activeItem.status && (
                      <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-md flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        {activeItem.status}
                      </span>
                    )}
                  </div>

                  <div className="mt-3 flex items-start gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-brand-cyan flex-shrink-0 mt-0.5">
                      {activeItem.icon}
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-sm font-bold text-white leading-tight">
                        {activeItem.title}
                      </h4>
                      <p className="text-[11px] font-mono text-zinc-400 mt-0.5 truncate">
                        {activeItem.url}
                      </p>
                    </div>
                  </div>

                  {activeItem.description && (
                    <p className="text-xs text-zinc-300 leading-relaxed mt-2.5 border-t border-zinc-850 pt-2.5">
                      {activeItem.description}
                    </p>
                  )}

                  {/* Tech Stack Pills */}
                  {activeItem.techStack && activeItem.techStack.length > 0 && (
                    <div className="mt-3">
                      <div className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider mb-1.5">
                        Tech Stack & Specs
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {activeItem.techStack.map((tech, idx) => (
                          <span
                            key={idx}
                            className="text-[10px] font-mono text-zinc-300 bg-zinc-900 border border-zinc-800 px-1.5 py-0.5 rounded"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Capability Highlights */}
                  {activeItem.highlights && activeItem.highlights.length > 0 && (
                    <div className="mt-3 border-t border-zinc-850 pt-2.5">
                      <div className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider mb-1.5">
                        Key Highlights
                      </div>
                      <ul className="space-y-1">
                        {activeItem.highlights.map((highlight, idx) => (
                          <li key={idx} className="text-[11px] text-zinc-300 flex items-start gap-1.5 leading-snug">
                            <span className="text-brand-cyan text-xs leading-none">▸</span>
                            <span>{highlight}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Bottom Quick Navigation Hint */}
                <div className="pt-2.5 border-t border-zinc-850 flex items-center justify-between text-[10px] font-mono text-zinc-400 select-none">
                  <span className="flex items-center gap-1 text-brand-cyan/90">
                    <span className="bg-zinc-900 border border-zinc-800 px-1 py-0.5 rounded text-[9px]">↵ ENTER</span>
                    <span>Launch</span>
                  </span>
                  <span className="truncate max-w-[140px] text-zinc-400">
                    {activeItem.url}
                  </span>
                </div>
              </motion.div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center text-zinc-400 p-4">
                <IconTerminal className="w-8 h-8 text-zinc-600 mb-2" />
                <p className="text-xs font-mono uppercase tracking-wider">Select a route or case</p>
              </div>
            )}
          </div>
        </div>

        {/* Modal Bottom Footer bar */}
        <div className="relative z-10 border-t border-zinc-800/60 p-3 bg-zinc-950/60 flex justify-between items-center text-xs font-mono text-zinc-400 select-none">
          <div className="flex gap-4">
            <span className="flex items-center gap-1">
              <span className="bg-zinc-900 border border-zinc-800 px-1 rounded-md text-[10px]">↑↓</span> Move
            </span>
            <span className="flex items-center gap-1">
              <span className="bg-zinc-900 border border-zinc-800 px-1 rounded-md text-[10px]">↵</span> Enter
            </span>
            <span className="hidden sm:inline-flex items-center gap-1">
              <span className="bg-zinc-900 border border-zinc-800 px-1 rounded-md text-[10px]">ESC</span> Close
            </span>
          </div>
          <div>
            <span>SEARCH RESULTS: {filteredItems.length}</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export const CommandPalette: React.FC = () => {
  const [mounted, setMounted] = useState(false);
  const { isOpen, setIsOpen, closeSearch } = useSearch();
  const [studies, setStudies] = useState<SearchCaseStudy[]>([]);
  const originalFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  // 1. Keyboard Shortcut Listener (Cmd+K / Ctrl+K) site-wide
  useEffect(() => {
    if (!mounted) return;
    const isWithinBoundary = (target: EventTarget | null) => {
      if (target instanceof Element) {
        return !!target.closest("[data-keyboard-boundary]");
      }
      return false;
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (isWithinBoundary(e.target)) {
        return;
      }
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsOpen(!isOpen);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [mounted, isOpen, setIsOpen]);

  // Expose test helper globally to open search modal programmatically
  useEffect(() => {
    if (!mounted) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).__openSearch = () => {
      setIsOpen(true);
    };
    return () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (window as any).__openSearch;
    };
  }, [mounted, setIsOpen]);

  // Capture original focus state when the palette opens
  useEffect(() => {
    if (!mounted) return;
    if (isOpen) {
      originalFocusRef.current = document.activeElement as HTMLElement;
    }
  }, [isOpen, mounted]);

  // 2. Fetch search case studies dynamically on mount
  useEffect(() => {
    if (!mounted) return;
    const loadStudies = async () => {
      try {
        const res = await fetch("/api/case-studies");
        if (res.ok) {
          const data = await res.json();
          setStudies(data);
        }
      } catch (err) {
        console.error("Failed to load search dynamic case studies:", err);
      }
    };

    loadStudies();
  }, [mounted]);

  const handleClose = () => {
    closeSearch();
    originalFocusRef.current?.focus();
  };

  if (!mounted) return null;
  if (typeof window === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <CommandPaletteModal
          onClose={handleClose}
          studies={studies}
        />
      )}
    </AnimatePresence>,
    document.body
  );
};
