import { NextResponse } from "next/server";
import { baseUrlFromHeaders } from "./url";

export const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-API-Key",
  "Access-Control-Max-Age": "86400",
} as const;

export class ApiError extends Error {
  status: number;
  hint?: string;

  constructor(status: number, message: string, hint?: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.hint = hint;
  }
}

export function jsonResponse(data: unknown, init?: ResponseInit): NextResponse {
  return NextResponse.json(data, {
    ...init,
    headers: {
      ...CORS_HEADERS,
      "Cache-Control": "no-store",
      ...(init?.headers ?? {}),
    },
  });
}

export function errorResponse(error: ApiError): NextResponse {
  return jsonResponse(
    { error: error.message, ...(error.hint ? { hint: error.hint } : {}) },
    { status: error.status },
  );
}

export function preflight(): Response {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}

export function sanitizeName(input: string | null | undefined): string | null {
  if (!input) return null;
  const base = input.split(/[\\/]/).pop() ?? "";
  const cleaned = base
    .replace(/[\u0000-\u001f\u007f"<>\\/:*?|]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 120);
  return cleaned.length > 0 ? cleaned : null;
}

export function jpegFilename(originalName: string | null, id: string): string {
  const stem = (originalName ?? id).replace(/\.[^.]+$/, "").trim() || id;
  return `${stem}.jpg`;
}

export function asciiFilename(name: string, fallback: string): string {
  const ascii = name.replace(/[^\x20-\x7e]/g, "").replace(/["\\]/g, "").trim();
  return ascii || fallback;
}

export type ImageLinks = {
  url: string;
  direct_url: string;
  download_url: string;
  markdown: string;
  html: string;
};

export function imageLinks(base: string, id: string, displayName: string): ImageLinks {
  const url = `${base}/i/${id}`;
  const direct = `${base}/api/i/${id}`;
  const safeAlt = displayName.replace(/[[\]<>"]/g, "").trim() || "image";
  const safeAttr = displayName.replace(/[&<>"']/g, (char) => {
    const map: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };
    return map[char] ?? char;
  });

  return {
    url,
    direct_url: direct,
    download_url: `${direct}?download=1`,
    markdown: `![${safeAlt}](${direct})`,
    html: `<img src="${direct}" alt="${safeAttr}" />`,
  };
}

export function linksFromRequest(headers: Headers, id: string, displayName: string): ImageLinks {
  return imageLinks(baseUrlFromHeaders(headers), id, displayName);
}
