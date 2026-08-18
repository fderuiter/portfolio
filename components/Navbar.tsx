"use client";

import React, { useState, useEffect, useRef } from "react";
import { TransitionLink } from "@/components/ui/TransitionLink";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useAudio } from "@/components/providers/AudioProvider";
import { useSearch } from "@/components/providers/SearchProvider";
import { usePersona } from "@/components/providers/PersonaProvider";
import { useFocusTrap } from "@/hooks/useFocusTrap";
import {
  IconVolume,
  IconVolumeOff,
  IconChevronDown,
  IconSearch,
  IconDeviceGamepad2,
  IconShieldCheck,
  IconTerminal,
  IconCpu,
  IconCrosshair,
  IconBrain,
  IconBone,
  IconFileSpreadsheet,
  IconBriefcase,
  IconFlame,
} from "@tabler/icons-react";

interface SubNavItem {
  title: string;
  subtitle: string;
  href: string;
  icon: React.ReactNode;
  isExternal?: boolean;
}

const ARCADE_ITEMS: SubNavItem[] = [
  {
    title: "Arcade Hub",
    subtitle: "Playable canvas graphics & physics modules",
    href: "/arcade",
    icon: <IconDeviceGamepad2 className="w-4 h-4 text-brand-cyan" />,
  },
  {
    title: "Laser Loon",
    subtitle: "Physics raycasting & waveform campaign",
    href: "/arcade/laser-loon",
    icon: <IconCrosshair className="w-4 h-4 text-brand-cyan" />,
  },
  {
    title: "Quasi-Perfect Puzzler",
    subtitle: "Formal proof tactics & AST trees",
    href: "/arcade/quasi-puzzler",
    icon: <IconBrain className="w-4 h-4 text-brand-cyan" />,
  },
  {
    title: "Garmin 32KB Runner",
    subtitle: "Embedded Monkey C memory simulator",
    href: "/arcade/garmin-watch",
    icon: <IconCpu className="w-4 h-4 text-brand-cyan" />,
  },
  {
    title: "Clinical Trial Chaos",
    subtitle: "21 CFR Part 11 CDISC regulatory simulator",
    href: "/arcade/clinical-chaos",
    icon: <IconShieldCheck className="w-4 h-4 text-brand-cyan" />,
  },
  {
    title: "Retro Labyrinth",
    subtitle: "Procedural CRT shader & graph roguelike",
    href: "/arcade/retro-labyrinth",
    icon: <IconTerminal className="w-4 h-4 text-brand-cyan" />,
  },
  {
    title: "Working With Duck",
    subtitle: "Autonomous state machine & pet simulation",
    href: "/arcade/working-with-duck",
    icon: <IconBone className="w-4 h-4 text-brand-cyan" />,
  },
  {
    title: "Secret Meme Vault",
    subtitle: "Synthesized soundboard & Easter egg trophies",
    href: "/arcade/meme-vault",
    icon: <IconDeviceGamepad2 className="w-4 h-4 text-emerald-400" />,
  },
];

const SYSTEMS_ITEMS: SubNavItem[] = [
  {
    title: "Under the Hood (Stack)",
    subtitle: "Interactive architecture & live telemetry",
    href: "/stack",
    icon: <IconCpu className="w-4 h-4 text-brand-cyan" />,
  },
  {
    title: "CRF Studio",
    subtitle: "Clinical form designer & live EDC simulator",
    href: "/crf",
    icon: <IconFileSpreadsheet className="w-4 h-4 text-brand-cyan" />,
  },
  {
    title: "Proof Workspace",
    subtitle: "Interactive deductive logic & proof ledger",
    href: "/proof",
    icon: <IconBrain className="w-4 h-4 text-brand-cyan" />,
  },
  {
    title: "NeuroRecon Studio",
    subtitle: "FreeSurfer 3D cortical CAD simulator",
    href: "/neuro",
    icon: <IconBrain className="w-4 h-4 text-brand-cyan" />,
  },
  {
    title: "Incident Simulator",
    subtitle: "Production outage triage decision tree",
    href: "/simulator",
    icon: <IconTerminal className="w-4 h-4 text-brand-cyan" />,
  },
];

