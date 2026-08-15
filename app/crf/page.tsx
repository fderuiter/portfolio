import React from "react";
import { CRFStudioContainer } from "@/components/crf/CRFStudioContainer";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { NextPrevNav } from "@/components/ui/NextPrevNav";

export default function CRFStudioPage() {
  return (
    <main className="min-h-screen pt-28 pb-16 bg-zinc-950 text-white selection:bg-brand-cyan/30 selection:text-brand-cyan">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-4">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Systems", href: "/#about" },
            { label: "CRF Studio", href: "/crf" },
          ]}
        />
      </div>

      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
        <div className="rounded-3xl border border-zinc-800 bg-zinc-950 overflow-hidden shadow-2xl">
          <CRFStudioContainer />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        <NextPrevNav
          prev={{
            title: "NeuroRecon: FreeSurfer Simulator",
            href: "/neuro",
            label: "Neuroimaging CAD",
            tag: "Interactive 3D Pipeline",
          }}
          next={{
            title: "Logical Proof Workspace",
            href: "/proof",
            label: "Formal Logic Engine",
            tag: "Deductive Proof Canvas",
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
