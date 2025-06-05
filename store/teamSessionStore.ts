import { create } from 'zustand';
import { supabase } from '../src/lib/supabase';
import { logger } from '../src/utils/logger';
import type { TeamSessionResponse, TeamParticipant } from '../src/types/api';

const teamLogger = logger.child('TeamSessionStore');

interface TeamSessionState {
  // State
  currentSession: TeamSessionResponse | null;
  availableSessions: TeamSessionResponse[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  createSession: (data: {
    name: string;
    description?: string;
    mode: 'work' | 'break' | 'long_break';
    duration: number;
    isPublic: boolean;
  }) => Promise<TeamSessionResponse>;
  joinSession: (code: string) => Promise<void>;
  leaveSession: () => Promise<void>;
  updateReadyStatus: (isReady: boolean) => Promise<void>;
  startSession: () => Promise<void>;
  fetchAvailableSessions: () => Promise<void>;
  subscribeToUpdates: (sessionId: string) => () => void;
  clearError: () => void;
}

export const useTeamSessionStore = create<TeamSessionState>((set, get) => ({
  currentSession: null,
  availableSessions: [],
  isLoading: false,
  error: null,
  
  createSession: async (data) => {
    teamLogger.info('Creating team session', data);
    set({ isLoading: true, error: null });
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('認証が必要です');
      
      // Generate unique code
      const code = Math.random().toString(36).substring(2, 8).toUpperCase();
      
      const { data: session, error } = await supabase
        .from('team_sessions')
        .insert([{
          name: data.name,
          description: data.description,
          code,
          host_id: user.id,
          mode: data.mode,
          duration: data.duration,
          is_public: data.isPublic,
          status: 'waiting',
          max_participants: 10,
        }])
        .select(`
          *,
          participants:team_participants(
            *,
            user:users(username, display_name, avatar_url, level)
          )
        `)
        .single();
        
      if (error) throw error;
      
      // Auto-join as host
      await get().joinSession(code);
      
      set({ isLoading: false });
      return session;
    } catch (error: any) {
      teamLogger.error('Failed to create session', error);
      set({ 
        isLoading: false, 
        error: error.message || 'セッションの作成に失敗しました', 
      });
      throw error;
    }
  },
  
  joinSession: async (code) => {
    teamLogger.info('Joining session', { code });
    set({ isLoading: true, error: null });
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('認証が必要です');
      
      // Find session by code
      const { data: session, error: sessionError } = await supabase
        .from('team_sessions')
        .select(`
          *,
          participants:team_participants(
            *,
            user:users(username, display_name, avatar_url, level)
          )
        `)
        .eq('code', code.toUpperCase())
        .eq('status', 'waiting')
        .single();
        
      if (sessionError) throw new Error('セッションが見つかりません');
      
      // Check if already joined
      const alreadyJoined = session.participants.some(p => p.user_id === user.id);
      if (alreadyJoined) {
        set({ currentSession: session, isLoading: false });
        return;
      }
      
      // Join session
      const { error: joinError } = await supabase
        .from('team_participants')
        .insert([{
          team_session_id: session.id,
          user_id: user.id,
          is_ready: false,
          is_active: true,
        }]);
        
      if (joinError) throw joinError;
      
      // Fetch updated session
      const { data: updatedSession } = await supabase
        .from('team_sessions')
        .select(`
          *,
          participants:team_participants(
            *,
            user:users(username, display_name, avatar_url, level)
          )
        `)
        .eq('id', session.id)
        .single();
        
      set({ 
        currentSession: updatedSession, 
        isLoading: false, 
      });
    } catch (error: any) {
      teamLogger.error('Failed to join session', error);
      set({ 
        isLoading: false, 
        error: error.message || 'セッションへの参加に失敗しました', 
      });
      throw error;
    }
  },
  
  leaveSession: async () => {
    const { currentSession } = get();
    if (!currentSession) return;
    
    teamLogger.info('Leaving session', { sessionId: currentSession.id });
    set({ isLoading: true, error: null });
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('認証が必要です');
      
      const { error } = await supabase
        .from('team_participants')
        .update({ 
          is_active: false, 
          left_at: new Date().toISOString(), 
        })
        .eq('team_session_id', currentSession.id)
        .eq('user_id', user.id);
        
      if (error) throw error;
      
      set({ 
        currentSession: null, 
        isLoading: false, 
      });
    } catch (error: any) {
      teamLogger.error('Failed to leave session', error);
      set({ 
        isLoading: false, 
        error: error.message || 'セッションからの退出に失敗しました', 
      });
    }
  },
  
