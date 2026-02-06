import apiClient from "./client";

// ==================== Types ====================

export interface Donor {
  id: string;
  full_name: string;
  age: number;
  sex: "Male" | "Female";
  blood_type: string;
  contact_number: string;
  municipality: string;
  availability_status:
    | "Available"
    | "Temporarily Unavailable"
    | "Recently Donated";
  last_donation_date?: string;
  date_registered: string;
  notes?: string;
  status: "pending" | "approved" | "rejected";
}

export interface DonorRegistration {
  id: string;
  full_name: string;
  age: number;
  sex: "Male" | "Female";
  blood_type: string;
  contact_number: string;
  municipality: string;
  availability_status: "Available" | "Temporarily Unavailable";
  status: "pending" | "approved" | "rejected";
  created_at: string;
}

export interface DonorFilter {
  blood_type?: string;
  municipality?: string;
  availability?: string;
  q?: string;
  page?: number;
  page_size?: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface UpdateAvailabilityRequest {
  availability_status:
    | "Available"
    | "Temporarily Unavailable"
    | "Recently Donated";
}

// ==================== API Endpoints ====================

/**
 * Get list of donors with filters and pagination
 */
export const getDonors = async (
  filters: DonorFilter = {},
): Promise<PaginatedResponse<Donor>> => {
  const params: Record<string, string | number> = {};

  if (filters.blood_type) params.blood_type = filters.blood_type;
  if (filters.municipality) params.municipality = filters.municipality;
  if (filters.availability) params.availability = filters.availability;
  if (filters.q) params.q = filters.q;
  if (filters.page) params.page = filters.page;
  if (filters.page_size) params.page_size = filters.page_size;

  const response = await apiClient.get<PaginatedResponse<Donor>>("/donors", {
    params,
  });
  return response.data;
};

/**
 * Get single donor by ID
 */
export const getDonorById = async (id: string): Promise<Donor> => {
  const response = await apiClient.get<Donor>(`/donors/${id}`);
  return response.data;
};

/**
 * Create new donor (admin only)
 */
export const createDonor = async (data: Partial<Donor>): Promise<Donor> => {
  const response = await apiClient.post<Donor>("/donors", data);
  return response.data;
};

/**
 * Update donor (admin only)
 */
export const updateDonor = async (
  id: string,
  data: Partial<Donor>,
): Promise<Donor> => {
  const response = await apiClient.patch<Donor>(`/donors/${id}`, data);
  return response.data;
};

/**
 * Update donor availability status
 */
export const updateDonorAvailability = async (
  id: string,
  data: UpdateAvailabilityRequest,
): Promise<Donor> => {
  const response = await apiClient.patch<Donor>(
    `/donors/${id}/availability`,
    data,
  );
  return response.data;
};

/**
 * Soft delete donor (admin only)
 */
export const deleteDonor = async (id: string): Promise<void> => {
  await apiClient.delete(`/donors/${id}`);
};

/**
 * Register as new donor (self-registration)
 */
export const registerDonor = async (
  data: Omit<DonorRegistration, "id" | "status" | "created_at">,
): Promise<DonorRegistration> => {
  const response = await apiClient.post<DonorRegistration>(
    "/donor-registrations",
    data,
  );
  return response.data;
};

/**
 * Get pending donor registrations (admin only)
 */
export const getPendingRegistrations = async (): Promise<
  DonorRegistration[]
> => {
  const response = await apiClient.get<DonorRegistration[]>(
    "/donor-registrations",
  );
  return response.data;
};

/**
 * Approve or reject donor registration (admin only)
 */
export const reviewRegistration = async (
  id: string,
  status: "approved" | "rejected",
): Promise<DonorRegistration> => {
  const response = await apiClient.patch<DonorRegistration>(
    `/donor-registrations/${id}`,
    { review_status: status },
  );
  return response.data;
};

/**
 * Search donors (alias for getDonors with query)
 */
export const searchDonors = async (
  query: string,
  filters: Omit<DonorFilter, "q"> = {},
): Promise<PaginatedResponse<Donor>> => {
  return getDonors({ ...filters, q: query });
};

export default {
  getDonors,
  getDonorById,
  createDonor,
  updateDonor,
  updateDonorAvailability,
  deleteDonor,
  registerDonor,
  getPendingRegistrations,
  reviewRegistration,
  searchDonors,
};
