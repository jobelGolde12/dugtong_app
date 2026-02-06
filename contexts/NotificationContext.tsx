import React, { createContext, ReactNode, useCallback, useContext, useEffect, useState } from 'react';
import { getApiErrorMessage } from '../api/client';
import * as notificationsApi from '../api/notifications';
import { Notification } from '../types/notification.types';

// ==================== Types ====================

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
}

interface NotificationContextValue extends NotificationState {
  loadNotifications: (filters?: NotificationFilter) => Promise<void>;
  refreshNotifications: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  clearError: () => void;
}

// ==================== Context ====================

const NotificationContext = createContext<NotificationContextValue | undefined>(undefined);

// ==================== Provider ====================

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [state, setState] = useState<NotificationState>({
    notifications: [],
    unreadCount: 0,
    isLoading: false,
    isRefreshing: false,
    error: null,
  });

  // Load notifications on mount with error handling
  useEffect(() => {
    loadNotifications();
  }, []);

  // Load notifications
  const loadNotifications = useCallback(async (filters?: NotificationFilter) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await notificationsApi.getNotifications(filters || {});

      setState((prev) => ({
        ...prev,
        notifications: response.items,
        unreadCount: response.unread_count,
        isLoading: false,
      }));
    } catch (error) {
      console.error('Error loading notifications:', error);
      
      // Check if it's a network error and handle gracefully
      const errorMessage = getApiErrorMessage(error);
      const isNetworkError = error?.message?.includes('Network Error') || 
                           error?.code === 'ERR_NETWORK' ||
                           error?.response?.status === 0;
      
      // If it's a network error, set empty state instead of error to prevent blocking the app
      if (isNetworkError) {
        setState((prev) => ({
          ...prev,
          notifications: [],
          unreadCount: 0,
          isLoading: false,
          error: null, // Don't set error for network issues to prevent blocking the app
        }));
      } else {
        // For other errors, set the error state
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: errorMessage,
        }));
      }
    }
  }, []);

  // Refresh notifications
  const refreshNotifications = useCallback(async () => {
    setState((prev) => ({ ...prev, isRefreshing: true, error: null }));

    try {
      const response = await notificationsApi.getNotifications({});

      setState((prev) => ({
        ...prev,
        notifications: response.items,
        unreadCount: response.unread_count,
        isRefreshing: false,
      }));
    } catch (error) {
      console.error('Error refreshing notifications:', error);
      
      // Check if it's a network error and handle gracefully
      const errorMessage = getApiErrorMessage(error);
      const isNetworkError = error?.message?.includes('Network Error') || 
                           error?.code === 'ERR_NETWORK' ||
                           error?.response?.status === 0;
      
      // If it's a network error, don't set error to prevent blocking the app
      if (isNetworkError) {
        setState((prev) => ({
          ...prev,
          isRefreshing: false,
          error: null, // Don't set error for network issues to prevent blocking the app
        }));
      } else {
        // For other errors, set the error state
        setState((prev) => ({
          ...prev,
          isRefreshing: false,
          error: errorMessage,
        }));
      }
    }
  }, []);

  // Mark single notification as read
  const markAsRead = useCallback(async (id: string) => {
    // Optimistic update
    setState((prev) => ({
      ...prev,
      notifications: prev.notifications.map((n) =>
        n.id === id ? { ...n, is_read: true } : n
      ),
      unreadCount: Math.max(0, prev.unreadCount - 1),
    }));

    try {
      await notificationsApi.markAsRead(id);
    } catch (error) {
      console.error('Error marking notification as read:', error);
      
      // Check if it's a network error
      const isNetworkError = error?.message?.includes('Network Error') || 
                           error?.code === 'ERR_NETWORK' ||
                           error?.response?.status === 0;
      
      // Only revert on non-network errors to prevent blocking the UI
      if (!isNetworkError) {
        loadNotifications();
      }
    }
  }, [loadNotifications]);

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    // Optimistic update
    setState((prev) => ({
      ...prev,
      notifications: prev.notifications.map((n) => ({ ...n, is_read: true })),
      unreadCount: 0,
    }));

    try {
      await notificationsApi.markAllAsRead();
    } catch (error) {
      console.error('Error marking all as read:', error);
      
      // Check if it's a network error
      const isNetworkError = error?.message?.includes('Network Error') || 
                           error?.code === 'ERR_NETWORK' ||
                           error?.response?.status === 0;
      
      // Only revert on non-network errors to prevent blocking the UI
      if (!isNetworkError) {
        loadNotifications();
      }
    }
  }, [loadNotifications]);

  // Delete single notification
  const deleteNotification = useCallback(async (id: string) => {
    const wasUnread = state.notifications.find((n) => n.id === id)?.is_read === false;

    // Optimistic update
    setState((prev) => ({
      ...prev,
      notifications: prev.notifications.filter((n) => n.id !== id),
      unreadCount: wasUnread ? Math.max(0, prev.unreadCount - 1) : prev.unreadCount,
    }));

    try {
      await notificationsApi.deleteNotification(id);
    } catch (error) {
      console.error('Error deleting notification:', error);
      
      // Check if it's a network error
      const isNetworkError = error?.message?.includes('Network Error') || 
                           error?.code === 'ERR_NETWORK' ||
                           error?.response?.status === 0;
      
      // Only revert on non-network errors to prevent blocking the UI
      if (!isNetworkError) {
        loadNotifications();
      }
    }
  }, [state.notifications, loadNotifications]);

  // Clear error
  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  const value: NotificationContextValue = {
    ...state,
    loadNotifications,
    refreshNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearError,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

// ==================== Hook ====================

export const useNotifications = (): NotificationContextValue => {
  const context = useContext(NotificationContext);

  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }

  return context;
};

export default NotificationContext;
