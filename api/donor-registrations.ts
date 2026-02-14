import { z } from "zod";
import { db, queryRows, querySingle } from "../src/lib/turso";

// ==================== Types ====================

export interface DonorRegistrationRequest {
  full_name: string;
  contact_number: string;
  email?: string | null;
  age: number;
  blood_type: string;
  municipality: string;
  availability?: string;
}

export interface DonorRegistrationResponse {
  id: number;
  full_name: string;
  contact_number: string;
  email?: string | null;
  age: number;
  blood_type: string;
  municipality: string;
  availability: string;
  status: string;
  review_reason?: string | null;
  reviewed_by?: number | null;
  reviewed_at?: string | null;
  created_at: string;
  updated_at?: string | null;
}

export interface ValidationError {
  field: string;
  message: string;
}

export interface ApiError {
  detail: string;
  validation_errors?: ValidationError[];
}

const donorRegistrationSchema = z.object({
  full_name: z.string().min(2),
  contact_number: z.string().min(10),
  email: z.string().email().optional().nullable(),
  age: z.number().int().min(16),
  blood_type: z.string().min(1),
  municipality: z.string().min(1),
  availability: z.string().optional(),
});

const normalizeContactNumber = (value: string): string => {
  const digits = value.replace(/\D/g, "");
  if (digits.startsWith("63") && digits.length === 12) return `0${digits.slice(2)}`;
  if (digits.startsWith("9") && digits.length === 10) return `0${digits}`;
  return digits;
};

const mapRegistrationRow = (row: Record<string, any>): DonorRegistrationResponse => ({
  id: Number(row.id),
  full_name: row.full_name,
  contact_number: row.contact_number,
  email: row.email || null,
  age: Number(row.age),
  blood_type: row.blood_type,
  municipality: row.municipality,
  availability: row.availability,
  status: row.status,
  review_reason: row.review_reason || null,
  reviewed_by: row.reviewed_by ?? null,
  reviewed_at: row.reviewed_at ?? null,
  created_at: row.created_at,
  updated_at: row.updated_at ?? null,
});

// ==================== DB Endpoints ====================

/**
 * Submit a new donor registration
 */
