import React, { createContext, ReactNode, useCallback, useContext, useEffect, useState } from 'react';
import { getApiErrorMessage } from '../api/client';
import { getUserPreferences, getUserProfile, updateUserPreferences, updateUserProfile } from '../api/users';
import { UserPreferences, UserProfile } from '../types/user.types';
import { useAuth } from './AuthContext';

// ==================== Types ====================

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

// ==================== Provider ====================

interface UserProviderProps {
  children: ReactNode;
}

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [state, setState] = useState<UserState>({
    user: null,
    preferences: null,
    isLoading: false,
    isSaving: false,
    error: null,
  });

  // Load user data when authenticated
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      loadUser();
    }
  }, [isAuthenticated, authLoading]);

  // Load user profile and preferences
  const loadUser = useCallback(async () => {
    if (!isAuthenticated) return;

    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const [userResponse, preferencesResponse] = await Promise.all([
        getUserProfile(),
        getUserPreferences(),
      ]);

      setState((prev) => ({
        ...prev,
        user: userResponse,
        preferences: preferencesResponse,
        isLoading: false,
      }));
    } catch (error) {
      console.error('Error loading user:', error);
      const errorMessage = getApiErrorMessage(error);

      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
    }
  }, [isAuthenticated]);

  // Update user profile
  const updateProfile = useCallback(async (data: Partial<UserProfile>) => {
    setState((prev) => ({ ...prev, isSaving: true, error: null }));

    try {
      const response = await updateUserProfile(data);

      setState((prev) => ({
        ...prev,
        user: response,
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
      const response = await updateUserPreferences(preferences);

      setState((prev) => ({
        ...prev,
        preferences: response,
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
