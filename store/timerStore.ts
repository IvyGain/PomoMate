import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { getStorageInterface } from '../src/utils/storage';
import { sessionService, settingsService } from '../src/services/supabaseService';
import { realtimeService } from '../src/lib/supabaseRealtime';
import { RealtimeChannel } from '@supabase/supabase-js';
import { handleError } from '../src/utils/errorHandler';
import { 
  TimerMode, 
  TeamSessionParticipant, 
  ChatMessage, 
  TeamSession as BaseTeamSession 
} from '../src/types/timer';

// Re-export types for convenience
export type { TeamSessionParticipant, ChatMessage } from '../src/types/timer';

// Extend TeamSession to include realtimeChannel
export interface TeamSession extends BaseTeamSession {
  realtimeChannel?: RealtimeChannel;
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
  completeSession: () => Promise<void>;
  updateSettings: (settings: Partial<TimerSettings>) => Promise<void>;
  syncSettings: () => Promise<void>; // Sync settings with backend
  loadSettings: () => Promise<void>; // Load settings from backend
  
  // Team session actions
  createTeamSession: (name: string, hostId: string, hostName: string, hostAvatar: string) => string;
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
      focusDuration: 25,
      shortBreakDuration: 5,
      longBreakDuration: 15,
      sessionsUntilLongBreak: 4,
      completedSessions: 0,
      autoStartBreaks: false,
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
            const { currentMode, autoStartBreaks, autoStartFocus, completedSessions, sessionsUntilLongBreak } = get();
            
