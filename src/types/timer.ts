// Timer types
export type TimerMode = 'focus' | 'shortBreak' | 'longBreak';

export const TimerModeConstants = {
  FOCUS: 'focus' as TimerMode,
  SHORT_BREAK: 'shortBreak' as TimerMode,
  LONG_BREAK: 'longBreak' as TimerMode,
} as const;

export interface TeamSessionParticipant {
  id: string;
  name: string;
  avatar: string;
  isReady: boolean;
  isActive: boolean;
  joinedAt: string;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  text: string;
  timestamp: string;
}

export interface TeamSession {
  id: string;
  hostId: string;
  name: string;
  participants: TeamSessionParticipant[];
  currentMode: TimerMode;
  timeRemaining: number;
  isRunning: boolean;
  createdAt: string;
  voiceChatEnabled: boolean;
  messages: ChatMessage[];
}

export interface TimerSettings {
  focusDuration: number;
  shortBreakDuration: number;
  longBreakDuration: number;
  sessionsUntilLongBreak: number;
  soundEnabled: boolean;
  notificationsEnabled: boolean;
  autoStartBreaks: boolean;
  autoStartPomodoros: boolean;
}