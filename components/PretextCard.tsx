"use client";

import React from "react";
import { Card, CardTitle, CardDescription } from "@/components/BentoGrid";
import { usePretextLayout } from "@/hooks/usePretextLayout";

interface PretextCardProps {
  title: string;
  description: string;
  className?: string;
}

export const PretextCard: React.FC<PretextCardProps> = ({
  title,
  description,
  className,
}) => {
  // Bind Pretext Layout observer (now deterministic server-side native wrapper)
  const { ref } = usePretextLayout({
    text: description,
    fontSize: 12,      // maps to CardDescription text-xs (12px)
    lineHeight: 16,    // maps to standard line-height (16px)
    fontFamilyVariable: "--font-inter",
  });

  return (
    <Card
      className={className}
    >
      <div className="flex flex-col h-full justify-between">
        <div className="mb-4">
          <CardTitle>{title}</CardTitle>
          {/* Attach Ref to the text container */}
          <div ref={ref} aria-hidden="true" role="presentation">
            <CardDescription className="transition-opacity duration-300">
              {description}
            </CardDescription>
          </div>
          {/* Visually Hidden Semantic DOM Parallel Node */}
          <p className="sr-only">{description}</p>
        </div>
        <div className="text-[10px] text-brand-blue font-mono self-end opacity-60">
          NATIVE CSS WRAP
        </div>
      </div>
    </Card>
  );
};
