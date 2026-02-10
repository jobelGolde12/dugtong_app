// Script to check existing users and their roles in the database
import { querySingle } from './src/lib/turso.js';

async function checkUsers() {
  try {
    console.log('Checking existing users in database...');
    
    // Get all users
    const users = await querySingle('SELECT id, full_name, contact_number, role FROM users LIMIT 10');
    
    if (!users || Object.keys(users).length === 0) {
      console.log('No users found in database');
      return;
    }
    
    console.log('Users found:');
    console.log('ID | Name | Contact | Role');
    console.log('---|------|---------|-----');
    
    // Since querySingle returns one row, we need to query differently
    const allUsers = await querySingle('SELECT COUNT(*) as count FROM users');
    console.log(`Total users: ${allUsers.count}`);
    
    // Get first few users
    const sampleUsers = await querySingle('SELECT * FROM users ORDER BY id DESC LIMIT 5');
    console.log('Sample users:', sampleUsers);
    
  } catch (error) {
    console.error('Error checking users:', error);
  }
}

checkUsers();