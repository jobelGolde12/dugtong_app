import React, { createContext, ReactNode, useCallback, useContext, useEffect, useState } from 'react';
import { User } from '../api/auth';
import { apiClient, getApiErrorMessage } from '../api/client';

// ==================== Types ====================

export interface UserPreferences {
  theme_mode: 'light' | 'dark' | 'system';
  notifications_enabled: boolean;
  email_notifications: boolean;
  sms_notifications: boolean;
  language: string;
  updated_at?: string;
}

export interface UserProfile extends User {
  email?: string;
  avatar_url?: string;
  created_at?: string;
  updated_at?: string;
}

interface UserState {
  user: UserProfile | null;
  preferences: UserPreferences | null;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
}

interface UserContextValue extends UserState {
  loadUser: () => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<{ success: boolean; error?: string }>;
  updatePreferences: (preferences: Partial<UserPreferences>) => Promise<{ success: boolean; error?: string }>;
  clearError: () => void;
}

// ==================== Context ====================

const UserContext = createContext<UserContextValue | undefined>(undefined);

// ==================== Default Preferences ====================

const DEFAULT_PREFERENCES: UserPreferences = {
  theme_mode: 'system',
  notifications_enabled: true,
  email_notifications: true,
  sms_notifications: false,
  language: 'en',
};

// ==================== Provider ====================

interface UserProviderProps {
  children: ReactNode;
}

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const [state, setState] = useState<UserState>({
    user: null,
    preferences: null,
    isLoading: false,
    isSaving: false,
    error: null,
  });

  // Load user data on mount
  useEffect(() => {
    loadUser();
  }, []);

  // Load user profile and preferences
  const loadUser = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const [userResponse, preferencesResponse] = await Promise.all([
        apiClient.get<UserProfile>('/users/me'),
        apiClient.get<UserPreferences>('/users/me/preferences'),
      ]);

      setState((prev) => ({
        ...prev,
        user: userResponse.data,
        preferences: preferencesResponse.data,
        isLoading: false,
      }));
    } catch (error) {
      console.error('Error loading user:', error);
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: getApiErrorMessage(error),
      }));
    }
  }, []);

  // Update user profile
  const updateProfile = useCallback(async (data: Partial<UserProfile>) => {
    setState((prev) => ({ ...prev, isSaving: true, error: null }));

    try {
      const response = await apiClient.put<UserProfile>('/users/me', data);

      setState((prev) => ({
        ...prev,
        user: response.data,
        isSaving: false,
      }));

      return { success: true };
    } catch (error) {
      const errorMessage = getApiErrorMessage(error);
      
      setState((prev) => ({
        ...prev,
        isSaving: false,
        error: errorMessage,
      }));

      return { success: false, error: errorMessage };
    }
  }, []);

  // Update user preferences
  const updatePreferences = useCallback(async (preferences: Partial<UserPreferences>) => {
    setState((prev) => ({ ...prev, isSaving: true, error: null }));

    try {
      const response = await apiClient.put<UserPreferences>('/users/me/preferences', preferences);

      setState((prev) => ({
        ...prev,
        preferences: response.data,
        isSaving: false,
      }));

      return { success: true };
    } catch (error) {
      const errorMessage = getApiErrorMessage(error);
      
      setState((prev) => ({
        ...prev,
        isSaving: false,
        error: errorMessage,
      }));

      return { success: false, error: errorMessage };
    }
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  const value: UserContextValue = {
    ...state,
    loadUser,
    updateProfile,
    updatePreferences,
    clearError,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

// ==================== Hook ====================

export const useUser = (): UserContextValue => {
  const context = useContext(UserContext);
  
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  
  return context;
};

export default UserContext;

