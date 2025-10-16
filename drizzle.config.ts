import { defineConfig } from "drizzle-kit";

export default defineConfig({
  out: "./migrations",
  schema: "./shared/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: "postgresql://postgres:mydatabase456%4012@db.lgmhziyouvylsiqvgjtd.supabase.co:5432/postgres",
  },
});
