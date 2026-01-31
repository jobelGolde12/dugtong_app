import { Ionicons } from '@expo/vector-icons';
import { router, usePathname } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
  Alert,
  GestureResponderEvent,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../contexts/ThemeContext';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [isOpen, setIsOpen] = useState(false);

  // Constants
  const sidebarWidth = 280;

  // Animation values - sidebarWidth must be defined before these
  const sidebarTranslateX = useSharedValue(-sidebarWidth);
  const backdropOpacity = useSharedValue(0);
  const toggleButtonScale = useSharedValue(1);
  const toggleButtonOpacity = useSharedValue(1);

  // Animation configuration for smooth, performant transitions
  const animationConfig = {
    duration: 280,
    easing: Easing.out(Easing.cubic),
  };

  // Calculate header height with safe area (handles notch/status bar)
  const headerTopPadding = Math.max(insets.top + 12, insets.top + 4);
  
  /**
   * Opens the sidebar with smooth timing animation
   */
  const openSidebar = useCallback(() => {
    'worklet';
    setIsOpen(true);
    sidebarTranslateX.value = withTiming(0, animationConfig);
    backdropOpacity.value = withTiming(0.3, { duration: 200 });
    // Button scale animation for feedback
    toggleButtonScale.value = withTiming(0.9, { duration: 100 }, () => {
      toggleButtonScale.value = withTiming(1, { duration: 150 });
    });
    toggleButtonOpacity.value = withTiming(1, { duration: 200 });
  }, []);

  /**
   * Closes the sidebar with smooth timing animation
   */
  const closeSidebar = useCallback(() => {
    'worklet';
    setIsOpen(false);
    sidebarTranslateX.value = withTiming(-sidebarWidth, animationConfig);
    backdropOpacity.value = withTiming(0, { duration: 200 });
  }, []);

  /**
   * Toggles sidebar state
   */
  const toggleSidebar = useCallback(() => {
    if (isOpen) {
      closeSidebar();
    } else {
      openSidebar();
    }
  }, [isOpen, openSidebar, closeSidebar]);

  /**
   * Swipe gesture handler for closing sidebar on left swipe
   * and opening on right swipe (from sidebar edge)
   */
  const swipeGesture = Gesture.Pan()
    .onChange((event) => {
      // Handle closing swipe (leftward from open state)
      if (event.translationX < 0 && isOpen) {
        sidebarTranslateX.value = Math.max(event.translationX, -sidebarWidth);
        backdropOpacity.value = withTiming(
          Math.max(0, 0.3 + (event.translationX / sidebarWidth) * 0.3),
          { duration: 0 }
        );
      }
      // Handle opening swipe (rightward from closed state)
      else if (event.translationX > 0 && !isOpen) {
        sidebarTranslateX.value = Math.min(0, -sidebarWidth + event.translationX);
        backdropOpacity.value = withTiming(
          Math.min(0.3, (event.translationX / sidebarWidth) * 0.3),
          { duration: 0 }
        );
      }
    })
    .onEnd((event) => {
      if (isOpen) {
        // Closing logic - threshold at 60px for smooth feel
        if (event.translationX < -60) {
          runOnJS(closeSidebar)();
        } else {
          runOnJS(openSidebar)();
        }
      } else {
        // Opening logic
        if (event.translationX > 60) {
          runOnJS(openSidebar)();
        } else {
          // Snap back to closed state
          runOnJS(closeSidebar)();
        }
      }
    });

  /**
   * Swipe gesture for main content area - swipe right from edge to open sidebar
   */
  const mainContentSwipe = Gesture.Pan()
    .onEnd((event) => {
      // Only open if swiping rightward from left edge area
      if (event.translationX > 80 && !isOpen) {
        runOnJS(openSidebar)();
      }
    });

  // Animated styles for sidebar
  const sidebarAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: sidebarTranslateX.value }],
  }));

  // Animated styles for backdrop
  const backdropAnimatedStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
    pointerEvents: backdropOpacity.value > 0 ? 'auto' : 'none',
  }));

  // Animated style for toggle button scale
  const toggleButtonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: toggleButtonScale.value }],
  }));

  // Animated style for toggle button opacity (when sidebar opens, button stays visible)
  const toggleButtonContainerStyle = useAnimatedStyle(() => ({
    opacity: toggleButtonOpacity.value,
  }));

  const styles = createStyles(colors, insets, headerTopPadding, isOpen);

  /**
   * Handle logout with confirmation
   */
  const handleLogout = useCallback(() => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', onPress: () => router.replace('/') },
      ]
    );
  }, []);

  /**
   * Navigation items with icon configuration
   * Uses Ionicons for consistent, modern iconography
   */
  interface NavItemData {
    label: string;
    path: `/${string}`;
    icon: string;
    iconOutline: string;
  }
  
  const navigationItems: NavItemData[] = [
    { label: 'Find Donor', path: '/search', icon: 'search', iconOutline: 'search-outline' },
    { label: 'Donor Management', path: '/donor-management', icon: 'people', iconOutline: 'people-outline' },
    { label: 'Reports', path: '/reports', icon: 'bar-chart', iconOutline: 'bar-chart-outline' },
    { label: 'Notification', path: '/notifications', icon: 'notifications', iconOutline: 'notifications-outline' },
    { label: 'Settings', path: '/settings', icon: 'settings', iconOutline: 'settings-outline' },
  ];

  /**
   * Check if a path is currently active
   */
  const isActive = (path: string) => pathname === path;

  /**
   * NavItem component with press animation
   */
  const NavItem = ({ item }: { item: NavItemData }) => {
    const [isHovered, setIsHovered] = useState(false);
    const scale = useSharedValue(1);
    
    const animatedStyle = useAnimatedStyle(() => ({
      transform: [{ scale: scale.value }],
    }));

    const handlePressIn = () => {
      scale.value = withTiming(0.98, { duration: 100 });
      setIsHovered(true);
    };

    const handlePressOut = () => {
      scale.value = withTiming(1, { duration: 100 });
      setIsHovered(false);
    };

    const handleNav = useCallback(() => {
      router.push(item.path as any);
    }, [item.path]);

    return (
      <Animated.View style={animatedStyle}>
        <Pressable
          style={[
            styles.navItem,
            isActive(item.path) && styles.navItemActive,
            isHovered && !isActive(item.path) && styles.navItemHover,
          ]}
          onPress={handleNav}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
        >
          <Ionicons
            name={isActive(item.path) ? item.icon : item.iconOutline}
            size={22}
            color={isActive(item.path) ? '#fff' : colors.textSecondary}
            style={styles.navIcon}
          />
          <Text
            style={[
              styles.navLabel,
              isActive(item.path) && styles.navLabelActive,
            ]}
          >
            {item.label}
          </Text>
        </Pressable>
      </Animated.View>
    );
  };

  /**
   * Handle backdrop tap to close sidebar
   */
  const handleBackdropTap = useCallback(
    (event: GestureResponderEvent) => {
      // Prevent closing when tapping on sidebar
      if (event.target === undefined || isOpen) {
        closeSidebar();
      }
    },
    [isOpen, closeSidebar]
  );

  return (
    <GestureHandlerRootView style={styles.container}>
      {/* Toggle Button - Dynamic positioning based on sidebar state */}
      {/* When open: Top-right of main header area */}
      {/* When closed: Top-right of collapsed sidebar area */}
      <Animated.View
        style={[
          styles.toggleButtonContainer,
          isOpen ? styles.toggleButtonOpen : styles.toggleButtonClosed,
          toggleButtonContainerStyle,
        ]}
      >
        <Animated.View style={toggleButtonAnimatedStyle}>
          <TouchableOpacity
            style={styles.toggleButton}
            onPress={toggleSidebar}
            accessibilityLabel={isOpen ? 'Close sidebar' : 'Open sidebar'}
            accessibilityRole="button"
            accessibilityHint={isOpen ? 'Closes the navigation drawer' : 'Opens the navigation drawer'}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            activeOpacity={0.7}
          >
            <Ionicons
              name={isOpen ? 'close' : 'menu'}
              size={24}
              color={colors.text}
            />
          </TouchableOpacity>
        </Animated.View>
      </Animated.View>

      {/* Backdrop - Tappable overlay */}
      <Animated.View
        style={[styles.backdrop, backdropAnimatedStyle]}
        onTouchEnd={handleBackdropTap}
        accessibilityRole="button"
        accessibilityLabel="Close sidebar"
      />

      {/* Sidebar with swipe gesture detection */}
      <GestureDetector gesture={swipeGesture}>
        <Animated.View style={[styles.sidebar, sidebarAnimatedStyle]}>
          <View style={styles.sidebarHeader}>
            <Text style={styles.sidebarTitle}>Dugtong</Text>
            <View style={styles.headerDivider} />
          </View>
          
          <View style={styles.navigation}>
            {navigationItems.map((item) => (
              <NavItem key={item.path} item={item} />
            ))}
          </View>

          <View style={styles.sidebarFooter}>
            <TouchableOpacity
              style={styles.logoutButton}
              onPress={handleLogout}
              accessibilityLabel="Logout"
              accessibilityRole="button"
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </GestureDetector>

      {/* Main Content with swipe detection */}
      <GestureDetector gesture={mainContentSwipe}>
        <View style={styles.mainContent}>
          {/* Dashboard Header Area */}
          <View style={styles.dashboardHeader}>
            <View style={styles.headerLeftSpacer} />
          </View>
          {children}
        </View>
      </GestureDetector>
    </GestureHandlerRootView>
  );
}