export const createDonorRegistration = async (
  data: DonorRegistrationRequest,
): Promise<DonorRegistrationResponse> => {
  try {
    const normalized = {
      ...data,
      contact_number: normalizeContactNumber(data.contact_number),
      availability: data.availability || "Available",
    };

    const parsed = donorRegistrationSchema.safeParse(normalized);
    if (!parsed.success) {
      const validationErrors = parsed.error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      }));

      const error = new Error("Validation error. Please check your input.");
      (error as any).validation_errors = validationErrors;
      throw error;
    }

    const now = new Date().toISOString();

    console.log("REGISTER ATTEMPT:", normalized.full_name, normalized.email);

    // Insert into remote Turso database
    const result = await db.execute({
      sql: `INSERT INTO donor_registrations (
        full_name,
        contact_number,
        email,
        age,
        blood_type,
        municipality,
        availability,
        status,
        created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        normalized.full_name,
        normalized.contact_number,
        normalized.email ?? null,
        normalized.age,
        normalized.blood_type,
        normalized.municipality,
        normalized.availability,
        "pending",
        now,
      ],
    });

    console.log("REGISTER SUCCESS");

    // Retrieve the inserted record
    const selectResult = await db.execute({
      sql: "SELECT * FROM donor_registrations WHERE id = ?",
      args: [result.lastInsertRowid],
    });

    if (selectResult.rows.length === 0) {
      throw new Error("Failed to create donor registration.");
    }

    // Process the result
    const columns = selectResult.columns;
    const firstRow = selectResult.rows[0] as any[];
    
    const row = {};
    columns.forEach((col, index) => {
      row[col] = firstRow[index];
    });

    return mapRegistrationRow(row);
  } catch (error: any) {
    console.error("FULL TURSO ERROR:", JSON.stringify(error));
    console.error("STACK:", error?.stack);
    throw error;
  }
};

/**
 * Get donor registration by ID (for admin use)
 */
export const getDonorRegistration = async (
  id: string,
): Promise<DonorRegistrationResponse> => {
  try {
    const result = await db.execute({
      sql: "SELECT * FROM donor_registrations WHERE id = ?",
      args: [id],
    });

    if (result.rows.length === 0) {
      throw new Error("Registration not found.");
    }

    const columns = result.columns;
    const firstRow = result.rows[0] as any[];
    
    const row = {};
    columns.forEach((col, index) => {
      row[col] = firstRow[index];
    });

    return mapRegistrationRow(row);
  } catch (error: any) {
    console.error("FULL TURSO ERROR:", JSON.stringify(error));
    console.error("STACK:", error?.stack);
    throw error;
  }
};

/**
 * Get all donor registrations (for admin use)
 */
export const getDonorRegistrations = async (
  params?: {
    status?: "pending" | "approved" | "rejected";
    municipality?: string;
    blood_type?: string;
    limit?: number;
    offset?: number;
  },
): Promise<DonorRegistrationResponse[]> => {
  try {
    const conditions: string[] = [];
    const args: unknown[] = [];

    if (params?.status) {
      conditions.push("status = ?");
      args.push(params.status);
    }
    if (params?.municipality) {
      conditions.push("municipality = ?");
      args.push(params.municipality);
    }
    if (params?.blood_type) {
      conditions.push("blood_type = ?");
      args.push(params.blood_type);
    }

    const whereClause = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
    const limit = params?.limit ?? 100;
    const offset = params?.offset ?? 0;

    const sql = `SELECT * FROM donor_registrations ${whereClause} ORDER BY created_at DESC LIMIT ? OFFSET ?`;
    const result = await db.execute({
      sql,
      args: [...args, limit, offset],
    });

    // Process all rows
    const registrations = [];
    for (const rowArray of result.rows as any[][]) {
      const row = {};
      result.columns.forEach((col, index) => {
        row[col] = rowArray[index];
      });
      registrations.push(mapRegistrationRow(row));
    }

    return registrations;
  } catch (error: any) {
    console.error("FULL TURSO ERROR:", JSON.stringify(error));
    console.error("STACK:", error?.stack);
    throw error;
  }
};

/**
 * Update donor registration status (for admin use)
 */
export const updateDonorRegistrationStatus = async (
  id: string,
  status: "approved" | "rejected",
): Promise<DonorRegistrationResponse> => {
  try {
    const now = new Date().toISOString();

    // Get the registration before updating status to use its data for creating donor
    const registration = await getDonorRegistration(id);

    await db.execute({
      sql: "UPDATE donor_registrations SET status = ?, updated_at = ? WHERE id = ?",
      args: [status, now, id],
    });

    // If the registration is approved, create a new donor record
    if (status === "approved") {
      // Import donor service dynamically to avoid circular dependencies
      const donorServiceModule = await import("../src/services/donorService");
      const donorService = donorServiceModule.donorService;

      // Create a new donor from the registration data
      await donorService.createDonor({
        name: registration.full_name,
        age: registration.age,
        sex: registration.sex,
        bloodType: registration.blood_type,
        contactNumber: registration.contact_number,
        municipality: registration.municipality,
        availabilityStatus: registration.availability || "Available",
      });
    }

    return getDonorRegistration(id);
  } catch (error: any) {
    console.error("FULL TURSO ERROR:", JSON.stringify(error));
    console.error("STACK:", error?.stack);
    throw error;
  }
};

/**
 * Delete donor registration (for admin use)
 */
export const deleteDonorRegistration = async (id: string): Promise<void> => {
  try {
    await db.execute({
      sql: "DELETE FROM donor_registrations WHERE id = ?",
      args: [id],
    });
  } catch (error: any) {
    console.error("FULL TURSO ERROR:", JSON.stringify(error));
    console.error("STACK:", error?.stack);
    throw error;
  }
};
