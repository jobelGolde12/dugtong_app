import { Notification, NotificationFilter } from '../../types/notification.types';

// Mock data for testing
const MOCK_NOTIFICATIONS = [
  { id: '1', title: 'Emergency Request', message: 'Urgent need for O+ blood in Sorsogon General Hospital', timestamp: '2024-06-15T10:30:00Z', type: 'Emergency', isRead: false },
  { id: '2', title: 'System Update', message: 'New donor registration form is now available', timestamp: '2024-06-14T14:20:00Z', type: 'System', isRead: true },
  { id: '3', title: 'Donation Reminder', message: 'Your next donation is due in 3 days', timestamp: '2024-06-13T09:15:00Z', type: 'Update', isRead: false },
  { id: '4', title: 'New Donor Registered', message: 'A new donor has registered in your area', timestamp: '2024-06-12T16:45:00Z', type: 'Update', isRead: true },
  { id: '5', title: 'Maintenance Notice', message: 'System maintenance scheduled for Sunday 2 AM', timestamp: '2024-06-11T11:30:00Z', type: 'System', isRead: false },
];

export const notificationService = {
  getNotifications: async (filters: NotificationFilter): Promise<Notification[]> => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return new Promise((resolve) => {
      let filtered = [...MOCK_NOTIFICATIONS];
      
      if (filters.type && filters.type !== 'All') {
        filtered = filtered.filter(notification => notification.type === filters.type);
      }

      if (filters.isRead !== null && filters.isRead !== undefined) {
        filtered = filtered.filter(notification => notification.isRead === filters.isRead);
      }
      
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase();
        filtered = filtered.filter(notification => 
          notification.title.toLowerCase().includes(query) ||
          notification.message.toLowerCase().includes(query)
        );
      }
      
      resolve(filtered);
    });
  },

  markAsRead: async (id: string): Promise<void> => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    return new Promise((resolve) => {
      const notificationIndex = MOCK_NOTIFICATIONS.findIndex(notif => notif.id === id);
      if (notificationIndex !== -1) {
        MOCK_NOTIFICATIONS[notificationIndex] = {
          ...MOCK_NOTIFICATIONS[notificationIndex],
          isRead: true
        };
      }
      resolve();
    });
  },

  markAllAsRead: async (): Promise<void> => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    return new Promise((resolve) => {
      MOCK_NOTIFICATIONS.forEach((notif, index) => {
        if (!notif.isRead) {
          MOCK_NOTIFICATIONS[index] = {
            ...notif,
            isRead: true
          };
        }
      });
      resolve();
    });
  },

  deleteAll: async (): Promise<void> => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return new Promise((resolve) => {
      MOCK_NOTIFICATIONS.length = 0;
      resolve();
    });
  },
};