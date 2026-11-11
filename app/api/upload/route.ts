import type { NextRequest } from "next/server";
import sharp from "sharp";
import {
  ApiError,
  errorResponse,
  jpegFilename,
  jsonResponse,
  linksFromRequest,
  preflight,
  sanitizeName,
} from "@/lib/api";
import { isDatabaseConfigured } from "@/lib/db";
import { insertImage } from "@/lib/images";
import { newImageId } from "@/lib/id";
import { rateLimit, retryMessage } from "@/lib/rate-limit";
import { authenticateRequest, clientIp, isSameOrigin } from "@/lib/request-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const MAX_UPLOAD_BYTES = 4 * 1024 * 1024;
const MAX_DECLARED_BYTES = 5 * 1024 * 1024;
const MAX_STORED_BYTES = 700 * 1024;
const ALLOWED_FORMATS = new Set(["jpeg", "png", "webp", "avif", "gif", "tiff", "heif"]);

const COMPRESSION_LADDER = [
  { dimension: 2560, quality: 84 },
  { dimension: 2200, quality: 80 },
  { dimension: 1800, quality: 76 },
  { dimension: 1600, quality: 70 },
  { dimension: 1280, quality: 64 },
];

type Incoming = {
  buffer: Buffer;
  name: string | null;
};

function declaredName(request: NextRequest): string | null {
  return sanitizeName(request.nextUrl.searchParams.get("name"));
}

async function readMultipart(request: NextRequest): Promise<Incoming> {
  const form = await request.formData();
  const file = form.get("file");

  if (file === null || typeof file === "string") {
    throw new ApiError(400, "No image file found.", 'Send the image as multipart form-data under the field "file".');
  }

  if (file.size > MAX_UPLOAD_BYTES) {
    throw new ApiError(413, "Image is too large.", "The maximum upload size is 4 MB.");
  }

  const formName = form.get("name");
  const name = sanitizeName(typeof formName === "string" ? formName : null) ?? sanitizeName(file.name) ?? declaredName(request);

  return { buffer: Buffer.from(await file.arrayBuffer()), name };
}

async function readJson(request: NextRequest): Promise<Incoming> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    throw new ApiError(400, "Invalid JSON body.", 'Send JSON like { "image": "data:image/png;base64,..." }.');
  }

  if (!body || typeof body !== "object") {
    throw new ApiError(400, "Invalid request body.");
  }

  const record = body as Record<string, unknown>;
  const source = record.image ?? record.base64 ?? record.dataUri ?? record.data;
  if (typeof source !== "string" || source.trim().length === 0) {
    throw new ApiError(400, "No image data found.", 'Provide a base64 string in the "image" field.');
  }

  let payload = source.trim();
  let name = sanitizeName(typeof record.name === "string" ? record.name : null) ?? declaredName(request);

  const dataUri = /^data:([^;,]+)?;base64,(.*)$/s.exec(payload);
  if (dataUri) {
    payload = dataUri[2];
    if (!name && dataUri[1]?.startsWith("image/")) {
      name = `pasted.${dataUri[1].split("/")[1]?.replace(/[^a-z0-9]/gi, "") || "jpg"}`;
    }
  }

  payload = payload.replace(/\s+/g, "");
  if (payload.length > Math.ceil((MAX_UPLOAD_BYTES * 4) / 3) + 16) {
    throw new ApiError(413, "Image is too large.", "The maximum upload size is 4 MB.");
  }

  const buffer = Buffer.from(payload, "base64");
  if (buffer.byteLength === 0) {
    throw new ApiError(400, "The base64 image could not be decoded.");
  }
  if (buffer.byteLength > MAX_UPLOAD_BYTES) {
    throw new ApiError(413, "Image is too large.", "The maximum upload size is 4 MB.");
  }

  return { buffer, name };
}

async function readRaw(request: NextRequest): Promise<Incoming> {
  const buffer = Buffer.from(await request.arrayBuffer());
  if (buffer.byteLength === 0) {
    throw new ApiError(400, "Empty request body.");
  }
  if (buffer.byteLength > MAX_UPLOAD_BYTES) {
    throw new ApiError(413, "Image is too large.", "The maximum upload size is 4 MB.");
  }
  return { buffer, name: declaredName(request) };
}

async function readIncoming(request: NextRequest): Promise<Incoming> {
  const declaredLength = Number(request.headers.get("content-length") ?? 0);
  if (Number.isFinite(declaredLength) && declaredLength > MAX_DECLARED_BYTES) {
    throw new ApiError(413, "Request is too large.", "The maximum upload size is 4 MB.");
  }

  const contentType = (request.headers.get("content-type") ?? "").toLowerCase();

  if (contentType.startsWith("multipart/form-data")) return readMultipart(request);
  if (contentType.startsWith("application/json")) return readJson(request);
  if (contentType.startsWith("image/") || contentType.startsWith("application/octet-stream")) {
    return readRaw(request);
  }

  throw new ApiError(
    415,
    "Unsupported content type.",
    "Use multipart/form-data, application/json, or send the raw image bytes.",
  );
}

