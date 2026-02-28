import { Ionicons } from '@expo/vector-icons';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Dimensions,
  Keyboard,
  Modal,
  Platform,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View
} from 'react-native';
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming
} from 'react-native-reanimated';
import { useTheme } from '../../../contexts/ThemeContext';
import { useAuth } from '../../../contexts/AuthContext';
import { messageApi, Message } from '../../../api/messages';

// ============ DESIGN SYSTEM CONSTANTS ============
const COLORS = {
  primary: {
    50: '#EFF6FF',
    100: '#DBEAFE',
    200: '#BFDBFE',
    300: '#93C5FD',
    400: '#60A5FA',
    500: '#3B82F6',
    600: '#2563EB',
    700: '#1D4ED8',
    800: '#1E40AF',
    900: '#1E3A8A',
  },
  neutral: {
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    900: '#111827',
  },
  success: {
    50: '#F0FDF4',
    100: '#DCFCE7',
    500: '#22C55E',
    600: '#16A34A',
  },
  warning: {
    50: '#FFFBEB',
    100: '#FEF3C7',
    500: '#F59E0B',
    600: '#D97706',
  },
  error: {
    50: '#FEF2F2',
    100: '#FEE2E2',
    500: '#EF4444',
    600: '#DC2626',
  },
  info: {
    50: '#EFF6FF',
    100: '#DBEAFE',
    500: '#3B82F6',
    600: '#2563EB',
  },
  surface: {
    light: '#FFFFFF',
    dark: '#1E1E1E',
  },
};

const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
} as const;

const TYPOGRAPHY = {
  h1: { fontSize: 28, fontWeight: '800', lineHeight: 36, letterSpacing: -0.5 },
  h2: { fontSize: 22, fontWeight: '700', lineHeight: 30, letterSpacing: -0.3 },
  h3: { fontSize: 18, fontWeight: '600', lineHeight: 26 },
  body1: { fontSize: 16, fontWeight: '400', lineHeight: 24 },
  body2: { fontSize: 14, fontWeight: '400', lineHeight: 20 },
  caption: { fontSize: 12, fontWeight: '400', lineHeight: 16 },
  button: { fontSize: 14, fontWeight: '600', letterSpacing: 0.25 },
} as const;

const SHADOWS = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 8,
  },
} as const;

const RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 9999,
} as const;

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ============ REUSABLE COMPONENTS ============
const Card: React.FC<{
  children: React.ReactNode;
  onPress?: () => void;
  variant?: 'default' | 'elevated' | 'outlined';
  style?: any;
  isUnread?: boolean;
}> = ({ children, onPress, variant = 'default', style, isUnread }) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    if (onPress) {
      scale.value = withSpring(0.98);
    }
  };

  const handlePressOut = () => {
    if (onPress) {
      scale.value = withSpring(1);
    }
  };

  const cardStyles = {
    backgroundColor: COLORS.surface.light,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    ...(variant === 'elevated' && SHADOWS.md),
    ...(variant === 'outlined' && {
      borderWidth: 1,
      borderColor: COLORS.neutral[200],
      backgroundColor: 'transparent',
    }),
    ...(isUnread && {
      borderLeftWidth: 4,
      borderLeftColor: COLORS.primary[500],
    }),
  };

  if (onPress) {
    return (
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        <Animated.View style={[cardStyles, animatedStyle, style]}>
          {children}
        </Animated.View>
      </TouchableOpacity>
    );
  }

  return (
    <Animated.View style={[cardStyles, style]}>
      {children}
    </Animated.View>
  );
};

const Badge: React.FC<{
  children: React.ReactNode;
  variant?: 'success' | 'warning' | 'error' | 'neutral' | 'primary' | 'info';
  size?: 'sm' | 'md';
}> = ({ children, variant = 'neutral', size = 'md' }) => {
  const variantConfig = {
    success: {
      backgroundColor: COLORS.success[50],
      textColor: COLORS.success[600],
    },
    warning: {
      backgroundColor: COLORS.warning[50],
      textColor: COLORS.warning[600],
    },
    error: {
      backgroundColor: COLORS.error[50],
      textColor: COLORS.error[600],
    },
    neutral: {
      backgroundColor: COLORS.neutral[100],
      textColor: COLORS.neutral[700],
    },
    primary: {
      backgroundColor: COLORS.primary[50],
      textColor: COLORS.primary[600],
    },
    info: {
      backgroundColor: COLORS.info[50],
      textColor: COLORS.info[600],
    },
  };

  return (
    <View
      style={{
        backgroundColor: variantConfig[variant].backgroundColor,
        paddingHorizontal: size === 'sm' ? SPACING.sm : SPACING.md,
        paddingVertical: size === 'sm' ? 2 : SPACING.xs,
        borderRadius: RADIUS.full,
        alignSelf: 'flex-start',
      }}
    >
      <Text
        style={{
          color: variantConfig[variant].textColor,
          fontSize: size === 'sm' ? 10 : 12,
          fontWeight: '600',
        }}
      >
        {children}
      </Text>
    </View>
  );
};

