// Mock data for testing
const MOCK_DONORS = [
  { id: '1', name: 'Juan Dela Cruz', age: 32, sex: 'Male', bloodType: 'O+', contactNumber: '09123456789', municipality: 'Sorsogon City', availabilityStatus: 'Available', dateRegistered: '2023-01-15', lastDonationDate: '2024-12-10' },
  { id: '2', name: 'Maria Santos', age: 28, sex: 'Female', bloodType: 'A+', contactNumber: '09234567890', municipality: 'Gubat', availabilityStatus: 'Available', dateRegistered: '2023-02-20', lastDonationDate: '2024-11-05' },
  { id: '3', name: 'Pedro Garcia', age: 45, sex: 'Male', bloodType: 'B+', contactNumber: '09345678901', municipality: 'Irosin', availabilityStatus: 'Temporarily Unavailable', dateRegistered: '2023-03-10', lastDonationDate: '2024-10-15' },
  { id: '4', name: 'Ana Reyes', age: 35, sex: 'Female', bloodType: 'AB+', contactNumber: '09456789012', municipality: 'Bulan', availabilityStatus: 'Available', dateRegistered: '2023-04-05', lastDonationDate: '2024-09-20' },
  { id: '5', name: 'Jose Lim', age: 40, sex: 'Male', bloodType: 'O-', contactNumber: '09567890123', municipality: 'Castilla', availabilityStatus: 'Available', dateRegistered: '2023-05-12', lastDonationDate: '2024-08-30' },
];

import { Donor, DonorFilter } from '../../types/donor.types';

export const donorService = {
  getDonors: async (filters: DonorFilter): Promise<Donor[]> => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return new Promise((resolve) => {
      let filtered = [...MOCK_DONORS];
      
      if (filters.bloodType) {
        filtered = filtered.filter(donor => donor.bloodType === filters.bloodType);
      }
      
      if (filters.municipality) {
        filtered = filtered.filter(donor => donor.municipality === filters.municipality);
      }
      
      if (filters.availability !== null && filters.availability !== undefined) {
        if (filters.availability === true) {
          filtered = filtered.filter(donor => donor.availabilityStatus === 'Available');
        } else if (filters.availability === false) {
          filtered = filtered.filter(donor => donor.availabilityStatus === 'Temporarily Unavailable');
        }
      }
      
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase();
        filtered = filtered.filter(donor => 
          donor.name.toLowerCase().includes(query) ||
          donor.contactNumber.includes(query)
        );
      }
      
      resolve(filtered);
    });
  },

  updateDonorAvailability: async (id: string, availabilityStatus: 'Available' | 'Temporarily Unavailable'): Promise<void> => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    return new Promise((resolve) => {
      const donorIndex = MOCK_DONORS.findIndex(donor => donor.id === id);
      if (donorIndex !== -1) {
        MOCK_DONORS[donorIndex] = {
          ...MOCK_DONORS[donorIndex],
          availabilityStatus
        };
      }
      resolve();
    });
  },

  getDonorById: async (id: string): Promise<Donor | null> => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    return new Promise((resolve) => {
      const donor = MOCK_DONORS.find(donor => donor.id === id);
      resolve(donor || null);
    });
  }
};