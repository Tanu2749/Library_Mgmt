import { Pool } from "pg";
import * as dotenv from "dotenv";

dotenv.config();

async function main() {
  const url = process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL;
  if (!url) {
    console.error("No DATABASE_URL");
    process.exit(1);
  }

  const pool = new Pool({ connectionString: url });
  console.log("Connecting to Neon to enable vector extension...");
  await pool.query("CREATE EXTENSION IF NOT EXISTS vector;");
  console.log("✅ vector extension enabled successfully!");
  await pool.end();
}

main().catch((err) => {
  console.error("Error enabling vector:", err);
  process.exit(1);
});
