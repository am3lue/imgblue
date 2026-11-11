import { ensureSchema, getDb } from "./db";

export type ImageMeta = {
  id: string;
  original_name: string | null;
  mime_type: string;
  width: number;
  height: number;
  size_bytes: number;
  created_at: string;
  views: number;
};

export type ImageWithData = ImageMeta & {
  base64: string;
};

export type UserStats = {
  images: number;
  storageBytes: number;
  views: number;
};

type Row = Record<string, unknown>;

function toMeta(row: Row): ImageMeta {
  return {
    id: String(row.id),
    original_name: row.original_name == null ? null : String(row.original_name),
    mime_type: String(row.mime_type ?? "image/jpeg"),
    width: Number(row.width ?? 0),
    height: Number(row.height ?? 0),
    size_bytes: Number(row.size_bytes ?? 0),
    created_at: String(row.created_at ?? ""),
    views: Number(row.views ?? 0),
  };
}

const META_COLUMNS = "id, original_name, mime_type, width, height, size_bytes, created_at, views";

export function cleanImageId(raw: string): string {
  let id = raw;
  try {
    id = decodeURIComponent(raw);
  } catch {
    id = raw;
  }
  return id.replace(/\.(jpe?g|png|webp|gif)$/i, "").trim();
}

export async function getImageMeta(id: string): Promise<ImageMeta | null> {
  await ensureSchema();
  const result = await getDb().execute({
    sql: `SELECT ${META_COLUMNS} FROM images WHERE id = ? LIMIT 1`,
    args: [id],
  });
  const row = result.rows[0] as Row | undefined;
  return row ? toMeta(row) : null;
}

export async function getImageWithData(id: string): Promise<ImageWithData | null> {
  await ensureSchema();
  const result = await getDb().execute({
    sql: `SELECT ${META_COLUMNS}, base64 FROM images WHERE id = ? LIMIT 1`,
    args: [id],
  });
  const row = result.rows[0] as Row | undefined;
  if (!row) return null;
  return { ...toMeta(row), base64: String(row.base64 ?? "") };
}

export type SitemapImage = {
  id: string;
  created_at: string;
};

export async function listImagesForSitemap(limit = 500): Promise<SitemapImage[]> {
  await ensureSchema();
  const safeLimit = Math.min(Math.max(Math.trunc(limit), 1), 5000);
  const result = await getDb().execute({
    sql: "SELECT id, created_at FROM images ORDER BY created_at DESC LIMIT ?",
    args: [safeLimit],
  });
  return result.rows.map((row) => ({
    id: String(row.id),
    created_at: String(row.created_at ?? ""),
  }));
}

export async function listRecentImages(limit = 12): Promise<ImageMeta[]> {
  await ensureSchema();
  const safeLimit = Math.min(Math.max(Math.trunc(limit), 1), 48);
  const result = await getDb().execute({
    sql: `SELECT ${META_COLUMNS} FROM images ORDER BY created_at DESC LIMIT ?`,
    args: [safeLimit],
  });
  return result.rows.map((row) => toMeta(row as Row));
}

export async function listUserImages(userId: string, limit = 48): Promise<ImageMeta[]> {
  await ensureSchema();
  const safeLimit = Math.min(Math.max(Math.trunc(limit), 1), 96);
  const result = await getDb().execute({
    sql: `SELECT ${META_COLUMNS} FROM images WHERE user_id = ? ORDER BY created_at DESC LIMIT ?`,
    args: [userId, safeLimit],
  });
  return result.rows.map((row) => toMeta(row as Row));
}

export async function getUserStats(userId: string): Promise<UserStats> {
  await ensureSchema();
  const result = await getDb().execute({
    sql: `SELECT COUNT(*) AS count, COALESCE(SUM(size_bytes), 0) AS bytes, COALESCE(SUM(views), 0) AS views
          FROM images WHERE user_id = ?`,
    args: [userId],
  });
  const row = (result.rows[0] ?? {}) as Row;
  return {
    images: Number(row.count ?? 0),
    storageBytes: Number(row.bytes ?? 0),
    views: Number(row.views ?? 0),
  };
}

export async function getImageOwnerId(id: string): Promise<string | null> {
  await ensureSchema();
  const result = await getDb().execute({
    sql: "SELECT user_id FROM images WHERE id = ? LIMIT 1",
    args: [id],
  });
  const row = result.rows[0] as Row | undefined;
  if (!row || row.user_id == null) return null;
  return String(row.user_id);
}

export async function deleteImageForUser(id: string, userId: string): Promise<boolean> {
  await ensureSchema();
  const result = await getDb().execute({
    sql: "DELETE FROM images WHERE id = ? AND user_id = ?",
    args: [id, userId],
  });
  return result.rowsAffected > 0;
}

export async function incrementViews(id: string): Promise<void> {
  try {
    await getDb().execute({
      sql: "UPDATE images SET views = views + 1 WHERE id = ?",
      args: [id],
    });
  } catch {
    // View counting must never break the page.
  }
}

export type NewImage = {
  id: string;
  userId: string | null;
  originalName: string | null;
  mimeType: string;
  width: number;
  height: number;
  sizeBytes: number;
  base64: string;
  createdAt: string;
};

export async function insertImage(image: NewImage): Promise<void> {
  await ensureSchema();
  await getDb().execute({
    sql: `INSERT INTO images (id, user_id, original_name, mime_type, width, height, size_bytes, base64, created_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [
      image.id,
      image.userId,
      image.originalName,
      image.mimeType,
      image.width,
      image.height,
      image.sizeBytes,
      image.base64,
      image.createdAt,
    ],
  });
}
