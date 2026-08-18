"use client";

import React from "react";
import {
  IconDownload,
  IconFileTypeSvg,
  IconFileTypePdf,
  IconFileTypePng,
  IconFileTypeJpg,
  IconArchive,
  IconShieldCheck,
  IconShare,
  IconCreativeCommons,
  IconCheck,
  IconFileText,
  IconFileCode,
} from "@tabler/icons-react";

interface AssetFormatItem {
  filename: string;
  ext: string;
  classification: string;
  targetApp: string;
  attributes: string;
  href: string;
  icon: React.ReactNode;
  category: "vector" | "web" | "raster";
}

const ASSET_ITEMS: AssetFormatItem[] = [
  // Vector Print
  {
    filename: "Laser_loon.ai",
    ext: "AI",
    classification: "Master Vector Source",
    targetApp: "Adobe Illustrator / Vector Editors",
    attributes: "Layered vectors, global swatches, infinite resolution scaling",
    href: "/files/Laser_loon.ai",
    icon: <IconFileCode className="w-5 h-5 text-amber-400" />,
    category: "vector",
  },
  {
    filename: "Laser_loon.eps",
    ext: "EPS",
    classification: "Print Vector Standard",
    targetApp: "Commercial Print & Vinyl Plotting",
    attributes: "Spot color separation, CMYK print pipeline compatibility",
    href: "/files/Laser_loon.eps",
    icon: <IconFileCode className="w-5 h-5 text-orange-400" />,
    category: "vector",
  },
  {
    filename: "Laser_loon.pdf",
    ext: "PDF",
    classification: "Vector Document Exchange",
    targetApp: "Universal Proofing & Vector Print",
    attributes: "Embedded resolution-independent vector graphics",
    href: "/files/Laser_loon.pdf",
    icon: <IconFileTypePdf className="w-5 h-5 text-red-400" />,
    category: "vector",
  },
  // Web & UI
  {
    filename: "Laser_loon.svg",
    ext: "SVG",
    classification: "Scalable Web Vector",
    targetApp: "Web UI, Favicons, Dynamic Icons",
    attributes: "Minimized DOM footprint, CSS/SVG animation friendly",
    href: "/files/Laser_loon.svg",
    icon: <IconFileTypeSvg className="w-5 h-5 text-cyan-400" />,
    category: "web",
  },
  {
    filename: "Laser_loon.png",
    ext: "PNG",
    classification: "Transparent High-Res Raster",
    targetApp: "Digital Media / Overlay Assets",
    attributes: "300 DPI lossless alpha transparency channel",
    href: "/files/Laser_loon.png",
    icon: <IconFileTypePng className="w-5 h-5 text-emerald-400" />,
    category: "web",
  },
  // Raster Edit & Preview
  {
    filename: "Laser_loon.psd",
    ext: "PSD",
    classification: "Master Raster Compositing",
    targetApp: "Adobe Photoshop / Raster Editing",
    attributes: "High-resolution layered compositing file",
    href: "/files/Laser_loon.psd",
    icon: <IconFileText className="w-5 h-5 text-blue-400" />,
    category: "raster",
  },
  {
    filename: "Laser_Loon.jpg",
    ext: "JPG",
    classification: "Compressed Web Preview",
    targetApp: "Thumbnails, Cards & Previews",
    attributes: "Standard web display compression",
    href: "/files/Laser_Loon.jpg",
    icon: <IconFileTypeJpg className="w-5 h-5 text-zinc-400" />,
    category: "raster",
  },
];

