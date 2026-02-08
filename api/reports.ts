import {
  ReportSummary,
  BloodTypeDistribution,
  MonthlyDonationData,
  AvailabilityTrend
} from '../types/report.types';
import { queryRows, querySingle } from '../src/lib/turso';

export const reportsApi = {
  /**
   * Get summary statistics
   */
  getSummary: async (): Promise<ReportSummary> => {
    const totalRow = await querySingle<{ count: number }>(
      'SELECT COUNT(*) as count FROM donors WHERE is_deleted = 0',
    );
    const availableRow = await querySingle<{ count: number }>(
      "SELECT COUNT(*) as count FROM donors WHERE is_deleted = 0 AND availability_status = 'Available'",
    );
    const requestsRow = await querySingle<{ count: number }>(
      "SELECT COUNT(*) as count FROM blood_requests WHERE strftime('%Y-%m', created_at) = strftime('%Y-%m', 'now')",
    );
    const donationsRow = await querySingle<{ count: number }>(
      'SELECT COUNT(*) as count FROM donations',
    );

    return {
      totalDonors: Number(totalRow?.count ?? 0),
      availableDonors: Number(availableRow?.count ?? 0),
      requestsThisMonth: Number(requestsRow?.count ?? 0),
      successfulDonations: Number(donationsRow?.count ?? 0),
    };
  },

  /**
   * Get blood type distribution
   */
  getBloodTypeDistribution: async (): Promise<BloodTypeDistribution[]> => {
    const rows = await queryRows<Record<string, any>>(
      'SELECT blood_type as bloodType, COUNT(*) as count FROM donors WHERE is_deleted = 0 GROUP BY blood_type',
    );

    return rows.map((row) => ({
      bloodType: row.bloodType,
      count: Number(row.count ?? 0),
    }));
  },

  /**
   * Get monthly donations
   */
  getMonthlyDonations: async (): Promise<MonthlyDonationData[]> => {
    const rows = await queryRows<Record<string, any>>(
      "SELECT strftime('%Y-%m', donation_date) as month, COUNT(*) as donations FROM donations GROUP BY month ORDER BY month",
    );

    return rows.map((row) => ({
      month: row.month,
      donations: Number(row.donations ?? 0),
    }));
  },

  /**
   * Get availability trend
   */
  getAvailabilityTrend: async (): Promise<AvailabilityTrend[]> => {
    const rows = await queryRows<Record<string, any>>(
      `SELECT date(created_at) as date,
        SUM(CASE WHEN availability_status = 'Available' THEN 1 ELSE 0 END) as availableCount,
        SUM(CASE WHEN availability_status != 'Available' THEN 1 ELSE 0 END) as unavailableCount
       FROM donors
       WHERE is_deleted = 0 AND date(created_at) >= date('now', '-30 day')
       GROUP BY date(created_at)
       ORDER BY date(created_at)`
    );

    return rows.map((row) => ({
      date: row.date,
      availableCount: Number(row.availableCount ?? 0),
      unavailableCount: Number(row.unavailableCount ?? 0),
    }));
  }
};
