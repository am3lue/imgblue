"use client";

import { useState } from "react";
import { CopyField } from "./copy-field";
import { CopyButton } from "./copy-button";
import { DownloadIcon, ExternalLinkIcon, ShareIcon } from "./icons";

type ShareActionsProps = {
  url: string;
  directUrl: string;
  downloadUrl: string;
  markdown: string;
  html: string;
  filename: string;
};

export function ShareActions({
  url,
  directUrl,
  downloadUrl,
  markdown,
  html,
  filename,
}: ShareActionsProps) {
  const [tab, setTab] = useState<"markdown" | "html">("markdown");
  const [shared, setShared] = useState(false);
  const embed = tab === "markdown" ? markdown : html;

  const share = async () => {
    try {
      if (navigator.share) {
        await navigator.share({ title: filename, url });
        return;
      }
    } catch {
      // Fall through to clipboard.
    }

    try {
      await navigator.clipboard.writeText(url);
      setShared(true);
      setTimeout(() => setShared(false), 1600);
    } catch {
      window.open(url, "_blank", "noreferrer");
    }
  };

  return (
    <div className="space-y-3">
      <CopyField label="Share link" value={url} />
      <CopyField label="Direct image" value={directUrl} />

      <div>
        <div className="mb-1.5 flex items-center justify-between gap-2">
          <span className="text-[10.5px] font-semibold uppercase tracking-[0.16em] text-ice-400/80">
            Embed
          </span>
          <div className="flex gap-1">
            {(["markdown", "html"] as const).map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setTab(item)}
                className={`rounded-md px-2 py-0.5 text-[10px] font-medium capitalize transition-colors ${
                  tab === item ? "bg-white/10 text-white" : "text-ice-500 hover:text-ice-200"
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-ink-950/60 py-1 pl-3 pr-1">
          <code className="min-w-0 flex-1 truncate font-mono text-[11px] text-ice-200">{embed}</code>
          <CopyButton value={embed} label="Copy embed code" />
        </div>
      </div>

      <div className="flex flex-wrap gap-2 pt-1">
        <a href={downloadUrl} className="btn-primary h-9 px-3.5 text-xs">
          <DownloadIcon className="size-4" />
          Download JPEG
        </a>
        <a href={directUrl} target="_blank" rel="noreferrer" className="btn-ghost h-9 px-3.5 text-xs">
          <ExternalLinkIcon className="size-4" />
          Open raw
        </a>
        <button type="button" onClick={share} className="btn-ghost h-9 px-3.5 text-xs">
          <ShareIcon className="size-4" />
          {shared ? "Copied" : "Share"}
        </button>
      </div>
    </div>
  );
}
