import React, { memo, useMemo, useCallback } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  Platform,
  StatusBar,
  Text,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import RoleBasedDashboardLayout from './components/RoleBasedDashboardLayout';
import SettingsSection from './components/SettingsSection';
import ProfileCard from './components/ProfileCard';
import ThemeOption from './components/ThemeOption';
import { useSettings } from '../hooks/useSettings';

function SettingsScreen() {
  const { mode, setTheme, colors, isDark } = useTheme();
  const {
    profile,
    themeOptions,
    handleProfileEdit,
    handleProfilePress,
    handleThemeChange,
    isSaving,
    error,
  } = useSettings();

  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <RoleBasedDashboardLayout>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar
          barStyle={isDark ? 'light-content' : 'dark-content'}
          backgroundColor={colors.background}
          translucent={false}
        />
        <ScrollView
          style={styles.container}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.contentContainer}
          bounces={true}
          overScrollMode="always"
          accessibilityLabel="Settings screen"
        >
          {/* Enhanced Header */}
          <View style={styles.header}>
            <View style={styles.headerIconContainer}>
              <View style={styles.iconBackground}>
                <Ionicons 
                  name="settings-outline" 
                  size={28} 
                  color={colors.primary} 
                />
              </View>
            </View>
            <View style={styles.headerContent}>
              <Text style={styles.title} accessibilityRole="header">
                Settings
              </Text>
              <Text style={styles.subtitle} accessibilityRole="text">
                Customize your experience and manage preferences
              </Text>
            </View>
          </View>

          {/* Profile Section */}
          <SettingsSection
            title="Profile"
            description="Manage your personal information and avatar"
            testID="profile-section"
          >
            <ProfileCard
              name={profile.name}
              email={profile.email}
              initials={profile.initials}
              avatarUrl={profile.avatarUrl}
              onPress={handleProfilePress}
              onEditPress={handleProfileEdit}
            />
          </SettingsSection>

          {/* Theme Section */}
          <SettingsSection
            title="Appearance"
            description="Personalize how the app looks and feels"
            testID="theme-section"
          >
            {themeOptions.map((option, index) => (
              <ThemeOption
                key={option.key}
                option={option}
                isActive={mode === option.key}
                onPress={handleThemeChange}
                isLast={index === themeOptions.length - 1}
              />
            ))}
          </SettingsSection>

          {/* Additional Settings Sections Placeholder */}
          <View style={styles.spacer} />
        </ScrollView>
      </SafeAreaView>
    </RoleBasedDashboardLayout>
  );
}

const createStyles = (colors: any) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: colors.background,
      paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    },
    container: {
      flex: 1,
    },
    contentContainer: {
      padding: 24,
    },
    header: {
      marginBottom: 40,
      alignItems: 'center',
    },
    headerIconContainer: {
      marginBottom: 20,
    },
    iconBackground: {
      width: 64,
      height: 64,
      borderRadius: 32,
      backgroundColor: colors.primary + '15',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 16,
      ...Platform.select({
        ios: {
          shadowColor: colors.primary,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.15,
          shadowRadius: 12,
        },
        android: {
          elevation: 4,
        },
      }),
    },
    headerContent: {
      alignItems: 'center',
      textAlign: 'center',
    },
    title: {
      fontSize: 32,
      fontWeight: '800',
      color: colors.text,
      letterSpacing: -1,
      marginBottom: 8,
      textAlign: 'center',
    },
    subtitle: {
      fontSize: 16,
      color: colors.textSecondary,
      opacity: 0.8,
      lineHeight: 22,
      textAlign: 'center',
      maxWidth: 280,
    },

    spacer: {
      height: 40,
    },
  });

export default memo(SettingsScreen);
