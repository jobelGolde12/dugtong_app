import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { Alert, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import SafeScrollView from '../../../lib/SafeScrollView';
import { notificationService } from '../../../lib/services/notificationService';
import { Notification, NotificationFilter } from '../../../types/notification.types';
import EmptyState from '../../components/dashboard/EmptyState';
import LoadingIndicator from '../../components/dashboard/LoadingIndicator';
import NotificationFilterBar from '../../components/dashboard/NotificationFilterBar';
import NotificationItem from '../../components/dashboard/NotificationItem';

const NotificationsScreen: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<NotificationFilter>({
    type: null,
    isRead: null,
    searchQuery: '',
  });
  const [showActions, setShowActions] = useState(false);

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
      setShowActions(false);
    } catch (error) {
      Alert.alert('Error', 'Failed to mark all notifications as read');
      console.error('Mark all as read error:', error);
    }
  };

  const handleRefresh = async () => {
    await loadNotifications();
  };

  const handleDeleteAll = async () => {
    Alert.alert(
      'Delete All Notifications',
      'Are you sure you want to delete all notifications? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete All',
          style: 'destructive',
          onPress: async () => {
            try {
              await notificationService.deleteAll();
              setNotifications([]);
              Alert.alert('Success', 'All notifications deleted');
              setShowActions(false);
            } catch (error) {
              Alert.alert('Error', 'Failed to delete notifications');
              console.error('Delete all error:', error);
            }
          }
        }
      ]
    );
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

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <SafeScrollView
      style={styles.scrollView}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="always"
      bounces={true}
      overScrollMode="always"
    >
      {/* Header Section */}
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <View style={styles.titleRow}>
            <Text style={styles.title}>Notifications</Text>
            {unreadCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{unreadCount}</Text>
              </View>
            )}
          </View>
          <Text style={styles.subtitle}>
            {notifications.length} total • {unreadCount} unread
          </Text>
        </View>
        
        <View style={styles.headerActions}>
          <TouchableOpacity 
            style={styles.iconButton} 
            onPress={handleRefresh}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="refresh" size={22} color="#6C63FF" />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.iconButton} 
            onPress={() => setShowActions(!showActions)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="ellipsis-vertical" size={22} color="#64748B" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Action Menu */}
      {showActions && (
        <View style={styles.actionMenu}>
          <TouchableOpacity 
            style={styles.actionMenuItem}
            onPress={handleMarkAllAsRead}
          >
            <View style={styles.actionMenuIcon}>
              <Ionicons name="checkmark-done" size={20} color="#10B981" />
            </View>
            <View style={styles.actionMenuContent}>
              <Text style={styles.actionMenuTitle}>Mark All Read</Text>
              <Text style={styles.actionMenuSubtitle}>Mark all notifications as read</Text>
            </View>
          </TouchableOpacity>
          
          <View style={styles.divider} />
          
          <TouchableOpacity 
            style={styles.actionMenuItem}
            onPress={handleDeleteAll}
          >
            <View style={styles.actionMenuIcon}>
              <Ionicons name="trash" size={20} color="#EF4444" />
            </View>
            <View style={styles.actionMenuContent}>
              <Text style={styles.actionMenuTitle}>Delete All</Text>
              <Text style={styles.actionMenuSubtitle}>Permanently delete all notifications</Text>
            </View>
          </TouchableOpacity>
        </View>
      )}

      <NotificationFilterBar
        filters={filters}
        onFilterChange={handleFilterChange}
        onClearFilters={handleClearFilters}
        searchPlaceholder="Search notifications..."
      />

      {notifications.length > 0 ? (
        <View style={styles.notificationsContainer}>
          <FlatList
            data={notifications}
            renderItem={renderNotification}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            scrollEnabled={false}
            contentContainerStyle={styles.listContent}
          />
        </View>
      ) : (
        <EmptyState 
          message="No notifications at this time." 
          icon="🔔"
          subtitle="You're all caught up!"
          actionText="Refresh"
          onAction={handleRefresh}
        />
      )}

      {/* Floating Action Button */}
      {!showActions && unreadCount > 0 && (
        <TouchableOpacity 
          style={styles.floatingButton}
          onPress={handleMarkAllAsRead}
        >
          <View style={styles.floatingButtonContent}>
            <Ionicons name="checkmark-done" size={20} color="#FFFFFF" />
            <Text style={styles.floatingButtonText}>Mark All Read</Text>
          </View>
        </TouchableOpacity>
      )}
    </SafeScrollView>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 100,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  titleContainer: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1E293B',
    marginRight: 12,
  },
  badge: {
    backgroundColor: '#EF4444',
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  subtitle: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  actionMenu: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 8,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  actionMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
  },
  actionMenuIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  actionMenuContent: {
    flex: 1,
  },
  actionMenuTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 2,
  },
  actionMenuSubtitle: {
    fontSize: 12,
    color: '#64748B',
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginHorizontal: 8,
  },
  notificationsContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    marginTop: 8,
  },
  listContent: {
    padding: 4,
  },
  floatingButton: {
    position: 'absolute',
    bottom: 40,
    right: 24,
    backgroundColor: '#6C63FF',
    borderRadius: 50,
    paddingHorizontal: 20,
    paddingVertical: 14,
    shadowColor: '#6C63FF',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  floatingButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  floatingButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default NotificationsScreen;