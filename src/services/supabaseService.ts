import { supabase } from '../lib/supabase';
import { logger } from '../utils/logger';
import type {
  SessionCreate,
  SessionResponse,
  UserProfile,
  UserSettings,
  TeamSessionCreate,
  TeamSessionResponse,
  UserAchievement,
  DailyStats,
  SupabaseResponse,
} from '../types/api';

const serviceLogger = logger.child('SupabaseService');

// Session Service
export const sessionService = {
  async createSession(data: {
    type: 'pomodoro' | 'short_break' | 'long_break';
    duration: number;
  }): Promise<SessionResponse> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('認証が必要です');

    serviceLogger.info('Creating session', { type: data.type, duration: data.duration });

    const { data: session, error } = await supabase
      .from('sessions')
      .insert([
        {
          user_id: user.id,
          type: data.type,
          status: 'active',
          duration: data.duration,
          started_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (error) {
      serviceLogger.error('Failed to create session', error);
      throw error;
    }
    return session;
  },

  async updateSession(sessionId: string, data: {
    status?: 'completed' | 'interrupted';
    actual_duration?: number;
  }): Promise<SessionResponse> {
    const updates: Partial<SessionResponse> = { ...data };
    if (data.status) {
      updates.ended_at = new Date().toISOString();
    }

    const { data: session, error } = await supabase
      .from('sessions')
      .update(updates)
      .eq('id', sessionId)
      .select()
      .single();

    if (error) {
      serviceLogger.error('Failed to update session', error);
      throw error;
    }
    return session;
  },

  async getRecentSessions(limit = 10): Promise<SessionResponse[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('認証が必要です');

    const { data: sessions, error } = await supabase
      .from('sessions')
      .select('*')
      .eq('user_id', user.id)
      .order('started_at', { ascending: false })
      .limit(limit);

    if (error) {
      serviceLogger.error('Failed to fetch recent sessions', error);
      throw error;
    }
    return sessions || [];
  },

  async getTodaySessions(): Promise<SessionResponse[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('認証が必要です');

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const { data: sessions, error } = await supabase
      .from('sessions')
      .select('*')
      .eq('user_id', user.id)
      .gte('started_at', today.toISOString())
      .order('started_at', { ascending: true });

    if (error) {
      serviceLogger.error('Failed to fetch today sessions', error);
      throw error;
    }
    return sessions || [];
  },
};

// User Service
export const userService = {
  async updateStats(stats: Partial<UserProfile>): Promise<UserProfile> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('認証が必要です');

    serviceLogger.info('Updating user stats', { userId: user.id, stats });

    const { data: profile, error } = await supabase
      .from('users')
      .update(stats)
      .eq('id', user.id)
      .select()
      .single();

    if (error) throw error;
    return profile;
  },

  async getLeaderboard(timeframe: 'daily' | 'weekly' | 'all' = 'weekly') {
    let query = supabase
      .from('users')
      .select('id, username, display_name, avatar_url, level, experience, total_focus_time')
      .order('experience', { ascending: false })
      .limit(50);

    // For daily/weekly, we'd need to join with sessions table
    // This is simplified for now
    const { data: users, error } = await query;

    if (error) throw error;
    return users;
  },
};

// Character Service
export const characterService = {
  async getUserCharacters() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('認証が必要です');

    const { data: characters, error } = await supabase
      .from('user_characters')
      .select(`
        *,
        character:characters(*)
      `)
      .eq('user_id', user.id);

    if (error) throw error;
    return characters;
  },

  async unlockCharacter(characterId: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('認証が必要です');

    const { data: character, error } = await supabase
      .from('user_characters')
      .insert([
        {
          user_id: user.id,
          character_id: characterId,
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return character;
  },

  async setActiveCharacter(characterId: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('認証が必要です');

    // First, set all characters to inactive
    await supabase
      .from('user_characters')
      .update({ is_active: false })
      .eq('user_id', user.id);

    // Then set the selected character as active
    const { data: character, error } = await supabase
      .from('user_characters')
      .update({ is_active: true })
      .eq('user_id', user.id)
      .eq('character_id', characterId)
      .select()
      .single();

    if (error) throw error;
    return character;
  },

  async updateCharacterExperience(characterId: string, experience: number) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('認証が必要です');

    const { data: character, error } = await supabase
      .from('user_characters')
      .update({ experience })
      .eq('user_id', user.id)
      .eq('character_id', characterId)
      .select()
      .single();

    if (error) throw error;
    return character;
  },
};

// Achievement Service
export const achievementService = {
  async getUserAchievements() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('認証が必要です');

    const { data: achievements, error } = await supabase
      .from('user_achievements')
      .select(`
        *,
        achievement:achievements(*)
      `)
      .eq('user_id', user.id);

    if (error) throw error;
    return achievements;
  },

  async unlockAchievement(achievementId: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('認証が必要です');

    const { data: achievement, error } = await supabase
      .from('user_achievements')
      .insert([
        {
          user_id: user.id,
          achievement_id: achievementId,
        },
      ])
      .select(`
        *,
        achievement:achievements(*)
      `)
      .single();

    if (error) throw error;
    return achievement;
  },

  async checkAchievements() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('認証が必要です');

    // Get user stats and check against achievement requirements
    // This is a simplified version - in production, this would be more complex
    const { data: profile } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    const { data: achievements } = await supabase
      .from('achievements')
      .select('*');

    const { data: userAchievements } = await supabase
      .from('user_achievements')
      .select('achievement_id')
      .eq('user_id', user.id);

    const unlockedIds = userAchievements?.map(ua => ua.achievement_id) || [];
    const newAchievements = [];

    // Check each achievement
    for (const achievement of achievements || []) {
      if (unlockedIds.includes(achievement.id)) continue;

      const requirement = achievement.requirement;
      let unlocked = false;

      // Check different types of requirements
      if (requirement.type === 'session_count') {
        // Count total sessions
        const { count } = await supabase
          .from('sessions')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .eq('status', 'completed');

        if (count && count >= requirement.value) {
          unlocked = true;
        }
      } else if (requirement.type === 'streak_days' && profile) {
        if (profile.streak_days >= requirement.value) {
          unlocked = true;
        }
      }

      if (unlocked) {
        newAchievements.push(achievement);
        await achievementService.unlockAchievement(achievement.id);
      }
    }

    return newAchievements;
  },
};

