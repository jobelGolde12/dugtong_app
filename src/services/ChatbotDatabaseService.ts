import { Platform } from 'react-native';
import * as SQLite from 'expo-sqlite';
type TursoClient = ReturnType<import('@libsql/client').createClient>;
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';

// Types
export interface ChatbotMessage {
  id: string;
  session_id: string;
  user_id: string;
  message_type: 'user' | 'bot' | 'system';
  content: string;
  timestamp: string;
  is_synced: boolean;
  metadata?: Record<string, any>;
}

export interface ChatbotSession {
  id: string;
  user_id: string;
  device_id?: string;
  started_at: string;
  last_activity: string;
  status: 'active' | 'completed' | 'archived';
  metadata?: Record<string, any>;
}

class ChatbotDatabaseService {
  private localDb: SQLite.SQLiteDatabase | null = null;
  private tursoClient: TursoClient | null = null;
  private isOnline: boolean = false;
  private readonly SYNC_QUEUE_KEY = '@chatbot_sync_queue';
  private initPromise: Promise<void>;

  constructor() {
    this.initPromise = this.initializeDatabase();
    this.setupNetworkListener();
  }

  private async ensureReady(): Promise<void> {
    await this.initPromise;
  }

  private async initializeDatabase(): Promise<void> {
    // Initialize local SQLite for offline storage
    this.localDb = await SQLite.openDatabaseAsync('chatbot.db');

    // Create tables if they don't exist
    await this.localDb.execAsync(`
      CREATE TABLE IF NOT EXISTS chatbot_sessions (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        device_id TEXT,
        started_at TEXT DEFAULT CURRENT_TIMESTAMP,
        last_activity TEXT DEFAULT CURRENT_TIMESTAMP,
        status TEXT DEFAULT 'active',
        metadata TEXT DEFAULT '{}'
      );

      CREATE TABLE IF NOT EXISTS chatbot_messages (
        id TEXT PRIMARY KEY,
        session_id TEXT NOT NULL,
        user_id TEXT NOT NULL,
        message_type TEXT NOT NULL,
        content TEXT NOT NULL,
        timestamp TEXT DEFAULT CURRENT_TIMESTAMP,
        is_synced INTEGER DEFAULT 1,
        metadata TEXT DEFAULT '{}'
      );

      CREATE INDEX IF NOT EXISTS idx_user_session ON chatbot_messages(user_id, session_id);
      CREATE INDEX IF NOT EXISTS idx_user_timestamp ON chatbot_messages(user_id, timestamp DESC);
    `);

    // Initialize Turso client for online sync
    this.initializeTursoClient();
  }

  private initializeTursoClient(): void {
    if (Platform.OS !== 'web') {
      console.warn('Turso sync disabled on native platforms.');
      return;
    }

    if (!process.env.EXPO_PUBLIC_TURSO_URL || !process.env.EXPO_PUBLIC_TURSO_AUTH_TOKEN) {
      console.warn('Turso credentials not found. Running in offline mode only.');
      return;
    }

    import('@libsql/client')
      .then(({ createClient }) => {
        this.tursoClient = createClient({
          url: process.env.EXPO_PUBLIC_TURSO_URL,
          authToken: process.env.EXPO_PUBLIC_TURSO_AUTH_TOKEN,
        });
      })
      .catch(error => {
        console.warn('Failed to initialize Turso client:', error);
      });
  }

  private setupNetworkListener(): void {
    NetInfo.addEventListener(state => {
      this.isOnline = state.isConnected ?? false;

      // Auto-sync when coming back online
      if (this.isOnline) {
        this.syncOfflineMessages();
      }
    });
  }

  // ==================== SESSION MANAGEMENT ====================

