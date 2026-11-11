import type { NextRequest } from "next/server";
import { asciiFilename, CORS_HEADERS, jpegFilename } from "@/lib/api";
import { isDatabaseConfigured } from "@/lib/db";
import { cleanImageId, getImageWithData } from "@/lib/images";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id: rawId } = await context.params;
  const id = cleanImageId(rawId);

  if (!id) {
    return new Response("Not found", { status: 404, headers: CORS_HEADERS });
  }

  if (!isDatabaseConfigured()) {
    return new Response("Storage is not configured", { status: 503, headers: CORS_HEADERS });
  }

  let image;
  try {
    image = await getImageWithData(id);
  } catch (error) {
    console.error("[imgblue] image read failed:", error);
    return new Response("Storage unavailable", { status: 503, headers: CORS_HEADERS });
  }

  if (!image) {
    return new Response("Image not found", { status: 404, headers: CORS_HEADERS });
  }

  const bytes = Buffer.from(image.base64, "base64");
  if (bytes.byteLength === 0) {
    return new Response("Image not found", { status: 404, headers: CORS_HEADERS });
  }

  const etag = `"${image.id}"`;
  if (request.headers.get("if-none-match") === etag) {
    return new Response(null, { status: 304, headers: { ...CORS_HEADERS, ETag: etag } });
  }

  const displayName = jpegFilename(image.original_name, image.id);
  const ascii = asciiFilename(displayName, `${image.id}.jpg`);
  const download = ["1", "true", "yes"].includes(
    (request.nextUrl.searchParams.get("download") ?? "").toLowerCase(),
  );

  return new Response(new Uint8Array(bytes), {
    headers: {
      ...CORS_HEADERS,
      "Content-Type": image.mime_type || "image/jpeg",
      "Content-Length": String(bytes.byteLength),
      "Cache-Control": "public, max-age=31536000, s-maxage=31536000, immutable",
      "Content-Disposition": `${download ? "attachment" : "inline"}; filename="${ascii}"; filename*=UTF-8''${encodeURIComponent(displayName)}`,
      ETag: etag,
    },
  });
}
