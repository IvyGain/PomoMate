import { supabase } from '../lib/supabase';
import { logger } from '../utils/logger';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { User } from '../../store/authStore';
import type { UserProfile } from '../types/api';

const authLogger = logger.child('AuthService');

export interface AuthResult {
  user?: User | UserProfile;
  accessToken?: string;
  refreshToken?: string;
  requiresEmailConfirmation?: boolean;
  email?: string;
}

export interface AuthError extends Error {
  code?: string;
  status?: number;
}

export class UnifiedAuthService {
  // Token management
  private static async saveTokens(accessToken: string, refreshToken: string): Promise<void> {
    await AsyncStorage.multiSet([
      ['accessToken', accessToken],
      ['refreshToken', refreshToken],
    ]);
  }

  private static async clearTokens(): Promise<void> {
    await AsyncStorage.multiRemove(['accessToken', 'refreshToken']);
  }

  private static async getAccessToken(): Promise<string | null> {
    return await AsyncStorage.getItem('accessToken');
  }

  // Error handling
  private static handleAuthError(error: any): AuthError {
    authLogger.error('Auth error', {
      message: error.message,
      code: error.code,
      status: error.status,
    });

    // Supabase error handling
    if (error.message) {
      const authError = new Error(error.message) as AuthError;
      authError.code = error.code;
      authError.status = error.status;
      return authError;
    }

    // API error handling (for backend compatibility)
    if (error.response) {
      const { status, data } = error.response;
      let message = 'エラーが発生しました';
      
      switch (status) {
        case 400:
          message = data.error || '入力内容を確認してください';
          break;
        case 401:
          message = 'メールアドレスまたはパスワードが正しくありません';
          break;
        case 409:
          message = 'このメールアドレスは既に登録されています';
          break;
        case 422:
          message = data.details || 'バリデーションエラー';
          break;
        default:
          message = data.error || 'エラーが発生しました';
      }
      
      const authError = new Error(message) as AuthError;
      authError.status = status;
      return authError;
    }

    return error;
  }

  // User profile management
  private static async createUserProfile(
    userId: string,
    email: string,
    username: string
  ): Promise<UserProfile> {
    authLogger.info('Creating user profile', { userId });

    const { data, error } = await supabase
      .from('users')
      .insert([{
        id: userId,
        email,
        username,
        display_name: username,
      }])
      .select()
      .single();

    if (error) {
      // Handle duplicate profile
      if (error.code === '23505') {
        authLogger.info('Profile already exists, fetching existing', { userId });
        return this.fetchUserProfile(userId);
      }
      throw error;
    }

    return data;
  }

  private static async fetchUserProfile(userId: string): Promise<UserProfile> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      throw error;
    }

    return data;
  }

  private static async createDefaultSettings(userId: string): Promise<void> {
    authLogger.info('Creating default settings', { userId });

    try {
      await supabase.from('user_settings').insert([{ user_id: userId }]);
      await supabase.from('user_characters').insert([{
        user_id: userId,
        character_id: 'balanced_1',
        is_active: true,
      }]);
    } catch (error) {
      authLogger.warn('Failed to create default settings', error);
      // Non-critical, continue
    }
  }

  // Authentication methods
  static async register(
    email: string,
    password: string,
    username: string
  ): Promise<AuthResult> {
    try {
      authLogger.info('Starting user registration', { email });

      // Sign up with Supabase
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username,
            display_name: username,
          },
        },
      });

      if (error) {
        throw error;
      }

      // Check if email confirmation required
      if (data.user && !data.session) {
        return {
          requiresEmailConfirmation: true,
          email,
        };
      }

      if (!data.user) {
        throw new Error('User creation failed');
      }

      // Create profile and settings
      const profile = await this.createUserProfile(data.user.id, email, username);
      await this.createDefaultSettings(data.user.id);

      // Save tokens if session exists
      if (data.session) {
        await this.saveTokens(data.session.access_token, data.session.refresh_token);
      }

      return {
        user: profile,
        accessToken: data.session?.access_token,
        refreshToken: data.session?.refresh_token,
      };
    } catch (error: any) {
      throw this.handleAuthError(error);
    }
  }

  static async login(email: string, password: string): Promise<AuthResult> {
    try {
      authLogger.info('User login attempt', { email });

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      if (!data.user || !data.session) {
        throw new Error('Login failed');
      }

      // Fetch user profile
      const profile = await this.fetchUserProfile(data.user.id);

      // Save tokens
      await this.saveTokens(data.session.access_token, data.session.refresh_token);

      return {
        user: profile,
        accessToken: data.session.access_token,
        refreshToken: data.session.refresh_token,
      };
    } catch (error: any) {
      throw this.handleAuthError(error);
    }
  }

  static async logout(): Promise<void> {
    try {
      authLogger.info('User logout');
      await supabase.auth.signOut();
    } catch (error) {
      authLogger.error('Logout error', error);
    } finally {
      await this.clearTokens();
    }
  }

  static async getCurrentUser(): Promise<UserProfile | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return null;
      }

      return await this.fetchUserProfile(user.id);
    } catch (error: any) {
      throw this.handleAuthError(error);
    }
  }

  static async updateProfile(updates: Partial<UserProfile>): Promise<UserProfile> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('認証が必要です');
      }

      const { data, error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data;
    } catch (error: any) {
      throw this.handleAuthError(error);
    }
  }

  static async requestPasswordReset(email: string): Promise<void> {
    try {
      authLogger.info('Password reset requested', { email });

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        throw error;
      }
    } catch (error: any) {
      throw this.handleAuthError(error);
    }
  }

  static async resetPassword(newPassword: string): Promise<void> {
    try {
      authLogger.info('Password reset attempt');

      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        throw error;
      }
    } catch (error: any) {
      throw this.handleAuthError(error);
    }
  }

  static async isAuthenticated(): Promise<boolean> {
    const { data: { session } } = await supabase.auth.getSession();
    return !!session;
  }

  static async refreshSession(): Promise<AuthResult> {
    try {
      const { data, error } = await supabase.auth.refreshSession();

      if (error) {
        throw error;
      }

      if (!data.session) {
        throw new Error('Session refresh failed');
      }

      await this.saveTokens(data.session.access_token, data.session.refresh_token);

      const profile = await this.fetchUserProfile(data.user!.id);

      return {
        user: profile,
        accessToken: data.session.access_token,
        refreshToken: data.session.refresh_token,
      };
    } catch (error: any) {
      throw this.handleAuthError(error);
    }
  }

  // Demo account support
  static async loginAsDemo(): Promise<AuthResult> {
    return this.login('romancemorio+test@gmail.com', 'Po8silba8');
  }
}

// Export as default for backward compatibility
export default UnifiedAuthService;