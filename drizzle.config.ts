import { defineConfig } from "drizzle-kit";

// npm run db:generate  → write SQL migrations to ./drizzle after changing src/lib/db/schema.ts
// npm run db:migrate   → apply them to Neon (needs DATABASE_URL, e.g. `vercel env pull .env.local`)
export default defineConfig({
  schema: "./src/lib/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: { url: process.env.DATABASE_URL ?? "" },
});
