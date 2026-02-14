import { Donor, DonorFilter } from "../../types/donor.types";
import { db } from "../lib/turso";

interface GetDonorsResponse {
  items: Donor[];
  total: number;
  page: number;
  page_size: number;
}

const mapDonorRow = (row: Record<string, any>): Donor => {
  const availability = row.availability_status || "Available";

  return {
    id: String(row.id),
    name: row.full_name || "",
    age: Number(row.age ?? 0),
    sex: row.sex || "",
    bloodType: row.blood_type || "",
    contactNumber: row.contact_number || "",
    municipality: row.municipality || "",
    availabilityStatus:
      availability === "Available" ? "Available" : "Temporarily Unavailable",
    lastDonationDate: row.last_donation_date || undefined,
    dateRegistered: row.created_at || new Date().toISOString(),
    notes: row.notes || undefined,
  };
};

const normalizeAvailabilityFilter = (value: unknown): string | null => {
  if (value === null || value === undefined) return null;

  if (typeof value === "boolean") {
    return value ? "Available" : "Temporarily Unavailable";
  }

  if (typeof value === "string" && value.length > 0) {
    return value;
  }

  return null;
};

export const getDonors = async (
  filter: DonorFilter & { page?: number; page_size?: number },
): Promise<GetDonorsResponse> => {
  try {
    const conditions: string[] = ["is_deleted = 0"];
    const args: unknown[] = [];

    if (filter.bloodType) {
      conditions.push("blood_type = ?");
      args.push(filter.bloodType);
    }

    if (filter.municipality) {
      conditions.push("municipality = ?");
      args.push(filter.municipality);
    }

    const availabilityFilter = normalizeAvailabilityFilter(filter.availability as unknown);
    if (availabilityFilter) {
      conditions.push("availability_status = ?");
      args.push(availabilityFilter);
    }

    if (filter.searchQuery) {
      conditions.push("(full_name LIKE ? OR contact_number LIKE ? OR municipality LIKE ?)");
      const search = `%${filter.searchQuery}%`;
      args.push(search, search, search);
    }

    const whereClause = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
    const pageSize = filter.page_size ?? 50;
    const page = filter.page ?? 0;
    const offset = Math.max(0, page) * pageSize;

    // Get donors with pagination
    const donorsResult = await db.execute({
      sql: `SELECT * FROM donors ${whereClause} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      args: [...args, pageSize, offset],
    });

    // Get total count
    const countResult = await db.execute({
      sql: `SELECT COUNT(*) as count FROM donors ${whereClause}`,
      args,
    });

    // Process donors
    const donors = [];
    for (const rowArray of donorsResult.rows as any[][]) {
      const row = {};
      donorsResult.columns.forEach((col, index) => {
        row[col] = rowArray[index];
      });
      donors.push(mapDonorRow(row));
    }

    // Process count
    let total = donors.length;
    if (countResult.rows.length > 0) {
      const countColumns = countResult.columns;
      const countRow = countResult.rows[0] as any[];
      const countObj = {};
      countColumns.forEach((col, index) => {
        countObj[col] = countRow[index];
      });
      total = Number(countObj['count'] ?? donors.length);
    }

    return {
      items: donors,
      total,
      page,
      page_size: pageSize,
    };
  } catch (error) {
    console.error("FULL TURSO ERROR during getDonors:", error);
    throw error;
  }
};

export const getDonor = async (id: string): Promise<Donor> => {
  try {
    const result = await db.execute({
      sql: "SELECT * FROM donors WHERE id = ? AND is_deleted = 0",
      args: [id],
    });

    if (result.rows.length === 0) {
      throw new Error("Donor not found.");
    }

    const columns = result.columns;
    const firstRow = result.rows[0] as any[];
    
    const row = {};
    columns.forEach((col, index) => {
      row[col] = firstRow[index];
    });

    return mapDonorRow(row);
  } catch (error) {
    console.error("FULL TURSO ERROR during getDonor:", error);
    throw error;
  }
};

export const createDonor = async (data: Partial<Donor>): Promise<Donor> => {
  try {
    const now = new Date().toISOString();

    const insertResult = await db.execute({
      sql: `INSERT INTO donors (
        full_name,
        age,
        sex,
        blood_type,
        contact_number,
        municipality,
        availability_status,
        last_donation_date,
        notes,
        created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        data.name || "",
        data.age ?? 0,
        data.sex || "",
        data.bloodType || "",
        data.contactNumber || "",
        data.municipality || "",
        data.availabilityStatus || "Available",
        data.lastDonationDate || null,
        data.notes || null,
        now,
      ],
    });

    const insertedId = Number(insertResult.lastInsertRowid ?? 0);
    
    const selectResult = await db.execute({
      sql: "SELECT * FROM donors WHERE id = ?",
      args: [insertedId],
    });

    if (selectResult.rows.length === 0) {
      throw new Error("Failed to create donor.");
    }

    const columns = selectResult.columns;
    const firstRow = selectResult.rows[0] as any[];
    
    const row = {};
    columns.forEach((col, index) => {
      row[col] = firstRow[index];
    });

    return mapDonorRow(row);
  } catch (error) {
    console.error("FULL TURSO ERROR during createDonor:", error);
    throw error;
  }
};

