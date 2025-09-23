import path from "node:path";
import { fileURLToPath } from "node:url";
import * as dotenv from "dotenv";
import { Pool, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

// Resolve both CWD and the file's directory (handles odd launch dirs)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from project root (where package.json lives)
dotenv.config({ path: path.resolve(process.cwd(), ".env") });
// Fallback: also try parent of /server (useful if CWD is off)
dotenv.config({ path: path.resolve(__dirname, "../.env") });

if (!process.env.DATABASE_URL) {
  console.error("Failed to load DATABASE_URL. Checked:", 
    path.resolve(process.cwd(), ".env"), "and",
    path.resolve(__dirname, "../.env")
  );
  throw new Error("DATABASE_URL must be set. Did you forget to provision a database?");
}

export const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export const db = drizzle({ client: pool, schema });
