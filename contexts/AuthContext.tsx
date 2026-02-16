import { router } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import React, { createContext, ReactNode, useCallback, useContext, useEffect, useState } from 'react';
import { getCurrentUser, login as loginApi, LoginRequest, logout as logoutApi, User } from '../api/auth';
import { clearTokens, getAccessToken } from '../api/client';
import { USER_ROLES, UserRole, DEFAULT_ROLE } from '../constants/roles.constants';

// ==================== Types ====================

interface AuthState {
  isLoading: boolean;
  isAuthenticated: boolean;
  user: User | null;
  userRole: UserRole | null;
  accessToken: string | null;
}

interface AuthContextValue extends AuthState {
  login: (credentials: LoginRequest) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  hasRole: (role: UserRole) => boolean;
}

// ==================== Constants ====================

const USER_STORAGE_KEY = 'user_data';

// ==================== Context ====================

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// ==================== Provider ====================

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, setState] = useState<AuthState>({
    isLoading: true,
    isAuthenticated: false,
    user: null,
    userRole: null,
    accessToken: null,
  });

  // Load persisted auth state on mount
  useEffect(() => {
    initializeAuth();
  }, []);

  // Initialize authentication state
  const initializeAuth = async () => {
    try {
      const accessToken = await getAccessToken();

      if (!accessToken) {
        setState((prev) => ({ ...prev, isLoading: false }));
        return;
      }

      try {
        const user = await getCurrentUser();
        const role = extractUserRole(user);

        setState({
          isLoading: false,
          isAuthenticated: true,
          user,
          userRole: role,
          accessToken,
        });
      } catch (error) {
        console.warn('User authentication failed, clearing auth state:', error);
        await clearAuthState();
        setState((prev) => ({ ...prev, isLoading: false }));
      }
    } catch (error) {
      console.error('Error initializing auth:', error);
      setState((prev) => ({ ...prev, isLoading: false }));
    }
  };

  // Extract user role from user object or token
  const extractUserRole = (user: User): UserRole | null => {
    console.log('🔍 extractUserRole input:', JSON.stringify(user));
    
    // Try to get role directly from user object
    let rawRole = '';
    const userAny = user as unknown as Record<string, unknown>;
    
    if (userAny.role && typeof userAny.role === 'string') {
      rawRole = userAny.role as string;
    } else if (userAny.user_role && typeof userAny.user_role === 'string') {
      rawRole = userAny.user_role as string;
    } else if (userAny.userRole && typeof userAny.userRole === 'string') {
      rawRole = userAny.userRole as string;
    }

    console.log('🔍 rawRole:', rawRole);

    if (!rawRole) {
      console.log('🔍 No role found, returning default donor role');
      return DEFAULT_ROLE;
    }

    const normalizedRole = rawRole.trim().toLowerCase().replace(/[\s-]+/g, '_');
    console.log('🔍 normalizedRole:', normalizedRole);

    const roleAliases: Record<string, UserRole> = {
      admin: USER_ROLES.ADMIN,
      administrator: USER_ROLES.ADMIN,
      donor: USER_ROLES.DONOR,
      hospital_staff: USER_ROLES.HOSPITAL_STAFF,
      hospitalstaff: USER_ROLES.HOSPITAL_STAFF,
      health_officer: USER_ROLES.HEALTH_OFFICER,
      healthofficer: USER_ROLES.HEALTH_OFFICER,
    };

    const result = roleAliases[normalizedRole] ?? DEFAULT_ROLE;
    console.log('🔍 extractUserRole result:', result);
    return result;
  };

  // Clear all auth state
  const clearAuthState = async () => {
    try {
      await SecureStore.deleteItemAsync(USER_STORAGE_KEY);
      await clearTokens();
    } catch (error) {
      console.error('Error clearing auth state:', error);
    }
  };

  // Login
  const login = useCallback(async (credentials: LoginRequest) => {
    try {
      setState((prev) => ({ ...prev, isLoading: true }));

      const response = await loginApi(credentials);
      const { user, access_token } = response;

      console.log('🔐 Login response:', JSON.stringify(user));

      // Save user to secure storage
      await SecureStore.setItemAsync(USER_STORAGE_KEY, JSON.stringify(user));

      // Get role directly - simple string comparison
      const userAny = user as unknown as Record<string, unknown>;
      const rawRole = String(userAny.role || userAny.user_role || userAny.userRole || 'donor');
      const roleLower = rawRole.toLowerCase().trim();
      
      console.log('🔐 Raw role:', roleLower);

      // Determine role - simple if/else
      let role: UserRole;
      if (roleLower === 'admin') {
        role = USER_ROLES.ADMIN;
      } else if (roleLower === 'hospital_staff') {
        role = USER_ROLES.HOSPITAL_STAFF;
      } else if (roleLower === 'health_officer') {
        role = USER_ROLES.HEALTH_OFFICER;
      } else {
        role = USER_ROLES.DONOR;
      }

      console.log('🔐 Final role:', role);

      // Set state
      setState({
        isLoading: false,
        isAuthenticated: true,
        user,
        userRole: role,
        accessToken: access_token,
      });

      // Navigate based on role - IMMEDIATELY, no delays
      console.log('🔐 About to navigate to:', role === USER_ROLES.DONOR ? '/DonorDashboard' : '/dashboard');
      
      if (role === USER_ROLES.DONOR) {
        router.replace('/DonorDashboard');
      } else {
        router.replace('/dashboard');
      }

      return { success: true };
    } catch (error) {
      console.error('Login error:', error);

      let errorMessage = 'Login failed. Please try again.';

      if (error instanceof Error) {
        errorMessage = error.message;
      }

      setState((prev) => ({ ...prev, isLoading: false }));

      return { success: false, error: errorMessage };
    }
  }, [router]);

  // Logout
  const logout = useCallback(async () => {
    try {
      setState((prev) => ({ ...prev, isLoading: true }));

      // Call logout API
      await logoutApi();

      // Clear local state
      await clearAuthState();

      setState({
        isLoading: false,
        isAuthenticated: false,
        user: null,
        userRole: null,
        accessToken: null,
      });

      // Navigate to welcome page
      router.replace('/');
    } catch (error) {
      console.error('Logout error:', error);

      // Still clear local state even if API call fails
      await clearAuthState();

      setState({
        isLoading: false,
        isAuthenticated: false,
        user: null,
        userRole: null,
        accessToken: null,
      });

      router.replace('/login');
    }
  }, []);

  // Refresh user data
  const refreshUser = useCallback(async () => {
    try {
      const user = await getCurrentUser();
      const role = extractUserRole(user);

      await SecureStore.setItemAsync(USER_STORAGE_KEY, JSON.stringify(user));

      setState((prev) => ({
        ...prev,
        user,
        userRole: role,
      }));
    } catch (error) {
      console.error('Error refreshing user:', error);
    }
  }, []);

  // Check if user has specific role
  const hasRole = useCallback((role: UserRole): boolean => {
    return state.userRole === role;
  }, [state.userRole]);

  const value: AuthContextValue = {
    ...state,
    login,
    logout,
    refreshUser,
    hasRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// ==================== Hook ====================

export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
};

export default AuthContext;
