import { defineConfig } from "drizzle-kit";

// Read DATABASE_URL from .env.local (created by `npx vercel env pull .env.local`)
try {
  process.loadEnvFile(".env.local");
} catch {
  // no .env.local — DATABASE_URL may already be set in the environment
}

// npm run db:generate  → write SQL migrations to ./drizzle after changing src/lib/db/schema.ts
// npm run db:migrate   → apply them to Neon (needs DATABASE_URL, e.g. `npx vercel env pull .env.local`)
export default defineConfig({
  schema: "./src/lib/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: { url: process.env.DATABASE_URL ?? "" },
});
