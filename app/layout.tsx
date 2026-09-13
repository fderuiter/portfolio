import type { Metadata } from "next";
import { Inter, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SkipToContent } from "@/components/SkipToContent";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import {
  getUnifiedGraphSchema,
  getPersonNode,
  getWebsiteNode,
} from "@/lib/seo";
import { A11yProvider } from "@/components/providers/A11yProvider";
import { AudioProvider } from "@/components/providers/AudioProvider";
import { SearchProvider } from "@/components/providers/SearchProvider";
import { TerminologyProvider } from "@/components/providers/TerminologyProvider";
import { PersonaProvider } from "@/components/providers/PersonaProvider";
import { RetroChaosOverlay } from "@/components/RetroChaosOverlay";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { SearchWrapper } from "@/components/SearchWrapper";
import { resolveBaseUrl } from "@/lib/domain";

import { SerwistRegister } from "@/components/providers/SerwistRegister";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
  preload: true,
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
  preload: true,
});

export const metadata: Metadata = {
  metadataBase: new URL(resolveBaseUrl()),
  title: {
    template: "%s | Frederick de Ruiter",
    default: "Frederick de Ruiter | Clinical Data, Software & Side Projects",
  },
  description:
    "I’m Fred. I work with clinical data and build useful software, browser games, and the occasional laser loon. Explore my projects and the decisions behind them.",
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", sizes: "any" },
    ],
    shortcut: "/icon.svg",
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  manifest: "/manifest.webmanifest",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: resolveBaseUrl(),
    siteName: "Frederick de Ruiter Portfolio",
    title: "Frederick de Ruiter | Clinical Data, Software & Side Projects",
    description:
      "I’m Fred. I work with clinical data and build useful software, browser games, and the occasional laser loon. Explore my projects and the decisions behind them.",
    images: [
      {
        url: `${resolveBaseUrl()}/opengraph-image`,
        width: 1200,
        height: 630,
        alt: "Frederick de Ruiter | Clinical Data, Software & Side Projects",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    creator: "@laser_loon",
    title: "Frederick de Ruiter | Clinical Data, Software & Side Projects",
    description:
      "I’m Fred. I work with clinical data and build useful software, browser games, and the occasional laser loon. Explore my projects and the decisions behind them.",
    images: [`${resolveBaseUrl()}/twitter-image`],
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
      data-theme="dark"
      className={`${inter.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: getUnifiedGraphSchema([getPersonNode(), getWebsiteNode()]),
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
              `,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-zinc-950 text-foreground antialiased">
        <SkipToContent />
        <PersonaProvider>
          <TerminologyProvider>
            <SearchProvider>
              <A11yProvider>
                <AudioProvider>
                  <Navbar />
                  <main
                    id="main-content"
                    tabIndex={-1}
                    className="flex-grow flex flex-col focus:outline-none"
                  >
                    {children}
                  </main>
                  <Footer />
                  <RetroChaosOverlay />
                  <Analytics />
                  <SpeedInsights />
                  <SearchWrapper />
                  <SerwistRegister />
                </AudioProvider>
              </A11yProvider>
            </SearchProvider>
          </TerminologyProvider>
        </PersonaProvider>
      </body>
    </html>
  );
}
