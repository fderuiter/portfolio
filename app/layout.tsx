import type { Metadata } from "next";
import { Inter, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { getPersonSchema } from "@/lib/seo";
import { A11yProvider } from "@/components/providers/A11yProvider";
import { SearchProvider } from "@/components/providers/SearchProvider";
import { NarrativeProvider } from "@/components/providers/NarrativeProvider";
import { Analytics } from "@vercel/analytics/next";
import { SearchWrapper } from "@/components/SearchWrapper";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://fderuiter-portfolio.vercel.app"),
  title: {
    template: "%s | Frederick de Ruiter",
    default: "Frederick de Ruiter | Principal Systems Engineer & Designer",
  },
  description: "A high-performance design engineering showcase combining DOM-free canvas layout physics, serverless Neon Postgres data streams, and robust clinical CDISC data engines.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://fderuiter-portfolio.vercel.app",
    siteName: "Frederick de Ruiter Portfolio",
    title: "Frederick de Ruiter | Principal Systems Engineer & Designer",
    description: "A high-performance design engineering showcase combining DOM-free canvas layout physics, serverless Neon Postgres data streams, and robust clinical CDISC data engines.",
  },
  twitter: {
    card: "summary_large_image",
    creator: "@laser_loon",
    title: "Frederick de Ruiter | Principal Systems Engineer & Designer",
    description: "A high-performance design engineering showcase combining DOM-free canvas layout physics, serverless Neon Postgres data streams, and robust clinical CDISC data engines.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: getPersonSchema()
          }}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  document.documentElement.setAttribute('data-theme', 'dark');
                } catch(e) {}
              })();
            `
          }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-zinc-950 text-foreground antialiased">
        <SearchProvider>
          <NarrativeProvider>
            <A11yProvider>
              <Navbar />
              {children}
              <Analytics />
              <SearchWrapper />
            </A11yProvider>
          </NarrativeProvider>
        </SearchProvider>
      </body>
    </html>
  );
}

