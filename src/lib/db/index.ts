import "server-only";
import path from "node:path";
import type { NeonHttpDatabase } from "drizzle-orm/neon-http";
import * as schema from "./schema";

/** Both drivers share the same query API; typed as the Neon one */
export type Db = NeonHttpDatabase<typeof schema>;

/**
 * Database connection.
 *  - Production / Vercel: Neon Postgres via DATABASE_URL (added by Vercel → Storage → Neon).
 *  - Local development without DATABASE_URL: an embedded Postgres (PGlite) stored in ./.pglite,
 *    with the migrations applied automatically, so the site can be tested without a cloud database.
 */
async function connect(): Promise<Db> {
  const url = process.env.DATABASE_URL;
  if (url) {
    const { neon } = await import("@neondatabase/serverless");
    const { drizzle } = await import("drizzle-orm/neon-http");
    return drizzle({ client: neon(url), schema });
  }
  if (process.env.NODE_ENV === "production" && process.env.VERCEL) {
    throw new Error("DATABASE_URL is not set — connect Neon in Vercel → Storage");
  }
  const { PGlite } = await import("@electric-sql/pglite");
  const { drizzle } = await import("drizzle-orm/pglite");
  const { migrate } = await import("drizzle-orm/pglite/migrator");
  const client = new PGlite(path.join(process.cwd(), ".pglite"));
  const db = drizzle({ client, schema });
  await migrate(db, { migrationsFolder: path.join(process.cwd(), "drizzle") });
  return db as unknown as Db;
}

const g = globalThis as unknown as { __vhDb?: Promise<Db> };
export const getDb = () => (g.__vhDb ??= connect());
export { schema };
