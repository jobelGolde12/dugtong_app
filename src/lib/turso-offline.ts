import { db } from './turso';
import { offlineService } from '../services/OfflineService';

let isOnline = true;

export const setOnlineStatus = (status: boolean) => {
  isOnline = status;
};

export const executeWithOfflineSupport = async (
  sql: string,
  args?: any[],
  table?: string
): Promise<any> => {
  if (isOnline) {
    return await db.execute({ sql, args: args || [] });
  } else {
    await offlineService.addToQueue({
      operation: 'QUERY',
      table: table || 'unknown',
      data: { sql, args },
    });
    return { rows: [], lastInsertRowid: null };
  }
};

export const syncOfflineQueue = async (): Promise<void> => {
  const queue = await offlineService.getQueue();
  
  for (const operation of queue) {
    try {
      if (operation.data.sql) {
        await db.execute({
          sql: operation.data.sql,
          args: operation.data.args || [],
        });
      }
      await offlineService.removeFromQueue(operation.id);
    } catch (error) {
      console.error('Sync error:', error);
    }
  }
};
