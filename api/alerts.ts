import { Alert, CreateAlertRequest, GetAlertsResponse } from '../types/alert.types';
import { db, queryRows, querySingle } from '../src/lib/turso';
import { getCurrentUserId } from './auth';

const mapAlertRow = (row: Record<string, any>): Alert => ({
  id: String(row.id),
  title: row.title,
  message: row.message,
  alert_type: row.alert_type,
  priority: row.priority,
  target_audience: row.target_audience ? JSON.parse(row.target_audience) : [],
  location: row.location || undefined,
  schedule_at: row.schedule_at || undefined,
  send_now: Boolean(row.send_now),
  created_by: row.created_by,
  status: row.status,
  sent_at: row.sent_at || undefined,
  created_at: row.created_at,
  updated_at: row.updated_at,
});

const resolveStatus = (sendNow: boolean, scheduleAt?: string): string => {
  if (sendNow) return 'sent';
  if (scheduleAt) return 'scheduled';
  return 'draft';
};

export const alertApi = {
  /**
   * Create a new alert
   */
  createAlert: async (data: CreateAlertRequest): Promise<Alert> => {
    const now = new Date().toISOString();
    const createdBy = String((await getCurrentUserId()) ?? 'system');
    const status = resolveStatus(Boolean(data.send_now), data.schedule_at || undefined);
    const sentAt = data.send_now ? now : null;

    const result = await db.execute(`INSERT INTO alerts (
        title,
        message,
        alert_type,
        priority,
        target_audience,
        location,
        schedule_at,
        send_now,
        created_by,
        status,
        sent_at,
        created_at,
        updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [
        data.title,
        data.message,
        data.alert_type,
        data.priority,
        JSON.stringify(data.target_audience || []),
        data.location || null,
        data.schedule_at || null,
        data.send_now ? 1 : 0,
        createdBy,
        status,
        sentAt,
        now,
        now,
      ]);

    const insertedId = Number(result?.lastInsertRowid ?? 0);
    const row = await querySingle<Record<string, any>>(
      'SELECT * FROM alerts WHERE id = ?',
      [insertedId],
    );

    if (!row) {
      throw new Error('Failed to create alert.');
    }

    return mapAlertRow(row);
  },

  /**
   * Get filtered alerts
   */
  getAlerts: async (params?: { page?: number; page_size?: number }): Promise<GetAlertsResponse> => {
    const pageSize = params?.page_size ?? 50;
    const page = params?.page ?? 0;
    const offset = Math.max(0, page) * pageSize;

    const rows = await queryRows<Record<string, any>>(
      'SELECT * FROM alerts ORDER BY created_at DESC LIMIT ? OFFSET ?',
      [pageSize, offset],
    );

    const totalRow = await querySingle<{ count: number }>(
      'SELECT COUNT(*) as count FROM alerts',
    );

    return {
      items: rows.map(mapAlertRow),
      total: Number(totalRow?.count ?? rows.length),
      page,
      page_size: pageSize,
    };
  },

  /**
   * Get single alert
   */
  getAlert: async (id: string): Promise<Alert> => {
    const row = await querySingle<Record<string, any>>(
      'SELECT * FROM alerts WHERE id = ?',
      [id],
    );

    if (!row) {
      throw new Error('Alert not found.');
    }

    return mapAlertRow(row);
  },

  /**
   * Manually trigger alert send (if not sent immediately)
   */
  sendAlert: async (id: string): Promise<Alert> => {
    const now = new Date().toISOString();

    await db.execute('UPDATE alerts SET status = ?, sent_at = ?, updated_at = ? WHERE id = ?', ['sent', now, now, id]);

    return alertApi.getAlert(id);
  }
};
