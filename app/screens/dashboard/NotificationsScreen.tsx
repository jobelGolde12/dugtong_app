import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
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

// ADDED: Modal component for notification details
const NotificationModal: React.FC<{
  visible: boolean;
  notification: Notification | null;
  onClose: () => void;
  onMarkAsRead: (id: string) => Promise<void>;
}> = ({ visible, notification, onClose, onMarkAsRead }) => {
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
      if (!notification.isRead) {
        onMarkAsRead(notification.id);
      }
    } else {
      slideAnim.setValue(0);
    }
  }, [visible, notification]);

  const getIconName = () => {
    if (!notification) return 'notifications';
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
    if (!notification) return '#6B7280';
    switch (notification.type) {
      case 'mention': return '#3B82F6';
      case 'system': return '#6B7280';
      case 'follow': return '#10B981';
      case 'like': return '#EF4444';
      case 'comment': return '#8B5CF6';
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
                  <Text style={styles.modalTime}>{formatDate(notification.createdAt)}</Text>
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
                <TouchableOpacity style={styles.modalActionButton}>
                  <Ionicons name="arrow-redo" size={20} color="#3B82F6" />
                  <Text style={styles.modalActionText}>Reply</Text>
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.modalActionButton}>
                  <Ionicons name="archive" size={20} color="#6B7280" />
                  <Text style={[styles.modalActionText, { color: '#6B7280' }]}>Archive</Text>
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.modalActionButton}>
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

const NotificationsScreen: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filteredNotifications, setFilteredNotifications] = useState<Notification[]>([]);
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  
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

    // Apply search filter - UPDATED to be more robust
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(notif => {
        const title = notif.title?.toLowerCase() || '';
        const message = notif.message?.toLowerCase() || '';
        return title.includes(query) || message.includes(query);
      });
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

  // ADDED: Handle notification press
  const handleNotificationPress = (notification: Notification) => {
    setSelectedNotification(notification);
    setModalVisible(true);
    
    // Mark as read if unread
    if (!notification.isRead) {
      handleMarkAsRead(notification.id);
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
      {/* ADDED: Notification Modal */}
      <NotificationModal
        visible={modalVisible}
        notification={selectedNotification}
        onClose={() => setModalVisible(false)}
        onMarkAsRead={handleMarkAsRead}
      />

      {/* Animated Header - UPDATED to always show search icon */}
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
            {/* Search button always visible */}
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

      {/* Search Bar - FIXED to always be in view when toggled */}
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

      {/* Filter Chips - FIXED height */}
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

// UPDATED: NotificationItem component with onPress prop
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
          {new Date(notification.createdAt).toLocaleTimeString([], { 
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
  // FIXED: Search bar styles
  searchBarContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingTop: 44, // Safe area top padding + additional space
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
  // FIXED: Filter chip height
  filterContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10, // Increased from 8 to 10
    borderRadius: 20,
    backgroundColor: '#F9FAFB',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    height: 40, // Added fixed height
    minWidth: 80, // Added minimum width
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
  // ADDED: Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 34,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
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
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  modalTime: {
    fontSize: 14,
    color: '#6B7280',
  },
  modalCloseButton: {
    padding: 4,
    marginLeft: 12,
  },
  modalBody: {
    padding: 20,
  },
  modalMessage: {
    fontSize: 16,
    lineHeight: 24,
    color: '#374151',
    marginBottom: 32,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
  },
  modalActionButton: {
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: '#F9FAFB',
    minWidth: 100,
  },
  modalActionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3B82F6',
    marginTop: 6,
  },
});

export default NotificationsScreen;