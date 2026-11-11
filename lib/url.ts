import { headers } from "next/headers";

function normalize(url: string): string {
  return url.trim().replace(/\/+$/, "");
}

export function baseUrlFromHeaders(input: Headers): string {
  const configured = process.env.NEXT_PUBLIC_BASE_URL;
  if (configured) return normalize(configured);

  const host = input.get("x-forwarded-host") ?? input.get("host") ?? "localhost:3000";
  const isLocal = host.startsWith("localhost") || host.startsWith("127.0.0.1") || host.startsWith("[::1]");
  const proto = input.get("x-forwarded-proto") ?? (isLocal ? "http" : "https");

  return normalize(`${proto}://${host}`);
}

export async function baseUrl(): Promise<string> {
  return baseUrlFromHeaders(await headers());
}
