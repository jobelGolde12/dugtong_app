import { getDatabase } from './turso';

// For remote database, we always execute directly
export const executeWithOfflineSupport = async (
  sql: string,
  args?: any[],
  table?: string
): Promise<any> => {
  try {
    const db = await getDatabase();
    // Note: The new API-based client uses execute(sql, params) instead of execute({sql, args})
    return await db.execute(sql, args || []);
  } catch (error: any) {
    console.error("FULL TURSO ERROR:", JSON.stringify(error));
    console.error("STACK:", error?.stack);
    throw error;
  }
};

// Placeholder functions for compatibility
export const setOnlineStatus = (status: boolean) => {
  // No-op for remote database
};

export const syncOfflineQueue = async (): Promise<void> => {
  // No-op for remote database
};
