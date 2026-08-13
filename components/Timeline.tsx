"use client";

import React from "react";
import { hexToRgba } from "@/lib/utils";
import { motion } from "framer-motion";
import { designManifest } from "@/lib/design-manifest";

export interface TimelineItem {
  role: string;
  company: string;
  period: string;
  description: string;
  tags: string[];
}

const timelineData: TimelineItem[] = [
  {
    role: "Lead Clinical Software Architect",
    company: "Systems Integration Group",
    period: "2023 — Present",
    description: "Architected distributed HIPAA-compliant streaming ODM XML parsers handling 2GB+ trials data within constant 50MB memory footprints. Transitioned local SQLite storage nodes to high-speed serverless Neon Postgres clusters utilizing native pooling.",
    tags: ["TypeScript", "Neon Postgres", "CDISC", "HIPAA", "SAX Parser"]
  },
  {
    role: "Senior Systems Engineer & UI Specialist",
    company: "Digital Physics Labs",
    period: "2020 — 2023",
    description: "Developed hardware-accelerated text measuring and Bento grid wrapping engines using browser canvas and custom hooks. Maintained 60FPS refresh metrics under active resizing and heavy grid item swaps.",
    tags: ["React 19", "Next.js 16", "Framer Motion", "Canvas API", "DX Tooling"]
  },
  {
    role: "Lead Volunteer & Technical Mentor",
    company: "Civic Code for Humanity",
    period: "2019 — 2021",
    description: "Partnered with local nonprofits to modernize their digital presence and data systems. Taught coding bootcamps for underprivileged youth, emphasizing creativity and problem-solving.",
    tags: ["Civic Impact", "Education", "Volunteering", "Accessibility"]
  },
  {
    role: "Full-Stack Developer",
    company: "CoreFlow Technologies",
    period: "2018 — 2020",
    description: "Pioneered DAG-based Visual Node Schema builders. Engineered immutable state trees, cycle validation compilers, and OpenAPI spec translators.",
    tags: ["React", "Zustand", "AST", "JSON Schema", "OpenAPI"]
  },
  {
    role: "President, Computer Science Society",
    company: "University Student Leadership",
    period: "2016 — 2018",
    description: "Led a community of 500+ students, organized weekly workshops, and fostered a culture of collaborative learning. Built mentorship programs that connected underclassmen with alumni.",
    tags: ["Leadership", "Community Building", "Mentorship", "Public Speaking"]
  }
];

export const Timeline: React.FC = () => {
  return (
    <div className="w-full max-w-3xl mx-auto py-12 relative select-none">
      {/* Vertical Rail Line */}
      <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-brand-cyan/30 via-brand-blue/20 to-zinc-900/10 -translate-x-1/2" />

      <div className="space-y-16">
        {timelineData.map((item, idx) => {
          const isLeft = idx % 2 === 0;
          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, delay: idx * 0.1, ...designManifest.motion.springs.timeline }}
              className={`relative flex flex-col md:flex-row items-start md:items-center ${
                isLeft ? "md:flex-row-reverse" : ""
              }`}
            >
              {/* Timeline Bullet Node */}
              <div className="absolute left-4 md:left-1/2 w-4 h-4 rounded-full bg-zinc-950 border-2 border-brand-cyan -translate-x-1/2 z-10 flex items-center justify-center">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-cyan animate-pulse" />
              </div>

              {/* Card Container */}
              <div className={`w-full md:w-[45%] pl-10 md:pl-0 ${isLeft ? "md:pr-12 md:text-right" : "md:pl-12"}`}>
                <div style={{ "--timeline-glow": `0 0 25px ${hexToRgba(designManifest.colors["brand-cyan"], 0.03)}` } as React.CSSProperties}
                className="p-6 bg-zinc-900/20 border border-zinc-900/50 rounded-2xl backdrop-blur-sm hover:border-zinc-800 transition-all duration-300 group hover:[box-shadow:var(--timeline-glow)]">
                  <span className="text-[10px] font-mono font-bold tracking-wider text-brand-cyan uppercase bg-brand-cyan/5 px-2.5 py-1 border border-brand-cyan/10 rounded-md">
                    {item.period}
                  </span>
                  <h3 className="text-lg font-bold text-neutral-100 mt-3 group-hover:text-white transition-colors">
                    {item.role}
                  </h3>
                  <h4 className="text-xs font-mono font-semibold text-zinc-400 mt-1">
                    {item.company}
                  </h4>
                  <p className="text-xs text-zinc-400 mt-3 leading-relaxed font-sans">
                    {item.description}
                  </p>
                  
                  {/* Tag Chips */}
                  <div className={`flex flex-wrap gap-1.5 mt-4 ${isLeft ? "md:justify-end" : ""}`}>
                    {item.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-0.5 text-[9px] font-mono bg-zinc-900/60 border border-zinc-800/80 text-zinc-400 rounded"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
