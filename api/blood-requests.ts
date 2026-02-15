import { apiClient } from "../src/services/apiClient";

export interface BloodRequest {
  id: string;
  requester_name: string;
  blood_type: string;
  urgency: "low" | "medium" | "high" | "critical";
  location: string;
  contact_number: string;
  status: "active" | "fulfilled" | "cancelled";
  created_at: string;
  notes?: string;
}

interface GetBloodRequestsParams {
  blood_type?: string;
  urgency?: string;
  status?: string;
  month?: string;
  limit?: number;
  offset?: number;
}

export const bloodRequestApi = {
  getBloodRequests: async (params?: GetBloodRequestsParams): Promise<BloodRequest[]> => {
    const queryParams = new URLSearchParams();
    
    if (params?.blood_type) queryParams.append("blood_type", params.blood_type);
    if (params?.urgency) queryParams.append("urgency", params.urgency);
    if (params?.status) queryParams.append("status", params.status);
    if (params?.month) queryParams.append("month", params.month);
    if (params?.limit) queryParams.append("limit", String(params.limit));
    if (params?.offset) queryParams.append("offset", String(params.offset));

    const queryString = queryParams.toString();
    const endpoint = `/blood-requests${queryString ? `?${queryString}` : ""}`;
    
    const response = await apiClient.get<{ requests: BloodRequest[] }>(endpoint);
    return response.requests;
  },

  createBloodRequest: async (
    data: Omit<BloodRequest, "id" | "created_at" | "status">
  ): Promise<BloodRequest> => {
    const response = await apiClient.post<{ request: BloodRequest }>("/blood-requests", data);
    return response.request;
  },

  updateBloodRequest: async (id: string, data: Partial<BloodRequest>): Promise<BloodRequest> => {
    const response = await apiClient.put<{ request: BloodRequest }>(`/blood-requests/${id}`, data);
    return response.request;
  },

  updateStatus: async (id: string, status: string): Promise<BloodRequest> => {
    const response = await apiClient.patch<{ request: BloodRequest }>(
      `/blood-requests/${id}/status`,
      { status }
    );
    return response.request;
  },

  deleteBloodRequest: async (id: string): Promise<void> => {
    await apiClient.delete(`/blood-requests/${id}`);
  },
};
