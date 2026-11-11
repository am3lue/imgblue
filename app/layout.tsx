import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono, Space_Grotesk } from "next/font/google";
import type { ReactNode } from "react";
import { JsonLd } from "@/components/json-ld";
import { websiteJsonLd } from "@/lib/seo";
import { site, siteUrl } from "@/lib/site";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const grotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-grotesk", display: "swap" });
const jetbrains = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains", display: "swap" });

const title = "imgblue — free image hosting with permanent links";
const description =
  "Upload an image and get a permanent link. Free image hosting for screenshots, docs, and side projects — JPEG-optimized, API-ready, and served from Vercel.";
const googleSiteVerification = "google2ef11ddbde2a3e16";
const microsoftSiteVerification = process.env.MICROSOFT_SITE_VERIFICATION?.trim();

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: title,
    template: "%s · imgblue",
  },
  description,
  applicationName: site.name,
  authors: [{ name: site.name, url: siteUrl }],
  creator: site.name,
  publisher: site.name,
  category: "technology",
  keywords: [
    "free image hosting",
    "image hosting",
    "image hosting api",
    "upload image get link",
    "direct image links",
    "screenshot hosting",
    "markdown image hosting",
    "imgblue",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    siteName: site.name,
    title,
    description,
    url: siteUrl,
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
  },
  verification: {
    google: googleSiteVerification,
    ...(microsoftSiteVerification
      ? { other: { "msvalidate.01": microsoftSiteVerification } }
      : {}),
  },
  manifest: "/manifest.webmanifest",
  referrer: "strict-origin-when-cross-origin",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  appleWebApp: {
    capable: true,
    title: site.name,
    statusBarStyle: "black-translucent",
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
        <JsonLd data={websiteJsonLd()} />
        <div className="site-grid-overlay" aria-hidden="true" />
        <div className="relative z-10">{children}</div>
      </body>
    </html>
  );
}
