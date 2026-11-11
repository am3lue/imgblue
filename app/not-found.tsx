import Link from "next/link";
import { ImageIcon } from "@/components/icons";
import { Logo } from "@/components/logo";

export default function NotFound() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center px-5 py-16 text-center">
      <Logo />

      <div className="mt-10 grid size-16 place-items-center rounded-2xl border border-sky-300/20 bg-gradient-to-br from-sky-500/20 to-blue-700/10 text-sky-300">
        <ImageIcon className="size-7" />
      </div>

      <p className="mt-6 font-mono text-xs uppercase tracking-[0.3em] text-sky-400">404</p>
      <h1 className="mt-3 font-display text-3xl font-semibold tracking-tight text-white">
        This image isn&apos;t here
      </h1>
      <p className="mt-2 max-w-sm text-sm leading-relaxed text-ice-400">
        The link may be wrong, or the image was deleted by its owner.
      </p>

      <div className="mt-7 flex flex-wrap justify-center gap-3">
        <Link href="/" className="btn-primary h-10 px-4 text-sm">
          Back home
        </Link>
        <Link href="/#upload" className="btn-ghost h-10 px-4 text-sm">
          Upload an image
        </Link>
      </div>
    </main>
  );
}
