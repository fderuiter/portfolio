import { ImageResponse } from "next/og";

export const OG_IMAGE_SIZE = {
  width: 1200,
  height: 630,
};

export const OG_IMAGE_CONTENT_TYPE = "image/png";

export type SocialPreset =
  | "SYSTEMS_ARCHITECTURE"
  | "CLINICAL_SYSTEMS"
  | "FORMAL_VERIFICATION"
  | "VECTOR_ARTWORK"
  | "EMBEDDED_SIMULATOR";

export const PRESET_CONFIGS: Record<SocialPreset, { category: string; badge: string; systemStatus: string; tags: string[] }> = {
  SYSTEMS_ARCHITECTURE: {
    category: "SYSTEMS ARCHITECTURE",
    badge: "SYS-ARCH",
    systemStatus: "SYSTEMS ONLINE // READY",
    tags: ["React 19", "Next.js 16", "TypeScript", "Pretext Engine", "Neon Postgres"],
  },
  CLINICAL_SYSTEMS: {
    category: "CLINICAL DATA SYSTEMS",
    badge: "CDISC 2.2",
    systemStatus: "CDISC COMPLIANT // GxP READY",
    tags: ["CDISC CDASH", "ODM-XML", "AST Edit Checks", "21 CFR Part 11", "EDC Simulator"],
  },
  FORMAL_VERIFICATION: {
    category: "FORMAL METHODS & LOGIC",
    badge: "LEAN AST",
    systemStatus: "THEOREM PROVEN // Q.E.D.",
    tags: ["Deductive Logic", "Formal Proofs", "AST Verification", "Graph Theory", "Type Systems"],
  },
  VECTOR_ARTWORK: {
    category: "GRAPHIC DESIGN & OPEN ASSETS",
    badge: "MN FLAG F277",
    systemStatus: "CREATIVE COMMONS // OPEN ASSETS",
    tags: ["Vector Asset Hub", "SVG / AI / EPS", "Laser Loon", "State Flag F277", "Creative Commons"],
  },
  EMBEDDED_SIMULATOR: {
    category: "EMBEDDED SYSTEMS & HARDWARE",
    badge: "CONNECT IQ",
    systemStatus: "32KB HEAP // CPU BOUND",
    tags: ["Garmin Monkey C", "32KB RAM Profiling", "MIP Display", "Thermal Modeling", "Embedded OS"],
  },
};

export interface SocialImageOptions {
  preset?: SocialPreset;
  category?: string;
  title: string;
  description?: string;
  badge?: string;
  tags?: string[];
  systemStatus?: string;
}

/**
 * Generates an OpenGraph / Twitter Social Preview Card ImageResponse
 * featuring the Frederick de Ruiter systems architecture visual identity.
 */
