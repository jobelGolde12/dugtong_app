import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Alert, Pressable } from 'react-native';
import { router, usePathname } from 'expo-router';
import Animated, { useAnimatedStyle, withTiming, useSharedValue } from 'react-native-reanimated';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(true);
  const sidebarTranslateX = useSharedValue(0);
  const backdropOpacity = useSharedValue(0);

  const toggleSidebar = () => {
    const newState = !isOpen;
    setIsOpen(newState);
    
    sidebarTranslateX.value = withTiming(newState ? 0 : -280, { duration: 300 });
    backdropOpacity.value = withTiming(newState ? 0.3 : 0, { duration: 300 });
  };

  const closeSidebar = () => {
    setIsOpen(false);
    sidebarTranslateX.value = withTiming(-280, { duration: 300 });
    backdropOpacity.value = withTiming(0, { duration: 300 });
  };

  const sidebarAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: sidebarTranslateX.value }],
  }));

  const backdropAnimatedStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
    pointerEvents: backdropOpacity.value > 0 ? 'auto' : 'none',
  }));

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

  const navigationItems = [
    { label: 'Find Donor', path: '/search', icon: '🔍' },
    { label: 'Donor Management', path: '/donor-management', icon: '👥' },
    { label: 'Reports', path: '/reports', icon: '📊' },
    { label: 'Notification', path: '/notifications', icon: '🔔' },
  ];

  const isActive = (path: string) => pathname === path;

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
            isHovered && !isActive(item.path) && styles.navItemHover
          ]}
          onPress={() => router.push(item.path)}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
        >
          <Text style={[
            styles.navIcon,
            isActive(item.path) && styles.navIconActive
          ]}>
            {item.icon}
          </Text>
          <Text style={[
            styles.navLabel,
            isActive(item.path) && styles.navLabelActive
          ]}>
            {item.label}
          </Text>
        </Pressable>
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Toggle Button */}
      <TouchableOpacity style={styles.toggleButton} onPress={toggleSidebar}>
        <Text style={styles.toggleIcon}>{isOpen ? '✕' : '☰'}</Text>
      </TouchableOpacity>

      {/* Backdrop */}
      <Animated.View 
        style={[styles.backdrop, backdropAnimatedStyle]}
        onTouchEnd={closeSidebar}
      />

      {/* Sidebar */}
      <Animated.View style={[styles.sidebar, sidebarAnimatedStyle]}>
        <View style={styles.sidebarHeader}>
          <Text style={styles.sidebarTitle}>Dashboard</Text>
          <View style={styles.headerDivider} />
        </View>
        
        <View style={styles.navigation}>
          {navigationItems.map((item) => (
            <NavItem key={item.path} item={item} />
          ))}
        </View>

        <View style={styles.sidebarFooter}>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutIcon}>🚪</Text>
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>

      {/* Main Content */}
      <View style={styles.mainContent}>
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  toggleButton: {
    position: 'absolute',
    top: 20,
    left: 20,
    zIndex: 1001,
    width: 44,
    height: 44,
    backgroundColor: '#fff',
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  toggleIcon: {
    fontSize: 18,
    fontWeight: '600',
    color: '#495057',
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
    backgroundColor: '#fff',
    zIndex: 999,
    shadowColor: '#000',
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
    color: '#212529',
    letterSpacing: -0.5,
  },
  headerDivider: {
    height: 1,
    backgroundColor: '#e9ecef',
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
    backgroundColor: '#0d6efd',
    shadowColor: '#0d6efd',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  navItemHover: {
    backgroundColor: '#f8f9fa',
  },
  navIcon: {
    fontSize: 20,
    marginRight: 14,
    width: 24,
    textAlign: 'center',
  },
  navIconActive: {
    opacity: 1,
  },
  navLabel: {
    fontSize: 16,
    color: '#495057',
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
  logoutIcon: {
    fontSize: 18,
    marginRight: 12,
  },
  logoutText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  mainContent: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
});
