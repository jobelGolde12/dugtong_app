import { useState, useCallback, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { ThemeOption, ProfileInfo, ThemeMode } from '../types/theme';
import { useUser } from '../contexts/UserContext';
import { useTheme } from '../contexts/ThemeContext';

export const useSettings = () => {
  const { user, preferences, updateProfile, updatePreferences, isSaving, error } = useUser();
  const { mode, setTheme } = useTheme();

  // Transform user data to ProfileInfo format
  const profile: ProfileInfo = {
    name: user?.name || 'Loading...',
    email: user?.email || 'No email',
    initials: user?.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : '??',
    avatarUrl: user?.avatar_url,
  };

  const themeOptions: ThemeOption[] = [
    {
      key: 'light',
      label: 'Light',
      icon: 'sunny-outline',
      description: 'Bright theme with light backgrounds',
    },
    {
      key: 'dark',
      label: 'Dark',
      icon: 'moon-outline',
      description: 'Dark theme for low light conditions',
    },
    {
      key: 'system',
      label: 'System',
      icon: 'phone-portrait-outline',
      description: 'Follows your device theme settings',
    },
  ];

  // Update profile using UserContext
  const updateProfileData = useCallback(async (newProfile: Partial<ProfileInfo>) => {
    if (!user) return;

    const updateData: any = {};
    if (newProfile.name) updateData.name = newProfile.name;
    if (newProfile.email) updateData.email = newProfile.email;
    if (newProfile.avatarUrl !== undefined) updateData.avatar_url = newProfile.avatarUrl;

    await updateProfile(updateData);
  }, [user, updateProfile]);

  // Handle theme change and sync with backend
  const handleThemeChange = useCallback(async (themeKey: string) => {
    // Update local theme immediately
    setTheme(themeKey as ThemeMode);
    
    // Sync with backend preferences
    if (preferences) {
      await updatePreferences({ theme_mode: themeKey as ThemeMode });
    }
  }, [setTheme, preferences, updatePreferences]);

  const handleProfileEdit = useCallback(() => {
    // Navigate to edit profile screen
    console.log('Navigate to edit profile');
  }, []);

  const handleProfilePress = useCallback(() => {
    // View profile details
    console.log('View profile details');
  }, []);

  return {
    profile,
    themeOptions,
    updateProfile: updateProfileData,
    handleThemeChange,
    handleProfileEdit,
    handleProfilePress,
    isSaving,
    error,
    currentTheme: preferences?.theme_mode || mode,
  };
};
