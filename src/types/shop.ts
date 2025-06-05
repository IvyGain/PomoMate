// Shop and purchasing related types

import { BaseEntity } from './index';

export type ShopItemType = 'character' | 'theme' | 'sound_pack' | 'power_up' | 'cosmetic';
export type CurrencyType = 'coins' | 'gems' | 'real_money';

export interface ShopItem extends BaseEntity {
  name: string;
  description: string;
  type: ShopItemType;
  category: string;
  price: number;
  currency: CurrencyType;
  discount_percentage?: number;
  original_price?: number;
  icon_url: string;
  preview_url?: string;
  is_available: boolean;
  is_featured: boolean;
  is_limited: boolean;
  available_until?: string;
  stock_remaining?: number;
  unlock_level?: number;
  metadata?: Record<string, any>;
}

export interface UserPurchase extends BaseEntity {
  user_id: string;
  item_id: string;
  price_paid: number;
  currency_used: CurrencyType;
  purchased_at: string;
  transaction_id?: string;
  item?: ShopItem;
}

export interface Character {
  id: string;
  name: string;
  description: string;
  personality: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  base_stats: CharacterStats;
  evolution_level: number;
  max_evolution: number;
  unlock_method: 'starter' | 'achievement' | 'purchase' | 'event';
  price?: number;
  image_urls: {
    idle: string;
    working: string;
    happy: string;
    tired: string;
    sleeping: string;
  };
}

export interface CharacterStats {
  focus_bonus: number; // percentage bonus to XP during focus
  break_bonus: number; // percentage bonus to recovery during breaks
  coin_multiplier: number; // multiplier for coin earnings
  special_ability?: string;
}

export interface UserCharacter extends BaseEntity {
  user_id: string;
  character_id: string;
  is_active: boolean;
  experience: number;
  level: number;
  evolution_level: number;
  unlocked_at: string;
  character?: Character;
}

export interface Theme extends BaseEntity {
  name: string;
  description: string;
  category: 'light' | 'dark' | 'nature' | 'minimal' | 'vibrant';
  colors: {
    primary: string;
    secondary: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    accent: string;
    error: string;
    success: string;
    warning: string;
  };
  font_family?: string;
  preview_url: string;
  is_premium: boolean;
  price?: number;
}

export interface SoundPack extends BaseEntity {
  name: string;
  description: string;
  category: 'relaxing' | 'energetic' | 'nature' | 'minimal' | 'retro';
  sounds: {
    timer_start: string;
    timer_tick?: string;
    timer_end: string;
    break_start: string;
    achievement: string;
    level_up: string;
    coin_collect: string;
  };
  preview_url: string;
  is_premium: boolean;
  price?: number;
}