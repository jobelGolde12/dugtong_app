export interface UserPreferences {
  theme_mode: 'light' | 'dark' | 'system';
  notifications_enabled: boolean;
  email_notifications: boolean;
  sms_notifications: boolean;
  language: string;
  updated_at?: string;
}

export interface UserProfile {
  id: string;
  role: 'admin' | 'donor';
  name: string;
  contact_number: string;
  email?: string;
  avatar_url?: string;
  created_at?: string;
  updated_at?: string;
}
