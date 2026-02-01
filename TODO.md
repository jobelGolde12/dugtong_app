// types/theme.ts - Type definitions for theme
export type ThemeMode = 'light' | 'dark' | 'system';
export type ThemeKey = 'light' | 'dark' | 'system';

export interface ThemeColors {
background: string;
surface: string;
surfaceVariant: string;
primary: string;
primaryVariant: string;
secondary: string;
text: string;
textSecondary: string;
textOnPrimary: string;
textOnSecondary: string;
border: string;
shadow: string;
error: string;
success: string;
warning: string;
info: string;
disabled: string;
ripple: string;
}

export interface ThemeOption {
key: ThemeKey;
label: string;
icon: string;
description: string;
}

export interface ProfileInfo {
name: string;
email: string;
initials: string;
avatarUrl?: string;
}
typescript
// components/SettingsSection.tsx - Reusable section component
import React, { memo, ReactNode } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

interface SettingsSectionProps {
title: string;
description?: string;
children: ReactNode;
containerStyle?: object;
testID?: string;
}

const SettingsSection: React.FC<SettingsSectionProps> = memo(({
title,
description,
children,
containerStyle,
testID,
}) => {
const { colors } = useTheme();
const styles = createStyles(colors);

return (
<View
style={[styles.container, containerStyle]}
testID={testID}
accessibilityRole="region"
accessibilityLabel={`${title} settings section`} >
<View style={styles.header}>
<Text style={styles.title} accessibilityRole="header">
{title}
</Text>
{description && (
<Text style={styles.description}>{description}</Text>
)}
</View>
<View style={styles.content}>
{children}
</View>
</View>
);
});

const createStyles = (colors: any) => StyleSheet.create({
container: {
marginBottom: 32,
},
header: {
marginBottom: 20,
},
title: {
fontSize: 20,
fontWeight: '600',
color: colors.text,
letterSpacing: -0.5,
marginBottom: 4,
},
description: {
fontSize: 14,
color: colors.textSecondary,
lineHeight: 20,
},
content: {
backgroundColor: colors.surface,
borderRadius: 16,
overflow: 'hidden',
shadowColor: colors.shadow,
shadowOffset: { width: 0, height: 2 },
shadowOpacity: 0.1,
shadowRadius: 12,
elevation: 3,
},
});

export default SettingsSection;
typescript
// components/ProfileCard.tsx - Profile display component
import React, { memo } from 'react';
import {
View,
Text,
TouchableOpacity,
StyleSheet,
Image,
Platform,
} from 'react-native';
import { ProfileInfo } from '../types/theme';
import { useTheme } from '../contexts/ThemeContext';

interface ProfileCardProps extends ProfileInfo {
onPress?: () => void;
showEditButton?: boolean;
onEditPress?: () => void;
}

const ProfileCard: React.FC<ProfileCardProps> = memo(({
name,
email,
initials,
avatarUrl,
onPress,
showEditButton = true,
onEditPress,
}) => {
const { colors } = useTheme();
const styles = createStyles(colors);

const handlePress = () => {
if (onPress) onPress();
};

const handleEditPress = () => {
if (onEditPress) onEditPress();
};

const renderAvatar = () => {
if (avatarUrl) {
return (
<Image
source={{ uri: avatarUrl }}
style={styles.avatar}
accessibilityLabel={`Profile picture of ${name}`}
/>
);
}

    return (
      <View style={styles.avatarFallback}>
        <Text style={styles.avatarText} accessibilityLabel={`Initials: ${initials}`}>
          {initials}
        </Text>
      </View>
    );

};

return (
<TouchableOpacity
style={styles.container}
onPress={handlePress}
activeOpacity={0.7}
accessibilityRole="button"
accessibilityLabel={`Profile information for ${name}`}
accessibilityHint="Double tap to edit profile" >
<View style={styles.content}>
{renderAvatar()}
<View style={styles.infoContainer}>
<Text style={styles.name} numberOfLines={1} accessibilityRole="text">
{name}
</Text>
<Text style={styles.email} numberOfLines={1} accessibilityRole="text">
{email}
</Text>
</View>
{showEditButton && (
<TouchableOpacity
style={styles.editButton}
onPress={handleEditPress}
activeOpacity={0.7}
accessibilityRole="button"
accessibilityLabel="Edit profile"
accessibilityHint="Opens profile edit screen"
hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }} >
<Text style={styles.editButtonText}>Edit</Text>
</TouchableOpacity>
)}
</View>
</TouchableOpacity>
);
});

