import { Donor, DonorFilter } from "../types/donor.types";
import donorService from "../src/services/donorService";

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
};
