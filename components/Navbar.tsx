"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { designManifest } from "@/lib/design-manifest";
import { useAudio } from "@/components/providers/AudioProvider";
import { IconVolume, IconVolumeOff, IconChevronDown } from "@tabler/icons-react";

interface NavItem {
  label: string;
  href: string;
  isExternal?: boolean;
}

const navItems: NavItem[] = [
  { label: "Work", href: "/#case-studies" },
  { label: "About", href: "/#about" },
  { label: "Proof Workspace", href: "/proof" },
  { label: "Transparency", href: "/transparency" },
  { label: "Simulator", href: "/simulator" },
  { label: "Contact", href: "/#contact" },
  { label: "GitHub", href: "https://github.com/fderuiter/portfolio", isExternal: true },
];

export const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState("hero");

  const { volume, muted, profile, setVolume, setMuted, setProfile, playHover } = useAudio();
  const [showAudioPanel, setShowAudioPanel] = useState(false);

  const handleLinkHover = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (typeof window === "undefined") return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pan = (rect.left + rect.width / 2) / window.innerWidth * 2 - 1;
    playHover(pan);
  };

  const pathname = usePathname();
  const [prevPathname, setPrevPathname] = useState(pathname);
  
  if (pathname !== prevPathname) {
    setPrevPathname(pathname);
    setIsOpen(false);
  }

  const menuRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  // 1. Scroll-driven backdrop color transition
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 30) {
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
    if (pathname !== "/") return;

    const sections = ["hero", "case-studies", "about", "contact"];

    const callback = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
        }
      });
    };

    const observer = new IntersectionObserver(callback, {
      rootMargin: "-25% 0px -55% 0px", // triggers when section dominates screen middle
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

  // 3. Accessibility: Keyboard focus trapping and Esc key listener
  useEffect(() => {
    if (!isOpen) return;

    // Focus the first link when menu opens
    const timer = setTimeout(() => {
      if (menuRef.current) {
        const firstLink = menuRef.current.querySelector("a");
        firstLink?.focus();
      }
    }, 100);

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
      if (e.key === "Escape") {
        setIsOpen(false);
        triggerRef.current?.focus();
        return;
      }

      if (e.key === "Tab") {
        if (!menuRef.current) return;
        const focusableElements = menuRef.current.querySelectorAll(
          'a[href], button:not([disabled])'
        );
        const elements = Array.from(focusableElements) as HTMLElement[];
        if (elements.length === 0) return;

        const firstElement = elements[0];
        const lastElement = elements[elements.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            lastElement.focus();
            e.preventDefault();
          }
        } else {
          if (document.activeElement === lastElement) {
            firstElement.focus();
            e.preventDefault();
          }
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    
    // Prevent body scrolling when mobile menu is active
    document.body.style.overflow = "hidden";

    return () => {
      clearTimeout(timer);
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Handle smooth scroll clicks on homepage
  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (pathname === "/" && href.startsWith("/#")) {
      e.preventDefault();
      const targetId = href.substring(2);
      const targetElement = document.getElementById(targetId);
      if (targetElement) {
        targetElement.scrollIntoView({ behavior: "smooth" });
        setActiveSection(targetId);
        setIsOpen(false);
      }
    }
  };

  return (
    <>
      {/* Navbar Container */}
      <header
        className={cn(
          "fixed top-0 inset-x-0 z-50 transition-all duration-300 w-full select-none",
          isScrolled
            ? "bg-zinc-950/80 backdrop-blur-xl border-b border-zinc-800/50 py-4"
            : "bg-transparent py-6"
        )}
      >
        <div className="max-w-6xl mx-auto px-6 md:px-12 flex justify-between items-center w-full">
          {/* Logo / Wordmark */}
          <Link
            href="/"
            onClick={(e) => handleNavClick(e, "/#hero")}
            className="group flex items-center gap-2.5 font-mono text-sm tracking-widest font-extrabold text-foreground cursor-pointer"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-cyan/70 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-cyan"></span>
            </span>
            <span>FDERUITER</span>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-8">
            <nav className="flex items-center gap-8">
              {navItems.map((item) => {
                const isSectionActive = pathname === "/" && item.href.startsWith("/#") && activeSection === item.href.substring(2);
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    target={item.isExternal ? "_blank" : undefined}
                    rel={item.isExternal ? "noopener noreferrer" : undefined}
                    onClick={(e) => handleNavClick(e, item.href)}
                    onMouseEnter={handleLinkHover}
                    className={cn(
                      "text-xs font-mono tracking-wider font-semibold transition-all duration-300 hover:text-foreground cursor-pointer flex items-center gap-1",
                      isSectionActive
                        ? "text-brand-cyan font-bold"
                        : "text-muted"
                    )}
                  >
                    {item.label}
                    {item.isExternal && <span className="text-[10px] text-zinc-600 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5">↗</span>}
                  </Link>
                );
              })}
            </nav>

            {/* Audio Controller Desktop */}
            <div className="relative">
              <button
                onClick={() => setShowAudioPanel(!showAudioPanel)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-full border transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand-cyan/40",
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
                    <div className="fixed inset-0 z-40" onClick={() => setShowAudioPanel(false)} />
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute right-0 mt-2 w-64 p-4 rounded-2xl border border-zinc-800/80 bg-zinc-950/95 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.8),0_0_25px_rgba(6,182,212,0.08)] z-50 flex flex-col gap-3.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-mono font-bold tracking-wider text-zinc-400">SYNTH SETTINGS</span>
                        <button
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

          {/* Mobile Actions Container */}
          <div className="md:hidden flex items-center gap-4 relative z-50">
            {/* Mobile Hamburger Trigger */}
            <button
              ref={triggerRef}
              aria-expanded={isOpen}
              aria-controls="mobile-navigation"
              aria-label={isOpen ? "Close navigation menu" : "Open navigation menu"}
              onClick={() => setIsOpen(!isOpen)}
              className="flex items-center justify-center w-8 h-8 text-muted hover:text-foreground transition-colors cursor-pointer"
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
            ref={menuRef}
            id="mobile-navigation"
            role="dialog"
            aria-modal="true"
            aria-label="Mobile navigation overlay"
            className="fixed inset-0 z-40 bg-zinc-950/95 backdrop-blur-2xl flex flex-col justify-center px-8"
          >
            {/* Ambient gradients */}
            <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-brand-cyan/10 blur-[130px] pointer-events-none" />
            <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-80 h-80 rounded-full bg-brand-blue/5 blur-[130px] pointer-events-none" />

            <nav className="flex flex-col gap-8 relative z-10">
              {navItems.map((item, index) => {
                const isSectionActive = pathname === "/" && item.href.startsWith("/#") && activeSection === item.href.substring(2);
                return (
                  <motion.div
                    key={item.label}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.08, ...designManifest.motion.springs.hero }}
                  >
                    <Link
                      href={item.href}
                      target={item.isExternal ? "_blank" : undefined}
                      rel={item.isExternal ? "noopener noreferrer" : undefined}
                      onClick={(e) => handleNavClick(e, item.href)}
                      onMouseEnter={handleLinkHover}
                      className={cn(
                        "text-3xl font-extrabold tracking-tight font-sans transition-all cursor-pointer flex items-center gap-2",
                        isSectionActive
                          ? "text-brand-cyan"
                          : "text-zinc-300 hover:text-white"
                      )}
                    >
                      {item.label}
                      {item.isExternal && <span className="text-lg text-zinc-600">↗</span>}
                    </Link>
                  </motion.div>
                );
              })}
            </nav>

            {/* Mobile Audio Controls */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="mt-8 border-t border-zinc-900/80 pt-6 flex flex-col gap-4 relative z-10 max-w-sm"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {muted ? (
                    <IconVolumeOff className="w-4 h-4 text-zinc-500" />
                  ) : (
                    <IconVolume className="w-4 h-4 text-brand-cyan" />
                  )}
                  <span className="text-xs font-mono font-bold tracking-wider text-zinc-400">SYNTH SETTINGS</span>
                </div>
                <button
                  onClick={() => setMuted(!muted)}
                  className="px-3 py-1 rounded-xl text-xs font-mono font-black border border-zinc-800 bg-zinc-900/50 hover:border-brand-cyan/40 text-brand-cyan transition-all cursor-pointer"
                >
                  {muted ? "UNMUTE" : "MUTE"}
                </button>
              </div>

              {/* Volume Slider */}
              <div className="flex flex-col gap-2">
                <div className="flex justify-between text-xs font-mono text-zinc-500">
                  <span>Volume</span>
                  <span>{Math.round(volume * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={Math.round(volume * 100)}
                  onChange={(e) => setVolume(parseFloat(e.target.value) / 100)}
                  disabled={muted}
                  className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-brand-cyan disabled:opacity-40"
                />
              </div>

              {/* Profiles Selection Grid */}
              <div className="flex flex-col gap-2">
                <span className="text-xs font-mono text-zinc-500">Sound Profile</span>
                <div className="grid grid-cols-3 gap-2">
                  {(["8-bit", "90s-retro", "ambient"] as const).map((p) => (
                    <button
                      key={p}
                      onClick={() => setProfile(p)}
                      disabled={muted}
                      className={cn(
                        "text-center px-2 py-2 rounded-xl border text-[10px] font-mono tracking-wider transition-all cursor-pointer disabled:opacity-40",
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
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              transition={{ delay: 0.4 }}
              className="absolute bottom-8 left-8 font-mono text-[10px] text-zinc-500 tracking-[0.2em]"
            >
              © 2026 FREDERICK DE RUITER
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
