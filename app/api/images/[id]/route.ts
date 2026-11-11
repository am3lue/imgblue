import type { NextRequest } from "next/server";
import { ApiError, CORS_HEADERS, errorResponse, preflight } from "@/lib/api";
import { isDatabaseConfigured } from "@/lib/db";
import {
  cleanImageId,
  deleteImageForUser,
  getImageOwnerId,
} from "@/lib/images";
import { authenticateRequest, isSameOrigin } from "@/lib/request-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    if (!isDatabaseConfigured()) {
      throw new ApiError(503, "Storage is not configured.");
    }

    const auth = await authenticateRequest(request);
    if (!auth) {
      throw new ApiError(401, "Authentication required.", "Sign in or send an API key.");
    }

    if (auth.via === "session" && !isSameOrigin(request)) {
      throw new ApiError(403, "Cross-origin request blocked.");
    }

    const { id: rawId } = await context.params;
    const id = cleanImageId(rawId);
    if (!id) throw new ApiError(404, "Image not found.");

    const owner = await getImageOwnerId(id);
    if (!owner) throw new ApiError(404, "Image not found.");
    if (owner !== auth.userId) {
      throw new ApiError(403, "You can only delete your own images.");
    }

    const deleted = await deleteImageForUser(id, auth.userId);
    if (!deleted) throw new ApiError(404, "Image not found.");

    return new Response(null, { status: 204, headers: CORS_HEADERS });
  } catch (error) {
    if (error instanceof ApiError) return errorResponse(error);
    console.error("[imgblue] delete failed:", error);
    return errorResponse(new ApiError(500, "Could not delete the image."));
  }
}

export function OPTIONS() {
  return preflight();
}
