import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { ApiKeyError, createApiKey, listApiKeys } from "@/lib/api-keys";
import { getCurrentUser } from "@/lib/auth";
import { isDatabaseConfigured } from "@/lib/db";
import { rateLimit, retryMessage } from "@/lib/rate-limit";
import { isSameOrigin } from "@/lib/request-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function reply(data: unknown, status = 200): NextResponse {
  return NextResponse.json(data, { status, headers: { "Cache-Control": "no-store" } });
}

export async function GET() {
  try {
    if (!isDatabaseConfigured()) return reply({ error: "Storage is not configured." }, 503);

    const user = await getCurrentUser();
    if (!user) return reply({ error: "Sign in to continue." }, 401);

    return reply({ keys: await listApiKeys(user.id) });
  } catch (error) {
    console.error("[imgblue] list keys failed:", error);
    return reply({ error: "Could not load API keys." }, 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!isSameOrigin(request)) return reply({ error: "Cross-origin request blocked." }, 403);
    if (!isDatabaseConfigured()) return reply({ error: "Storage is not configured." }, 503);

    const user = await getCurrentUser();
    if (!user) return reply({ error: "Sign in to continue." }, 401);

    const limited = rateLimit(`keys:create:${user.id}`, 20, 60 * 60 * 1000);
    if (!limited.ok) {
      return reply({ error: "Too many keys created.", hint: retryMessage(limited.retryAfter) }, 429);
    }

    let body: Record<string, unknown> = {};
    try {
      const parsed: unknown = await request.json();
      if (parsed && typeof parsed === "object") body = parsed as Record<string, unknown>;
    } catch {
      // An empty body is fine; we fall back to a default key name.
    }

    const name = typeof body.name === "string" ? body.name : "";
    const created = await createApiKey(user.id, name);

    return reply({ key: created.key, apiKey: created.record }, 201);
  } catch (error) {
    if (error instanceof ApiKeyError) return reply({ error: error.message }, error.status);
    console.error("[imgblue] create key failed:", error);
    return reply({ error: "Could not create the API key." }, 500);
  }
}
