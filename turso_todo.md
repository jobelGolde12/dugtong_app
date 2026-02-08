I want to refactor my project architecture from:

React Native + TypeScript + FastAPI (backend) + PostgreSQL

to:

React Native + TypeScript + Turso (LibSQL) directly (no FastAPI backend).

This means removing FastAPI completely and letting the React Native app interact directly with Turso.

Follow these steps carefully:

1️⃣ Remove Backend Dependency

Remove all API service files that call FastAPI endpoints (axios/fetch base URLs).

Delete or disable:

API base URL constants

API service layers (e.g., donorService.ts calling /api/v1/...)

Remove environment variables related to:

API_BASE_URL

FastAPI server configuration

Ensure the frontend no longer depends on HTTP endpoints.

2️⃣ Install and Configure Turso (LibSQL)

Install Turso client compatible with React Native:

npm install @libsql/client

If necessary, configure polyfills for React Native.

Create a new file:

src/lib/turso.ts

Inside it:

Initialize Turso client using environment variables:

TURSO_DATABASE_URL

TURSO_AUTH_TOKEN

Example structure:

import { createClient } from "@libsql/client";

export const db = createClient({
url: process.env.TURSO_DATABASE_URL!,
authToken: process.env.TURSO_AUTH_TOKEN!,
});

Ensure environment variables are handled safely in React Native (via expo-constants or react-native-config).

3️⃣ Recreate Database Schema in Turso

Convert PostgreSQL schema to SQLite-compatible schema (since Turso uses LibSQL/SQLite).

Remove PostgreSQL-specific types (e.g., SERIAL, UUID extensions).

Replace:

SERIAL → INTEGER PRIMARY KEY AUTOINCREMENT

BOOLEAN → INTEGER (0/1)

ENUM → TEXT with validation

Create SQL migration scripts for:

donors table

registrations table

users (if applicable)

Execute schema creation via Turso CLI or programmatically.

4️⃣ Replace FastAPI CRUD Logic with Direct DB Calls

For each FastAPI endpoint, convert logic into direct Turso queries.

Example transformation:

Old (FastAPI):

POST /api/v1/donors

New (React Native direct DB call):

await db.execute({
sql: "INSERT INTO donors (name, blood_type, phone) VALUES (?, ?, ?)",
args: [name, bloodType, phone],
});

For fetching:

const result = await db.execute("SELECT \* FROM donors");

Create service-layer functions like:

createDonor()

getDonors()

updateDonor()

deleteDonor()

Keep them inside:

src/services/donorService.ts

5️⃣ Implement Validation in Frontend

Since FastAPI validation is removed:

Add validation using:

Zod or Yup

Example:

const donorSchema = z.object({
name: z.string().min(2),
phone: z.string().regex(/^\+639\d{9}$/),
});

Validate before inserting into Turso.

6️⃣ Handle Errors Properly

Replace HTTP error handling with DB-level error handling:

try {
await db.execute(...);
} catch (error) {
console.error("Database error:", error);
}

Ensure user-friendly messages are displayed.

7️⃣ Security Consideration (IMPORTANT)

Explain risks:

Turso auth token will be exposed in the mobile app.

This is only safe if:

Database has restricted permissions

Using row-level security or scoped tokens

This is not sensitive data

If sensitive data exists, recommend keeping a backend.

8️⃣ Remove FastAPI Completely

Remove backend folder

Remove deployment configs (Render)

Remove API documentation references

Update README to reflect new architecture

9️⃣ Final Output

After refactoring:

Show updated folder structure

Show Turso connection file

Show one fully working example (Create + Fetch donor)

Confirm no remaining FastAPI references

End of instructions.
