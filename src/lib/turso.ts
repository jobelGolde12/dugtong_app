import { createClient } from "@libsql/client";
import Constants from "expo-constants";

const resolveEnv = (key: string): string | undefined => {
  const expoConfig = Constants.expoConfig?.extra as Record<string, unknown> | undefined;
  const manifest = Constants.manifest?.extra as Record<string, unknown> | undefined;

  const fromExpo = expoConfig?.[key];
  const fromManifest = manifest?.[key];

  if (typeof fromExpo === "string" && fromExpo.length > 0) return fromExpo;
  if (typeof fromManifest === "string" && fromManifest.length > 0) return fromManifest;

  return undefined;
};

const databaseUrl =
  process.env.EXPO_PUBLIC_TURSO_DATABASE_URL ||
  process.env.TURSO_DATABASE_URL ||
  resolveEnv("tursoDatabaseUrl") ||
  resolveEnv("TURSO_DATABASE_URL");

const authToken =
  process.env.EXPO_PUBLIC_TURSO_AUTH_TOKEN ||
  process.env.TURSO_AUTH_TOKEN ||
  resolveEnv("tursoAuthToken") ||
  resolveEnv("TURSO_AUTH_TOKEN");

if (!databaseUrl) {
  throw new Error(
    "Missing Turso database URL. Set EXPO_PUBLIC_TURSO_DATABASE_URL or TURSO_DATABASE_URL.",
  );
}

export const db = createClient({
  url: databaseUrl,
  authToken: authToken || undefined,
});

const normalizeRows = <T>(result: any): T[] => {
  if (!result || !Array.isArray(result.rows)) return [];

  if (result.rows.length === 0) return [];

  const firstRow = result.rows[0];
  if (Array.isArray(firstRow) && Array.isArray(result.columns)) {
    return result.rows.map((row: unknown[]) => {
      const entry: Record<string, unknown> = {};
      result.columns.forEach((column: string, index: number) => {
        entry[column] = row[index];
      });
      return entry as T;
    });
  }

  return result.rows as T[];
};

export const queryRows = async <T>(sql: string, args: unknown[] = []): Promise<T[]> => {
  const result = await db.execute({ sql, args });
  return normalizeRows<T>(result);
};

export const querySingle = async <T>(
  sql: string,
  args: unknown[] = [],
): Promise<T | null> => {
  const rows = await queryRows<T>(sql, args);
  return rows[0] ?? null;
};
