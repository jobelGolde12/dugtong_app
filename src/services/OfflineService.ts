import AsyncStorage from '@react-native-async-storage/async-storage';

const generateId = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

export interface OfflineOperation {
  id: string;
  operation: 'CREATE' | 'UPDATE' | 'DELETE' | 'QUERY';
  table: string;
  data: any;
  timestamp: string;
  retries: number;
  status: 'pending' | 'failed' | 'syncing';
}

const QUEUE_KEY = 'offline_queue';
const CACHE_KEY = 'offline_cache';

class OfflineService {
  async addToQueue(operation: Omit<OfflineOperation, 'id' | 'timestamp' | 'retries' | 'status'>): Promise<void> {
    const queue = await this.getQueue();
    queue.push({
      ...operation,
      id: generateId(),
      timestamp: new Date().toISOString(),
      retries: 0,
      status: 'pending',
    });
    await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
  }

  async getQueue(): Promise<OfflineOperation[]> {
    const data = await AsyncStorage.getItem(QUEUE_KEY);
    return data ? JSON.parse(data) : [];
  }

  async clearQueue(): Promise<void> {
    await AsyncStorage.removeItem(QUEUE_KEY);
  }

  async removeFromQueue(id: string): Promise<void> {
    const queue = await this.getQueue();
    const filtered = queue.filter((op) => op.id !== id);
    await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(filtered));
  }

  async cacheData(key: string, data: any): Promise<void> {
    const cache = await this.getCache();
    cache[key] = data;
    await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  }

  async getCachedData(key: string): Promise<any> {
    const cache = await this.getCache();
    return cache[key];
  }

  async getCache(): Promise<Record<string, any>> {
    const data = await AsyncStorage.getItem(CACHE_KEY);
    return data ? JSON.parse(data) : {};
  }

  async getPendingCount(): Promise<number> {
    const queue = await this.getQueue();
    return queue.filter((op) => op.status === 'pending').length;
  }
}

export const offlineService = new OfflineService();
