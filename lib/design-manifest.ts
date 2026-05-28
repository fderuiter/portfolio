export const designManifest = {
  colors: {
    background: "#09090b",
    foreground: "#fafafa",
    "surface-1": "rgba(24, 24, 27, 0.6)",
    "surface-2": "rgba(39, 39, 42, 0.4)",
    border: "rgba(63, 63, 70, 0.5)",
    "border-active": "rgba(6, 182, 212, 0.4)",
    muted: "#71717a",
    "muted-strong": "#a1a1aa",
    "brand-cyan": "#06b6d4",
    "brand-cyan-glow": "rgba(6, 182, 212, 0.15)",
    "brand-blue": "#3b82f6",
    "brand-blue-glow": "rgba(59, 130, 246, 0.10)",
    "brand-dark": "#09090b",
    success: "#10b981",
    error: "#f87171",
    warning: "#fbbf24",
  },
  typography: {
    fonts: {
      sans: "var(--font-inter), system-ui, -apple-system, sans-serif",
      mono: "var(--font-geist-mono), ui-monospace, monospace",
    },
    sizes: {
      sm: {
        fontSize: 13,
        lineHeight: 18,
      }
    }
  },
  masonry: {
    paddingWithStats: 484,
    paddingWithoutStats: 194,
  },
  motion: {
    springs: {
      snappy: { type: "spring", stiffness: 380, damping: 30 },
      smooth: { type: "spring", stiffness: 80, damping: 20 },
      gentle: { type: "spring", stiffness: 60, damping: 20 },
      hero: { type: "spring", stiffness: 100, damping: 18 },
      heroBeam: { type: "spring", stiffness: 110, damping: 30 },
      timeline: { type: "spring", stiffness: 60, damping: 20 },
    }
  }
} as const;
