import { readFileSync } from "node:fs";
import { createClient } from "@libsql/client";

const databaseUrl =
  process.env.EXPO_PUBLIC_TURSO_DATABASE_URL ||
  process.env.TURSO_DATABASE_URL;

const authToken =
  process.env.EXPO_PUBLIC_TURSO_AUTH_TOKEN ||
  process.env.TURSO_AUTH_TOKEN;

if (!databaseUrl) {
  console.error("Missing EXPO_PUBLIC_TURSO_DATABASE_URL or TURSO_DATABASE_URL");
  process.exit(1);
}

const client = createClient({
  url: databaseUrl,
  authToken: authToken || undefined,
});

const sql = readFileSync(new URL("../turso/schema.sql", import.meta.url), "utf8");

const statements = sql
  .split(/;\s*\n/)
  .map((statement) => statement.trim())
  .filter(Boolean);

for (const statement of statements) {
  await client.execute(statement);
}

console.log(`Applied ${statements.length} statements.`);
