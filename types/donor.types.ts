export interface Donor {
  id: string;
  name: string;
  age?: number;
  sex?: string;
  bloodType: string;
  contactNumber: string;
  municipality: string;
  availabilityStatus: 'Available' | 'Temporarily Unavailable';
  dateRegistered?: string;
  notes?: string;
}

export interface SearchFilters {
  bloodType: string;
  municipality: string;
  availabilityStatus: 'Available' | 'Any';
}

export interface SearchParams {
  bloodType?: string;
  municipality?: string;
  available?: boolean;
}