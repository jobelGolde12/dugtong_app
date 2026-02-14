import { db, querySingle } from "../src/lib/turso";
import { getCurrentUserId } from "./auth";
import { UserPreferences, UserProfile } from "../types/user.types";

const mapUserRow = (row: Record<string, any>): UserProfile => ({
  id: String(row.id),
  role: row.role === "admin" ? "admin" : "donor",
  name: row.full_name,
  contact_number: row.contact_number,
  email: row.email || undefined,
  avatar_url: row.avatar_url || undefined,
  created_at: row.created_at || undefined,
  updated_at: row.updated_at || undefined,
});

const mapPreferencesRow = (row: Record<string, any>): UserPreferences => ({
  theme_mode: row.theme_mode || "system",
  notifications_enabled: Boolean(row.notifications_enabled),
  email_notifications: Boolean(row.email_notifications),
  sms_notifications: Boolean(row.sms_notifications),
  language: row.language || "en",
  updated_at: row.updated_at || undefined,
});

export const getUserProfile = async (): Promise<UserProfile> => {
  const userId = await getCurrentUserId();
  if (!userId) throw new Error("Not authenticated.");

  const row = await querySingle<Record<string, any>>(
    "SELECT * FROM users WHERE id = ?",
    [userId],
  );

  if (!row) throw new Error("User not found.");

  return mapUserRow(row);
};

export const getUserPreferences = async (): Promise<UserPreferences> => {
  const userId = await getCurrentUserId();
  if (!userId) throw new Error("Not authenticated.");

  const row = await querySingle<Record<string, any>>(
    "SELECT * FROM user_preferences WHERE user_id = ?",
    [userId],
  );

  if (!row) {
    const now = new Date().toISOString();
    await db.execute(`INSERT INTO user_preferences (
        user_id,
        theme_mode,
        notifications_enabled,
        email_notifications,
        sms_notifications,
        language,
        updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [userId, "system", 1, 1, 0, "en", now],
    );

    return {
      theme_mode: "system",
      notifications_enabled: true,
      email_notifications: true,
      sms_notifications: false,
      language: "en",
      updated_at: now,
    };
  }

  return mapPreferencesRow(row);
};

export const updateUserProfile = async (
  data: Partial<UserProfile>,
): Promise<UserProfile> => {
  const userId = await getCurrentUserId();
  if (!userId) throw new Error("Not authenticated.");

  const fields: string[] = [];
  const args: unknown[] = [];
  const now = new Date().toISOString();

  if (data.name !== undefined) {
    fields.push("full_name = ?");
    args.push(data.name);
  }
  if (data.contact_number !== undefined) {
    fields.push("contact_number = ?");
    args.push(data.contact_number);
  }
  if (data.email !== undefined) {
    fields.push("email = ?");
    args.push(data.email);
  }
  if (data.avatar_url !== undefined) {
    fields.push("avatar_url = ?");
    args.push(data.avatar_url);
  }

  fields.push("updated_at = ?");
  args.push(now);

  await db.execute(`UPDATE users SET ${fields.join(", ")} WHERE id = ?`,
    [...(args as any[]), userId],
  );

  return getUserProfile();
};

export const updateUserPreferences = async (
  preferences: Partial<UserPreferences>,
): Promise<UserPreferences> => {
  const userId = await getCurrentUserId();
  if (!userId) throw new Error("Not authenticated.");

  const fields: string[] = [];
  const args: unknown[] = [];
  const now = new Date().toISOString();

  if (preferences.theme_mode !== undefined) {
    fields.push("theme_mode = ?");
    args.push(preferences.theme_mode);
  }
  if (preferences.notifications_enabled !== undefined) {
    fields.push("notifications_enabled = ?");
    args.push(preferences.notifications_enabled ? 1 : 0);
  }
  if (preferences.email_notifications !== undefined) {
    fields.push("email_notifications = ?");
    args.push(preferences.email_notifications ? 1 : 0);
  }
  if (preferences.sms_notifications !== undefined) {
    fields.push("sms_notifications = ?");
    args.push(preferences.sms_notifications ? 1 : 0);
  }
  if (preferences.language !== undefined) {
    fields.push("language = ?");
    args.push(preferences.language);
  }

  await db.execute({
    sql: "INSERT OR IGNORE INTO user_preferences (user_id) VALUES (?)",
    args: [userId],
  });

  if (fields.length === 0) {
    return getUserPreferences();
  }

  fields.push("updated_at = ?");
  args.push(now);

  await db.execute(`UPDATE user_preferences SET ${fields.join(", ")} WHERE user_id = ?`,
    [...(args as any[]), userId],
  );

  return getUserPreferences();
};
