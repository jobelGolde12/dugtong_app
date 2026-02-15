import { API_BASE_URL } from "../config/api";
import { getAccessToken, clearTokens } from "../../api/client";
import { router } from "expo-router";

interface ApiRequestOptions extends RequestInit {
  requiresAuth?: boolean;
}

class ApiClient {
  private async getHeaders(requiresAuth: boolean = true): Promise<HeadersInit> {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };

    if (requiresAuth) {
      const token = await getAccessToken();
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
    }

    return headers;
  }

  async request<T>(
    endpoint: string,
    options: ApiRequestOptions = {}
  ): Promise<T> {
    const { requiresAuth = true, ...fetchOptions } = options;

    try {
      const headers = await this.getHeaders(requiresAuth);
      const url = `${API_BASE_URL}${endpoint}`;

      console.log(`🌐 API Request: ${fetchOptions.method || 'GET'} ${url}`);

      const response = await fetch(url, {
        ...fetchOptions,
        headers: {
          ...headers,
          ...fetchOptions.headers,
        },
      });

      console.log(`📡 Response Status: ${response.status} ${response.statusText}`);

      if (response.status === 401) {
        await clearTokens();
        router.replace("/login");
        throw new Error("Unauthorized");
      }

      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}`;
        
        try {
          const text = await response.text();
          console.error(`❌ Response Error (${response.status}):`, text);
          
          if (text) {
            try {
              const errorData = JSON.parse(text);
              errorMessage = errorData.error || errorData.message || text;
            } catch {
              errorMessage = text || response.statusText;
            }
          }
        } catch (e) {
          console.error('Failed to read error response:', e);
          errorMessage = response.statusText || `HTTP ${response.status}`;
        }
        
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log(`✅ Response Success`);
      return data;
    } catch (error: any) {
      // Check if it's a network error (backend not running)
      if (error.message === 'Network request failed' || error.message === 'Failed to fetch') {
        console.error(`⚠️  Backend not available at ${API_BASE_URL}`);
        console.error('Please check your backend URL and network connection');
      }
      console.error(`API Error [${endpoint}]:`, error);
      throw error;
    }
  }

  async get<T>(endpoint: string, requiresAuth = true): Promise<T> {
    return this.request<T>(endpoint, { method: "GET", requiresAuth });
  }

  async post<T>(endpoint: string, data?: any, requiresAuth = true): Promise<T> {
    return this.request<T>(endpoint, {
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
      requiresAuth,
    });
  }

  async put<T>(endpoint: string, data?: any, requiresAuth = true): Promise<T> {
    return this.request<T>(endpoint, {
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
      requiresAuth,
    });
  }

  async patch<T>(endpoint: string, data?: any, requiresAuth = true): Promise<T> {
    return this.request<T>(endpoint, {
      method: "PATCH",
      body: data ? JSON.stringify(data) : undefined,
      requiresAuth,
    });
  }

  async delete<T>(endpoint: string, requiresAuth = true): Promise<T> {
    return this.request<T>(endpoint, { method: "DELETE", requiresAuth });
  }
}

export const apiClient = new ApiClient();
