import { apiClient } from "../src/services/apiClient";

export interface Donation {
  id: string;
  donor_id: string;
  donation_date: string;
  blood_type: string;
  quantity_ml: number;
  location: string;
  notes?: string;
  created_at: string;
}

interface GetDonationsParams {
  donor_id?: string;
  blood_type?: string;
  start_date?: string;
  end_date?: string;
  limit?: number;
  offset?: number;
}

export const donationApi = {
  getDonations: async (params?: GetDonationsParams): Promise<Donation[]> => {
    const queryParams = new URLSearchParams();
    
    if (params?.donor_id) queryParams.append("donor_id", params.donor_id);
    if (params?.blood_type) queryParams.append("blood_type", params.blood_type);
    if (params?.start_date) queryParams.append("start_date", params.start_date);
    if (params?.end_date) queryParams.append("end_date", params.end_date);
    if (params?.limit) queryParams.append("limit", String(params.limit));
    if (params?.offset) queryParams.append("offset", String(params.offset));

    const queryString = queryParams.toString();
    const endpoint = `/donations${queryString ? `?${queryString}` : ""}`;
    
    const response = await apiClient.get<{ donations: Donation[] }>(endpoint);
    return response.donations;
  },

  createDonation: async (
    data: Omit<Donation, "id" | "created_at">
  ): Promise<Donation> => {
    const response = await apiClient.post<{ donation: Donation }>("/donations", data);
    return response.donation;
  },

  updateDonation: async (id: string, data: Partial<Donation>): Promise<Donation> => {
    const response = await apiClient.put<{ donation: Donation }>(`/donations/${id}`, data);
    return response.donation;
  },

  deleteDonation: async (id: string): Promise<void> => {
    await apiClient.delete(`/donations/${id}`);
  },
};
