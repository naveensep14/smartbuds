import { supabase, isSupabaseConfigured } from './supabase';
import { Test, TestResult } from '@/types';

// Test operations
export const testService = {
  // Get all tests
  getAll: async (): Promise<Test[]> => {
    if (!isSupabaseConfigured) {
      console.warn('Supabase not configured, returning empty array');
      return [];
    }
    
    try {
      const { data, error } = await supabase
        .from('tests')
        .select('*')
        .order('createdat', { ascending: false });

      if (error) throw error;

      return data?.map(test => ({
        id: test.id,
        title: test.title,
        description: test.description,
        subject: test.subject,
        grade: test.grade,
        board: test.board || 'ICSE', // Default to ICSE if not set
        type: test.type || 'coursework', // Default to coursework if not set
        duration: test.timelimit,
        questions: test.questions?.map((q: any) => ({
          id: q.id || Date.now().toString(),
          text: q.question || q.text || '',
          options: q.options || [],
          correctAnswer: q.correctAnswer || 0,
          explanation: q.explanation || '',
          image: q.image || undefined,
        })) || [],
        createdAt: new Date(test.createdat),
        updatedAt: new Date(test.updatedat),
        expiryDate: test.expiry_date ? new Date(test.expiry_date) : undefined,
      })) || [];
    } catch (error) {
      console.error('Error fetching tests:', error);
      return [];
    }
  },

  // Get test by ID
  getById: async (id: string): Promise<Test | null> => {
    try {
      const { data, error } = await supabase
        .from('tests')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      if (!data) return null;

      return {
        id: data.id,
        title: data.title,
        description: data.description,
        subject: data.subject,
        grade: data.grade,
        board: data.board || 'ICSE', // Default to ICSE if not set
        type: data.type || 'coursework', // Default to coursework if not set
        duration: data.timelimit,
        questions: data.questions?.map((q: any) => ({
          id: q.id || Date.now().toString(),
          text: q.question || q.text || '',
          options: q.options || [],
          correctAnswer: q.correctAnswer || 0,
          explanation: q.explanation || '',
          image: q.image || undefined,
        })) || [],
        createdAt: new Date(data.createdat),
        updatedAt: new Date(data.updatedat),
        expiryDate: data.expiry_date ? new Date(data.expiry_date) : undefined,
      };
    } catch (error) {
      console.error('Error fetching test:', error);
      return null;
    }
  },

  // Create new test
  create: async (test: Omit<Test, 'id' | 'createdAt' | 'updatedAt'>): Promise<Test | null> => {
    try {
      const { data, error } = await supabase
        .from('tests')
        .insert({
          title: test.title,
          description: test.description,
          subject: test.subject,
          grade: test.grade,
          board: test.board,
          type: test.type,
          timelimit: test.duration,
          questions: test.questions?.map(q => ({
            id: q.id,
            question: q.text,
            options: q.options,
            correctAnswer: q.correctAnswer,
            explanation: q.explanation,
            image: q.image,
          })),
        })
        .select()
        .single();

      if (error) throw error;

      return {
        id: data.id,
        title: data.title,
        description: data.description,
        subject: data.subject,
        grade: data.grade,
        board: data.board || 'ICSE', // Default to ICSE if not set
        type: data.type || 'coursework', // Default to coursework if not set
        duration: data.timelimit,
        questions: data.questions?.map((q: any) => ({
          id: q.id || Date.now().toString(),
          text: q.question || q.text || '',
          options: q.options || [],
          correctAnswer: q.correctAnswer || 0,
          explanation: q.explanation || '',
          image: q.image || undefined,
        })) || [],
        createdAt: new Date(data.createdat),
        updatedAt: new Date(data.updatedat),
        expiryDate: data.expiry_date ? new Date(data.expiry_date) : undefined,
      };
    } catch (error) {
      console.error('Error creating test:', error);
      return null;
    }
  },

  // Update test
  update: async (id: string, updates: Partial<Test>): Promise<Test | null> => {
    try {
      const { data, error } = await supabase
        .from('tests')
        .update({
          title: updates.title,
          description: updates.description,
          subject: updates.subject,
          grade: updates.grade,
          board: updates.board,
          type: updates.type,
          timelimit: updates.duration,
          questions: updates.questions?.map(q => ({
            id: q.id,
            question: q.text,
            options: q.options,
            correctAnswer: q.correctAnswer,
            explanation: q.explanation,
            image: q.image,
          })),
          updatedat: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return {
        id: data.id,
        title: data.title,
        description: data.description,
        subject: data.subject,
        grade: data.grade,
        board: data.board || 'ICSE', // Default to ICSE if not set
        type: data.type || 'coursework', // Default to coursework if not set
        duration: data.timelimit,
        questions: data.questions?.map((q: any) => ({
          id: q.id || Date.now().toString(),
          text: q.question || q.text || '',
          options: q.options || [],
          correctAnswer: q.correctAnswer || 0,
          explanation: q.explanation || '',
          image: q.image || undefined,
        })) || [],
        createdAt: new Date(data.createdat),
        updatedAt: new Date(data.updatedat),
        expiryDate: data.expiry_date ? new Date(data.expiry_date) : undefined,
      };
    } catch (error) {
      console.error('Error updating test:', error);
      return null;
    }
  },

  // Delete test
  delete: async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('tests')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting test:', error);
      return false;
    }
  },
};

