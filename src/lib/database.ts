// Database service with build-compatible Turso integration

interface DatabaseClient {
  execute: (sql: string, params?: any[]) => Promise<any>;
  executeBatch: (statements: string[]) => Promise<any[]>;
  close: () => void;
}

let _dbInstance: DatabaseClient | null = null;
let _initPromise: Promise<DatabaseClient> | null = null;

/**
 * Dynamically import and initialize the Turso client
 */
async function initializeTursoClient(): Promise<DatabaseClient> {
  // Validate environment variables first
  const dbUrl = process.env.EXPO_PUBLIC_TURSO_DATABASE_URL;
  const authToken = process.env.EXPO_PUBLIC_TURSO_AUTH_TOKEN;

  if (!dbUrl || !authToken) {
    console.error("❌ Turso environment variables missing:");
    console.error("- TURSO_DATABASE_URL:", !!dbUrl);
    console.error("- TURSO_AUTH_TOKEN:", !!authToken);
    throw new Error("Turso environment variables missing in standalone build");
  }

  console.log("📡 Initializing Turso client...");
  console.log("📍 Database URL:", dbUrl);
  console.log("🔑 Token prefix:", authToken.substring(0, 8) + "...");

  try {
    // Dynamically import the client to avoid build issues
    const { createClient } = await import("@libsql/client/web");
    
    const client = createClient({
      url: dbUrl,
      authToken: authToken,
      // Ensure fetch is available in React Native context
      fetch: (global as any).fetch || fetch,
    });

    console.log("✅ Turso client initialized successfully");
    
    return {
      execute: async (sql: string, params?: any[]) => {
        console.log(`🔍 Executing SQL: ${sql.substring(0, 50)}${sql.length > 50 ? '...' : ''}`);
        try {
          const result = await client.execute(sql, params);
          console.log("✅ SQL executed successfully");
          return result;
        } catch (error) {
          console.error("❌ SQL execution failed:", error);
          throw error;
        }
      },
      executeBatch: async (statements: string[]) => {
        console.log(`🔄 Executing ${statements.length} statements in batch`);
        try {
          const results = await client.executeBatch(statements);
          console.log("✅ Batch execution completed");
          return results;
        } catch (error) {
          console.error("❌ Batch execution failed:", error);
          throw error;
        }
      },
      close: () => {
        console.log("🔒 Closing Turso client");
        // Client doesn't have a close method in libsql/client, but we'll keep this for interface compatibility
      }
    };
  } catch (error) {
    console.error("❌ Failed to initialize Turso client:", error);
    throw new Error(`Turso client initialization failed: ${error}`);
  }
}

/**
 * Get the database instance, initializing it if needed
 */
export async function getDatabase(): Promise<DatabaseClient> {
  if (_dbInstance) {
    return _dbInstance;
  }

  if (_initPromise) {
    return _initPromise;
  }

  _initPromise = initializeTursoClient();
  
  try {
    _dbInstance = await _initPromise;
    return _dbInstance;
  } catch (error) {
    _initPromise = null; // Reset promise on failure
    throw error;
  }
}

/**
 * Test the database connection
 */
export async function testTursoConnection(): Promise<boolean> {
  try {
    const db = await getDatabase();
    const result = await db.execute("SELECT 1 as test");
    
    console.log("✅ Turso connection test successful:", result);
    return true;
  } catch (error) {
    console.error("❌ Turso connection test failed:", error);
    return false;
  }
}

/**
 * Raw test function for direct API access
 */
export async function rawTursoTest() {
  try {
    const dbUrl = process.env.EXPO_PUBLIC_TURSO_DATABASE_URL;
    const authToken = process.env.EXPO_PUBLIC_TURSO_AUTH_TOKEN;

    if (!dbUrl || !authToken) {
      console.error("❌ Cannot run raw test: environment variables not set");
      return;
    }

    // Convert libsql:// to https:// for the raw fetch request
    const httpsUrl = dbUrl.replace('libsql://', 'https://');
    
    console.log("📡 Performing raw Turso test to:", httpsUrl);
    
    const res = await fetch(httpsUrl, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${authToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        statements: [{
          sql: "SELECT 1 as test"
        }]
      })
    });

    const text = await res.text();
    console.log("📡 Raw Turso Response:", text);

    if (res.ok) {
      console.log("✅ Raw Turso test successful");
    } else {
      console.error("❌ Raw Turso test failed with status:", res.status);
    }
  } catch (err) {
    console.error("❌ Raw Turso test error:", err);
  }
}

/**
 * Normalize rows from query results
 */
export function normalizeRows<T>(result: any): T[] {
  if (!result || !Array.isArray(result.rows)) return [];

  if (result.rows.length === 0) return [];

  const firstRow = result.rows[0];
  if (Array.isArray(firstRow) && Array.isArray(result.columns)) {
    return result.rows.map((row: unknown[]) => {
      const entry: Record<string, unknown> = {};
      result.columns.forEach((column: string, index: number) => {
        entry[column] = row[index];
      });
      return entry as T;
    });
  }

  return result.rows as T[];
}

/**
 * Execute a query and return rows
 */
export async function queryRows<T>(sql: string, args: any[] = []): Promise<T[]> {
  try {
    const db = await getDatabase();
    const result = await db.execute(sql, args);
    return normalizeRows<T>(result);
  } catch (error) {
    console.error(`❌ Query failed: ${sql}`, error);
    throw error;
  }
}

/**
 * Execute a query and return a single row
 */
export async function querySingle<T>(
  sql: string,
  args: any[] = [],
): Promise<T | null> {
  const rows = await queryRows<T>(sql, args);
  return rows[0] ?? null;
}