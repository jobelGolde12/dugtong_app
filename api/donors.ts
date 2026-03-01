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
    if (filter.availability) params.append("availability", String(filter.availability));
    if (filter.searchQuery) params.append("search", filter.searchQuery);
    if (filter.page !== undefined) params.append("page", String(filter.page));
    if (filter.page_size !== undefined) params.append("page_size", String(filter.page_size));

    const queryString = params.toString();
    const endpoint = `/donors${queryString ? `?${queryString}` : ""}`;
    
    const response = await apiClient.get<GetDonorsResponse>(endpoint);
    
    // Map backend fields to frontend fields
    if (response.items) {
      response.items = response.items.map((donor: any) => ({
        id: String(donor.id),
        name: donor.full_name || donor.name,
        age: donor.age,
        sex: donor.sex,
        bloodType: donor.blood_type || donor.bloodType,
        contactNumber: donor.contact_number || donor.contactNumber,
        municipality: donor.municipality,
        availabilityStatus: donor.availability_status || donor.availabilityStatus,
        lastDonationDate: donor.last_donation_date || donor.lastDonationDate,
        dateRegistered: donor.created_at || donor.dateRegistered,
        notes: donor.notes
      }));
    }
    
    return response;
  },

  getDonor: async (id: string): Promise<Donor> => {
    const response = await apiClient.get<{ donor: any }>(`/donors/${id}`);
    const donor = response.donor;
    
    // Map backend fields to frontend fields
    return {
      id: String(donor.id),
      name: donor.full_name || donor.name,
      age: donor.age,
      sex: donor.sex,
      bloodType: donor.blood_type || donor.bloodType,
      contactNumber: donor.contact_number || donor.contactNumber,
      municipality: donor.municipality,
      availabilityStatus: donor.availability_status || donor.availabilityStatus,
      lastDonationDate: donor.last_donation_date || donor.lastDonationDate,
      dateRegistered: donor.created_at || donor.dateRegistered,
      notes: donor.notes
    };
  },

  getDonorByContact: async (contactNumber: string): Promise<Donor | null> => {
    const response = await donorApi.getDonors({});
    // Filter client-side since backend search might not work
    const cleanNumber = contactNumber.replace(/\D/g, '');
    if (response.items && response.items.length > 0) {
      const matched = response.items.find((donor: any) => {
        const donorNumber = (donor.contactNumber || donor.contact_number || '').replace(/\D/g, '');
        return donorNumber === cleanNumber;
      });
      return matched || null;
    }
    return null;
  },

  createDonor: async (data: Omit<Donor, "id" | "dateRegistered">): Promise<Donor> => {
    const payload = {
      full_name: data.name,
      age: data.age,
      sex: data.sex,
      blood_type: data.bloodType,
      contact_number: data.contactNumber,
      municipality: data.municipality,
      availability_status: data.availabilityStatus,
      last_donation_date: data.lastDonationDate || null,
      notes: data.notes || null,
      created_at: new Date().toISOString(),
    };
    const response = await apiClient.post<Donor>("/donors", { data: payload });
    return response;
  },

  updateDonor: async (id: string, data: Partial<Donor>): Promise<Donor> => {
    const response = await apiClient.put<Donor>(`/donors/${id}`, { data });
    return response;
  },

  updateAvailability: async (id: string, availabilityStatus: string): Promise<Donor> => {
    const response = await apiClient.patch<Donor>(`/donors/${id}/availability`, {
      availabilityStatus,
    });
    return response;
  },

  deleteDonor: async (id: string): Promise<void> => {
    await apiClient.delete(`/donors/${id}`);
  },
};
