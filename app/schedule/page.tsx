"use client";

import React, { useState } from "react";
import {
  IconCalendar,
  IconClock,
  IconVideo,
  IconMail,
  IconExternalLink,
  IconShieldCheck,
  IconCpu,
  IconBrain,
  IconCheck,
} from "@tabler/icons-react";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { NextPrevNav } from "@/components/ui/NextPrevNav";

const GOOGLE_CALENDAR_URL = "https://calendar.app.google/YnR5oxos7ZTLyvUp8";

const CONSULTATION_TOPICS = [
  {
    icon: <IconCpu className="w-5 h-5 text-brand-cyan" />,
    title: "Systems Architecture & Scale",
    description: "Distributed systems design, Next.js / TypeScript architectures, event pipelines, and serverless reliability.",
  },
  {
    icon: <IconShieldCheck className="w-5 h-5 text-brand-cyan" />,
    title: "Clinical Data & GxP Compliance",
    description: "CDISC standards (ODM/SDTM), 21 CFR Part 11 electronic audit trails, EDC integrations, and HIPAA data pipelines.",
  },
  {
    icon: <IconBrain className="w-5 h-5 text-brand-cyan" />,
    title: "Full-Stack UI & Canvas Physics",
    description: "High-performance interactive interfaces, custom animation engines, design systems, and rigorous automated testing.",
  },
];

