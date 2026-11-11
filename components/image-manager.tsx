"use client";

import Link from "next/link";
import { useState } from "react";
import { formatBytes, formatDate } from "@/lib/format";
import type { ImageMeta } from "@/lib/images";
import { CopyButton } from "./copy-button";
import { ExternalLinkIcon, ImageIcon, LoaderIcon, TrashIcon } from "./icons";

export function ImageManager({ initialImages }: { initialImages: ImageMeta[] }) {
  const [images, setImages] = useState<ImageMeta[]>(initialImages);
  const [error, setError] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  async function remove(id: string) {
    if (confirmId !== id) {
      setConfirmId(id);
      setTimeout(() => {
        setConfirmId((current) => (current === id ? null : current));
      }, 4000);
      return;
    }

    setConfirmId(null);
    setDeleting(id);
    setError(null);

    try {
      const response = await fetch(`/api/images/${id}`, { method: "DELETE" });
      if (!response.ok && response.status !== 204) {
        const data = (await response.json().catch(() => ({}))) as { error?: string };
        setError(data.error ?? "Could not delete the image.");
        return;
      }
      setImages((current) => current.filter((image) => image.id !== id));
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setDeleting(null);
    }
  }

  return (
    <section className="mt-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-display text-xl font-semibold text-white">Your images</h2>
          <p className="mt-1 text-xs text-ice-400">
            Deleting an image breaks its links immediately.
          </p>
        </div>
        <Link href="/#upload" className="btn-ghost h-9 px-3.5 text-xs">
          Upload another
        </Link>
      </div>

      {error ? (
        <div
          role="alert"
          className="mt-4 rounded-xl border border-red-400/25 bg-red-500/10 px-3.5 py-2.5 text-xs text-red-200"
        >
          {error}
        </div>
      ) : null}

      {images.length === 0 ? (
        <div className="mt-5 grid place-items-center rounded-3xl border border-dashed border-white/12 bg-white/[0.02] px-6 py-14 text-center">
          <div className="grid size-12 place-items-center rounded-2xl bg-white/[0.04] text-ice-400">
            <ImageIcon className="size-6" />
          </div>
          <p className="mt-4 font-display text-lg text-white">No images yet</p>
          <p className="mt-1 text-sm text-ice-500">Your uploads will show up here with links and stats.</p>
          <Link href="/#upload" className="btn-primary mt-5 h-9 px-4 text-xs">
            Upload your first image
          </Link>
        </div>
      ) : (
        <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {images.map((image) => (
            <article
              key={image.id}
              className="group overflow-hidden rounded-2xl border border-white/[0.08] bg-ink-900/50"
            >
              <Link
                href={`/i/${image.id}`}
                className="block aspect-[16/10] overflow-hidden bg-ink-950"
                aria-label={`Open ${image.original_name ?? image.id}`}
              >
                <img
                  src={`/api/i/${image.id}`}
                  alt={image.original_name ?? `Image ${image.id}`}
                  loading="lazy"
                  className="size-full object-cover transition duration-500 group-hover:scale-[1.02]"
                />
              </Link>

              <div className="p-3.5">
                <div className="flex items-center gap-2">
                  <p className="min-w-0 flex-1 truncate text-sm font-medium text-ice-100">
                    {image.original_name ?? `${image.id}.jpg`}
                  </p>
                  <span className="shrink-0 rounded-md bg-white/[0.05] px-1.5 py-0.5 text-[10px] text-ice-400">
                    {image.views} views
                  </span>
                </div>
                <p className="mt-1 text-[11px] text-ice-500">
                  {image.width}×{image.height} · {formatBytes(image.size_bytes)} · {formatDate(image.created_at)}
                </p>

                <div className="mt-3 flex items-center gap-1.5">
                  <Link
                    href={`/i/${image.id}`}
                    className="btn-ghost h-8 flex-1 px-2.5 text-[11px]"
                  >
                    <ExternalLinkIcon className="size-3.5" />
                    Open
                  </Link>
                  <CopyButton
                    value={() => `${window.location.origin}/api/i/${image.id}`}
                    label="Copy direct link"
                    className="border border-white/10 bg-white/[0.04]"
                  />
                  <button
                    type="button"
                    onClick={() => remove(image.id)}
                    disabled={deleting === image.id}
                    aria-label={`Delete ${image.original_name ?? image.id}`}
                    className={`grid h-8 shrink-0 place-items-center rounded-lg border px-2 text-[11px] font-medium transition-colors ${
                      confirmId === image.id
                        ? "border-red-400/30 bg-red-500/15 px-2.5 text-red-200"
                        : "border-white/10 bg-white/[0.04] text-ice-400 hover:text-red-200"
                    }`}
                  >
                    {deleting === image.id ? (
                      <LoaderIcon className="size-3.5" />
                    ) : confirmId === image.id ? (
                      "Confirm?"
                    ) : (
                      <TrashIcon className="size-3.5" />
                    )}
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