  updateReadyStatus: async (isReady) => {
    const { currentSession } = get();
    if (!currentSession) return;
    
    teamLogger.info('Updating ready status', { isReady });
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('認証が必要です');
      
      const { error } = await supabase
        .from('team_participants')
        .update({ is_ready: isReady })
        .eq('team_session_id', currentSession.id)
        .eq('user_id', user.id);
        
      if (error) throw error;
    } catch (error: any) {
      teamLogger.error('Failed to update ready status', error);
      set({ 
        error: error.message || '準備状態の更新に失敗しました', 
      });
    }
  },
  
  startSession: async () => {
    const { currentSession } = get();
    if (!currentSession) return;
    
    teamLogger.info('Starting team session', { sessionId: currentSession.id });
    set({ isLoading: true, error: null });
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('認証が必要です');
      
      // Check if user is host
      if (currentSession.host_id !== user.id) {
        throw new Error('ホストのみがセッションを開始できます');
      }
      
      const { error } = await supabase
        .from('team_sessions')
        .update({ 
          status: 'in_progress',
          started_at: new Date().toISOString(),
        })
        .eq('id', currentSession.id);
        
      if (error) throw error;
      
      set({ isLoading: false });
    } catch (error: any) {
      teamLogger.error('Failed to start session', error);
      set({ 
        isLoading: false, 
        error: error.message || 'セッションの開始に失敗しました', 
      });
      throw error;
    }
  },
  
  fetchAvailableSessions: async () => {
    teamLogger.info('Fetching available sessions');
    set({ isLoading: true, error: null });
    
    try {
      const { data: sessions, error } = await supabase
        .from('team_sessions')
        .select(`
          *,
          participants:team_participants(count)
        `)
        .eq('status', 'waiting')
        .eq('is_public', true)
        .order('created_at', { ascending: false })
        .limit(20);
        
      if (error) throw error;
      
      set({ 
        availableSessions: sessions || [], 
        isLoading: false, 
      });
    } catch (error: any) {
      teamLogger.error('Failed to fetch sessions', error);
      set({ 
        isLoading: false, 
        error: error.message || 'セッションの取得に失敗しました', 
      });
    }
  },
  
  subscribeToUpdates: (sessionId) => {
    teamLogger.info('Subscribing to session updates', { sessionId });
    
    const channel = supabase
      .channel(`team_session:${sessionId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'team_sessions',
          filter: `id=eq.${sessionId}`,
        },
        async (payload) => {
          teamLogger.debug('Session update received', payload);
          
          // Fetch updated session
          const { data: session } = await supabase
            .from('team_sessions')
            .select(`
              *,
              participants:team_participants(
                *,
                user:users(username, display_name, avatar_url, level)
              )
            `)
            .eq('id', sessionId)
            .single();
            
          if (session) {
            set({ currentSession: session });
          }
        },
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'team_participants',
          filter: `team_session_id=eq.${sessionId}`,
        },
        async () => {
          // Refetch session when participants change
          const { data: session } = await supabase
            .from('team_sessions')
            .select(`
              *,
              participants:team_participants(
                *,
                user:users(username, display_name, avatar_url, level)
              )
            `)
            .eq('id', sessionId)
            .single();
            
          if (session) {
            set({ currentSession: session });
          }
        },
      )
      .subscribe();
      
    // Return unsubscribe function
    return () => {
      teamLogger.info('Unsubscribing from session updates', { sessionId });
      supabase.removeChannel(channel);
    };
  },
  
  clearError: () => {
    set({ error: null });
  },
}));