// Settings Service
export const settingsService = {
  async getSettings() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('認証が必要です');

    const { data: settings, error } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error) throw error;
    return settings;
  },

  async updateSettings(updates: any) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('認証が必要です');

    const { data: settings, error } = await supabase
      .from('user_settings')
      .update(updates)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) throw error;
    return settings;
  },
};

// Social Service
export const socialService = {
  async sendFriendRequest(friendUsername: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('認証が必要です');

    // Find friend by username
    const { data: friend, error: friendError } = await supabase
      .from('users')
      .select('id')
      .eq('username', friendUsername)
      .single();

    if (friendError) throw new Error('ユーザーが見つかりません');

    const { data: request, error } = await supabase
      .from('friends')
      .insert([
        {
          user_id: user.id,
          friend_id: friend.id,
          status: 'pending',
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return request;
  },

  async acceptFriendRequest(requestId: string) {
    const { data: request, error } = await supabase
      .from('friends')
      .update({
        status: 'accepted',
        accepted_at: new Date().toISOString(),
      })
      .eq('id', requestId)
      .select()
      .single();

    if (error) throw error;
    return request;
  },

  async getFriends() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('認証が必要です');

    const { data: friends, error } = await supabase
      .from('friends')
      .select(`
        *,
        friend:users!friends_friend_id_fkey(id, username, display_name, avatar_url, level),
        user:users!friends_user_id_fkey(id, username, display_name, avatar_url, level)
      `)
      .or(`user_id.eq.${user.id},friend_id.eq.${user.id}`)
      .eq('status', 'accepted');

    if (error) throw error;

    // Format friends list
    return friends?.map(f => {
      const friendData = f.user_id === user.id ? f.friend : f.user;
      return {
        ...f,
        friend: friendData,
      };
    });
  },
};

// Team Service
export const teamService = {
  async createTeam(data: {
    name: string;
    description?: string;
    is_public?: boolean;
    max_members?: number;
  }) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('認証が必要です');

    // Generate unique code
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();

    const { data: team, error } = await supabase
      .from('teams')
      .insert([
        {
          ...data,
          code,
          owner_id: user.id,
        },
      ])
      .select()
      .single();

    if (error) throw error;

    // Add owner as member
    await supabase.from('team_members').insert([
      {
        team_id: team.id,
        user_id: user.id,
        role: 'owner',
      },
    ]);

    return team;
  },

  async joinTeam(code: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('認証が必要です');

    // Find team by code
    const { data: team, error: teamError } = await supabase
      .from('teams')
      .select('*')
      .eq('code', code.toUpperCase())
      .single();

    if (teamError) throw new Error('チームが見つかりません');

    // Check if already member
    const { data: existing } = await supabase
      .from('team_members')
      .select('id')
      .eq('team_id', team.id)
      .eq('user_id', user.id)
      .single();

    if (existing) throw new Error('すでにメンバーです');

    // Add as member
    const { data: member, error } = await supabase
      .from('team_members')
      .insert([
        {
          team_id: team.id,
          user_id: user.id,
          role: 'member',
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return { team, member };
  },

  async getMyTeams() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('認証が必要です');

    const { data: teams, error } = await supabase
      .from('team_members')
      .select(`
        *,
        team:teams(*)
      `)
      .eq('user_id', user.id);

    if (error) throw error;
    return teams;
  },

  async createTeamSession(teamId: string, data: {
    type: 'pomodoro' | 'short_break' | 'long_break';
    duration: number;
  }) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('認証が必要です');

    const { data: session, error } = await supabase
      .from('team_sessions')
      .insert([
        {
          team_id: teamId,
          host_id: user.id,
          ...data,
          status: 'waiting',
        },
      ])
      .select()
      .single();

    if (error) throw error;

    // Add host as participant
    await supabase.from('team_session_participants').insert([
      {
        team_session_id: session.id,
        user_id: user.id,
      },
    ]);

    return session;
  },
};

// Shop Service
export const shopService = {
  async getShopItems() {
    const { data: items, error } = await supabase
      .from('shop_items')
      .select('*')
      .eq('is_available', true)
      .order('type', { ascending: true })
      .order('price', { ascending: true });

    if (error) throw error;
    return items;
  },

  async purchaseItem(itemId: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('認証が必要です');

    // Get item details
    const { data: item, error: itemError } = await supabase
      .from('shop_items')
      .select('*')
      .eq('id', itemId)
      .single();

    if (itemError) throw itemError;

    // Check user coins
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('coins')
      .eq('id', user.id)
      .single();

    if (profileError) throw profileError;
    if (profile.coins < item.price) throw new Error('コインが不足しています');

    // Deduct coins and create purchase
    const { error: updateError } = await supabase
      .from('users')
      .update({ coins: profile.coins - item.price })
      .eq('id', user.id);

    if (updateError) throw updateError;

    const { data: purchase, error: purchaseError } = await supabase
      .from('user_purchases')
      .insert([
        {
          user_id: user.id,
          item_id: itemId,
          price_paid: item.price,
        },
      ])
      .select()
      .single();

    if (purchaseError) throw purchaseError;
    return purchase;
  },

  async getUserPurchases() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('認証が必要です');

    const { data: purchases, error } = await supabase
      .from('user_purchases')
      .select(`
        *,
        item:shop_items(*)
      `)
      .eq('user_id', user.id)
      .order('purchased_at', { ascending: false });

    if (error) throw error;
    return purchases;
  },
};