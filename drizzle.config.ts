import { defineConfig } from "drizzle-kit";

// Read the production DATABASE_URL from .env.vercel.local
// (create it with: npx vercel env pull .env.vercel.local --environment=production)
// Kept out of .env.local on purpose, so `npm run dev` never touches the live database.
try {
  process.loadEnvFile(".env.vercel.local");
} catch {
  // no .env.local — DATABASE_URL may already be set in the environment
}

// npm run db:generate  → write SQL migrations to ./drizzle after changing src/lib/db/schema.ts
// npm run db:migrate   → apply them to the live Neon database (reads .env.vercel.local)
export default defineConfig({
  schema: "./src/lib/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: { url: process.env.DATABASE_URL ?? "" },
});
