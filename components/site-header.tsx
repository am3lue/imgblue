import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { site } from "@/lib/site";
import { GithubIcon, UploadIcon } from "./icons";
import { Logo } from "./logo";

export async function SiteHeader() {
  const user = await getCurrentUser();
  const label = user ? user.name?.trim() || user.email : "";
  const initial = label.charAt(0).toUpperCase() || "?";

  return (
    <header className="sticky top-0 z-40 border-b border-white/[0.06] bg-ink-950/65 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-5">
        <Logo />

        <nav className="flex items-center gap-1 text-sm text-ice-300">
          <Link
            href="/#recent"
            className="hidden rounded-lg px-3 py-2 transition-colors hover:bg-white/5 hover:text-white sm:block"
          >
            Recent
          </Link>
          <Link
            href="/#api"
            className="hidden rounded-lg px-3 py-2 transition-colors hover:bg-white/5 hover:text-white sm:block"
          >
            API
          </Link>
          {site.repo ? (
            <a
              href={site.repo}
              target="_blank"
              rel="noreferrer"
              className="hidden items-center gap-1.5 rounded-lg px-3 py-2 transition-colors hover:bg-white/5 hover:text-white sm:flex"
            >
              <GithubIcon className="size-4" />
              GitHub
            </a>
          ) : null}

          {user ? (
            <Link
              href="/account"
              className="hidden items-center gap-2 rounded-lg py-1.5 pl-1.5 pr-3 transition-colors hover:bg-white/5 sm:flex"
            >
              <span className="grid size-7 place-items-center rounded-full bg-gradient-to-br from-sky-400 to-blue-600 text-[11px] font-bold text-white ring-1 ring-white/20">
                {initial}
              </span>
              <span className="text-[13px] text-ice-200">Account</span>
            </Link>
          ) : (
            <Link
              href="/sign-in?next=%2Faccount"
              className="hidden rounded-lg px-3 py-2 transition-colors hover:bg-white/5 hover:text-white sm:block"
            >
              Sign in
            </Link>
          )}

          <Link
            href={user ? "/#upload" : "/sign-up?next=%2F%23upload"}
            className="btn-primary ml-1 h-9 px-3.5 text-sm"
          >
            <UploadIcon className="size-4" />
            {user ? "Upload" : "Get started"}
          </Link>
        </nav>
      </div>
    </header>
  );
}
