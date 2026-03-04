import { Donor, DonorFilter } from "../types/donor.types";
import { apiClient } from "../src/services/apiClient";

interface GetDonorsResponse {
  items: Donor[];
  total: number;
  page: number;
  page_size: number;
}

export interface PendingDonorRegistration {
  id: string;
  full_name: string;
  age: number;
  sex: string;
  blood_type: string;
  contact_number: string;
  email?: string;
  avatar_data?: string;
  avatar_mime_type?: string;
  municipality: string;
  availability_status?: string;
  status: "pending" | "approved" | "rejected";
  created_at: string;
}

export const donorApi = {
  getDonors: async (
    filter: DonorFilter & { page?: number; page_size?: number },
  ): Promise<GetDonorsResponse> => {
    const params = new URLSearchParams();

    const normalizeAvailabilityFilter = (value: DonorFilter["availability"]): string | null => {
      if (value === null || value === undefined || value === "") return null;
      if (typeof value === "boolean") {
        return value ? "Available" : "Temporarily Unavailable";
      }

      const normalized = String(value).trim().toLowerCase();
      if (normalized === "available") return "Available";
      if (
        normalized === "unavailable" ||
        normalized === "temporarily unavailable" ||
        normalized === "temporarily_unavailable"
      ) {
        return "Temporarily Unavailable";
      }
      if (normalized === "recently donated" || normalized === "recently_donated") {
        return "Recently Donated";
      }

      return String(value);
    };
    
    if (filter.bloodType) params.append("bloodType", filter.bloodType);
    if (filter.municipality) params.append("municipality", filter.municipality);
    const availability = normalizeAvailabilityFilter(filter.availability);
    if (availability) params.append("availability", availability);
    if (filter.searchQuery) params.append("search", filter.searchQuery);
    if (filter.page !== undefined) params.append("page", String(filter.page));
    if (filter.page_size !== undefined) params.append("pageSize", String(Math.min(filter.page_size, 100)));

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
        email: donor.email,
        avatar_data: donor.avatar_data,
        avatar_mime_type: donor.avatar_mime_type,
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
      email: donor.email,
      avatar_data: donor.avatar_data,
      avatar_mime_type: donor.avatar_mime_type,
      municipality: donor.municipality,
      availabilityStatus: donor.availability_status || donor.availabilityStatus,
      lastDonationDate: donor.last_donation_date || donor.lastDonationDate,
      dateRegistered: donor.created_at || donor.dateRegistered,
      notes: donor.notes
    };
  },

  getDonorByContact: async (contactNumber: string): Promise<Donor | null> => {
    try {
      console.log('🔍 getDonorByContact called with:', contactNumber);
      
      // First try to get from donors table
      const response = await donorApi.getDonors({});
      console.log('🔍 Donors response:', response);
      
      const cleanNumber = contactNumber.replace(/\D/g, '');
      console.log('🔍 Clean number:', cleanNumber);
      
      if (response.items && response.items.length > 0) {
        const matched = response.items.find((donor: any) => {
          const donorNumber = (donor.contactNumber || donor.contact_number || '').replace(/\D/g, '');
          return donorNumber === cleanNumber;
        });
        
        if (matched) {
          console.log('✅ Found in donors table:', matched);
          return matched;
        }
      }
      
      // If not found in donors, try donor_registrations
      console.log('🔍 Donor not found in donors table, checking registrations...');
      const registrationsResponse = await apiClient.get<any>('/donor-registrations');
      console.log('🔍 Registrations response:', registrationsResponse);
      
      if (registrationsResponse.items && registrationsResponse.items.length > 0) {
        const matchedReg = registrationsResponse.items.find((reg: any) => {
          const regNumber = (reg.contact_number || '').replace(/\D/g, '');
          return regNumber === cleanNumber;
        });
        
        if (matchedReg) {
          console.log('✅ Found in registrations:', matchedReg);
          // Map registration to Donor format
          const mappedDonor = {
            id: String(matchedReg.id),
            name: matchedReg.full_name,
            age: matchedReg.age,
            sex: matchedReg.sex,
            bloodType: matchedReg.blood_type,
            contactNumber: matchedReg.contact_number,
            email: matchedReg.email,
            avatar_data: matchedReg.avatar_data,
            avatar_mime_type: matchedReg.avatar_mime_type,
            municipality: matchedReg.municipality,
            availabilityStatus: matchedReg.availability || matchedReg.availability_status || 'Available',
            dateRegistered: matchedReg.created_at,
            notes: '',
          };
          console.log('✅ Mapped donor:', mappedDonor);
          return mappedDonor;
        }
      }
      
      console.log('❌ Donor not found in any table');
      return null;
    } catch (error) {
      console.error('❌ Error in getDonorByContact:', error);
      return null;
    }
  },

  createDonor: async (data: Omit<Donor, "id" | "dateRegistered">): Promise<Donor> => {
    const payload = {
      full_name: data.name,
      age: data.age,
      sex: data.sex,
      blood_type: data.bloodType,
      contact_number: data.contactNumber,
      email: data.email || null,
      avatar_data: data.avatar_data || null,
      avatar_mime_type: data.avatar_mime_type || null,
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

  approveRegistration: async (id: string): Promise<PendingDonorRegistration> => {
    const response = await apiClient.patch<PendingDonorRegistration>(`/donor-registrations/${id}`, {
      status: 'approved',
    });
    return response;
  },

  rejectRegistration: async (id: string): Promise<PendingDonorRegistration> => {
    const response = await apiClient.patch<PendingDonorRegistration>(`/donor-registrations/${id}`, {
      status: 'rejected',
    });
    return response;
  },
};
