import { supabase } from '../lib/supabase';
import { logger } from '../utils/logger';
import type { SupabaseResponse, ApiError } from '../types/api';

const apiLogger = logger.child('ApiClient');

export class ApiClient {
  private static instance: ApiClient;
  
  private constructor() {}
  
  static getInstance(): ApiClient {
    if (!ApiClient.instance) {
      ApiClient.instance = new ApiClient();
    }
    return ApiClient.instance;
  }
  
  private async handleResponse<T>(
    promise: Promise<SupabaseResponse<T>>,
    operation: string,
  ): Promise<T> {
    try {
      const { data, error } = await promise;
      
      if (error) {
        apiLogger.error(`${operation} failed`, error);
        throw this.formatError(error);
      }
      
      if (!data) {
        throw this.formatError({
          message: 'No data returned',
          code: 'NO_DATA',
        });
      }
      
      return data;
    } catch (error: any) {
      apiLogger.error(`${operation} exception`, error);
      throw this.formatError(error);
    }
  }
  
  private formatError(error: any): ApiError {
    return {
      message: error.message || 'An error occurred',
      code: error.code,
      statusCode: error.status,
      details: error.details || error.hint,
    };
  }
  
  async checkAuth(): Promise<boolean> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      return !!session;
    } catch (error) {
      apiLogger.error('Auth check failed', error);
      return false;
    }
  }
  
  async refreshToken(): Promise<void> {
    try {
      const { error } = await supabase.auth.refreshSession();
      if (error) throw error;
      apiLogger.info('Token refreshed successfully');
    } catch (error) {
      apiLogger.error('Token refresh failed', error);
      throw this.formatError(error);
    }
  }
  
  // Generic CRUD operations
  async get<T>(
    table: string,
    id: string,
    options?: {
      select?: string;
    },
  ): Promise<T> {
    const query = supabase
      .from(table)
      .select(options?.select || '*')
      .eq('id', id)
      .single();
      
    return this.handleResponse(query, `Get ${table}`);
  }
  
  async list<T>(
    table: string,
    options?: {
      select?: string;
      filters?: Record<string, any>;
      orderBy?: { column: string; ascending?: boolean };
      limit?: number;
      offset?: number;
    },
  ): Promise<T[]> {
    let query = supabase
      .from(table)
      .select(options?.select || '*');
      
    // Apply filters
    if (options?.filters) {
      Object.entries(options.filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          query = query.eq(key, value);
        }
      });
    }
    
    // Apply ordering
    if (options?.orderBy) {
      query = query.order(options.orderBy.column, {
        ascending: options.orderBy.ascending ?? true,
      });
    }
    
    // Apply pagination
    if (options?.limit) {
      query = query.limit(options.limit);
    }
    if (options?.offset) {
      query = query.range(options.offset, options.offset + (options?.limit || 10) - 1);
    }
    
    const result = await this.handleResponse(query, `List ${table}`);
    return result || [];
  }
  
  async create<T>(
    table: string,
    data: Partial<T>,
    options?: {
      select?: string;
    },
  ): Promise<T> {
    const query = supabase
      .from(table)
      .insert([data])
      .select(options?.select || '*')
      .single();
      
    return this.handleResponse(query, `Create ${table}`);
  }
  
  async update<T>(
    table: string,
    id: string,
    data: Partial<T>,
    options?: {
      select?: string;
    },
  ): Promise<T> {
    const query = supabase
      .from(table)
      .update(data)
      .eq('id', id)
      .select(options?.select || '*')
      .single();
      
    return this.handleResponse(query, `Update ${table}`);
  }
  
  async delete(
    table: string,
    id: string,
  ): Promise<void> {
    const query = supabase
      .from(table)
      .delete()
      .eq('id', id);
      
    await this.handleResponse(query, `Delete ${table}`);
  }
  
  // Batch operations
  async createMany<T>(
    table: string,
    data: Partial<T>[],
    options?: {
      select?: string;
    },
  ): Promise<T[]> {
    const query = supabase
      .from(table)
      .insert(data)
      .select(options?.select || '*');
      
    return this.handleResponse(query, `Create many ${table}`);
  }
  
  async updateMany<T>(
    table: string,
    updates: { id: string; data: Partial<T> }[],
  ): Promise<void> {
    const promises = updates.map(({ id, data }) =>
      this.update(table, id, data),
    );
    
    await Promise.all(promises);
  }
  
  // RPC calls
  async rpc<T>(
    functionName: string,
    params?: Record<string, any>,
  ): Promise<T> {
    const query = supabase.rpc(functionName, params);
    return this.handleResponse(query, `RPC ${functionName}`);
  }
}

// Export singleton instance
export const apiClient = ApiClient.getInstance();