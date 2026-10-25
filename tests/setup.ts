/**
 * Test setup file for Vitest.
 * Sets environment variables needed by modules under test.
 */
import dotenv from "dotenv";

// Load .env.example as defaults for testing
dotenv.config({ path: ".env.example" });

// Override with test-specific values
process.env.DATABASE_URL =
  process.env.DATABASE_URL || "postgresql://test:test@localhost:5432/test";
process.env.NEXTAUTH_SECRET =
  process.env.NEXTAUTH_SECRET || "test-secret-at-least-32-characters-long";
process.env.NEXTAUTH_URL = process.env.NEXTAUTH_URL || "http://localhost:3000";
(process.env as Record<string, string | undefined>).NODE_ENV = "test";
