import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { AuthError, createSession, createUser, normalizeEmail, passwordProblem } from "@/lib/auth";
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

    const limited = rateLimit(`signup:${clientIp(request)}`, 6, 60 * 60 * 1000);
    if (!limited.ok) {
      return reply({ error: "Too many sign-up attempts.", hint: retryMessage(limited.retryAfter) }, 429);
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

    const rawName = typeof body.name === "string" ? body.name.trim().replace(/\s+/g, " ").slice(0, 80) : "";
    const name = rawName.length > 0 ? rawName : null;

    const user = await createUser({ email, name, password: body.password as string });
    await createSession(user.id);

    return reply({ user }, 201);
  } catch (error) {
    if (error instanceof AuthError) return reply({ error: error.message }, error.status);
    console.error("[imgblue] signup failed:", error);
    return reply({ error: "Could not create the account. Please try again." }, 500);
  }
}