const Button: React.FC<{
  children?: React.ReactNode;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  style?: any;
}> = ({
  children,
  onPress,
  variant = 'primary',
  size = 'md',
  icon,
  style
}) => {
  const scale = useSharedValue(1);
  const bgColor = useSharedValue(
    variant === 'primary' ? COLORS.primary[500] :
      variant === 'secondary' ? COLORS.neutral[100] :
        'transparent'
  );

  const buttonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    backgroundColor: bgColor.value,
  }));

  const sizeStyles = {
    sm: {
      paddingVertical: SPACING.xs,
      paddingHorizontal: SPACING.md,
      height: 32,
    },
    md: {
      paddingVertical: SPACING.sm,
      paddingHorizontal: SPACING.lg,
      height: 40,
    },
    lg: {
      paddingVertical: SPACING.md,
      paddingHorizontal: SPACING.xl,
      height: 48,
    },
  };

  const variantStyles = {
    primary: {
      backgroundColor: COLORS.primary[500],
      textColor: '#ffffff',
    },
    secondary: {
      backgroundColor: COLORS.neutral[100],
      textColor: COLORS.neutral[700],
    },
    ghost: {
      backgroundColor: 'transparent',
      textColor: COLORS.primary[500],
    },
    outline: {
      backgroundColor: 'transparent',
      textColor: COLORS.neutral[700],
      borderWidth: 1,
      borderColor: COLORS.neutral[300],
    },
  };

  const handlePressIn = () => {
    scale.value = withSpring(0.98);
    if (variant === 'primary') {
      bgColor.value = withTiming(COLORS.primary[600]);
    } else if (variant === 'secondary') {
      bgColor.value = withTiming(COLORS.neutral[200]);
    }
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
    if (variant === 'primary') {
      bgColor.value = withTiming(COLORS.primary[500]);
    } else if (variant === 'secondary') {
      bgColor.value = withTiming(COLORS.neutral[100]);
    }
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[{ width: 'auto' }, style]}
    >
      <Animated.View
        style={[
          {
            borderRadius: RADIUS.md,
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'row',
            gap: SPACING.sm,
          },
          sizeStyles[size],
          variant !== 'ghost' && SHADOWS.sm,
          buttonStyle,
        ]}
      >
        {icon}
        <Text
          style={{
            color: variantStyles[variant].textColor,
            ...TYPOGRAPHY.button,
            fontSize: size === 'sm' ? 12 : 14,
          }}
        >
          {children}
        </Text>
      </Animated.View>
    </TouchableOpacity>
  );
};

