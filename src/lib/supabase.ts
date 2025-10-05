import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Check if Supabase is configured
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your .env.local file');
} else {
  console.log('🔗 Supabase URL:', supabaseUrl);
  console.log('🔑 Supabase Key (first 10 chars):', supabaseAnonKey.substring(0, 10) + '...');
}

// Create Supabase client with fallback - use dummy values during build if not configured
export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false
      }
    })
  : createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://dummy.supabase.co',
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'dummy-key',
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
          detectSessionInUrl: false
        }
      }
    )

// Database types
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          clerk_user_id: string
          email: string
          first_name: string | null
          last_name: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          clerk_user_id: string
          email: string
          first_name?: string | null
          last_name?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          clerk_user_id?: string
          email?: string
          first_name?: string | null
          last_name?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      transactions: {
        Row: {
          id: string
          user_id: string
          description: string
          amount: number
          date: string
          category: string
          merchant: string | null
          type: 'income' | 'expense'
          confidence: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          description: string
          amount: number
          date: string
          category: string
          merchant?: string | null
          type: 'income' | 'expense'
          confidence?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          description?: string
          amount?: number
          date?: string
          category?: string
          merchant?: string | null
          type?: 'income' | 'expense'
          confidence?: number | null
          created_at?: string
          updated_at?: string
        }
      }
      financial_metrics: {
        Row: {
          id: string
          user_id: string
          total_income: number
          total_expenses: number
          savings: number
          savings_rate: number
          health_score: number
          income_trend: 'up' | 'down' | 'stable'
          expense_trend: 'up' | 'down' | 'stable'
          month: string
          year: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          total_income: number
          total_expenses: number
          savings: number
          savings_rate: number
          health_score: number
          income_trend: 'up' | 'down' | 'stable'
          expense_trend: 'up' | 'down' | 'stable'
          month: string
          year: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          total_income?: number
          total_expenses?: number
          savings?: number
          savings_rate?: number
          health_score?: number
          income_trend?: 'up' | 'down' | 'stable'
          expense_trend?: 'up' | 'down' | 'stable'
          month?: string
          year?: number
          created_at?: string
          updated_at?: string
        }
      }
      uploaded_files: {
        Row: {
          id: string
          user_id: string
          filename: string
          file_type: string
          file_size: number
          file_url: string
          status: 'uploading' | 'processing' | 'completed' | 'failed'
          processed_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          filename: string
          file_type: string
          file_size: number
          file_url: string
          status: 'uploading' | 'processing' | 'completed' | 'failed'
          processed_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          filename?: string
          file_type?: string
          file_size?: number
          file_url?: string
          status?: 'uploading' | 'processing' | 'completed' | 'failed'
          processed_at?: string | null
          created_at?: string
          updated_at?: string
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
