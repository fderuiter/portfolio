"use client";

import React, { useState, useEffect, useRef, useId, useMemo } from "react";
import { hexToRgba } from "@/lib/utils";
import { designManifest } from "@/lib/design-manifest";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { IconSearch, IconTerminal, IconFileCode, IconDirections, IconCornerDownLeft } from "@tabler/icons-react";
import { filterFuzzySearch } from "@/lib/search-utils";
import { useSearch } from "@/components/providers/SearchProvider";

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
}

interface CommandPaletteModalProps {
  onClose: () => void;
  studies: SearchCaseStudy[];
}

const CommandPaletteModal: React.FC<CommandPaletteModalProps> = ({ onClose, studies }) => {
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);

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
        icon: <IconDirections className="w-4 h-4 text-brand-cyan" />
      },
      {
        id: "nav-about",
        title: "About System Architect",
        subtitle: "Read professional credentials, skills grid, and career timeline",
        category: "navigation",
        url: "/#about",
        icon: <IconDirections className="w-4 h-4 text-brand-cyan" />
      },
      {
        id: "nav-contact",
        title: "Contact Frederick",
        subtitle: "Get in touch for premium systems engineering collaborations",
        category: "navigation",
        url: "/#contact",
        icon: <IconDirections className="w-4 h-4 text-brand-cyan" />
      },
      {
        id: "nav-sandbox",
        title: "CLI Developer Sandbox",
        subtitle: "Test dynamic CLI metrics and view sandbox environments",
        category: "navigation",
        url: "/ui-sandbox",
        icon: <IconTerminal className="w-4 h-4 text-brand-cyan" />
      },
      {
        id: "nav-proof",
        title: "Logical Proof Workspace",
        subtitle: "Construct and verify logic graphs using fully accessible CLI terminal",
        category: "navigation",
        url: "/proof",
        icon: <IconTerminal className="w-4 h-4 text-brand-cyan" />
      },
      {
        id: "nav-simulator",
        title: "Recruiter Simulator",
        subtitle: "Begin the compatibility wizard to calculate candidate alignment",
        category: "navigation",
        url: "/simulator",
        icon: <IconDirections className="w-4 h-4 text-brand-cyan" />
      }
    ];

    const studyItems: PaletteItem[] = studies.map((study) => ({
      id: study.id,
      title: study.title,
      subtitle: `${study.primary_language} — ${study.tags}`,
      category: "case-study",
      url: `/case-studies/${study.slug}`,
      icon: <IconFileCode className="w-4 h-4 text-brand-blue" />
    }));

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
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((prev) => (prev - 1 + filteredItems.length) % filteredItems.length);
    } else if (e.key === "Escape") {
      e.preventDefault();
      onClose();
    } else if (e.key === "Enter") {
      e.preventDefault();
      const selected = filteredItems[activeIndex];
      if (selected) {
        onClose();
        // Handle in-page dynamic smooth scrolls
        if (selected.url.startsWith("/#")) {
          const targetId = selected.url.substring(2);
          const targetElement = document.getElementById(targetId);
          if (targetElement) {
            router.push("/");
            // Allow thread transition to complete
            setTimeout(() => {
              targetElement.scrollIntoView({ behavior: "smooth" });
            }, 100);
          } else {
            router.push(selected.url);
          }
        } else {
          router.push(selected.url);
        }
      }
    }
  };

  // Close when clicking directly on the backdrop container
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      onClick={handleBackdropClick}
      className="fixed inset-0 z-[9999] flex items-start justify-center pt-[15vh] px-4 bg-zinc-950/80 backdrop-blur-md transition-all duration-300"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.97, y: -8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.97, y: -8 }}
        transition={{ duration: 0.18, ease: "easeOut" }}
        ref={containerRef}
        style={{ "--cmd-glow": `0 0 50px ${hexToRgba(designManifest.colors["brand-cyan"], 0.06)}` } as React.CSSProperties}
        className="w-full max-w-lg bg-zinc-900/80 border border-zinc-800/80 backdrop-blur-2xl shadow-[var(--cmd-glow)] rounded-3xl overflow-hidden flex flex-col relative"
      >
        {/* Circular glow visual elements inside modal */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-brand-cyan/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-brand-blue/5 rounded-full blur-3xl pointer-events-none" />

        {/* Input Header container */}
        <div className="relative z-10 flex items-center border-b border-zinc-800/60 p-4 gap-3">
          <IconSearch className="w-5 h-5 text-zinc-500 flex-shrink-0" />
          <input
            ref={inputRef}
            id={searchId}
            type="text"
            placeholder="Type dynamic case study title, keyword, or section..."
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
            aria-haspopup="listbox"
            aria-label="Spotlight command palette search"
            className="w-full bg-transparent text-sm text-neutral-100 placeholder-zinc-500 focus:outline-none font-sans"
          />
          <span className="text-[9px] font-mono font-bold tracking-wider text-zinc-400 px-2.5 py-1 bg-zinc-950 border border-zinc-800 rounded-md select-none">
            ESC
          </span>
        </div>

        {/* Results List section */}
        <div
          id="palette-results-list"
          role={filteredItems.length > 0 ? "listbox" : "status"}
          aria-label={filteredItems.length > 0 ? "Search outcomes list" : undefined}
          className="relative z-10 flex-1 max-h-[340px] overflow-y-auto p-2.5 space-y-1 scrollbar-none"
        >
          {filteredItems.length > 0 ? (
            filteredItems.map((item, index) => {
              const isActive = index === activeIndex;
              return (
                <div
                  key={item.id}
                  role="option"
                  aria-selected={isActive}
                  onClick={() => {
                    onClose();
                    if (item.url.startsWith("/#")) {
                      const targetId = item.url.substring(2);
                      const targetElement = document.getElementById(targetId);
                      if (targetElement) {
                        router.push("/");
                        setTimeout(() => {
                          targetElement.scrollIntoView({ behavior: "smooth" });
                        }, 100);
                      } else {
                        router.push(item.url);
                      }
                    } else {
                      router.push(item.url);
                    }
                  }}
                  style={{ "--cmd-item-glow": hexToRgba(designManifest.colors["brand-cyan"], 0.04) } as React.CSSProperties}
                  onMouseEnter={() => setActiveIndex(index)}
                  className={`flex items-center gap-4 px-4 py-3.5 rounded-xl cursor-pointer select-none transition-all duration-200 border ${
                    isActive
                      ? "bg-zinc-950 border-brand-cyan/25 shadow-[0_0_15px_var(--cmd-item-glow)]"
                      : "bg-transparent border-transparent"
                  }`}
                >
                  {/* Left icon wrapper */}
                  <span
                    className={`w-8 h-8 rounded-lg border flex items-center justify-center transition-colors duration-300 ${
                      isActive
                        ? "bg-brand-cyan/5 border-brand-cyan/20"
                        : "bg-zinc-950 border-zinc-900"
                    }`}
                  >
                    {item.icon}
                  </span>

                  {/* Dynamic label strings */}
                  <div className="flex-1 min-w-0">
                    <div
                      className={`text-xs font-mono font-bold uppercase tracking-wider mb-0.5 transition-colors ${
                        isActive ? "text-brand-cyan" : "text-zinc-400"
                      }`}
                    >
                      {item.category === "case-study" ? "Case Study" : "Site Channel"}
                    </div>
                    <div
                      className={`text-sm font-semibold truncate transition-colors ${
                        isActive ? "text-white" : "text-neutral-300"
                      }`}
                    >
                      {item.title}
                    </div>
                    <div className="text-[11px] text-zinc-400 truncate mt-0.5">
                      {item.subtitle}
                    </div>
                  </div>

                  {/* Right Enter Shortcut icon */}
                  {isActive && (
                    <span className="text-[10px] font-mono text-zinc-400 flex items-center gap-1.5 animate-pulse flex-shrink-0 select-none">
                      <span>Select</span>
                      <IconCornerDownLeft className="w-3.5 h-3.5" />
                    </span>
                  )}
                </div>
              );
            })
          ) : (
            <div className="py-12 text-center select-none">
              <p className="text-sm text-zinc-400 italic">No outcomes match search query.</p>
              <p className="text-[10px] font-mono text-zinc-400 mt-1 uppercase tracking-widest">
                Try searching other tags
              </p>
            </div>
          )}
        </div>

        {/* Modal Bottom Footer bar */}
        <div className="relative z-10 border-t border-zinc-800/60 p-3 bg-zinc-950/60 flex justify-between items-center text-[10px] font-mono text-zinc-400 select-none">
          <div className="flex gap-4">
            <span className="flex items-center gap-1">
              <span className="bg-zinc-900 border border-zinc-850 px-1 rounded-md">↑↓</span> Move
            </span>
            <span className="flex items-center gap-1">
              <span className="bg-zinc-900 border border-zinc-850 px-1 rounded-md">↵</span> Enter
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
