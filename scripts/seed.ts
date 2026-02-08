import { createClient } from "@libsql/client/node";
import { readFileSync } from "node:fs";
import { randomUUID } from "node:crypto";

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
    // No .env file found; ignore.
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
  console.error("Missing EXPO_PUBLIC_TURSO_DATABASE_URL or TURSO_DATABASE_URL");
  process.exit(1);
}

const db = createClient({
  url: databaseUrl,
  authToken: authToken || undefined,
});

const firstNames = [
  "Maria",
  "Jose",
  "Juan",
  "Ana",
  "Miguel",
  "Patricia",
  "Paolo",
  "Kathleen",
  "Luis",
  "Grace",
  "Rafael",
  "Clarisse",
  "Dianne",
  "Noel",
  "Kristine",
  "Enrique",
  "Janelle",
  "Mark",
  "Liza",
  "Arvin",
];

const lastNames = [
  "Santos",
  "Reyes",
  "Cruz",
  "Gonzales",
  "Villanueva",
  "Rivera",
  "Mendoza",
  "Bautista",
  "Garcia",
  "Lopez",
  "Flores",
  "Ramos",
  "Del Rosario",
  "Soriano",
  "Magtibay",
  "De la Cruz",
  "Navarro",
  "Pangan",
  "Castro",
  "Domingo",
];

const municipalities = [
  "Sorsogon City",
  "Gubat",
  "Irosin",
  "Bulan",
  "Casiguran",
  "Barcelona",
  "Juban",
  "Matnog",
  "Bulusan",
  "Donsol",
  "Pilar",
  "Castilla",
];

const bloodTypeWeights: Array<{ type: string; weight: number }> = [
  { type: "O+", weight: 37 },
  { type: "A+", weight: 28 },
  { type: "B+", weight: 19 },
  { type: "AB+", weight: 5 },
  { type: "O-", weight: 5 },
  { type: "A-", weight: 3 },
  { type: "B-", weight: 2 },
  { type: "AB-", weight: 1 },
];

const pickRandom = <T>(items: T[]): T => items[Math.floor(Math.random() * items.length)];

const weightedBloodType = (): string => {
  const total = bloodTypeWeights.reduce((sum, item) => sum + item.weight, 0);
  let roll = Math.random() * total;

  for (const item of bloodTypeWeights) {
    if (roll < item.weight) return item.type;
    roll -= item.weight;
  }

  return "O+";
};

const generatePHMobile = (): string => {
  const prefix = "09";
  const number = Array.from({ length: 9 }, () => Math.floor(Math.random() * 10)).join("");
  return `${prefix}${number}`;
};

const buildFullName = (): string => `${pickRandom(firstNames)} ${pickRandom(lastNames)}`;

const randomDateISO = (daysBack: number): string => {
  const now = new Date();
  const offset = Math.floor(Math.random() * daysBack);
  const date = new Date(now.getTime() - offset * 86400000);
  return date.toISOString();
};

