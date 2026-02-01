import { useState, useCallback, useEffect } from 'react';
import { ThemeOption, ProfileInfo } from '../types/theme';

export const useSettings = () => {
  const [profile, setProfile] = useState<ProfileInfo>({
    name: 'John Doe',
    email: 'john.doe@example.com',
    initials: 'JD',
    avatarUrl: undefined,
  });

  const themeOptions: ThemeOption[] = [
    {
      key: 'light',
      label: 'Light',
      icon: '☀️',
      description: 'Bright theme with light backgrounds',
    },
    {
      key: 'dark',
      label: 'Dark',
      icon: '🌙',
      description: 'Dark theme for low light conditions',
    },
    {
      key: 'system',
      label: 'System',
      icon: '⚙️',
      description: 'Follows your device theme settings',
    },
  ];

  const updateProfile = useCallback((newProfile: Partial<ProfileInfo>) => {
    setProfile((prev) => ({ ...prev, ...newProfile }));
  }, []);

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
    updateProfile,
    handleProfileEdit,
    handleProfilePress,
  };
};
