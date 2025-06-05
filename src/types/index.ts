// Re-export all types from specific type files
export * from './api';
export * from './auth';
export * from './session';
export * from './social';
export * from './game';
export * from './shop';

// Common types used across the application
export interface BaseEntity {
  id: string;
  created_at: string;
  updated_at: string;
}

export interface Timestamps {
  created_at: string;
  updated_at?: string;
  deleted_at?: string;
}

export interface ErrorResponse {
  message: string;
  code?: string;
  status?: number;
  details?: any;
}

export interface SuccessResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
}

// Utility types
export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type RequiredBy<T, K extends keyof T> = T & Required<Pick<T, K>>;
export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;