async function compress(buffer: Buffer): Promise<{ data: Buffer; width: number; height: number }> {
  let format: string | undefined;
  try {
    const metadata = await sharp(buffer, { failOn: "error", limitInputPixels: 50_000_000 }).metadata();
    format = metadata.format;
  } catch {
    throw new ApiError(415, "That file is not a readable image.");
  }

  if (!format || !ALLOWED_FORMATS.has(format)) {
    throw new ApiError(
      415,
      `Unsupported image format${format ? `: ${format}` : ""}.`,
      "Upload a JPEG, PNG, WebP, AVIF, GIF, or TIFF file.",
    );
  }

  let last: { data: Buffer; width: number; height: number } | null = null;

  for (const step of COMPRESSION_LADDER) {
    let result;
    try {
      result = await sharp(buffer, { failOn: "error", limitInputPixels: 50_000_000 })
        .rotate()
        .resize({
          width: step.dimension,
          height: step.dimension,
          fit: "inside",
          withoutEnlargement: true,
        })
        .jpeg({ quality: step.quality, mozjpeg: true, progressive: true, chromaSubsampling: "4:2:0" })
        .toBuffer({ resolveWithObject: true });
    } catch {
      throw new ApiError(415, "That image could not be processed.");
    }

    last = { data: result.data, width: result.info.width, height: result.info.height };
    if (result.data.byteLength <= MAX_STORED_BYTES) break;
  }

  if (!last) {
    throw new ApiError(422, "That image could not be processed.");
  }

  if (last.data.byteLength > MAX_STORED_BYTES) {
    throw new ApiError(
      413,
      "This image is too detailed to store.",
      "Try a smaller image or one with fewer pixels.",
    );
  }

  return last;
}

function isUniqueViolation(error: unknown): boolean {
  return error instanceof Error && /UNIQUE constraint failed/i.test(error.message);
}

export async function POST(request: NextRequest) {
  try {
    if (!isDatabaseConfigured()) {
      throw new ApiError(
        503,
        "Storage is not configured.",
        "Set TURSO_DATABASE_URL and TURSO_AUTH_TOKEN in your environment.",
      );
    }

    const allowPublic = process.env.ALLOW_PUBLIC_UPLOADS === "true";
    const auth = await authenticateRequest(request);

    if (!auth && !allowPublic) {
      throw new ApiError(
        401,
        "Authentication required.",
        "Sign in on the site or send a key as Authorization: Bearer <key>.",
      );
    }

    if (auth?.via === "session" && !isSameOrigin(request)) {
      throw new ApiError(403, "Cross-origin request blocked.");
    }

    const userId = auth?.userId ?? null;
    const limitKey = userId ? `upload:user:${userId}` : `upload:ip:${clientIp(request)}`;
    const limited = rateLimit(limitKey, userId ? 120 : 10, 60 * 60 * 1000);
    if (!limited.ok) {
      throw new ApiError(429, "Too many uploads.", retryMessage(limited.retryAfter));
    }

    const incoming = await readIncoming(request);
    const processed = await compress(incoming.buffer);
    const base64 = processed.data.toString("base64");
    const originalName = incoming.name;
    const storedName = jpegFilename(originalName, "image");
    const createdAt = new Date().toISOString();

    let id = "";

    for (let attempt = 0; attempt < 5; attempt += 1) {
      const candidate = newImageId();
      try {
        await insertImage({
          id: candidate,
          userId,
          originalName,
          mimeType: "image/jpeg",
          width: processed.width,
          height: processed.height,
          sizeBytes: processed.data.byteLength,
          base64,
          createdAt,
        });
        id = candidate;
        break;
      } catch (error) {
        if (isUniqueViolation(error) && attempt < 4) continue;
        throw error;
      }
    }

    if (!id) {
      throw new ApiError(500, "Could not allocate an image id.", "Please try again.");
    }

    const links = linksFromRequest(request.headers, id, storedName);

    return jsonResponse(
      {
        id,
        ...links,
        filename: storedName,
        width: processed.width,
        height: processed.height,
        size_bytes: processed.data.byteLength,
        original_size_bytes: incoming.buffer.byteLength,
        created_at: createdAt,
      },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof ApiError) return errorResponse(error);
    console.error("[imgblue] upload failed:", error);
    return errorResponse(
      new ApiError(500, "Upload failed.", "Something went wrong while storing the image. Please try again."),
    );
  }
}

export function OPTIONS() {
  return preflight();
}
