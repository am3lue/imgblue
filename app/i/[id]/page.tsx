import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/json-ld";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { ShareActions } from "@/components/share-actions";
import { imageLinks } from "@/lib/api";
import { formatBytes, formatDate } from "@/lib/format";
import { cleanImageId, getImageMeta, incrementViews } from "@/lib/images";
import { imageJsonLd } from "@/lib/seo";
import { siteUrl } from "@/lib/site";
import { baseUrl } from "@/lib/url";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ id: string }>;
};

function displayName(originalName: string | null, id: string): string {
  return `${(originalName ?? id).replace(/\.[^.]+$/, "") || id}.jpg`;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const image = await getImageMeta(cleanImageId(id)).catch(() => null);
  if (!image) {
    return { title: "Image not found", robots: { index: false, follow: false } };
  }

  const direct = `${siteUrl}/api/i/${image.id}`;
  const shareUrl = `${siteUrl}/i/${image.id}`;
  const name = displayName(image.original_name, image.id);
  const description = `${name} · ${image.width}×${image.height} · ${formatBytes(image.size_bytes)} — view and download this image on imgblue.`;

  return {
    title: name,
    description,
    alternates: { canonical: shareUrl },
    openGraph: {
      title: name,
      description,
      url: shareUrl,
      siteName: "imgblue",
      locale: "en_US",
      type: "website",
      images: [{ url: direct, width: image.width, height: image.height, alt: name }],
    },
    twitter: {
      card: "summary_large_image",
      title: name,
      description,
      images: [direct],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
      },
    },
  };
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] px-2.5 py-2">
      <dt className="text-[9.5px] uppercase tracking-[0.14em] text-ice-500">{label}</dt>
      <dd className="mt-1 truncate text-xs font-medium text-ice-100">{value}</dd>
    </div>
  );
}

export default async function ImagePage({ params }: PageProps) {
  const { id: rawId } = await params;
  const id = cleanImageId(rawId);
  const image = id ? await getImageMeta(id) : null;

  if (!image) notFound();

  await incrementViews(image.id);

  const base = await baseUrl();
  const name = displayName(image.original_name, image.id);
  const links = imageLinks(base, image.id, name);

  return (
    <>
      <JsonLd
        data={imageJsonLd(image, `${siteUrl}/i/${image.id}`, `${siteUrl}/api/i/${image.id}`)}
      />
      <SiteHeader />

      <main className="mx-auto max-w-6xl px-5 py-8 sm:py-12">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <Link
            href="/#recent"
            className="inline-flex items-center gap-1.5 text-xs text-ice-400 transition-colors hover:text-white"
          >
            ← Recent images
          </Link>
          <span className="text-[11px] text-ice-500">Served from Vercel · stored in Turso</span>
        </div>

        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="glass rounded-3xl p-1.5">
            <div className="checker flex min-h-[260px] items-center justify-center overflow-hidden rounded-[1.35rem]">
              <img
                src={links.direct_url}
                alt={`${name} — ${image.width} by ${image.height} image hosted on imgblue`}
                width={image.width}
                height={image.height}
                loading="eager"
                decoding="async"
                fetchPriority="high"
                className="max-h-[72vh] w-full object-contain"
              />
            </div>
          </div>

          <aside className="glass-strong h-fit rounded-3xl p-5 sm:p-6">
            <span className="inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-300">
              <span className="pulse-dot size-1.5 rounded-full bg-emerald-400" />
              Live
            </span>
            <h1 className="mt-3 break-words font-display text-xl font-semibold text-white sm:text-2xl">
              {name}
            </h1>
            <p className="mt-1 text-xs text-ice-500">Uploaded {formatDate(image.created_at)}</p>

            <dl className="mt-5 grid grid-cols-3 gap-2">
              <Stat label="Size" value={formatBytes(image.size_bytes)} />
              <Stat label="Pixels" value={`${image.width}×${image.height}`} />
              <Stat label="Views" value={String(image.views)} />
            </dl>

            <div className="my-5 h-px bg-white/[0.07]" />

            <ShareActions
              url={links.url}
              directUrl={links.direct_url}
              downloadUrl={links.download_url}
              markdown={links.markdown}
              html={links.html}
              filename={name}
            />
          </aside>
        </div>

        <div className="mt-10 rounded-3xl border border-white/[0.07] bg-white/[0.02] p-6 text-center">
          <p className="text-sm text-ice-300">Have an image of your own?</p>
          <Link href="/#upload" className="btn-primary mt-3 h-10 px-4 text-sm">
            Upload to imgblue
          </Link>
        </div>
      </main>

      <SiteFooter />
    </>
  );
}
