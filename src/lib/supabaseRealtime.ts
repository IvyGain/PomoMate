import { supabase } from './supabase';
import { RealtimeChannel } from '@supabase/supabase-js';

export class SupabaseRealtime {
  private channels: Map<string, any> = new Map();

  // Team session realtime
  subscribeToTeamSession(
    sessionId: string,
    callbacks: {
      onParticipantJoin?: (participant: any) => void;
      onParticipantLeave?: (participant: any) => void;
      onSessionUpdate?: (session: any) => void;
      onSessionStart?: (session: any) => void;
      onSessionEnd?: (session: any) => void;
    },
  ) {
    try {
      const channelName = `team-session:${sessionId}`;
      
      // Unsubscribe if already subscribed
      this.unsubscribe(channelName);

      // In demo mode, just return a mock channel
      if (typeof supabase.channel !== 'function') {
        console.log('Demo mode: Team session subscription simulated');
        return { unsubscribe: () => {} };
      }

      const channel = supabase.channel(channelName);
      
      channel
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'team_session_participants',
            filter: `team_session_id=eq.${sessionId}`,
          },
          (payload: any) => {
            callbacks.onParticipantJoin?.(payload.new);
          },
        )
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'team_session_participants',
            filter: `team_session_id=eq.${sessionId}`,
          },
          (payload: any) => {
            if (payload.new.left_at && !payload.old.left_at) {
              callbacks.onParticipantLeave?.(payload.new);
            }
          },
        )
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'team_sessions',
            filter: `id=eq.${sessionId}`,
          },
          (payload: any) => {
            const oldStatus = payload.old.status;
            const newStatus = payload.new.status;

            if (oldStatus === 'waiting' && newStatus === 'active') {
              callbacks.onSessionStart?.(payload.new);
            } else if (oldStatus === 'active' && (newStatus === 'completed' || newStatus === 'cancelled')) {
              callbacks.onSessionEnd?.(payload.new);
            } else {
              callbacks.onSessionUpdate?.(payload.new);
            }
          },
        )
        .subscribe();

      this.channels.set(channelName, channel);
      return channel;
    } catch (error) {
      console.log('Realtime subscription failed (demo mode):', error);
      return { unsubscribe: () => {} };
    }
  }

  // Team chat realtime
  subscribeToTeamChat(
    teamId: string,
    callbacks: {
      onMessage?: (message: any) => void;
    },
  ) {
    try {
      const channelName = `team-chat:${teamId}`;
      
      // Unsubscribe if already subscribed
      this.unsubscribe(channelName);

      // In demo mode, just return a mock channel
      if (typeof supabase.channel !== 'function') {
        console.log('Demo mode: Team chat subscription simulated');
        return { unsubscribe: () => {} };
      }

      const channel = supabase.channel(channelName);
      
      channel
        .on(
          'broadcast',
          {
            event: 'message',
          },
          (payload: any) => {
            callbacks.onMessage?.(payload.payload);
          },
        )
        .subscribe();

      this.channels.set(channelName, channel);
      return channel;
    } catch (error) {
      console.log('Team chat subscription failed (demo mode):', error);
      return { unsubscribe: () => {} };
    }
  }

  // Send team chat message
  async sendTeamMessage(teamId: string, message: {
    userId: string;
    username: string;
    content: string;
    timestamp: string;
  }) {
    const channelName = `team-chat:${teamId}`;
    const channel = this.channels.get(channelName);

    if (channel) {
      await channel.send({
        type: 'broadcast',
        event: 'message',
        payload: message,
      });
    }
  }

  // Friend status realtime
  subscribeToFriendStatus(
    userId: string,
    callbacks: {
      onStatusChange?: (status: any) => void;
    },
  ) {
    const channelName = `friend-status:${userId}`;
    
    // Unsubscribe if already subscribed
    this.unsubscribe(channelName);

    const channel = supabase.channel(channelName);
    
    channel
      .on(
        'presence',
        {
          event: 'sync',
        },
        () => {
          const state = channel.presenceState();
          callbacks.onStatusChange?.(state);
        },
      )
      .subscribe();

    this.channels.set(channelName, channel);
    return channel;
  }

  // Update user presence
  async updatePresence(userId: string, status: 'online' | 'focusing' | 'break' | 'offline') {
    const channelName = `friend-status:${userId}`;
    const channel = this.channels.get(channelName);

    if (channel) {
      await channel.track({
        user_id: userId,
        status,
        last_seen: new Date().toISOString(),
      });
    }
  }

  // Global leaderboard updates
  subscribeToLeaderboard(
    callbacks: {
      onUpdate?: (leaderboard: any) => void;
    },
  ) {
    const channelName = 'global-leaderboard';
    
    // Unsubscribe if already subscribed
    this.unsubscribe(channelName);

    const channel = supabase.channel(channelName);
    
    channel
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'users',
        },
        async () => {
          // Fetch updated leaderboard
          const { data } = await supabase
            .from('users')
            .select('id, username, display_name, avatar_url, level, experience')
            .order('experience', { ascending: false })
            .limit(10);

          callbacks.onUpdate?.(data);
        },
      )
      .subscribe();

    this.channels.set(channelName, channel);
    return channel;
  }

  // Unsubscribe from a channel
  unsubscribe(channelName: string) {
    const channel = this.channels.get(channelName);
    if (channel && typeof supabase.removeChannel === 'function') {
      try {
        supabase.removeChannel(channel);
      } catch (error) {
        console.log('Channel unsubscribe failed (demo mode):', error);
      }
    }
    this.channels.delete(channelName);
  }

  // Unsubscribe from all channels
  unsubscribeAll() {
    this.channels.forEach((channel) => {
      if (typeof supabase.removeChannel === 'function') {
        try {
          supabase.removeChannel(channel);
        } catch (error) {
          console.log('Channel cleanup failed (demo mode):', error);
        }
      }
    });
    this.channels.clear();
  }
}

export const realtimeService = new SupabaseRealtime();