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
  availability: boolean | null;
  searchQuery: string;
}