import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { destroySession } from "@/lib/auth";
import { isSameOrigin } from "@/lib/request-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  if (!isSameOrigin(request)) {
    return NextResponse.json(
      { error: "Cross-origin request blocked." },
      { status: 403, headers: { "Cache-Control": "no-store" } },
    );
  }

  await destroySession();
  return NextResponse.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
}
