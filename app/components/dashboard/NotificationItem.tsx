import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';

interface NotificationItemProps {
  notification: {
    id: string;
    title: string;
    message: string;
    timestamp: string;
    type: string;
    isRead: boolean;
  };
  onMarkAsRead: (id: string) => void;
}

export const NotificationItem: React.FC<NotificationItemProps> = ({ 
  notification, 
  onMarkAsRead 
}) => {
  const handlePress = () => {
    if (!notification.isRead) {
      onMarkAsRead(notification.id);
    }
  };

  return (
    <TouchableOpacity 
      style={[styles.container, !notification.isRead && styles.unreadContainer]} 
      onPress={handlePress}
    >
      <View style={styles.header}>
        <Text style={[styles.title, !notification.isRead && styles.unreadText]}>
          {notification.title}
        </Text>
        <Text style={styles.time}>{new Date(notification.timestamp).toLocaleDateString()}</Text>
      </View>
      <Text style={[styles.message, !notification.isRead && styles.unreadText]}>
        {notification.message}
      </Text>
      <View style={styles.footer}>
        <View style={[
          styles.badge, 
          notification.type === 'Emergency' && styles.emergency,
          notification.type === 'Update' && styles.update,
          notification.type === 'System' && styles.system,
        ]}>
          <Text style={styles.badgeText}>{notification.type}</Text>
        </View>
        {!notification.isRead && (
          <View style={styles.unreadIndicator} />
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  unreadContainer: {
    borderLeftWidth: 4,
    borderLeftColor: '#0d6efd',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  unreadText: {
    fontWeight: 'bold',
    color: '#0d6efd',
  },
  time: {
    fontSize: 12,
    color: '#888',
    marginLeft: 10,
  },
  message: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  emergency: {
    backgroundColor: '#f8d7da',
  },
  update: {
    backgroundColor: '#d1ecf1',
  },
  system: {
    backgroundColor: '#fff3cd',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
  },
  unreadIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#0d6efd',
  },
});