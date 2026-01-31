export interface ReportSummary {
  totalDonors: number;
  availableDonors: number;
  requestsThisMonth: number;
  successfulDonations: number;
}

export interface BloodTypeDistribution {
  bloodType: string;
  count: number;
}

export interface MonthlyDonationData {
  month: string;
  donations: number;
}

export interface AvailabilityTrend {
  date: string;
  availableCount: number;
  unavailableCount: number;
}