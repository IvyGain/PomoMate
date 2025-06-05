export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          username: string
          display_name: string
          avatar_url: string | null
          level: number
          experience: number
          coins: number
          streak_days: number
          last_session_date: string | null
          focus_time_today: number
          total_focus_time: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          username: string
          display_name: string
          avatar_url?: string | null
          level?: number
          experience?: number
          coins?: number
          streak_days?: number
          last_session_date?: string | null
          focus_time_today?: number
          total_focus_time?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          username?: string
          display_name?: string
          avatar_url?: string | null
          level?: number
          experience?: number
          coins?: number
          streak_days?: number
          last_session_date?: string | null
          focus_time_today?: number
          total_focus_time?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_settings: {
        Row: {
          id: string
          user_id: string
          pomodoro_duration: number
          short_break_duration: number
          long_break_duration: number
          sessions_until_long_break: number
          auto_start_breaks: boolean
          auto_start_pomodoros: boolean
          sound_enabled: boolean
          notification_enabled: boolean
          theme: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          pomodoro_duration?: number
          short_break_duration?: number
          long_break_duration?: number
          sessions_until_long_break?: number
          auto_start_breaks?: boolean
          auto_start_pomodoros?: boolean
          sound_enabled?: boolean
          notification_enabled?: boolean
          theme?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          pomodoro_duration?: number
          short_break_duration?: number
          long_break_duration?: number
          sessions_until_long_break?: number
          auto_start_breaks?: boolean
          auto_start_pomodoros?: boolean
          sound_enabled?: boolean
          notification_enabled?: boolean
          theme?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_settings_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      sessions: {
        Row: {
          id: string
          user_id: string
          type: 'pomodoro' | 'short_break' | 'long_break'
          status: 'active' | 'completed' | 'interrupted'
          duration: number
          actual_duration: number | null
          started_at: string
          ended_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: 'pomodoro' | 'short_break' | 'long_break'
          status: 'active' | 'completed' | 'interrupted'
          duration: number
          actual_duration?: number | null
          started_at: string
          ended_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: 'pomodoro' | 'short_break' | 'long_break'
          status?: 'active' | 'completed' | 'interrupted'
          duration?: number
          actual_duration?: number | null
          started_at?: string
          ended_at?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "sessions_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      characters: {
        Row: {
          id: string
          name: string
          description: string | null
          type: string
          base_stats: Json
          unlock_requirement: Json | null
          evolution_requirement: Json | null
          rarity: string
          created_at: string
        }
        Insert: {
          id: string
          name: string
          description?: string | null
          type: string
          base_stats: Json
          unlock_requirement?: Json | null
          evolution_requirement?: Json | null
          rarity: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          type?: string
          base_stats?: Json
          unlock_requirement?: Json | null
          evolution_requirement?: Json | null
          rarity?: string
          created_at?: string
        }
        Relationships: []
      }
      user_characters: {
        Row: {
          id: string
          user_id: string
          character_id: string
          level: number
          experience: number
          is_active: boolean
          unlocked_at: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          character_id: string
          level?: number
          experience?: number
          is_active?: boolean
          unlocked_at?: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          character_id?: string
          level?: number
          experience?: number
          is_active?: boolean
          unlocked_at?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_characters_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_characters_character_id_fkey"
            columns: ["character_id"]
            referencedRelation: "characters"
            referencedColumns: ["id"]
          }
        ]
      }
      achievements: {
        Row: {
          id: string
          name: string
          description: string | null
          icon: string | null
          requirement: Json
          coins_reward: number
          experience_reward: number
          created_at: string
        }
        Insert: {
          id: string
          name: string
          description?: string | null
          icon?: string | null
          requirement: Json
          coins_reward?: number
          experience_reward?: number
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          icon?: string | null
          requirement?: Json
          coins_reward?: number
          experience_reward?: number
          created_at?: string
        }
        Relationships: []
      }
      user_achievements: {
        Row: {
          id: string
          user_id: string
          achievement_id: string
          unlocked_at: string
        }
        Insert: {
          id?: string
          user_id: string
          achievement_id: string
          unlocked_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          achievement_id?: string
          unlocked_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_achievements_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_achievements_achievement_id_fkey"
            columns: ["achievement_id"]
            referencedRelation: "achievements"
            referencedColumns: ["id"]
          }
        ]
      }
      teams: {
        Row: {
          id: string
          name: string
          description: string | null
          code: string
          owner_id: string
          max_members: number
          is_public: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          code: string
          owner_id: string
          max_members?: number
          is_public?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          code?: string
          owner_id?: string
          max_members?: number
          is_public?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "teams_owner_id_fkey"
            columns: ["owner_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      team_members: {
        Row: {
          id: string
          team_id: string
          user_id: string
          role: 'owner' | 'moderator' | 'member'
          joined_at: string
        }
        Insert: {
          id?: string
          team_id: string
          user_id: string
          role: 'owner' | 'moderator' | 'member'
          joined_at?: string
        }
        Update: {
          id?: string
          team_id?: string
          user_id?: string
          role?: 'owner' | 'moderator' | 'member'
          joined_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_members_team_id_fkey"
            columns: ["team_id"]
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_members_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      team_sessions: {
        Row: {
          id: string
          team_id: string
          host_id: string
          status: 'waiting' | 'active' | 'completed' | 'cancelled'
          type: 'pomodoro' | 'short_break' | 'long_break'
          duration: number
          started_at: string | null
          ended_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          team_id: string
          host_id: string
          status: 'waiting' | 'active' | 'completed' | 'cancelled'
          type: 'pomodoro' | 'short_break' | 'long_break'
          duration: number
          started_at?: string | null
          ended_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          team_id?: string
          host_id?: string
          status?: 'waiting' | 'active' | 'completed' | 'cancelled'
          type?: 'pomodoro' | 'short_break' | 'long_break'
          duration?: number
          started_at?: string | null
          ended_at?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_sessions_team_id_fkey"
            columns: ["team_id"]
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_sessions_host_id_fkey"
            columns: ["host_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      team_session_participants: {
        Row: {
          id: string
          team_session_id: string
          user_id: string
          joined_at: string
          left_at: string | null
        }
        Insert: {
          id?: string
          team_session_id: string
          user_id: string
          joined_at?: string
          left_at?: string | null
        }
        Update: {
          id?: string
          team_session_id?: string
          user_id?: string
          joined_at?: string
          left_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "team_session_participants_team_session_id_fkey"
            columns: ["team_session_id"]
            referencedRelation: "team_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_session_participants_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      shop_items: {
        Row: {
          id: string
          name: string
          description: string | null
          type: string
          price: number
          data: Json | null
          is_available: boolean
          created_at: string
        }
        Insert: {
          id: string
          name: string
          description?: string | null
          type: string
          price: number
          data?: Json | null
          is_available?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          type?: string
          price?: number
          data?: Json | null
          is_available?: boolean
          created_at?: string
        }
        Relationships: []
      }
      user_purchases: {
        Row: {
          id: string
          user_id: string
          item_id: string
          purchased_at: string
          price_paid: number
        }
        Insert: {
          id?: string
          user_id: string
          item_id: string
          purchased_at?: string
          price_paid: number
        }
        Update: {
          id?: string
          user_id?: string
          item_id?: string
          purchased_at?: string
          price_paid?: number
        }
        Relationships: [
          {
            foreignKeyName: "user_purchases_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_purchases_item_id_fkey"
            columns: ["item_id"]
            referencedRelation: "shop_items"
            referencedColumns: ["id"]
          }
        ]
      }
      friends: {
        Row: {
          id: string
          user_id: string
          friend_id: string
          status: 'pending' | 'accepted' | 'blocked'
          requested_at: string
          accepted_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          friend_id: string
          status: 'pending' | 'accepted' | 'blocked'
          requested_at?: string
          accepted_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          friend_id?: string
          status?: 'pending' | 'accepted' | 'blocked'
          requested_at?: string
          accepted_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "friends_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "friends_friend_id_fkey"
            columns: ["friend_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}