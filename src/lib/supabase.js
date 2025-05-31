import { createClient } from '@supabase/supabase-js';
import { getDemoSupabase } from '../services/demoService';

// Web-compatible storage
const getStorage = () => {
  if (typeof window !== 'undefined') {
    return {
      getItem: (key) => Promise.resolve(localStorage.getItem(key)),
      setItem: (key, value) => Promise.resolve(localStorage.setItem(key, value)),
      removeItem: (key) => Promise.resolve(localStorage.removeItem(key)),
    };
  }
  // Fallback for non-web environments
  try {
    return require('@react-native-async-storage/async-storage').default;
  } catch (e) {
    console.warn('AsyncStorage not available, using memory storage');
    return {
      getItem: () => Promise.resolve(null),
      setItem: () => Promise.resolve(),
      removeItem: () => Promise.resolve(),
    };
  }
};

// Force production values for testing
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://xjxgapahcookarqiwjww.supabase.co';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhqeGdhcGFoY29va2FycWl3and3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg2Mzc3MDMsImV4cCI6MjA2NDIxMzcwM30.S2C4PwG_RTv91Fm0VVN3B3lj0A909XddBaqPjZWAKXQ';

// Debug environment variables
console.log('Environment variable debug:', {
  EXPO_PUBLIC_SUPABASE_URL: process.env.EXPO_PUBLIC_SUPABASE_URL,
  EXPO_PUBLIC_SUPABASE_ANON_KEY: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ? '[SET]' : '[NOT SET]',
  supabaseUrl,
  supabaseAnonKey: supabaseAnonKey ? '[SET]' : '[NOT SET]',
  allEnv: Object.keys(process.env).filter(key => key.includes('SUPABASE')),
});

// Demo mode detection
const isDemoMode = !process.env.EXPO_PUBLIC_SUPABASE_URL || 
                   supabaseUrl.includes('demo') || 
                   supabaseAnonKey.includes('demo');

console.log('Supabase mode:', isDemoMode ? '🎮 Demo Mode' : '🚀 Live Mode');
console.log('Demo mode reason:', {
  noUrl: !process.env.EXPO_PUBLIC_SUPABASE_URL,
  urlIncludesDemo: supabaseUrl.includes('demo'),
  keyIncludesDemo: supabaseAnonKey.includes('demo')
});

// Use demo service in demo mode, real Supabase otherwise
export const supabase = isDemoMode ? getDemoSupabase() : createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: getStorage(),
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

// Export demo mode flag for other services
export const isDemo = isDemoMode;

// Auth helpers
export const signUp = async (email, password, name) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name,
      },
    },
  });

  if (error) throw error;

  // Create user profile
  if (data.user) {
    const { error: profileError } = await supabase
      .from('users')
      .insert({
        id: data.user.id,
        email: data.user.email,
        name,
      });

    if (profileError) throw profileError;
  }

  return data;
};

export const signIn = async (email, password) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;
  return data;
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) throw error;
  return user;
};

// Database helpers
export const getUserProfile = async (userId) => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) throw error;
  return data;
};

export const updateUserProfile = async (userId, updates) => {
  const { data, error } = await supabase
    .from('users')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const createSession = async (userId, sessionData) => {
  const { data, error } = await supabase
    .from('sessions')
    .insert({
      user_id: userId,
      ...sessionData,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const getUserSessions = async (userId, limit = 50) => {
  const { data, error } = await supabase
    .from('sessions')
    .select('*')
    .eq('user_id', userId)
    .order('started_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data;
};

// Realtime subscriptions
export const subscribeToTeamSession = (sessionId, callback) => {
  const subscription = supabase
    .channel(`team_session:${sessionId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'team_sessions',
        filter: `id=eq.${sessionId}`,
      },
      callback
    )
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'team_session_participants',
        filter: `team_session_id=eq.${sessionId}`,
      },
      callback
    )
    .subscribe();

  return subscription;
};

export const subscribeToFriendUpdates = (userId, callback) => {
  const subscription = supabase
    .channel(`friends:${userId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'friends',
        filter: `user_id=eq.${userId}`,
      },
      callback
    )
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'friends',
        filter: `friend_id=eq.${userId}`,
      },
      callback
    )
    .subscribe();

  return subscription;
};

// Storage helpers
export const uploadAvatar = async (userId, file) => {
  const fileName = `${userId}-${Date.now()}.jpg`;
  
  const { data, error } = await supabase.storage
    .from('avatars')
    .upload(fileName, file, {
      contentType: 'image/jpeg',
      upsert: true,
    });

  if (error) throw error;

  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from('avatars')
    .getPublicUrl(fileName);

  return publicUrl;
};

export const getAvatarUrl = (fileName) => {
  if (!fileName) return null;
  
  const { data: { publicUrl } } = supabase.storage
    .from('avatars')
    .getPublicUrl(fileName);

  return publicUrl;
};