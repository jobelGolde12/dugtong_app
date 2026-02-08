I am migrating my architecture from:

FastAPI + PostgreSQL + SQLAlchemy

to:

React Native + TypeScript + Turso (LibSQL) directly

I need you to convert my existing Python seed script into a Turso-compatible TypeScript seed system.

🎯 Objective

Replace this Python SQLAlchemy seed script with:

SQLite-compatible schema

Turso (LibSQL) client

TypeScript implementation

No FastAPI

No SQLAlchemy

No backend server

1️⃣ Convert PostgreSQL Models to SQLite Schema (Turso)

Convert all PostgreSQL-specific features to SQLite-compatible schema:

Replace:

SERIAL → INTEGER PRIMARY KEY AUTOINCREMENT

BOOLEAN → INTEGER (0 or 1)

ENUM → TEXT with allowed values

JSON → TEXT (store JSON stringified)

TIMESTAMP → TEXT (ISO string)

Required Tables:

Create SQLite schema for:

users

donor_registrations

donor_profiles

messages

alerts

notifications

Ensure foreign keys are defined properly.

Enable foreign keys:

PRAGMA foreign_keys = ON;

2️⃣ Create Turso Client Setup

Create file:

src/lib/turso.ts

Initialize:

import { createClient } from "@libsql/client";

export const db = createClient({
url: process.env.TURSO_DATABASE_URL!,
authToken: process.env.TURSO_AUTH_TOKEN!,
});

Do NOT hardcode credentials.

3️⃣ Create Seed Script in TypeScript

Create:

scripts/seed.ts

This script should:

Connect to Turso

Create tables if not exist

Insert realistic Philippine data

Follow the same logic as the Python script

4️⃣ Recreate Philippine Data Logic in TypeScript

Convert:

Filipino names array

Philippine municipalities

Weighted blood type distribution

Random PH mobile number generator

Implement:

function weightedBloodType(): string { ... }
function generatePHMobile(): string { ... }

Maintain the same blood distribution percentages.

5️⃣ Recreate Seeding Logic

Recreate logic for:

Admin User

1 admin

Donor Registrations

Random registration status:

approved (70%)

pending (20%)

rejected (10%)

Approved Donors

Create user record

Create donor profile

Random availability

Messages

Create sample donor inquiries

Alerts

Create realistic PH hospital alerts

Notifications

Create alert-based notifications

Create welcome system notifications

6️⃣ Use Transactions Properly

Wrap seed process inside transaction:

await db.execute("BEGIN");
try {
...
await db.execute("COMMIT");
} catch (err) {
await db.execute("ROLLBACK");
}

7️⃣ Ensure Idempotency

Before seeding:

Check if users table already has data

If yes → skip seed

8️⃣ Output After Seeding

Print summary:

Admin count

Registration count

Approved donors

Alerts

Notifications

9️⃣ Provide Final Output

The final output must include:

Complete SQLite schema

turso.ts file

seed.ts file

Instructions to run seed:

npx ts-node scripts/seed.ts

🔐 Important

Do not use:

FastAPI

SQLAlchemy

Alembic

PostgreSQL types

Only:

TypeScript

@libsql/client

SQLite-compatible SQL

If something in the original Python logic cannot be directly translated (like ENUM types), replace with TEXT and enforce allowed values in code.

End of instructions.
