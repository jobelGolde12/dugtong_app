import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Alert, FlatList, Text, TouchableOpacity } from 'react-native';
import { NotificationItem } from '../../components/dashboard/NotificationItem';
import { NotificationFilterBar } from '../../components/dashboard/NotificationFilterBar';
import { EmptyState } from '../../components/dashboard/EmptyState';
import { LoadingIndicator } from '../../components/dashboard/LoadingIndicator';
import { notificationService } from '../../../lib/services/notificationService';
import { Notification, NotificationFilter } from '../../../types/notification.types';

export const NotificationsScreen: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<NotificationFilter>({
    type: null,
    isRead: null,
    searchQuery: '',
  });

  useEffect(() => {
    loadNotifications();
  }, []);

  useEffect(() => {
    loadNotifications();
  }, [filters]);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const result = await notificationService.getNotifications(filters);
      setNotifications(result);
    } catch (error) {
      Alert.alert('Error', 'Failed to load notifications');
      console.error('Load notifications error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      await notificationService.markAsRead(id);
      // Update local state
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === id ? { ...notif, isRead: true } : notif
        )
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to mark notification as read');
      console.error('Mark as read error:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      // Update local state
      setNotifications(prev => 
        prev.map(notif => ({ ...notif, isRead: true }))
      );
      Alert.alert('Success', 'All notifications marked as read');
    } catch (error) {
      Alert.alert('Error', 'Failed to mark all notifications as read');
      console.error('Mark all as read error:', error);
    }
  };

  const renderNotification = ({ item }: { item: Notification }) => (
    <NotificationItem 
      notification={item} 
      onMarkAsRead={handleMarkAsRead} 
    />
  );

  if (loading) {
    return <LoadingIndicator />;
  }

  const handleFilterChange = (filterName: keyof NotificationFilter, value: any) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
  };

  const handleClearFilters = () => {
    setFilters({
      type: null,
      isRead: null,
      searchQuery: '',
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>Notifications</Text>
          <Text style={styles.subtitle}>{notifications.length} total</Text>
        </View>
        <View style={styles.actions}>
          <TouchableOpacity style={styles.actionButton} onPress={handleMarkAllAsRead}>
            <Text style={styles.actionButtonText}>Mark All Read</Text>
          </TouchableOpacity>
        </View>
      </View>

      <NotificationFilterBar
        filters={filters}
        onFilterChange={handleFilterChange}
        onClearFilters={handleClearFilters}
        searchPlaceholder="Search notifications..."
      />

      {notifications.length > 0 ? (
        <FlatList
          data={notifications}
          renderItem={renderNotification}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <EmptyState message="No notifications at this time." icon="🔔" />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
  },
  actions: {
    flexDirection: 'row',
  },
  actionButton: {
    backgroundColor: '#0d6efd',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 5,
  },
  actionButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
});