OBJECTIVE:
Fix "Database connection failed" in standalone APK by correctly configuring
EAS environment variables and removing unsafe fallbacks.

The app:

- Works in development
- Fails only in standalone APK
- Uses Turso (libsql)
- Uses EXPO_PUBLIC_TURSO_DATABASE_URL
- Uses EXPO_PUBLIC_TURSO_AUTH_TOKEN

We must guarantee that environment variables are properly embedded in the APK build.

==================================================
PHASE 1 — REMOVE FALLBACK VALUES (FAIL FAST)
==================================================

Open: src/lib/turso.ts

REPLACE any fallback logic like:

const TURSO_DATABASE_URL =
process.env.EXPO_PUBLIC_TURSO_DATABASE_URL || "hardcoded";

WITH strict validation:

---

const TURSO_DATABASE_URL = process.env.EXPO_PUBLIC_TURSO_DATABASE_URL;
const TURSO_AUTH_TOKEN = process.env.EXPO_PUBLIC_TURSO_AUTH_TOKEN;

if (!TURSO_DATABASE_URL || !TURSO_AUTH_TOKEN) {
throw new Error(
"Turso environment variables missing in standalone build"
);
}

---

No fallback allowed.
No silent masking.
Fail loudly if env missing.

==================================================
PHASE 2 — CONFIGURE eas.json PROPERLY
==================================================

Open eas.json.

Inside build.preview add:

---

{
"build": {
"preview": {
"env": {
"EXPO_PUBLIC_TURSO_DATABASE_URL": "libsql://your-db.turso.io",
"EXPO_PUBLIC_TURSO_AUTH_TOKEN": "your_real_token_here"
}
}
}
}

---

If production profile exists, add env there too.

DO NOT use eas secret for EXPO_PUBLIC variables.
Use env field only.

==================================================
PHASE 3 — VERIFY VARIABLES AT RUNTIME
==================================================

In src/lib/turso.ts, add logging at startup:

---

console.log("TURSO URL:", TURSO_DATABASE_URL);
console.log("TURSO TOKEN PREFIX:", TURSO_AUTH_TOKEN?.slice(0, 8));

---

==================================================
PHASE 4 — FORCE CLEAN BUILD
==================================================

Run:

eas build -p android --profile preview --clear-cache

Important:
--clear-cache is mandatory.

==================================================
PHASE 5 — TEST IN REAL APK
==================================================

1. Install APK on physical device
2. Open app
3. Attempt:
   - Login
   - Register
4. Capture logs:

adb logcat | grep -i "TURSO\|environment\|missing"

==================================================
EXPECTED SUCCESS
==================================================

In standalone logs we must see:

TURSO URL: libsql://...
TURSO TOKEN PREFIX: abc12345
Running in: standalone
RAW TURSO RESPONSE: ...

If URL or token prints undefined:
→ eas.json env configuration is incorrect.

==================================================
FINAL CONDITION
==================================================

The app must:

- Successfully connect to Turso
- Register users without error
- Login users successfully
- Insert donor records
- Use Turso cloud database only
- Have zero masked errors

No fallback.
No local DB.
No development-only behavior.
Standalone must behave identical to development.

Return logs if any error persists.
