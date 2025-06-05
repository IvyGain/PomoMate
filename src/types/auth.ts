// User and Authentication types
// This is the single source of truth for user-related types

import { BaseEntity } from './index';

export interface User extends BaseEntity {
  email: string;
  username: string;
  display_name: string;
  avatar_url?: string;
  level: number;
  experience: number;
  coins: number;
  streak_days: number;
  last_session_date?: string;
  focus_time_today: number;
  total_focus_time: number;
}

export interface UserProfile extends User {
  // Extends User with additional profile data if needed
}

export interface AuthUser {
  id: string;
  email: string;
  email_confirmed_at?: string;
  phone?: string;
  confirmed_at?: string;
  last_sign_in_at?: string;
  app_metadata?: Record<string, any>;
  user_metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface AuthSession {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  expires_at?: number;
  token_type: string;
  user: AuthUser;
}

export interface AuthState {
  user: User | null;
  session: AuthSession | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials extends LoginCredentials {
  username: string;
  confirmPassword?: string;
}

export interface PasswordResetRequest {
  email: string;
}

export interface PasswordResetConfirm {
  token: string;
  password: string;
  confirmPassword: string;
}