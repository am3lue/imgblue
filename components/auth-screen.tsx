import Link from "next/link";
import { AuthForm } from "./auth-form";
import { LinkIcon, ShieldIcon, SparklesIcon, ZapIcon } from "./icons";
import { Logo } from "./logo";

export function AuthScreen({ mode, next }: { mode: "signin" | "signup"; next: string }) {
  const signup = mode === "signup";
  const suffix = next !== "/account" ? `?next=${encodeURIComponent(next)}` : "";
  const otherHref = signup ? `/sign-in${suffix}` : `/sign-up${suffix}`;

  return (
    <main className="relative flex min-h-dvh flex-col overflow-hidden">
      <div className="pointer-events-none absolute -left-40 top-16 size-96 rounded-full bg-blue-600/15 blur-3xl" />
      <div className="pointer-events-none absolute -right-32 bottom-0 size-96 rounded-full bg-sky-500/10 blur-3xl" />

      <div className="relative mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-6">
        <Logo />
        <Link href="/" className="text-sm text-ice-400 transition-colors hover:text-white">
          Back home
        </Link>
      </div>

      <div className="relative flex flex-1 items-center justify-center px-5 pb-16">
        <div className="grid w-full max-w-4xl gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,420px)] lg:items-center">
          <div className="hidden lg:block">
            <span className="chip">
              <SparklesIcon className="size-3.5" />
              Free to start
            </span>
            <h1 className="mt-5 font-display text-4xl font-semibold leading-[1.1] tracking-tight text-white">
              Your images.
              <br />
              Your keys.
              <br />
              <span className="text-gradient">Your blue corner.</span>
            </h1>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-ice-400">
              {signup
                ? "Create a free account to upload images, manage permanent links, and mint API keys for your own tools."
                : "Welcome back. Sign in to manage your links, images, and API keys."}
            </p>

            <ul className="mt-7 space-y-3 text-sm text-ice-300">
              <li className="flex items-center gap-2.5">
                <span className="grid size-7 place-items-center rounded-lg bg-blue-500/15 text-sky-300">
                  <ZapIcon className="size-3.5" />
                </span>
                Permanent, hotlink-ready image URLs
              </li>
              <li className="flex items-center gap-2.5">
                <span className="grid size-7 place-items-center rounded-lg bg-blue-500/15 text-sky-300">
                  <ShieldIcon className="size-3.5" />
                </span>
                API keys hashed at rest, revocable anytime
              </li>
              <li className="flex items-center gap-2.5">
                <span className="grid size-7 place-items-center rounded-lg bg-blue-500/15 text-sky-300">
                  <LinkIcon className="size-3.5" />
                </span>
                One-click Markdown, HTML, and direct links
              </li>
            </ul>
          </div>

          <div>
            <div className="mb-6 text-center lg:hidden">
              <span className="chip">
                <SparklesIcon className="size-3.5" />
                {signup ? "Free to start" : "Welcome back"}
              </span>
              <h1 className="mt-4 font-display text-3xl font-semibold tracking-tight text-white">
                {signup ? "Create your account" : "Sign in to imgblue"}
              </h1>
            </div>

            <div className="glass-strong rounded-3xl p-5 sm:p-7">
              <div className="mb-5 hidden lg:block">
                <h2 className="font-display text-xl font-semibold text-white">
                  {signup ? "Create your account" : "Sign in"}
                </h2>
                <p className="mt-1 text-xs text-ice-400">
                  {signup
                    ? "Free. No credit card. Just a place for your pixels."
                    : "Use the email you signed up with."}
                </p>
              </div>
              <AuthForm mode={mode} next={next} />
            </div>

            <p className="mt-5 text-center text-sm text-ice-400">
              {signup ? "Already have an account? " : "New to imgblue? "}
              <Link href={otherHref} className="font-medium text-sky-300 transition-colors hover:text-white">
                {signup ? "Sign in" : "Create an account"}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}

export function safeNext(value: string | string[] | undefined): string {
  const next = Array.isArray(value) ? value[0] : value;
  if (!next || !next.startsWith("/") || next.startsWith("//")) return "/account";
  return next;
}
