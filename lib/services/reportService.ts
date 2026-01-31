import { ReportSummary, BloodTypeDistribution, MonthlyDonationData, AvailabilityTrend } from '../../types/report.types';

// Mock data for testing
const MOCK_REPORT_SUMMARY: ReportSummary = {
  totalDonors: 125,
  availableDonors: 87,
  requestsThisMonth: 24,
  successfulDonations: 18,
};

const MOCK_BLOOD_TYPE_DISTRIBUTION: BloodTypeDistribution[] = [
  { bloodType: 'O+', count: 35 },
  { bloodType: 'A+', count: 28 },
  { bloodType: 'B+', count: 18 },
  { bloodType: 'O-', count: 12 },
  { bloodType: 'A-', count: 10 },
  { bloodType: 'B-', count: 8 },
  { bloodType: 'AB+', count: 9 },
  { bloodType: 'AB-', count: 5 },
];

const MOCK_MONTHLY_DATA: MonthlyDonationData[] = [
  { month: 'Jan', donations: 15 },
  { month: 'Feb', donations: 18 },
  { month: 'Mar', donations: 22 },
  { month: 'Apr', donations: 19 },
  { month: 'May', donations: 24 },
  { month: 'Jun', donations: 21 },
];

const MOCK_AVAILABILITY_TREND: AvailabilityTrend[] = [
  { date: '2024-01', availableCount: 78, unavailableCount: 22 },
  { date: '2024-02', availableCount: 82, unavailableCount: 18 },
  { date: '2024-03', availableCount: 75, unavailableCount: 25 },
  { date: '2024-04', availableCount: 80, unavailableCount: 20 },
  { date: '2024-05', availableCount: 87, unavailableCount: 13 },
];

export const reportService = {
  getReportSummary: async (): Promise<ReportSummary> => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return new Promise((resolve) => {
      resolve(MOCK_REPORT_SUMMARY);
    });
  },

  getBloodTypeDistribution: async (): Promise<BloodTypeDistribution[]> => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return new Promise((resolve) => {
      resolve(MOCK_BLOOD_TYPE_DISTRIBUTION);
    });
  },

  getMonthlyDonationData: async (): Promise<MonthlyDonationData[]> => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return new Promise((resolve) => {
      resolve(MOCK_MONTHLY_DATA);
    });
  },

  getAvailabilityTrend: async (): Promise<AvailabilityTrend[]> => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return new Promise((resolve) => {
      resolve(MOCK_AVAILABILITY_TREND);
    });
  },
};