  public async getOrCreateSession(userId: string): Promise<string> {
    await this.ensureReady();
    const deviceId = await this.getDeviceId();

    // First, check for existing active session in local DB
    const localSession = await this.getActiveSessionLocal(userId);
    if (localSession) {
      return localSession.id;
    }

    // Create new session
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const newSession: Omit<ChatbotSession, 'started_at' | 'last_activity'> = {
      id: sessionId,
      user_id: userId,
      device_id: deviceId,
      status: 'active',
      metadata: {}
    };

    // Store locally
    await this.storeSessionLocal(newSession);

    // Sync to Turso if online
    if (this.isOnline && this.tursoClient) {
      try {
        await this.tursoClient.execute({
          sql: `
            INSERT INTO chatbot_sessions (id, user_id, device_id, status, metadata)
            VALUES (:id, :user_id, :device_id, :status, :metadata)
          `,
          args: newSession
        });
      } catch (error) {
        console.error('Failed to sync session to Turso:', error);
        this.addToSyncQueue('session', newSession);
      }
    }

    return sessionId;
  }

  private async getActiveSessionLocal(userId: string): Promise<ChatbotSession | null> {
    try {
      await this.ensureReady();
      const result = await this.localDb!.getAllAsync(`
        SELECT * FROM chatbot_sessions
        WHERE user_id = ? AND status = 'active'
        ORDER BY last_activity DESC
        LIMIT 1
      `, [userId]);

      return result.length > 0 ? result[0] as ChatbotSession : null;
    } catch (error) {
      console.error('Error getting local session:', error);
      return null;
    }
  }

  private async storeSessionLocal(session: Omit<ChatbotSession, 'started_at' | 'last_activity'>): Promise<void> {
    await this.ensureReady();
    await this.localDb!.runAsync(
      `INSERT INTO chatbot_sessions (id, user_id, device_id, status, metadata)
       VALUES (?, ?, ?, ?, ?)`,
      [
        session.id,
        session.user_id,
        session.device_id || null,
        session.status,
        JSON.stringify(session.metadata)
      ]
    );
  }

  private async updateSessionActivity(sessionId: string): Promise<void> {
    await this.ensureReady();
    await this.localDb!.runAsync(
      `UPDATE chatbot_sessions SET last_activity = CURRENT_TIMESTAMP WHERE id = ?`,
      [sessionId]
    );
  }

  // ==================== MESSAGE STORAGE ====================

  public async storeMessage(
    sessionId: string,
    userId: string,
    messageType: 'user' | 'bot' | 'system',
    content: string,
    metadata?: Record<string, any>
  ): Promise<string> {
    const messageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const timestamp = new Date().toISOString();
    const isSynced = this.isOnline ? 1 : 0;

    const message: Omit<ChatbotMessage, 'timestamp'> = {
      id: messageId,
      session_id: sessionId,
      user_id: userId,
      message_type: messageType,
      content,
      is_synced: isSynced,
      metadata: metadata || {}
    };

    // Store locally
    await this.storeMessageLocal(message, timestamp);

    // Update session last activity
    await this.updateSessionActivity(sessionId);

    // Sync to Turso if online
    if (this.isOnline && this.tursoClient) {
      await this.syncMessageToTurso({ ...message, timestamp });
    } else {
      // Queue for later sync
      this.addToSyncQueue('message', { ...message, timestamp });
    }

    return messageId;
  }

