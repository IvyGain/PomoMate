// Game related types

import { BaseEntity } from './index';

export type GameType = 
  | 'memory_match' 
  | 'word_scramble' 
  | 'math_challenge' 
  | 'pattern_memory' 
  | 'color_match' 
  | 'tap_target' 
  | 'number_puzzle';

export type GameDifficulty = 'easy' | 'medium' | 'hard' | 'expert';

export interface Game {
  id: GameType;
  name: string;
  description: string;
  icon: string;
  category: 'memory' | 'logic' | 'speed' | 'math';
  min_level: number;
  unlock_cost?: number;
  is_premium: boolean;
}

export interface GameScore extends BaseEntity {
  user_id: string;
  game_id: GameType;
  score: number;
  level: number;
  difficulty: GameDifficulty;
  time_played: number; // in seconds
  accuracy?: number; // percentage
  combo?: number;
  is_perfect?: boolean;
}

export interface GameStats {
  game_id: GameType;
  games_played: number;
  total_score: number;
  high_score: number;
  average_score: number;
  total_time_played: number;
  last_played?: string;
  best_combo?: number;
  perfect_games?: number;
}

export interface GameSession {
  id: string;
  game_id: GameType;
  started_at: string;
  ended_at?: string;
  score: number;
  level: number;
  difficulty: GameDifficulty;
  moves?: number;
  mistakes?: number;
  hints_used?: number;
}

export interface GameLeaderboard {
  game_id: GameType;
  timeframe: 'daily' | 'weekly' | 'all_time';
  entries: GameLeaderboardEntry[];
}

export interface GameLeaderboardEntry {
  rank: number;
  user_id: string;
  username: string;
  display_name: string;
  avatar_url?: string;
  score: number;
  level: number;
  played_at: string;
}

export interface GameUnlock extends BaseEntity {
  user_id: string;
  game_id: GameType;
  unlocked_at: string;
  unlock_method: 'level' | 'purchase' | 'achievement' | 'gift';
}