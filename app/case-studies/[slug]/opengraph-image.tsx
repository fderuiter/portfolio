import { ImageResponse } from "next/og";
import { prisma } from "@/lib/db";
import { mapToCaseStudy } from "@/lib/mappers";

// Enforce standard NodeJS runtime to guarantee secure, pooled Neon database connections
export const runtime = "nodejs";

export const alt = "Case Study Technical Deep-Dive";
export const size = {
  width: 1200,
  height: 630
};

export const contentType = "image/png";

interface ImageProps {
  params: Promise<{ slug: string }>;
}

export default async function Image({ params }: ImageProps) {
  const { slug } = await params;

  let rawStudy;
  try {
    rawStudy = await prisma.caseStudy.findUnique({
      where: { slug }
    });
  } catch (err) {
    console.error("OG Image generation database query failure:", err);
  }

  // Fallback state if the database query is unsuccessful or returning an empty record
  if (!rawStudy) {
    return new ImageResponse(
      (
        <div
          style={{
            width: "100%",
            height: "100%",
            background: "#09090b",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "sans-serif"
          }}
        >
          <div
            style={{
              color: "#06b6d4",
              fontSize: 24,
              letterSpacing: "0.2em",
              fontWeight: "bold"
            }}
          >
            FREDERICK DE RUITER
          </div>
          <div
            style={{
              color: "#ffffff",
              fontSize: 54,
              marginTop: 20,
              fontWeight: "bold"
            }}
          >
            Engineering Showcase
          </div>
        </div>
      ),
      size
    );
  }
  
  const study = mapToCaseStudy(rawStudy);

  const tagsList = study.tags.slice(0, 4);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#09090b",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "80px",
          position: "relative",
          fontFamily: "sans-serif"
        }}
      >
        {/* Glow ambient background visual motifs */}
        <div
          style={{
            position: "absolute",
            top: "-150px",
            right: "-150px",
            width: "500px",
            height: "500px",
            borderRadius: "50%",
            background: "rgba(6, 182, 212, 0.08)",
            filter: "blur(120px)",
            display: "flex"
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "-100px",
            left: "-100px",
            width: "400px",
            height: "400px",
            borderRadius: "50%",
            background: "rgba(59, 130, 246, 0.05)",
            filter: "blur(100px)",
            display: "flex"
          }}
        />

        {/* Wordmark Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%"
          }}
        >
          <div
            style={{
              color: "#06b6d4",
              fontSize: 16,
              fontWeight: "bold",
              letterSpacing: "0.25em"
            }}
          >
            FDERUITER // SYSTEMS ARCHITECT
          </div>
          <div
            style={{
              padding: "6px 16px",
              background: "rgba(6, 182, 212, 0.06)",
              border: "1px solid rgba(6, 182, 212, 0.2)",
              borderRadius: "8px",
              color: "#06b6d4",
              fontSize: 12,
              fontWeight: "bold",
              letterSpacing: "0.1em"
            }}
          >
            {study.primary_language.toUpperCase()}
          </div>
        </div>

        {/* Core Narrative Title */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            marginTop: "auto",
            marginBottom: "auto"
          }}
        >
          <div
            style={{
              color: "rgba(255, 255, 255, 0.4)",
              fontSize: 14,
              fontWeight: "bold",
              letterSpacing: "0.15em",
              marginBottom: "12px"
            }}
          >
            CASE STUDY DEEP-DIVE
          </div>
          <div
            style={{
              color: "#ffffff",
              fontSize: 54,
              fontWeight: "bold",
              lineHeight: 1.2,
              letterSpacing: "-0.02em",
              maxWidth: "950px"
            }}
          >
            {study.title}
          </div>
        </div>

        {/* Tags Footer row */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            width: "100%"
          }}
        >
          {tagsList.map((tag, idx) => (
            <div
              key={idx}
              style={{
                padding: "8px 16px",
                background: "rgba(39, 39, 42, 0.4)",
                border: "1px solid rgba(63, 63, 70, 0.5)",
                borderRadius: "6px",
                color: "#a1a1aa",
                fontSize: 12,
                fontWeight: "bold",
                display: "flex"
              }}
            >
              {tag}
            </div>
          ))}

          <div
            style={{
              marginLeft: "auto",
              color: "#52525b",
              fontSize: 12,
              fontWeight: "bold",
              letterSpacing: "0.05em"
            }}
          >
            STUDY ID: {study.id.substring(0, 8).toUpperCase()}
          </div>
        </div>
      </div>
    ),
    {
      ...size
    }
  );
}
