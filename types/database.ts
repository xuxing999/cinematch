export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          display_name: string
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          display_name?: string
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          display_name?: string
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      signals: {
        Row: {
          id: string
          user_id: string
          movie_id: number
          movie_title: string
          movie_poster: string | null
          theater_name: string | null
          showtime: string | null
          tag: 'has_ticket' | 'seek_companion' | 'pure_watch' | 'want_discuss'
          note: string | null
          location: string | null
          intent: 'aa_split' | 'i_treat' | 'just_watch' | null
          gender_age_label: string | null
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          movie_id: number
          movie_title: string
          movie_poster?: string | null
          theater_name?: string | null
          showtime?: string | null
          tag: 'has_ticket' | 'seek_companion' | 'pure_watch' | 'want_discuss'
          note?: string | null
          location?: string | null
          intent?: 'aa_split' | 'i_treat' | 'just_watch' | null
          gender_age_label?: string | null
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          movie_id?: number
          movie_title?: string
          movie_poster?: string | null
          theater_name?: string | null
          showtime?: string | null
          tag?: 'has_ticket' | 'seek_companion' | 'pure_watch' | 'want_discuss'
          note?: string | null
          location?: string | null
          intent?: 'aa_split' | 'i_treat' | 'just_watch' | null
          gender_age_label?: string | null
          is_active?: boolean
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'signals_user_id_fkey'
            columns: ['user_id']
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          }
        ]
      }
      messages: {
        Row: {
          id: string
          sender_id: string
          receiver_id: string
          content: string
          is_read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          sender_id: string
          receiver_id: string
          content: string
          is_read?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          sender_id?: string
          receiver_id?: string
          content?: string
          is_read?: boolean
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'messages_sender_id_fkey'
            columns: ['sender_id']
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'messages_receiver_id_fkey'
            columns: ['receiver_id']
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      cleanup_expired_data: {
        Args: Record<string, never>
        Returns: void
      }
    }
    Enums: {
      [_ in never]: never
    }
  }
}
