"use client";

import React, { useState, useEffect, useCallback } from "react";
import { IconShieldCheck, IconActivity, IconLock, IconRefresh, IconExternalLink } from "@tabler/icons-react";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { NextPrevNav } from "@/components/ui/NextPrevNav";

interface TransparencyLog {
  id: string;
  category: "Security" | "Reliability" | "Access";
  timestamp: string;
  message: string;
  status: "SUCCESS" | "FAILURE" | "INFO";
  link?: string;
}

export default function TransparencyHub() {
  const [logs, setLogs] = useState<TransparencyLog[]>([]);
  const [filter, setFilter] = useState<"All" | "Security" | "Reliability" | "Access">("All");
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());

  const fetchLogs = useCallback(async (showLoading = false) => {
    try {
      if (showLoading) {
        setLoading(true);
      }
      setLoadError("");
      const res = await fetch("/api/transparency/logs");
      if (!res.ok) {
        throw new Error(`Telemetry request failed with status ${res.status}`);
      }
      const data = await res.json();
      setLogs(data);
      setLastRefreshed(new Date());
    } catch (err) {
      console.error("Failed to fetch logs:", err);
      setLoadError("Live telemetry is temporarily unavailable. Existing records may be stale.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Poll for updates every 15 seconds
  useEffect(() => {
    let ignore = false;
    fetch("/api/transparency/logs")
      .then((res) => {
        if (!res.ok) throw new Error(`Telemetry request failed with status ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (!ignore) {
          setLogs(data);
          setLastRefreshed(new Date());
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!ignore) {
          console.error("Failed to fetch logs:", err);
          setLoadError("Live telemetry is temporarily unavailable. Existing records may be stale.");
          setLoading(false);
        }
      });

    const interval = setInterval(() => {
      fetchLogs();
    }, 15000);

    return () => {
      ignore = true;
      clearInterval(interval);
    };
  }, [fetchLogs]);

  const filteredLogs = logs.filter(log => filter === "All" || log.category === filter);

  return (
    <div className="min-h-screen bg-zinc-950 text-foreground pt-32 pb-24 px-6 md:px-12 lg:px-24 relative overflow-hidden">
      {/* Ambient Background Glows */}
      <div className="absolute top-24 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-brand-cyan/5 blur-[140px] pointer-events-none -z-10 rounded-full" />
      <div className="absolute top-64 right-1/4 w-[400px] h-[250px] bg-brand-blue/5 blur-[120px] pointer-events-none -z-10 rounded-full" />

      <div className="max-w-5xl mx-auto flex flex-col items-center relative z-10">
        {/* Navigation Breadcrumb */}
        <div className="w-full flex items-center justify-between gap-4 mb-6 border-b border-zinc-900 pb-4 flex-wrap">
          <Breadcrumbs
            items={[
              { label: "Systems", href: "/#case-studies" },
              { label: "Transparency Hub" },
            ]}
          />
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
              Live Telemetry &amp; Security Audits
            </span>
          </div>
        </div>

        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold font-mono text-white tracking-tight text-center mb-3">
          Platform <span className="text-brand-cyan">Transparency Hub</span>
        </h1>
        <p className="text-xs sm:text-sm font-mono text-zinc-400 tracking-widest uppercase mb-8 text-center max-w-2xl leading-relaxed">
          Live verifiable telemetry, CI/CD operational reliability metrics, and active vulnerability audit log.
        </p>

        {/* Telemetry Summary KPI Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 w-full mb-8">
          <div className="p-3.5 bg-zinc-900/30 border border-zinc-800/80 rounded-2xl flex flex-col gap-1">
            <div className="flex items-center gap-1.5 text-[10px] font-mono text-zinc-500 uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              System Status
            </div>
            <span className={`text-sm font-bold font-mono ${loadError ? "text-amber-300" : "text-zinc-100"}`}>
              {loadError ? "TELEMETRY DEGRADED" : "100% OPERATIONAL"}
            </span>
          </div>
          <div className="p-3.5 bg-zinc-900/30 border border-zinc-800/80 rounded-2xl flex flex-col gap-1">
            <div className="flex items-center gap-1.5 text-[10px] font-mono text-zinc-500 uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
              Active Probes
            </div>
            <span className="text-sm font-bold font-mono text-zinc-100">0 VULNERABILITIES</span>
          </div>
          <div className="p-3.5 bg-zinc-900/30 border border-zinc-800/80 rounded-2xl flex flex-col gap-1">
            <div className="flex items-center gap-1.5 text-[10px] font-mono text-zinc-500 uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
              CI/CD Build
            </div>
            <span className="text-sm font-bold font-mono text-zinc-100">DETERMINISTIC</span>
          </div>
          <div className="p-3.5 bg-zinc-900/30 border border-zinc-800/80 rounded-2xl flex flex-col gap-1">
            <div className="flex items-center gap-1.5 text-[10px] font-mono text-zinc-500 uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-cyan animate-pulse" />
              Telemetry Sync
            </div>
            <span className="text-sm font-bold font-mono text-zinc-100">EDGE ACTIVE</span>
          </div>
        </div>

        {/* Controls */}
        <div className="w-full flex flex-col md:flex-row justify-between items-center mb-8 gap-4 bg-zinc-900/30 p-4 rounded-2xl border border-zinc-800">
          <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0" role="tablist" aria-label="Filter categories">
            {["All", "Security", "Reliability", "Access"].map((cat) => (
              <button
                key={cat}
                role="tab"
                aria-selected={filter === cat}
                aria-controls="transparency-log-list"
                onClick={() => setFilter(cat as typeof filter)}
                className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all whitespace-nowrap cursor-pointer ${
                  filter === cat 
                    ? "bg-brand-cyan/20 text-brand-cyan border border-brand-cyan/50 shadow-[0_0_12px_rgba(6,182,212,0.15)]" 
                    : "bg-zinc-950 border border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-4 text-xs font-mono text-zinc-500 self-end md:self-auto">
            <span aria-live="polite" suppressHydrationWarning>
              Last updated: {lastRefreshed.toLocaleTimeString()}
            </span>
            <button 
              onClick={() => fetchLogs(true)} 
              disabled={loading}
              aria-label="Refresh logs"
              className="p-2 bg-zinc-950 border border-zinc-800 rounded-lg hover:text-brand-cyan hover:border-brand-cyan/50 transition-colors cursor-pointer disabled:opacity-50"
            >
              <IconRefresh className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Logs List */}
        <div 
          id="transparency-log-list"
          className="w-full flex flex-col gap-3"
          role="region" 
          aria-live="polite" 
          aria-label="Transparency events list"
        >
          {loading && logs.length === 0 ? (
            <div className="py-24 flex justify-center items-center text-brand-cyan/50">
              <IconRefresh className="w-8 h-8 animate-spin" />
            </div>
          ) : loadError && logs.length === 0 ? (
            <div className="py-12 px-6 text-center text-amber-200 font-mono text-sm leading-relaxed border border-amber-500/30 bg-amber-500/5 rounded-2xl" role="alert">
              <p className="mb-2 font-bold">{loadError}</p>
              <p className="text-xs text-zinc-400">Please check your network connection or verify API service metrics.</p>
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="py-24 text-center text-zinc-500 font-mono text-sm border border-zinc-900 border-dashed rounded-2xl">
              No transparency logs recorded in this category.
            </div>
          ) : (
            filteredLogs.map((log) => (
              <div 
                key={log.id}
                className="p-5 bg-zinc-900/20 border border-zinc-800/60 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:border-zinc-700 transition-colors"
              >
                <div className="flex items-start gap-4">
                  <div className="mt-1 p-2 bg-zinc-950 border border-zinc-800 rounded-xl text-brand-cyan">
                    {log.category === "Security" && <IconShieldCheck className="w-4 h-4" />}
                    {log.category === "Reliability" && <IconActivity className="w-4 h-4" />}
                    {log.category === "Access" && <IconLock className="w-4 h-4" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <span className="text-xs font-mono font-bold text-neutral-200">
                        {log.category.toUpperCase()}
                      </span>
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                        log.status === "SUCCESS" ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" :
                        log.status === "FAILURE" ? "bg-rose-500/10 border-rose-500/30 text-rose-400" :
                        "bg-zinc-800 border-zinc-700 text-zinc-400"
                      }`}>
                        {log.status}
                      </span>
                    </div>
                    <p className="text-xs font-mono text-zinc-400 leading-relaxed">
                      {log.message}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 border-zinc-900 pt-3 md:pt-0">
                  <span className="text-[11px] font-mono text-zinc-600" suppressHydrationWarning>
                    {new Date(log.timestamp).toLocaleString()}
                  </span>
                  {log.link && (
                    <a 
                      href={log.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-400 hover:text-brand-cyan hover:border-brand-cyan/50 transition-colors"
                      aria-label="View external log source"
                    >
                      <IconExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Sequential Next / Prev Flow */}
        <NextPrevNav
          prev={{
            title: "Incident Alignment Simulator",
            href: "/simulator",
            label: "Systems Tool",
            tag: "Incident Commander",
          }}
          next={{
            title: "Schedule 1:1 Consultation",
            href: "/schedule",
            label: "Get In Touch",
            tag: "Google Calendar Booking",
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
