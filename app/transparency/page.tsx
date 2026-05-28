"use client";

import React, { useState, useEffect } from "react";
import { IconShieldCheck, IconActivity, IconLock, IconRefresh, IconExternalLink } from "@tabler/icons-react";

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
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/transparency/logs");
      if (res.ok) {
        const data = await res.json();
        setLogs(data);
        setLastRefreshed(new Date());
      }
    } catch (err) {
      console.error("Failed to fetch logs:", err);
    } finally {
      setLoading(false);
    }
  };

  // Poll for updates every 15 seconds
  useEffect(() => {
    let mounted = true;
    const loadData = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/transparency/logs");
        if (res.ok) {
          const data = await res.json();
          if (mounted) {
            setLogs(data);
            setLastRefreshed(new Date());
          }
        }
      } catch (err) {
        console.error("Failed to fetch logs:", err);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadData();
    const interval = setInterval(loadData, 15000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  const filteredLogs = logs.filter(log => filter === "All" || log.category === filter);

  return (
    <div className="min-h-screen bg-zinc-950 text-foreground pt-32 pb-24 px-6 md:px-12 lg:px-24">
      <div className="max-w-5xl mx-auto flex flex-col items-center">
        <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-brand-cyan to-brand-blue tracking-tight text-center mb-4">
          Platform Transparency Hub
        </h1>
        <p className="text-sm font-mono text-muted tracking-widest uppercase mb-12 text-center max-w-2xl leading-relaxed">
          Live verifiable telemetry, CI/CD operational reliability metrics, and active vulnerability scan history.
        </p>

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
                className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all whitespace-nowrap ${
                  filter === cat 
                    ? "bg-brand-cyan/20 text-brand-cyan border border-brand-cyan/50" 
                    : "bg-zinc-950 border border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-4 text-xs font-mono text-zinc-500 self-end md:self-auto">
            <span aria-live="polite">
              Last updated: {lastRefreshed.toLocaleTimeString()}
            </span>
            <button 
              onClick={fetchLogs} 
              disabled={loading}
              aria-label="Refresh logs"
              className="p-2 bg-zinc-950 border border-zinc-800 rounded-lg hover:text-brand-cyan hover:border-brand-cyan/50 transition-colors disabled:opacity-50"
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
          ) : filteredLogs.length === 0 ? (
            <div className="py-12 text-center text-zinc-500 font-mono text-sm border border-dashed border-zinc-800 rounded-2xl">
              No transparency logs found for this category.
            </div>
          ) : (
            filteredLogs.map((log) => (
              <div 
                key={log.id} 
                className="group flex flex-col md:flex-row md:items-center p-4 bg-zinc-900/20 hover:bg-zinc-900/40 border border-zinc-800/80 hover:border-zinc-700 rounded-xl transition-all gap-4"
              >
                {/* Category Icon & Time */}
                <div className="flex items-center md:w-48 shrink-0 gap-3">
                  <div className={`p-2 rounded-lg border flex items-center justify-center
                    ${log.category === 'Security' ? 'bg-indigo-950/30 border-indigo-900/50 text-indigo-400' : ''}
                    ${log.category === 'Reliability' ? 'bg-blue-950/30 border-blue-900/50 text-blue-400' : ''}
                    ${log.category === 'Access' ? 'bg-emerald-950/30 border-emerald-900/50 text-emerald-400' : ''}
                  `} aria-hidden="true">
                    {log.category === 'Security' && <IconShieldCheck className="w-5 h-5" />}
                    {log.category === 'Reliability' && <IconActivity className="w-5 h-5" />}
                    {log.category === 'Access' && <IconLock className="w-5 h-5" />}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-zinc-300">{log.category}</span>
                    <span className="text-[10px] font-mono text-zinc-500">
                      {new Date(log.timestamp).toLocaleDateString()} {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>

                {/* Message */}
                <div className="flex-1 text-sm text-zinc-400 leading-relaxed font-mono">
                  {log.message}
                </div>

                {/* Status & External Link */}
                <div className="flex items-center gap-4 shrink-0 mt-2 md:mt-0">
                  <span className={`text-[10px] font-mono font-bold px-2 py-1 rounded-md border
                    ${log.status === 'SUCCESS' ? 'bg-emerald-950/20 text-emerald-400 border-emerald-900/40' : ''}
                    ${log.status === 'FAILURE' ? 'bg-red-950/20 text-red-400 border-red-900/40' : ''}
                    ${log.status === 'INFO' ? 'bg-zinc-800/50 text-zinc-300 border-zinc-700' : ''}
                  `}>
                    {log.status}
                  </span>
                  {log.link ? (
                    <a 
                      href={log.link} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="p-1.5 text-zinc-500 hover:text-brand-cyan bg-zinc-950 border border-zinc-800 hover:border-brand-cyan/40 rounded-md transition-colors"
                      aria-label={`View external source for ${log.category} event`}
                      title="View External Proof"
                    >
                      <IconExternalLink className="w-4 h-4" />
                    </a>
                  ) : (
                    <div className="w-[30px]" aria-hidden="true" /> // Spacer for alignment if no link
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
