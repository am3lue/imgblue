import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { revokeApiKey } from "@/lib/api-keys";
import { getCurrentUser } from "@/lib/auth";
import { isDatabaseConfigured } from "@/lib/db";
import { isSameOrigin } from "@/lib/request-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function reply(data: unknown, status = 200): NextResponse {
  return NextResponse.json(data, { status, headers: { "Cache-Control": "no-store" } });
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    if (!isSameOrigin(request)) return reply({ error: "Cross-origin request blocked." }, 403);
    if (!isDatabaseConfigured()) return reply({ error: "Storage is not configured." }, 503);

    const user = await getCurrentUser();
    if (!user) return reply({ error: "Sign in to continue." }, 401);

    const { id } = await context.params;
    const revoked = await revokeApiKey(user.id, id);
    if (!revoked) return reply({ error: "API key not found." }, 404);

    return reply({ ok: true });
  } catch (error) {
    console.error("[imgblue] revoke key failed:", error);
    return reply({ error: "Could not revoke the API key." }, 500);
  }
}
