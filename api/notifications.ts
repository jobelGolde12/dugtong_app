import { apiClient } from "../src/services/apiClient";

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "error" | "blood_request";
  is_read: boolean;
  created_at: string;
  metadata?: Record<string, any>;
}

interface GetNotificationsParams {
  user_id?: string;
  is_read?: boolean;
  type?: string;
  limit?: number;
  offset?: number;
}

export const notificationApi = {
  getNotifications: async (params?: GetNotificationsParams): Promise<Notification[]> => {
    try {
      const queryParams = new URLSearchParams();
      
      if (params?.user_id) queryParams.append("user_id", params.user_id);
      if (params?.is_read !== undefined) queryParams.append("is_read", String(params.is_read));
      if (params?.type) queryParams.append("type", params.type);
      if (params?.limit) queryParams.append("limit", String(params.limit));
      if (params?.offset) queryParams.append("offset", String(params.offset));

      const queryString = queryParams.toString();
      const endpoint = `/notifications${queryString ? `?${queryString}` : ""}`;
      
      const response = await apiClient.get<any>(endpoint);
      
      console.log('📊 Notifications response:', response);
      
      // Handle multiple response formats
      if (response?.items && Array.isArray(response.items)) {
        return response.items;
      } else if (response?.notifications && Array.isArray(response.notifications)) {
        return response.notifications;
      } else if (Array.isArray(response)) {
        return response;
      }
      
      return [];
    } catch (error) {
      console.error('Error fetching notifications:', error);
      return [];
    }
  },

  createNotification: async (
    data: Omit<Notification, "id" | "created_at" | "is_read">
  ): Promise<Notification> => {
    const response = await apiClient.post<{ notification: Notification }>(
      "/notifications",
      data
    );
    return response.notification;
  },

  markAsRead: async (id: string): Promise<Notification> => {
    const response = await apiClient.patch<{ notification: Notification }>(
      `/notifications/${id}/read`,
      {}
    );
    return response.notification;
  },

  markAllAsRead: async (userId: string): Promise<void> => {
    await apiClient.post(`/notifications/mark-all-read`, { userId });
  },

  deleteNotification: async (id: string): Promise<void> => {
    await apiClient.delete(`/notifications/${id}`);
  },
};
