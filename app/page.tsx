import type { Metadata } from "next";
import Link from "next/link";
import { CodeTabs } from "@/components/code-tabs";
import { CopyButton } from "@/components/copy-button";
import {
  ArrowRightIcon,
  CheckIcon,
  CodeIcon,
  DatabaseIcon,
  KeyIcon,
  LinkIcon,
  ShieldIcon,
  SparklesIcon,
  ZapIcon,
} from "@/components/icons";
import { RecentGrid } from "@/components/recent-grid";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { UploadGate } from "@/components/upload-gate";
import { Uploader } from "@/components/uploader";
import { getCurrentUser } from "@/lib/auth";
import { isDatabaseConfigured } from "@/lib/db";
import { listRecentImages, type ImageMeta } from "@/lib/images";
import { site } from "@/lib/site";

export const dynamic = "force-dynamic";

const HOME_TITLE = "imgblue — free image hosting with permanent links";
const HOME_DESCRIPTION =
  "Upload an image and get a permanent link. Free image hosting for screenshots, docs, and side projects — JPEG-optimized, API-ready, and served from Vercel.";

export const metadata: Metadata = {
  title: { absolute: HOME_TITLE },
  description: HOME_DESCRIPTION,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: "imgblue",
    locale: "en_US",
    title: HOME_TITLE,
    description: HOME_DESCRIPTION,
    url: "/",
  },
  twitter: {
    card: "summary_large_image",
    title: HOME_TITLE,
    description: HOME_DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

const RESPONSE_SAMPLE = `{
  "id": "9fK2mQ7pLx",
  "url": "${site.defaultBaseUrl}/i/9fK2mQ7pLx",
  "direct_url": "${site.defaultBaseUrl}/api/i/9fK2mQ7pLx",
  "download_url": "${site.defaultBaseUrl}/api/i/9fK2mQ7pLx?download=1",
  "filename": "sunset.jpg",
  "width": 1600,
  "height": 1067,
  "size_bytes": 184320,
  "created_at": "2026-11-11T18:00:00.000Z"
}`;

const USE_CASES = [
  {
    icon: LinkIcon,
    title: "Screenshots & bug reports",
    body: "Paste a screenshot, then drop the direct link into GitHub issues, Linear, Slack, or a support thread. The image stays at the same URL.",
  },
  {
    icon: CodeIcon,
    title: "READMEs & documentation",
    body: "Use the Markdown or HTML embed in a README, docs site, Notion page, or changelog. Anyone can view the image without an account.",
  },
  {
    icon: ZapIcon,
    title: "Prototypes & demos",
    body: "POST to /api/upload from a side project, script, or AI workflow and get a cache-friendly direct URL back in one request.",
  },
  {
    icon: ShieldIcon,
    title: "Private details stripped",
    body: "EXIF metadata is removed during re-encoding, so camera details and location data do not travel with the image.",
  },
];

const FEATURES = [
  {
    icon: ZapIcon,
    title: "Optimized on the way in",
    body: "sharp re-encodes every upload to a compact JPEG, strips EXIF, and caps the long edge at 2560 px.",
  },
  {
    icon: DatabaseIcon,
    title: "Base64 in Turso",
    body: "Each image lives as a base64 row in libSQL. No blob service, no extra moving parts to pay for.",
  },
  {
    icon: ShieldIcon,
    title: "Keys you can trust",
    body: "API keys are hashed with SHA-256, tied to your account, and revocable in one click from your dashboard.",
  },
  {
    icon: LinkIcon,
    title: "Links that embed",
    body: "Share pages, direct image URLs, Markdown, and HTML snippets — ready to copy in a single tap.",
  },
];

function Endpoint({ method, path, note }: { method: string; path: string; note: string }) {
  const tone =
    method === "POST"
      ? "border-emerald-400/25 bg-emerald-500/10 text-emerald-300"
      : method === "DELETE"
        ? "border-red-400/25 bg-red-500/10 text-red-300"
        : "border-sky-400/25 bg-sky-500/10 text-sky-300";

  return (
    <div className="flex items-center gap-3 rounded-xl border border-white/[0.07] bg-white/[0.02] px-3 py-2">
      <span className={`w-14 shrink-0 rounded-md border py-0.5 text-center font-mono text-[10px] font-semibold ${tone}`}>
        {method}
      </span>
      <code className="font-mono text-[11.5px] text-ice-200">{path}</code>
      <span className="ml-auto hidden text-[10px] text-ice-500 sm:block">{note}</span>
    </div>
  );
}

export default async function HomePage() {
  const user = await getCurrentUser();

  let recent: ImageMeta[] = [];
  if (isDatabaseConfigured()) {
    try {
      recent = await listRecentImages(12);
    } catch (error) {
      console.error("[imgblue] recent images failed:", error);
    }
  }

  return (
    <>
      <SiteHeader />

      <main>
        <section className="relative overflow-hidden">
          <div className="mx-auto max-w-6xl px-5 pb-10 pt-14 sm:pt-20">
            <div className="mx-auto max-w-3xl text-center">
              <span className="chip animate-rise">
                <SparklesIcon className="size-3.5" />
                Image hosting for people who ship
              </span>
              <h1
                className="animate-rise mt-6 font-display text-[2.6rem] font-semibold leading-[1.05] tracking-tight text-white sm:text-6xl"
                style={{ animationDelay: "60ms" }}
              >
                Drop an image.
                <br />
                <span className="text-gradient">Get a link.</span> Move on.
              </h1>
              <p
                className="animate-rise mx-auto mt-5 max-w-xl text-base leading-relaxed text-ice-300 sm:text-lg"
                style={{ animationDelay: "120ms" }}
              >
                A tiny image host with a real API. Upload once, share anywhere. Every image is
                optimized to JPEG, stored safely, and served with a permanent link.
              </p>
            </div>

            <div
              id="upload"
              className="animate-rise mx-auto mt-10 max-w-3xl scroll-mt-24"
              style={{ animationDelay: "180ms" }}
            >
              {user ? <Uploader /> : <UploadGate />}
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-[11px] text-ice-500">
              <span className="inline-flex items-center gap-1.5">
                <CheckIcon className="size-3.5 text-sky-400" />4 MB per image
              </span>
              <span aria-hidden="true">·</span>
              <span className="inline-flex items-center gap-1.5">
                <CheckIcon className="size-3.5 text-sky-400" />
                JPEG optimized, EXIF stripped
              </span>
              <span aria-hidden="true">·</span>
              <span className="inline-flex items-center gap-1.5">
                <CheckIcon className="size-3.5 text-sky-400" />
                Permanent public links
              </span>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-5 py-14">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map((feature) => (
              <div
                key={feature.title}
                className="glass rounded-2xl p-4 transition-colors hover:border-white/15"
              >
                <div className="grid size-9 place-items-center rounded-xl border border-sky-300/15 bg-gradient-to-br from-sky-500/15 to-blue-700/5 text-sky-300">
                  <feature.icon className="size-4" />
                </div>
                <h3 className="mt-3.5 text-sm font-semibold text-white">{feature.title}</h3>
                <p className="mt-1.5 text-xs leading-relaxed text-ice-400">{feature.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section
          id="use-cases"
          aria-labelledby="use-cases-heading"
          className="mx-auto max-w-6xl scroll-mt-24 px-5 py-10"
        >
          <div className="grid gap-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-start">
            <div>
              <span className="chip">
                <LinkIcon className="size-3.5" />
                Use cases
              </span>
              <h2
                id="use-cases-heading"
                className="mt-4 font-display text-3xl font-semibold tracking-tight text-white sm:text-4xl"
              >
                Free image hosting for the work you share
              </h2>
              <p className="mt-3 max-w-md text-sm leading-relaxed text-ice-400">
                imgblue is built for the images that end up in a ticket, a README, a prototype, or a
                chat thread. Upload a screenshot or photo, get a permanent link, and reuse it
                anywhere — no dashboards to dig through and no expiring URLs. Every upload is
                re-encoded to JPEG with EXIF removed, so pages stay light and private details stay
                out of the file.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {USE_CASES.map((useCase) => (
                <div key={useCase.title} className="glass rounded-2xl p-4">
                  <div className="grid size-9 place-items-center rounded-xl border border-sky-300/15 bg-gradient-to-br from-sky-500/15 to-blue-700/5 text-sky-300">
                    <useCase.icon className="size-4" />
                  </div>
                  <h3 className="mt-3.5 text-sm font-semibold text-white">{useCase.title}</h3>
                  <p className="mt-1.5 text-xs leading-relaxed text-ice-400">{useCase.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="recent" className="mx-auto max-w-6xl scroll-mt-24 px-5 py-8">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <span className="chip">
                <span className="size-1.5 rounded-full bg-emerald-400" />
                Live
              </span>
              <h2 className="mt-4 font-display text-3xl font-semibold tracking-tight text-white">
                Fresh in the blue
              </h2>
              <p className="mt-2 text-sm text-ice-400">The latest images uploaded to this instance.</p>
            </div>
            <a href="/api/recent" className="btn-ghost h-9 px-3.5 text-xs">
              <CodeIcon className="size-3.5" />
              JSON feed
            </a>
          </div>

          <RecentGrid images={recent} />
        </section>

        <section id="api" className="mx-auto max-w-6xl scroll-mt-24 px-5 py-20">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:items-start">
            <div>
              <span className="chip">
                <CodeIcon className="size-3.5" />
                API
              </span>
              <h2 className="mt-5 font-display text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                One endpoint.
                <br />
                <span className="text-gradient">Permanent links.</span>
              </h2>
              <p className="mt-4 max-w-md text-sm leading-relaxed text-ice-400">
                Create an account, generate a key, and POST an image. imgblue re-encodes it to a
                compact JPEG, stores the base64 payload in Turso, and returns every link you need.
              </p>

              <div className="mt-6 space-y-2">
                <Endpoint method="POST" path="/api/upload" note="Upload & compress" />
                <Endpoint method="GET" path="/api/i/:id" note="Raw image bytes" />
                <Endpoint method="GET" path="/api/meta/:id" note="Metadata as JSON" />
                <Endpoint method="DELETE" path="/api/images/:id" note="Delete your image" />
              </div>

              <div className="mt-6 rounded-2xl border border-sky-400/15 bg-sky-500/[0.06] p-4">
                <div className="flex items-center gap-2 text-sm font-medium text-sky-200">
                  <KeyIcon className="size-4" />
                  Bring your own key
                </div>
                <p className="mt-1.5 text-xs leading-relaxed text-ice-400">
                  Keys are hashed at rest and shown once. Create, copy, and revoke them from your
                  account. Uploads require a signed-in session or a key.
                </p>
                <Link
                  href={user ? "/account" : "/sign-up?next=%2Faccount"}
                  className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-sky-300 transition-colors hover:text-white"
                >
                  {user ? "Manage your keys" : "Create an account to get a key"}
                  <ArrowRightIcon className="size-3.5" />
                </Link>
              </div>
            </div>

            <div className="space-y-4">
              <CodeTabs />
              <div>
                <div className="mb-2 flex items-center justify-between gap-2">
                  <span className="text-[10.5px] font-semibold uppercase tracking-[0.16em] text-ice-400/80">
                    Response · 201 Created
                  </span>
                  <CopyButton value={RESPONSE_SAMPLE} label="Copy response" />
                </div>
                <pre className="code-block max-h-[360px]">{RESPONSE_SAMPLE}</pre>
              </div>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
