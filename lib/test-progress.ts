import { supabase } from './supabase';

export interface TestProgress {
  id?: string;
  userEmail: string;
  testId: string;
  currentQuestionIndex: number;
  selectedAnswers: { [key: string]: number };
  startTime: Date;
  lastUpdated: Date;
  isCompleted: boolean;
  timeSpent: number; // in seconds
}

export class TestProgressService {
  // Save or update test progress
  static async saveProgress(progress: Partial<TestProgress>): Promise<TestProgress | null> {
    try {
      const { data, error } = await supabase
        .from('test_progress')
        .upsert({
          user_email: progress.userEmail,
          test_id: progress.testId,
          current_question_index: progress.currentQuestionIndex || 0,
          selected_answers: progress.selectedAnswers || {},
          start_time: progress.startTime?.toISOString(),
          last_updated: new Date().toISOString(),
          is_completed: progress.isCompleted || false,
          time_spent: progress.timeSpent || 0,
        }, {
          onConflict: 'user_email,test_id'
        })
        .select()
        .single();

      if (error) {
        console.error('Error saving test progress:', error);
        return null;
      }

      return this.mapToTestProgress(data);
    } catch (error) {
      console.error('Error saving test progress:', error);
      return null;
    }
  }

  // Get test progress for a user and test
  static async getProgress(userEmail: string, testId: string): Promise<TestProgress | null> {
    try {
      const { data, error } = await supabase
        .from('test_progress')
        .select('*')
        .eq('user_email', userEmail)
        .eq('test_id', testId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No progress found
          return null;
        }
        console.error('Error getting test progress:', error);
        return null;
      }

      return this.mapToTestProgress(data);
    } catch (error) {
      console.error('Error getting test progress:', error);
      return null;
    }
  }

  // Get all incomplete tests for a user
  static async getIncompleteTests(userEmail: string): Promise<TestProgress[]> {
    try {
      const { data, error } = await supabase
        .from('test_progress')
        .select('*')
        .eq('user_email', userEmail)
        .eq('is_completed', false)
        .order('last_updated', { ascending: false });

      if (error) {
        console.error('Error getting incomplete tests:', error);
        return [];
      }

      return data.map(item => this.mapToTestProgress(item));
    } catch (error) {
      console.error('Error getting incomplete tests:', error);
      return [];
    }
  }

  // Mark test as completed and clean up progress
  static async markCompleted(userEmail: string, testId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('test_progress')
        .update({
          is_completed: true,
          last_updated: new Date().toISOString()
        })
        .eq('user_email', userEmail)
        .eq('test_id', testId);

      if (error) {
        console.error('Error marking test as completed:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error marking test as completed:', error);
      return false;
    }
  }

  // Delete progress (when user wants to start fresh)
  static async deleteProgress(userEmail: string, testId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('test_progress')
        .delete()
        .eq('user_email', userEmail)
        .eq('test_id', testId);

      if (error) {
        console.error('Error deleting test progress:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error deleting test progress:', error);
      return false;
    }
  }

  // Calculate time spent on test
  static calculateTimeSpent(startTime: Date): number {
    return Math.floor((new Date().getTime() - startTime.getTime()) / 1000);
  }

  // Private helper to map database result to TestProgress
  private static mapToTestProgress(data: any): TestProgress {
    return {
      id: data.id,
      userEmail: data.user_email,
      testId: data.test_id,
      currentQuestionIndex: data.current_question_index,
      selectedAnswers: data.selected_answers || {},
      startTime: new Date(data.start_time),
      lastUpdated: new Date(data.last_updated),
      isCompleted: data.is_completed,
      timeSpent: data.time_spent,
    };
  }
}
