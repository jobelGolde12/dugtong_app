export interface Donation {
  id: string;
  donor_id: string;
  donation_date: string;
  blood_type: string;
  quantity: number;
  location: string;
}

export interface BloodRequest {
  id: string;
  requester_name: string;
  blood_type: string;
  quantity: number;
  urgency: 'low' | 'medium' | 'high' | 'critical';
  location: string;
  status: 'pending' | 'fulfilled' | 'canceled';
}
