// Turso database service - using API-based approach to avoid build issues
import { getDatabase, testTursoConnection, rawTursoTest, queryRows, querySingle, normalizeRows } from './database-api';

// Export the database instance and functions
export let db: any = null;

// Initialize the database when this module is imported
getDatabase()
  .then(database => {
    db = database;
    console.log("✅ Database module loaded successfully");
  })
  .catch(error => {
    console.error("❌ Failed to load database module:", error);
    // Note: We don't throw here to avoid breaking the module loading process
    // The actual error will be caught when database functions are used
  });

// Export other functions
export { testTursoConnection, rawTursoTest, queryRows, querySingle, normalizeRows };


