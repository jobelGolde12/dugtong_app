import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  FlatList,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNotifications } from '../../../contexts/NotificationContext';
import { Notification } from '../../../types/notification.types';

// Notification groups
type NotificationGroup = {
  title: string;
  data: Notification[];
};

const FILTER_OPTIONS = [
  { id: 'all', label: 'All', icon: 'apps' },
  { id: 'unread', label: 'Unread', icon: 'mail-unread' },
  { id: 'System', label: 'System', icon: 'notifications' },
  { id: 'Emergency', label: 'Emergency', icon: 'alert-circle' },
  { id: 'Update', label: 'Update', icon: 'information-circle' },
];

const NotificationModal: React.FC<{
  visible: boolean;
  notification: Notification | null;
  onClose: () => void;
  onMarkAsRead: (id: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}> = ({ visible, notification, onClose, onMarkAsRead, onDelete }) => {
  const slideAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible && notification) {
      Animated.spring(slideAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 50,
        friction: 7,
      }).start();

      // Mark as read when modal opens
      if (!notification.is_read) {
        onMarkAsRead(notification.id);
      }
    } else {
      slideAnim.setValue(0);
    }
  }, [visible, notification]);

  const getIconName = () => {
    if (!notification) return 'notifications';
    switch (notification.type) {
      case 'Emergency': return 'alert-circle';
      case 'Update': return 'information-circle';
      case 'System': return 'notifications';
      default: return 'notifications';
    }
  };

  const getIconColor = () => {
    if (!notification) return '#6B7280';
    switch (notification.type) {
      case 'Emergency': return '#EF4444';
      case 'Update': return '#3B82F6';
      case 'System': return '#10B981';
      default: return '#6B7280';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!notification) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <Animated.View
          style={[
            styles.modalContent,
            {
              transform: [{
                translateY: slideAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [500, 0]
                })
              }],
              opacity: slideAnim
            }
          ]}
        >
          <TouchableOpacity
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <View style={styles.modalIconContainer}>
                <View style={[styles.modalIcon, { backgroundColor: `${getIconColor()}15` }]}>
                  <Ionicons
                    name={getIconName() as any}
                    size={24}
                    color={getIconColor()}
                  />
                </View>
                <View style={styles.modalHeaderText}>
                  <Text style={styles.modalTitle}>{notification.title}</Text>
                  <Text style={styles.modalTime}>{formatDate(notification.created_at)}</Text>
                </View>
              </View>
              <TouchableOpacity onPress={onClose} style={styles.modalCloseButton}>
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            {/* Modal Body */}
            <View style={styles.modalBody}>
              <Text style={styles.modalMessage}>{notification.message}</Text>

              {/* Action Buttons */}
              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={styles.modalActionButton}
                  onPress={() => {
                    onDelete(notification.id);
                    onClose();
                  }}
                >
                  <Ionicons name="trash" size={20} color="#EF4444" />
                  <Text style={[styles.modalActionText, { color: '#EF4444' }]}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>
        </Animated.View>
      </TouchableOpacity>
    </Modal>
  );
};

const NotificationItem: React.FC<{
  notification: Notification;
  onPress: () => void;
  onMarkAsRead: (id: string) => Promise<void>;
}> = ({ notification, onPress, onMarkAsRead }) => {
  const handleActionPress = async () => {
    await onMarkAsRead(notification.id);
  };

  const getIconName = () => {
    switch (notification.type) {
      case 'Emergency': return 'alert-circle';
      case 'Update': return 'information-circle';
      case 'System': return 'notifications';
      default: return 'notifications';
    }
  };

  const getIconColor = () => {
    switch (notification.type) {
      case 'Emergency': return '#EF4444';
      case 'Update': return '#3B82F6';
      case 'System': return '#10B981';
      default: return '#6B7280';
    }
  };

  return (
    <TouchableOpacity
      style={[styles.notificationItem, !notification.is_read && styles.notificationUnread]}
      onPress={onPress}
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
        {!notification.is_read && <View style={styles.unreadDot} />}
      </View>

      <View style={styles.notificationContent}>
        <Text style={styles.notificationTitle} numberOfLines={1}>
          {notification.title}
        </Text>
        <Text style={styles.notificationMessage} numberOfLines={2}>
          {notification.message}
        </Text>
        <Text style={styles.notificationTime}>
          {new Date(notification.created_at).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit'
          })}
        </Text>
      </View>

      <TouchableOpacity
        style={styles.notificationAction}
        onPress={handleActionPress}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Ionicons
          name={notification.is_read ? 'ellipsis-horizontal' : 'checkmark-circle'}
          size={20}
          color={notification.is_read ? '#9CA3AF' : '#3B82F6'}
        />
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

