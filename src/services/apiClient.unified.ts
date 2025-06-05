import axios, { AxiosInstance, AxiosError, AxiosRequestConfig } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../lib/supabase';
import { logger } from '../utils/logger';
import { API_BASE_URL, REQUEST_TIMEOUT, RETRY_CONFIG } from '../config/api';
import type { SupabaseResponse } from '../types/api';

const apiLogger = logger.child('UnifiedAPIClient');

export interface APIError extends Error {
  status?: number;
  code?: string;
  details?: any;
}

export interface APIResponse<T = any> {
  data: T;
  status: number;
  headers?: any;
}

export class UnifiedAPIClient {
  private static backendClient: AxiosInstance;
  private static initialized = false;

  // Initialize the client
  static initialize(): void {
    if (this.initialized) return;

    this.backendClient = axios.create({
      baseURL: API_BASE_URL,
      timeout: REQUEST_TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor for auth
    this.backendClient.interceptors.request.use(
      async (config) => {
        const token = await AsyncStorage.getItem('accessToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error),
    );

    // Response interceptor for error handling
    this.backendClient.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          // Try to refresh token
          try {
            const refreshed = await this.refreshToken();
            if (refreshed && error.config) {
              // Retry original request
              error.config.headers.Authorization = `Bearer ${refreshed}`;
              return this.backendClient.request(error.config);
            }
          } catch (refreshError) {
            // Refresh failed, redirect to login
            await AsyncStorage.multiRemove(['accessToken', 'refreshToken']);
            // Trigger logout in app
          }
        }
        return Promise.reject(error);
      },
    );

    this.initialized = true;
  }

  // Token refresh
  private static async refreshToken(): Promise<string | null> {
    try {
      const { data, error } = await supabase.auth.refreshSession();
      if (error || !data.session) {
        return null;
      }
      
      await AsyncStorage.multiSet([
        ['accessToken', data.session.access_token],
        ['refreshToken', data.session.refresh_token],
      ]);
      
      return data.session.access_token;
    } catch (error) {
      apiLogger.error('Token refresh failed', error);
      return null;
    }
  }

  // Error handling
  private static handleError(error: any): APIError {
    const apiError = new Error() as APIError;

    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<any>;
      apiError.status = axiosError.response?.status;
      apiError.message = axiosError.response?.data?.error || 
                        axiosError.response?.data?.message || 
                        axiosError.message || 
                        'ネットワークエラーが発生しました';
      apiError.details = axiosError.response?.data?.details;
    } else if (error.message) {
      apiError.message = error.message;
      apiError.code = error.code;
      apiError.status = error.status;
    } else {
      apiError.message = 'エラーが発生しました';
    }

    apiLogger.error('API Error', {
      message: apiError.message,
      status: apiError.status,
      code: apiError.code,
    });

    return apiError;
  }

