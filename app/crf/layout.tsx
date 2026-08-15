import { Metadata } from "next";

export const metadata: Metadata = {
  title: "CRF Studio: Next-Gen Clinical Form & Protocol Designer | Fred de Ruiter",
  description:
    "Zero-latency clinical trial form designer and EDC simulator with 12-column responsive layout, AST-powered edit checks, CDISC CDASH 2.2 / ODM-XML v1.3.2 compliance, and live publication aCRF overlays.",
  openGraph: {
    title: "CRF Studio: Next-Gen Clinical Form Designer",
    description:
      "Design clinical trial forms, schedule visit matrices, evaluate dynamic edit checks, and simulate 21 CFR Part 11 electronic data capture in real time.",
    type: "website",
  },
};

export default function CRFLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