  private async storeMessageLocal(
    message: Omit<ChatbotMessage, 'timestamp'>,
    timestamp: string
  ): Promise<void> {
    await this.ensureReady();
    await this.localDb!.runAsync(
      `INSERT INTO chatbot_messages (id, session_id, user_id, message_type, content, timestamp, is_synced, metadata)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        message.id,
        message.session_id,
        message.user_id,
        message.message_type,
        message.content,
        timestamp,
        message.is_synced,
        JSON.stringify(message.metadata)
      ]
    );
  }

  // ==================== CONVERSATION FETCHING ====================

  public async getConversationHistory(
    userId: string,
    limit: number = 50
  ): Promise<ChatbotMessage[]> {
    await this.ensureReady();
    let messages: ChatbotMessage[] = [];

    // Always try to get from local DB first for immediate response
    messages = await this.getMessagesLocal(userId, limit);

    // If online, fetch from Turso for the most up-to-date data
    if (this.isOnline && this.tursoClient) {
      try {
        const tursoMessages = await this.getMessagesFromTurso(userId, limit);

        // Merge and deduplicate (Turso as source of truth)
        const mergedMessages = this.mergeMessages(messages, tursoMessages);

        // Update local cache with Turso data
        await this.updateLocalMessages(mergedMessages);

        return mergedMessages;
      } catch (error) {
        console.error('Failed to fetch from Turso, using local data:', error);
        // Return local data as fallback
      }
    }

    return messages;
  }

  private async getMessagesLocal(userId: string, limit: number): Promise<ChatbotMessage[]> {
    try {
      await this.ensureReady();
      const result = await this.localDb!.getAllAsync(
        `SELECT * FROM chatbot_messages
         WHERE user_id = ?
         ORDER BY timestamp DESC
         LIMIT ?`,
        [userId, limit]
      );

      return result.map(msg => ({
        ...msg,
        metadata: msg.metadata ? JSON.parse(msg.metadata as string) : {}
      })) as ChatbotMessage[];
    } catch (error) {
      console.error('Error fetching local messages:', error);
      return [];
    }
  }

  private async getMessagesFromTurso(userId: string, limit: number): Promise<ChatbotMessage[]> {
    if (!this.tursoClient) return [];

    try {
      const result = await this.tursoClient.execute({
        sql: `
          SELECT * FROM chatbot_messages
          WHERE user_id = ?
          ORDER BY timestamp DESC
          LIMIT ?
        `,
        args: [userId, limit]
      });

      return result.rows.map(row => ({
        id: row.id as string,
        session_id: row.session_id as string,
        user_id: row.user_id as string,
        message_type: row.message_type as 'user' | 'bot' | 'system',
        content: row.content as string,
        timestamp: row.timestamp as string,
        is_synced: row.is_synced as boolean,
        metadata: row.metadata ? JSON.parse(row.metadata as string) : {}
      }));
    } catch (error) {
      console.error('Error fetching messages from Turso:', error);
      throw error;
    }
  }

  private mergeMessages(localMessages: ChatbotMessage[], tursoMessages: ChatbotMessage[]): ChatbotMessage[] {
    // Create a map of Turso messages by ID for quick lookup
    const tursoMap = new Map(tursoMessages.map(msg => [msg.id, msg]));

    // Create a map of local messages by ID
    const localMap = new Map(localMessages.map(msg => [msg.id, msg]));

    // Combine all unique messages, prioritizing Turso data when available
    const combinedMap = new Map();

    // Add all Turso messages
    tursoMessages.forEach(msg => combinedMap.set(msg.id, msg));

    // Add local-only messages
    localMessages.forEach(msg => {
      if (!combinedMap.has(msg.id)) {
        combinedMap.set(msg.id, msg);
      }
    });

    // Convert back to array and sort by timestamp
    return Array.from(combinedMap.values()).sort((a, b) =>
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
  }

  private async updateLocalMessages(messages: ChatbotMessage[]): Promise<void> {
    await this.ensureReady();
    if (!this.localDb) return;

    // Clear existing local messages for this user
    await this.localDb.runAsync(
      `DELETE FROM chatbot_messages WHERE user_id = ?`,
      [messages[0]?.user_id || '']
    );

    // Insert updated messages
    for (const message of messages) {
      await this.storeMessageLocal(
        {
          id: message.id,
          session_id: message.session_id,
          user_id: message.user_id,
          message_type: message.message_type,
          content: message.content,
          is_synced: 1, // Mark as synced since it came from Turso
          metadata: message.metadata
        },
        message.timestamp
      );
    }
  }

  // ==================== OFFLINE SYNC LOGIC ====================

  private async syncOfflineMessages(): Promise<void> {
    if (!this.isOnline || !this.tursoClient) return;

    try {
      // Get unsynced messages from local DB
      await this.ensureReady();
      const unsyncedMessages = await this.localDb!.getAllAsync(
        `SELECT * FROM chatbot_messages WHERE is_synced = 0`
      ) as ChatbotMessage[];

      // Sync each message to Turso
      for (const message of unsyncedMessages) {
        await this.syncMessageToTurso(message);

        // Mark as synced in local DB
        await this.localDb!.runAsync(
          `UPDATE chatbot_messages SET is_synced = 1 WHERE id = ?`,
          [message.id]
        );
      }

      // Process sync queue from AsyncStorage
      await this.processSyncQueue();
    } catch (error) {
      console.error('Sync failed:', error);
    }
  }

  private async syncMessageToTurso(message: ChatbotMessage): Promise<void> {
    if (!this.tursoClient) return;

    await this.tursoClient.execute({
      sql: `
        INSERT INTO chatbot_messages (id, session_id, user_id, message_type, content, timestamp, is_synced, metadata)
        VALUES (:id, :session_id, :user_id, :message_type, :content, :timestamp, 1, :metadata)
        ON CONFLICT(id) DO UPDATE SET
            content = excluded.content,
            metadata = excluded.metadata,
            is_synced = 1
      `,
      args: {
        id: message.id,
        session_id: message.session_id,
        user_id: message.user_id,
        message_type: message.message_type,
        content: message.content,
        timestamp: message.timestamp,
        metadata: JSON.stringify(message.metadata || {})
      }
    });
  }

  // ==================== UTILITY METHODS ====================

  private async getDeviceId(): Promise<string> {
    let deviceId = await AsyncStorage.getItem('@device_id');
    if (!deviceId) {
      deviceId = `device_${Platform.OS}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      await AsyncStorage.setItem('@device_id', deviceId);
    }
    return deviceId;
  }

