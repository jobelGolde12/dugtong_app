import { apiClient } from "../src/services/apiClient";

export interface DonorRegistrationResponse {
  id: string;
  full_name: string;
  age: number;
  sex: string;
  blood_type: string;
  contact_number: string;
  municipality: string;
  availability_status: string;
  last_donation_date?: string;
  notes?: string;
  status: "pending" | "approved" | "rejected";
  created_at: string;
  updated_at?: string;
}

export type DonorRegistrationRequest = Omit<DonorRegistrationResponse, "id" | "status" | "created_at" | "updated_at">;

interface GetRegistrationsParams {
  status?: "pending" | "approved" | "rejected";
  municipality?: string;
  blood_type?: string;
  limit?: number;
  offset?: number;
}

export const getDonorRegistrations = async (
  params?: GetRegistrationsParams
): Promise<DonorRegistrationResponse[]> => {
  const queryParams = new URLSearchParams();
  
  if (params?.status) queryParams.append("status", params.status);
  if (params?.municipality) queryParams.append("municipality", params.municipality);
  if (params?.blood_type) queryParams.append("blood_type", params.blood_type);
  if (params?.limit) queryParams.append("limit", String(params.limit));
  if (params?.offset) queryParams.append("offset", String(params.offset));

  const queryString = queryParams.toString();
  const endpoint = `/donor-registrations${queryString ? `?${queryString}` : ""}`;
  
  const response = await apiClient.get<any>(endpoint);
  
  // Handle multiple response formats
  if (response?.items && Array.isArray(response.items)) {
    return response.items;
  } else if (response?.registrations && Array.isArray(response.registrations)) {
    return response.registrations;
  } else if (Array.isArray(response)) {
    return response;
  }
  
  return [];
};

export const createDonorRegistration = async (
  data: DonorRegistrationRequest
): Promise<DonorRegistrationResponse> => {
  const response = await apiClient.post<{ success: boolean; data: { registration: DonorRegistrationResponse } }>(
    "/donor-registrations",
    data
  );

  if (!response.success || !response.data?.registration) {
    throw new Error("Registration failed: Invalid response");
  }

  return response.data.registration;
};

export const updateDonorRegistrationStatus = async (
  id: string,
  status: "approved" | "rejected"
): Promise<DonorRegistrationResponse> => {
  const response = await apiClient.patch<{ registration: DonorRegistrationResponse }>(
    `/donor-registrations/${id}/status`,
    { status }
  );
  return response.registration;
};
