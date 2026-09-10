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

// Reuse the pool across hot-reloads in dev to avoid exhausting connections.
const pool =
  global.__futbetterPool ??
  new Pool({
    connectionString,
    ssl: connectionString?.includes("localhost") ? false : { rejectUnauthorized: false },
    max: 10,
  });

if (process.env.NODE_ENV !== "production") {
  global.__futbetterPool = pool;
}

export const db = drizzle(pool, { schema });
export { pool };
