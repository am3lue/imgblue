"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Logo } from "@/components/logo";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center px-5 py-16 text-center">
      <Logo />

      <p className="mt-10 font-mono text-xs uppercase tracking-[0.3em] text-sky-400">500</p>
      <h1 className="mt-3 font-display text-3xl font-semibold tracking-tight text-white">
        Something went blue
      </h1>
      <p className="mt-2 max-w-sm text-sm leading-relaxed text-ice-400">
        We hit an unexpected error. It might be temporary — try again in a moment.
      </p>

      <div className="mt-7 flex flex-wrap justify-center gap-3">
        <button type="button" onClick={reset} className="btn-primary h-10 px-4 text-sm">
          Try again
        </button>
        <Link href="/" className="btn-ghost h-10 px-4 text-sm">
          Back home
        </Link>
      </div>

      {error.digest ? (
        <p className="mt-6 font-mono text-[10px] text-ice-500">digest: {error.digest}</p>
      ) : null}
    </main>
  );
}
