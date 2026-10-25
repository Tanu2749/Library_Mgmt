import { z } from "zod";

/**
 * Environment variable validation using Zod.
 * REQUIRED vars crash at startup with clear messages.
 * OPTIONAL vars (AI keys) default to undefined and disable features gracefully.
 */

const envSchema = z.object({
  // ─── Required ───
  DATABASE_URL: z
    .string({
      required_error:
        "❌ DATABASE_URL is required. Set it to your PostgreSQL connection string.\n   Example: postgresql://user:pass@localhost:5432/athenaeum",
    })
    .url("DATABASE_URL must be a valid URL"),

  NEXTAUTH_SECRET: z
    .string({
      required_error:
        "❌ NEXTAUTH_SECRET is required. Generate one with: openssl rand -base64 32",
    })
    .min(16, "NEXTAUTH_SECRET must be at least 16 characters"),

  NEXTAUTH_URL: z
    .string()
    .url()
    .default("http://localhost:3000"),

  // ─── Optional: AI Provider Keys (at most one needed) ───
  OPENAI_API_KEY: z.string().optional(),
  GOOGLE_GENERATIVE_AI_API_KEY: z.string().optional(),
  ANTHROPIC_API_KEY: z.string().optional(),

  // ─── Optional: Feature Overrides ───
  AI_ENABLED: z
    .enum(["true", "false"])
    .transform((v) => v === "true")
    .optional(),
  THREE_D_ENABLED: z
    .enum(["true", "false"])
    .transform((v) => v === "true")
    .optional(),
  REGISTRATION_OPEN: z
    .enum(["true", "false"])
    .transform((v) => v === "true")
    .optional(),

  // ─── Optional: App Config ───
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  PORT: z
    .string()
    .transform(Number)
    .pipe(z.number().positive())
    .default("3000"),
});

export type Env = z.infer<typeof envSchema>;

/**
 * Parse and validate environment variables.
 * Called once at module load.
 */
function validateEnv(): Env {
  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    const formatted = result.error.issues
      .map((issue) => {
        const path = issue.path.join(".");
        return `  • ${path}: ${issue.message}`;
      })
      .join("\n");

    console.error(
      "\n╔══════════════════════════════════════════════════════════╗"
    );
    console.error(
      "║           ENVIRONMENT CONFIGURATION ERROR              ║"
    );
    console.error(
      "╚══════════════════════════════════════════════════════════╝\n"
    );
    console.error(formatted);
    console.error(
      "\n→ Check your .env file or environment variables.\n→ See .env.example for reference.\n"
    );

    throw new Error(`Invalid environment variables:\n${formatted}`);
  }

  return result.data;
}

/**
 * Validated env singleton.
 * Import this instead of accessing process.env directly.
 */
export const env = validateEnv();

/**
 * Derived helpers
 */
export const hasAIKey = Boolean(
  env.OPENAI_API_KEY ||
    env.GOOGLE_GENERATIVE_AI_API_KEY ||
    env.ANTHROPIC_API_KEY
);

export const isAIEnabled = hasAIKey && (env.AI_ENABLED ?? true);
export const isProduction = env.NODE_ENV === "production";
