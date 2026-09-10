import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

declare global {
  var __futbetterPool: Pool | undefined;
}

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.warn(
    "[futbetter] DATABASE_URL is not set. Set it in your .env file (see .env.example)."
  );
}

// Automatically use transaction pooler (port 6543) if port 5432 is configured on Supabase pooler,
// preventing EMAXCONNSESSION (the 15-connection limit in session mode).
let normalizedConnectionString = connectionString;
if (normalizedConnectionString && normalizedConnectionString.includes("pooler.supabase.com:5432")) {
  normalizedConnectionString = normalizedConnectionString.replace(":5432/", ":6543/");
}

// Reuse the pool across requests/hot-reloads to avoid exhausting connections.
const pool =
  global.__futbetterPool ??
  new Pool({
    connectionString: normalizedConnectionString,
    ssl: normalizedConnectionString?.includes("localhost") ? false : { rejectUnauthorized: false },
    max: 5,
    idleTimeoutMillis: 10000,
    connectionTimeoutMillis: 5000,
  });

global.__futbetterPool = pool;

export const db = drizzle(pool, { schema });
export { pool };
