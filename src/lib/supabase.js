import { createClient } from '@supabase/supabase-js';

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

// Create Supabase client with error handling
let supabase;
try {
  supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      storage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false
    },
  });
  console.log('✅ Supabase client initialized successfully');
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