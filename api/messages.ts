import { apiClient } from "../src/services/apiClient";

export interface Message {
  id: string;
  sender_id: string;
  recipient_id?: string;
  subject?: string;
  content: string;
  is_read: boolean;
  is_closed?: boolean;
  created_at: string;
  sender_name?: string;
  sender_full_name?: string;
  sender_contact_number?: string;
}

interface GetMessagesParams {
  sender_id?: string;
  recipient_id?: string;
  is_read?: boolean;
  limit?: number;
  offset?: number;
}

export const messageApi = {
  getMessages: async (params?: GetMessagesParams): Promise<Message[]> => {
    const queryParams = new URLSearchParams();

    if (params?.sender_id) queryParams.append("sender_id", params.sender_id);
    if (params?.recipient_id) queryParams.append("recipient_id", params.recipient_id);
    if (params?.is_read !== undefined) queryParams.append("is_read", String(params.is_read));
    if (params?.limit) queryParams.append("limit", String(params.limit));
    if (params?.offset) queryParams.append("offset", String(params.offset));

    const queryString = queryParams.toString();
    const endpoint = `/messages${queryString ? `?${queryString}` : ""}`;

    const response = await apiClient.get<{ messages?: Message[]; items?: any[] }>(endpoint);
    // Handle both response formats: { messages: [...] } and { items: [...] }
    const messages = response.messages || response.items || [];
    
    // Map sender_full_name to sender_name for consistency
    return messages.map(msg => ({
      ...msg,
      sender_name: msg.sender_name || msg.sender_full_name || `User ${msg.sender_id}`,
    }));
  },

  sendMessage: async (
    data: { sender_id: string; recipient_id?: string; subject?: string; content: string }
  ): Promise<Message> => {
    console.log('📤 Sending to /messages:', JSON.stringify({ data }));
    const response = await apiClient.post<any>("/messages", { data });
    console.log('📥 Message response:', response);
    return response.message || response;
  },

  markAsRead: async (id: string): Promise<Message> => {
    try {
      const response = await apiClient.patch<{ message?: Message; data?: Message }>(`/messages/${id}/read`, {});
      const result = response.message || response.data || {} as Message;
      // Map sender_full_name to sender_name for consistency
      return {
        ...result,
        sender_name: result.sender_name || result.sender_full_name || `User ${result.sender_id}`,
      };
    } catch (error) {
      console.error('Error in markAsRead:', error);
      throw error;
    }
  },

  closeMessage: async (id: string): Promise<Message> => {
    try {
      const response = await apiClient.patch<{ message?: Message; data?: Message }>(`/messages/${id}/close`, {});
      const result = response.message || response.data || {} as Message;
      return {
        ...result,
        sender_name: result.sender_name || result.sender_full_name || `User ${result.sender_id}`,
      };
    } catch (error) {
      console.error('Error in closeMessage:', error);
      throw error;
    }
  },

  deleteMessage: async (id: string): Promise<void> => {
    await apiClient.delete(`/messages/${id}`);
  },
};
