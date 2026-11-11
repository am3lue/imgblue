import "server-only";
import { createHash, randomBytes } from "node:crypto";
import { ensureSchema, getDb } from "./db";
import { newImageId } from "./id";

const KEY_PREFIX = "ib_live_";
const MAX_ACTIVE_KEYS = 10;
const LAST_USED_THROTTLE_MS = 60 * 60 * 1000;

export type ApiKeySummary = {
  id: string;
  name: string;
  hint: string;
  created_at: string;
  last_used_at: string | null;
};

type Row = Record<string, unknown>;

export class ApiKeyError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiKeyError";
    this.status = status;
  }
}

export function hashApiKey(key: string): string {
  return createHash("sha256").update(key).digest("hex");
}

function toSummary(row: Row): ApiKeySummary {
  return {
    id: String(row.id),
    name: String(row.name ?? ""),
    hint: String(row.hint ?? ""),
    created_at: String(row.created_at ?? ""),
    last_used_at: row.last_used_at == null ? null : String(row.last_used_at),
  };
}

export async function countActiveApiKeys(userId: string): Promise<number> {
  await ensureSchema();
  const result = await getDb().execute({
    sql: "SELECT COUNT(*) AS count FROM api_keys WHERE user_id = ? AND revoked_at IS NULL",
    args: [userId],
  });
  return Number((result.rows[0] as Row | undefined)?.count ?? 0);
}

export async function listApiKeys(userId: string): Promise<ApiKeySummary[]> {
  await ensureSchema();
  const result = await getDb().execute({
    sql: `SELECT id, name, hint, created_at, last_used_at
          FROM api_keys
          WHERE user_id = ? AND revoked_at IS NULL
          ORDER BY created_at DESC`,
    args: [userId],
  });
  return result.rows.map((row) => toSummary(row as Row));
}

export async function createApiKey(
  userId: string,
  rawName: string,
): Promise<{ key: string; record: ApiKeySummary }> {
  const active = await countActiveApiKeys(userId);
  if (active >= MAX_ACTIVE_KEYS) {
    throw new ApiKeyError(
      400,
      `You can keep up to ${MAX_ACTIVE_KEYS} active keys. Revoke one before creating another.`,
    );
  }

  const name = rawName.trim().replace(/\s+/g, " ").slice(0, 60) || "Default key";
  const key = `${KEY_PREFIX}${randomBytes(24).toString("base64url")}`;
  const id = newImageId(12);
  const createdAt = new Date().toISOString();
  const hint = key.slice(-4);

  await getDb().execute({
    sql: `INSERT INTO api_keys (id, user_id, name, hint, key_hash, created_at)
          VALUES (?, ?, ?, ?, ?, ?)`,
    args: [id, userId, name, hint, hashApiKey(key), createdAt],
  });

  return {
    key,
    record: { id, name, hint, created_at: createdAt, last_used_at: null },
  };
}

export async function revokeApiKey(userId: string, keyId: string): Promise<boolean> {
  await ensureSchema();
  const result = await getDb().execute({
    sql: "UPDATE api_keys SET revoked_at = ? WHERE id = ? AND user_id = ? AND revoked_at IS NULL",
    args: [new Date().toISOString(), keyId, userId],
  });
  return result.rowsAffected > 0;
}

export async function resolveApiKey(raw: string): Promise<{ userId: string; keyId: string } | null> {
  if (!raw.startsWith(KEY_PREFIX) || raw.length < 24) return null;

  await ensureSchema();

  const result = await getDb().execute({
    sql: `SELECT id, user_id, last_used_at
          FROM api_keys
          WHERE key_hash = ? AND revoked_at IS NULL
          LIMIT 1`,
    args: [hashApiKey(raw)],
  });
  const row = result.rows[0] as Row | undefined;
  if (!row) return null;

  const lastUsed = row.last_used_at ? new Date(String(row.last_used_at)).getTime() : 0;
  if (!Number.isFinite(lastUsed) || Date.now() - lastUsed > LAST_USED_THROTTLE_MS) {
    try {
      await getDb().execute({
        sql: "UPDATE api_keys SET last_used_at = ? WHERE id = ?",
        args: [new Date().toISOString(), String(row.id)],
      });
    } catch {
      // A failed touch should never reject a valid key.
    }
  }

  return { userId: String(row.user_id), keyId: String(row.id) };
}
