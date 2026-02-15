import { apiClient } from "../src/services/apiClient";
import { User } from "./auth";
import { UserProfile, UserPreferences } from "../types/user.types";

export const userApi = {
  getUsers: async (): Promise<User[]> => {
    const response = await apiClient.get<{ users: User[] }>("/users");
    return response.users;
  },

  getUserById: async (id: string): Promise<User> => {
    const response = await apiClient.get<{ user: User }>(`/users/${id}`);
    return response.user;
  },

  updateUser: async (id: string, data: Partial<User>): Promise<User> => {
    const response = await apiClient.put<{ user: User }>(`/users/${id}`, data);
    return response.user;
  },

  updateUserRole: async (id: string, role: string): Promise<User> => {
    const response = await apiClient.patch<{ user: User }>(`/users/${id}/role`, { role });
    return response.user;
  },

  deleteUser: async (id: string): Promise<void> => {
    await apiClient.delete(`/users/${id}`);
  },

  getUserProfile: async (): Promise<UserProfile> => {
    const response = await apiClient.get<{ user: UserProfile }>("/users/me");
    return response.user;
  },

  updateUserProfile: async (data: Partial<UserProfile>): Promise<UserProfile> => {
    const response = await apiClient.put<{ user: UserProfile }>("/users/me", data);
    return response.user;
  },

  getUserPreferences: async (): Promise<UserPreferences> => {
    const response = await apiClient.get<{ preferences: UserPreferences }>("/users/me/preferences");
    return response.preferences;
  },

  updateUserPreferences: async (preferences: Partial<UserPreferences>): Promise<UserPreferences> => {
    const response = await apiClient.put<{ preferences: UserPreferences }>("/users/me/preferences", preferences);
    return response.preferences;
  },
};

export const {
  getUserProfile,
  updateUserProfile,
  getUserPreferences,
  updateUserPreferences,
} = userApi;
