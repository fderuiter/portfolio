"use client";

import React from "react";
import { useTelemetry } from "@/hooks/useTelemetry";

export function ContactCards() {
  const { recordEvent } = useTelemetry();

  const handleTrackClick = (slug: string) => {
    // Silently dispatch without blocking or awaiting the network call
    recordEvent(slug, "contact_click").catch((err) => {
      console.error("Failed to track contact click event:", err);
    });
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 w-full max-w-2xl justify-center items-center">
      {/* Direct Email */}
      <a
        href="mailto:contact@fderuiter.com"
        aria-label="Send an email to Frederick de Ruiter at contact@fderuiter.com"
        onClick={() => handleTrackClick("contact-email")}
        className="group flex flex-col items-center justify-center p-6 bg-zinc-900/10 border border-zinc-900/50 rounded-2xl transition-all duration-300 hover:border-brand-cyan/40 hover:shadow-[0_0_15px_rgba(6,182,212,0.05)] text-center cursor-pointer"
      >
        <span className="w-8 h-8 rounded-xl bg-zinc-950 border border-zinc-900 flex items-center justify-center font-mono text-zinc-400 group-hover:text-brand-cyan group-hover:border-brand-cyan/25 transition-colors mb-3">
          ✉
        </span>
        <span className="text-xs font-mono font-bold text-neutral-200 mb-1">Email Broadcast</span>
        <span className="text-[10px] font-mono text-zinc-500">contact@fderuiter.com</span>
      </a>
      
      {/* GitHub Portal */}
      <a
        href="https://github.com/fderuiter"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="View Frederick de Ruiter's GitHub profile externally"
        onClick={() => handleTrackClick("contact-github")}
        className="group flex flex-col items-center justify-center p-6 bg-zinc-900/10 border border-zinc-900/50 rounded-2xl transition-all duration-300 hover:border-brand-cyan/40 hover:shadow-[0_0_15px_rgba(6,182,212,0.05)] text-center cursor-pointer"
      >
        <span className="w-8 h-8 rounded-xl bg-zinc-950 border border-zinc-900 flex items-center justify-center font-mono text-zinc-400 group-hover:text-brand-cyan group-hover:border-brand-cyan/25 transition-colors mb-3">
          🐙
        </span>
        <span className="text-xs font-mono font-bold text-neutral-200 mb-1">GitHub Repos</span>
        <span className="text-[10px] font-mono text-zinc-500">github.com/fderuiter</span>
      </a>

      {/* LinkedIn Connection */}
      <a
        href="https://linkedin.com"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="View Frederick de Ruiter's LinkedIn profile externally"
        onClick={() => handleTrackClick("contact-linkedin")}
        className="group flex flex-col items-center justify-center p-6 bg-zinc-900/10 border border-zinc-900/50 rounded-2xl transition-all duration-300 hover:border-brand-blue/40 hover:shadow-[0_0_15px_rgba(59,130,246,0.05)] text-center cursor-pointer"
      >
        <span className="w-8 h-8 rounded-xl bg-zinc-950 border border-zinc-900 flex items-center justify-center font-mono text-zinc-400 group-hover:text-brand-blue group-hover:border-brand-blue/25 transition-colors mb-3">
          in
        </span>
        <span className="text-xs font-mono font-bold text-neutral-200 mb-1">LinkedIn Network</span>
        <span className="text-[10px] font-mono text-zinc-500">Secure Profile Link</span>
      </a>
    </div>
  );
}
