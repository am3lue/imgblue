import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ApiKeyManager } from "@/components/api-key-manager";
import {
  CodeIcon,
  DatabaseIcon,
  EyeIcon,
  ImageIcon,
  KeyIcon,
  UploadIcon,
} from "@/components/icons";
import { ImageManager } from "@/components/image-manager";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { SignOutButton } from "@/components/sign-out-button";
import { listApiKeys } from "@/lib/api-keys";
import { getCurrentUser } from "@/lib/auth";
import { formatBytes } from "@/lib/format";
import { getUserStats, listUserImages } from "@/lib/images";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Account",
  robots: { index: false, follow: false },
};

export default async function AccountPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in?next=/account");

  const [keys, images, stats] = await Promise.all([
    listApiKeys(user.id),
    listUserImages(user.id),
    getUserStats(user.id),
  ]);

  const firstName = (user.name ?? user.email.split("@")[0] ?? "there").split(/\s+/)[0];
  const initial = (user.name?.trim() || user.email).charAt(0).toUpperCase();

  const statCards = [
    { label: "Images", value: stats.images.toLocaleString("en-US"), icon: ImageIcon },
    { label: "Stored", value: formatBytes(stats.storageBytes), icon: DatabaseIcon },
    { label: "Total views", value: stats.views.toLocaleString("en-US"), icon: EyeIcon },
    { label: "Active keys", value: String(keys.length), icon: KeyIcon },
  ];

  return (
    <>
      <SiteHeader />

      <main className="mx-auto max-w-6xl px-5 py-10 sm:py-12">
        <div className="flex flex-wrap items-end justify-between gap-5">
          <div className="flex items-center gap-4">
            <span className="grid size-14 place-items-center rounded-2xl bg-gradient-to-br from-sky-400 to-blue-700 font-display text-xl font-bold text-white ring-1 ring-white/20">
              {initial}
            </span>
            <div>
              <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-sky-400">
                Account
              </span>
              <h1 className="mt-1 font-display text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                Hey {firstName}
              </h1>
              <p className="mt-0.5 text-xs text-ice-400">{user.email}</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link href="/#upload" className="btn-primary h-10 px-4 text-sm">
              <UploadIcon className="size-4" />
              Upload
            </Link>
            <SignOutButton />
          </div>
        </div>

        <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {statCards.map((card) => (
            <div key={card.label} className="glass rounded-2xl p-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-ice-500">
                  {card.label}
                </span>
                <card.icon className="size-4 text-sky-400/80" />
              </div>
              <p className="mt-3 font-display text-2xl font-semibold text-white">{card.value}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 grid gap-5 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)] lg:items-start">
          <ApiKeyManager initialKeys={keys} />

          <section className="glass rounded-3xl p-5 sm:p-6">
            <h2 className="flex items-center gap-2 font-display text-lg font-semibold text-white">
              <CodeIcon className="size-4 text-sky-300" />
              Quick start
            </h2>
            <p className="mt-1 text-xs leading-relaxed text-ice-400">
              Point your tools at the upload endpoint with a key from above.
            </p>

            <div className="mt-4 space-y-1.5 rounded-xl border border-white/[0.07] bg-ink-950/50 p-3 font-mono text-[11px] leading-relaxed text-ice-300">
              <p>
                <span className="text-emerald-300">POST</span> /api/upload
              </p>
              <p className="text-ice-500">Authorization: Bearer ib_live_…</p>
              <p className="text-ice-500">Content-Type: multipart/form-data</p>
            </div>

            <div className="mt-4 space-y-2 text-xs text-ice-400">
              <Link
                href="/#api"
                className="flex items-center justify-between rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2 transition-colors hover:border-white/15 hover:text-white"
              >
                <span>API examples</span>
                <span aria-hidden="true">→</span>
              </Link>
              <a
                href="/api/recent"
                className="flex items-center justify-between rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2 transition-colors hover:border-white/15 hover:text-white"
              >
                <span>Public JSON feed</span>
                <span aria-hidden="true">→</span>
              </a>
            </div>

            <p className="mt-4 text-[11px] leading-relaxed text-ice-500">
              Tip: keep separate keys for production and scripts, so revoking one never breaks the
              other.
            </p>
          </section>
        </div>

        <ImageManager initialImages={images} />
      </main>

      <SiteFooter />
    </>
  );
}
