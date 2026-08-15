"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  IconArrowUp,
  IconBrandGithub,
  IconBrandLinkedin,
  IconMail,
  IconCalendar,
  IconTerminal,
  IconActivity,
  IconShieldCheck,
  IconCrosshair,
  IconBrain,
  IconCpu,
  IconBone,
  IconSparkles,
} from "@tabler/icons-react";
import { useAudio } from "@/components/providers/AudioProvider";
import { usePersona } from "@/components/providers/PersonaProvider";

export const Footer: React.FC = () => {
  const pathname = usePathname();
  const { playHover, playSuccess } = useAudio();
  const { persona } = usePersona();

  const handleHover = (e: React.MouseEvent<HTMLElement>) => {
    if (typeof window === "undefined") return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pan = ((rect.left + rect.width / 2) / window.innerWidth) * 2 - 1;
    playHover(pan);
  };

  const scrollToTop = () => {
    if (typeof window !== "undefined") {
      playSuccess();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleHashClick = (e: React.MouseEvent<HTMLAnchorElement>, hash: string) => {
    if (pathname === "/") {
      e.preventDefault();
      const el = document.getElementById(hash);
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  return (
    <footer className="w-full bg-zinc-950 border-t border-zinc-900 relative z-20 select-none">
      {/* Top Ambient Highlight */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-brand-cyan/20 to-transparent" />

      <div className="max-w-6xl mx-auto px-6 md:px-12 pt-16 pb-[max(4rem,env(safe-area-inset-bottom)+2rem)]">
        {/* Main Grid */}
        <div className={`grid grid-cols-1 sm:grid-cols-2 ${persona === "technical" ? "lg:grid-cols-4" : "lg:grid-cols-5"} gap-10 lg:gap-8 mb-16`}>
          {/* Col 1: Brand & Bio */}
          <div className="lg:col-span-2 flex flex-col justify-between space-y-6">
            <div className="space-y-3">
              <Link
                href="/"
                onMouseEnter={handleHover}
                className="inline-flex items-center gap-2.5 font-mono text-sm tracking-widest font-extrabold text-foreground group"
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-cyan/70 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-cyan" />
                </span>
                <span className="group-hover:text-brand-cyan transition-colors">FDERUITER</span>
              </Link>
              <p className="text-xs font-mono text-zinc-400 max-w-sm leading-relaxed">
                Clinical data specialist by day, creative coder by night. Building reliable software and fun interactive web stuff.
              </p>
            </div>

            {/* Live Operational Status Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-900/80 border border-zinc-800 text-[11px] font-mono text-zinc-300 w-fit">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>All Systems Operational</span>
              <span className="text-zinc-600">|</span>
              <span className="text-zinc-400">Next.js Edge</span>
            </div>
          </div>

          {/* Col 2: Interactive Arcade */}
          {persona !== "technical" && (
            <div className="space-y-4">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                <IconSparkles className="w-3.5 h-3.5 text-brand-cyan" />
                Arcade &amp; Labs
              </span>
              <ul className="space-y-2 text-xs font-mono">
                <li>
                  <Link
                    href="/arcade"
                    onMouseEnter={handleHover}
                    className="text-zinc-400 hover:text-brand-cyan transition-colors"
                  >
                    Arcade Hub Index ↗
                  </Link>
                </li>
                <li>
                  <Link
                    href="/arcade/laser-loon"
                    onMouseEnter={handleHover}
                    className="text-zinc-400 hover:text-brand-cyan transition-colors flex items-center gap-1.5"
                  >
                    <IconCrosshair className="w-3 h-3 text-cyan-400" />
                    Laser Loon
                  </Link>
                </li>
                <li>
                  <Link
                    href="/arcade/quasi-puzzler"
                    onMouseEnter={handleHover}
                    className="text-zinc-400 hover:text-brand-cyan transition-colors flex items-center gap-1.5"
                  >
                    <IconBrain className="w-3 h-3 text-cyan-400" />
                    Quasi-Puzzler
                  </Link>
                </li>
                <li>
                  <Link
                    href="/arcade/garmin-watch"
                    onMouseEnter={handleHover}
                    className="text-zinc-400 hover:text-brand-cyan transition-colors flex items-center gap-1.5"
                  >
                    <IconCpu className="w-3 h-3 text-cyan-400" />
                    Garmin 32KB Runner
                  </Link>
                </li>
                <li>
                  <Link
                    href="/arcade/clinical-chaos"
                    onMouseEnter={handleHover}
                    className="text-zinc-400 hover:text-brand-cyan transition-colors flex items-center gap-1.5"
                  >
                    <IconShieldCheck className="w-3 h-3 text-cyan-400" />
                    Clinical Trial Chaos
                  </Link>
                </li>
                <li>
                  <Link
                    href="/arcade/retro-labyrinth"
                    onMouseEnter={handleHover}
                    className="text-zinc-400 hover:text-brand-cyan transition-colors flex items-center gap-1.5"
                  >
                    <IconTerminal className="w-3 h-3 text-cyan-400" />
                    Retro Labyrinth
                  </Link>
                </li>
                <li>
                  <Link
                    href="/arcade/working-with-duck"
                    onMouseEnter={handleHover}
                    className="text-zinc-400 hover:text-brand-cyan transition-colors flex items-center gap-1.5"
                  >
                    <IconBone className="w-3 h-3 text-amber-400" />
                    Working With Duck
                  </Link>
                </li>
              </ul>
            </div>
          )}

          {/* Col 3: Systems & Verification */}
          <div className="space-y-4">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
              <IconTerminal className="w-3.5 h-3.5 text-brand-cyan" />
              Systems
            </span>
            <ul className="space-y-2 text-xs font-mono">
              <li>
                <Link
                  href="/#case-studies"
                  onClick={(e) => handleHashClick(e, "case-studies")}
                  onMouseEnter={handleHover}
                  className="text-zinc-400 hover:text-brand-cyan transition-colors"
                >
                  Featured Projects
                </Link>
              </li>
              <li>
                <Link
                  href="/proof"
                  onMouseEnter={handleHover}
                  className="text-zinc-400 hover:text-brand-cyan transition-colors flex items-center gap-1.5"
                >
                  <IconBrain className="w-3 h-3 text-brand-cyan" />
                  Proof Workspace
                </Link>
              </li>
              {persona !== "technical" && (
                <li>
                  <Link
                    href="/simulator"
                    onMouseEnter={handleHover}
                    className="text-zinc-400 hover:text-brand-cyan transition-colors flex items-center gap-1.5"
                  >
                    <IconActivity className="w-3 h-3 text-brand-cyan" />
                    Incident Simulator
                  </Link>
                </li>
              )}
              <li>
                <Link
                  href="/#about"
                  onClick={(e) => handleHashClick(e, "about")}
                  onMouseEnter={handleHover}
                  className="text-zinc-400 hover:text-brand-cyan transition-colors"
                >
                  About &amp; Experience
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Connect & Schedule */}
          <div className="space-y-4">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
              <IconCalendar className="w-3.5 h-3.5 text-brand-cyan" />
              Connect
            </span>
            <ul className="space-y-2 text-xs font-mono">
              <li>
                <Link
                  href="/schedule"
                  onMouseEnter={handleHover}
                  className="text-brand-cyan font-bold hover:underline transition-all flex items-center gap-1.5"
                >
                  <IconCalendar className="w-3 h-3 text-brand-cyan" />
                  Schedule 1:1 Sync ↗
                </Link>
              </li>
              <li>
                <a
                  href="mailto:fpderuiter@gmail.com"
                  onMouseEnter={handleHover}
                  className="text-zinc-400 hover:text-brand-cyan transition-colors flex items-center gap-1.5"
                >
                  <IconMail className="w-3 h-3 text-zinc-400" />
                  fpderuiter@gmail.com
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/fderuiter"
                  target="_blank"
                  rel="noopener noreferrer"
                  onMouseEnter={handleHover}
                  className="text-zinc-400 hover:text-brand-cyan transition-colors flex items-center gap-1.5"
                >
                  <IconBrandGithub className="w-3 h-3 text-zinc-400" />
                  GitHub Repos ↗
                </a>
              </li>
              <li>
                <a
                  href="https://www.linkedin.com/in/frederick-de-ruiter-88012467/"
                  target="_blank"
                  rel="noopener noreferrer"
                  onMouseEnter={handleHover}
                  className="text-zinc-400 hover:text-brand-cyan transition-colors flex items-center gap-1.5"
                >
                  <IconBrandLinkedin className="w-3 h-3 text-zinc-400" />
                  LinkedIn Network ↗
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Strip */}
        <div className="pt-8 border-t border-zinc-900/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-zinc-400">
          <div className="flex items-center gap-3">
            <span>&copy; {new Date().getFullYear()} Frederick de Ruiter. All rights reserved.</span>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/proof"
              onMouseEnter={handleHover}
              className="hover:text-brand-cyan transition-colors"
            >
              Systems Proof &amp; Verification
            </Link>
            <span className="text-zinc-700">&bull;</span>
            <button
              type="button"
              onClick={scrollToTop}
              onMouseEnter={handleHover}
              className="inline-flex items-center gap-1 text-zinc-400 hover:text-brand-cyan transition-colors cursor-pointer group"
              aria-label="Scroll back to top of page"
            >
              <span>Back to Top</span>
              <IconArrowUp className="w-3.5 h-3.5 transform group-hover:-translate-y-0.5 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
