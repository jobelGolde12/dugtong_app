import { router } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import React, { createContext, ReactNode, useCallback, useContext, useEffect, useState } from 'react';
import { getCurrentUser, login as loginApi, LoginRequest, logout as logoutApi, User } from '../api/auth';
import { clearTokens, getAccessToken, getRefreshToken } from '../api/client';

// ==================== Types ====================

interface AuthState {
  isLoading: boolean;
  isAuthenticated: boolean;
  user: User | null;
  userRole: 'admin' | 'donor' | null;
  accessToken: string | null;
}

interface AuthContextValue extends AuthState {
  login: (credentials: LoginRequest) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  hasRole: (role: 'admin' | 'donor') => boolean;
}

// ==================== Constants ====================

const USER_STORAGE_KEY = 'user_data';
const AUTH_STATE_KEY = 'auth_state';

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

      // Try to get current user from API
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
        // Token might be invalid, try refresh
        const refreshToken = await getRefreshToken();
        if (refreshToken) {
          // Token refresh will be handled by API client interceptor
          // For now, just try to get user again
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
          } catch {
            // Refresh failed too, clear auth
            await clearAuthState();
            setState((prev) => ({ ...prev, isLoading: false }));
          }
        } else {
          await clearAuthState();
          setState((prev) => ({ ...prev, isLoading: false }));
        }
      }
    } catch (error) {
      console.error('Error initializing auth:', error);
      setState((prev) => ({ ...prev, isLoading: false }));
    }
  };

  // Extract user role from user object or token
  const extractUserRole = (user: User): 'admin' | 'donor' | null => {
    if (user.role === 'admin' || user.role === 'donor') {
      return user.role;
    }
    return null;
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

      // Save user to secure storage
      await SecureStore.setItemAsync(USER_STORAGE_KEY, JSON.stringify(user));

      const role = extractUserRole(user);

      setState({
        isLoading: false,
        isAuthenticated: true,
        user,
        userRole: role,
        accessToken: access_token,
      });

      // Navigate based on role
      if (role === 'admin') {
        router.replace('/dashboard');
      } else {
        router.replace('/DonorDashboard');
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
  }, []);

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

      // Navigate to login
      router.replace('/login');
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
  const hasRole = useCallback((role: 'admin' | 'donor'): boolean => {
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

// ==================== Protected Route Hook ====================

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: ('admin' | 'donor')[];
  fallbackPath?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles,
  fallbackPath = '/login',
}) => {
  const { isAuthenticated, isLoading, userRole } = useAuth();

  if (isLoading) {
    // Return loading indicator
    return null;
  }

  if (!isAuthenticated) {
    router.replace(fallbackPath);
    return null;
  }

  if (allowedRoles && userRole && !allowedRoles.includes(userRole)) {
    // User doesn't have required role
    router.replace('/unauthorized');
    return null;
  }

  return <>{children}</>;
};

export default AuthContext;

