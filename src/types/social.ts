// Social features related types

import { BaseEntity } from './index';
import { User } from './auth';

export type FriendshipStatus = 'pending' | 'accepted' | 'rejected' | 'blocked';
export type TeamRole = 'owner' | 'admin' | 'member';
export type TeamSessionStatus = 'waiting' | 'in_progress' | 'completed' | 'cancelled';

export interface Friendship extends BaseEntity {
  user_id: string;
  friend_id: string;
  status: FriendshipStatus;
  accepted_at?: string;
  rejected_at?: string;
  blocked_at?: string;
  friend?: User;
  user?: User;
}

export interface Team extends BaseEntity {
  name: string;
  description?: string;
  code: string; // unique team code for joining
  owner_id: string;
  avatar_url?: string;
  is_public: boolean;
  max_members: number;
  member_count?: number;
  owner?: User;
}

export interface TeamMember extends BaseEntity {
  team_id: string;
  user_id: string;
  role: TeamRole;
  joined_at: string;
  left_at?: string;
  user?: User;
  team?: Team;
}

export interface TeamSession extends BaseEntity {
  team_id: string;
  host_id: string;
  type: 'pomodoro' | 'short_break' | 'long_break';
  duration: number;
  status: TeamSessionStatus;
  started_at?: string;
  ended_at?: string;
  max_participants?: number;
  team?: Team;
  host?: User;
  participants?: TeamSessionParticipant[];
}

export interface TeamSessionParticipant extends BaseEntity {
  team_session_id: string;
  user_id: string;
  joined_at: string;
  left_at?: string;
  is_ready: boolean;
  is_active: boolean;
  completed: boolean;
  user?: User;
}

export interface Notification extends BaseEntity {
  user_id: string;
  type: 'friend_request' | 'achievement' | 'team_invite' | 'session_invite' | 'system';
  title: string;
  message: string;
  data?: Record<string, any>;
  read: boolean;
  read_at?: string;
}

export interface LeaderboardEntry {
  rank: number;
  user: User;
  score: number;
  timeframe: 'daily' | 'weekly' | 'monthly' | 'all_time';
}