export const updateDonor = async (id: string, data: Partial<Donor>): Promise<Donor> => {
  try {
    const fields: string[] = [];
    const args: unknown[] = [];

    if (data.name !== undefined) {
      fields.push("full_name = ?");
      args.push(data.name);
    }
    if (data.age !== undefined) {
      fields.push("age = ?");
      args.push(data.age);
    }
    if (data.sex !== undefined) {
      fields.push("sex = ?");
      args.push(data.sex);
    }
    if (data.bloodType !== undefined) {
      fields.push("blood_type = ?");
      args.push(data.bloodType);
    }
    if (data.contactNumber !== undefined) {
      fields.push("contact_number = ?");
      args.push(data.contactNumber);
    }
    if (data.municipality !== undefined) {
      fields.push("municipality = ?");
      args.push(data.municipality);
    }
    if (data.availabilityStatus !== undefined) {
      fields.push("availability_status = ?");
      args.push(data.availabilityStatus);
    }
    if (data.lastDonationDate !== undefined) {
      fields.push("last_donation_date = ?");
      args.push(data.lastDonationDate);
    }
    if (data.notes !== undefined) {
      fields.push("notes = ?");
      args.push(data.notes);
    }

    if (fields.length === 0) {
      return getDonor(id);
    }

    await db.execute({
      sql: `UPDATE donors SET ${fields.join(", ")} WHERE id = ? AND is_deleted = 0`,
      args: [...args, id],
    });

    return getDonor(id);
  } catch (error) {
    console.error("FULL TURSO ERROR during updateDonor:", error);
    throw error;
  }
};

export const updateAvailability = async (
  id: string,
  availabilityStatus: string,
): Promise<Donor> => {
  try {
    await db.execute({
      sql: "UPDATE donors SET availability_status = ? WHERE id = ? AND is_deleted = 0",
      args: [availabilityStatus, id],
    });

    return getDonor(id);
  } catch (error) {
    console.error("FULL TURSO ERROR during updateAvailability:", error);
    throw error;
  }
};

export const deleteDonor = async (id: string): Promise<void> => {
  try {
    await db.execute({
      sql: "UPDATE donors SET is_deleted = 1 WHERE id = ?",
      args: [id],
    });
  } catch (error) {
    console.error("FULL TURSO ERROR during deleteDonor:", error);
    throw error;
  }
};

export const donorService = {
  getDonors,
  getDonor,
  createDonor,
  updateDonor,
  updateAvailability,
  deleteDonor,
};

export default donorService;
