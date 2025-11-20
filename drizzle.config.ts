import { defineConfig } from "drizzle-kit";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

export default defineConfig({
  out: "./migrations",
  schema: "./shared/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    // Use environment variable with fallback for backward compatibility
    url: process.env.DATABASE_URL || "postgresql://postgres:mydatabase456%4012@db.lgmhziyouvylsiqvgjtd.supabase.co:5432/postgres",
  },
});
