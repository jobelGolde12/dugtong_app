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
import { useTheme } from '../../../contexts/ThemeContext';
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
  colors: any;
  styles: any;
}> = ({ visible, notification, onClose, onMarkAsRead, onDelete, colors, styles }) => {
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

  const getTypeColors = () => {
    if (!notification) return colors.textSecondary;
    switch (notification.type) {
      case 'Emergency': return colors.error;
      case 'Update': return colors.primary;
      case 'System': return colors.success;
      default: return colors.textSecondary;
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
                <View style={[styles.modalIcon, { backgroundColor: getTypeColors() + '15' }]}>
                  <Ionicons
                    name={getIconName() as any}
                    size={24}
                    color={getTypeColors()}
                  />
                </View>
                <View style={styles.modalHeaderText}>
                  <Text style={[styles.modalTitle, { color: colors.text }]}>{notification.title}</Text>
                  <Text style={[styles.modalTime, { color: colors.textSecondary }]}>{formatDate(notification.created_at)}</Text>
                </View>
              </View>
              <TouchableOpacity onPress={onClose} style={styles.modalCloseButton}>
                <Ionicons name="close" size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            {/* Modal Body */}
            <View style={styles.modalBody}>
              <Text style={[styles.modalMessage, { color: colors.text }]}>{notification.message}</Text>

              {/* Action Buttons */}
              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={[styles.modalActionButton, { backgroundColor: colors.error + '15', borderColor: colors.error + '30' }]}
                  onPress={() => {
                    onDelete(notification.id);
                    onClose();
                  }}
                >
                  <Ionicons name="trash" size={20} color={colors.error} />
                  <Text style={[styles.modalActionText, { color: colors.error }]}>Delete</Text>
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
  colors: any;
  styles: any;
}> = ({ notification, onPress, onMarkAsRead, colors, styles }) => {
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

  const getTypeColors = () => {
    switch (notification.type) {
      case 'Emergency': return colors.error;
      case 'Update': return colors.primary;
      case 'System': return colors.success;
      default: return colors.textSecondary;
    }
  };

  return (
    <TouchableOpacity
      style={[styles.notificationItem, !notification.is_read && { backgroundColor: colors.primary + '08' }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.notificationIconContainer}>
        <View style={[styles.notificationIcon, { backgroundColor: getTypeColors() + '15' }]}>
          <Ionicons
            name={getIconName() as any}
            size={20}
            color={getTypeColors()}
          />
        </View>
        {!notification.is_read && <View style={[styles.unreadDot, { backgroundColor: colors.primary }]} />}
      </View>

      <View style={styles.notificationContent}>
        <Text style={[styles.notificationTitle, { color: colors.text }]} numberOfLines={1}>
          {notification.title}
        </Text>
        <Text style={[styles.notificationMessage, { color: colors.textSecondary }]} numberOfLines={2}>
          {notification.message}
        </Text>
        <Text style={[styles.notificationTime, { color: colors.textSecondary }]}>
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
          color={notification.is_read ? colors.textSecondary : colors.primary}
        />
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

const NotificationsScreen: React.FC = () => {
  const { colors } = useTheme();
  const styles = createStyles(colors);
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
        { backgroundColor: colors.card, borderColor: colors.border },
        activeFilter === id && { backgroundColor: colors.primary, borderColor: colors.primary }
      ]}
      onPress={() => setActiveFilter(id)}
    >
      <Ionicons
        name={icon as any}
        size={16}
        color={activeFilter === id ? colors.textOnPrimary : colors.textSecondary}
        style={styles.filterIcon}
      />
      <Text style={[
        styles.filterChipText,
        { color: activeFilter === id ? colors.textOnPrimary : colors.textSecondary }
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
      colors={colors}
      styles={styles}
    />
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="notifications-off" size={64} color={colors.textSecondary} />
      <Text style={[styles.emptyStateTitle, { color: colors.text }]}>No notifications</Text>
      <Text style={[styles.emptyStateSubtitle, { color: colors.textSecondary }]}>
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
        colors={colors}
        styles={styles}
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
            <Text style={[styles.headerTitle, { color: colors.text }]}>Notifications</Text>
            {unreadCount > 0 && (
              <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
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
                color={colors.text}
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
                color={unreadCount === 0 ? colors.textSecondary : colors.text}
              />
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>

      {/* Search Bar */}
      {showSearch && (
        <View style={styles.searchBarContainer}>
          <View style={[styles.searchBar, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Ionicons name="search" size={20} color={colors.textSecondary} style={styles.searchIcon} />
            <TextInput
              style={[styles.searchInput, { color: colors.text }]}
              placeholder="Search notifications..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoFocus={true}
              placeholderTextColor={colors.textSecondary}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={20} color={colors.textSecondary} />
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
          <Ionicons name="notifications" size={48} color={colors.textSecondary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Loading notifications...</Text>
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
          style={[styles.fab, { backgroundColor: colors.primary, borderColor: colors.background }]}
          onPress={() => markAllAsRead()}
        >
          <View style={styles.fabContent}>
            <Ionicons name="checkmark-done" size={20} color={colors.textOnPrimary} />
            <Text style={[styles.fabText, { color: colors.textOnPrimary }]}>Mark all read</Text>
          </View>
          <View style={[styles.fabBadge, { backgroundColor: colors.background, borderColor: colors.primary }]}>
            <Text style={[styles.fabBadgeText, { color: colors.primary }]}>{unreadCount}</Text>
          </View>
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
};

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    backgroundColor: colors.card,
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
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 14,
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
    backgroundColor: colors.surfaceVariant,
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
    backgroundColor: colors.background,
    zIndex: 1000,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 44,
    borderWidth: 1,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
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
    marginRight: 8,
    borderWidth: 1,
    height: 40,
    minWidth: 80,
  },
  filterIcon: {
    marginRight: 6,
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: '500',
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
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginRight: 12,
  },
  groupLine: {
    flex: 1,
    height: 1,
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 12,
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
    borderWidth: 2,
  },
  notificationContent: {
    flex: 1,
    marginRight: 12,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  notificationMessage: {
    fontSize: 14,
    lineHeight: 18,
    marginBottom: 4,
  },
  notificationTime: {
    fontSize: 12,
  },
  notificationAction: {
    padding: 4,
  },
  separator: {
    height: 1,
    backgroundColor: colors.surfaceVariant,
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
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 100,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginTop: 24,
  },
  emptyStateSubtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
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
    marginRight: 12,
  },
  modalHeaderText: {
    flex: 1,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  modalTime: {
    fontSize: 13,
    marginTop: 2,
  },
  modalCloseButton: {
    padding: 8,
  },
  modalBody: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  modalMessage: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 20,
  },
  modalActions: {
    flexDirection: 'row',
  },
  modalActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
  },
  modalActionText: {
    fontSize: 15,
    fontWeight: '600',
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 28,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  fabContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  fabText: {
    fontSize: 15,
    fontWeight: '600',
  },
  fabBadge: {
    marginLeft: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  fabBadgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
});

export default NotificationsScreen;
