export interface Notification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  type: 'Emergency' | 'Update' | 'System';
  isRead: boolean;
}

export interface NotificationFilter {
  type: string | null;
  isRead: boolean | null;
  searchQuery: string;
}