import { Donor, DonorFilter } from "../types/donor.types";
import donorService from "../src/services/donorService";
import { getDonorRegistrations, DonorRegistrationResponse } from "./donor-registrations";

interface GetDonorsResponse {
  items: Donor[];
  total: number;
  page: number;
  page_size: number;
}

export interface PendingDonorRegistration extends DonorRegistrationResponse {
  type: 'registration'; // To distinguish from regular donors
}

export const donorApi = {
  getDonors: async (
    filter: DonorFilter & { page?: number; page_size?: number },
  ): Promise<GetDonorsResponse> => {
    return donorService.getDonors(filter);
  },

  getDonor: async (id: string): Promise<Donor> => {
    return donorService.getDonor(id);
  },

  createDonor: async (data: Partial<Donor>): Promise<Donor> => {
    return donorService.createDonor(data);
  },

  updateDonor: async (id: string, data: Partial<Donor>): Promise<Donor> => {
    return donorService.updateDonor(id, data);
  },

  updateAvailability: async (id: string, availabilityStatus: string): Promise<Donor> => {
    return donorService.updateAvailability(id, availabilityStatus);
  },

  deleteDonor: async (id: string): Promise<void> => {
    return donorService.deleteDonor(id);
  },

  getPendingRegistrations: async (
    params?: {
      status?: "pending" | "approved" | "rejected";
      municipality?: string;
      blood_type?: string;
      limit?: number;
      offset?: number;
    },
  ): Promise<PendingDonorRegistration[]> => {
    const registrations = await getDonorRegistrations(params);
    return registrations.map(reg => ({ ...reg, type: 'registration' }));
  },

  approveRegistration: async (id: string): Promise<DonorRegistrationResponse> => {
    const { updateDonorRegistrationStatus } = await import('./donor-registrations');
    return updateDonorRegistrationStatus(id, 'approved');
  },

  rejectRegistration: async (id: string): Promise<DonorRegistrationResponse> => {
    const { updateDonorRegistrationStatus } = await import('./donor-registrations');
    return updateDonorRegistrationStatus(id, 'rejected');
  },
};