// ============ MAIN SCREEN COMPONENT ============
export default function MessagesScreen() {
  const { colors } = useTheme();
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [filteredMessages, setFilteredMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterVisible, setFilterVisible] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'all' | 'read' | 'unread' | 'closed'>('all');
  const searchInputRef = useRef<TextInput>(null);

  const loadMessages = useCallback(async () => {
    try {
      console.log('📥 Loading messages...');
      const data = await messageApi.getMessages();
      console.log('📨 Messages loaded:', data.length);
      setMessages(data || []);
    } catch (error) {
      console.error('❌ Error loading messages:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  useEffect(() => {
    let filtered = [...messages];

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (msg) =>
          msg.subject?.toLowerCase().includes(query) ||
          msg.content.toLowerCase().includes(query) ||
          msg.sender_name?.toLowerCase().includes(query)
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      if (statusFilter === 'read') {
        filtered = filtered.filter((msg) => msg.is_read && !msg.is_closed);
      } else if (statusFilter === 'unread') {
        filtered = filtered.filter((msg) => !msg.is_read);
      } else if (statusFilter === 'closed') {
        filtered = filtered.filter((msg) => msg.is_closed);
      }
    }

    setFilteredMessages(filtered);
  }, [messages, searchQuery, statusFilter]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadMessages();
    setRefreshing(false);
  };

  const handleMarkAsRead = async (messageId: string) => {
    try {
      await messageApi.markAsRead(messageId);
      await loadMessages();
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  };

  const handleCloseMessage = async (messageId: string) => {
    try {
      await messageApi.closeMessage(messageId);
      await loadMessages();
      setSelectedMessage(null);
    } catch (error) {
      console.error('Error closing message:', error);
    }
  };

  const getStatusBadge = (message: Message) => {
    if (message.is_closed) {
      return <Badge variant="neutral">Closed</Badge>;
    }
    if (!message.is_read) {
      return <Badge variant="primary">New</Badge>;
    }
    return <Badge variant="success">Read</Badge>;
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return date.toLocaleDateString();
  };

  const renderMessageItem = ({ item, index }: { item: Message; index: number }) => (
    <Animated.View entering={FadeInDown.delay(index * 50).duration(300)}>
      <Card
        onPress={() => {
          setSelectedMessage(item);
          if (!item.is_read) {
            handleMarkAsRead(item.id);
          }
        }}
        variant="elevated"
        isUnread={!item.is_read && !item.is_closed}
        style={styles.messageCard}
      >
        <View style={styles.messageHeader}>
          <View style={styles.senderInfo}>
            <View style={[styles.avatarContainer, { backgroundColor: COLORS.primary[100] }]}>
              <Ionicons name="person" size={20} color={COLORS.primary[600]} />
            </View>
            <View style={styles.senderDetails}>
              <Text style={styles.senderName}>
                {item.sender_name || `User ${item.sender_id}`}
              </Text>
              <Text style={styles.messageDate}>
                {item.created_at ? getTimeAgo(item.created_at) : ''}
              </Text>
            </View>
          </View>
          <View style={styles.badgeContainer}>
            {getStatusBadge(item)}
          </View>
        </View>

        {item.subject ? (
          <Text style={styles.messageSubject}>{item.subject}</Text>
        ) : null}

        <Text
          style={styles.messagePreview}
          numberOfLines={2}
        >
          {item.content}
        </Text>

        <View style={styles.messageFooter}>
          <TouchableOpacity
            onPress={() => {
              setSelectedMessage(item);
              if (!item.is_read) {
                handleMarkAsRead(item.id);
              }
            }}
            style={styles.readMoreButton}
          >
            <Text style={styles.readMoreText}>Read message</Text>
            <Ionicons name="chevron-forward" size={16} color={COLORS.primary[500]} />
          </TouchableOpacity>
        </View>
      </Card>
    </Animated.View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Animated.View entering={FadeInUp.duration(500)}>
        <View style={[styles.emptyIconContainer, { backgroundColor: COLORS.primary[50] }]}>
          <Ionicons name="mail-open-outline" size={48} color={COLORS.primary[500]} />
        </View>
        <Text style={styles.emptyTitle}>No messages yet</Text>
        <Text style={styles.emptySubtitle}>
          {searchQuery || statusFilter !== 'all'
            ? 'Try adjusting your filters'
            : 'Messages from donors will appear here'}
        </Text>
        {(searchQuery || statusFilter !== 'all') && (
          <Button
            variant="primary"
            onPress={() => {
              setSearchQuery('');
              setStatusFilter('all');
            }}
            style={{ marginTop: SPACING.lg }}
          >
            Clear filters
          </Button>
        )}
      </Animated.View>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: COLORS.neutral[50] }]}>
      {/* Header */}
      <Animated.View entering={FadeInDown.duration(400)} style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.headerTitle}>Messages</Text>
            <Text style={styles.headerSubtitle}>
              {filteredMessages.length} message{filteredMessages.length !== 1 ? 's' : ''}
              {statusFilter !== 'all' && ` • ${statusFilter}`}
            </Text>
          </View>
          <TouchableOpacity
            onPress={handleRefresh}
            style={[styles.refreshButton, refreshing && styles.refreshButtonRotating]}
          >
            <Ionicons
              name="refresh"
              size={20}
              color={COLORS.primary[500]}
            />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Ionicons name="search" size={20} color={COLORS.neutral[400]} style={styles.searchIcon} />
            <TextInput
              ref={searchInputRef}
              placeholder="Search messages..."
              placeholderTextColor={COLORS.neutral[400]}
              value={searchQuery}
              onChangeText={setSearchQuery}
              style={styles.searchInput}
              clearButtonMode="while-editing"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity
                onPress={() => setSearchQuery('')}
                style={styles.clearButton}
              >
                <Ionicons name="close-circle" size={20} color={COLORS.neutral[400]} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Filter Chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterContainer}
          contentContainerStyle={styles.filterContent}
        >
          {(['all', 'unread', 'read', 'closed'] as const).map((filter) => (
            <TouchableOpacity
              key={filter}
              onPress={() => setStatusFilter(filter)}
              style={[
                styles.filterChip,
                statusFilter === filter && styles.filterChipActive,
              ]}
            >
              <Text
                style={[
                  styles.filterChipText,
                  statusFilter === filter && styles.filterChipTextActive,
                ]}
              >
                {filter.charAt(0).toUpperCase() + filter.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </Animated.View>

      {/* Messages List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <Ionicons name="hourglass-outline" size={48} color={COLORS.primary[500]} />
          <Text style={styles.loadingText}>Loading messages...</Text>
        </View>
      ) : filteredMessages.length === 0 ? (
        renderEmptyState()
      ) : (
        <ScrollView
          style={styles.listContainer}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={COLORS.primary[500]}
            />
          }
          showsVerticalScrollIndicator={false}
        >
          {filteredMessages.map((item, index) => renderMessageItem({ item, index }))}
          <View style={{ height: SPACING['3xl'] }} />
        </ScrollView>
      )}

      {/* Message Detail Modal */}
      <Modal
        visible={!!selectedMessage}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setSelectedMessage(null)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <View style={styles.modalHeaderLeft}>
              <TouchableOpacity
                onPress={() => setSelectedMessage(null)}
                style={styles.modalBackButton}
              >
                <Ionicons name="arrow-back" size={24} color={COLORS.neutral[700]} />
              </TouchableOpacity>
              <View>
                <Text style={styles.modalTitle}>
                  {selectedMessage?.subject || 'Message Details'}
                </Text>
                <Text style={styles.modalSubtitle}>
                  From: {selectedMessage?.sender_name || `User ${selectedMessage?.sender_id}`}
                </Text>
              </View>
            </View>
            <View style={styles.modalActions}>
              {selectedMessage && !selectedMessage.is_read && (
                <TouchableOpacity
                  onPress={() => selectedMessage && handleMarkAsRead(selectedMessage.id)}
                  style={styles.modalActionButton}
                >
                  <Ionicons name="checkmark-done" size={22} color={COLORS.success[600]} />
                </TouchableOpacity>
              )}
              {selectedMessage && !selectedMessage.is_closed && (
                <TouchableOpacity
                  onPress={() => selectedMessage && handleCloseMessage(selectedMessage.id)}
                  style={styles.modalActionButton}
                >
                  <Ionicons name="checkmark-circle-outline" size={22} color={COLORS.primary[500]} />
                </TouchableOpacity>
              )}
            </View>
          </View>

          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            <View style={styles.messageDetailCard}>
              <View style={styles.messageDetailHeader}>
                <View style={styles.senderAvatar}>
                  <Ionicons name="person" size={32} color={COLORS.primary[600]} />
                </View>
                <View style={styles.messageDetailInfo}>
                  <Text style={styles.messageDetailSender}>
                    {selectedMessage?.sender_name || `User ${selectedMessage?.sender_id}`}
                  </Text>
                  <Text style={styles.messageDetailDate}>
                    {selectedMessage?.created_at
                      ? new Date(selectedMessage.created_at).toLocaleString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })
                      : ''}
                  </Text>
                </View>
                <View style={styles.messageDetailStatus}>
                  {selectedMessage && getStatusBadge(selectedMessage)}
                </View>
              </View>

              {selectedMessage?.subject && (
                <View style={styles.messageDetailSubject}>
                  <Text style={styles.messageDetailSubjectText}>{selectedMessage.subject}</Text>
                </View>
              )}

              <View style={styles.messageDetailBody}>
                <Text style={styles.messageDetailContent}>{selectedMessage?.content}</Text>
              </View>
            </View>

            <View style={{ height: 100 }} />
          </ScrollView>

          <View style={styles.modalFooter}>
            <Button
              variant="secondary"
              onPress={() => setSelectedMessage(null)}
              style={{ flex: 1 }}
              size="lg"
            >
              Close
            </Button>
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.md,
    backgroundColor: COLORS.neutral[50],
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.neutral[900],
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: COLORS.neutral[500],
    marginTop: 4,
  },
  refreshButton: {
    padding: SPACING.sm,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.surface.light,
    ...SHADOWS.sm,
  },
  refreshButtonRotating: {
    transform: [{ rotate: '180deg' }],
  },
  searchContainer: {
    marginBottom: SPACING.md,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface.light,
    borderRadius: RADIUS.lg,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    ...SHADOWS.sm,
    borderWidth: 1,
    borderColor: COLORS.neutral[200],
  },
  searchIcon: {
    marginRight: SPACING.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: COLORS.neutral[900],
    paddingVertical: Platform.OS === 'ios' ? SPACING.xs : 0,
  },
  clearButton: {
    padding: SPACING.xs,
  },
  filterContainer: {
    marginBottom: SPACING.sm,
  },
  filterContent: {
    gap: SPACING.sm,
  },
  filterChip: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.surface.light,
    borderWidth: 1,
    borderColor: COLORS.neutral[200],
  },
  filterChipActive: {
    backgroundColor: COLORS.primary[500],
    borderColor: COLORS.primary[500],
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.neutral[600],
  },
  filterChipTextActive: {
    color: '#FFFFFF',
  },
  listContainer: {
    flex: 1,
  },
  listContent: {
    padding: SPACING.lg,
    gap: SPACING.md,
  },
  messageCard: {
    marginBottom: 0,
  },
  messageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  senderInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  senderDetails: {
    flex: 1,
  },
  senderName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.neutral[900],
  },
  messageDate: {
    fontSize: 12,
    color: COLORS.neutral[500],
    marginTop: 2,
  },
  badgeContainer: {
    marginLeft: SPACING.sm,
  },
  messageSubject: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.neutral[900],
    marginBottom: SPACING.sm,
  },
  messagePreview: {
    fontSize: 14,
    color: COLORS.neutral[600],
    lineHeight: 20,
    marginBottom: SPACING.md,
  },
  messageFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  readMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  readMoreText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary[500],
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: COLORS.neutral[500],
    marginTop: SPACING.md,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING['3xl'],
  },
  emptyIconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.lg,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.neutral[900],
    marginBottom: SPACING.sm,
  },
  emptySubtitle: {
    fontSize: 14,
    color: COLORS.neutral[500],
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: COLORS.neutral[50],
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.surface.light,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.neutral[200],
  },
  modalHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  modalBackButton: {
    padding: SPACING.xs,
    marginRight: SPACING.sm,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.neutral[900],
  },
  modalSubtitle: {
    fontSize: 13,
    color: COLORS.neutral[500],
    marginTop: 2,
  },
  modalActions: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  modalActionButton: {
    padding: SPACING.sm,
  },
  modalContent: {
    flex: 1,
  },
  messageDetailCard: {
    backgroundColor: COLORS.surface.light,
    margin: SPACING.lg,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    ...SHADOWS.md,
  },
  messageDetailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.lg,
    paddingBottom: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.neutral[100],
  },
  senderAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary[100],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  messageDetailInfo: {
    flex: 1,
  },
  messageDetailSender: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.neutral[900],
  },
  messageDetailDate: {
    fontSize: 13,
    color: COLORS.neutral[500],
    marginTop: 2,
  },
  messageDetailStatus: {
    marginLeft: SPACING.sm,
  },
  messageDetailSubject: {
    marginBottom: SPACING.lg,
  },
  messageDetailSubjectText: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.neutral[900],
  },
  messageDetailBody: {
    backgroundColor: COLORS.neutral[50],
    borderRadius: RADIUS.md,
    padding: SPACING.lg,
  },
  messageDetailContent: {
    fontSize: 16,
    color: COLORS.neutral[800],
    lineHeight: 26,
  },
  modalFooter: {
    flexDirection: 'row',
    padding: SPACING.lg,
    backgroundColor: COLORS.surface.light,
    borderTopWidth: 1,
    borderTopColor: COLORS.neutral[200],
  },
});
