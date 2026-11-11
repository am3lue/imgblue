import type { NextRequest } from "next/server";
import { ApiError, errorResponse, imageLinks, jsonResponse, preflight } from "@/lib/api";
import { isDatabaseConfigured } from "@/lib/db";
import { listRecentImages } from "@/lib/images";
import { baseUrlFromHeaders } from "@/lib/url";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    if (!isDatabaseConfigured()) {
      throw new ApiError(503, "Storage is not configured.");
    }

    const requested = Number(request.nextUrl.searchParams.get("limit") ?? "12");
    const limit = Number.isFinite(requested) ? requested : 12;
    const base = baseUrlFromHeaders(request.headers);
    const images = await listRecentImages(limit);

    return jsonResponse({
      count: images.length,
      images: images.map((image) => {
        const displayName = `${(image.original_name ?? image.id).replace(/\.[^.]+$/, "") || image.id}.jpg`;
        return {
          ...image,
          ...imageLinks(base, image.id, displayName),
          filename: displayName,
        };
      }),
    });
  } catch (error) {
    if (error instanceof ApiError) return errorResponse(error);
    console.error("[imgblue] recent images failed:", error);
    return errorResponse(new ApiError(500, "Could not load recent images."));
  }
}

export function OPTIONS() {
  return preflight();
}
