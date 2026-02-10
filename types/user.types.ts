export interface UserPreferences {
  theme_mode: 'light' | 'dark' | 'system';
  notifications_enabled: boolean;
  email_notifications: boolean;
  sms_notifications: boolean;
  language: string;
  updated_at?: string;
}

import { UserRole } from '../constants/roles.constants';

export interface UserProfile {
  id: string;
  role: UserRole;
  name: string;
  contact_number: string;
  email?: string;
  avatar_url?: string;
  created_at?: string;
  updated_at?: string;
}