            if (currentMode === 'focus') {
              const newCompletedSessions = completedSessions + 1;
              const shouldTakeLongBreak = newCompletedSessions % sessionsUntilLongBreak === 0;
              const nextMode = shouldTakeLongBreak ? 'longBreak' : 'shortBreak';
              
              // Update team session
              set(state => ({
                completedSessions: newCompletedSessions,
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
              
              // Call completeSession to update user stats
              get().completeSession();
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
          const { currentMode, autoStartBreaks, autoStartFocus, completedSessions, sessionsUntilLongBreak } = get();
          
          if (currentMode === 'focus') {
            const newCompletedSessions = completedSessions + 1;
            const shouldTakeLongBreak = newCompletedSessions % sessionsUntilLongBreak === 0;
            const nextMode = shouldTakeLongBreak ? 'longBreak' : 'shortBreak';
            
            set({ 
              completedSessions: newCompletedSessions,
              currentMode: nextMode,
              timeRemaining: shouldTakeLongBreak ? get().longBreakDuration * 60 : get().shortBreakDuration * 60,
              isRunning: autoStartBreaks
            });
            
            // Call completeSession to update user stats
            get().completeSession();
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
      
      completeSession: async () => {
        const currentState = get();
        
        // Record session to Supabase
        try {
          const duration = currentState.currentMode === 'focus' 
            ? currentState.focusDuration 
            : currentState.currentMode === 'shortBreak' 
            ? currentState.shortBreakDuration 
            : currentState.longBreakDuration;
            
          // Map timer modes to Supabase session types
          const sessionType = currentState.currentMode === 'focus' 
            ? 'pomodoro' 
            : currentState.currentMode === 'shortBreak'
            ? 'short_break'
            : 'long_break';
            
          const sessionData = await sessionService.createSession({
            type: sessionType,
            duration
          });
          
          // Update the session as completed
          await sessionService.updateSession(sessionData.id, {
            status: 'completed',
            actual_duration: duration
          });
          
          // Update user stats store
          const { useUserStore } = await import('./userStore');
          const userStore = useUserStore.getState();
          
          // Simple local update since Supabase handles stats via database triggers
          userStore.completeSession(duration, currentState.currentMode === 'focus' ? 'focus' : 'break');
          
        } catch (error) {
          console.error('Failed to record session:', error);
          // Continue with local update even if API fails
          const { useUserStore } = await import('./userStore');
          const userStore = useUserStore.getState();
          const duration = currentState.currentMode === 'focus' 
            ? currentState.focusDuration 
            : currentState.currentMode === 'shortBreak' 
            ? currentState.shortBreakDuration 
            : currentState.longBreakDuration;
          userStore.completeSession(duration, currentState.currentMode === 'focus' ? 'focus' : 'break');
        }
      },
      
      updateSettings: async (settings) => {
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
        
        // Sync with Supabase
        try {
          await settingsService.updateSettings({
            focus_duration: get().focusDuration,
            short_break_duration: get().shortBreakDuration,
            long_break_duration: get().longBreakDuration,
            auto_start_break: get().autoStartBreaks,
            auto_start_focus: get().autoStartFocus,
            sound_enabled: get().soundEnabled,
            notification_enabled: true, // Default
            vibration_enabled: get().vibrationEnabled,
            theme: 'light', // Get from theme store if needed
            language: 'ja'
          });
        } catch (error) {
          console.error('設定同期エラー:', error);
        }
      },
      
      // Team session actions
      createTeamSession: (name, hostId, hostName, hostAvatar) => {
        const sessionId = generateSessionId();
        
        // Subscribe to realtime updates for this session
        const channel = realtimeService.subscribeToTeamSession(sessionId, {
          onParticipantJoin: (participant) => {
            console.log('Participant joined:', participant);
          },
          onParticipantLeave: (participant) => {
            console.log('Participant left:', participant);
          },
          onSessionUpdate: (session) => {
            // Update local state when session changes
            set(state => ({
              teamSessions: state.teamSessions.map(s => 
                s.id === sessionId ? { ...s, ...session } : s
              )
            }));
          },
          onSessionStart: (session) => {
            set(state => ({
              teamSessions: state.teamSessions.map(s => 
                s.id === sessionId ? { ...s, isRunning: true } : s
              ),
              isRunning: true
            }));
          },
          onSessionEnd: (session) => {
            set(state => ({
              teamSessions: state.teamSessions.map(s => 
                s.id === sessionId ? { ...s, isRunning: false } : s
              ),
              isRunning: false
            }));
          }
        });
        
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
          createdAt: new Date().toISOString(),
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
          ],
          realtimeChannel: channel
        };
        
        set(state => ({
          teamSessions: [...state.teamSessions, newSession],
          isTeamSession: true,
          currentTeamSessionId: sessionId,
          currentMode: 'focus',
          timeRemaining: get().focusDuration * 60,
          isRunning: false
        }));
        
        return sessionId;
      },
      
      joinTeamSession: (sessionId, userId, userName, userAvatar) => {
        const { teamSessions } = get();
        const session = teamSessions.find(s => s.id === sessionId);
        
        if (!session) return false;
        
        // Check if user is already in the session
        if (session.participants.some(p => p.id === userId)) return false;
        
        // Subscribe to realtime updates if not already subscribed
        if (!session.realtimeChannel) {
          const channel = realtimeService.subscribeToTeamSession(sessionId, {
            onParticipantJoin: (participant) => {
              console.log('Participant joined:', participant);
            },
            onParticipantLeave: (participant) => {
              console.log('Participant left:', participant);
            },
            onSessionUpdate: (sessionUpdate) => {
              set(state => ({
                teamSessions: state.teamSessions.map(s => 
                  s.id === sessionId ? { ...s, ...sessionUpdate } : s
                )
              }));
            },
            onSessionStart: (sessionUpdate) => {
              set(state => ({
                teamSessions: state.teamSessions.map(s => 
                  s.id === sessionId ? { ...s, isRunning: true } : s
                ),
                isRunning: true
              }));
            },
            onSessionEnd: (sessionUpdate) => {
              set(state => ({
                teamSessions: state.teamSessions.map(s => 
                  s.id === sessionId ? { ...s, isRunning: false } : s
                ),
                isRunning: false
              }));
            }
          });
          
          session.realtimeChannel = channel;
        }
        
        const updatedSession = {
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
            ...session.messages,
            {
              id: Date.now().toString(),
              senderId: 'system',
              senderName: 'システム',
              senderAvatar: 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=400&auto=format&fit=crop',
              text: `${userName}さんが参加しました。`,
              timestamp: new Date().toISOString()
            }
          ]
        };
        
        set(state => ({
          teamSessions: state.teamSessions.map(s => 
            s.id === sessionId ? updatedSession : s
          ),
          isTeamSession: true,
          currentTeamSessionId: sessionId,
          currentMode: session.currentMode,
          timeRemaining: session.timeRemaining,
          isRunning: session.isRunning
        }));
        
        return true;
      },
      
      leaveTeamSession: (sessionId, userId) => {
        const { teamSessions, currentTeamSessionId } = get();
        const session = teamSessions.find(s => s.id === sessionId);
        
        if (!session) return;
        
        const participant = session.participants.find(p => p.id === userId);
        if (!participant) return;
        
        // If host is leaving, delete the session
        if (userId === session.hostId) {
          get().deleteTeamSession(sessionId);
          return;
        }
        
        const updatedSession = {
          ...session,
          participants: session.participants.filter(p => p.id !== userId),
          messages: [
            ...session.messages,
            {
              id: Date.now().toString(),
              senderId: 'system',
              senderName: 'システム',
              senderAvatar: 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=400&auto=format&fit=crop',
              text: `${participant.name}さんが退出しました。`,
              timestamp: new Date().toISOString()
            }
          ]
        };
        
        // If current user is leaving, unsubscribe from realtime
        if (currentTeamSessionId === sessionId) {
          realtimeService.unsubscribe(`team-session:${sessionId}`);
        }
        
        set(state => ({
          teamSessions: state.teamSessions.map(s => 
            s.id === sessionId ? updatedSession : s
          ),
          isTeamSession: false,
          currentTeamSessionId: null
        }));
      },
      
      startTeamSession: (sessionId) => {
        set(state => ({
          teamSessions: state.teamSessions.map(session => 
            session.id === sessionId 
              ? { ...session, isRunning: true }
              : session
          ),
          isRunning: true
        }));
      },
      
      pauseTeamSession: (sessionId) => {
        set(state => ({
          teamSessions: state.teamSessions.map(session => 
            session.id === sessionId 
              ? { ...session, isRunning: false }
              : session
          ),
          isRunning: false
        }));
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
                  isRunning: false 
                }
              : session
          ),
          currentMode: mode,
          timeRemaining: newTimeRemaining,
          isRunning: false
        }));
      },
      
      toggleVoiceChat: (sessionId) => {
        set(state => ({
          teamSessions: state.teamSessions.map(session => 
            session.id === sessionId 
              ? { ...session, voiceChatEnabled: !session.voiceChatEnabled }
              : session
          )
        }));
      },
      
      setParticipantReady: (sessionId, userId, isReady) => {
        set(state => ({
          teamSessions: state.teamSessions.map(session => 
            session.id === sessionId 
              ? {
                  ...session,
                  participants: session.participants.map(p =>
                    p.id === userId ? { ...p, isReady } : p
                  )
                }
              : session
          )
        }));
      },
      
      getTeamSession: (sessionId) => {
        return get().teamSessions.find(s => s.id === sessionId);
      },
      
      deleteTeamSession: (sessionId) => {
        const { currentTeamSessionId, teamSessions } = get();
        
        // Unsubscribe from realtime updates
        realtimeService.unsubscribe(`team-session:${sessionId}`);
        
        set(state => ({
          teamSessions: state.teamSessions.filter(s => s.id !== sessionId),
          isTeamSession: currentTeamSessionId === sessionId ? false : state.isTeamSession,
          currentTeamSessionId: currentTeamSessionId === sessionId ? null : currentTeamSessionId
        }));
      },
      
      sendMessage: async (sessionId, userId, userName, userAvatar, text) => {
        const newMessage: ChatMessage = {
          id: Date.now().toString(),
          senderId: userId,
          senderName: userName,
          senderAvatar: userAvatar,
          text,
          timestamp: new Date().toISOString()
        };
        
        // Send message via Supabase realtime
        await realtimeService.sendTeamMessage(sessionId, {
          userId,
          username: userName,
          content: text,
          timestamp: new Date().toISOString()
        });
        
        // Update local state
        set(state => ({
          teamSessions: state.teamSessions.map(session => 
            session.id === sessionId 
              ? { ...session, messages: [...session.messages, newMessage] }
              : session
          )
        }));
      },
      
      syncSettings: async () => {
        try {
          await settingsService.updateSettings({
            focus_duration: get().focusDuration,
            short_break_duration: get().shortBreakDuration,
            long_break_duration: get().longBreakDuration,
            auto_start_break: get().autoStartBreaks,
            auto_start_focus: get().autoStartFocus,
            sound_enabled: get().soundEnabled,
            notification_enabled: true,
            vibration_enabled: get().vibrationEnabled,
            theme: 'light',
            language: 'ja'
          });
        } catch (error) {
          console.error('設定同期エラー:', error);
        }
      },
      
      loadSettings: async () => {
        try {
          const settings = await settingsService.getSettings();
          
          if (settings) {
            set({
              focusDuration: settings.focus_duration,
              shortBreakDuration: settings.short_break_duration,
              longBreakDuration: settings.long_break_duration,
              autoStartBreaks: settings.auto_start_break,
              autoStartFocus: settings.auto_start_focus,
              soundEnabled: settings.sound_enabled,
              vibrationEnabled: settings.vibration_enabled,
            });
            
            // Update time remaining based on current mode
            const { currentMode } = get();
            let newTimeRemaining = 0;
            
            switch (currentMode) {
              case 'focus':
                newTimeRemaining = settings.focus_duration * 60;
                break;
              case 'shortBreak':
                newTimeRemaining = settings.short_break_duration * 60;
                break;
              case 'longBreak':
                newTimeRemaining = settings.long_break_duration * 60;
                break;
            }
            
            set({ timeRemaining: newTimeRemaining });
          }
        } catch (error) {
          console.error('設定読み込みエラー:', error);
        }
      },
    }),
    {
      name: 'timer-storage',
      storage: createJSONStorage(() => getStorageInterface()),
      partialize: (state) => ({
        focusDuration: state.focusDuration,
        shortBreakDuration: state.shortBreakDuration,
        longBreakDuration: state.longBreakDuration,
        sessionsUntilLongBreak: state.sessionsUntilLongBreak,
        completedSessions: state.completedSessions,
        autoStartBreaks: state.autoStartBreaks,
        autoStartFocus: state.autoStartFocus,
        soundEnabled: state.soundEnabled,
        vibrationEnabled: state.vibrationEnabled,
      }),
    }
  )
);