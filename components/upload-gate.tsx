import Link from "next/link";
import { ArrowRightIcon, KeyIcon, LockIcon } from "./icons";

export function UploadGate() {
  return (
    <div className="glass rounded-[1.6rem] p-1.5">
      <div className="relative overflow-hidden rounded-[1.3rem] border border-white/[0.06] bg-ink-950/40 px-6 py-14 text-center">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-[radial-gradient(320px_120px_at_50%_0%,rgba(56,132,255,0.18),transparent_70%)]" />

        <div className="relative mx-auto flex max-w-md flex-col items-center">
          <div className="grid size-16 place-items-center rounded-2xl border border-sky-300/20 bg-gradient-to-br from-sky-500/20 to-blue-700/10 text-sky-300">
            <LockIcon className="size-7" />
          </div>
          <h2 className="mt-5 font-display text-xl font-semibold text-white sm:text-2xl">
            Sign in to start uploading
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-ice-400">
            Create a free account to get permanent links, your own API keys, and full control over
            every image you upload.
          </p>

          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link href="/sign-up?next=%2F%23upload" className="btn-primary h-11 px-5 text-sm">
              Create account
              <ArrowRightIcon className="size-4" />
            </Link>
            <Link href="/sign-in?next=%2F%23upload" className="btn-ghost h-11 px-5 text-sm">
              Sign in
            </Link>
          </div>

          <p className="mt-5 inline-flex items-center gap-1.5 text-[11px] text-ice-500">
            <KeyIcon className="size-3.5" />
            Building something? Generate an API key after signing up.
          </p>
        </div>
      </div>
    </div>
  );
}
