// Mock data for testing
const MOCK_DONORS = [
  { id: '1', name: 'Juan Dela Cruz', bloodType: 'O+', municipality: 'Sorsogon City', availabilityStatus: 'Available', contactNumber: '09123456789' },
  { id: '2', name: 'Maria Santos', bloodType: 'A+', municipality: 'Gubat', availabilityStatus: 'Available', contactNumber: '09234567890' },
  { id: '3', name: 'Pedro Garcia', bloodType: 'B+', municipality: 'Irosin', availabilityStatus: 'Temporarily Unavailable', contactNumber: '09345678901' },
  { id: '4', name: 'Ana Reyes', bloodType: 'AB+', municipality: 'Bulan', availabilityStatus: 'Available', contactNumber: '09456789012' },
  { id: '5', name: 'Jose Lim', bloodType: 'O-', municipality: 'Castilla', availabilityStatus: 'Available', contactNumber: '09567890123' },
];

import { SearchParams, Donor } from '../../types/donor.types';

export const donorService = {
  searchDonors: async (params: SearchParams): Promise<Donor[]> => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return new Promise((resolve) => {
      const filtered = MOCK_DONORS.filter(donor => {
        const matchesBloodType = !params.bloodType || donor.bloodType === params.bloodType;
        const matchesMunicipality = !params.municipality || donor.municipality === params.municipality;
        const matchesAvailability = params.available === undefined || 
                                  (params.available && donor.availabilityStatus === 'Available') ||
                                  (!params.available && donor.availabilityStatus === 'Temporarily Unavailable');

        return matchesBloodType && matchesMunicipality && matchesAvailability;
      });
      
      resolve(filtered);
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