export interface Donor {
  id: string;
  name: string;
  age: number;
  sex: string;
  bloodType: string;
  contactNumber: string;
  municipality: string;
  availabilityStatus: 'Available' | 'Temporarily Unavailable';
  lastDonationDate?: string;
  dateRegistered: string;
  notes?: string;
}

export interface DonorFilter {
  bloodType: string | null;
  municipality: string | null;
  availability: string | boolean | null;
  searchQuery: string;
}

export interface SearchParams {
  bloodType: string;
    municipality?: string;
    available?: boolean;
  }
  
  export interface DonorRegistration {
    id: string;
    full_name: string;
    contact_number: string;
    age: number;
    blood_type: string;
    municipality: string;
    status: 'pending' | 'approved' | 'rejected';
    created_at: string;
  }
  
  export interface CreateDonorRegistrationRequest {
    full_name: string;
    contact_number: string;
    age: number;
    blood_type: string;
    municipality: string;
    availability: string;
  }
  