export function createSocialImageResponse(options: SocialImageOptions): ImageResponse {
  const presetConfig = options.preset ? PRESET_CONFIGS[options.preset] : undefined;

  const {
    category = presetConfig?.category || "SYSTEMS ARCHITECTURE",
    title,
    description = "A high-performance design engineering showcase combining DOM-free canvas layout physics, serverless Neon Postgres data streams, and robust clinical CDISC data engines.",
    badge = presetConfig?.badge,
    tags = presetConfig?.tags || ["React 19", "Canvas 2D", "TypeScript", "Pretext Engine", "Neon Postgres"],
    systemStatus = presetConfig?.systemStatus || "SYSTEMS ONLINE // READY",
  } = options;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#090D16",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "60px 70px",
          position: "relative",
          fontFamily: "sans-serif",
          overflow: "hidden",
        }}
      >
        {/* Ambient background glow orbs */}
        <div
          style={{
            position: "absolute",
            top: "-120px",
            right: "-120px",
            width: "520px",
            height: "520px",
            borderRadius: "50%",
            background: "rgba(6, 182, 212, 0.12)",
            filter: "blur(100px)",
            display: "flex",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "-100px",
            left: "-100px",
            width: "480px",
            height: "480px",
            borderRadius: "50%",
            background: "rgba(16, 185, 129, 0.10)",
            filter: "blur(100px)",
            display: "flex",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: "40%",
            left: "45%",
            width: "350px",
            height: "350px",
            borderRadius: "50%",
            background: "rgba(59, 130, 246, 0.06)",
            filter: "blur(90px)",
            display: "flex",
          }}
        />

        {/* Top Header Bar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
          }}
        >
          {/* Brand Mark + Identity */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "16px",
            }}
          >
            {/* 'F' Monogram Icon Box */}
            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "12px",
                background: "#0F172A",
                border: "1.5px solid #1E293B",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                position: "relative",
              }}
            >
              <div
                style={{
                  display: "flex",
                  width: "28px",
                  height: "28px",
                  position: "relative",
                }}
              >
                {/* Stem */}
                <div
                  style={{
                    position: "absolute",
                    left: "2px",
                    top: "2px",
                    width: "5px",
                    height: "24px",
                    background: "#F8FAFC",
                    borderRadius: "2px",
                  }}
                />
                {/* Top Bar */}
                <div
                  style={{
                    position: "absolute",
                    left: "10px",
                    top: "2px",
                    width: "14px",
                    height: "5px",
                    background: "linear-gradient(90deg, #06B6D4, #10B981)",
                    borderRadius: "2px",
                  }}
                />
                {/* Mid Bar */}
                <div
                  style={{
                    position: "absolute",
                    left: "10px",
                    top: "11px",
                    width: "9px",
                    height: "5px",
                    background: "linear-gradient(90deg, #06B6D4, #10B981)",
                    borderRadius: "2px",
                  }}
                />
                {/* Telemetry Dot */}
                <div
                  style={{
                    position: "absolute",
                    right: "1px",
                    top: "2px",
                    width: "5px",
                    height: "5px",
                    background: "#10B981",
                    borderRadius: "50%",
                  }}
                />
              </div>
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
              }}
            >
              <div
                style={{
                  color: "#F8FAFC",
                  fontSize: 18,
                  fontWeight: "bold",
                  letterSpacing: "0.08em",
                }}
              >
                FREDERICK DE RUITER
              </div>
              <div
                style={{
                  color: "#06B6D4",
                  fontSize: 12,
                  fontWeight: "600",
                  letterSpacing: "0.2em",
                  marginTop: "2px",
                }}
              >
                {category}
              </div>
            </div>
          </div>

          {/* Optional Category / Mode Badge */}
          {badge && (
            <div
              style={{
                padding: "8px 18px",
                background: "rgba(6, 182, 212, 0.08)",
                border: "1px solid rgba(6, 182, 212, 0.3)",
                borderRadius: "100px",
                color: "#22D3EE",
                fontSize: 13,
                fontWeight: "bold",
                letterSpacing: "0.12em",
                display: "flex",
              }}
            >
              {badge}
            </div>
          )}
        </div>

        {/* Center Main Headline & Narrative */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            margin: "auto 0",
            maxWidth: "1060px",
          }}
        >
          <div
            style={{
              color: "#FFFFFF",
              fontSize: title.length > 40 ? 46 : 56,
              fontWeight: "bold",
              lineHeight: 1.15,
              letterSpacing: "-0.03em",
              marginBottom: "16px",
            }}
          >
            {title}
          </div>
          {description && (
            <div
              style={{
                color: "#94A3B8",
                fontSize: 21,
                lineHeight: 1.45,
                fontWeight: "400",
                maxWidth: "980px",
              }}
            >
              {description}
            </div>
          )}
        </div>

        {/* Bottom Footer Row: Tags & Telemetry */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
          }}
        >
          {/* Tech Tag Pills */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            {tags.slice(0, 5).map((tag, idx) => (
              <div
                key={idx}
                style={{
                  padding: "6px 14px",
                  background: "rgba(15, 23, 42, 0.8)",
                  border: "1px solid rgba(51, 65, 85, 0.8)",
                  borderRadius: "6px",
                  color: "#CBD5E1",
                  fontSize: 13,
                  fontWeight: "600",
                  letterSpacing: "0.02em",
                  display: "flex",
                }}
              >
                {tag}
              </div>
            ))}
          </div>

          {/* Telemetry Status Indicator */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              color: "#64748B",
              fontSize: 12,
              fontWeight: "bold",
              letterSpacing: "0.1em",
            }}
          >
            <div
              style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                background: "#10B981",
              }}
            />
            {systemStatus}
          </div>
        </div>
      </div>
    ),
    {
      ...OG_IMAGE_SIZE,
      headers: {
        "Cache-Control": "public, max-age=31536000, s-maxage=31536000, stale-while-revalidate=86400",
      },
    }
  );
}
