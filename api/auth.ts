import apiClient, { clearTokens, getAccessToken, storeTokens } from "./client";

// ==================== Types ====================

export interface LoginRequest {
  full_name: string;
  contact_number: string;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  user: User;
}

export interface User {
  id: string;
  role: "admin" | "donor";
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

// ==================== API Endpoints ====================

/**
 * Login with name and contact number
 */
export const login = async (data: LoginRequest): Promise<LoginResponse> => {
  const response = await apiClient.post<LoginResponse>("/auth/login", data);

  // Store tokens securely
  await storeTokens(response.data.access_token, response.data.refresh_token);

  return response.data;
};

/**
 * Refresh access token
 */
export const refreshToken = async (
  refreshToken: string,
): Promise<RefreshTokenResponse> => {
  const response = await apiClient.post<RefreshTokenResponse>("/auth/refresh", {
    refresh_token: refreshToken,
  });

  // Store new tokens
  await storeTokens(response.data.access_token, response.data.refresh_token);

  return response.data;
};

/**
 * Logout and revoke tokens
 */
export const logout = async (): Promise<LogoutResponse> => {
  try {
    await apiClient.post("/auth/logout");
  } catch (error) {
    // Even if the API call fails, we still clear local tokens
    console.error("Logout API call failed:", error);
  }

  // Clear local tokens
  await clearTokens();

  return { message: "Successfully logged out" };
};

/**
 * Get current user profile
 */
export const getCurrentUser = async (): Promise<User> => {
  const response = await apiClient.get<User>("/users/me");
  return response.data;
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = async (): Promise<boolean> => {
  return !!(await getAccessToken());
};

/**
 * Decode JWT token to get user info (client-side only)
 */
export const decodeToken = (token: string): Record<string, unknown> | null => {
  try {
    const base64Url = token.split(".")[1];
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
/**
 * Get user role from storage
 */
export const getUserRoleFromStorage = async (): Promise<"admin" | "donor" | null> => {
  const token = await getAccessToken();
  if (!token) return null;

  const decoded = decodeToken(token);
  if (!decoded) return null;

  return decoded.role as "admin" | "donor" | null;
};
