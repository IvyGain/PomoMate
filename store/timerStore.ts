import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { trpcClient } from '@/lib/trpc';
import { useAuthStore } from './authStore';

export type TimerMode = 'focus' | 'shortBreak' | 'longBreak';

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

interface TimerState {
  isRunning: boolean;
  currentMode: TimerMode;
  timeRemaining: number;
  focusDuration: number; // in minutes
  shortBreakDuration: number; // in minutes
  longBreakDuration: number; // in minutes
  sessionsUntilLongBreak: number;
  completedSessions: number;
  consecutiveSessionsCount: number; // Track consecutive focus sessions for long break countdown
  autoStartBreaks: boolean;
  autoStartFocus: boolean;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  
  // Team session properties
  isTeamSession: boolean;
  currentTeamSessionId: string | null;
  teamSessions: TeamSession[];
  
  // Actions
  startTimer: () => void;
  pauseTimer: () => void;
  resetTimer: () => void;
  tickTimer: () => void;
  setMode: (mode: TimerMode) => void;
  completeSession: () => void;
  updateSettings: (settings: Partial<TimerSettings>) => void;
  
  // Team session actions
  createTeamSession: (name: string, hostId: string, hostName: string, hostAvatar: string) => Promise<string>;
  joinTeamSession: (sessionId: string, userId: string, userName: string, userAvatar: string) => boolean;
  leaveTeamSession: (sessionId: string, userId: string) => void;
  startTeamSession: (sessionId: string) => void;
  pauseTeamSession: (sessionId: string) => void;
  setTeamSessionMode: (sessionId: string, mode: TimerMode) => void;
  toggleVoiceChat: (sessionId: string) => void;
  setParticipantReady: (sessionId: string, userId: string, isReady: boolean) => void;
  getTeamSession: (sessionId: string) => TeamSession | undefined;
  deleteTeamSession: (sessionId: string) => void;
  
  // Chat actions
  sendMessage: (sessionId: string, userId: string, userName: string, userAvatar: string, text: string) => void;
}

interface TimerSettings {
  focusDuration: number;
  shortBreakDuration: number;
  longBreakDuration: number;
  sessionsUntilLongBreak: number;
  autoStartBreaks: boolean;
  autoStartFocus: boolean;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
}

// Generate a random session ID
const generateSessionId = () => {
  return Math.random().toString(36).substring(2, 10).toUpperCase();
};

