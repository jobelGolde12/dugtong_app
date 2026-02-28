import { Ionicons } from '@expo/vector-icons';
import { router, usePathname } from 'expo-router';
import React, { useCallback } from 'react';
import {
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { getNavigationItemsForRole } from '../utils/roleNavigation';

interface RoleBasedDashboardLayoutProps {
  children: React.ReactNode;
}

const BOTTOM_NAV_HEIGHT = 60;

export default function RoleBasedDashboardLayout({ children }: RoleBasedDashboardLayoutProps) {
  const pathname = usePathname();
  const { colors, isDark } = useTheme();
  const { logout, userRole } = useAuth();
  const insets = useSafeAreaInsets();

  const navHeight = BOTTOM_NAV_HEIGHT + insets.bottom;
  const headerTopPadding = Math.max(insets.top + 12, insets.top + 4);

  const handleLogout = useCallback(() => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          onPress: async () => {
            await logout();
          }
        },
      ]
    );
  }, [logout]);

  const navigationItems = getNavigationItemsForRole(userRole);

  const isActive = (path: string) => pathname === path;

  const NavItem = ({ item, index }: { item: any; index: number }) => {
    const scale = useSharedValue(1);
    
    const animatedStyle = useAnimatedStyle(() => ({
      transform: [{ scale: scale.value }],
    }));

    const handlePressIn = () => {
      scale.value = withTiming(0.95, { duration: 100 });
    };

    const handlePressOut = () => {
      scale.value = withTiming(1, { duration: 100 });
    };

    const handleNav = useCallback(() => {
      router.push(item.path as any);
    }, [item.path]);

    return (
      <Animated.View style={[styles.navItemContainer, animatedStyle]}>
        <TouchableOpacity
          style={[
            styles.navItem,
            isActive(item.path) && styles.navItemActive,
          ]}
          onPress={handleNav}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          activeOpacity={0.7}
        >
          <Ionicons
            name={isActive(item.path) ? item.icon : item.iconOutline}
            size={24}
            color={isActive(item.path) ? colors.primary : colors.textSecondary}
          />
          <Text
            style={[
              styles.navLabel,
              isActive(item.path) && styles.navLabelActive,
            ]}
          >
            {item.label}
          </Text>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const handleSettingsPress = useCallback(() => {
    router.push('/settings');
  }, []);

  const getDashboardTitle = () => {
    switch (userRole) {
      case 'admin':
        return 'Admin Dashboard';
      case 'hospital_staff':
        return 'Hospital Dashboard';
      case 'health_officer':
        return 'Health Officer Dashboard';
      default:
        return 'Dugtong';
    }
  };

  const styles = createStyles(colors, insets, headerTopPadding, isDark, navHeight);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerTitle}>{getDashboardTitle()}</Text>
        </View>
        <TouchableOpacity
          style={styles.settingsButton}
          onPress={handleSettingsPress}
          accessibilityLabel="Settings"
          accessibilityRole="button"
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          activeOpacity={0.7}
        >
          <Ionicons
            name="settings-outline"
            size={24}
            color={colors.text}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.mainContent}>
        {children}
      </View>

      <View style={styles.bottomNav}>
        {navigationItems
          .filter((item) => item.path !== '/settings')
          .map((item, index) => (
            <NavItem key={item.path} item={item} index={index} />
          ))}
      </View>
    </View>
  );
}

const createStyles = (colors: any, insets: any, headerTopPadding: number, isDark: boolean, navHeight: number) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      height: headerTopPadding + 48,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingTop: headerTopPadding - 8,
      backgroundColor: colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    headerLeft: {
      flex: 1,
    },
    headerTitle: {
      fontSize: 20,
      fontWeight: '700',
      color: colors.text,
      letterSpacing: -0.3,
    },
    settingsButton: {
      width: 44,
      height: 44,
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: 22,
      backgroundColor: colors.background,
    },
    mainContent: {
      flex: 1,
      backgroundColor: colors.background,
    },
    bottomNav: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      zIndex: 10,
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'space-around',
      height: navHeight,
      paddingTop: insets.bottom > 0 ? 12 : 8,
      backgroundColor: isDark ? '#1E1E1E' : '#FFFFFF',
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    navItemContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'flex-start',
      height: BOTTOM_NAV_HEIGHT,
      paddingTop: 4,
    },
    navItem: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 4,
      paddingHorizontal: 4,
      borderRadius: 12,
      minWidth: 60,
    },
    navItemActive: {
      backgroundColor: colors.primary + '15',
    },
    navLabel: {
      fontSize: 7,
      fontWeight: '500',
      color: colors.textSecondary,
      textAlign: 'center',
      marginTop: 0,
    },
    navLabelActive: {
      color: colors.primary,
      fontWeight: '600',
    },
    logoutNavItem: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 8,
      paddingHorizontal: 12,
      borderRadius: 12,
      minWidth: 60,
    },
    logoutLabel: {
      fontSize: 9,
      fontWeight: '500',
      color: '#dc3545',
      marginTop: 2,
      textAlign: 'center',
    },
  });
