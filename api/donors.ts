import { Donor, DonorFilter } from "../types/donor.types";
import { apiClient } from "../src/services/apiClient";

interface GetDonorsResponse {
  items: Donor[];
  total: number;
  page: number;
  page_size: number;
}

export const donorApi = {
  getDonors: async (
    filter: DonorFilter & { page?: number; page_size?: number },
  ): Promise<GetDonorsResponse> => {
    const params = new URLSearchParams();
    
    if (filter.bloodType) params.append("bloodType", filter.bloodType);
    if (filter.municipality) params.append("municipality", filter.municipality);
    if (filter.availability) params.append("availability", filter.availability);
    if (filter.searchQuery) params.append("search", filter.searchQuery);
    if (filter.page !== undefined) params.append("page", String(filter.page));
    if (filter.page_size !== undefined) params.append("page_size", String(filter.page_size));

    const queryString = params.toString();
    const endpoint = `/donors${queryString ? `?${queryString}` : ""}`;
    
    return apiClient.get<GetDonorsResponse>(endpoint);
  },

  getDonor: async (id: string): Promise<Donor> => {
    const response = await apiClient.get<{ donor: Donor }>(`/donors/${id}`);
    return response.donor;
  },

  createDonor: async (data: Omit<Donor, "id" | "dateRegistered">): Promise<Donor> => {
    const response = await apiClient.post<{ donor: Donor }>("/donors", data);
    return response.donor;
  },

  updateDonor: async (id: string, data: Partial<Donor>): Promise<Donor> => {
    const response = await apiClient.put<{ donor: Donor }>(`/donors/${id}`, data);
    return response.donor;
  },

  updateAvailability: async (id: string, availabilityStatus: string): Promise<Donor> => {
    const response = await apiClient.patch<{ donor: Donor }>(`/donors/${id}/availability`, {
      availabilityStatus,
    });
    return response.donor;
  },

  deleteDonor: async (id: string): Promise<void> => {
    await apiClient.delete(`/donors/${id}`);
  },
};
