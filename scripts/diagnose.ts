import { createClient } from "@libsql/client/node";
import { readFileSync } from "node:fs";

const loadDotEnv = () => {
  try {
    const envText = readFileSync(new URL("../.env", import.meta.url), "utf8");
    envText.split("\n").forEach((line) => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) return;
      const eqIndex = trimmed.indexOf("=");
      if (eqIndex === -1) return;
      const key = trimmed.slice(0, eqIndex).trim();
      const value = trimmed.slice(eqIndex + 1).trim();
      if (!process.env[key]) {
        process.env[key] = value;
      }
    });
  } catch {
    // No .env file found
  }
};

loadDotEnv();

const databaseUrl =
  process.env.EXPO_PUBLIC_TURSO_DATABASE_URL ||
  process.env.TURSO_DATABASE_URL;

const authToken =
  process.env.EXPO_PUBLIC_TURSO_AUTH_TOKEN ||
  process.env.TURSO_AUTH_TOKEN;

if (!databaseUrl) {
  console.error("Missing database URL");
  process.exit(1);
}

const db = createClient({
  url: databaseUrl,
  authToken: authToken || undefined,
});

const diagnose = async () => {
  console.log("=== DATABASE DIAGNOSTIC ===\n");

  // Check tables
  const tables = await db.execute(`
    SELECT name FROM sqlite_master WHERE type='table' ORDER BY name
  `);
  
  console.log("📋 Tables:");
  tables.rows.forEach((row) => console.log(`  - ${row.name}`));
  console.log();

  // Check notifications
  const notifCount = await db.execute("SELECT COUNT(*) as count FROM notifications");
  console.log(`📬 Notifications: ${notifCount.rows[0].count}`);
  
  const notifSample = await db.execute("SELECT * FROM notifications LIMIT 3");
  console.log("Sample notifications:");
  notifSample.rows.forEach((row) => {
    console.log(`  - [${row.type}] ${row.title}`);
  });
  console.log();

  // Check donors
  const donorCount = await db.execute("SELECT COUNT(*) as count FROM donors");
  console.log(`👥 Donors: ${donorCount.rows[0].count}`);
  
  const donorSample = await db.execute("SELECT * FROM donors LIMIT 3");
  console.log("Sample donors:");
  donorSample.rows.forEach((row) => {
    console.log(`  - ${row.full_name} (${row.blood_type})`);
  });
  console.log();

  // Check users
  const userCount = await db.execute("SELECT COUNT(*) as count FROM users");
  console.log(`👤 Users: ${userCount.rows[0].count}`);
  
  console.log("\n✅ Diagnostic complete");
};

diagnose().catch((error) => {
  console.error("❌ Diagnostic failed:", error);
  process.exit(1);
});
