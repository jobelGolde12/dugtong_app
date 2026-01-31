import { Ionicons } from '@expo/vector-icons';
import { router, usePathname } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
  Alert,
  GestureResponderEvent,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming
} from 'react-native-reanimated';
import { useTheme } from '../../contexts/ThemeContext';

interface DashboardLayoutProps {
  children: React.ReactNode;
}


export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname();
  const { colors } = useTheme();
  const [isOpen, setIsOpen] = useState(true);

  // Animation values
  const sidebarTranslateX = useSharedValue(0);
  const backdropOpacity = useSharedValue(0);
  const sidebarWidth = 280;

  // Animation configuration for smooth, performant transitions
  const animationConfig = {
    duration: 250,
  };

  /**
   * Opens the sidebar with smooth timing animation
   */
  const openSidebar = useCallback(() => {
    'worklet';
    setIsOpen(true);
    sidebarTranslateX.value = withTiming(0, animationConfig);
    backdropOpacity.value = withTiming(0.3, { duration: 200 });
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
   */
  const swipeGesture = Gesture.Pan()
    .onChange((event) => {
      // Only handle horizontal swipes from right side
      if (event.translationX < 0 && isOpen) {
        sidebarTranslateX.value = Math.max(event.translationX, -sidebarWidth);
        backdropOpacity.value = withTiming(
          Math.max(0, 0.3 + (event.translationX / sidebarWidth) * 0.3),
          { duration: 0 }
        );
      }
    })
    .onEnd((event) => {
      // If swipe threshold exceeded, close sidebar
      if (event.translationX < -50 && isOpen) {
        runOnJS(closeSidebar)();
      } else {
        // Snap back to open state
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

  const styles = createStyles(colors);

  /**
   * Handle logout with confirmation
   */
  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', onPress: () => router.replace('/') }
      ]
    );
  };

  /**
   * Navigation items with icon configuration
   * Uses Ionicons for consistent, modern iconography
   */
  const navigationItems = [
    { label: 'Find Donor', path: '/search', icon: 'search' as const, iconOutline: 'search-outline' as const },
    { label: 'Donor Management', path: '/donor-management', icon: 'people' as const, iconOutline: 'people-outline' as const },
    { label: 'Reports', path: '/reports', icon: 'bar-chart' as const, iconOutline: 'bar-chart-outline' as const },
    { label: 'Notification', path: '/notifications', icon: 'notifications' as const, iconOutline: 'notifications-outline' as const },
    { label: 'Settings', path: '/settings', icon: 'settings' as const, iconOutline: 'settings-outline' as const },
  ];

  /**
   * Check if a path is currently active
   */
  const isActive = (path: string) => pathname === path;

  /**
   * NavItem component with press animation
   */
  const NavItem = ({ item }: { item: typeof navigationItems[0] }) => {
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

    return (
      <Animated.View style={animatedStyle}>
        <Pressable
          style={[
            styles.navItem,
            isActive(item.path) && styles.navItemActive,
            isHovered && !isActive(item.path) && styles.navItemHover,
          ]}
          onPress={() => router.push(item.path)}
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
  const handleBackdropTap = (event: GestureResponderEvent) => {
    // Prevent closing when tapping on sidebar
    if (event.target === undefined || isOpen) {
      closeSidebar();
    }
  };

  return (
    <GestureHandlerRootView style={styles.container}>
      {/* Toggle Button - Fixed position */}
      <TouchableOpacity
        style={styles.toggleButton}
        onPress={toggleSidebar}
        accessibilityLabel={isOpen ? 'Close sidebar' : 'Open sidebar'}
        accessibilityRole="button"
      >
        <Ionicons
          name={isOpen ? 'close' : 'menu'}
          size={22}
          color={colors.textSecondary}
        />
      </TouchableOpacity>

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
            >
              <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </GestureDetector>

      {/* Main Content */}
      <View style={styles.mainContent}>
        {children}
      </View>
    </GestureHandlerRootView>
  );
}

const createStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    toggleButton: {
      position: 'absolute',
      top: 20,
      left: 20,
      zIndex: 1001,
      width: 44,
      height: 44,
      backgroundColor: colors.surface,
      borderRadius: 22,
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 5,
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
      paddingTop: 80,
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
      paddingBottom: 24,
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
    mainContent: {
      flex: 1,
      backgroundColor: colors.background,
    },
  });