  // Generic request wrapper
  private static async request<T>(
    method: 'get' | 'post' | 'put' | 'delete' | 'patch',
    endpoint: string,
    data?: any,
    config?: AxiosRequestConfig,
  ): Promise<APIResponse<T>> {
    try {
      if (!this.initialized) {
        this.initialize();
      }

      const response = await this.backendClient[method](endpoint, data, config);
      return {
        data: response.data,
        status: response.status,
        headers: response.headers,
      };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Supabase query wrapper
  private static async supabaseQuery<T>(
    queryFn: () => Promise<{ data: T | null; error: any }>,
  ): Promise<T> {
    try {
      const { data, error } = await queryFn();
      if (error) {
        throw error;
      }
      if (!data) {
        throw new Error('No data returned');
      }
      return data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Public API methods for backend
  static async get<T>(endpoint: string, config?: AxiosRequestConfig): Promise<APIResponse<T>> {
    return this.request<T>('get', endpoint, undefined, config);
  }

  static async post<T>(endpoint: string, data?: any, config?: AxiosRequestConfig): Promise<APIResponse<T>> {
    return this.request<T>('post', endpoint, data, config);
  }

  static async put<T>(endpoint: string, data?: any, config?: AxiosRequestConfig): Promise<APIResponse<T>> {
    return this.request<T>('put', endpoint, data, config);
  }

  static async patch<T>(endpoint: string, data?: any, config?: AxiosRequestConfig): Promise<APIResponse<T>> {
    return this.request<T>('patch', endpoint, data, config);
  }

  static async delete<T>(endpoint: string, config?: AxiosRequestConfig): Promise<APIResponse<T>> {
    return this.request<T>('delete', endpoint, undefined, config);
  }

  // Supabase-specific methods
  static async supabaseSelect<T>(
    table: string,
    query?: {
      columns?: string;
      filters?: Record<string, any>;
      order?: { column: string; ascending?: boolean };
      limit?: number;
      single?: boolean;
    },
  ): Promise<T> {
    return this.supabaseQuery<T>(async () => {
      let queryBuilder = supabase.from(table).select(query?.columns || '*');

      // Apply filters
      if (query?.filters) {
        Object.entries(query.filters).forEach(([key, value]) => {
          if (Array.isArray(value)) {
            queryBuilder = queryBuilder.in(key, value);
          } else if (value !== null && value !== undefined) {
            queryBuilder = queryBuilder.eq(key, value);
          }
        });
      }

      // Apply ordering
      if (query?.order) {
        queryBuilder = queryBuilder.order(query.order.column, {
          ascending: query.order.ascending ?? true,
        });
      }

      // Apply limit
      if (query?.limit) {
        queryBuilder = queryBuilder.limit(query.limit);
      }

      // Return single or array
      if (query?.single) {
        return await queryBuilder.single();
      }
      
      return await queryBuilder;
    });
  }

  static async supabaseInsert<T>(
    table: string,
    data: any | any[],
    options?: { returning?: boolean },
  ): Promise<T> {
    return this.supabaseQuery<T>(async () => {
      const query = supabase.from(table).insert(data);
      
      if (options?.returning !== false) {
        return await query.select().single();
      }
      
      return await query;
    });
  }

  static async supabaseUpdate<T>(
    table: string,
    data: any,
    filters: Record<string, any>,
    options?: { returning?: boolean },
  ): Promise<T> {
    return this.supabaseQuery<T>(async () => {
      let query = supabase.from(table).update(data);
      
      // Apply filters
      Object.entries(filters).forEach(([key, value]) => {
        query = query.eq(key, value);
      });
      
      if (options?.returning !== false) {
        return await query.select().single();
      }
      
      return await query;
    });
  }

  static async supabaseDelete<T>(
    table: string,
    filters: Record<string, any>,
  ): Promise<T> {
    return this.supabaseQuery<T>(async () => {
      let query = supabase.from(table).delete();
      
      // Apply filters
      Object.entries(filters).forEach(([key, value]) => {
        query = query.eq(key, value);
      });
      
      return await query;
    });
  }

  // Batch operations for performance
  static async batchRequest<T>(
    requests: Array<{
      method: 'get' | 'post' | 'put' | 'delete' | 'patch';
      endpoint: string;
      data?: any;
    }>,
  ): Promise<APIResponse<T>[]> {
    const promises = requests.map((req) =>
      this.request<T>(req.method, req.endpoint, req.data),
    );
    
    return Promise.all(promises);
  }

  // File upload support
  static async uploadFile(
    endpoint: string,
    file: File | Blob,
    additionalData?: Record<string, any>,
  ): Promise<APIResponse<any>> {
    const formData = new FormData();
    formData.append('file', file);
    
    if (additionalData) {
      Object.entries(additionalData).forEach(([key, value]) => {
        formData.append(key, value);
      });
    }

    return this.request('post', endpoint, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  // Supabase storage operations
  static async uploadToStorage(
    bucket: string,
    path: string,
    file: File | Blob,
  ): Promise<string> {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file, {
        upsert: true,
      });

    if (error) {
      throw this.handleError(error);
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(path);

    return publicUrl;
  }

  static async deleteFromStorage(bucket: string, paths: string[]): Promise<void> {
    const { error } = await supabase.storage
      .from(bucket)
      .remove(paths);

    if (error) {
      throw this.handleError(error);
    }
  }
}

// Export convenience functions for backward compatibility
export const apiRequest = {
  get: <T>(endpoint: string, config?: AxiosRequestConfig) => 
    UnifiedAPIClient.get<T>(endpoint, config),
  post: <T>(endpoint: string, data?: any, config?: AxiosRequestConfig) => 
    UnifiedAPIClient.post<T>(endpoint, data, config),
  put: <T>(endpoint: string, data?: any, config?: AxiosRequestConfig) => 
    UnifiedAPIClient.put<T>(endpoint, data, config),
  patch: <T>(endpoint: string, data?: any, config?: AxiosRequestConfig) => 
    UnifiedAPIClient.patch<T>(endpoint, data, config),
  delete: <T>(endpoint: string, config?: AxiosRequestConfig) => 
    UnifiedAPIClient.delete<T>(endpoint, config),
};

export default UnifiedAPIClient;