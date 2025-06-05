import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../types/database';

// Clean environment variables by removing any whitespace
const supabaseUrl = (process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://xjxgapahcookarqiwjww.supabase.co').trim();
const supabaseAnonKey = (process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhqeGdhcGFoY29va2FycWl3and3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg2Mzc3MDMsImV4cCI6MjA2NDIxMzcwM30.S2C4PwG_RTv91Fm0VVN3B3lj0A909XddBaqPjZWAKXQ').trim();

console.log('🔧 Initializing Supabase with URL:', supabaseUrl);

// Simple web-compatible storage with error handling
const storage = {
  getItem: (key) => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        return localStorage.getItem(key);
      }
    } catch (error) {
      console.warn('Storage getItem error:', error);
    }
    return null;
  },
  setItem: (key, value) => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem(key, value);
      }
    } catch (error) {
      console.warn('Storage setItem error:', error);
    }
  },
  removeItem: (key) => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.removeItem(key);
      }
    } catch (error) {
      console.warn('Storage removeItem error:', error);
    }
  },
};

// Get the correct redirect URL based on environment
const getRedirectUrl = () => {
  if (typeof window !== 'undefined') {
    // Use current origin for redirect
    return `${window.location.origin}/email-confirmed`;
  }
  // Default to Vercel deployment URL (from the actual error message)
  return 'https://pomomate-p0iya2bod-ivygains-projects.vercel.app/email-confirmed';
};

// Create Supabase client with error handling
let supabase: SupabaseClient<Database>;
try {
  supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      storage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
      flowType: 'pkce',
      redirectTo: getRedirectUrl()
    },
  });
  console.log('✅ Supabase client initialized successfully');
  console.log('📧 Email redirect URL:', getRedirectUrl());
} catch (error) {
  console.error('❌ Failed to initialize Supabase client:', error);
  // Create a mock client to prevent crashes
  supabase = {
    auth: {
      signUp: async () => ({ error: new Error('Supabase not initialized') }),
      signInWithPassword: async () => ({ error: new Error('Supabase not initialized') }),
      signOut: async () => ({ error: new Error('Supabase not initialized') }),
      getSession: async () => ({ data: { session: null }, error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } })
    }
  };
}

export { supabase };