export const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState("hero");
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  const { volume, muted, profile, setVolume, setMuted, setProfile, playHover } = useAudio();
  const { openSearch } = useSearch();
  const { persona, setPersona } = usePersona();
  const [showAudioPanel, setShowAudioPanel] = useState(false);

  const pathname = usePathname();
  const [prevPathname, setPrevPathname] = useState(pathname);

  if (pathname !== prevPathname) {
    setPrevPathname(pathname);
    setIsOpen(false);
    setActiveDropdown(null);
    setShowAudioPanel(false);
  }

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.body.style.overflow = "";
    }
  }, [pathname]);

  const triggerRef = useRef<HTMLButtonElement>(null);
  const navContainerRef = useRef<HTMLDivElement>(null);

  const handleLinkHover = (e: React.MouseEvent<HTMLElement>) => {
    if (typeof window === "undefined") return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pan = (rect.left + rect.width / 2) / window.innerWidth * 2 - 1;
    playHover(pan);
  };

  // 1. Scroll-driven backdrop color transition
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // 2. Scroll Spy: active section observer
  useEffect(() => {
    if (pathname !== "/" || typeof IntersectionObserver === "undefined") return;

    const sections = ["hero", "case-studies", "about", "contact"];

    const callback = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
        }
      });
    };

    const observer = new IntersectionObserver(callback, {
      rootMargin: "-25% 0px -55% 0px",
      threshold: 0.1,
    });

    sections.forEach((id) => {
      const el = document.getElementById(id);
      if (el) {
        observer.observe(el);
      }
    });

    return () => {
      observer.disconnect();
    };
  }, [pathname]);

  // 3. Click outside dropdown handler
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        navContainerRef.current &&
        !navContainerRef.current.contains(e.target as Node)
      ) {
        setActiveDropdown(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const mobileMenuTrapRef = useFocusTrap<HTMLDivElement>(isOpen, {
    onEscape: () => {
      setIsOpen(false);
      triggerRef.current?.focus();
    },
    returnFocus: true,
  });

  // Body scroll locking when mobile menu is open
  useEffect(() => {
    if (!isOpen) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Accessibility: Esc key listener for dropdowns and audio panel
  useEffect(() => {
    if (!activeDropdown && !showAudioPanel) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (showAudioPanel) {
          setShowAudioPanel(false);
        } else if (activeDropdown) {
          setActiveDropdown(null);
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [activeDropdown, showAudioPanel]);

  // Handle smooth scroll clicks on homepage and universal mobile drawer dismissal
  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    setActiveDropdown(null);
    setIsOpen(false);
    if (typeof document !== "undefined") {
      document.body.style.overflow = "";
    }
    if (pathname === "/" && href.startsWith("/#")) {
      e.preventDefault();
      const targetId = href.substring(2);
      const targetElement = document.getElementById(targetId);
      if (targetElement) {
        targetElement.scrollIntoView({ behavior: "smooth" });
        setActiveSection(targetId);
      }
    }
  };

  const isArcadeActive = pathname.startsWith("/arcade");
  const isSystemsActive = pathname === "/proof" || pathname === "/simulator" || pathname === "/crf" || pathname === "/neuro" || pathname === "/stack";

  return (
    <>
      {/* Navbar Container */}
      <header
        className={cn(
          "fixed top-0 inset-x-0 z-50 transition-all duration-300 w-full select-none",
          isScrolled
            ? "bg-zinc-950/85 backdrop-blur-xl border-b border-zinc-800/60 py-3 shadow-[0_4px_30px_rgba(0,0,0,0.5)]"
            : "bg-transparent py-5"
        )}
      >
        <div
          ref={navContainerRef}
          className="max-w-6xl mx-auto px-4 sm:px-6 md:px-12 flex justify-between items-center w-full"
        >
          {/* Logo / Wordmark */}
          <TransitionLink
            href="/"
            onClick={(e) => handleNavClick(e, "/#hero")}
            onMouseEnter={handleLinkHover}
            className="group flex min-h-6 items-center gap-2.5 font-mono text-sm tracking-widest font-extrabold text-foreground cursor-pointer focus-visible:ring-2 focus-visible:ring-brand-cyan rounded-md shrink-0"
            aria-label="Frederick de Ruiter Homepage"
            label="Home"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-cyan/70 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-cyan"></span>
            </span>
            <span className="tracking-wider">FDERUITER</span>
          </TransitionLink>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-3 lg:gap-6 shrink-0">
            <nav className="flex items-center gap-3 md:gap-4 lg:gap-6 shrink-0" aria-label="Main Navigation">
              {/* Work Pillar */}
              <TransitionLink
                href={pathname === "/" ? "/#case-studies" : "/case-studies"}
                onClick={(e) => {
                  if (pathname === "/") {
                    handleNavClick(e, "/#case-studies");
                  } else {
                    setActiveDropdown(null);
                  }
                }}
                onMouseEnter={handleLinkHover}
                className={cn(
                  "py-1 text-xs font-mono tracking-wider font-semibold transition-all duration-200 hover:text-foreground cursor-pointer flex items-center gap-1 whitespace-nowrap shrink-0",
                  (pathname === "/" && activeSection === "case-studies") || pathname === "/case-studies" || pathname.startsWith("/case-studies/")
                    ? "text-brand-cyan font-bold"
                    : "text-muted"
                )}
                label="Engineering Case Studies"
              >
                Work
              </TransitionLink>

              {/* Arcade & Labs Dropdown */}
              {persona !== "technical" && (
                <div className="relative shrink-0">
                  <button
                    type="button"
                    onClick={() => setActiveDropdown(activeDropdown === "arcade" ? null : "arcade")}
                    onMouseEnter={handleLinkHover}
                    className={cn(
                      "py-1 text-xs font-mono tracking-wider font-semibold transition-all duration-200 hover:text-foreground cursor-pointer flex items-center gap-1 focus-visible:ring-1 focus-visible:ring-brand-cyan rounded whitespace-nowrap shrink-0",
                      isArcadeActive || activeDropdown === "arcade"
                        ? "text-brand-cyan font-bold"
                        : "text-muted"
                    )}
                    aria-expanded={activeDropdown === "arcade"}
                    aria-haspopup="true"
                  >
                    <span className="whitespace-nowrap">Arcade &amp; Labs</span>
                    <IconChevronDown
                      className={cn(
                        "w-3 h-3 transition-transform duration-200 shrink-0",
                        activeDropdown === "arcade" ? "rotate-180 text-brand-cyan" : "text-zinc-500"
                      )}
                    />
                  </button>

                  <AnimatePresence>
                    {activeDropdown === "arcade" && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 6, scale: 0.98 }}
                        transition={{ duration: 0.15 }}
                        className="absolute left-0 mt-3 w-80 p-2.5 rounded-2xl border border-zinc-800 bg-zinc-950/95 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.9),0_0_20px_rgba(6,182,212,0.08)] z-50 flex flex-col gap-1"
                        role="menu"
                      >
                        <div className="px-3 py-1.5 border-b border-zinc-800/80 mb-1 flex items-center justify-between">
                          <span className="text-[10px] font-mono uppercase font-bold tracking-widest text-zinc-400">
                            Interactive Arcade &amp; Labs
                          </span>
                          <span className="text-[9px] font-mono text-brand-cyan">60 FPS</span>
                        </div>
                        {ARCADE_ITEMS.map((item) => {
                          const isActive = pathname === item.href;
                          return (
                            <TransitionLink
                              key={item.href}
                              href={item.href}
                              onClick={() => setActiveDropdown(null)}
                              onMouseEnter={handleLinkHover}
                              className={cn(
                                "flex items-start gap-3 p-2.5 rounded-xl transition-all duration-150 group",
                                isActive
                                  ? "bg-brand-cyan/10 border border-brand-cyan/30 text-white"
                                  : "hover:bg-zinc-900/80 text-zinc-300 hover:text-white"
                              )}
                              role="menuitem"
                              label={item.title}
                            >
                              <div className="mt-0.5 p-1.5 rounded-lg bg-zinc-900 border border-zinc-800 group-hover:border-brand-cyan/30 transition-colors">
                                {item.icon}
                              </div>
                              <div className="flex flex-col min-w-0">
                                <span className="text-xs font-mono font-bold tracking-tight text-neutral-200 group-hover:text-brand-cyan transition-colors">
                                  {item.title}
                                </span>
                                <span className="text-[11px] font-sans text-zinc-400 truncate">
                                  {item.subtitle}
                                </span>
                              </div>
                            </TransitionLink>
                          );
                        })}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {/* Systems & Proof Dropdown */}
              <div className="relative shrink-0">
                <button
                  type="button"
                  onClick={() => setActiveDropdown(activeDropdown === "systems" ? null : "systems")}
                  onMouseEnter={handleLinkHover}
                  className={cn(
                    "py-1 text-xs font-mono tracking-wider font-semibold transition-all duration-200 hover:text-foreground cursor-pointer flex items-center gap-1 focus-visible:ring-1 focus-visible:ring-brand-cyan rounded whitespace-nowrap shrink-0",
                    isSystemsActive || activeDropdown === "systems"
                      ? "text-brand-cyan font-bold"
                      : "text-muted"
                  )}
                  aria-expanded={activeDropdown === "systems"}
                  aria-haspopup="true"
                >
                  <span className="whitespace-nowrap">Systems</span>
                  <IconChevronDown
                    className={cn(
                      "w-3 h-3 transition-transform duration-200 shrink-0",
                      activeDropdown === "systems" ? "rotate-180 text-brand-cyan" : "text-zinc-500"
                    )}
                  />
                </button>

                <AnimatePresence>
                  {activeDropdown === "systems" && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 6, scale: 0.98 }}
                      transition={{ duration: 0.15 }}
                      className="absolute left-0 mt-3 w-72 p-2.5 rounded-2xl border border-zinc-800 bg-zinc-950/95 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.9),0_0_20px_rgba(6,182,212,0.08)] z-50 flex flex-col gap-1"
                      role="menu"
                    >
                      <div className="px-3 py-1.5 border-b border-zinc-800/80 mb-1">
                        <span className="text-[10px] font-mono uppercase font-bold tracking-widest text-zinc-400">
                          Workspaces &amp; Verification
                        </span>
                      </div>
                      {SYSTEMS_ITEMS.filter((item) => !(persona === "technical" && item.href === "/simulator")).map((item) => {
                        const isActive = pathname === item.href;
                        return (
                          <TransitionLink
                            key={item.href}
                            href={item.href}
                            onClick={() => setActiveDropdown(null)}
                            onMouseEnter={handleLinkHover}
                            className={cn(
                              "flex items-start gap-3 p-2.5 rounded-xl transition-all duration-150 group",
                              isActive
                                ? "bg-brand-cyan/10 border border-brand-cyan/30 text-white"
                                : "hover:bg-zinc-900/80 text-zinc-300 hover:text-white"
                            )}
                            role="menuitem"
                            label={item.title}
                          >
                            <div className="mt-0.5 p-1.5 rounded-lg bg-zinc-900 border border-zinc-800 group-hover:border-brand-cyan/30 transition-colors">
                              {item.icon}
                            </div>
                            <div className="flex flex-col min-w-0">
                              <span className="text-xs font-mono font-bold tracking-tight text-neutral-200 group-hover:text-brand-cyan transition-colors">
                                {item.title}
                              </span>
                              <span className="text-[11px] font-sans text-zinc-400 truncate">
                                {item.subtitle}
                              </span>
                            </div>
                          </TransitionLink>
                        );
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* About Pillar */}
              <TransitionLink
                href="/#about"
                onClick={(e) => handleNavClick(e, "/#about")}
                onMouseEnter={handleLinkHover}
                className={cn(
                  "py-1 text-xs font-mono tracking-wider font-semibold transition-all duration-200 hover:text-foreground cursor-pointer flex items-center gap-1 whitespace-nowrap shrink-0",
                  pathname === "/" && activeSection === "about"
                    ? "text-brand-cyan font-bold"
                    : "text-muted"
                )}
                label="About & Experience"
              >
                About
              </TransitionLink>

              {/* Contact Pillar */}
              <TransitionLink
                href="/#contact"
                onClick={(e) => handleNavClick(e, "/#contact")}
                onMouseEnter={handleLinkHover}
                className={cn(
                  "py-1 text-xs font-mono tracking-wider font-semibold transition-all duration-200 hover:text-foreground cursor-pointer flex items-center gap-1 whitespace-nowrap shrink-0",
                  pathname === "/" && activeSection === "contact"
                    ? "text-brand-cyan font-bold"
                    : "text-muted"
                )}
                label="Contact"
              >
                Contact
              </TransitionLink>

              {/* GitHub External */}
              <a
                href="https://github.com/fderuiter/portfolio"
                target="_blank"
                rel="noopener noreferrer"
                onMouseEnter={handleLinkHover}
                className="py-1 text-xs font-mono tracking-wider font-semibold text-muted hover:text-foreground transition-all duration-200 cursor-pointer flex items-center gap-1 group whitespace-nowrap shrink-0"
                aria-label="View source repository on GitHub"
              >
                <span>GitHub</span>
                <span className="text-[10px] text-zinc-600 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
                  ↗
                </span>
              </a>
            </nav>

            {/* Quick-Access ⌘K Command Palette Trigger Button */}
            <button
              type="button"
              onClick={openSearch}
              onMouseEnter={handleLinkHover}
              className="flex items-center gap-1.5 md:gap-2 px-2.5 md:px-3 py-1.5 rounded-xl border border-zinc-800 bg-zinc-900/60 hover:border-brand-cyan/40 hover:bg-zinc-900 text-zinc-400 hover:text-white transition-all cursor-pointer shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-cyan/40 shrink-0 whitespace-nowrap"
              aria-label="Search portfolio and commands (Press Command+K)"
            >
              <IconSearch className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
              <span className="text-xs font-mono hidden lg:inline">Search</span>
              <kbd className="kbd-badge text-[10px] text-zinc-400 font-mono">⌘K</kbd>
            </button>

            {/* Global Persona Toggle (Desktop) */}
            <div className="flex p-0.5 bg-zinc-900/85 border border-zinc-800/80 rounded-xl text-[10px] font-mono shrink-0 select-none">
              <button
                type="button"
                onClick={() => setPersona("technical")}
                className={cn(
                  "flex items-center justify-center gap-1 px-2 md:px-2.5 py-1.5 rounded-lg font-bold transition-all duration-200 cursor-pointer min-h-8 shrink-0 whitespace-nowrap",
                  persona === "technical"
                    ? "bg-zinc-950 text-amber-400 border border-amber-400/20 shadow-[0_0_8px_rgba(251,191,36,0.15)]"
                    : "text-zinc-500 hover:text-zinc-300 border border-transparent"
                )}
                aria-label="Switch to Technical Persona"
              >
                <IconFlame className="w-3.5 h-3.5 shrink-0" />
                <span className="hidden xl:inline">TECHNICAL</span>
              </button>
              <button
                type="button"
                onClick={() => setPersona("recruiter")}
                className={cn(
                  "flex items-center justify-center gap-1 px-2 md:px-2.5 py-1.5 rounded-lg font-bold transition-all duration-200 cursor-pointer min-h-8 shrink-0 whitespace-nowrap",
                  persona === "recruiter"
                    ? "bg-zinc-950 text-brand-cyan border border-brand-cyan/20 shadow-[0_0_8px_rgba(6,182,212,0.15)]"
                    : "text-zinc-500 hover:text-zinc-300 border border-transparent"
                )}
                aria-label="Switch to Recruiter Persona"
              >
                <IconBriefcase className="w-3.5 h-3.5 shrink-0" />
                <span className="hidden xl:inline">RECRUITER</span>
              </button>
            </div>

            {/* Audio Controller Desktop */}
            <div className="relative shrink-0">
              <button
                type="button"
                onClick={() => setShowAudioPanel(!showAudioPanel)}
                className={cn(
                  "flex items-center gap-1.5 px-2.5 md:px-3 py-1.5 rounded-full border transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand-cyan/40 shrink-0 whitespace-nowrap",
                  !muted
                    ? "border-brand-cyan/40 bg-brand-cyan/5 text-brand-cyan shadow-[0_0_12px_rgba(6,182,212,0.15)]"
                    : "border-zinc-900 bg-zinc-900/40 hover:border-brand-cyan/40 text-zinc-400 hover:text-foreground"
                )}
                aria-label="Sound Settings"
                aria-expanded={showAudioPanel}
              >
                {muted ? (
                  <IconVolumeOff className="w-3.5 h-3.5 text-zinc-500" />
                ) : (
                  <div className="flex items-center gap-0.5" aria-hidden="true">
                    <span className="w-0.5 h-2.5 bg-brand-cyan rounded-full animate-[pulse_1s_ease-in-out_infinite]" />
                    <span className="w-0.5 h-3.5 bg-brand-cyan rounded-full animate-[pulse_1.4s_ease-in-out_infinite]" />
                    <span className="w-0.5 h-2 bg-brand-cyan rounded-full animate-[pulse_0.8s_ease-in-out_infinite]" />
                  </div>
                )}
                <span className="text-[10px] font-mono tracking-wider font-bold">
                  SOUND: {muted ? "OFF" : profile.toUpperCase()}
                </span>
                <IconChevronDown className="w-3 h-3 text-zinc-500" />
              </button>

              <AnimatePresence>
                {showAudioPanel && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setShowAudioPanel(false)}
                    />
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute right-0 mt-2 w-64 p-4 rounded-2xl border border-zinc-800/80 bg-zinc-950/95 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.8),0_0_25px_rgba(6,182,212,0.08)] z-50 flex flex-col gap-3.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-mono font-bold tracking-wider text-zinc-400">
                          SYNTH SETTINGS
                        </span>
                        <button
                          type="button"
                          onClick={() => setMuted(!muted)}
                          className="px-2 py-0.5 rounded text-[10px] font-mono font-black border border-zinc-900 bg-zinc-900/50 hover:border-brand-cyan/40 text-brand-cyan transition-all cursor-pointer"
                        >
                          {muted ? "UNMUTE" : "MUTE"}
                        </button>
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <div className="flex justify-between text-[10px] font-mono text-zinc-500">
                          <span>Volume</span>
                          <span>{Math.round(volume * 100)}%</span>
                        </div>
                        <input
                          type="range"
                          aria-label="Volume"
                          min="0"
                          max="100"
                          value={Math.round(volume * 100)}
                          onChange={(e) => setVolume(parseFloat(e.target.value) / 100)}
                          disabled={muted}
                          className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-brand-cyan disabled:opacity-40 disabled:cursor-not-allowed"
                        />
                      </div>

                      <div className="flex flex-col gap-2">
                        <span className="text-[10px] font-mono text-zinc-500">Sound Profile</span>
                        <div className="flex flex-col gap-1.5">
                          {(["8-bit", "90s-retro", "ambient"] as const).map((p) => (
                            <button
                              key={p}
                              type="button"
                              onClick={() => setProfile(p)}
                              disabled={muted}
                              className={cn(
                                "w-full text-left px-3 py-1.5 rounded-lg border text-[10px] font-mono tracking-wider transition-all duration-200 cursor-pointer active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed",
                                profile === p
                                  ? "bg-brand-cyan/10 border-brand-cyan/40 text-brand-cyan font-bold shadow-[0_0_12px_rgba(6,182,212,0.12)]"
                                  : "bg-zinc-900/20 border-zinc-900 hover:border-zinc-800 text-zinc-400 hover:text-foreground"
                              )}
                            >
                              {p === "8-bit" ? "8-Bit Retro" : p === "90s-retro" ? "90s Retro" : "Ambient Pad"}
                            </button>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Mobile Header Actions (Search Button + Hamburger) */}
          <div className="md:hidden flex items-center gap-2 relative z-50">
            <button
              type="button"
              onClick={openSearch}
              className="flex items-center justify-center w-9 h-9 rounded-xl border border-zinc-800 bg-zinc-900/60 text-zinc-300 hover:text-brand-cyan transition-colors cursor-pointer"
              aria-label="Open Command Search"
            >
              <IconSearch className="w-4 h-4" />
            </button>

            {/* Mobile Hamburger Trigger */}
            <button
              ref={triggerRef}
              type="button"
              aria-expanded={isOpen}
              aria-controls="mobile-navigation"
              aria-label={isOpen ? "Close navigation menu" : "Open navigation menu"}
              onClick={() => setIsOpen(!isOpen)}
              className="flex items-center justify-center w-9 h-9 rounded-xl border border-zinc-800 bg-zinc-900/60 text-muted hover:text-foreground transition-colors cursor-pointer"
            >
              <svg
                className="w-5 h-5 fill-current"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <rect
                  y="4"
                  width="24"
                  height="2"
                  rx="1"
                  className={cn(
                    "origin-center transition-all duration-300",
                    isOpen ? "rotate-45 translate-y-[6px]" : ""
                  )}
                />
                <rect
                  y="11"
                  width="24"
                  height="2"
                  rx="1"
                  className={cn(
                    "transition-all duration-300",
                    isOpen ? "opacity-0" : ""
                  )}
                />
                <rect
                  y="18"
                  width="24"
                  height="2"
                  rx="1"
                  className={cn(
                    "origin-center transition-all duration-300",
                    isOpen ? "-rotate-45 -translate-y-[8px]" : ""
                  )}
                />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Full-Screen Navigation Slide-out */}
      <AnimatePresence>
        {isOpen && (
          <div
            ref={mobileMenuTrapRef}
            id="mobile-navigation"
            role="dialog"
            aria-modal="true"
            aria-label="Mobile navigation overlay"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setIsOpen(false);
                if (typeof document !== "undefined") {
                  document.body.style.overflow = "";
                }
              }
            }}
            className="fixed inset-0 z-40 bg-zinc-950/98 backdrop-blur-2xl flex flex-col justify-between pt-[max(6rem,env(safe-area-inset-top)+4.5rem)] pb-[max(2rem,env(safe-area-inset-bottom)+1.5rem)] px-[max(1.5rem,env(safe-area-inset-left)+1rem)] overflow-y-auto"
          >
            {/* Ambient gradients */}
            <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-brand-cyan/10 blur-[130px] pointer-events-none" />
            <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-80 h-80 rounded-full bg-brand-blue/5 blur-[130px] pointer-events-none" />

            <div className="relative z-10 flex flex-col gap-6">
              {/* Primary Navigation Sections */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Core Section */}
                <div className="flex flex-col gap-2">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 font-bold px-1">
                    Core Navigation
                  </span>
                  <TransitionLink
                    href={pathname === "/" ? "/#case-studies" : "/case-studies"}
                    onClick={(e) => handleNavClick(e, pathname === "/" ? "/#case-studies" : "/case-studies")}
                    className="min-h-[48px] px-3.5 py-3 rounded-xl bg-zinc-900/40 border border-zinc-800/80 text-base font-bold text-neutral-200 hover:text-brand-cyan hover:border-brand-cyan/30 flex items-center justify-between active:scale-[0.99] transition-all"
                    label="Engineering Case Studies"
                  >
                    <span>Engineering Case Studies</span>
                    <span className="text-xs font-mono text-zinc-500">→</span>
                  </TransitionLink>
                  <TransitionLink
                    href="/#about"
                    onClick={(e) => handleNavClick(e, "/#about")}
                    className="min-h-[48px] px-3.5 py-3 rounded-xl bg-zinc-900/40 border border-zinc-800/80 text-base font-bold text-neutral-200 hover:text-brand-cyan hover:border-brand-cyan/30 flex items-center justify-between active:scale-[0.99] transition-all"
                    label="About & Experience"
                  >
                    <span>About &amp; Experience</span>
                    <span className="text-xs font-mono text-zinc-500">→</span>
                  </TransitionLink>
                  <TransitionLink
                    href="/#contact"
                    onClick={(e) => handleNavClick(e, "/#contact")}
                    className="min-h-[48px] px-3.5 py-3 rounded-xl bg-zinc-900/40 border border-zinc-800/80 text-base font-bold text-neutral-200 hover:text-brand-cyan hover:border-brand-cyan/30 flex items-center justify-between active:scale-[0.99] transition-all"
                    label="Contact"
                  >
                    <span>Contact</span>
                    <span className="text-xs font-mono text-zinc-500">→</span>
                  </TransitionLink>
                  <TransitionLink
                    href="/schedule"
                    onClick={(e) => handleNavClick(e, "/schedule")}
                    className="min-h-[48px] px-3.5 py-3 rounded-xl bg-zinc-900/40 border border-zinc-800/80 text-sm font-semibold text-neutral-300 hover:text-white flex items-center justify-between active:scale-[0.99] transition-all"
                    label="Office Hours & Schedule"
                  >
                    <span>Office Hours &amp; Schedule</span>
                    <span className="text-xs font-mono text-zinc-500">→</span>
                  </TransitionLink>
                </div>

                {/* Interactive Tools & Arcade */}
                <div className="flex flex-col gap-2">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 font-bold px-1">
                    Systems Studios &amp; Arcade
                  </span>
                  <TransitionLink
                    href="/crf"
                    onClick={(e) => handleNavClick(e, "/crf")}
                    className="min-h-[48px] px-3.5 py-3 rounded-xl bg-zinc-900/40 border border-zinc-800/80 text-sm font-semibold text-neutral-200 hover:text-brand-cyan flex items-center justify-between active:scale-[0.99] transition-all"
                    label="CRF Studio & EDC"
                  >
                    <span className="flex items-center gap-2">
                      <IconFileSpreadsheet className="w-4 h-4 text-brand-cyan" />
                      CRF Studio &amp; EDC
                    </span>
                    <span className="text-[10px] font-mono text-brand-cyan px-1.5 py-0.5 rounded bg-brand-cyan/10">CDISC</span>
                  </TransitionLink>
                  <TransitionLink
                    href="/proof"
                    onClick={(e) => handleNavClick(e, "/proof")}
                    className="min-h-[48px] px-3.5 py-3 rounded-xl bg-zinc-900/40 border border-zinc-800/80 text-sm font-semibold text-neutral-200 hover:text-brand-cyan flex items-center justify-between active:scale-[0.99] transition-all"
                    label="Proof Canvas"
                  >
                    <span className="flex items-center gap-2">
                      <IconBrain className="w-4 h-4 text-brand-purple" />
                      Proof Canvas
                    </span>
                    <span className="text-[10px] font-mono text-brand-purple px-1.5 py-0.5 rounded bg-brand-purple/10">AST</span>
                  </TransitionLink>
                  <TransitionLink
                    href="/neuro"
                    onClick={(e) => handleNavClick(e, "/neuro")}
                    className="min-h-[48px] px-3.5 py-3 rounded-xl bg-zinc-900/40 border border-zinc-800/80 text-sm font-semibold text-neutral-200 hover:text-brand-cyan flex items-center justify-between active:scale-[0.99] transition-all"
                    label="NeuroRecon Studio"
                  >
                    <span className="flex items-center gap-2">
                      <IconBrain className="w-4 h-4 text-emerald-400" />
                      NeuroRecon Studio
                    </span>
                    <span className="text-[10px] font-mono text-emerald-400 px-1.5 py-0.5 rounded bg-emerald-500/10">3D MRI</span>
                  </TransitionLink>
                  <TransitionLink
                    href="/stack"
                    onClick={(e) => handleNavClick(e, "/stack")}
                    className="min-h-[48px] px-3.5 py-3 rounded-xl bg-zinc-900/40 border border-zinc-800/80 text-sm font-semibold text-neutral-200 hover:text-brand-cyan flex items-center justify-between active:scale-[0.99] transition-all"
                    label="Under the Hood (Stack)"
                  >
                    <span className="flex items-center gap-2">
                      <IconCpu className="w-4 h-4 text-brand-cyan" />
                      Under the Hood (Stack)
                    </span>
                    <span className="text-[10px] font-mono text-brand-cyan px-1.5 py-0.5 rounded bg-brand-cyan/10">Architecture</span>
                  </TransitionLink>
                  {persona !== "technical" && (
                    <TransitionLink
                      href="/arcade"
                      onClick={(e) => handleNavClick(e, "/arcade")}
                      className="min-h-[48px] px-3.5 py-3 rounded-xl bg-zinc-900/40 border border-zinc-800/80 text-base font-bold text-brand-cyan hover:bg-brand-cyan/10 flex items-center justify-between active:scale-[0.99] transition-all"
                      label="Arcade Games Hub"
                    >
                      <span className="flex items-center gap-2">
                        <IconDeviceGamepad2 className="w-4 h-4" />
                        Arcade Games Hub
                      </span>
                      <span className="text-xs font-mono text-brand-cyan">6 Games</span>
                    </TransitionLink>
                  )}
                </div>
              </div>

              {/* Mobile Persona Toggle */}
              <div className="border-t border-zinc-900/80 pt-4 flex flex-col gap-2.5">
                <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 font-bold px-1">
                  Perspective State
                </span>
                <div className="flex p-1 bg-zinc-900 border border-zinc-800 rounded-2xl text-xs font-mono w-full select-none">
                  <button
                    type="button"
                    onClick={() => setPersona("technical")}
                    className={cn(
                      "flex-1 flex items-center justify-center gap-1.5 min-h-11 py-2.5 rounded-xl font-bold transition-all cursor-pointer",
                      persona === "technical"
                        ? "bg-zinc-950 text-amber-400 border border-amber-400/20 shadow-[0_0_12px_rgba(251,191,36,0.15)]"
                        : "text-zinc-500 hover:text-zinc-300 border border-transparent"
                    )}
                  >
                    <IconFlame className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>TECHNICAL</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPersona("recruiter")}
                    className={cn(
                      "flex-1 flex items-center justify-center gap-1.5 min-h-11 py-2.5 rounded-xl font-bold transition-all cursor-pointer",
                      persona === "recruiter"
                        ? "bg-zinc-950 text-brand-cyan border border-brand-cyan/20 shadow-[0_0_12px_rgba(6,182,212,0.15)]"
                        : "text-zinc-500 hover:text-zinc-300 border border-transparent"
                    )}
                  >
                    <IconBriefcase className="w-3.5 h-3.5 text-brand-cyan shrink-0" />
                    <span>RECRUITER</span>
                  </button>
                </div>
              </div>

              {/* Mobile Audio Controls */}
              <div className="border-t border-zinc-900/80 pt-4 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {muted ? (
                      <IconVolumeOff className="w-4 h-4 text-zinc-500" />
                    ) : (
                      <IconVolume className="w-4 h-4 text-brand-cyan" />
                    )}
                    <span className="text-xs font-mono font-bold tracking-wider text-zinc-400">
                      SOUND: {muted ? "OFF" : profile.toUpperCase()}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setMuted(!muted)}
                    className="min-h-11 px-4 py-2 rounded-xl text-xs font-mono font-black border border-zinc-800 bg-zinc-900/50 hover:border-brand-cyan/40 text-brand-cyan transition-all cursor-pointer flex items-center justify-center"
                  >
                    {muted ? "UNMUTE" : "MUTE"}
                  </button>
                </div>

                {/* Volume Slider */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex justify-between text-xs font-mono text-zinc-500">
                    <span>Volume</span>
                    <span>{Math.round(volume * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    aria-label="Volume"
                    min="0"
                    max="100"
                    value={Math.round(volume * 100)}
                    onChange={(e) => setVolume(parseFloat(e.target.value) / 100)}
                    disabled={muted}
                    className="w-full h-3 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-brand-cyan disabled:opacity-40"
                  />
                </div>

                {/* Profiles Selection Grid */}
                <div className="grid grid-cols-3 gap-2 mt-1">
                  {(["8-bit", "90s-retro", "ambient"] as const).map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setProfile(p)}
                      disabled={muted}
                      className={cn(
                        "min-h-11 text-center px-2 py-2 rounded-xl border text-[11px] font-mono tracking-wider transition-all cursor-pointer disabled:opacity-40 flex items-center justify-center",
                        profile === p
                          ? "bg-brand-cyan/10 border-brand-cyan/40 text-brand-cyan font-bold"
                          : "bg-zinc-900/20 border-zinc-900 hover:border-zinc-800 text-zinc-400"
                      )}
                    >
                      {p === "8-bit" ? "8-Bit" : p === "90s-retro" ? "90s" : "Ambient"}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="relative z-10 pt-4 border-t border-zinc-900 flex items-center justify-between text-xs font-mono text-zinc-500">
              <span>© 2026 FREDERICK DE RUITER</span>
              <a
                href="https://github.com/fderuiter/portfolio"
                target="_blank"
                rel="noopener noreferrer"
                className="text-zinc-400 hover:text-brand-cyan flex items-center gap-1 min-h-11 px-2 py-2"
              >
                GitHub ↗
              </a>
            </div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

