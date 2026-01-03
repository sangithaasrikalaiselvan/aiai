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
      profiles: {
        Row: {
          id: string
          full_name: string | null
          avatar_url: string | null
          language_preference: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          full_name?: string | null
          avatar_url?: string | null
          language_preference?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          full_name?: string | null
          avatar_url?: string | null
          language_preference?: string
          created_at?: string
          updated_at?: string
        }
      }
      cities: {
        Row: {
          id: string
          name: string
          country: string
          region: string | null
          latitude: number | null
          longitude: number | null
          cost_index: number
          popularity_score: number
          description: string | null
          image_url: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          country: string
          region?: string | null
          latitude?: number | null
          longitude?: number | null
          cost_index?: number
          popularity_score?: number
          description?: string | null
          image_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          country?: string
          region?: string | null
          latitude?: number | null
          longitude?: number | null
          cost_index?: number
          popularity_score?: number
          description?: string | null
          image_url?: string | null
          created_at?: string
        }
      }
      activities: {
        Row: {
          id: string
          city_id: string | null
          name: string
          description: string | null
          category: string
          estimated_cost: number
          estimated_duration_hours: number
          image_url: string | null
          created_at: string
        }
        Insert: {
          id?: string
          city_id?: string | null
          name: string
          description?: string | null
          category: string
          estimated_cost?: number
          estimated_duration_hours?: number
          image_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          city_id?: string | null
          name?: string
          description?: string | null
          category?: string
          estimated_cost?: number
          estimated_duration_hours?: number
          image_url?: string | null
          created_at?: string
        }
      }
      trips: {
        Row: {
          id: string
          user_id: string
          name: string
          description: string | null
          start_date: string | null
          end_date: string | null
          cover_photo_url: string | null
          is_public: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          description?: string | null
          start_date?: string | null
          end_date?: string | null
          cover_photo_url?: string | null
          is_public?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          description?: string | null
          start_date?: string | null
          end_date?: string | null
          cover_photo_url?: string | null
          is_public?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      trip_stops: {
        Row: {
          id: string
          trip_id: string
          city_id: string
          arrival_date: string | null
          departure_date: string | null
          order_index: number
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          trip_id: string
          city_id: string
          arrival_date?: string | null
          departure_date?: string | null
          order_index?: number
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          trip_id?: string
          city_id?: string
          arrival_date?: string | null
          departure_date?: string | null
          order_index?: number
          notes?: string | null
          created_at?: string
        }
      }
      stop_activities: {
        Row: {
          id: string
          stop_id: string
          activity_id: string
          scheduled_date: string | null
          scheduled_time: string | null
          actual_cost: number | null
          notes: string | null
          is_completed: boolean
          created_at: string
        }
        Insert: {
          id?: string
          stop_id: string
          activity_id: string
          scheduled_date?: string | null
          scheduled_time?: string | null
          actual_cost?: number | null
          notes?: string | null
          is_completed?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          stop_id?: string
          activity_id?: string
          scheduled_date?: string | null
          scheduled_time?: string | null
          actual_cost?: number | null
          notes?: string | null
          is_completed?: boolean
          created_at?: string
        }
      }
      trip_expenses: {
        Row: {
          id: string
          trip_id: string
          stop_id: string | null
          category: string
          description: string | null
          amount: number
          expense_date: string | null
          created_at: string
        }
        Insert: {
          id?: string
          trip_id: string
          stop_id?: string | null
          category: string
          description?: string | null
          amount: number
          expense_date?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          trip_id?: string
          stop_id?: string | null
          category?: string
          description?: string | null
          amount?: number
          expense_date?: string | null
          created_at?: string
        }
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
  }
}
