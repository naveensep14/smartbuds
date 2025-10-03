import { createBrowserClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';

// Check if we have real credentials
const hasValidCredentials = supabaseUrl !== 'https://placeholder.supabase.co' && 
                           supabaseAnonKey !== 'placeholder-key';

export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);

// Export a flag to check if Supabase is properly configured
export const isSupabaseConfigured = hasValidCredentials;

// Database types
export interface Database {
  public: {
    Tables: {
      tests: {
        Row: {
          id: string;
          title: string;
          description: string;
          subject: string;
          grade: string;
          board: string;
          duration: number;
          questions: any;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description: string;
          subject: string;
          grade: string;
          board: string;
          duration: number;
          questions: any;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string;
          subject?: string;
          grade?: string;
          board?: string;
          duration?: number;
          questions?: any;
          created_at?: string;
          updated_at?: string;
        };
      };
      results: {
        Row: {
          id: string;
          testId: string;
          studentName: string;
          score: number;
          totalQuestions: number;
          correctAnswers: number;
          timeTaken: number;
          answers: any;
          completedAt: string;
        };
        Insert: {
          id?: string;
          testId: string;
          studentName: string;
          score: number;
          totalQuestions: number;
          correctAnswers: number;
          timeTaken: number;
          answers: any;
          completedAt?: string;
        };
        Update: {
          id?: string;
          testId?: string;
          studentName?: string;
          score?: number;
          totalQuestions?: number;
          correctAnswers?: number;
          timeTaken?: number;
          answers?: any;
          completedAt?: string;
        };
      };
    };
  };
} 