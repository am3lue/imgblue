"use client";

import { useEffect, useState } from "react";
import { CheckIcon, CopyIcon } from "./icons";

type CopyButtonProps = {
  value: string | (() => string);
  label?: string;
  compact?: boolean;
  className?: string;
};

async function writeClipboard(value: string): Promise<void> {
  try {
    await navigator.clipboard.writeText(value);
    return;
  } catch {
    // Fall through to the legacy path.
  }

  const textarea = document.createElement("textarea");
  textarea.value = value;
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.select();
  try {
    document.execCommand("copy");
  } finally {
    document.body.removeChild(textarea);
  }
}

export function CopyButton({ value, label = "Copy", compact = true, className = "" }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timeout = setTimeout(() => setCopied(false), 1600);
    return () => clearTimeout(timeout);
  }, [copied]);

  const handleCopy = async () => {
    await writeClipboard(typeof value === "function" ? value() : value);
    setCopied(true);
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      title={copied ? "Copied" : label}
      aria-label={copied ? "Copied to clipboard" : label}
      className={
        compact
          ? `grid size-8 shrink-0 place-items-center rounded-lg transition-colors ${
              copied ? "text-emerald-300" : "text-ice-400 hover:bg-white/10 hover:text-white"
            } ${className}`
          : `btn-ghost h-8 shrink-0 px-2.5 text-xs ${
              copied ? "text-emerald-300" : "text-ice-200"
            } ${className}`
      }
    >
      {copied ? <CheckIcon className="size-4" /> : <CopyIcon className="size-4" />}
      {compact ? null : <span>{copied ? "Copied" : label}</span>}
    </button>
  );
}
