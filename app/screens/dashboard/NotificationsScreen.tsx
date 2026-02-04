import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { notificationService } from '../../../lib/services/notificationService';
import { Notification } from '../../../types/notification.types';

const { width } = Dimensions.get('window');

// Notification groups
type NotificationGroup = {
  title: string;
  data: Notification[];
};

const FILTER_OPTIONS = [
  { id: 'all', label: 'All', icon: 'apps' },
  { id: 'unread', label: 'Unread', icon: 'mail-unread' },
  { id: 'mentions', label: 'Mentions', icon: 'at' },
  { id: 'system', label: 'System', icon: 'notifications' },
  { id: 'follows', label: 'Follows', icon: 'person-add' },
];

const NotificationsScreen: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filteredNotifications, setFilteredNotifications] = useState<Notification[]>([]);
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const searchAnim = useRef(new Animated.Value(0)).current;
  const headerAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    loadNotifications();
  }, []);

  useEffect(() => {
    filterNotifications();
  }, [notifications, activeFilter, searchQuery]);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const result = await notificationService.getNotifications({});
      
      // Group notifications by time (Today, Yesterday, Earlier)
      const grouped = groupNotificationsByTime(result);
      setNotifications(grouped);
    } catch (error) {
      console.error('Failed to load notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const groupNotificationsByTime = (notifs: Notification[]): Notification[] => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    return notifs.map(notif => {
      const notifDate = new Date(notif.createdAt);
      
      if (notifDate >= today) {
        return { ...notif, group: 'Today' };
      } else if (notifDate >= yesterday) {
        return { ...notif, group: 'Yesterday' };
      } else {
        return { ...notif, group: 'Earlier' };
      }
    });
  };

  const filterNotifications = () => {
    let filtered = [...notifications];

    // Apply type filter
    if (activeFilter !== 'all') {
      filtered = filtered.filter(notif => {
        switch (activeFilter) {
          case 'unread': return !notif.isRead;
          case 'mentions': return notif.type === 'mention';
          case 'system': return notif.type === 'system';
          case 'follows': return notif.type === 'follow';
          default: return true;
        }
      });
    }

    // Apply search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(notif =>
        notif.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        notif.message.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredNotifications(filtered);
  };

  const groupNotifications = (): NotificationGroup[] => {
    const groups: { [key: string]: Notification[] } = {};
    
    filteredNotifications.forEach(notif => {
      const group = notif.group || 'Earlier';
      if (!groups[group]) groups[group] = [];
      groups[group].push(notif);
    });

    // Order: Today, Yesterday, Earlier
    const orderedGroups = ['Today', 'Yesterday', 'Earlier'].filter(g => groups[g]);
    
    return orderedGroups.map(group => ({
      title: group,
      data: groups[group]
    }));
  };

  const toggleSearch = () => {
    if (showSearch) {
      Animated.parallel([
        Animated.timing(searchAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: false,
        }),
        Animated.timing(headerAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: false,
        })
      ]).start(() => {
        setShowSearch(false);
        setSearchQuery('');
      });
    } else {
      setShowSearch(true);
      Animated.parallel([
        Animated.timing(searchAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: false,
        }),
        Animated.timing(headerAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: false,
        })
      ]).start();
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications(prev =>
        prev.map(notif => ({ ...notif, isRead: true }))
      );
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications(prev =>
        prev.map(notif =>
          notif.id === id ? { ...notif, isRead: true } : notif
        )
      );
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  const renderFilterChip = ({ id, label, icon }: { id: string; label: string; icon: string }) => (
    <TouchableOpacity
      key={id}
      style={[
        styles.filterChip,
        activeFilter === id && styles.filterChipActive
      ]}
      onPress={() => setActiveFilter(id)}
    >
      <Ionicons
        name={icon as any}
        size={16}
        color={activeFilter === id ? '#FFFFFF' : '#6B7280'}
        style={styles.filterIcon}
      />
      <Text style={[
        styles.filterChipText,
        activeFilter === id && styles.filterChipTextActive
      ]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  const renderGroupHeader = (title: string) => (
    <View style={styles.groupHeader}>
      <Text style={styles.groupTitle}>{title}</Text>
      <View style={styles.groupLine} />
    </View>
  );

  const renderNotificationItem = ({ item }: { item: Notification }) => (
    <NotificationItem
      notification={item}
      onMarkAsRead={handleMarkAsRead}
    />
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="notifications-off" size={64} color="#D1D5DB" />
      <Text style={styles.emptyStateTitle}>No notifications</Text>
      <Text style={styles.emptyStateSubtitle}>
        {searchQuery ? 'No results found' : 'You\'re all caught up!'}
      </Text>
    </View>
  );

  const groups = groupNotifications();
  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Animated Header */}
      <Animated.View style={[
        styles.header,
        {
          opacity: headerAnim,
          transform: [{
            translateY: headerAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [-100, 0]
            })
          }]
        }
      ]}>
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.headerTitle}>Notifications</Text>
            {unreadCount > 0 && (
              <Text style={styles.headerSubtitle}>
                {unreadCount} unread {unreadCount === 1 ? 'notification' : 'notifications'}
              </Text>
            )}
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.headerButton}
              onPress={toggleSearch}
            >
              <Ionicons name="search" size={22} color="#374151" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.headerButton}
              onPress={handleMarkAllAsRead}
              disabled={unreadCount === 0}
            >
              <Ionicons
                name="checkmark-done"
                size={22}
                color={unreadCount === 0 ? '#D1D5DB' : '#374151'}
              />
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>

      {/* Search Bar */}
      <Animated.View style={[
        styles.searchContainer,
        {
          opacity: searchAnim,
          height: searchAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [0, 56]
          }),
          marginBottom: searchAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [0, 16]
          })
        }
      ]}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#6B7280" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search notifications..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoFocus={true}
            placeholderTextColor="#9CA3AF"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          )}
        </View>
      </Animated.View>

      {/* Filter Chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterContainer}
      >
        {FILTER_OPTIONS.map(renderFilterChip)}
      </ScrollView>

      {/* Notifications List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <Ionicons name="notifications" size={48} color="#E5E7EB" />
          <Text style={styles.loadingText}>Loading notifications...</Text>
        </View>
      ) : (
        <FlatList
          data={groups}
          keyExtractor={(item) => item.title}
          renderItem={({ item: group }) => (
            <View style={styles.groupContainer}>
              {renderGroupHeader(group.title)}
              <FlatList
                data={group.data}
                keyExtractor={(item) => item.id}
                renderItem={renderNotificationItem}
                scrollEnabled={false}
                ItemSeparatorComponent={() => <View style={styles.separator} />}
              />
            </View>
          )}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={renderEmptyState}
        />
      )}

      {/* Quick Actions FAB */}
      {unreadCount > 0 && !showSearch && (
        <TouchableOpacity
          style={styles.fab}
          onPress={handleMarkAllAsRead}
        >
          <View style={styles.fabContent}>
            <Ionicons name="checkmark-done" size={20} color="#FFFFFF" />
            <Text style={styles.fabText}>Mark all read</Text>
          </View>
          <View style={styles.fabBadge}>
            <Text style={styles.fabBadgeText}>{unreadCount}</Text>
          </View>
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
};

const NotificationItem: React.FC<{
  notification: Notification;
  onMarkAsRead: (id: string) => void;
}> = ({ notification, onMarkAsRead }) => {
  const handlePress = () => {
    if (!notification.isRead) {
      onMarkAsRead(notification.id);
    }
    // Navigate to notification target...
  };

  const getIconName = () => {
    switch (notification.type) {
      case 'mention': return 'at';
      case 'system': return 'notifications';
      case 'follow': return 'person-add';
      case 'like': return 'heart';
      case 'comment': return 'chatbubble';
      default: return 'notifications';
    }
  };

  const getIconColor = () => {
    switch (notification.type) {
      case 'mention': return '#3B82F6';
      case 'system': return '#6B7280';
      case 'follow': return '#10B981';
      case 'like': return '#EF4444';
      case 'comment': return '#8B5CF6';
      default: return '#6B7280';
    }
  };

  return (
    <TouchableOpacity
      style={[styles.notificationItem, !notification.isRead && styles.notificationUnread]}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <View style={styles.notificationIconContainer}>
        <View style={[styles.notificationIcon, { backgroundColor: `${getIconColor()}15` }]}>
          <Ionicons
            name={getIconName() as any}
            size={20}
            color={getIconColor()}
          />
        </View>
        {!notification.isRead && <View style={styles.unreadDot} />}
      </View>

      <View style={styles.notificationContent}>
        <Text style={styles.notificationTitle} numberOfLines={1}>
          {notification.title}
        </Text>
        <Text style={styles.notificationMessage} numberOfLines={2}>
          {notification.message}
        </Text>
        <Text style={styles.notificationTime}>
          {notification.timestamp}
        </Text>
      </View>

      <TouchableOpacity
        style={styles.notificationAction}
        onPress={() => onMarkAsRead(notification.id)}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Ionicons
          name={notification.isRead ? 'ellipsis-horizontal' : 'checkmark-circle'}
          size={20}
          color={notification.isRead ? '#9CA3AF' : '#3B82F6'}
        />
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F9FAFB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    paddingHorizontal: 16,
    overflow: 'hidden',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 44,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
    paddingVertical: 10,
  },
  filterContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F9FAFB',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  filterChipActive: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  filterIcon: {
    marginRight: 6,
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  filterChipTextActive: {
    color: '#FFFFFF',
  },
  groupContainer: {
    marginBottom: 24,
  },
  groupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  groupTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginRight: 12,
  },
  groupLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  notificationUnread: {
    backgroundColor: '#F0F9FF',
  },
  notificationIconContainer: {
    position: 'relative',
    marginRight: 12,
  },
  notificationIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  unreadDot: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#3B82F6',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  notificationContent: {
    flex: 1,
    marginRight: 12,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  notificationMessage: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 18,
    marginBottom: 4,
  },
  notificationTime: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  notificationAction: {
    padding: 4,
  },
  separator: {
    height: 1,
    backgroundColor: '#F9FAFB',
    marginHorizontal: 16,
  },
  listContent: {
    paddingTop: 8,
    paddingBottom: 100,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
    paddingHorizontal: 40,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6B7280',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtitle: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 12,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3B82F6',
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
  },
  fabContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  fabText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  fabBadge: {
    backgroundColor: '#EF4444',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
    marginLeft: 8,
  },
  fabBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
});

export default NotificationsScreen;