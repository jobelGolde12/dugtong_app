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
  } catch {}
};

loadDotEnv();

const db = createClient({
  url: process.env.EXPO_PUBLIC_TURSO_DATABASE_URL || process.env.TURSO_DATABASE_URL,
  authToken: process.env.EXPO_PUBLIC_TURSO_AUTH_TOKEN || process.env.TURSO_AUTH_TOKEN || undefined,
});

const test = async () => {
  console.log("=== NOTIFICATION API TEST ===\n");

  // Test 1: Fetch all notifications (simulating API call)
  console.log("Test 1: Fetch all notifications");
  const result = await db.execute("SELECT * FROM notifications ORDER BY created_at DESC");
  console.log(`✅ Found ${result.rows.length} notifications\n`);

  // Test 2: Fetch with filter (unread only)
  console.log("Test 2: Fetch unread notifications");
  const unread = await db.execute("SELECT * FROM notifications WHERE is_read = 0");
  console.log(`✅ Found ${unread.rows.length} unread notifications\n`);

  // Test 3: Fetch by type
  console.log("Test 3: Fetch by type (Emergency)");
  const emergency = await db.execute("SELECT * FROM notifications WHERE type = 'Emergency'");
  console.log(`✅ Found ${emergency.rows.length} emergency notifications\n`);

  // Test 4: Display sample data
  console.log("Sample notification data:");
  result.rows.slice(0, 2).forEach((row, i) => {
    console.log(`\nNotification ${i + 1}:`);
    console.log(`  ID: ${row.id}`);
    console.log(`  Title: ${row.title}`);
    console.log(`  Type: ${row.type}`);
    console.log(`  Read: ${row.is_read ? 'Yes' : 'No'}`);
    console.log(`  Created: ${row.created_at}`);
  });

  console.log("\n✅ All tests passed");
};

test().catch((error) => {
  console.error("❌ Test failed:", error);
  process.exit(1);
});
