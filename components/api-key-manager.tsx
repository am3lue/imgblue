"use client";

import { useState, type FormEvent } from "react";
import type { ApiKeySummary } from "@/lib/api-keys";
import { formatDate } from "@/lib/format";
import { CopyButton } from "./copy-button";
import { CheckIcon, KeyIcon, LoaderIcon, PlusIcon, TrashIcon } from "./icons";

export function ApiKeyManager({ initialKeys }: { initialKeys: ApiKeySummary[] }) {
  const [keys, setKeys] = useState<ApiKeySummary[]>(initialKeys);
  const [name, setName] = useState("");
  const [creating, setCreating] = useState(false);
  const [newKey, setNewKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [revoking, setRevoking] = useState<string | null>(null);

  async function createKey(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (creating) return;

    setCreating(true);
    setError(null);

    try {
      const response = await fetch("/api/account/keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      const data = (await response.json().catch(() => ({}))) as {
        key?: string;
        apiKey?: ApiKeySummary;
        error?: string;
      };

      if (!response.ok || !data.key || !data.apiKey) {
        setError(data.error ?? "Could not create the key.");
        return;
      }

      setKeys((current) => [data.apiKey as ApiKeySummary, ...current]);
      setNewKey(data.key);
      setName("");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setCreating(false);
    }
  }

  async function revoke(id: string) {
    if (confirmId !== id) {
      setConfirmId(id);
      setTimeout(() => {
        setConfirmId((current) => (current === id ? null : current));
      }, 4000);
      return;
    }

    setConfirmId(null);
    setRevoking(id);
    setError(null);

    try {
      const response = await fetch(`/api/account/keys/${id}`, { method: "DELETE" });
      if (!response.ok) {
        const data = (await response.json().catch(() => ({}))) as { error?: string };
        setError(data.error ?? "Could not revoke the key.");
        return;
      }
      setKeys((current) => current.filter((key) => key.id !== id));
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setRevoking(null);
    }
  }

  return (
    <section className="glass rounded-3xl p-5 sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 font-display text-lg font-semibold text-white">
            <KeyIcon className="size-4 text-sky-300" />
            API keys
          </h2>
          <p className="mt-1 text-xs leading-relaxed text-ice-400">
            Hashed at rest and shown once. Send one as{" "}
            <code className="font-mono text-[10.5px] text-ice-300">Authorization: Bearer …</code>
          </p>
        </div>
        <span className="shrink-0 rounded-full border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[10px] text-ice-400">
          {keys.length}/10
        </span>
      </div>

      {newKey ? (
        <div className="mt-5 rounded-2xl border border-emerald-400/25 bg-emerald-500/[0.07] p-3.5">
          <div className="flex items-center gap-2 text-xs font-medium text-emerald-200">
            <CheckIcon className="size-3.5" />
            Key created. Copy it now — it won&apos;t be shown again.
          </div>
          <div className="mt-2.5 flex items-center gap-2 rounded-xl border border-emerald-300/20 bg-ink-950/50 py-1 pl-3 pr-1">
            <code className="min-w-0 flex-1 truncate font-mono text-[11.5px] text-emerald-100">{newKey}</code>
            <CopyButton value={newKey} label="Copy API key" />
          </div>
          <button
            type="button"
            onClick={() => setNewKey(null)}
            className="mt-2 text-[11px] text-emerald-200/70 transition-colors hover:text-emerald-100"
          >
            I&apos;ve saved it
          </button>
        </div>
      ) : null}

      {error ? (
        <div
          role="alert"
          className="mt-4 rounded-xl border border-red-400/25 bg-red-500/10 px-3.5 py-2.5 text-xs text-red-200"
        >
          {error}
        </div>
      ) : null}

      <form onSubmit={createKey} className="mt-5 flex gap-2">
        <input
          className="field h-10 flex-1"
          placeholder="Key name (e.g. production, ci)"
          maxLength={60}
          value={name}
          onChange={(event) => setName(event.target.value)}
        />
        <button
          type="submit"
          disabled={creating}
          className="btn-primary h-10 shrink-0 px-3.5 text-xs disabled:opacity-70"
        >
          {creating ? <LoaderIcon className="size-3.5" /> : <PlusIcon className="size-3.5" />}
          Create
        </button>
      </form>

      <div className="mt-4 space-y-2">
        {keys.length === 0 ? (
          <p className="rounded-xl border border-dashed border-white/10 px-4 py-5 text-center text-xs text-ice-500">
            No keys yet. Create one to start using the API.
          </p>
        ) : (
          keys.map((key) => (
            <div
              key={key.id}
              className="flex items-center gap-3 rounded-xl border border-white/[0.08] bg-ink-950/40 px-3 py-2.5"
            >
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="truncate text-xs font-medium text-ice-100">{key.name}</span>
                  <span className="shrink-0 rounded-md bg-white/[0.05] px-1.5 py-0.5 font-mono text-[10px] text-ice-400">
                    ib_live_••••{key.hint}
                  </span>
                </div>
                <p className="mt-0.5 text-[10px] text-ice-500">
                  Created {formatDate(key.created_at)} ·{" "}
                  {key.last_used_at ? `Last used ${formatDate(key.last_used_at)}` : "Never used"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => revoke(key.id)}
                disabled={revoking === key.id}
                aria-label={`Revoke ${key.name}`}
                className={`shrink-0 rounded-lg px-2 py-1.5 text-[11px] font-medium transition-colors ${
                  confirmId === key.id
                    ? "bg-red-500/15 text-red-200"
                    : "text-ice-500 hover:bg-white/5 hover:text-ice-200"
                }`}
              >
                {revoking === key.id ? (
                  <LoaderIcon className="size-3.5" />
                ) : confirmId === key.id ? (
                  "Confirm?"
                ) : (
                  <TrashIcon className="size-3.5" />
                )}
              </button>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
