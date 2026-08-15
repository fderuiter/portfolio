import type { Metadata } from "next";
import { Inter, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { getPersonSchema, getWebsiteSchema } from "@/lib/seo";
import { A11yProvider } from "@/components/providers/A11yProvider";
import { AudioProvider } from "@/components/providers/AudioProvider";
import { SearchProvider } from "@/components/providers/SearchProvider";
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
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", sizes: "any" },
    ],
    shortcut: "/icon.svg",
  },
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
      data-theme="dark"
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
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: getWebsiteSchema()
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
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-brand-cyan focus:text-black focus:font-mono focus:text-xs focus:font-bold focus:rounded-xl focus:shadow-[0_0_20px_rgba(6,182,212,0.5)] focus:outline-none"
        >
          Skip to main content
        </a>
        <SearchProvider>
          <A11yProvider>
            <AudioProvider>
              <Navbar />
              <div className="flex-grow flex flex-col">
                {children}
              </div>
              <Footer />
              <Analytics />
              <SearchWrapper />
            </AudioProvider>
          </A11yProvider>
        </SearchProvider>
      </body>
    </html>
  );
}
