import { createClient } from "@libsql/client/node";
import { readFileSync } from "node:fs";

// Load environment variables
const loadDotEnv = () => {
  try {
    const envText = readFileSync(".env", "utf8");
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
    console.log("No .env file found; using existing environment variables.");
  }
};

loadDotEnv();

const databaseUrl = process.env.EXPO_PUBLIC_TURSO_DATABASE_URL || process.env.TURSO_DATABASE_URL;
const authToken = process.env.EXPO_PUBLIC_TURSO_AUTH_TOKEN || process.env.TURSO_AUTH_TOKEN;

if (!databaseUrl) {
  console.error("Missing EXPO_PUBLIC_TURSO_DATABASE_URL or TURSO_DATABASE_URL");
  process.exit(1);
}

const db = createClient({
  url: databaseUrl,
  authToken: authToken || undefined,
});

async function createTestUsers() {
  try {
    console.log('🔑 Creating test users for RBAC testing...');
    
    const testUsers = [
      {
        full_name: 'John Donor',
        contact_number: '09123456789',
        role: 'donor'
      },
      {
        full_name: 'Dr. Sarah Hospital',
        contact_number: '09223456789', 
        role: 'hospital_staff'
      },
      {
        full_name: 'Officer Mike Health',
        contact_number: '09323456789',
        role: 'health_officer'
      },
      {
        full_name: 'Admin User',
        contact_number: '09423456789',
        role: 'admin'
      }
    ];

    for (const user of testUsers) {
      // Check if user already exists
      const existing = await db.execute({
        sql: 'SELECT id, full_name, contact_number, role FROM users WHERE contact_number = ?',
        args: [user.contact_number]
      });

      if (existing.rows.length === 0) {
        // Create new user
        const result = await db.execute({
          sql: 'INSERT INTO users (full_name, contact_number, role, created_at, updated_at) VALUES (?, ?, ?, datetime("now"), datetime("now"))',
          args: [user.full_name, user.contact_number, user.role]
        });
        
        console.log(`✅ Created user: ${user.full_name} (${user.role})`);
        console.log(`   Contact: ${user.contact_number}`);
        console.log(`   ID: ${result.lastInsertRowid}`);
      } else {
        // Update existing user role
        const existingUser = existing.rows[0];
        if (existingUser.role !== user.role) {
          await db.execute({
            sql: 'UPDATE users SET role = ?, full_name = ?, updated_at = datetime("now") WHERE contact_number = ?',
            args: [user.role, user.full_name, user.contact_number]
          });
          console.log(`🔄 Updated user: ${existingUser.full_name} → ${user.full_name} (${existingUser.role} → ${user.role})`);
        } else {
          console.log(`✅ User already exists: ${existingUser.full_name} (${existingUser.role})`);
        }
      }
    }

    console.log('\n🎯 Test users ready! You can now login with:');
    console.log('🩸 Donor: John Donor / 09123456789');
    console.log('🏥 Hospital Staff: Dr. Sarah Hospital / 09223456789');  
    console.log('🏢 Health Officer: Officer Mike Health / 09323456789');
    console.log('🛠 Admin: Admin User / 09423456789');
    
  } catch (error) {
    console.error('❌ Error creating test users:', error);
  }
}

createTestUsers().then(() => {
  console.log('✅ Test user creation complete!');
  process.exit(0);
}).catch((error) => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});