export default function SchedulePage() {
  const [iframeLoaded, setIframeLoaded] = useState(false);

  return (
    <div className="min-h-screen bg-zinc-950 text-foreground pt-32 pb-24 px-4 sm:px-6 md:px-12 lg:px-24 relative overflow-hidden">
      {/* Ambient Atmospheric Glows */}
      <div className="absolute top-24 left-1/2 -translate-x-1/2 w-[650px] h-[320px] bg-brand-cyan/5 blur-[140px] pointer-events-none -z-10 rounded-full" />
      <div className="absolute top-96 right-1/4 w-[450px] h-[280px] bg-brand-blue/5 blur-[120px] pointer-events-none -z-10 rounded-full" />

      <div className="max-w-5xl mx-auto flex flex-col items-center relative z-10">
        {/* Navigation Breadcrumb */}
        <div className="w-full flex items-center justify-between mb-8 gap-4 flex-wrap">
          <Breadcrumbs
            items={[
              { label: "Connect", href: "/#contact" },
              { label: "Schedule Consultation" },
            ]}
          />
          <div className="flex items-center gap-2 text-xs font-mono text-brand-cyan bg-brand-cyan/10 border border-brand-cyan/20 px-3 py-1 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-cyan animate-pulse" />
            <span>Calendar Live Sync</span>
          </div>
        </div>

        {/* Hero Header */}
        <div className="text-center max-w-3xl mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-xs font-mono text-zinc-300 mb-4">
            <IconCalendar className="w-3.5 h-3.5 text-brand-cyan" />
            <span>Google Calendar &amp; Meet Integration</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold font-mono text-white tracking-tight mb-4">
            Schedule a Technical Consultation
          </h1>
          <p className="text-sm sm:text-base text-zinc-400 font-sans leading-relaxed">
            Book a 1:1 technical sync with Frederick de Ruiter. Choose an available slot below to automatically sync to Google Calendar, generate a Google Meet video bridge, and receive instant email confirmations.
          </p>
        </div>

        {/* Feature Highlights Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full mb-10">
          {CONSULTATION_TOPICS.map((topic, i) => (
            <div
              key={i}
              className="p-5 rounded-2xl bg-zinc-900/30 border border-zinc-800/80 hover:border-brand-cyan/30 transition-all flex flex-col justify-start"
            >
              <div className="p-2.5 rounded-xl bg-zinc-950 border border-zinc-800/80 w-fit mb-3">
                {topic.icon}
              </div>
              <h2 className="text-sm font-mono font-bold text-white mb-1.5">
                {topic.title}
              </h2>
              <p className="text-xs text-zinc-400 leading-relaxed">
                {topic.description}
              </p>
            </div>
          ))}
        </div>

        {/* Booking Specs Bar */}
        <div className="w-full bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-4 sm:p-5 mb-8 flex flex-wrap items-center justify-between gap-4 text-xs font-mono text-zinc-300">
          <div className="flex items-center gap-6 flex-wrap">
            <span className="flex items-center gap-2">
              <IconClock className="w-4 h-4 text-brand-cyan" />
              <span>30-60 Min Sessions</span>
            </span>
            <span className="flex items-center gap-2">
              <IconVideo className="w-4 h-4 text-brand-cyan" />
              <span>Google Meet HD Video</span>
            </span>
            <span className="flex items-center gap-2">
              <IconMail className="w-4 h-4 text-brand-cyan" />
              <span>Instant Gmail Confirmation</span>
            </span>
          </div>

          <a
            href={GOOGLE_CALENDAR_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-brand-cyan text-zinc-950 font-bold hover:bg-brand-cyan/90 transition-colors cursor-pointer"
          >
            <span>Open in Google Calendar</span>
            <IconExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* Google Calendar Interactive Embed Widget */}
        <div className="w-full bg-zinc-900/20 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl relative">
          <div className="bg-zinc-900/60 px-4 py-3 border-b border-zinc-800 flex items-center justify-between text-xs font-mono text-zinc-400">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
              <span className="ml-2 text-zinc-300 font-semibold">calendar.google.com/appointments</span>
            </div>
            <span className="hidden sm:inline text-zinc-500">Encrypted HTTPS · TLS 1.3</span>
          </div>

          {!iframeLoaded && (
            <div className="w-full h-[650px] flex flex-col items-center justify-center bg-zinc-950 text-zinc-400 gap-3 font-mono text-xs">
              <div className="w-8 h-8 border-2 border-brand-cyan border-t-transparent rounded-full animate-spin" />
              <span>Loading Google Appointment Scheduler...</span>
            </div>
          )}

          <iframe
            src={GOOGLE_CALENDAR_URL}
            title="Google Calendar Appointment Scheduling"
            className={`w-full h-[700px] border-0 bg-white transition-opacity duration-300 ${
              iframeLoaded ? "opacity-100 block" : "opacity-0 absolute top-0 left-0"
            }`}
            onLoad={() => setIframeLoaded(true)}
          />
        </div>

        {/* Direct Contact Alternative Endpoints */}
        <div className="mt-16 pt-12 border-t border-zinc-900/80 w-full flex flex-col items-center text-center">
          <p className="text-xs font-mono text-zinc-400 uppercase tracking-widest mb-4">
            Prefer direct messaging or custom inquiries?
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <a
              href="mailto:fpderuiter@gmail.com"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-900/60 border border-zinc-800 text-xs font-mono text-zinc-300 hover:text-brand-cyan hover:border-brand-cyan/40 transition-colors"
            >
              <IconMail className="w-4 h-4 text-brand-cyan" />
              <span>fpderuiter@gmail.com</span>
            </a>
            <a
              href="https://www.linkedin.com/in/frederick-de-ruiter-88012467/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-900/60 border border-zinc-800 text-xs font-mono text-zinc-300 hover:text-brand-cyan hover:border-brand-cyan/40 transition-colors"
            >
              <IconCheck className="w-4 h-4 text-brand-cyan" />
              <span>LinkedIn Profile</span>
              <IconExternalLink className="w-3.5 h-3.5 text-zinc-500" />
            </a>
          </div>
        </div>

        {/* Sequential Next / Prev Flow */}
        <NextPrevNav
          prev={{
            title: "Platform Transparency Hub",
            href: "/transparency",
            label: "Systems & Security",
            tag: "Verifiable Telemetry",
          }}
          next={{
            title: "Arcade Games Hub",
            href: "/arcade",
            label: "Interactive Labs",
            tag: "6 Playable Games",
          }}
          backToHub={{
            title: "Return to Portfolio",
            href: "/",
          }}
        />
      </div>
    </div>
  );
}
