// Session and Timer related types

import { BaseEntity } from './index';

export type SessionType = 'pomodoro' | 'short_break' | 'long_break';
export type SessionStatus = 'active' | 'completed' | 'interrupted';

export interface Session extends BaseEntity {
  user_id: string;
  type: SessionType;
  status: SessionStatus;
  duration: number; // in seconds
  actual_duration?: number; // actual time spent
  started_at: string;
  ended_at?: string;
  notes?: string;
  xp_earned?: number;
  coins_earned?: number;
}

export interface SessionStats {
  today: {
    sessions_completed: number;
    focus_time: number;
    breaks_taken: number;
    xp_earned: number;
    coins_earned: number;
  };
  week: {
    sessions_completed: number;
    focus_time: number;
    average_daily_focus: number;
    most_productive_day: string;
  };
  month: {
    sessions_completed: number;
    focus_time: number;
    average_daily_focus: number;
    streak_days: number;
  };
  all_time: {
    sessions_completed: number;
    focus_time: number;
    best_streak: number;
    total_xp: number;
    total_coins: number;
  };
}

export interface TimerSettings {
  work_duration: number; // in minutes
  short_break_duration: number;
  long_break_duration: number;
  sessions_before_long_break: number;
  auto_start_breaks: boolean;
  auto_start_pomodoros: boolean;
  sound_enabled: boolean;
  notification_enabled: boolean;
  tick_sound_enabled: boolean;
  volume: number; // 0-100
}

export interface TimerState {
  mode: SessionType;
  duration: number; // total duration in seconds
  timeLeft: number; // remaining time in seconds
  isRunning: boolean;
  isPaused: boolean;
  sessionCount: number; // number of completed pomodoros
  currentSession?: Session;
}