import {
    ReportSummary,
    BloodTypeDistribution,
    MonthlyDonationData,
    AvailabilityTrend
} from '../types/report.types';
import { apiClient, getApiErrorMessage } from './client';

export const reportsApi = {
    /**
     * Get summary statistics
     */
    getSummary: async (): Promise<ReportSummary> => {
        try {
            const response = await apiClient.get<ReportSummary>('/reports/summary');
            return response.data;
        } catch (error) {
            throw new Error(getApiErrorMessage(error));
        }
    },

    /**
     * Get blood type distribution
     */
    getBloodTypeDistribution: async (): Promise<BloodTypeDistribution[]> => {
        try {
            const response = await apiClient.get<BloodTypeDistribution[]>('/reports/blood-type-distribution');
            return response.data;
        } catch (error) {
            throw new Error(getApiErrorMessage(error));
        }
    },

    /**
     * Get monthly donations
     */
    getMonthlyDonations: async (): Promise<MonthlyDonationData[]> => {
        try {
            const response = await apiClient.get<MonthlyDonationData[]>('/reports/monthly-donations');
            return response.data;
        } catch (error) {
            throw new Error(getApiErrorMessage(error));
        }
    },

    /**
     * Get availability trend
     */
    getAvailabilityTrend: async (): Promise<AvailabilityTrend[]> => {
        try {
            const response = await apiClient.get<AvailabilityTrend[]>('/reports/availability-trend');
            return response.data;
        } catch (error) {
            throw new Error(getApiErrorMessage(error));
        }
    }
};
