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