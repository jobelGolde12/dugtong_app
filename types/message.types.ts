export interface Message {
    id: string;
    sender_id: string;
    subject: string;
    content: string;
    is_read: boolean;
    is_closed: boolean;
    created_at: string;
    updated_at?: string;
    sender?: {
        id: string;
        full_name: string;
        contact_number: string;
    };
}

export interface CreateMessageRequest {
    subject: string;
    content: string;
}

export interface MessageFilter {
    is_read?: boolean;
    is_closed?: boolean;
    search_query?: string;
}

export interface PaginatedMessages {
    items: Message[];
    total: number;
    page: number;
    page_size: number;
}
