import { apiClient } from "../src/services/apiClient";

export interface Alert {
  id: string;
  blood_type: string;
  municipality: string;
  urgency: "low" | "medium" | "high" | "critical";
  message: string;
  contact_info?: string;
  created_by: string;
  created_at: string;
  expires_at?: string;
  is_active: boolean;
}

interface GetAlertsParams {
  blood_type?: string;
  municipality?: string;
  urgency?: string;
  is_active?: boolean;
  limit?: number;
  offset?: number;
}

export const alertApi = {
  getAlerts: async (params?: GetAlertsParams): Promise<Alert[]> => {
    const queryParams = new URLSearchParams();
    
    if (params?.blood_type) queryParams.append("blood_type", params.blood_type);
    if (params?.municipality) queryParams.append("municipality", params.municipality);
    if (params?.urgency) queryParams.append("urgency", params.urgency);
    if (params?.is_active !== undefined) queryParams.append("is_active", String(params.is_active));
    if (params?.limit) queryParams.append("limit", String(params.limit));
    if (params?.offset) queryParams.append("offset", String(params.offset));

    const queryString = queryParams.toString();
    const endpoint = `/alerts${queryString ? `?${queryString}` : ""}`;
    
    const response = await apiClient.get<{ alerts: Alert[] }>(endpoint);
    return response.alerts;
  },

  createAlert: async (
    data: Omit<Alert, "id" | "created_at" | "is_active">
  ): Promise<Alert> => {
    const response = await apiClient.post<{ alert: Alert }>("/alerts", data);
    return response.alert;
  },

  updateAlert: async (id: string, data: Partial<Alert>): Promise<Alert> => {
    const response = await apiClient.put<{ alert: Alert }>(`/alerts/${id}`, data);
    return response.alert;
  },

  deactivateAlert: async (id: string): Promise<Alert> => {
    const response = await apiClient.patch<{ alert: Alert }>(`/alerts/${id}/deactivate`, {});
    return response.alert;
  },

  deleteAlert: async (id: string): Promise<void> => {
    await apiClient.delete(`/alerts/${id}`);
  },
};
