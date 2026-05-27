import type { Metadata } from "next";
import { Inter, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/Navbar";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Frederick de Ruiter | Principal Systems Engineer & Designer",
  description: "A high-performance design engineering showcase combining DOM-free canvas layout physics, serverless Neon Postgres data streams, and robust clinical CDISC data engines.",
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
        <Navbar />
        {children}
      </body>
    </html>
  );
}
