// Supabase Response Types
export interface SupabaseResponse<T> {
  data: T | null;
  error: SupabaseError | null;
}

export interface SupabaseError {
  message: string;
  details?: string;
  hint?: string;
  code?: string;
  status?: number;
}

// User related types
export interface UserProfile {
  id: string;
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
  created_at: string;
  updated_at: string;
}

export interface UserSettings {
  id: string;
  user_id: string;
  work_duration: number;
  break_duration: number;
  long_break_duration: number;
  sessions_before_long_break: number;
  daily_goal: number;
  sound_enabled: boolean;
  notification_enabled: boolean;
  theme: string;
  language: string;
  created_at: string;
  updated_at: string;
}

// Session related types
export interface SessionCreate {
  mode: 'work' | 'break' | 'long_break';
  duration: number;
  completed: boolean;
  started_at: string;
  ended_at?: string;
  notes?: string;
}

export interface SessionResponse extends SessionCreate {
  id: string;
  user_id: string;
  xp_earned: number;
  coins_earned: number;
  created_at: string;
}

// Team Session types
export interface TeamSessionCreate {
  name: string;
  description?: string;
  code: string;
  host_id: string;
  mode: 'work' | 'break' | 'long_break';
  duration: number;
  max_participants?: number;
  is_public: boolean;
}

export interface TeamSessionResponse extends TeamSessionCreate {
  id: string;
  status: 'waiting' | 'in_progress' | 'completed' | 'cancelled';
  started_at?: string;
  ended_at?: string;
  created_at: string;
  updated_at: string;
  participants: TeamParticipant[];
}

export interface TeamParticipant {
  id: string;
  team_session_id: string;
  user_id: string;
  joined_at: string;
  left_at?: string;
  is_ready: boolean;
  is_active: boolean;
  user: {
    username: string;
    display_name: string;
    avatar_url?: string;
    level: number;
  };
}

// Achievement types
export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'focus' | 'streak' | 'social' | 'special';
  requirement_type: string;
  requirement_value: number;
  xp_reward: number;
  coin_reward: number;
  badge_color: string;
}

export interface UserAchievement {
  id: string;
  user_id: string;
  achievement_id: string;
  unlocked_at: string;
  achievement: Achievement;
}

// Statistics types
export interface DailyStats {
  date: string;
  focus_minutes: number;
  sessions_completed: number;
  breaks_taken: number;
  xp_earned: number;
  coins_earned: number;
}

export interface WeeklyStats {
  week_start: string;
  week_end: string;
  total_focus_minutes: number;
  total_sessions: number;
  average_daily_focus: number;
  most_productive_day: string;
  streak_maintained: boolean;
}

// API Request types
export interface PaginationParams {
  page?: number;
  limit?: number;
  offset?: number;
}

export interface FilterParams {
  startDate?: string;
  endDate?: string;
  mode?: string;
  completed?: boolean;
}

export interface SortParams {
  sortBy?: string;
  order?: 'asc' | 'desc';
}

// API Response types
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export interface ApiError {
  message: string;
  code?: string;
  statusCode?: number;
  details?: any;
}