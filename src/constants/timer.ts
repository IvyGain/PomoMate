export const TIMER_CONSTANTS = {
  // Timer durations in minutes
  DURATIONS: {
    WORK: 25,
    BREAK: 5,
    LONG_BREAK: 15,
  },
  
  // Timer intervals
  TICK_INTERVAL: 1000, // 1 second in milliseconds
  
  // Pomodoro cycle
  SESSIONS_BEFORE_LONG_BREAK: 4,
  
  // Time conversions
  SECONDS_PER_MINUTE: 60,
  MINUTES_PER_HOUR: 60,
  
  // XP and rewards
  XP_PER_MINUTE: 10,
  COINS_PER_SESSION: 5,
  BONUS_XP_MULTIPLIER: 1.5,
  
  // Achievement thresholds
  FOCUS_MILESTONES: [60, 120, 240, 480, 960], // minutes
  STREAK_MILESTONES: [3, 7, 14, 30, 100], // days
  SESSION_MILESTONES: [10, 25, 50, 100, 500], // sessions
  
  // UI update intervals
  PROGRESS_UPDATE_INTERVAL: 5000, // 5 seconds
  STATS_SYNC_INTERVAL: 30000, // 30 seconds
  
  // Default settings
  DEFAULT_DAILY_GOAL: 120, // minutes
  DEFAULT_SOUND_ENABLED: true,
  DEFAULT_NOTIFICATION_ENABLED: true,
} as const;

export const TIMER_MESSAGES = {
  START: {
    WORK: '集中タイムを開始します！',
    BREAK: '休憩タイムです',
    LONG_BREAK: '長めの休憩を取りましょう',
  },
  COMPLETE: {
    WORK: 'お疲れ様でした！休憩を取りましょう',
    BREAK: '休憩終了！次のセッションを始めましょう',
    LONG_BREAK: 'リフレッシュできましたか？',
  },
  ENCOURAGEMENT: [
    '素晴らしい集中力です！',
    'その調子です！',
    'もう少しで終わりです',
    '頑張っています！',
    'あと少し！',
  ],
} as const;