import { supabase } from '../lib/supabase';
import { logger } from '../utils/logger';
import type { User } from '../../store/authStore';

const authLogger = logger.child('AuthService');

interface RegisterResult {
  success: boolean;
  requiresEmailConfirmation: boolean;
  email?: string;
  user?: User;
}

export class AuthService {
  static async signUpUser(email: string, password: string, username: string) {
    authLogger.info('Starting user sign up', { email });
    
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
      authLogger.error('Sign up failed', error);
      throw error;
    }
    
    authLogger.info('Sign up successful', { 
      userId: data.user?.id,
      hasSession: !!data.session 
    });
    
    return data;
  }
  
  static async createUserProfile(userId: string, email: string, username: string) {
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
      
      authLogger.error('Profile creation failed', error);
      throw error;
    }
    
    return data;
  }
  
  static async fetchUserProfile(userId: string) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();
      
    if (error) {
      authLogger.error('Failed to fetch profile', error);
      throw error;
    }
    
    return data;
  }
  
  static async createDefaultSettings(userId: string) {
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
  
  static async register(email: string, password: string, username: string): Promise<RegisterResult> {
    try {
      // Step 1: Sign up user
      const authData = await this.signUpUser(email, password, username);
      
      // Check if email confirmation required
      if (authData.user && !authData.session) {
        return {
          success: true,
          requiresEmailConfirmation: true,
          email,
        };
      }
      
      if (!authData.user) {
        throw new Error('User creation failed');
      }
      
      // Step 2: Create profile
      const profile = await this.createUserProfile(authData.user.id, email, username);
      
      // Step 3: Create default settings
      await this.createDefaultSettings(authData.user.id);
      
      return {
        success: true,
        requiresEmailConfirmation: false,
        user: profile,
      };
    } catch (error: any) {
      authLogger.error('Registration failed', {
        message: error.message,
        code: error.code,
        status: error.status,
      });
      throw error;
    }
  }
}