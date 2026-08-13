"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useTelemetry } from "@/hooks/useTelemetry";

export default function NotFound() {
  const [mousePos, setMousePos] = useState({ x: 200, y: 200 });
  const [normalized, setNormalized] = useState({ x: 0.5, y: 0.5 });
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const hasTracked = useRef(false);

  const { recordEvent } = useTelemetry();

  useEffect(() => {
    if (hasTracked.current) return;
    hasTracked.current = true;

    const path = typeof window !== "undefined" ? window.location.pathname : "/not-found";
    recordEvent(path, "route_error").catch((err) => {
      console.error("Failed to record route error telemetry:", err);
    });
  }, [recordEvent]);

  // Automatically center the cursor on first mount / resize
  useEffect(() => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setMousePos({ x: rect.width / 2, y: rect.height / 2 });
    }
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Constrain within bounds
    const boundedX = Math.max(0, Math.min(x, rect.width));
    const boundedY = Math.max(0, Math.min(y, rect.height));

    const normX = boundedX / rect.width;
    const normY = boundedY / rect.height;

    setMousePos({ x: boundedX, y: boundedY });
    setNormalized({ x: normX, y: normY });

    // Tilt calculations
    const maxTilt = 8; // degrees max tilt
    const tiltX = -(normY - 0.5) * maxTilt;
    const tiltY = (normX - 0.5) * maxTilt;
    setTilt({ x: tiltX, y: tiltY });
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      // Smoothly animate back to center
      setTilt({ x: 0, y: 0 });
      setNormalized({ x: 0.5, y: 0.5 });
      setMousePos({ x: rect.width / 2, y: rect.height / 2 });
    }
    setIsHovered(false);
  };

  return (
    <main className="min-h-screen py-32 px-6 flex flex-col items-center justify-center bg-brand-dark text-foreground relative overflow-hidden select-none">
      {/* Background Blurs */}
      <div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-brand-cyan/5 blur-[120px] pointer-events-none transition-all duration-700" 
        style={{
          transform: `translate(-50%, -50%) translate(${(normalized.x - 0.5) * 40}px, ${(normalized.y - 0.5) * 40}px)`
        }}
      />
      
      <div 
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          transform: `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
          transition: isHovered ? "none" : "transform 0.5s cubic-bezier(0.25, 1, 0.5, 1)"
        }}
        className="relative z-10 w-full max-w-md p-8 bg-neutral-950/40 border border-neutral-900 rounded-3xl backdrop-blur-xl text-center shadow-2xl overflow-hidden group"
      >
        {/* Spotlight overlay effect following the mouse */}
        <div 
          className="absolute inset-0 pointer-events-none transition-opacity duration-300"
          style={{
            background: `radial-gradient(180px circle at ${mousePos.x}px ${mousePos.y}px, rgba(6, 182, 212, 0.08), transparent 80%)`,
            opacity: isHovered ? 1 : 0
          }}
        />

        {/* Lightweight grid background that shifts slightly */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.03]">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid-pattern" width="16" height="16" patternUnits="userSpaceOnUse">
                <path d="M 16 0 L 0 0 0 16" fill="none" stroke="currentColor" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid-pattern)" />
          </svg>
        </div>

        {/* Interactive target reticle/crosshair indicator */}
        <div 
          className="absolute pointer-events-none mix-blend-screen transition-all duration-75"
          style={{
            left: `${mousePos.x}px`,
            top: `${mousePos.y}px`,
            transform: 'translate(-50%, -50%)',
            opacity: isHovered ? 0.75 : 0.2
          }}
        >
          {/* Target Reticle circle */}
          <div className="w-12 h-12 rounded-full border border-brand-cyan/30 flex items-center justify-center animate-spin">
            <div className="w-1.5 h-1.5 rounded-full bg-brand-cyan" />
          </div>
          {/* Subtle crosshairs extending from reticle */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-[1px] bg-brand-cyan/20 pointer-events-none" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-20 w-[1px] bg-brand-cyan/20 pointer-events-none" />
        </div>

        <span className="inline-block px-3 py-1 text-xs font-mono font-bold bg-neutral-900 border border-neutral-800 text-brand-cyan rounded-md mb-6 relative">
          ERROR 404
        </span>

        {/* Dynamic Coordinate readout displaying interactivity in real-time */}
        <div className="absolute top-4 right-4 font-mono text-[9px] text-neutral-600 space-y-0.5 text-right hidden sm:block">
          <div>LOC_X: {Math.round(mousePos.x)}px</div>
          <div>LOC_Y: {Math.round(mousePos.y)}px</div>
          <div>NORM: {normalized.x.toFixed(2)}, {normalized.y.toFixed(2)}</div>
        </div>

        <h1 className="text-4xl font-extrabold tracking-tight mb-4 select-none">
          Route Unresolved
        </h1>

        <p className="text-sm text-neutral-400 leading-relaxed mb-8 select-none">
          The requested system node could not be resolved. This endpoint might have been deleted, moved, or never existed in the production schema.
        </p>

        <Link
          href="/"
          className="inline-flex items-center justify-center w-full px-6 py-3 text-sm font-bold bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 hover:border-brand-cyan/40 text-brand-cyan rounded-2xl transition-all duration-300 shadow-lg cursor-pointer relative z-20"
        >
          Return to Core
        </Link>
      </div>
    </main>
  );
}
