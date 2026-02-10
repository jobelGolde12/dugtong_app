You are a Senior React Native + TypeScript + Expo Developer.

Your task is to enhance the existing project by implementing Role-Based Access Control (RBAC) and role-specific navigation flows, based on the specifications below.

🎯 CORE OBJECTIVE

The project currently supports ADMIN only.

You must add support for additional user roles while preserving all existing code, UI, and behavior that is not directly related to this task.

⚠️ STRICT RULES

❌ DO NOT remove existing code

❌ DO NOT modify UI/design not related to role access

❌ DO NOT refactor unrelated logic

✅ ONLY add what is necessary to support roles and flows

✅ Use existing pages wherever possible

✅ Create new pages ONLY if explicitly required

👥 USER ROLES TO SUPPORT
Existing

admin ✅ (already implemented)

Add These Roles

donor

hospital_staff

health_officer

🗄 DATABASE CONTEXT (DO NOT CHANGE EXISTING TABLE STRUCTURE)

Current table:

CREATE TABLE users (
id INTEGER PRIMARY KEY AUTOINCREMENT,
full_name TEXT NOT NULL,
contact_number TEXT NOT NULL UNIQUE,
role TEXT DEFAULT 'donor' CHECK(role IN ('admin', 'donor')),
email TEXT,
avatar_url TEXT,
created_at TEXT,
updated_at TEXT
);

Required Enhancement

Extend role handling in the application layer to support:

donor

hospital_staff

health_officer

❗ Do NOT break existing admin or donor logic

❗ Do NOT remove default role behavior (donor)

🔄 ROLE FLOWS & ACCESS RULES
🩸 FLOW 1 — DONOR

Registration → Donor Dashboard (NEW PAGE)

Donor Dashboard must include:

View Donor Information

Leave Message to Admin

Delete Donor Data

📌 Notes:

Donor Dashboard does NOT exist yet → create this screen

All other donor-related pages already exist → reuse them

Donor is the default role

🛠 FLOW 2 — ADMIN (ALREADY EXISTS)

Admin Dashboard includes:

View Reports

Find Donors

Manage Donors

Access Donors Bot (AI)

Send Notifications

Settings

📌 Notes:

Do NOT change admin UI or logic

Only ensure access is properly restricted to admin

🏥 FLOW 3 — HOSPITAL STAFF

Hospital Staff Login → Hospital Dashboard

Hospital Dashboard features:

Search Donors

View Donor Profiles

Send Blood Request Notifications

Update Request Status

📌 Notes:

Pages already exist → map access via role

Hospital Staff must NOT access admin or donor dashboards

🏢 FLOW 4 — HEALTH OFFICER

Health Officer Login → Health Officer Dashboard

Health Officer Dashboard features:

View Donor List by Municipality

Monitor Donor Availability

Send Notifications to Donors

Generate Simple Reports

📌 Notes:

Pages already exist → role-gate access

No admin privileges

🧭 NAVIGATION & ACCESS CONTROL REQUIREMENTS

Implement role-based routing/navigation

After login, redirect users based on their role

Block unauthorized screen access

Handle fallback/unauthorized states safely

Keep navigation logic clean and minimal

🧩 TECHNICAL EXPECTATIONS

React Native + TypeScript + Expo compatible

Centralized role handling (context / hook / guard)

Clear role constants or enums

No breaking changes

No unnecessary refactors

✅ FINAL DELIVERABLES

Role-based navigation logic

Donor Dashboard screen (new)

Access control per role

Clean, minimal, scoped changes only

💡 If a feature or page already exists, reuse it.
If it doesn’t exist (Donor Dashboard), create it.
Nothing else should change.
