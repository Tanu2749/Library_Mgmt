import { NextResponse } from "next/server";

/**
 * Health check endpoint.
 * Returns app and database status.
 * Used by Docker healthcheck and uptime monitors.
 */
export async function GET() {
  const status: {
    status: "ok" | "degraded" | "error";
    timestamp: string;
    uptime: number;
    services: {
      database: { status: "ok" | "error"; latencyMs?: number; error?: string };
    };
  } = {
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    services: {
      database: { status: "ok" },
    },
  };

  try {
    // Dynamically import to avoid env validation at build time
    const { Pool } = await import("@neondatabase/serverless");
    const dbUrl =
      process.env.DATABASE_URL ||
      process.env.POSTGRES_URL ||
      process.env.POSTGRES_PRISMA_URL;

    if (!dbUrl) {
      status.services.database = {
        status: "error",
        error: "DATABASE_URL or POSTGRES_URL not configured",
      };
      status.status = "degraded";
    } else {
      const isNeon =
        dbUrl.includes("neon.tech") || dbUrl.includes("vercel-storage.com");
      let latencyMs = 0;

      if (isNeon) {
        const pool = new Pool({ connectionString: dbUrl });
        const start = Date.now();
        await pool.query("SELECT 1");
        latencyMs = Date.now() - start;
        await pool.end();
      } else {
        const { Pool: PgPool } = await import("pg");
        const pool = new PgPool({ connectionString: dbUrl });
        const start = Date.now();
        await pool.query("SELECT 1");
        latencyMs = Date.now() - start;
        await pool.end();
      }

      status.services.database = { status: "ok", latencyMs };
    }
  } catch (err) {
    status.services.database = {
      status: "error",
      error: err instanceof Error ? err.message : "Unknown database error",
    };
    status.status = "error";
  }

  const httpStatus = status.status === "error" ? 503 : 200;
  return NextResponse.json(status, { status: httpStatus });
}
