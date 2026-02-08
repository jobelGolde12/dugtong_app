import { Donor, DonorFilter } from "../../types/donor.types";
import { queryRows, querySingle, db } from "../lib/turso";

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

  const rows = await queryRows<Record<string, any>>(
    `SELECT * FROM donors ${whereClause} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
    [...args, pageSize, offset],
  );

  const totalRow = await querySingle<{ count: number }>(
    `SELECT COUNT(*) as count FROM donors ${whereClause}`,
    args,
  );

  return {
    items: rows.map(mapDonorRow),
    total: Number(totalRow?.count ?? rows.length),
    page,
    page_size: pageSize,
  };
};

export const getDonor = async (id: string): Promise<Donor> => {
  const row = await querySingle<Record<string, any>>(
    "SELECT * FROM donors WHERE id = ? AND is_deleted = 0",
    [id],
  );

  if (!row) {
    throw new Error("Donor not found.");
  }

  return mapDonorRow(row);
};

export const createDonor = async (data: Partial<Donor>): Promise<Donor> => {
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
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ,
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

  const insertedId = Number(insertResult?.lastInsertRowid ?? 0);
  const row = await querySingle<Record<string, any>>(
    "SELECT * FROM donors WHERE id = ?",
    [insertedId],
  );

  if (!row) {
    throw new Error("Failed to create donor.");
  }

  return mapDonorRow(row);
};

export const updateDonor = async (id: string, data: Partial<Donor>): Promise<Donor> => {
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
};

export const updateAvailability = async (
  id: string,
  availabilityStatus: string,
): Promise<Donor> => {
  await db.execute({
    sql: "UPDATE donors SET availability_status = ? WHERE id = ? AND is_deleted = 0",
    args: [availabilityStatus, id],
  });

  return getDonor(id);
};

export const deleteDonor = async (id: string): Promise<void> => {
  await db.execute({
    sql: "UPDATE donors SET is_deleted = 1 WHERE id = ?",
    args: [id],
  });
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
