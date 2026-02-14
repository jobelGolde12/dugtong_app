import * as SecureStore from "expo-secure-store";
import { db, querySingle } from "../src/lib/turso";
import { clearTokens, getAccessToken, storeTokens } from "./client";
import { USER_ROLES, UserRole, DEFAULT_ROLE } from "../constants/roles.constants";

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
  role: UserRole;
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

const normalizeContactNumber = (value: string): string => {
  const digits = value.replace(/\D/g, "");
  if (digits.startsWith("63") && digits.length === 12) return `0${digits.slice(2)}`;
  if (digits.startsWith("9") && digits.length === 10) return `0${digits}`;
  return digits;
};

const buildTokens = (user: User) => {
  const access_token = `local:${user.id}:${user.role}`;
  const refresh_token = `refresh:${user.id}`;

  return { access_token, refresh_token, token_type: "bearer" };
};

const getUserIdFromToken = (token: string | null): number | null => {
  if (!token) return null;
  const parts = token.split(":");
  if (parts.length < 2 || parts[0] !== "local") return null;
  const id = Number(parts[1]);
  return Number.isFinite(id) ? id : null;
};

// ==================== DB Endpoints ====================

/**
 * Login with name and contact number
 */
export const login = async (data: LoginRequest): Promise<LoginResponse> => {
  try {
    const fullName = data.full_name.trim();
    const contactNumber = normalizeContactNumber(data.contact_number);

    console.log("LOGIN ATTEMPT:", fullName, contactNumber);

    if (!fullName || !contactNumber) {
      throw new Error("Full name and contact number are required.");
    }

    // Query remote Turso database
    const result = await db.execute({
      sql: "SELECT * FROM users WHERE full_name = ? AND contact_number = ?",
      args: [fullName, contactNumber],
    });

    console.log("LOGIN QUERY RESULT:", result.rows);

    let userRow = null;
    if (result.rows.length > 0) {
      // Assuming the result comes back as an array of arrays when using the web client
      const columns = result.columns;
      const firstRow = result.rows[0] as any[];
      
      userRow = {};
      columns.forEach((col, index) => {
        userRow[col] = firstRow[index];
      });
    }

    if (!userRow) {
      const now = new Date().toISOString();
      const insertResult = await db.execute({
        sql: "INSERT INTO users (full_name, contact_number, role, created_at) VALUES (?, ?, ?, ?)",
        args: [fullName, contactNumber, "donor", now],
      });

      // Get the inserted user
      const selectResult = await db.execute({
        sql: "SELECT * FROM users WHERE id = ?",
        args: [insertResult.lastInsertRowid],
      });

      if (selectResult.rows.length > 0) {
        const columns = selectResult.columns;
        const firstRow = selectResult.rows[0] as any[];
        
        userRow = {};
        columns.forEach((col, index) => {
          userRow[col] = firstRow[index];
        });
      }
    }

    if (!userRow) {
      throw new Error("Unable to login. Please try again.");
    }

    const user: User = {
      id: String(userRow.id),
      role: userRow.role as UserRole,
      name: userRow.full_name,
      contact_number: userRow.contact_number,
      email: userRow.email || undefined,
      avatar_url: userRow.avatar_url || undefined,
    };

    const tokens = buildTokens(user);

    await storeTokens(tokens.access_token, tokens.refresh_token);
    await SecureStore.setItemAsync(USER_STORAGE_KEY, JSON.stringify(user));

    return {
      ...tokens,
      user,
    };
  } catch (error: any) {
    console.error("FULL TURSO ERROR:", JSON.stringify(error));
    console.error("STACK:", error?.stack);
    throw error;
  }
};

/**
 * Refresh access token
 */
export const refreshToken = async (
  refreshTokenValue: string,
): Promise<RefreshTokenResponse> => {
  if (!refreshTokenValue || !refreshTokenValue.startsWith("refresh:")) {
    throw new Error("Invalid refresh token.");
  }

  const accessToken = await getAccessToken();
  const userId = getUserIdFromToken(accessToken);

  if (!userId) {
    throw new Error("Session expired. Please log in again.");
  }

  const userRow = await querySingle<Record<string, any>>(
    "SELECT * FROM users WHERE id = ?",
    [userId],
  );

  if (!userRow) {
    throw new Error("Session expired. Please log in again.");
  }

  const user: User = {
    id: String(userRow.id),
    role: userRow.role as UserRole, // Use role directly from database, bypassing CHECK constraint for app layer
    name: userRow.full_name,
    contact_number: userRow.contact_number,
    email: userRow.email || undefined,
    avatar_url: userRow.avatar_url || undefined,
  };

  const tokens = buildTokens(user);
  await storeTokens(tokens.access_token, tokens.refresh_token);

  return tokens;
};

/**
 * Logout and revoke tokens
 */
export const logout = async (): Promise<LogoutResponse> => {
  await clearTokens();
  await SecureStore.deleteItemAsync(USER_STORAGE_KEY);
  return { message: "Successfully logged out" };
};

/**
 * Get current user profile
 */
export const getCurrentUser = async (): Promise<User> => {
  const accessToken = await getAccessToken();
  const userId = getUserIdFromToken(accessToken);

  if (!userId) {
    throw new Error("Not authenticated.");
  }

  const userRow = await querySingle<Record<string, any>>(
    "SELECT * FROM users WHERE id = ?",
    [userId],
  );

  if (!userRow) {
    throw new Error("User not found.");
  }

  return {
    id: String(userRow.id),
    role: userRow.role as UserRole, // Use role directly from database, bypassing CHECK constraint for app layer
    name: userRow.full_name,
    contact_number: userRow.contact_number,
    email: userRow.email || undefined,
    avatar_url: userRow.avatar_url || undefined,
  };
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = async (): Promise<boolean> => {
  return !!(await getAccessToken());
};

/**
 * Decode token to get user info (client-side only)
 */
export const decodeToken = (token: string): Record<string, unknown> | null => {
  if (!token) return null;

  if (token.startsWith("local:")) {
    const parts = token.split(":");
    if (parts.length >= 3) {
      return { id: parts[1], role: parts[2] };
    }
  }

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
 * Get user role from storage
 */
export const getUserRoleFromStorage = async (): Promise<UserRole | null> => {
  const token = await getAccessToken();
  if (!token) return null;

  const decoded = decodeToken(token);
  if (!decoded) return null;

  return (decoded as { role?: UserRole }).role ?? null;
};

export const getCurrentUserId = async (): Promise<number | null> => {
  const token = await getAccessToken();
  return getUserIdFromToken(token);
};
