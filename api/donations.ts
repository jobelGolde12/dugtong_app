import { Donation, BloodRequest } from '../types/donation.types';
import { db, queryRows, querySingle } from '../src/lib/turso';

const mapDonationRow = (row: Record<string, any>): Donation => ({
  id: String(row.id),
  donor_id: row.donor_id ? String(row.donor_id) : '',
  donation_date: row.donation_date,
  blood_type: row.blood_type,
  quantity: Number(row.quantity),
  location: row.location,
});

const mapBloodRequestRow = (row: Record<string, any>): BloodRequest => ({
  id: String(row.id),
  requester_name: row.requester_name,
  blood_type: row.blood_type,
  quantity: Number(row.quantity),
  urgency: row.urgency,
  location: row.location,
  status: row.status,
});

export const donationsApi = {
  /**
   * Get list of donations
   */
  getDonations: async (): Promise<Donation[]> => {
    const rows = await queryRows<Record<string, any>>(
      'SELECT * FROM donations ORDER BY donation_date DESC',
    );
    return rows.map(mapDonationRow);
  },

  /**
   * Create a new donation
   */
  createDonation: async (data: Omit<Donation, 'id'>): Promise<Donation> => {
    const result = await db.execute({
      sql: `INSERT INTO donations (
        donor_id,
        donation_date,
        blood_type,
        quantity,
        location
      ) VALUES (?, ?, ?, ?, ?)`
      ,
      args: [data.donor_id || null, data.donation_date, data.blood_type, data.quantity, data.location],
    });

    const insertedId = Number(result?.lastInsertRowid ?? 0);
    const row = await querySingle<Record<string, any>>(
      'SELECT * FROM donations WHERE id = ?',
      [insertedId],
    );

    if (!row) {
      throw new Error('Failed to create donation.');
    }

    return mapDonationRow(row);
  },

  /**
   * Get list of blood requests
   */
  getBloodRequests: async (): Promise<BloodRequest[]> => {
    const rows = await queryRows<Record<string, any>>(
      'SELECT * FROM blood_requests ORDER BY created_at DESC',
    );
    return rows.map(mapBloodRequestRow);
  },

  /**
   * Create a new blood request
   */
  createBloodRequest: async (data: Omit<BloodRequest, 'id' | 'status'>): Promise<BloodRequest> => {
    const result = await db.execute({
      sql: `INSERT INTO blood_requests (
        requester_name,
        blood_type,
        quantity,
        urgency,
        location,
        status,
        created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?)`
      ,
      args: [
        data.requester_name,
        data.blood_type,
        data.quantity,
        data.urgency,
        data.location,
        'pending',
        new Date().toISOString(),
      ],
    });

    const insertedId = Number(result?.lastInsertRowid ?? 0);
    const row = await querySingle<Record<string, any>>(
      'SELECT * FROM blood_requests WHERE id = ?',
      [insertedId],
    );

    if (!row) {
      throw new Error('Failed to create blood request.');
    }

    return mapBloodRequestRow(row);
  }
};
