import * as SecureStore from "expo-secure-store";
import { clearTokens, getAccessToken, storeTokens } from "./client";
import { UserRole } from "../constants/roles.constants";
import { apiClient } from "../src/services/apiClient";

// ==================== Types ====================

export interface LoginRequest {
  full_name: string;
  contact_number: string;
}

export interface RegisterRequest {
  full_name: string;
  contact_number: string;
  email?: string;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  user: User;
}

export interface User {
  id: string;
  role: string;
  name: string;
  contact_number: string;
  email?: string;
  avatar_url?: string;
}

export interface RefreshTokenRequest {
  refresh_token: string;
}

export interface RefreshTokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface LogoutResponse {
  message: string;
}

const USER_STORAGE_KEY = "user_data";

// ==================== API Endpoints ====================

/**
 * Login with name and contact number
 */
export const login = async (data: LoginRequest): Promise<LoginResponse> => {
  try {
    const response = await apiClient.post<{ success: boolean; data: LoginResponse }>("/auth/login", data, false);
    
    console.log('📡 Full API Response:', JSON.stringify(response));
    
    if (!response.success || !response.data) {
      throw new Error("Login failed: Invalid response");
    }

    const { access_token, refresh_token, user } = response.data;
    
    console.log('📡 API Response user:', JSON.stringify(user));
    console.log('📡 API Response user.role:', user.role);
    
    await storeTokens(access_token, refresh_token);
    await SecureStore.setItemAsync(USER_STORAGE_KEY, JSON.stringify(user));

    return response.data;
  } catch (error: any) {
    console.error("❌ Login error:", error);
    console.error("❌ Error message:", error?.message);
    throw error;
  }
};

/**
 * Logout user
 */
export const logout = async (): Promise<LogoutResponse> => {
  try {
    await apiClient.post<LogoutResponse>("/auth/logout", {});
  } catch (error) {
    console.error("Logout error:", error);
  } finally {
    await clearTokens();
    await SecureStore.deleteItemAsync(USER_STORAGE_KEY);
  }
  return { message: "Successfully logged out" };
};

/**
 * Get current user from API
 */
export const getCurrentUser = async (): Promise<User> => {
  try {
    const response = await apiClient.get<{ user: User }>("/auth/me");
    return response.user;
  } catch (error: any) {
    console.error("Get current user error:", error);
    throw new Error(error.message || "Failed to get user");
  }
};

/**
 * Get user by ID
 */
export const getUserById = async (userId: string): Promise<User> => {
  try {
    const response = await apiClient.get<{ user: User }>(`/users/${userId}`);
    return response.user;
  } catch (error: any) {
    console.error("Get user by ID error:", error);
    throw new Error(error.message || "Failed to get user");
  }
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = async (): Promise<boolean> => {
  const token = await getAccessToken();
  return !!token;
};

/**
 * Decode JWT token
 */
export const decodeToken = (token: string): Record<string, unknown> | null => {
  if (!token) return null;

  try {
    const base64Url = token.split(".")[1];
    if (!base64Url) return null;
    
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join(""),
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error("Error decoding token:", error);
    return null;
  }
};

/**
 * Get user role from token
 */
export const getUserRoleFromStorage = async (): Promise<UserRole | null> => {
  const token = await getAccessToken();
  if (!token) return null;

  const decoded = decodeToken(token);
  if (!decoded) return null;

  return (decoded as { role?: UserRole }).role ?? null;
};

/**
 * Get current user ID from token
 */
export const getCurrentUserId = async (): Promise<string | null> => {
  const token = await getAccessToken();
  if (!token) return null;

  const decoded = decodeToken(token);
  if (!decoded) return null;

  return (decoded as { userId?: string }).userId ?? null;
};
