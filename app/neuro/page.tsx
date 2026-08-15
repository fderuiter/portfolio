import React from "react";
import { NeuroReconClient } from "@/components/neuro/NeuroReconClient";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { NextPrevNav } from "@/components/ui/NextPrevNav";

export default function NeuroReconPage() {
  return (
    <main className="min-h-screen pt-28 pb-16 bg-zinc-950 text-white selection:bg-brand-cyan/30 selection:text-brand-cyan">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Systems", href: "/#about" },
            { label: "NeuroRecon Studio", href: "/neuro" },
          ]}
        />
      </div>

      <NeuroReconClient />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        <NextPrevNav
          prev={{
            title: "Logical Proof Workspace",
            href: "/proof",
            label: "Formal Logic Engine",
            tag: "Interactive Proof Canvas",
          }}
          next={{
            title: "Engineering Alignment Simulator",
            href: "/simulator",
            label: "Incident Triage",
            tag: "Engineering Leadership",
          }}
          backToHub={{
            title: "Return to Portfolio",
            href: "/",
          }}
        />
      </div>
    </main>
  );
}