  private async addToSyncQueue(type: 'message' | 'session', data: any): Promise<void> {
    const queue = JSON.parse(await AsyncStorage.getItem(this.SYNC_QUEUE_KEY) || '[]');
    queue.push({ type, data, timestamp: Date.now() });
    await AsyncStorage.setItem(this.SYNC_QUEUE_KEY, JSON.stringify(queue));
  }

  private async processSyncQueue(): Promise<void> {
    const queue = JSON.parse(await AsyncStorage.getItem(this.SYNC_QUEUE_KEY) || '[]');

    for (const item of queue) {
      try {
        if (item.type === 'message' && this.tursoClient) {
          await this.syncMessageToTurso(item.data);
        } else if (item.type === 'session' && this.tursoClient) {
          await this.tursoClient.execute({
            sql: `INSERT INTO chatbot_sessions (id, user_id, device_id, status, metadata)
                  VALUES (:id, :user_id, :device_id, :status, :metadata)`,
            args: item.data
          });
        }
      } catch (error) {
        console.error('Failed to sync queued item:', error);
        // Keep in queue for next retry
        continue;
      }
    }

    // Clear processed items
    await AsyncStorage.setItem(this.SYNC_QUEUE_KEY, JSON.stringify([]));
  }

  public isConnected(): boolean {
    return this.isOnline;
  }

  public async clearConversation(userId: string): Promise<void> {
    await this.ensureReady();
    if (!this.localDb) return;

    await this.localDb.runAsync(
      `DELETE FROM chatbot_messages WHERE user_id = ?`,
      [userId]
    );

    const queue = JSON.parse(await AsyncStorage.getItem(this.SYNC_QUEUE_KEY) || '[]');
    const filteredQueue = queue.filter((item: any) => !(item.type === 'message' && item.data?.user_id === userId));
    if (filteredQueue.length !== queue.length) {
      await AsyncStorage.setItem(this.SYNC_QUEUE_KEY, JSON.stringify(filteredQueue));
    }

    if (this.isOnline && this.tursoClient) {
      try {
        await this.tursoClient.execute({
          sql: `DELETE FROM chatbot_messages WHERE user_id = ?`,
          args: [userId]
        });
      } catch (error) {
        console.error('Failed to clear Turso conversation:', error);
      }
    }
  }

}

// Singleton instance
export const chatbotDB = new ChatbotDatabaseService();
