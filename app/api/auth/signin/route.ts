import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createSession, normalizeEmail, passwordProblem, verifyCredentials } from "@/lib/auth";
import { isDatabaseConfigured } from "@/lib/db";
import { rateLimit, retryMessage } from "@/lib/rate-limit";
import { clientIp, isSameOrigin } from "@/lib/request-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function reply(data: unknown, status = 200): NextResponse {
  return NextResponse.json(data, { status, headers: { "Cache-Control": "no-store" } });
}

export async function POST(request: NextRequest) {
  try {
    if (!isSameOrigin(request)) {
      return reply({ error: "Cross-origin request blocked." }, 403);
    }

    if (!isDatabaseConfigured()) {
      return reply(
        {
          error: "Accounts are not configured.",
          hint: "Set TURSO_DATABASE_URL and TURSO_AUTH_TOKEN in your environment.",
        },
        503,
      );
    }

    const limited = rateLimit(`signin:${clientIp(request)}`, 20, 15 * 60 * 1000);
    if (!limited.ok) {
      return reply({ error: "Too many sign-in attempts.", hint: retryMessage(limited.retryAfter) }, 429);
    }

    let body: Record<string, unknown>;
    try {
      const parsed: unknown = await request.json();
      if (!parsed || typeof parsed !== "object") throw new Error("bad body");
      body = parsed as Record<string, unknown>;
    } catch {
      return reply({ error: "Invalid request body." }, 400);
    }

    const email = normalizeEmail(body.email);
    if (!email) return reply({ error: "Enter a valid email address." }, 400);

    const problem = passwordProblem(body.password);
    if (problem) return reply({ error: problem }, 400);

    const user = await verifyCredentials(email, body.password as string);
    if (!user) {
      return reply({ error: "Incorrect email or password." }, 401);
    }

    await createSession(user.id);
    return reply({ user });
  } catch (error) {
    console.error("[imgblue] signin failed:", error);
    return reply({ error: "Could not sign in. Please try again." }, 500);
  }
}