// Results operations
export const resultService = {
  // Get all results
  getAll: async (): Promise<TestResult[]> => {
    try {
      const { data, error } = await supabase
        .from('results')
        .select('*')
        .order('completedAt', { ascending: false });

      if (error) throw error;

      return data?.map(result => ({
        id: result.id,
        testId: result.testId,
        studentName: result.studentName,
        score: result.score,
        totalQuestions: result.totalQuestions,
        correctAnswers: result.correctAnswers,
        timeTaken: result.timeTaken,
        answers: result.answers,
        completedAt: new Date(result.completedAt),
      })) || [];
    } catch (error) {
      console.error('Error fetching results:', error);
      return [];
    }
  },

  // Get results by test ID
  getByTestId: async (testId: string): Promise<TestResult[]> => {
    try {
      const { data, error } = await supabase
        .from('results')
        .select('*')
        .eq('testId', testId)
        .order('completedAt', { ascending: false });

      if (error) throw error;

      return data?.map(result => ({
        id: result.id,
        testId: result.testId,
        studentName: result.studentName,
        score: result.score,
        totalQuestions: result.totalQuestions,
        correctAnswers: result.correctAnswers,
        timeTaken: result.timeTaken,
        answers: result.answers,
        completedAt: new Date(result.completedAt),
      })) || [];
    } catch (error) {
      console.error('Error fetching results by test ID:', error);
      return [];
    }
  },

  // Create new result
  create: async (result: Omit<TestResult, 'id' | 'completedAt'>): Promise<TestResult | null> => {
    try {
      console.log('Database create - Input:', result);
      const { data, error } = await supabase
        .from('results')
        .insert({
          testId: result.testId,
          studentName: result.studentName,
          score: result.score,
          totalQuestions: result.totalQuestions,
          correctAnswers: result.correctAnswers,
          timeTaken: result.timeTaken,
          answers: result.answers,
        })
        .select()
        .single();

      console.log('Database create - Response:', { data, error });
      if (error) throw error;

      return {
        id: data.id,
        testId: data.testId,
        studentName: data.studentName,
        score: data.score,
        totalQuestions: data.totalQuestions,
        correctAnswers: data.correctAnswers,
        timeTaken: data.timeTaken,
        answers: data.answers,
        completedAt: new Date(data.completedAt),
      };
    } catch (error) {
      console.error('Error creating result:', error);
      return null;
    }
  },

  // Get results by student name
  getByStudent: async (studentName: string): Promise<TestResult[]> => {
    try {
      const { data, error } = await supabase
        .from('results')
        .select('*')
        .eq('studentName', studentName)
        .order('completedAt', { ascending: false });

      if (error) throw error;

      return data?.map(result => ({
        id: result.id,
        testId: result.testId,
        studentName: result.studentName,
        score: result.score,
        totalQuestions: result.totalQuestions,
        correctAnswers: result.correctAnswers,
        timeTaken: result.timeTaken,
        answers: result.answers,
        completedAt: new Date(result.completedAt),
      })) || [];
    } catch (error) {
      console.error('Error fetching results by student:', error);
      return [];
    }
  },
}; 