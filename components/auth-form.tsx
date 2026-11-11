"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { EyeIcon, LoaderIcon, SparklesIcon } from "./icons";

type AuthFormProps = {
  mode: "signin" | "signup";
  next: string;
};

export function AuthForm({ mode, next }: AuthFormProps) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const signup = mode === "signup";

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;

    setPending(true);
    setError(null);

    try {
      const response = await fetch(signup ? "/api/auth/signup" : "/api/auth/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(signup ? { name, email, password } : { email, password }),
      });

      const data = (await response.json().catch(() => ({}))) as {
        error?: string;
        hint?: string;
      };

      if (!response.ok) {
        setError(
          data.error ? `${data.error}${data.hint ? ` ${data.hint}` : ""}` : "Something went wrong.",
        );
        setPending(false);
        return;
      }

      router.replace(next);
      router.refresh();
    } catch {
      setError("Network error. Please check your connection and try again.");
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {signup ? (
        <label className="block">
          <span className="mb-1.5 block text-xs font-medium text-ice-300">Name (optional)</span>
          <input
            className="field h-11"
            type="text"
            autoComplete="name"
            maxLength={80}
            placeholder="Ada Lovelace"
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
        </label>
      ) : null}

      <label className="block">
        <span className="mb-1.5 block text-xs font-medium text-ice-300">Email</span>
        <input
          className="field h-11"
          type="email"
          autoComplete="email"
          required
          maxLength={254}
          placeholder="you@example.com"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
      </label>

      <label className="block">
        <span className="mb-1.5 block text-xs font-medium text-ice-300">Password</span>
        <span className="relative block">
          <input
            className="field h-11 pr-11"
            type={showPassword ? "text" : "password"}
            autoComplete={signup ? "new-password" : "current-password"}
            required
            minLength={8}
            maxLength={200}
            placeholder={signup ? "At least 8 characters" : "Your password"}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
          <button
            type="button"
            onClick={() => setShowPassword((current) => !current)}
            aria-label={showPassword ? "Hide password" : "Show password"}
            className="absolute right-1.5 top-1/2 grid size-8 -translate-y-1/2 place-items-center rounded-lg text-ice-400 transition-colors hover:text-white"
          >
            <EyeIcon className="size-4" />
          </button>
        </span>
      </label>

      {error ? (
        <div
          role="alert"
          className="rounded-xl border border-red-400/25 bg-red-500/10 px-3.5 py-2.5 text-xs leading-relaxed text-red-200"
        >
          {error}
        </div>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="btn-primary h-11 w-full text-sm disabled:cursor-not-allowed disabled:opacity-70"
      >
        {pending ? <LoaderIcon className="size-4" /> : signup ? <SparklesIcon className="size-4" /> : null}
        {pending ? "One moment…" : signup ? "Create account" : "Sign in"}
      </button>

      <p className="pt-1 text-center text-[11px] leading-relaxed text-ice-500">
        {signup
          ? "Free to start. No credit card. Keys are hashed and revocable."
          : "Sessions last 30 days and are stored as secure, http-only cookies."}
      </p>
    </form>
  );
}