const createStyles = (colors: any, insets: any, headerTopPadding: number, isOpen: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    // Toggle button container - handles positioning based on sidebar state
    toggleButtonContainer: {
      position: 'absolute',
      zIndex: 1001,
      // When sidebar is OPEN: button is in main content header (top-right)
      // When sidebar is CLOSED: button is at top-right of collapsed sidebar area
    },
    toggleButtonOpen: {
      top: headerTopPadding,
      right: 16,
    },
    toggleButtonClosed: {
      top: headerTopPadding,
      right: 12,
    },
    toggleButton: {
      width: 48,
      height: 48,
      backgroundColor: colors.surface,
      borderRadius: 24,
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 6,
      // iOS ripple effect simulation
      borderWidth: Platform.OS === 'ios' ? 0.5 : 0,
      borderColor: colors.border,
    },
    backdrop: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: '#000',
      zIndex: 998,
    },
    sidebar: {
      position: 'absolute',
      top: 0,
      left: 0,
      bottom: 0,
      width: 280,
      backgroundColor: colors.surface,
      zIndex: 999,
      shadowColor: colors.shadow,
      shadowOffset: { width: 4, height: 0 },
      shadowOpacity: 0.15,
      shadowRadius: 12,
      elevation: 8,
    },
    sidebarHeader: {
      paddingHorizontal: 24,
      paddingVertical: 24,
      paddingTop: Math.max(insets.top + 20, 60),
    },
    sidebarTitle: {
      fontSize: 24,
      fontWeight: '700',
      color: colors.text,
      letterSpacing: -0.5,
    },
    headerDivider: {
      height: 1,
      backgroundColor: colors.border,
      marginTop: 16,
    },
    navigation: {
      flex: 1,
      paddingTop: 16,
      paddingHorizontal: 12,
    },
    navItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 14,
      marginVertical: 2,
      borderRadius: 12,
      backgroundColor: 'transparent',
    },
    navItemActive: {
      backgroundColor: colors.primary,
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 4,
    },
    navItemHover: {
      backgroundColor: colors.border,
    },
    navIcon: {
      marginRight: 14,
      width: 24,
    },
    navLabel: {
      fontSize: 16,
      color: colors.textSecondary,
      fontWeight: '500',
      letterSpacing: -0.2,
    },
    navLabelActive: {
      color: '#fff',
      fontWeight: '600',
    },
    sidebarFooter: {
      paddingHorizontal: 12,
      paddingBottom: Math.max(insets.bottom + 16, 24),
    },
    logoutButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 14,
      paddingHorizontal: 16,
      backgroundColor: '#dc3545',
      borderRadius: 12,
      shadowColor: '#dc3545',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 6,
      elevation: 3,
    },
    logoutText: {
      color: '#fff',
      fontWeight: '600',
      fontSize: 16,
    },
    // Dashboard header area - provides space for toggle button when sidebar is open
    dashboardHeader: {
      height: headerTopPadding + 48,
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
    },
    headerLeftSpacer: {
      flex: 1,
    },
    mainContent: {
      flex: 1,
      backgroundColor: colors.background,
    },
  });

