"use client";

import { useRouter } from "next/navigation";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type DragEvent,
  type FormEvent,
} from "react";
import { formatBytes } from "@/lib/format";
import { CopyField } from "./copy-field";
import {
  CloseIcon,
  DownloadIcon,
  ImageIcon,
  LoaderIcon,
  ShareIcon,
  SparklesIcon,
  UploadIcon,
} from "./icons";

const MAX_BYTES = 4 * 1024 * 1024;

type UploadResult = {
  id: string;
  url: string;
  direct_url: string;
  download_url: string;
  markdown: string;
  html: string;
  filename: string;
  width: number;
  height: number;
  size_bytes: number;
  original_size_bytes: number;
  created_at: string;
};

type Status = "idle" | "uploading" | "done" | "error";

function ResultPanel({
  result,
  onReset,
  onAnother,
}: {
  result: UploadResult;
  onReset: () => void;
  onAnother: () => void;
}) {
  const [shared, setShared] = useState(false);
  const saved = Math.max(0, Math.round((1 - result.size_bytes / Math.max(1, result.original_size_bytes)) * 100));

  const share = async () => {
    try {
      if (navigator.share) {
        await navigator.share({ title: result.filename, url: result.url });
        return;
      }
    } catch {
      // Fall back to copying the link.
    }

    try {
      await navigator.clipboard.writeText(result.url);
      setShared(true);
      setTimeout(() => setShared(false), 1600);
    } catch {
      window.open(result.url, "_blank", "noreferrer");
    }
  };

  return (
    <div className="glass-strong rounded-[1.6rem] p-4 sm:p-6">
      <div className="flex flex-wrap items-center gap-2.5">
        <span className="pulse-dot size-2 rounded-full bg-emerald-400" />
        <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-300">Live</span>
        <span className="rounded-full border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[10px] text-ice-400">
          {saved > 0 ? `${saved}% smaller as JPEG` : "JPEG optimized"}
        </span>
        <button
          type="button"
          onClick={onAnother}
          className="ml-auto inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs text-ice-300 transition-colors hover:bg-white/5 hover:text-white"
        >
          <UploadIcon className="size-3.5" />
          Upload another
        </button>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-[240px_minmax(0,1fr)]">
        <div className="checker relative overflow-hidden rounded-2xl ring-1 ring-white/10">
          <img
            src={result.direct_url}
            alt={result.filename}
            className="h-52 w-full object-contain lg:h-full lg:max-h-80"
          />
          <button
            type="button"
            onClick={onReset}
            aria-label="Start over"
            className="absolute right-2 top-2 grid size-7 place-items-center rounded-full bg-ink-950/70 text-ice-300 ring-1 ring-white/15 backdrop-blur transition-colors hover:text-white"
          >
            <CloseIcon className="size-3.5" />
          </button>
        </div>

        <div className="min-w-0 space-y-4">
          <div>
            <h3 className="truncate font-display text-lg font-semibold text-white">{result.filename}</h3>
            <p className="mt-1 text-xs text-ice-400">
              {result.width} × {result.height} px · {formatBytes(result.size_bytes)}
              <span className="text-ice-500/80"> (from {formatBytes(result.original_size_bytes)})</span>
            </p>
          </div>

          <div className="space-y-3">
            <CopyField label="Share link" value={result.url} hint="human friendly" />
            <CopyField label="Direct image" value={result.direct_url} hint="hotlink ready" />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <CopyField label="Markdown" value={result.markdown} />
            <CopyField label="HTML" value={result.html} />
          </div>

          <div className="flex flex-wrap gap-2 pt-0.5">
            <a href={result.url} target="_blank" rel="noreferrer" className="btn-primary h-9 px-3.5 text-xs">
              Open page
            </a>
            <a href={result.download_url} className="btn-ghost h-9 px-3.5 text-xs">
              <DownloadIcon className="size-4" />
              Download
            </a>
            <button type="button" onClick={share} className="btn-ghost h-9 px-3.5 text-xs">
              <ShareIcon className="size-4" />
              {shared ? "Link copied" : "Share"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function Uploader() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const xhrRef = useRef<XMLHttpRequest | null>(null);

  const [file, setFile] = useState<File | null>(null);
  const preview = useMemo(() => (file ? URL.createObjectURL(file) : null), [file]);
  const [dragging, setDragging] = useState(false);
  const [status, setStatus] = useState<Status>("idle");
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<UploadResult | null>(null);

  useEffect(() => {
    return () => xhrRef.current?.abort();
  }, []);

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const pickFile = useCallback((next: File | null) => {
    if (!next) return;

    if (!next.type.startsWith("image/")) {
      setError("That file is not an image.");
      return;
    }
    if (next.size > MAX_BYTES) {
      setError(`That image is ${formatBytes(next.size)}. The limit is 4 MB.`);
      return;
    }

    setError(null);
    setResult(null);
    setStatus("idle");
    setProgress(0);
    setFile(next);
  }, []);

  useEffect(() => {
    const onPaste = (event: ClipboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable)
      ) {
        return;
      }

      const items = event.clipboardData?.items;
      if (!items) return;

      for (const item of Array.from(items)) {
        if (item.kind === "file" && item.type.startsWith("image/")) {
          const pasted = item.getAsFile();
          if (pasted) {
            event.preventDefault();
            pickFile(pasted);
          }
          break;
        }
      }
    };

    window.addEventListener("paste", onPaste);
    return () => window.removeEventListener("paste", onPaste);
  }, [pickFile]);

  const reset = useCallback(() => {
    xhrRef.current?.abort();
    xhrRef.current = null;
    setFile(null);
    setResult(null);
    setStatus("idle");
    setProgress(0);
    setError(null);
    if (inputRef.current) inputRef.current.value = "";
  }, []);

  const upload = useCallback(() => {
    if (!file || status === "uploading") return;

    setStatus("uploading");
    setProgress(0);
    setError(null);

    const form = new FormData();
    form.append("file", file);

    const xhr = new XMLHttpRequest();
    xhrRef.current = xhr;
    xhr.open("POST", "/api/upload");

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        setProgress(Math.min(99, Math.round((event.loaded / event.total) * 100)));
      }
    };

    xhr.onload = () => {
      xhrRef.current = null;
      let payload: Partial<UploadResult> & { error?: string; hint?: string } = {};
      try {
        payload = JSON.parse(xhr.responseText) as typeof payload;
      } catch {
        payload = {};
      }

      if (xhr.status >= 200 && xhr.status < 300) {
        setResult(payload as UploadResult);
        setStatus("done");
        setProgress(100);
        router.refresh();
        return;
      }

      setStatus("error");

      if (xhr.status === 401) {
        setError("Your session expired. Please sign in again.");
        router.push("/sign-in?next=%2F%23upload");
        return;
      }

      setError(
        payload.error
          ? `${payload.error}${payload.hint ? ` ${payload.hint}` : ""}`
          : "Upload failed. Please try again.",
      );
    };

    xhr.onerror = () => {
      xhrRef.current = null;
      setStatus("error");
      setError("Network error. Please try again.");
    };

    xhr.send(form);
  }, [file, router, status]);

  const onDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragging(false);
    pickFile(event.dataTransfer.files?.[0] ?? null);
  };

  const onFileInput = (event: FormEvent<HTMLInputElement>) => {
    const target = event.currentTarget;
    pickFile(target.files?.[0] ?? null);
    target.value = "";
  };

  if (result) {
    return <ResultPanel result={result} onReset={reset} onAnother={reset} />;
  }

  return (
    <div className={`glass rounded-[1.6rem] p-1.5 transition-shadow ${dragging ? "shadow-[0_0_0_2px_rgba(56,189,248,0.45)]" : ""}`}>
      <div
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={`relative overflow-hidden rounded-[1.3rem] border px-5 py-12 transition-colors sm:px-8 sm:py-14 ${
          dragging ? "border-sky-400/50 bg-sky-500/[0.07]" : "border-white/[0.06] bg-ink-950/40"
        }`}
      >
        <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-[radial-gradient(320px_120px_at_50%_0%,rgba(56,132,255,0.18),transparent_70%)]" />

        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/avif,image/gif,image/tiff"
          onChange={onFileInput}
          className="hidden"
        />

        <div className="relative flex flex-col items-center text-center">
          {preview ? (
            <div className="relative mb-5">
              <img
                src={preview}
                alt="Selected image preview"
                className="size-24 rounded-2xl object-cover ring-1 ring-white/15"
              />
              <button
                type="button"
                onClick={reset}
                aria-label="Remove selected image"
                className="absolute -right-2 -top-2 grid size-6 place-items-center rounded-full bg-ink-900 text-ice-300 ring-1 ring-white/15 transition-colors hover:text-white"
              >
                <CloseIcon className="size-3.5" />
              </button>
            </div>
          ) : (
            <div className="mb-5 grid size-16 place-items-center rounded-2xl border border-sky-300/20 bg-gradient-to-br from-sky-500/20 to-blue-700/10 text-sky-300 shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]">
              <UploadIcon className="size-7" />
            </div>
          )}

          <h2 className="font-display text-xl font-semibold text-white sm:text-2xl">
            {file ? "Ready when you are" : dragging ? "Drop it in" : "Drop your image here"}
          </h2>
          <p className="mt-1.5 max-w-md text-sm text-ice-400">
            {file
              ? `${file.name} · ${formatBytes(file.size)}`
              : "or paste a screenshot from your clipboard · JPEG, PNG, WebP, AVIF, GIF"}
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            {file ? (
              <>
                <button
                  type="button"
                  onClick={upload}
                  disabled={status === "uploading"}
                  className="btn-primary h-11 px-5 text-sm disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {status === "uploading" ? <LoaderIcon className="size-4" /> : <SparklesIcon className="size-4" />}
                  {status === "uploading" ? "Optimizing…" : "Upload image"}
                </button>
                <button
                  type="button"
                  onClick={reset}
                  disabled={status === "uploading"}
                  className="btn-ghost h-11 px-4 text-sm disabled:opacity-60"
                >
                  Cancel
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="btn-primary h-11 px-5 text-sm"
              >
                <ImageIcon className="size-4" />
                Choose image
              </button>
            )}
          </div>

          {status === "uploading" ? (
            <div className="mt-6 w-full max-w-xs">
              <div className="mb-1.5 flex items-center justify-between text-[11px] text-ice-400">
                <span>{progress >= 100 ? "Compressing to JPEG…" : "Uploading…"}</span>
                <span>{progress}%</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-sky-400 to-blue-600 transition-[width] duration-300"
                  style={{ width: `${Math.max(8, progress)}%` }}
                />
              </div>
            </div>
          ) : null}

          {error ? (
            <div
              role="alert"
              className="mt-5 max-w-md rounded-xl border border-red-400/25 bg-red-500/10 px-3.5 py-2.5 text-xs leading-relaxed text-red-200"
            >
              {error}
            </div>
          ) : null}

          <p className="mt-6 text-[11px] text-ice-500">
            Up to 4 MB · re-encoded to JPEG · EXIF stripped · max 2560 px
          </p>
        </div>
      </div>
    </div>
  );
}
