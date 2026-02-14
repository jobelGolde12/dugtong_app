// Alternative database service using REST API instead of direct @libsql/client
// This approach avoids build issues with native dependencies

interface DatabaseClient {
  execute: (sql: string, params?: any[]) => Promise<any>;
  close: () => void;
}

// Cache for the database instance
let _dbInstance: DatabaseClient | null = null;

/**
 * Create a database client that communicates with Turso via HTTP API
 */
async function createTursoApiClient(): Promise<DatabaseClient> {
  const dbUrl = process.env.EXPO_PUBLIC_TURSO_DATABASE_URL;
  const authToken = process.env.EXPO_PUBLIC_TURSO_AUTH_TOKEN;

  if (!dbUrl || !authToken) {
    console.error("❌ Turso environment variables missing:");
    console.error("- TURSO_DATABASE_URL:", !!dbUrl);
    console.error("- TURSO_AUTH_TOKEN:", !!authToken);
    throw new Error("Turso environment variables missing in standalone build");
  }

  console.log("📡 Initializing Turso API client...");
  console.log("📍 Database URL:", dbUrl);
  console.log("🔑 Token prefix:", authToken.substring(0, 8) + "...");

  // Convert libsql:// to https:// for API access
  const apiUrl = dbUrl.replace('libsql://', 'https://');

  return {
    execute: async (sql: string, params: any[] = []) => {
      console.log(`🔍 Executing SQL via API: ${sql.substring(0, 50)}${sql.length > 50 ? '...' : ''}`);

      try {
        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            statements: [{
              qid: null,
              sql: sql,
              args: params || []
            }]
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error(`❌ API request failed with status ${response.status}:`, errorText);
          throw new Error(`Turso API request failed: ${response.status} - ${errorText}`);
        }

        const result = await response.json();
        console.log("✅ API request successful, received result");
        
        // Format the result to match what the application expects
        return {
          columns: result.results?.[0]?.columns || [],
          rows: result.results?.[0]?.rows || [],
          rowsAffected: result.results?.[0]?.affectedRowCount || 0,
          lastInsertRowid: result.results?.[0]?.lastInsertId || null
        };
      } catch (error) {
        console.error("❌ API request error:", error);
        throw error;
      }
    },

    close: () => {
      console.log("🔒 Turso API client closed");
      // Nothing to close for HTTP client
    }
  };
}

/**
 * Get the database instance, initializing it if needed
 */
export async function getDatabase(): Promise<DatabaseClient> {
  if (_dbInstance) {
    return _dbInstance;
  }

  try {
    _dbInstance = await createTursoApiClient();
    return _dbInstance;
  } catch (error) {
    console.error("❌ Failed to initialize Turso API client:", error);
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