import { db } from '../src/lib/turso';

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

createTestUsers();