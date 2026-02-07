import { Donation, BloodRequest } from '../types/donation.types';
import { apiClient, getApiErrorMessage } from './client';

export const donationsApi = {
    /**
     * Get list of donations
     */
    getDonations: async (): Promise<Donation[]> => {
        try {
            const response = await apiClient.get<Donation[]>('/donations/donations');
            return response.data;
        } catch (error) {
            throw new Error(getApiErrorMessage(error));
        }
    },

    /**
     * Create a new donation
     */
    createDonation: async (data: Omit<Donation, 'id'>): Promise<Donation> => {
        try {
            const response = await apiClient.post<Donation>('/donations/donations', data);
            return response.data;
        } catch (error) {
            throw new Error(getApiErrorMessage(error));
        }
    },

    /**
     * Get list of blood requests
     */
    getBloodRequests: async (): Promise<BloodRequest[]> => {
        try {
            const response = await apiClient.get<BloodRequest[]>('/donations/requests');
            return response.data;
        } catch (error) {
            throw new Error(getApiErrorMessage(error));
        }
    },

    /**
     * Create a new blood request
     */
    createBloodRequest: async (data: Omit<BloodRequest, 'id' | 'status'>): Promise<BloodRequest> => {
        try {
            const response = await apiClient.post<BloodRequest>('/donations/requests', data);
            return response.data;
        } catch (error) {
            throw new Error(getApiErrorMessage(error));
        }
    }
};
