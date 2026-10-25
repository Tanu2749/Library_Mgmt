import { drizzle as drizzleNode } from "drizzle-orm/node-postgres";
import { drizzle as drizzleNeon } from "drizzle-orm/neon-serverless";
import { Pool as PgPool } from "pg";
import { Pool as NeonPool } from "@neondatabase/serverless";
import * as schema from "./schema";

/**
 * Universal Database Client:
 * Automatically uses Neon WebSocket driver when running on Neon serverless,
 * or standard pooled pg.Pool when running in Docker or local PostgreSQL.
 */

function createDb() {
  const connectionString =
    process.env.DATABASE_URL ||
    process.env.POSTGRES_URL ||
    process.env.POSTGRES_PRISMA_URL ||
    "postgresql://athenaeum:athenaeum@localhost:5432/athenaeum";

  const isNeon =
    connectionString.includes("neon.tech") ||
    connectionString.includes("vercel-storage.com");

  if (isNeon) {
    const pool = new NeonPool({ connectionString });
    return drizzleNeon(pool, { schema });
  }

  const pool = new PgPool({
    connectionString,
    max: process.env.NODE_ENV === "production" ? 20 : 5,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
  });

  return drizzleNode(pool, { schema });
}

const globalForDb = globalThis as unknown as {
  db: ReturnType<typeof createDb> | undefined;
};

export const db = globalForDb.db ?? createDb();

if (process.env.NODE_ENV !== "production") {
  globalForDb.db = db;
}

export type Database = typeof db;
