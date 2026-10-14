import "server-only";
import { randomBytes, scrypt as _scrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import { cookies } from "next/headers";
import { sign, verify } from "./quote";

const scrypt = promisify(_scrypt) as (pw: string, salt: Buffer, len: number) => Promise<Buffer>;

/** Hash a password (scrypt, random salt) */
export async function hashSecret(secret: string) {
  const salt = randomBytes(16);
  const key = await scrypt(secret, salt, 32);
  return `scrypt$${salt.toString("base64url")}$${key.toString("base64url")}`;
}

export async function checkSecret(secret: string, stored: string) {
  const [, salt, key] = stored.split("$");
  if (!salt || !key) return false;
  const actual = await scrypt(secret, Buffer.from(salt, "base64url"), 32);
  const expected = Buffer.from(key, "base64url");
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

/* ---------- Sessions: signed, httpOnly cookies ---------- */

type Session = { kind: "affiliate" | "staff"; id: number; exp: number };
const COOKIE = { affiliate: "vh_aff", staff: "vh_staff" } as const;
const DAYS = { affiliate: 30, staff: 1 } as const;

export async function startSession(kind: Session["kind"], id: number) {
  const exp = Date.now() + DAYS[kind] * 86_400_000;
  (await cookies()).set(COOKIE[kind], sign({ kind, id, exp } satisfies Session), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: new Date(exp),
  });
}

export async function readSession(kind: Session["kind"]): Promise<number | null> {
  const raw = (await cookies()).get(COOKIE[kind])?.value;
  const s = raw ? verify<Session>(raw) : null;
  return s && s.kind === kind && s.exp > Date.now() ? s.id : null;
}

export async function endSession(kind: Session["kind"]) {
  (await cookies()).delete(COOKIE[kind]);
}
