import { CreateMessageRequest, Message, MessageFilter, PaginatedMessages } from "../types/message.types";
import apiClient, { getApiErrorMessage } from "./client";

export const messageApi = {
    /**
     * Send a message to admin from donor
     */
    sendMessage: async (data: CreateMessageRequest): Promise<Message> => {
        try {
            const response = await apiClient.post<Message>("/messages", data);
            return response.data;
        } catch (error) {
            throw new Error(getApiErrorMessage(error));
        }
    },

    /**
     * Get list of messages (admin only)
     */
    getMessages: async (
        filter: MessageFilter & { page?: number; page_size?: number }
    ): Promise<PaginatedMessages> => {
        try {
            const params = new URLSearchParams();

            if (filter.is_read !== undefined) params.append("is_read", String(filter.is_read));
            if (filter.is_closed !== undefined) params.append("is_closed", String(filter.is_closed));
            if (filter.search_query) params.append("q", filter.search_query);
            if (filter.page) params.append("page", filter.page.toString());
            if (filter.page_size) params.append("page_size", filter.page_size.toString());

            const response = await apiClient.get<PaginatedMessages>(`/messages?${params.toString()}`);
            return response.data;
        } catch (error) {
            throw new Error(getApiErrorMessage(error));
        }
    },

    /**
     * Close a message (admin only)
     */
    closeMessage: async (id: string): Promise<Message> => {
        try {
            const response = await apiClient.patch<Message>(`/messages/${id}/close`);
            return response.data;
        } catch (error) {
            throw new Error(getApiErrorMessage(error));
        }
    },
};
