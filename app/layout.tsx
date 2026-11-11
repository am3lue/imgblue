import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono, Space_Grotesk } from "next/font/google";
import type { ReactNode } from "react";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const grotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-grotesk", display: "swap" });
const jetbrains = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains", display: "swap" });

function safeUrl(value: string | undefined): URL | undefined {
  if (!value) return undefined;
  try {
    return new URL(value);
  } catch {
    return undefined;
  }
}

const metadataBase = safeUrl(process.env.NEXT_PUBLIC_BASE_URL?.trim());

const title = "imgblue — images in. links out.";
const description =
  "A tiny image hosting API. Upload a photo, get a permanent link. JPEG-optimized, stored as base64 rows in Turso, served from Vercel.";

export const metadata: Metadata = {
  metadataBase,
  title: {
    default: title,
    template: "%s · imgblue",
  },
  description,
  applicationName: "imgblue",
  keywords: ["image hosting", "image api", "image upload", "imgblue", "turso", "vercel"],
  openGraph: {
    type: "website",
    siteName: "imgblue",
    title,
    description,
    url: "/",
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: "#04070f",
  colorScheme: "dark",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${grotesk.variable} ${jetbrains.variable} min-h-dvh font-sans`}>
        <div className="site-grid-overlay" aria-hidden="true" />
        <div className="relative z-10">{children}</div>
      </body>
    </html>
  );
}
