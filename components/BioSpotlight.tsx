"use client";

import React, { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  IconBone,
  IconHeart,
  IconSparkles,
  IconChevronRight,
  IconChevronLeft,
} from "@tabler/icons-react";
import { getPhotosByCategory } from "@/lib/media-registry";

export const BioSpotlight: React.FC = () => {
  const duckPhotos = getPhotosByCategory("duck");
  const bioPhotos = getPhotosByCategory("bio");

  // Growth journey highlights
  const journey = [
    duckPhotos.find((p) => p.id === "duck-puppy-headrest")!,
    duckPhotos.find((p) => p.id === "duck-puppy-bed")!,
    duckPhotos.find((p) => p.id === "duck-puppy-mirror")!,
    bioPhotos.find((p) => p.id === "fred-duck-yellow-shirt")!,
    bioPhotos.find((p) => p.id === "fred-duck-shoulder")!,
    duckPhotos.find((p) => p.id === "fred-duck-carried-doorway")!,
  ].filter(Boolean);

  const [activeIndex, setActiveIndex] = useState(0);
  const activePhoto = journey[activeIndex];

  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % journey.length);
  };

  const handlePrev = () => {
    setActiveIndex((prev) => (prev - 1 + journey.length) % journey.length);
  };

  return (
    <div
      data-testid="bio-spotlight"
      className="w-full max-w-4xl mx-auto mb-16 px-4"
    >
      <div className="relative rounded-3xl bg-gradient-to-b from-[#181b22] to-[#121418] border border-white/10 p-6 sm:p-8 md:p-10 shadow-2xl overflow-hidden">
        {/* Subtle Ambient Background Accent */}
        <div className="absolute top-0 right-0 w-72 h-72 bg-amber-500/5 blur-3xl pointer-events-none rounded-full" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-amber-600/5 blur-3xl pointer-events-none rounded-full" />

        <div className="relative z-10 grid grid-cols-1 md:grid-cols-12 gap-6 sm:gap-8 items-center">
          {/* Left Column: Image with interactive controls */}
          <div className="md:col-span-5 min-w-0 flex flex-col items-center">
            <div className="relative w-full max-w-[280px] sm:max-w-[320px] aspect-[3/4] rounded-2xl overflow-hidden border border-white/15 shadow-xl bg-black/60 group">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activePhoto.id}
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.04 }}
                  transition={{ duration: 0.25, ease: "easeInOut" }}
                  className="relative w-full h-full"
                >
                  <Image
                    src={activePhoto.src}
                    alt={activePhoto.alt}
                    fill
                    sizes="(max-width: 768px) 280px, 320px"
                    className="object-cover"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80" />
                  <div className="absolute bottom-3 left-3 right-3 text-left">
                    <span className="inline-block px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider bg-amber-400 text-black mb-1">
                      Stage {activeIndex + 1} of {journey.length}
                    </span>
                    <p className="text-xs font-mono font-semibold text-white truncate">
                      {activePhoto.title}
                    </p>
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* Quick Navigation Overlays */}
              <button
                type="button"
                onClick={handlePrev}
                aria-label="Previous co-pilot milestone photo"
                className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/60 border border-white/20 flex items-center justify-center text-white hover:bg-amber-400 hover:text-black transition-colors backdrop-blur-sm cursor-pointer"
              >
                <IconChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleNext}
                aria-label="Next co-pilot milestone photo"
                className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/60 border border-white/20 flex items-center justify-center text-white hover:bg-amber-400 hover:text-black transition-colors backdrop-blur-sm cursor-pointer"
              >
                <IconChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Thumbnail Dot Strip */}
            <div
              className="flex items-center gap-1.5 mt-3"
              role="tablist"
              aria-label="Photo growth milestones"
            >
              {journey.map((p, idx) => (
                <button
                  key={p.id}
                  type="button"
                  role="tab"
                  aria-selected={idx === activeIndex}
                  aria-label={`Jump to milestone ${idx + 1}: ${p.title}`}
                  onClick={() => setActiveIndex(idx)}
                  className={`h-2 rounded-full transition-all duration-200 cursor-pointer ${
                    idx === activeIndex
                      ? "w-6 bg-amber-400"
                      : "w-2 bg-white/20 hover:bg-white/40"
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Right Column: Bio & Co-Pilot Narrative */}
          <div className="md:col-span-7 min-w-0 flex flex-col justify-center text-left">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-amber-400/10 border border-amber-400/20 text-amber-300 text-[11px] font-mono font-medium mb-3 w-fit">
              <IconBone className="w-3.5 h-3.5 text-amber-400" />
              <span>Canine Co-Pilot &amp; Pair Programmer</span>
            </div>

            <h3 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight mb-2 heading-editorial">
              Meet Duck: From 8-Week Fluff to 80-lb Marshmallow
            </h3>

            <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed mb-4">
              Behind the code, clinical derivations, and side projects is Duck,
              an English Cream Golden Retriever who started as a pillow-sized
              puppy asleep across Fred&apos;s head and grew into an 80-lb pair
              programmer.
            </p>

            {/* Active Milestone Callout Box */}
            <div className="p-3.5 rounded-xl bg-black/40 border border-white/10 mb-4">
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-amber-300 mb-1">
                <IconSparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>{activePhoto.title}</span>
              </div>
              <p className="text-xs text-zinc-300 leading-relaxed font-sans">
                {activePhoto.caption}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 text-[11px] font-mono text-zinc-400">
              <span className="flex items-center gap-1">
                <IconHeart className="w-3.5 h-3.5 text-rose-400" />
                <span>Treat Approval Rate: 100%</span>
              </span>
              <span className="text-zinc-600">•</span>
              <span>Merge Conflict Shield: Active</span>
              <span className="text-zinc-600">•</span>
              <span className="text-amber-300">
                Duck Fact #{activeIndex + 1}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
