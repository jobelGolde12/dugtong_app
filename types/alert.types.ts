export interface Alert {
    id: string;
    title: string;
    message: string;
    alert_type: 'urgent' | 'reminder' | 'info' | 'event';
    priority: 'low' | 'medium' | 'high' | 'critical';
    target_audience: string[];
    location?: string;
    schedule_at?: string;
    send_now: boolean;
    created_by: string;
    status: 'draft' | 'scheduled' | 'sent' | 'canceled';
    sent_at?: string;
    created_at: string;
    updated_at: string;
}

export interface CreateAlertRequest {
    title: string;
    message: string;
    alert_type: string;
    priority: string;
    target_audience: string[];
    location?: string;
    schedule_at?: string; // ISO date string
    send_now: boolean;
}

export interface GetAlertsResponse {
    items: Alert[];
    total: number;
    page: number;
    page_size: number;
}