const NotificationsScreen: React.FC = () => {
  const {
    notifications,
    unreadCount,
    isLoading,
    loadNotifications,
    markAllAsRead,
    markAsRead,
    deleteNotification
  } = useNotifications();

  // Local state for UI
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const searchAnim = useRef(new Animated.Value(0)).current;
  const headerAnim = useRef(new Animated.Value(1)).current;

  // Initial load
  useEffect(() => {
    // Context already loads notifications on mount, but we can trigger refresh here if needed
    // loadNotifications(); 
  }, []);

  const filteredNotifications = useMemo(() => {
    let filtered = [...notifications];

    // Apply type filter
    if (activeFilter !== 'all') {
      filtered = filtered.filter(notif => {
        if (activeFilter === 'unread') return !notif.is_read;
        return notif.type === activeFilter;
      });
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(notif => {
        const title = notif.title?.toLowerCase() || '';
        const message = notif.message?.toLowerCase() || '';
        return title.includes(query) || message.includes(query);
      });
    }

    return filtered;
  }, [notifications, activeFilter, searchQuery]);

  const groupNotifications = (): NotificationGroup[] => {
    const groups: { [key: string]: Notification[] } = {};
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    filteredNotifications.forEach(notif => {
      const notifDate = new Date(notif.created_at);
      let group = 'Earlier';

      if (notifDate >= today) {
        group = 'Today';
      } else if (notifDate >= yesterday) {
        group = 'Yesterday';
      }

      if (!groups[group]) groups[group] = [];
      groups[group].push(notif);
    });

    const orderedGroups = ['Today', 'Yesterday', 'Earlier'].filter(g => groups[g] && groups[g].length > 0);

    return orderedGroups.map(group => ({
      title: group,
      data: groups[group]
    }));
  };

  const groups = groupNotifications();

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

  const handleNotificationPress = (notification: Notification) => {
    setSelectedNotification(notification);
    setModalVisible(true);

    if (!notification.is_read) {
      markAsRead(notification.id);
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
      onPress={() => handleNotificationPress(item)}
      onMarkAsRead={markAsRead}
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

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <NotificationModal
        visible={modalVisible}
        notification={selectedNotification}
        onClose={() => setModalVisible(false)}
        onMarkAsRead={markAsRead}
        onDelete={deleteNotification}
      />

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
              <Ionicons
                name={showSearch ? "close" : "search"}
                size={22}
                color="#374151"
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.headerButton}
              onPress={() => markAllAsRead()}
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
      {showSearch && (
        <View style={styles.searchBarContainer}>
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
        </View>
      )}

      {/* Filter Chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterContainer}
      >
        {FILTER_OPTIONS.map(renderFilterChip)}
      </ScrollView>

      {/* Notifications List */}
      {isLoading ? (
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
          refreshing={isLoading}
          onRefresh={loadNotifications}
        />
      )}

      {/* Quick Actions FAB */}
      {unreadCount > 0 && !showSearch && (
        <TouchableOpacity
          style={styles.fab}
          onPress={() => markAllAsRead()}
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingBottom: 12,
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
  searchBarContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingTop: 44,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
    zIndex: 1000,
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
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#F9FAFB',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    height: 40,
    minWidth: 80,
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
  listContent: {
    paddingBottom: 100,
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 100,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 100,
  },
  emptyStateTitle: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  emptyStateSubtitle: {
    marginTop: 8,
    fontSize: 14,
    color: '#6B7280',
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 16,
    backgroundColor: '#3B82F6',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 30,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  fabContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  fabText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
    marginLeft: 8,
  },
  fabBadge: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginLeft: 8,
  },
  fabBadgeText: {
    color: '#3B82F6',
    fontSize: 12,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 24,
    paddingHorizontal: 24,
    paddingBottom: 40,
    minHeight: 300,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  modalIconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  modalIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  modalHeaderText: {
    flex: 1,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  modalTime: {
    fontSize: 14,
    color: '#6B7280',
  },
  modalCloseButton: {
    padding: 4,
  },
  modalBody: {
    marginBottom: 24,
  },
  modalMessage: {
    fontSize: 16,
    color: '#4B5563',
    lineHeight: 24,
    marginBottom: 24,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  modalActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#FEF2F2',
  },
  modalActionText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default NotificationsScreen;