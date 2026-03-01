import { apiClient } from "../src/services/apiClient";
import { donorApi } from "./donors";
import type {
  ReportSummary,
  BloodTypeDistribution,
  MonthlyDonationData,
  AvailabilityTrend
} from "../types/report.types";

export interface ReportData {
  totalDonors: number;
  activeDonors: number;
  totalDonations: number;
  donationsByBloodType: Record<string, number>;
  donationsByMonth: Array<{ month: string; count: number }>;
  donorsByMunicipality: Record<string, number>;
}

export const reportsApi = {
  getSummary: async (): Promise<ReportSummary> => {
    const [summaryData, donorsData] = await Promise.all([
      apiClient.get<any>("/reports/summary").catch(() => ({})),
      donorApi.getDonors({
        bloodType: null,
        municipality: null,
        availability: null,
        searchQuery: "",
        page: 1,
        page_size: 1000,
      }).catch(() => ({ items: [], total: 0, page: 1, page_size: 1000 })),
    ]);

    const normalizeAvailability = (status: any): string => String(status || "").trim().toLowerCase();
    const donorMap = new Map<string, any>();
    (donorsData.items || []).forEach((donor: any) => {
      if (donor?.id) donorMap.set(String(donor.id), donor);
    });

    const donorList = Array.from(donorMap.values());
    const computedTotalDonors = donorList.length;
    const computedAvailableDonors = donorList.filter((donor: any) =>
      normalizeAvailability(donor?.availabilityStatus || donor?.availability_status) === "available"
    ).length;

    const shouldUseComputedCounts = donorList.length > 0;

    return {
      totalDonors: shouldUseComputedCounts ? computedTotalDonors : (summaryData.totalDonors || 0),
      availableDonors: shouldUseComputedCounts ? computedAvailableDonors : (summaryData.availableDonors || 0),
      requestsThisMonth: summaryData.bloodRequestsThisMonth || 0,
      successfulDonations: summaryData.totalDonations || 0
    };
  },

  getBloodTypeDistribution: async (): Promise<BloodTypeDistribution[]> => {
    const data = await apiClient.get<any[]>("/reports/blood-types");
    return Array.isArray(data) ? data.map((item: any) => ({
      bloodType: item.bloodType || item.blood_type,
      count: item.count || 0
    })) : [];
  },

  getMonthlyDonations: async (): Promise<MonthlyDonationData[]> => {
    try {
      const data = await apiClient.get<any[]>("/reports/monthly-donations");
      return Array.isArray(data) ? data.map((item: any) => ({
        month: item.month,
        donations: item.donations || item.count || 0
      })) : [];
    } catch (error) {
      console.error('Error fetching monthly donations:', error);
      return [];
    }
  },

  getAvailabilityTrend: async (): Promise<AvailabilityTrend[]> => {
    try {
      const data = await apiClient.get<any[]>("/reports/availability-trend");
      return Array.isArray(data) ? data.map((item: any) => ({
        date: item.date,
        availableCount: item.availableCount || item.available_count || 0,
        unavailableCount: item.unavailableCount || item.unavailable_count || 0
      })) : [];
    } catch (error) {
      console.error('Error fetching availability trend:', error);
      return [];
    }
  },

  getReportData: async (params?: {
    start_date?: string;
    end_date?: string;
  }): Promise<ReportData> => {
    const queryParams = new URLSearchParams();
    
    if (params?.start_date) queryParams.append("start_date", params.start_date);
    if (params?.end_date) queryParams.append("end_date", params.end_date);

    const queryString = queryParams.toString();
    const endpoint = `/reports${queryString ? `?${queryString}` : ""}`;
    
    return apiClient.get<ReportData>(endpoint);
  },

  exportReport: async (format: "pdf" | "csv", params?: {
    start_date?: string;
    end_date?: string;
  }): Promise<Blob> => {
    const queryParams = new URLSearchParams();
    
    queryParams.append("format", format);
    if (params?.start_date) queryParams.append("start_date", params.start_date);
    if (params?.end_date) queryParams.append("end_date", params.end_date);

    const queryString = queryParams.toString();
    const endpoint = `/reports/export${queryString ? `?${queryString}` : ""}`;
    
    const token = await import("./client").then(m => m.getAccessToken());
    const response = await fetch(`${process.env.EXPO_PUBLIC_API_BASE_URL || "https://dugtung-next.vercel.app/api"}${endpoint}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to export report");
    }

    return response.blob();
  },
};
