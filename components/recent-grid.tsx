import Link from "next/link";
import { formatBytes } from "@/lib/format";
import type { ImageMeta } from "@/lib/images";
import { ImageIcon } from "./icons";

export function RecentGrid({ images }: { images: ImageMeta[] }) {
  if (images.length === 0) {
    return (
      <div className="mt-8 grid place-items-center rounded-3xl border border-dashed border-white/12 bg-white/[0.02] px-6 py-16 text-center">
        <div className="grid size-12 place-items-center rounded-2xl bg-white/[0.04] text-ice-400">
          <ImageIcon className="size-6" />
        </div>
        <p className="mt-4 font-display text-lg text-white">Nothing here yet</p>
        <p className="mt-1 text-sm text-ice-500">Be the first to leave a mark in the blue.</p>
        <Link href="/#upload" className="btn-ghost mt-5 h-9 px-4 text-xs">
          Upload the first image
        </Link>
      </div>
    );
  }

  return (
    <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {images.map((image) => (
        <Link
          key={image.id}
          href={`/i/${image.id}`}
          className="group relative overflow-hidden rounded-2xl border border-white/[0.08] bg-ink-900/60"
        >
          <div className="aspect-square overflow-hidden">
            <img
              src={`/api/i/${image.id}`}
              alt={image.original_name ?? `Image ${image.id}`}
              loading="lazy"
              className="size-full object-cover transition duration-500 group-hover:scale-105"
            />
          </div>
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink-950/90 via-ink-950/0 to-transparent opacity-80" />
          <div className="absolute inset-x-0 bottom-0 p-3">
            <p className="truncate text-[11px] font-medium text-white/90">
              {image.original_name ?? `${image.id}.jpg`}
            </p>
            <p className="mt-0.5 text-[10px] text-ice-300/80">
              {image.width}×{image.height} · {formatBytes(image.size_bytes)}
            </p>
          </div>
        </Link>
      ))}
    </div>
  );
}
