import { createClient } from "@libsql/client";

try {
  process.loadEnvFile(".env.local");
} catch {
  // No .env.local — rely on the ambient environment.
}

const url = process.env.TURSO_DATABASE_URL?.trim() || "file:local.db";
const authToken = process.env.TURSO_AUTH_TOKEN?.trim();

const client = createClient(url.startsWith("file:") || !authToken ? { url } : { url, authToken });

const statements = [
  `CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT NOT NULL,
    name TEXT,
    password_hash TEXT NOT NULL,
    created_at TEXT NOT NULL
  )`,
  `CREATE UNIQUE INDEX IF NOT EXISTS users_email_idx ON users (email)`,
  `CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    expires_at TEXT NOT NULL,
    created_at TEXT NOT NULL
  )`,
  `CREATE INDEX IF NOT EXISTS sessions_user_id_idx ON sessions (user_id)`,
  `CREATE TABLE IF NOT EXISTS api_keys (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    hint TEXT NOT NULL,
    key_hash TEXT NOT NULL,
    created_at TEXT NOT NULL,
    last_used_at TEXT,
    revoked_at TEXT
  )`,
  `CREATE UNIQUE INDEX IF NOT EXISTS api_keys_key_hash_idx ON api_keys (key_hash)`,
  `CREATE INDEX IF NOT EXISTS api_keys_user_id_idx ON api_keys (user_id)`,
  `CREATE TABLE IF NOT EXISTS images (
    id TEXT PRIMARY KEY,
    user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
    original_name TEXT,
    mime_type TEXT NOT NULL DEFAULT 'image/jpeg',
    width INTEGER NOT NULL,
    height INTEGER NOT NULL,
    size_bytes INTEGER NOT NULL,
    base64 TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    views INTEGER NOT NULL DEFAULT 0
  )`,
  `CREATE INDEX IF NOT EXISTS images_created_at_idx ON images (created_at DESC)`,
  `CREATE INDEX IF NOT EXISTS images_user_id_idx ON images (user_id, created_at DESC)`,
];

for (const sql of statements) {
  await client.execute(sql);
}

console.log(`imgblue schema ready → ${url}`);
