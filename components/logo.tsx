import Link from "next/link";

export function Logo({ href = "/", wordmark = true }: { href?: string; wordmark?: boolean }) {
  return (
    <Link href={href} className="group inline-flex items-center gap-2.5" aria-label="imgblue home">
      <span className="relative grid size-9 place-items-center overflow-hidden rounded-xl bg-gradient-to-br from-sky-400 via-blue-500 to-indigo-600 shadow-[0_10px_30px_-10px_rgba(59,130,246,0.85)] ring-1 ring-white/25">
        <span className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/25 to-white/0 opacity-70" />
        <svg viewBox="0 0 24 24" aria-hidden="true" className="relative size-5 text-white">
          <path
            d="M12 2.6c3.2 4.1 6.2 7.5 6.2 11a6.2 6.2 0 1 1-12.4 0c0-3.5 3-6.9 6.2-11Z"
            fill="currentColor"
          />
          <path
            d="M9.2 14.3a3.1 3.1 0 0 0 2.9 2.6"
            stroke="rgba(15,42,86,0.55)"
            strokeWidth="1.4"
            strokeLinecap="round"
            fill="none"
          />
        </svg>
      </span>
      {wordmark ? (
        <span className="font-display text-[19px] font-semibold tracking-tight text-white">
          img<span className="text-sky-400">blue</span>
        </span>
      ) : null}
    </Link>
  );
}
