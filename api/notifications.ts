import { Notification, NotificationFilter } from "../types/notification.types";
import { db, queryRows, querySingle } from "../src/lib/turso";

export { Notification, NotificationFilter };

export interface PaginatedNotifications {
  items: Notification[];
  total: number;
  page: number;
  page_size: number;
  unread_count: number;
}

export interface MarkAsReadRequest {
  notification_ids?: string[];
}

const safeParseJson = (value: string): Record<string, unknown> | undefined => {
  try {
    return JSON.parse(value);
  } catch {
    return undefined;
  }
};

const mapNotificationRow = (row: Record<string, any>): Notification => ({
  id: String(row.id),
  title: row.title,
  message: row.message,
  type: row.type,
  is_read: Boolean(row.is_read),
  created_at: row.created_at,
  data: row.data ? safeParseJson(row.data) : undefined,
});

const buildFilters = (filters: NotificationFilter = {}) => {
  const conditions: string[] = [];
  const args: unknown[] = [];

  if (filters.type) {
    conditions.push("type = ?");
    args.push(filters.type);
  }
  if (filters.is_read !== undefined) {
    conditions.push("is_read = ?");
    args.push(filters.is_read ? 1 : 0);
  }
  if (filters.search_query) {
    conditions.push("(title LIKE ? OR message LIKE ?)");
    const search = `%${filters.search_query}%`;
    args.push(search, search);
  }

  const whereClause = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

  return { whereClause, args };
};

// ==================== DB Endpoints ====================

/**
 * Get list of notifications for current user
 */
export const getNotifications = async (
  filters: NotificationFilter = {},
): Promise<PaginatedNotifications> => {
  const { whereClause, args } = buildFilters(filters);
  const pageSize = filters.page_size ?? 50;
  const page = filters.page ?? 0;
  const offset = Math.max(0, page) * pageSize;

  const rows = await queryRows<Record<string, any>>(
    `SELECT * FROM notifications ${whereClause} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
    [...args, pageSize, offset],
  );

  const totalRow = await querySingle<{ count: number }>(
    `SELECT COUNT(*) as count FROM notifications ${whereClause}`,
    args,
  );

  const unreadRow = await querySingle<{ count: number }>(
    "SELECT COUNT(*) as count FROM notifications WHERE is_read = 0",
  );

  return {
    items: rows.map(mapNotificationRow),
    total: Number(totalRow?.count ?? rows.length),
    page,
    page_size: pageSize,
    unread_count: Number(unreadRow?.count ?? 0),
  };
};

/**
 * Get single notification by ID
 */
export const getNotificationById = async (
  id: string,
): Promise<Notification> => {
  const row = await querySingle<Record<string, any>>(
    "SELECT * FROM notifications WHERE id = ?",
    [id],
  );

  if (!row) {
    throw new Error("Notification not found.");
  }

  return mapNotificationRow(row);
};

/**
 * Mark notification as read
 */
export const markAsRead = async (id: string): Promise<Notification> => {
  await db.execute({
    sql: "UPDATE notifications SET is_read = 1 WHERE id = ?",
    args: [id],
  });

  return getNotificationById(id);
};

/**
 * Mark multiple or all notifications as read
 */
export const markAllAsRead = async (): Promise<void> => {
  await db.execute({
    sql: "UPDATE notifications SET is_read = 1",
  });
};

/**
 * Delete a notification
 */
export const deleteNotification = async (id: string): Promise<void> => {
  await db.execute({
    sql: "DELETE FROM notifications WHERE id = ?",
    args: [id],
  });
};

/**
 * Delete all notifications
 */
export const deleteAllNotifications = async (): Promise<void> => {
  await db.execute({
    sql: "DELETE FROM notifications",
  });
};

/**
 * Get unread notification count
 */
export const getUnreadCount = async (): Promise<{ unread_count: number }> => {
  const row = await querySingle<{ count: number }>(
    "SELECT COUNT(*) as count FROM notifications WHERE is_read = 0",
  );
  return { unread_count: Number(row?.count ?? 0) };
};

/**
 * Get notifications grouped by date
 */
export const getGroupedNotifications = async (): Promise<{
  today: Notification[];
  yesterday: Notification[];
  earlier: Notification[];
  unread_count: number;
}> => {
  const rows = await queryRows<Record<string, any>>(
    "SELECT * FROM notifications ORDER BY created_at DESC",
  );

  const notifications = rows.map(mapNotificationRow);
  const now = new Date();
  const todayDate = now.toISOString().slice(0, 10);
  const yesterdayDate = new Date(now.getTime() - 86400000)
    .toISOString()
    .slice(0, 10);

  const grouped = {
    today: [] as Notification[],
    yesterday: [] as Notification[],
    earlier: [] as Notification[],
  };

  notifications.forEach((notification) => {
    const createdDate = notification.created_at?.slice(0, 10);
    if (createdDate === todayDate) {
      grouped.today.push(notification);
    } else if (createdDate === yesterdayDate) {
      grouped.yesterday.push(notification);
    } else {
      grouped.earlier.push(notification);
    }
  });

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return {
    ...grouped,
    unread_count: unreadCount,
  };
};

export default {
  getNotifications,
  getNotificationById,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteAllNotifications,
  getUnreadCount,
  getGroupedNotifications,
};
