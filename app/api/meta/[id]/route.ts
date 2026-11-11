import type { NextRequest } from "next/server";
import { ApiError, errorResponse, imageLinks, jsonResponse, preflight } from "@/lib/api";
import { isDatabaseConfigured } from "@/lib/db";
import { cleanImageId, getImageMeta } from "@/lib/images";
import { baseUrlFromHeaders } from "@/lib/url";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    if (!isDatabaseConfigured()) {
      throw new ApiError(503, "Storage is not configured.");
    }

    const { id: rawId } = await context.params;
    const id = cleanImageId(rawId);
    const image = id ? await getImageMeta(id) : null;

    if (!image) {
      throw new ApiError(404, "Image not found.");
    }

    const displayName = `${(image.original_name ?? image.id).replace(/\.[^.]+$/, "") || image.id}.jpg`;
    const links = imageLinks(baseUrlFromHeaders(request.headers), image.id, displayName);

    return jsonResponse({
      ...image,
      ...links,
      filename: displayName,
    });
  } catch (error) {
    if (error instanceof ApiError) return errorResponse(error);
    console.error("[imgblue] metadata read failed:", error);
    return errorResponse(new ApiError(500, "Could not load image metadata."));
  }
}

export function OPTIONS() {
  return preflight();
}
