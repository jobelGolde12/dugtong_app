import { Alert, CreateAlertRequest, GetAlertsResponse } from '../types/alert.types';
import { apiClient, getApiErrorMessage } from './client';

export const alertApi = {
    /**
     * Create a new alert
     */
    createAlert: async (data: CreateAlertRequest): Promise<Alert> => {
        try {
            const response = await apiClient.post<Alert>('/alerts', data);
            return response.data;
        } catch (error) {
            throw new Error(getApiErrorMessage(error));
        }
    },

    /**
     * Get filtered alerts
     */
    getAlerts: async (params?: { page?: number; page_size?: number }): Promise<GetAlertsResponse> => {
        try {
            const response = await apiClient.get<GetAlertsResponse>('/alerts', { params });
            return response.data;
        } catch (error) {
            throw new Error(getApiErrorMessage(error));
        }
    },

    /**
     * Get single alert
     */
    getAlert: async (id: string): Promise<Alert> => {
        try {
            const response = await apiClient.get<Alert>(`/alerts/${id}`);
            return response.data;
        } catch (error) {
            throw new Error(getApiErrorMessage(error));
        }
    },

    /**
     * Manually trigger alert send (if not sent immediately)
     */
    sendAlert: async (id: string): Promise<Alert> => {
        try {
            const response = await apiClient.post<Alert>(`/alerts/${id}/send`);
            return response.data;
        } catch (error) {
            throw new Error(getApiErrorMessage(error));
        }
    }
};