const createStyles = (colors: any) => StyleSheet.create({
container: {
backgroundColor: colors.surface,
borderRadius: 16,
overflow: 'hidden',
},
content: {
flexDirection: 'row',
alignItems: 'center',
padding: 20,
},
avatarFallback: {
width: 64,
height: 64,
borderRadius: 32,
backgroundColor: colors.primary,
justifyContent: 'center',
alignItems: 'center',
marginRight: 16,
},
avatar: {
width: 64,
height: 64,
borderRadius: 32,
marginRight: 16,
},
avatarText: {
fontSize: 20,
fontWeight: '600',
color: colors.textOnPrimary,
},
infoContainer: {
flex: 1,
justifyContent: 'center',
},
name: {
fontSize: 18,
fontWeight: '600',
color: colors.text,
marginBottom: 4,
letterSpacing: -0.3,
},
email: {
fontSize: 14,
color: colors.textSecondary,
opacity: 0.9,
},
editButton: {
paddingHorizontal: 16,
paddingVertical: 8,
backgroundColor: colors.surfaceVariant,
borderRadius: 8,
...Platform.select({
ios: {
shadowColor: colors.shadow,
shadowOffset: { width: 0, height: 1 },
shadowOpacity: 0.1,
shadowRadius: 2,
},
android: {
elevation: 1,
},
}),
},
editButtonText: {
fontSize: 14,
fontWeight: '600',
color: colors.primary,
},
});

export default ProfileCard;
typescript
// components/ThemeOption.tsx - Theme selection option
import React, { memo } from 'react';
import {
TouchableOpacity,
Text,
StyleSheet,
View,
Platform,
} from 'react-native';
import { ThemeOption as ThemeOptionType } from '../types/theme';
import { useTheme } from '../contexts/ThemeContext';

interface ThemeOptionProps {
option: ThemeOptionType;
isActive: boolean;
onPress: (key: string) => void;
isLast?: boolean;
}

const ThemeOption: React.FC<ThemeOptionProps> = memo(({
option,
isActive,
onPress,
isLast = false,
}) => {
const { colors } = useTheme();
const styles = createStyles(colors, isActive, isLast);

const handlePress = () => {
onPress(option.key);
};

return (
<TouchableOpacity
style={styles.container}
onPress={handlePress}
activeOpacity={0.7}
accessibilityRole="radio"
accessibilityState={{ selected: isActive }}
accessibilityLabel={`${option.label} theme`}
accessibilityHint="Double tap to select this theme" >
<View style={styles.content}>
<Text style={styles.icon} accessibilityElementsHidden={true}>
{option.icon}
</Text>
<View style={styles.textContainer}>
<Text style={styles.label}>{option.label}</Text>
<Text style={styles.description} numberOfLines={2}>
{option.description}
</Text>
</View>
<View style={styles.radioContainer}>
<View style={styles.radioOuter}>
{isActive && <View style={styles.radioInner} />}
</View>
</View>
</View>
</TouchableOpacity>
);
});

const createStyles = (colors: any, isActive: boolean, isLast: boolean) =>
StyleSheet.create({
container: {
padding: 16,
borderBottomWidth: isLast ? 0 : 1,
borderBottomColor: isLast ? 'transparent' : colors.border,
backgroundColor: isActive ? colors.primary + '15' : 'transparent',
},
content: {
flexDirection: 'row',
alignItems: 'center',
},
icon: {
fontSize: 24,
marginRight: 12,
minWidth: 32,
},
textContainer: {
flex: 1,
marginRight: 12,
},
label: {
fontSize: 16,
fontWeight: isActive ? '600' : '500',
color: isActive ? colors.primary : colors.text,
marginBottom: 2,
letterSpacing: -0.3,
},
description: {
fontSize: 13,
color: colors.textSecondary,
lineHeight: 18,
opacity: 0.8,
},
radioContainer: {
padding: 4,
},
radioOuter: {
width: 20,
height: 20,
borderRadius: 10,
borderWidth: 2,
borderColor: isActive ? colors.primary : colors.border,
justifyContent: 'center',
alignItems: 'center',
backgroundColor: 'transparent',
},
radioInner: {
width: 10,
height: 10,
borderRadius: 5,
backgroundColor: colors.primary,
},
});

