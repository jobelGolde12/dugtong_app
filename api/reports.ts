import { apiClient } from "../src/services/apiClient";

export interface ReportData {
  totalDonors: number;
  activeDonors: number;
  totalDonations: number;
  donationsByBloodType: Record<string, number>;
  donationsByMonth: Array<{ month: string; count: number }>;
  donorsByMunicipality: Record<string, number>;
}

export const reportApi = {
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
