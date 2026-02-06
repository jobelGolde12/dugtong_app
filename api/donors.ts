import { Donor, DonorFilter } from "../types/donor.types";
import { apiClient, getApiErrorMessage } from "./client";

interface GetDonorsResponse {
  items: Donor[];
  total: number;
  page: number;
  page_size: number;
}

export const donorApi = {
  /**
   * Get donors with filters and pagination
   */
  getDonors: async (
    filter: DonorFilter & { page?: number; page_size?: number }
  ): Promise<GetDonorsResponse> => {
    try {
      const params = new URLSearchParams();

      if (filter.bloodType) params.append("blood_type", filter.bloodType);
      if (filter.municipality) params.append("municipality", filter.municipality);
      if (filter.availability !== null && filter.availability !== undefined) {
        params.append("availability", filter.availability ? "true" : "false");
      }
      if (filter.searchQuery) params.append("q", filter.searchQuery);
      if (filter.page) params.append("page", filter.page.toString());
      if (filter.page_size) params.append("page_size", filter.page_size.toString());

      const response = await apiClient.get<GetDonorsResponse>(`/donors?${params.toString()}`);
      return response.data;
    } catch (error) {
      throw new Error(getApiErrorMessage(error));
    }
  },

  /**
   * Get a single donor by ID
   */
  getDonor: async (id: string): Promise<Donor> => {
    try {
      const response = await apiClient.get<Donor>(`/donors/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(getApiErrorMessage(error));
    }
  },

  /**
   * Create a new donor (admin only)
   */
  createDonor: async (data: Partial<Donor>): Promise<Donor> => {
    try {
      const response = await apiClient.post<Donor>("/donors", data);
      return response.data;
    } catch (error) {
      throw new Error(getApiErrorMessage(error));
    }
  },

  /**
   * Update a donor profile
   */
  updateDonor: async (id: string, data: Partial<Donor>): Promise<Donor> => {
    try {
      const response = await apiClient.patch<Donor>(`/donors/${id}`, data);
      return response.data;
    } catch (error) {
      throw new Error(getApiErrorMessage(error));
    }
  },

  /**
   * Update donor availability specifically
   */
  updateAvailability: async (id: string, availabilityStatus: string): Promise<Donor> => {
    try {
      // Backend expects { availability_status: ... }
      const response = await apiClient.patch<Donor>(`/donors/${id}/availability`, {
        availability_status: availabilityStatus,
      });
      return response.data;
    } catch (error) {
      throw new Error(getApiErrorMessage(error));
    }
  },

  /**
   * Soft delete a donor
   */
  deleteDonor: async (id: string): Promise<void> => {
    try {
      await apiClient.delete(`/donors/${id}`);
    } catch (error) {
      throw new Error(getApiErrorMessage(error));
    }
  },
};
