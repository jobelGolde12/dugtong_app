import React, { memo, useMemo, useCallback } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  Platform,
  StatusBar,
  Text,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../contexts/ThemeContext';
import DashboardLayout from './components/DashboardLayout';
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
    <DashboardLayout>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar
          barStyle={isDark ? 'light-content' : 'dark-content'}
          backgroundColor={colors.background}
        />
        <ScrollView
          style={styles.container}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.contentContainer}
          bounces={true}
          overScrollMode="always"
          accessibilityLabel="Settings screen"
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerContent}>
              <Text style={styles.title} accessibilityRole="header">
                Settings
              </Text>
              <Text style={styles.subtitle} accessibilityRole="text">
                Manage your preferences and profile
              </Text>
            </View>
          </View>

          {/* Profile Section */}
          <SettingsSection
            title="Profile"
            description="Update your personal information and avatar"
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
            description="Choose how the app looks on your device"
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
    </DashboardLayout>
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
      marginBottom: 32,
    },
    headerContent: {
      marginBottom: 8,
    },
    title: {
      fontSize: 34,
      fontWeight: '800',
      color: colors.text,
      letterSpacing: -0.5,
      marginBottom: 8,
    },
    subtitle: {
      fontSize: 16,
      color: colors.textSecondary,
      opacity: 0.8,
      lineHeight: 22,
    },
    spacer: {
      height: 40,
    },
  });

export default memo(SettingsScreen);
