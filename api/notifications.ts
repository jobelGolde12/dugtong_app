import apiClient from "./client";

// ==================== Types ====================

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: "Emergency" | "Update" | "System" | "Reminder";
  is_read: boolean;
  created_at: string;
  data?: Record<string, unknown>;
}

export interface NotificationFilter {
  type?: string;
  is_read?: boolean;
  search_query?: string;
  page?: number;
  page_size?: number;
}

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

// ==================== API Endpoints ====================

/**
 * Get list of notifications for current user
 */
export const getNotifications = async (
  filters: NotificationFilter = {},
): Promise<PaginatedNotifications> => {
  const params: Record<string, string | number | boolean> = {};

  if (filters.type) params.type = filters.type;
  if (filters.is_read !== undefined) params.is_read = filters.is_read;
  if (filters.search_query) params.search_query = filters.search_query;
  if (filters.page) params.page = filters.page;
  if (filters.page_size) params.page_size = filters.page_size;

  const response = await apiClient.get<PaginatedNotifications>(
    "/notifications",
    { params },
  );
  return response.data;
};

/**
 * Get single notification by ID
 */
export const getNotificationById = async (
  id: string,
): Promise<Notification> => {
  const response = await apiClient.get<Notification>(`/notifications/${id}`);
  return response.data;
};

/**
 * Mark notification as read
 */
export const markAsRead = async (id: string): Promise<Notification> => {
  const response = await apiClient.patch<Notification>(
    `/notifications/${id}/read`,
  );
  return response.data;
};

/**
 * Mark multiple or all notifications as read
 */
export const markAllAsRead = async (
  notificationIds?: string[],
): Promise<void> => {
  if (notificationIds && notificationIds.length > 0) {
    await apiClient.patch("/notifications/read", {
      notification_ids: notificationIds,
    });
  } else {
    await apiClient.patch("/notifications/read-all");
  }
};

/**
 * Delete a notification
 */
export const deleteNotification = async (id: string): Promise<void> => {
  await apiClient.delete(`/notifications/${id}`);
};

/**
 * Delete all notifications
 */
export const deleteAllNotifications = async (): Promise<void> => {
  await apiClient.delete("/notifications");
};

/**
 * Get unread notification count
 */
export const getUnreadCount = async (): Promise<{ unread_count: number }> => {
  const response = await apiClient.get<{ unread_count: number }>(
    "/notifications/unread-count",
  );
  return response.data;
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
  const response = await apiClient.get("/notifications/grouped");
  return response.data;
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
