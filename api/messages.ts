import { apiClient } from "../src/services/apiClient";

export interface Message {
  id: string;
  sender_id: string;
  recipient_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
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
    
    const response = await apiClient.get<{ messages: Message[] }>(endpoint);
    return response.messages;
  },

  sendMessage: async (
    data: Omit<Message, "id" | "created_at" | "is_read">
  ): Promise<Message> => {
    const response = await apiClient.post<{ message: Message }>("/messages", data);
    return response.message;
  },

  markAsRead: async (id: string): Promise<Message> => {
    const response = await apiClient.patch<{ message: Message }>(`/messages/${id}/read`, {});
    return response.message;
  },

  deleteMessage: async (id: string): Promise<void> => {
    await apiClient.delete(`/messages/${id}`);
  },
};
