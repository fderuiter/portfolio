import type { Metadata } from "next";
import { SignIn } from "@clerk/nextjs";
import { PageLayout } from "@/components/PageLayout";
import { IconShieldLock, IconTerminal2 } from "@tabler/icons-react";

export const metadata: Metadata = {
  title: "Admin Portal Authentication",
  description: "Secure authoring and administrative management gateway.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminLoginPage() {
  return (
    <PageLayout variant="standard" className="items-center justify-center min-h-[85vh]">
      <div className="w-full max-w-md flex flex-col items-center gap-6">
        <div className="flex flex-col items-center text-center gap-2">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded border border-amber-500/20 bg-amber-500/10 text-amber-400 font-mono text-xs">
            <IconShieldLock className="w-3.5 h-3.5" aria-hidden="true" />
            <span>SECURE GATEWAY</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-100 flex items-center gap-2">
            <IconTerminal2 className="w-6 h-6 text-zinc-400" aria-hidden="true" />
            <span>Author Portal</span>
          </h1>
          <p className="text-xs text-zinc-400 max-w-xs">
            Administrative access for drafting case studies, editorial updates, and telemetry monitoring.
          </p>
        </div>

        <div className="w-full flex justify-center">
          <SignIn
            routing="path"
            path="/admin/login"
            signUpUrl={undefined} // Disallow public self sign-up
            fallbackRedirectUrl="/admin"
          />
        </div>
      </div>
    </PageLayout>
  );
}