export const AssetDistributionHub: React.FC = () => {
  const [copied, setCopied] = React.useState(false);

  const handleShare = async () => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="w-full my-12 p-6 sm:p-8 bg-zinc-950/90 border border-zinc-800 rounded-3xl shadow-2xl relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-red-500/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 border-b border-zinc-800/80 pb-6 relative z-10">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/30 mb-2">
            <IconArchive className="w-3.5 h-3.5" />
            <span>Open Source Graphic Asset Repository</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold font-mono text-white tracking-tight">
            Laser Loon Production Asset Distribution Hub
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 font-mono mt-1 max-w-2xl">
            Download production-ready master files in every industry vector and raster classification. Free for civic, commercial, and personal use under CC BY 4.0.
          </p>
        </div>

        {/* 1-Click ZIP Download CTA */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
          <a
            href="/files/laser-loon-assets.zip"
            download="laser-loon-assets.zip"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-red-500 hover:bg-red-400 text-black font-mono text-xs font-extrabold rounded-xl transition-all shadow-[0_0_25px_rgba(239,68,68,0.4)] active:scale-[0.98] group cursor-pointer"
          >
            <IconDownload className="w-4 h-4 transform group-hover:-translate-y-0.5 transition-transform" />
            <span>Download Master ZIP Archive (1-Click)</span>
          </a>

          <button
            onClick={handleShare}
            className="inline-flex items-center justify-center gap-2 px-4 py-3 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-700 font-mono text-xs font-bold rounded-xl transition-colors cursor-pointer"
            aria-label="Share case study link"
          >
            {copied ? <IconCheck className="w-4 h-4 text-emerald-400" /> : <IconShare className="w-4 h-4" />}
            <span>{copied ? "Link Copied!" : "Share Assets"}</span>
          </button>
        </div>
      </div>

      {/* Asset Categories Grid */}
      <div className="space-y-8 relative z-10">
        {/* Category 1: Vector Print */}
        <div>
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-amber-400 uppercase tracking-wider mb-3">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            <span>Vector Print &amp; Source Formats (.AI, .EPS, .PDF)</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {ASSET_ITEMS.filter((item) => item.category === "vector").map((item) => (
              <AssetCard key={item.filename} item={item} />
            ))}
          </div>
        </div>

        {/* Category 2: Web & UI */}
        <div>
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider mb-3">
            <span className="w-2 h-2 rounded-full bg-cyan-400" />
            <span>Web &amp; UI Assets (.SVG, .PNG)</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {ASSET_ITEMS.filter((item) => item.category === "web").map((item) => (
              <AssetCard key={item.filename} item={item} />
            ))}
          </div>
        </div>

        {/* Category 3: Raster Edit & Preview */}
        <div>
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-blue-400 uppercase tracking-wider mb-3">
            <span className="w-2 h-2 rounded-full bg-blue-400" />
            <span>Raster Compositing &amp; Previews (.PSD, .JPG)</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {ASSET_ITEMS.filter((item) => item.category === "raster").map((item) => (
              <AssetCard key={item.filename} item={item} />
            ))}
          </div>
        </div>
      </div>

      {/* Creative Commons Licensing Guidelines Panel */}
      <div className="mt-10 p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 shrink-0">
            <IconCreativeCommons className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-sm font-bold font-mono text-white flex items-center gap-2">
              <span>Creative Commons CC BY 4.0 Open License</span>
              <IconShieldCheck className="w-4 h-4 text-emerald-400" />
            </h4>
            <p className="text-xs text-zinc-400 font-mono mt-1 leading-relaxed">
              Free for commercial print, screen printing, vinyl plotting, merchandise, digital publications, and software development. Requires attribution to <strong>Frederick de Ruiter / Laser Loon Project</strong>.
            </p>
          </div>
        </div>

        <a
          href="https://creativecommons.org/licenses/by/4.0/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs font-mono text-amber-400 hover:text-amber-300 underline shrink-0 whitespace-nowrap"
        >
          View Full CC BY 4.0 Terms ↗
        </a>
      </div>
    </div>
  );
};

function AssetCard({ item }: { item: AssetFormatItem }) {
  return (
    <div className="group flex flex-col justify-between p-4 rounded-2xl bg-zinc-900/40 border border-zinc-800/80 hover:border-zinc-700 hover:bg-zinc-900/80 transition-all duration-200">
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-black/50 border border-zinc-800">{item.icon}</div>
            <span className="font-mono text-sm font-bold text-white group-hover:text-amber-300 transition-colors">
              {item.filename}
            </span>
          </div>
          <span className="px-2 py-0.5 text-[10px] font-mono font-bold text-zinc-400 bg-zinc-800/60 border border-zinc-700/50 rounded">
            {item.ext}
          </span>
        </div>

        <div className="text-xs font-mono text-zinc-300 font-semibold mb-1">{item.classification}</div>
        <p className="text-[11px] font-mono text-zinc-400 mb-3 leading-relaxed">{item.attributes}</p>
      </div>

      <a
        href={item.href}
        download={item.filename}
        className="inline-flex items-center justify-between w-full px-3 py-2 bg-zinc-800/80 hover:bg-red-500/20 hover:border-red-500/40 border border-zinc-700/60 text-zinc-200 hover:text-red-300 font-mono text-xs font-bold rounded-xl transition-all group/btn"
      >
        <span>Download {item.ext}</span>
        <IconDownload className="w-3.5 h-3.5 transform group-hover/btn:translate-y-0.5 transition-transform" />
      </a>
    </div>
  );
}
