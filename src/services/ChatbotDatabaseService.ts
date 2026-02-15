import { Platform } from 'react-native';
import * as SQLite from 'expo-sqlite';
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
  private isOnline: boolean = false;
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
        metadata TEXT DEFAULT '{}'
      );

      CREATE INDEX IF NOT EXISTS idx_user_session ON chatbot_messages(user_id, session_id);
      CREATE INDEX IF NOT EXISTS idx_user_timestamp ON chatbot_messages(user_id, timestamp DESC);
    `);
  }

  private setupNetworkListener(): void {
    NetInfo.addEventListener(state => {
      this.isOnline = state.isConnected ?? false;
    });
  }

  async getOrCreateSession(userId: string): Promise<ChatbotSession> {
    await this.ensureReady();
    
    const activeSession = await this.getActiveSessionLocal(userId);
    if (activeSession) {
      return activeSession;
    }

    const session: ChatbotSession = {
      id: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      user_id: userId,
      device_id: await this.getDeviceId(),
      started_at: new Date().toISOString(),
      last_activity: new Date().toISOString(),
      status: 'active',
      metadata: {},
    };

    await this.storeSessionLocal(session);
    return session;
  }

  private async getActiveSessionLocal(userId: string): Promise<ChatbotSession | null> {
    if (!this.localDb) return null;

    const result = await this.localDb.getFirstAsync<any>(
      `SELECT * FROM chatbot_sessions WHERE user_id = ? AND status = 'active' ORDER BY last_activity DESC LIMIT 1`,
      [userId]
    );

    if (!result) return null;

    return {
      id: result.id,
      user_id: result.user_id,
      device_id: result.device_id,
      started_at: result.started_at,
      last_activity: result.last_activity,
      status: result.status,
      metadata: result.metadata ? JSON.parse(result.metadata) : {},
    };
  }

  private async storeSessionLocal(session: ChatbotSession): Promise<void> {
    if (!this.localDb) return;

    await this.localDb.runAsync(
      `INSERT OR REPLACE INTO chatbot_sessions (id, user_id, device_id, started_at, last_activity, status, metadata)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        session.id,
        session.user_id,
        session.device_id || null,
        session.started_at,
        session.last_activity,
        session.status,
        JSON.stringify(session.metadata || {}),
      ]
    );
  }

  private async updateSessionActivity(sessionId: string): Promise<void> {
    if (!this.localDb) return;

    await this.localDb.runAsync(
      `UPDATE chatbot_sessions SET last_activity = ? WHERE id = ?`,
      [new Date().toISOString(), sessionId]
    );
  }

  async storeMessage(message: ChatbotMessage): Promise<void> {
    await this.ensureReady();
    await this.storeMessageLocal(message);
    await this.updateSessionActivity(message.session_id);
  }

  private async storeMessageLocal(message: ChatbotMessage): Promise<void> {
    if (!this.localDb) return;

    await this.localDb.runAsync(
      `INSERT OR REPLACE INTO chatbot_messages (id, session_id, user_id, message_type, content, timestamp, metadata)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        message.id,
        message.session_id,
        message.user_id,
        message.message_type,
        message.content,
        message.timestamp,
        JSON.stringify(message.metadata || {}),
      ]
    );
  }

  async getConversationHistory(userId: string, limit: number = 50): Promise<ChatbotMessage[]> {
    await this.ensureReady();
    return this.getMessagesLocal(userId, limit);
  }

  private async getMessagesLocal(userId: string, limit: number): Promise<ChatbotMessage[]> {
    if (!this.localDb) return [];

    const results = await this.localDb.getAllAsync<any>(
      `SELECT * FROM chatbot_messages WHERE user_id = ? ORDER BY timestamp DESC LIMIT ?`,
      [userId, limit]
    );

    return results.map(row => ({
      id: row.id,
      session_id: row.session_id,
      user_id: row.user_id,
      message_type: row.message_type,
      content: row.content,
      timestamp: row.timestamp,
      metadata: row.metadata ? JSON.parse(row.metadata) : {},
    })).reverse();
  }

  private async getDeviceId(): Promise<string> {
    const key = '@chatbot_device_id';
    let deviceId = await AsyncStorage.getItem(key);
    
    if (!deviceId) {
      deviceId = `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      await AsyncStorage.setItem(key, deviceId);
    }
    
    return deviceId;
  }

  async isConnected(): Promise<boolean> {
    const state = await NetInfo.fetch();
    return state.isConnected ?? false;
  }

  async clearConversation(userId: string): Promise<void> {
    await this.ensureReady();
    
    if (!this.localDb) return;

    await this.localDb.runAsync(
      `DELETE FROM chatbot_messages WHERE user_id = ?`,
      [userId]
    );

    await this.localDb.runAsync(
      `UPDATE chatbot_sessions SET status = 'archived' WHERE user_id = ? AND status = 'active'`,
      [userId]
    );
  }
}

export default new ChatbotDatabaseService();
