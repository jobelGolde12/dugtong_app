import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { router } from "expo-router";
import * as SecureStore from "expo-secure-store";

// Environment configuration
const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL || "http://localhost:8000/api";

// Create axios instance
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Token storage keys
const ACCESS_TOKEN_KEY = "access_token";
const REFRESH_TOKEN_KEY = "refresh_token";

// ==================== Token Management ====================

/**
 * Get access token from secure storage
 */
export const getAccessToken = async (): Promise<string | null> => {
  try {
    return await SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
  } catch (error) {
    console.error("Error getting access token:", error);
    return null;
  }
};

/**
 * Get refresh token from secure storage
 */
export const getRefreshToken = async (): Promise<string | null> => {
  try {
    return await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
  } catch (error) {
    console.error("Error getting refresh token:", error);
    return null;
  }
};

/**
 * Store tokens securely
 */
export const storeTokens = async (
  accessToken: string,
  refreshToken: string,
): Promise<void> => {
  try {
    await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, accessToken);
    await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken);
  } catch (error) {
    console.error("Error storing tokens:", error);
  }
};

/**
 * Clear tokens from secure storage
 */
export const clearTokens = async (): Promise<void> => {
  try {
    await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
    await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
  } catch (error) {
    console.error("Error clearing tokens:", error);
  }
};

/**
 * Check if tokens exist
 */
export const hasValidTokens = async (): Promise<boolean> => {
  const accessToken = await getAccessToken();
  return !!accessToken;
};

// ==================== Request Interceptor ====================

apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const accessToken = await getAccessToken();

    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  },
);

// ==================== Response Interceptor ====================

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // Handle 401 Unauthorized
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = await getRefreshToken();

        if (!refreshToken) {
          // No refresh token, redirect to login
          await clearTokens();
          router.replace("/login");
          return Promise.reject(error);
        }

        // Try to refresh the token
        const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
          refresh_token: refreshToken,
        });

        const { access_token, refresh_token } = response.data;

        // Store new tokens
        await storeTokens(access_token, refresh_token);

        // Retry original request with new access token
        originalRequest.headers.Authorization = `Bearer ${access_token}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Refresh failed, clear tokens and redirect to login
        console.error("Token refresh failed:", refreshError);
        await clearTokens();
        router.replace("/login");
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);

// ==================== API Helper Functions ====================

/**
 * Safe API call with error handling
 */
export const safeApiCall = async <T>(
  apiCall: () => Promise<T>,
): Promise<{ data: T | null; error: string | null }> => {
  try {
    const data = await apiCall();
    return { data, error: null };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "An unexpected error occurred";
    console.error("API Error:", message);
    return { data: null, error: message };
  }
};

/**
 * Get error message from Axios error
 */
export const getApiErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<{
      detail?: string;
      message?: string;
    }>;

    if (axiosError.response?.data) {
      const data = axiosError.response.data;
      if (typeof data.detail === "string") return data.detail;
      if (typeof data.message === "string") return data.message;
    }

    if (axiosError.response?.status === 401) {
      return "Session expired. Please log in again.";
    }

    if (axiosError.response?.status === 403) {
      return "You do not have permission to perform this action.";
    }

    if (axiosError.response?.status === 404) {
      return "The requested resource was not found.";
    }

    if (axiosError.response?.status === 422) {
      return "Validation error. Please check your input.";
    }

    if (axiosError.response?.status === 500) {
      return "Server error. Please try again later.";
    }
  }

  return "An unexpected error occurred. Please try again.";
};

export default apiClient;