const seed = async () => {
  await db.execute("PRAGMA foreign_keys = ON");

  const schema = readFileSync(new URL("../turso/schema.sql", import.meta.url), "utf8");
  const statements = schema
    .split(/;\s*\n/)
    .map((statement) => statement.trim())
    .filter(Boolean);

  for (const statement of statements) {
    await db.execute(statement);
  }

  const existingUsers = await db.execute(
    "SELECT COUNT(*) as count FROM users",
  );
  const existingCount = Number(existingUsers.rows?.[0]?.count ?? 0);

  if (existingCount > 0) {
    console.log("Seed skipped: users table already has data.");
    return;
  }

  let inTransaction = false;
  let adminCount = 0;
  let registrationCount = 0;
  let approvedDonors = 0;
  let alertCount = 0;
  let notificationCount = 0;

  try {
    await db.execute("BEGIN");
    inTransaction = true;

    const adminName = "Dr. Patricia Reyes";
    const adminContact = "09171234567";

    const adminResult = await db.execute({
      sql: "INSERT INTO users (full_name, contact_number, role, created_at) VALUES (?, ?, ?, ?)",
      args: [adminName, adminContact, "admin", new Date().toISOString()],
    });

    const adminId = Number(adminResult?.lastInsertRowid ?? 0);
    adminCount = 1;

    const registrationTotal = 24;

    for (let i = 0; i < registrationTotal; i += 1) {
      const fullName = buildFullName();
      const bloodType = weightedBloodType();
      const municipality = pickRandom(municipalities);
      const contactNumber = generatePHMobile();
      const age = 18 + Math.floor(Math.random() * 35);
      const availability = Math.random() > 0.25 ? "Available" : "Temporarily Unavailable";

      const roll = Math.random();
      let status: "approved" | "pending" | "rejected" = "approved";
      if (roll > 0.9) status = "rejected";
      else if (roll > 0.7) status = "pending";

      const registrationResult = await db.execute({
        sql: `INSERT INTO donor_registrations (
          full_name,
          contact_number,
          email,
          age,
          blood_type,
          municipality,
          availability,
          status,
          review_reason,
          reviewed_by,
          reviewed_at,
          created_at,
          updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
        ,
        args: [
          fullName,
          contactNumber,
          `${fullName.toLowerCase().replace(/\s+/g, ".")}@gmail.com`,
          age,
          bloodType,
          municipality,
          availability,
          status,
          status === "rejected" ? "Incomplete eligibility screening" : null,
          status === "pending" ? null : adminId,
          status === "pending" ? null : randomDateISO(14),
          randomDateISO(30),
          randomDateISO(7),
        ],
      });

      registrationCount += 1;

      if (status === "approved") {
        const userResult = await db.execute({
          sql: "INSERT INTO users (full_name, contact_number, role, created_at) VALUES (?, ?, ?, ?)",
          args: [fullName, contactNumber, "donor", new Date().toISOString()],
        });

        const userId = Number(userResult?.lastInsertRowid ?? 0);

        await db.execute({
          sql: `INSERT INTO donor_profiles (
            user_id,
            blood_type,
            age,
            sex,
            municipality,
            availability_status,
            last_donation_date,
            notes,
            created_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
          ,
          args: [
            userId,
            bloodType,
            age,
            Math.random() > 0.5 ? "M" : "F",
            municipality,
            availability,
            randomDateISO(120).slice(0, 10),
            "Active community donor",
            new Date().toISOString(),
          ],
        });

        await db.execute({
          sql: `INSERT INTO donors (
            full_name,
            age,
            sex,
            blood_type,
            contact_number,
            municipality,
            availability_status,
            last_donation_date,
            notes,
            created_at,
            is_deleted
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0)`
          ,
          args: [
            fullName,
            age,
            Math.random() > 0.5 ? "M" : "F",
            bloodType,
            contactNumber,
            municipality,
            availability,
            randomDateISO(120).slice(0, 10),
            "Verified donor profile",
            new Date().toISOString(),
          ],
        });

        approvedDonors += 1;
      }
    }

    const messageSamples = [
      "Available for emergency donation this week.",
      "Can I schedule a donation on Saturday?",
      "How do I update my availability status?",
      "I have a friend with O- willing to donate.",
    ];

    for (let i = 0; i < 6; i += 1) {
      const senderId = 2 + i;
      await db.execute({
        sql: `INSERT INTO messages (
          sender_id,
          subject,
          content,
          is_read,
          is_closed,
          created_at
        ) VALUES (?, ?, ?, ?, ?, ?)`
        ,
        args: [
          senderId,
          "Donor Inquiry",
          pickRandom(messageSamples),
          0,
          0,
          randomDateISO(10),
        ],
      });
    }

    const alerts = [
      {
        title: "Urgent O- Units Needed",
        message: "Sorsogon Provincial Hospital needs O- units for trauma cases today.",
        alert_type: "urgent",
        priority: "critical",
        target_audience: ["O-", "O+"],
        location: "Sorsogon City",
      },
      {
        title: "Donation Drive - Gubat",
        message: "Mobile drive on Feb 18 at Gubat Municipal Hall, 9 AM - 4 PM.",
        alert_type: "event",
        priority: "medium",
        target_audience: ["All"],
        location: "Gubat",
      },
      {
        title: "AB+ Surgery Coverage",
        message: "AB+ donors needed in Irosin for scheduled surgery this week.",
        alert_type: "info",
        priority: "high",
        target_audience: ["AB+"],
        location: "Irosin",
      },
    ];

    for (const alert of alerts) {
      const result = await db.execute({
        sql: `INSERT INTO alerts (
          title,
          message,
          alert_type,
          priority,
          target_audience,
          location,
          schedule_at,
          send_now,
          created_by,
          status,
          sent_at,
          created_at,
          updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
        ,
        args: [
          alert.title,
          alert.message,
          alert.alert_type,
          alert.priority,
          JSON.stringify(alert.target_audience),
          alert.location,
          null,
          1,
          String(adminId),
          "sent",
          new Date().toISOString(),
          new Date().toISOString(),
          new Date().toISOString(),
        ],
      });

      const alertId = Number(result?.lastInsertRowid ?? 0);
      alertCount += 1;

      await db.execute({
        sql: `INSERT INTO notifications (
          title,
          message,
          type,
          is_read,
          created_at,
          data
        ) VALUES (?, ?, ?, ?, ?, ?)`
        ,
        args: [
          alert.title,
          alert.message,
          "Emergency",
          0,
          new Date().toISOString(),
          JSON.stringify({ alertId, source: "alert" }),
        ],
      });

      notificationCount += 1;
    }

    for (let i = 0; i < 4; i += 1) {
      await db.execute({
        sql: `INSERT INTO notifications (
          title,
          message,
          type,
          is_read,
          created_at,
          data
        ) VALUES (?, ?, ?, ?, ?, ?)`
        ,
        args: [
          "Welcome to Dugtong",
          "Thank you for registering as a donor. Keep your availability updated.",
          "System",
          i % 2,
          randomDateISO(14),
          JSON.stringify({ welcomeId: randomUUID() }),
        ],
      });

      notificationCount += 1;
    }

    await db.execute("COMMIT");
    inTransaction = false;

    console.log("Seed complete.");
    console.log(`Admin count: ${adminCount}`);
    console.log(`Registration count: ${registrationCount}`);
    console.log(`Approved donors: ${approvedDonors}`);
    console.log(`Alerts: ${alertCount}`);
    console.log(`Notifications: ${notificationCount}`);
  } catch (error) {
    if (inTransaction) {
      await db.execute("ROLLBACK");
    }
    console.error("Seed failed:", error);
    process.exit(1);
  }
};

seed().catch((error) => {
  console.error("Seed failed:", error);
  process.exit(1);
});