export const useTimerStore = create<TimerState>()(
  persist(
    (set, get) => ({
      isRunning: false,
      currentMode: 'focus',
      timeRemaining: 25 * 60, // 25 minutes in seconds
      focusDuration: 25, // in minutes
      shortBreakDuration: 5, // in minutes
      longBreakDuration: 15, // in minutes
      sessionsUntilLongBreak: 4,
      completedSessions: 0,
      consecutiveSessionsCount: 0,
      autoStartBreaks: true,
      autoStartFocus: false,
      soundEnabled: true,
      vibrationEnabled: true,
      
      // Team session properties
      isTeamSession: false,
      currentTeamSessionId: null,
      teamSessions: [],
      
      startTimer: () => {
        const { isTeamSession, currentTeamSessionId } = get();
        
        if (isTeamSession && currentTeamSessionId) {
          get().startTeamSession(currentTeamSessionId);
        } else {
          set({ isRunning: true });
        }
      },
      
      pauseTimer: () => {
        const { isTeamSession, currentTeamSessionId } = get();
        
        if (isTeamSession && currentTeamSessionId) {
          get().pauseTeamSession(currentTeamSessionId);
        } else {
          set({ isRunning: false });
        }
      },
      
      resetTimer: () => {
        const { currentMode, focusDuration, shortBreakDuration, longBreakDuration, isTeamSession, currentTeamSessionId } = get();
        let newTimeRemaining = 0;
        
        switch (currentMode) {
          case 'focus':
            newTimeRemaining = focusDuration * 60;
            break;
          case 'shortBreak':
            newTimeRemaining = shortBreakDuration * 60;
            break;
          case 'longBreak':
            newTimeRemaining = longBreakDuration * 60;
            break;
        }
        
        if (isTeamSession && currentTeamSessionId) {
          // Update team session timer
          set(state => ({
            teamSessions: state.teamSessions.map(session => 
              session.id === currentTeamSessionId 
                ? { ...session, timeRemaining: newTimeRemaining, isRunning: false }
                : session
            )
          }));
        }
        
        set({ timeRemaining: newTimeRemaining, isRunning: false });
      },
      
      tickTimer: () => {
        const { 
          timeRemaining, 
          isRunning, 
          isTeamSession, 
          currentTeamSessionId, 
          teamSessions 
        } = get();
        
        if (isTeamSession && currentTeamSessionId) {
          // Find the current team session
          const session = teamSessions.find(s => s.id === currentTeamSessionId);
          
          if (session && session.isRunning && session.timeRemaining > 0) {
            // Update team session timer
            set(state => ({
              teamSessions: state.teamSessions.map(s => 
                s.id === currentTeamSessionId 
                  ? { ...s, timeRemaining: s.timeRemaining - 1 }
                  : s
              ),
              timeRemaining: session.timeRemaining - 1
            }));
          } else if (session && session.isRunning && session.timeRemaining === 0) {
            // Team session timer completed
            const { currentMode, autoStartBreaks, autoStartFocus, completedSessions, sessionsUntilLongBreak, consecutiveSessionsCount } = get();
            
            if (currentMode === 'focus') {
              const newCompletedSessions = completedSessions + 1;
              const newConsecutiveCount = consecutiveSessionsCount + 1;
              const shouldTakeLongBreak = newConsecutiveCount >= sessionsUntilLongBreak;
              const nextMode = shouldTakeLongBreak ? 'longBreak' : 'shortBreak';
              
              // Update team session
              set(state => ({
                completedSessions: newCompletedSessions,
                consecutiveSessionsCount: shouldTakeLongBreak ? 0 : newConsecutiveCount,
                currentMode: nextMode,
                timeRemaining: shouldTakeLongBreak ? get().longBreakDuration * 60 : get().shortBreakDuration * 60,
                isRunning: autoStartBreaks,
                teamSessions: state.teamSessions.map(s => 
                  s.id === currentTeamSessionId 
                    ? { 
                        ...s, 
                        currentMode: nextMode,
                        timeRemaining: shouldTakeLongBreak ? get().longBreakDuration * 60 : get().shortBreakDuration * 60,
                        isRunning: autoStartBreaks
                      }
                    : s
                )
              }));
              
              // Note: completeSession was already called here, but it doesn't update state
              // The state was already updated above
            } else {
              // Coming from a break
              set(state => ({
                currentMode: 'focus',
                timeRemaining: get().focusDuration * 60,
                isRunning: autoStartFocus,
                teamSessions: state.teamSessions.map(s => 
                  s.id === currentTeamSessionId 
                    ? { 
                        ...s, 
                        currentMode: 'focus',
                        timeRemaining: get().focusDuration * 60,
                        isRunning: autoStartFocus
                      }
                    : s
                )
              }));
            }
          }
        } else if (isRunning && timeRemaining > 0) {
          // Regular timer tick
          set({ timeRemaining: timeRemaining - 1 });
        } else if (isRunning && timeRemaining === 0) {
          // Timer completed
          const { currentMode, autoStartBreaks, autoStartFocus, completedSessions, sessionsUntilLongBreak, consecutiveSessionsCount } = get();
          
          if (currentMode === 'focus') {
            const newCompletedSessions = completedSessions + 1;
            const newConsecutiveCount = consecutiveSessionsCount + 1;
            const shouldTakeLongBreak = newConsecutiveCount >= sessionsUntilLongBreak;
            const nextMode = shouldTakeLongBreak ? 'longBreak' : 'shortBreak';
            
            set({ 
              completedSessions: newCompletedSessions,
              consecutiveSessionsCount: shouldTakeLongBreak ? 0 : newConsecutiveCount,
              currentMode: nextMode,
              timeRemaining: shouldTakeLongBreak ? get().longBreakDuration * 60 : get().shortBreakDuration * 60,
              isRunning: autoStartBreaks
            });
            
            // Note: completeSession was already called here, but it doesn't update state
            // The state was already updated above
          } else {
            // Coming from a break
            set({ 
              currentMode: 'focus',
              timeRemaining: get().focusDuration * 60,
              isRunning: autoStartFocus
            });
          }
        }
      },
      
      setMode: (mode) => {
        const { isTeamSession, currentTeamSessionId } = get();
        
        if (isTeamSession && currentTeamSessionId) {
          get().setTeamSessionMode(currentTeamSessionId, mode);
        } else {
          let newTimeRemaining = 0;
          
          switch (mode) {
            case 'focus':
              newTimeRemaining = get().focusDuration * 60;
              break;
            case 'shortBreak':
              newTimeRemaining = get().shortBreakDuration * 60;
              break;
            case 'longBreak':
              newTimeRemaining = get().longBreakDuration * 60;
              break;
          }
          
          set({ currentMode: mode, timeRemaining: newTimeRemaining, isRunning: false });
        }
      },
      
      completeSession: () => {
        // This is called when a focus session is completed from dev mode
        const { currentMode, completedSessions, consecutiveSessionsCount, sessionsUntilLongBreak, autoStartBreaks, autoStartFocus, focusDuration, shortBreakDuration, longBreakDuration } = get();
        
        if (currentMode === 'focus') {
          // Increment session counters
          const newCompletedSessions = completedSessions + 1;
          const newConsecutiveCount = consecutiveSessionsCount + 1;
          const shouldTakeLongBreak = newConsecutiveCount >= sessionsUntilLongBreak;
          const nextMode = shouldTakeLongBreak ? 'longBreak' : 'shortBreak';
          
          console.log('[COMPLETE SESSION] Completed sessions:', newCompletedSessions);
          console.log('[COMPLETE SESSION] Consecutive sessions:', newConsecutiveCount);
          console.log('[COMPLETE SESSION] Should take long break:', shouldTakeLongBreak);
          console.log('[COMPLETE SESSION] Next mode:', nextMode);
          
          // Update state
          set({ 
            completedSessions: newCompletedSessions,
            consecutiveSessionsCount: shouldTakeLongBreak ? 0 : newConsecutiveCount,
            currentMode: nextMode,
            timeRemaining: shouldTakeLongBreak ? longBreakDuration * 60 : shortBreakDuration * 60,
            isRunning: autoStartBreaks
          });
        } else {
          // Coming from a break
          set({ 
            currentMode: 'focus',
            timeRemaining: focusDuration * 60,
            isRunning: autoStartFocus
          });
        }
      },
      
      updateSettings: (settings) => {
        const { currentMode } = get();
        let newTimeRemaining = get().timeRemaining;
        
        // Update time remaining if the current mode's duration was changed
        if (settings.focusDuration && currentMode === 'focus') {
          newTimeRemaining = settings.focusDuration * 60;
        } else if (settings.shortBreakDuration && currentMode === 'shortBreak') {
          newTimeRemaining = settings.shortBreakDuration * 60;
        } else if (settings.longBreakDuration && currentMode === 'longBreak') {
          newTimeRemaining = settings.longBreakDuration * 60;
        }
        
        set({ 
          ...settings, 
          timeRemaining: newTimeRemaining,
          isRunning: false
        });
      },
      
      // Team session actions
      createTeamSession: async (name, hostId, hostName, hostAvatar) => {
        try {
          console.log('[TEAM] Creating team session:', name);
          
          const userId = useAuthStore.getState().user?.id || hostId;
          const response = await trpcClient.teamSessions.createSession.mutate({
            name,
            duration: get().focusDuration,
            creatorId: userId,
          });
          
          if (response.success && response.session) {
            const sessionId = response.session.id;
            
            const newSession: TeamSession = {
              id: sessionId,
              hostId,
              name,
              participants: [
                {
                  id: hostId,
                  name: hostName,
                  avatar: hostAvatar,
                  isReady: true,
                  isActive: true,
                  joinedAt: new Date().toISOString()
                }
              ],
              currentMode: 'focus',
              timeRemaining: get().focusDuration * 60,
              isRunning: false,
              createdAt: response.session.createdAt,
              voiceChatEnabled: false,
              messages: [
                {
                  id: Date.now().toString(),
                  senderId: 'system',
                  senderName: 'システム',
                  senderAvatar: 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=400&auto=format&fit=crop',
                  text: `${hostName}さんがセッションを作成しました。`,
                  timestamp: new Date().toISOString()
                }
              ]
            };
            
            set(state => ({
              teamSessions: [...state.teamSessions, newSession],
              isTeamSession: true,
              currentTeamSessionId: sessionId,
              currentMode: 'focus',
              timeRemaining: get().focusDuration * 60,
              isRunning: false
            }));
            
            console.log('[TEAM] Team session created:', sessionId);
            return sessionId;
          } else {
            console.error('[TEAM] Failed to create team session:', response.message);
            return '';
          }
        } catch (error) {
          console.error('[TEAM] Error creating team session:', error);
          return '';
        }
      },
      
      joinTeamSession: (sessionId, userId, userName, userAvatar) => {
        const { teamSessions } = get();
        const sessionIndex = teamSessions.findIndex(session => session.id === sessionId);
        
        if (sessionIndex === -1) {
          return false; // Session not found
        }
        
        // Check if user is already in the session
        if (teamSessions[sessionIndex].participants.some(p => p.id === userId)) {
          // Update user's active status
          set(state => ({
            teamSessions: state.teamSessions.map(session => 
              session.id === sessionId 
                ? {
                    ...session,
                    participants: session.participants.map(p => 
                      p.id === userId 
                        ? { ...p, isActive: true }
                        : p
                    ),
                    messages: [
                      ...(session.messages || []), // Ensure messages is an array
                      {
                        id: Date.now().toString(),
                        senderId: 'system',
                        senderName: 'システム',
                        senderAvatar: 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=400&auto=format&fit=crop',
                        text: `${userName}さんが再接続しました。`,
                        timestamp: new Date().toISOString()
                      }
                    ]
                  }
                : session
            ),
            isTeamSession: true,
            currentTeamSessionId: sessionId,
            currentMode: teamSessions[sessionIndex].currentMode,
            timeRemaining: teamSessions[sessionIndex].timeRemaining,
            isRunning: teamSessions[sessionIndex].isRunning
          }));
        } else {
          // Add user to session
          set(state => ({
            teamSessions: state.teamSessions.map(session => 
              session.id === sessionId 
                ? {
                    ...session,
                    participants: [
                      ...session.participants,
                      {
                        id: userId,
                        name: userName,
                        avatar: userAvatar,
                        isReady: false,
                        isActive: true,
                        joinedAt: new Date().toISOString()
                      }
                    ],
                    messages: [
                      ...(session.messages || []), // Ensure messages is an array
                      {
                        id: Date.now().toString(),
                        senderId: 'system',
                        senderName: 'システム',
                        senderAvatar: 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=400&auto=format&fit=crop',
                        text: `${userName}さんがセッションに参加しました。`,
                        timestamp: new Date().toISOString()
                      }
                    ]
                  }
                : session
            ),
            isTeamSession: true,
            currentTeamSessionId: sessionId,
            currentMode: teamSessions[sessionIndex].currentMode,
            timeRemaining: teamSessions[sessionIndex].timeRemaining,
            isRunning: teamSessions[sessionIndex].isRunning
          }));
        }
        
        return true;
      },
      
      leaveTeamSession: (sessionId, userId) => {
        const { teamSessions, currentTeamSessionId } = get();
        const session = teamSessions.find(s => s.id === sessionId);
        
        if (!session) return;
        
        // Find user name before removing
        const user = session.participants.find(p => p.id === userId);
        const userName = user ? user.name : "ユーザー";
        
        // Check if user is the host
        if (session.hostId === userId) {
          // If host leaves, delete the session
          set(state => ({
            teamSessions: state.teamSessions.filter(s => s.id !== sessionId),
            isTeamSession: false,
            currentTeamSessionId: null,
            currentMode: 'focus',
            timeRemaining: get().focusDuration * 60,
            isRunning: false
          }));
        } else {
          // Mark user as inactive
          set(state => ({
            teamSessions: state.teamSessions.map(s => 
              s.id === sessionId 
                ? {
                    ...s,
                    participants: s.participants.map(p => 
                      p.id === userId 
                        ? { ...p, isActive: false }
                        : p
                    ),
                    messages: [
                      ...(s.messages || []), // Ensure messages is an array
                      {
                        id: Date.now().toString(),
                        senderId: 'system',
                        senderName: 'システム',
                        senderAvatar: 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=400&auto=format&fit=crop',
                        text: `${userName}さんがセッションから退出しました。`,
                        timestamp: new Date().toISOString()
                      }
                    ]
                  }
                : s
            ),
            isTeamSession: currentTeamSessionId !== sessionId,
            currentTeamSessionId: currentTeamSessionId === sessionId ? null : currentTeamSessionId,
            currentMode: currentTeamSessionId === sessionId ? 'focus' : get().currentMode,
            timeRemaining: currentTeamSessionId === sessionId ? get().focusDuration * 60 : get().timeRemaining,
            isRunning: currentTeamSessionId === sessionId ? false : get().isRunning
          }));
        }
      },
      
      startTeamSession: (sessionId) => {
        const { teamSessions } = get();
        const session = teamSessions.find(s => s.id === sessionId);
        
        if (session) {
          set(state => ({
            teamSessions: state.teamSessions.map(s => 
              s.id === sessionId 
                ? { 
                    ...s, 
                    isRunning: true,
                    messages: [
                      ...(s.messages || []), // Ensure messages is an array
                      {
                        id: Date.now().toString(),
                        senderId: 'system',
                        senderName: 'システム',
                        senderAvatar: 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=400&auto=format&fit=crop',
                        text: `${getModeName(s.currentMode)}セッションが開始されました。`,
                        timestamp: new Date().toISOString()
                      }
                    ]
                  }
                : s
            ),
            isRunning: state.currentTeamSessionId === sessionId ? true : state.isRunning
          }));
        }
      },
      
      pauseTeamSession: (sessionId) => {
        const { teamSessions } = get();
        const session = teamSessions.find(s => s.id === sessionId);
        
        if (session) {
          set(state => ({
            teamSessions: state.teamSessions.map(s => 
              s.id === sessionId 
                ? { 
                    ...s, 
                    isRunning: false,
                    messages: [
                      ...(s.messages || []), // Ensure messages is an array
                      {
                        id: Date.now().toString(),
                        senderId: 'system',
                        senderName: 'システム',
                        senderAvatar: 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=400&auto=format&fit=crop',
                        text: `${getModeName(s.currentMode)}セッションが一時停止されました。`,
                        timestamp: new Date().toISOString()
                      }
                    ]
                  }
                : s
            ),
            isRunning: state.currentTeamSessionId === sessionId ? false : state.isRunning
          }));
        }
      },
      
      setTeamSessionMode: (sessionId, mode) => {
        let newTimeRemaining = 0;
        
        switch (mode) {
          case 'focus':
            newTimeRemaining = get().focusDuration * 60;
            break;
          case 'shortBreak':
            newTimeRemaining = get().shortBreakDuration * 60;
            break;
          case 'longBreak':
            newTimeRemaining = get().longBreakDuration * 60;
            break;
        }
        
        set(state => ({
          teamSessions: state.teamSessions.map(session => 
            session.id === sessionId 
              ? { 
                  ...session, 
                  currentMode: mode, 
                  timeRemaining: newTimeRemaining,
                  isRunning: false,
                  messages: [
                    ...(session.messages || []), // Ensure messages is an array
                    {
                      id: Date.now().toString(),
                      senderId: 'system',
                      senderName: 'システム',
                      senderAvatar: 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=400&auto=format&fit=crop',
                      text: `モードが${getModeName(mode)}に変更されました。`,
                      timestamp: new Date().toISOString()
                    }
                  ]
                }
              : session
          ),
          currentMode: state.currentTeamSessionId === sessionId ? mode : state.currentMode,
          timeRemaining: state.currentTeamSessionId === sessionId ? newTimeRemaining : state.timeRemaining,
          isRunning: false
        }));
      },
      
      toggleVoiceChat: (sessionId) => {
        const { teamSessions } = get();
        const session = teamSessions.find(s => s.id === sessionId);
        
        if (session) {
          const newVoiceChatEnabled = !session.voiceChatEnabled;
          
          set(state => ({
            teamSessions: state.teamSessions.map(s => 
              s.id === sessionId 
                ? { 
                    ...s, 
                    voiceChatEnabled: newVoiceChatEnabled,
                    messages: [
                      ...(s.messages || []), // Ensure messages is an array
                      {
                        id: Date.now().toString(),
                        senderId: 'system',
                        senderName: 'システム',
                        senderAvatar: 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=400&auto=format&fit=crop',
                        text: `ボイスチャットが${newVoiceChatEnabled ? '有効' : '無効'}になりました。`,
                        timestamp: new Date().toISOString()
                      }
                    ]
                  }
                : s
            )
          }));
        }
      },
      
      setParticipantReady: (sessionId, userId, isReady) => {
        const { teamSessions } = get();
        const session = teamSessions.find(s => s.id === sessionId);
        
        if (session) {
          const participant = session.participants.find(p => p.id === userId);
          const userName = participant ? participant.name : "ユーザー";
          
          set(state => ({
            teamSessions: state.teamSessions.map(s => 
              s.id === sessionId 
                ? {
                    ...s,
                    participants: s.participants.map(p => 
                      p.id === userId 
                        ? { ...p, isReady }
                        : p
                    ),
                    messages: [
                      ...(s.messages || []), // Ensure messages is an array
                      {
                        id: Date.now().toString(),
                        senderId: 'system',
                        senderName: 'システム',
                        senderAvatar: 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=400&auto=format&fit=crop',
                        text: `${userName}さんが${isReady ? '準備完了' : '準備中'}になりました。`,
                        timestamp: new Date().toISOString()
                      }
                    ]
                  }
                : s
            )
          }));
        }
      },
      
      getTeamSession: (sessionId) => {
        return get().teamSessions.find(session => session.id === sessionId);
      },
      
      deleteTeamSession: (sessionId) => {
        const { currentTeamSessionId } = get();
        
        set(state => ({
          teamSessions: state.teamSessions.filter(session => session.id !== sessionId),
          isTeamSession: currentTeamSessionId !== sessionId,
          currentTeamSessionId: currentTeamSessionId === sessionId ? null : currentTeamSessionId,
          currentMode: currentTeamSessionId === sessionId ? 'focus' : state.currentMode,
          timeRemaining: currentTeamSessionId === sessionId ? get().focusDuration * 60 : state.timeRemaining,
          isRunning: currentTeamSessionId === sessionId ? false : state.isRunning
        }));
      },
      
      // Chat actions
      sendMessage: (sessionId, userId, userName, userAvatar, text) => {
        if (!text.trim()) return;
        
        const newMessage: ChatMessage = {
          id: Date.now().toString(),
          senderId: userId,
          senderName: userName,
          senderAvatar: userAvatar,
          text: text.trim(),
          timestamp: new Date().toISOString()
        };
        
        set(state => ({
          teamSessions: state.teamSessions.map(session => 
            session.id === sessionId 
              ? {
                  ...session,
                  messages: [...(session.messages || []), newMessage] // Ensure messages is an array
                }
              : session
          )
        }));
      }
    }),
    {
      name: 'timer-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        focusDuration: state.focusDuration,
        shortBreakDuration: state.shortBreakDuration,
        longBreakDuration: state.longBreakDuration,
        sessionsUntilLongBreak: state.sessionsUntilLongBreak,
        completedSessions: state.completedSessions,
        consecutiveSessionsCount: state.consecutiveSessionsCount,
        autoStartBreaks: state.autoStartBreaks,
        autoStartFocus: state.autoStartFocus,
        soundEnabled: state.soundEnabled,
        vibrationEnabled: state.vibrationEnabled,
        teamSessions: state.teamSessions,
      }),
    }
  )
);

// Helper function to get mode name in Japanese
const getModeName = (mode: TimerMode): string => {
  switch (mode) {
    case 'focus':
      return "フォーカス";
    case 'shortBreak':
      return "小休憩";
    case 'longBreak':
      return "長休憩";
    default:
      return "フォーカス";
  }
};