export default ThemeOption;
typescript
// hooks/useSettings.ts - Custom hook for settings logic
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
typescript
// screens/SettingsScreen.tsx - Main settings screen
import React, { memo, useMemo } from 'react';
import {
StyleSheet,
View,
ScrollView,
SafeAreaView,
Platform,
StatusBar,
} from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import DashboardLayout from './components/DashboardLayout';
import SettingsSection from '../components/SettingsSection';
import ProfileCard from '../components/ProfileCard';
import ThemeOption from '../components/ThemeOption';
import { useSettings } from '../hooks/useSettings';

const SettingsScreen: React.FC = memo(() => {
const { mode, setTheme, colors, isDark } = useTheme();
const {
profile,
themeOptions,
handleProfileEdit,
handleProfilePress,
} = useSettings();

const styles = useMemo(() => createStyles(colors), [colors]);

const handleThemeChange = useCallback((themeKey: string) => {
setTheme(themeKey);
}, [setTheme]);

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
{/_ Header _/}
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
});

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

export default SettingsScreen;
typescript
// enhanced ThemeContext.tsx - Updated with proper types
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useColorScheme } from 'react-native';
import { ThemeMode, ThemeColors } from '../types/theme';

interface ThemeContextType {
mode: ThemeMode;
colors: ThemeColors;
isDark: boolean;
setTheme: (mode: ThemeMode) => void;
}

const lightColors: ThemeColors = {
background: '#FFFFFF',
surface: '#F8F9FA',
surfaceVariant: '#E9ECEF',
primary: '#4361EE',
primaryVariant: '#3A56D4',
secondary: '#7209B7',
text: '#212529',
textSecondary: '#6C757D',
textOnPrimary: '#FFFFFF',
textOnSecondary: '#FFFFFF',
border: '#DEE2E6',
shadow: '#000000',
error: '#E63946',
success: '#2A9D8F',
warning: '#F4A261',
info: '#457B9D',
disabled: '#ADB5BD',
ripple: '#4361EE1A',
};

const darkColors: ThemeColors = {
background: '#121212',
surface: '#1E1E1E',
surfaceVariant: '#2D2D2D',
primary: '#6C8CFF',
primaryVariant: '#5A7AE6',
secondary: '#9D4EDD',
text: '#E9ECEF',
textSecondary: '#ADB5BD',
textOnPrimary: '#FFFFFF',
textOnSecondary: '#FFFFFF',
border: '#495057',
shadow: '#000000',
error: '#FF6B6B',
success: '#4ECDC4',
warning: '#FFD166',
info: '#118AB2',
disabled: '#6C757D',
ripple: '#6C8CFF1A',
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
const systemColorScheme = useColorScheme();
const [mode, setMode] = useState<ThemeMode>('system');

const getActualMode = useCallback((): 'light' | 'dark' => {
if (mode === 'system') {
return systemColorScheme === 'dark' ? 'dark' : 'light';
}
return mode;
}, [mode, systemColorScheme]);

const getColors = useCallback((): ThemeColors => {
const actualMode = getActualMode();
return actualMode === 'dark' ? darkColors : lightColors;
}, [getActualMode]);

const handleSetTheme = useCallback((newMode: ThemeMode) => {
setMode(newMode);
}, []);

const value = {
mode,
colors: getColors(),
isDark: getActualMode() === 'dark',
setTheme: handleSetTheme,
};

return (
<ThemeContext.Provider value={value}>
{children}
</ThemeContext.Provider>
);
};

export const useTheme = (): ThemeContextType => {
const context = useContext(ThemeContext);
if (!context) {
throw new Error('useTheme must be used within a ThemeProvider');
}
return context;
};
