import Link from "next/link";
import { site } from "@/lib/site";
import { GithubIcon } from "./icons";
import { Logo } from "./logo";

export function SiteFooter() {
  return (
    <footer className="relative z-10 mt-24 border-t border-white/[0.06]">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-12 sm:grid-cols-[minmax(0,1fr)_auto]">
        <div>
          <Logo />
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-ice-400">
            Images in, links out. A small, fast image host for developers, demos, and everything
            that deserves a permanent URL.
          </p>
        </div>

        <div className="flex flex-wrap gap-x-8 gap-y-3 text-sm text-ice-400 sm:flex-col sm:items-end">
          <Link href="/#upload" className="transition-colors hover:text-white">
            Upload
          </Link>
          <Link href="/#api" className="transition-colors hover:text-white">
            API
          </Link>
          <Link href="/#use-cases" className="transition-colors hover:text-white">
            Use cases
          </Link>
          <Link href="/#recent" className="transition-colors hover:text-white">
            Recent
          </Link>
          <a href="/api/recent" className="transition-colors hover:text-white">
            JSON feed
          </a>
          {site.repo ? (
            <a
              href={site.repo}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 transition-colors hover:text-white"
            >
              <GithubIcon className="size-4" />
              Source
            </a>
          ) : null}
        </div>
      </div>

      <div className="border-t border-white/[0.04] px-5 py-5 text-center text-xs text-ice-500">
        © {new Date().getFullYear()} imgblue · Built with Next.js, Turso &amp; sharp · Hosted on Vercel
      </div>
    </footer>
  );
}
