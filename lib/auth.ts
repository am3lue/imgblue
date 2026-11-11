import "server-only";
import { createHash, randomBytes, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import { cookies } from "next/headers";
import { cache } from "react";
import { ensureSchema, getDb, isDatabaseConfigured } from "./db";
import { newImageId } from "./id";

const scrypt = promisify(scryptCallback);

const SESSION_COOKIE = "imgblue_session";
const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000;
const DUMMY_HASH = `scrypt$${"0".repeat(32)}$${"0".repeat(128)}`;

export type SessionUser = {
  id: string;
  email: string;
  name: string | null;
  createdAt: string;
};

type Row = Record<string, unknown>;

export class AuthError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "AuthError";
    this.status = status;
  }
}

export function normalizeEmail(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const email = value.trim().toLowerCase();
  if (email.length < 3 || email.length > 254) return null;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : null;
}

export function passwordProblem(value: unknown): string | null {
  if (typeof value !== "string" || value.length === 0) return "Enter a password.";
  if (value.length < 8) return "Use at least 8 characters.";
  if (value.length > 200) return "That password is too long.";
  return null;
}

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const derived = (await scrypt(password, salt, 64)) as Buffer;
  return `scrypt$${salt}$${derived.toString("hex")}`;
}

async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [scheme, salt, hash] = stored.split("$");
  if (scheme !== "scrypt" || !salt || !hash) return false;

  const derived = (await scrypt(password, salt, 64)) as Buffer;
  const expected = Buffer.from(hash, "hex");
  if (derived.length !== expected.length) return false;

  return timingSafeEqual(derived, expected);
}

function toUser(row: Row): SessionUser {
  return {
    id: String(row.id),
    email: String(row.email),
    name: row.name == null ? null : String(row.name),
    createdAt: String(row.created_at ?? ""),
  };
}

export async function createUser(input: {
  email: string;
  name: string | null;
  password: string;
}): Promise<SessionUser> {
  await ensureSchema();

  const id = newImageId(12);
  const createdAt = new Date().toISOString();
  const passwordHash = await hashPassword(input.password);

  try {
    await getDb().execute({
      sql: "INSERT INTO users (id, email, name, password_hash, created_at) VALUES (?, ?, ?, ?, ?)",
      args: [id, input.email, input.name, passwordHash, createdAt],
    });
  } catch (error) {
    if (error instanceof Error && /UNIQUE constraint failed/i.test(error.message)) {
      throw new AuthError(409, "An account with that email already exists.");
    }
    throw error;
  }

  return { id, email: input.email, name: input.name, createdAt };
}

export async function verifyCredentials(email: string, password: string): Promise<SessionUser | null> {
  await ensureSchema();

  const result = await getDb().execute({
    sql: "SELECT id, email, name, password_hash, created_at FROM users WHERE email = ? LIMIT 1",
    args: [email],
  });
  const row = result.rows[0] as Row | undefined;

  if (!row) {
    await verifyPassword(password, DUMMY_HASH);
    return null;
  }

  const valid = await verifyPassword(password, String(row.password_hash ?? ""));
  if (!valid) return null;

  return toUser(row);
}

export async function createSession(userId: string): Promise<void> {
  await ensureSchema();

  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);
  const createdAt = new Date().toISOString();

  await getDb().execute({
    sql: "INSERT INTO sessions (id, user_id, expires_at, created_at) VALUES (?, ?, ?, ?)",
    args: [hashToken(token), userId, expiresAt.toISOString(), createdAt],
  });

  const jar = await cookies();
  jar.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
}

export async function destroySession(): Promise<void> {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;

  if (token) {
    try {
      await getDb().execute({
        sql: "DELETE FROM sessions WHERE id = ?",
        args: [hashToken(token)],
      });
    } catch {
      // Clearing the cookie is still the right move.
    }
  }

  jar.delete(SESSION_COOKIE);
}

async function loadCurrentUser(): Promise<SessionUser | null> {
  if (!isDatabaseConfigured()) return null;

  try {
    const jar = await cookies();
    const token = jar.get(SESSION_COOKIE)?.value;
    if (!token) return null;

    await ensureSchema();

    const result = await getDb().execute({
      sql: `SELECT u.id, u.email, u.name, u.created_at, s.expires_at
            FROM sessions s
            JOIN users u ON u.id = s.user_id
            WHERE s.id = ?
            LIMIT 1`,
      args: [hashToken(token)],
    });
    const row = result.rows[0] as Row | undefined;
    if (!row) return null;

    const expiresAt = new Date(String(row.expires_at ?? ""));
    if (!Number.isFinite(expiresAt.getTime()) || expiresAt.getTime() <= Date.now()) {
      try {
        await getDb().execute({
          sql: "DELETE FROM sessions WHERE id = ?",
          args: [hashToken(token)],
        });
      } catch {
        // Ignore cleanup failures.
      }
      return null;
    }

    return toUser(row);
  } catch (error) {
    console.error("[imgblue] session lookup failed:", error);
    return null;
  }
}

export const getCurrentUser = cache(loadCurrentUser);

export async function requireSessionUser(): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) throw new AuthError(401, "Sign in to continue.");
  return user;
}
