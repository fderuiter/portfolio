import Link from "next/link";

export default function CaseStudyNotFound() {
  return (
    <main className="min-h-screen py-32 px-6 flex flex-col items-center justify-center bg-brand-dark text-foreground">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-brand-cyan/10 blur-[120px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-md p-8 bg-neutral-950/40 border border-neutral-900 rounded-3xl backdrop-blur-xl text-center shadow-2xl">
        <span className="inline-block px-3 py-1 text-xs font-mono font-bold bg-neutral-900 border border-neutral-800 text-brand-cyan rounded-md mb-6">
          CASE_NOT_FOUND
        </span>

        <h1 className="text-2xl font-bold tracking-tight text-neutral-100 mb-4">
          Case Study Unresolved
        </h1>

        <p className="text-sm text-neutral-400 leading-relaxed mb-8">
          The requested clinical case study narrative does not exist or has not been published to the active database partition.
        </p>

        <Link
          href="/"
          className="inline-flex items-center justify-center w-full px-6 py-3 text-sm font-bold bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 hover:border-brand-cyan/40 text-brand-cyan rounded-2xl transition-all duration-300 shadow-lg cursor-pointer"
        >
          Return to Core Feed
        </Link>
      </div>
    </main>
  );
}
