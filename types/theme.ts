export type ThemeMode = 'light' | 'dark' | 'system';
export type ThemeKey = 'light' | 'dark' | 'system';

export interface ThemeColors {
  background: string;
  surface: string;
  surfaceVariant: string;
  card: string;
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
