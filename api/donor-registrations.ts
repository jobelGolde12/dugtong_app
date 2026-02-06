import apiClient from './client';

// ==================== Types ====================

export interface DonorRegistrationRequest {
  full_name: string;
  age: number;
  sex: 'Male' | 'Female';
  blood_type: string;
  contact_number: string;
  municipality: string;
  availability_status: 'Available' | 'Temporarily Unavailable';
}

export interface DonorRegistrationResponse {
  id: string;
  full_name: string;
  age: number;
  sex: 'Male' | 'Female';
  blood_type: string;
  contact_number: string;
  municipality: string;
  availability_status: 'Available' | 'Temporarily Unavailable';
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  updated_at?: string;
}

export interface ValidationError {
  field: string;
  message: string;
}

export interface ApiError {
  detail: string;
  validation_errors?: ValidationError[];
}

// ==================== API Endpoints ====================

/**
 * Submit a new donor registration
 */
export const createDonorRegistration = async (
  data: DonorRegistrationRequest,
): Promise<DonorRegistrationResponse> => {
  const response = await apiClient.post<DonorRegistrationResponse>(
    '/donor-registrations',
    data,
  );
  return response.data;
};

/**
 * Get donor registration by ID (for admin use)
 */
export const getDonorRegistration = async (
  id: string,
): Promise<DonorRegistrationResponse> => {
  const response = await apiClient.get<DonorRegistrationResponse>(
    `/donor-registrations/${id}`,
  );
  return response.data;
};

/**
 * Get all donor registrations (for admin use)
 */
export const getDonorRegistrations = async (
  params?: {
    status?: 'pending' | 'approved' | 'rejected';
    municipality?: string;
    blood_type?: string;
    limit?: number;
    offset?: number;
  },
): Promise<DonorRegistrationResponse[]> => {
  const response = await apiClient.get<DonorRegistrationResponse[]>(
    '/donor-registrations',
    { params },
  );
  return response.data;
};

/**
 * Update donor registration status (for admin use)
 */
export const updateDonorRegistrationStatus = async (
  id: string,
  status: 'approved' | 'rejected',
): Promise<DonorRegistrationResponse> => {
  const response = await apiClient.patch<DonorRegistrationResponse>(
    `/donor-registrations/${id}/status`,
    { status },
  );
  return response.data;
};

/**
 * Delete donor registration (for admin use)
 */
export const deleteDonorRegistration = async (id: string): Promise<void> => {
  await apiClient.delete(`/donor-registrations/${id}`);
};