import "server-only";
import type { NextRequest } from "next/server";
import { resolveApiKey } from "./api-keys";
import { getCurrentUser } from "./auth";
import { isDatabaseConfigured } from "./db";

export type RequestAuth = {
  userId: string;
  via: "session" | "api-key";
};

export function providedApiKey(request: NextRequest): string | null {
  const header = request.headers.get("authorization") ?? "";
  const bearer = header.toLowerCase().startsWith("bearer ") ? header.slice(7).trim() : "";
  const provided = (request.headers.get("x-api-key") ?? "").trim() || bearer;
  return provided.length > 0 ? provided : null;
}

export async function authenticateRequest(request: NextRequest): Promise<RequestAuth | null> {
  const key = providedApiKey(request);

  if (key) {
    if (!isDatabaseConfigured()) return null;
    const resolved = await resolveApiKey(key);
    return resolved ? { userId: resolved.userId, via: "api-key" } : null;
  }

  const user = await getCurrentUser();
  return user ? { userId: user.id, via: "session" } : null;
}

export function isSameOrigin(request: NextRequest): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return true;

  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  if (!host) return false;

  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

export function clientIp(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  return request.headers.get("x-real-ip")?.trim() || "unknown";
}
