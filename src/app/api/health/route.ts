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
    const dbUrl = process.env.DATABASE_URL;

    if (!dbUrl) {
      status.services.database = {
        status: "error",
        error: "DATABASE_URL not configured",
      };
      status.status = "degraded";
    } else {
      const pool = new Pool({ connectionString: dbUrl });
      const start = Date.now();
      await pool.query("SELECT 1");
      const latencyMs = Date.now() - start;
      status.services.database = { status: "ok", latencyMs };
      await pool.end();
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
