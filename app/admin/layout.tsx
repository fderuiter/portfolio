import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider
      appearance={{
        theme: dark,
        elements: {
          card: "border border-white/10 shadow-2xl bg-[#0d0e11]",
          headerTitle: "text-zinc-100 font-mono tracking-tight",
          headerSubtitle: "text-zinc-400 font-sans text-xs",
          formButtonPrimary:
            "bg-amber-500 hover:bg-amber-400 text-zinc-950 font-mono text-xs uppercase tracking-wider font-semibold transition-all",
          formFieldInput:
            "bg-[#13151a] border-white/10 text-zinc-100 focus:border-amber-500 focus:ring-amber-500 font-mono text-sm",
          footerActionText: "text-zinc-400 font-sans text-xs",
          footerActionLink:
            "text-amber-400 hover:text-amber-300 font-mono text-xs",
        },
      }}
    >
      {children}
    </ClerkProvider>
  );
}
