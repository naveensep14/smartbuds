import { supabase } from './supabase';

export interface Activity {
  id: string;
  type: 'test_completed' | 'account_created' | 'test_started' | 'profile_updated';
  title: string;
  description: string;
  timestamp: Date;
  metadata?: {
    testId?: string;
    testTitle?: string;
    score?: number;
    subject?: string;
    grade?: string;
  };
}

export class ActivityService {
  static async getUserActivities(userId: string, limit: number = 10): Promise<Activity[]> {
    try {
      console.log('ActivityService - Fetching activities for user:', userId);
      // Get test results for the user and convert them to activities
      const { data: results, error } = await supabase
        .from('results')
        .select(`
          id,
          score,
          completedAt,
          testId,
          tests!inner(
            title,
            subject,
            grade
          )
        `)
        .eq('studentName', userId)
        .order('completedAt', { ascending: false })
        .limit(limit);

      console.log('ActivityService - Query result:', { results, error });

      if (error) {
        console.error('Error fetching user activities:', error);
        return [];
      }

      return results.map(result => {
        const testData = Array.isArray(result.tests) ? result.tests[0] : result.tests;
        return {
          id: result.id,
          type: 'test_completed' as Activity['type'],
          title: 'Test Completed',
          description: `Scored ${result.score}% on ${testData?.title || 'Unknown Test'}`,
          timestamp: new Date(result.completedAt),
          metadata: {
            testId: result.testId,
            testTitle: testData?.title || 'Unknown Test',
            score: result.score,
            subject: testData?.subject || 'Unknown',
            grade: testData?.grade || 'Unknown'
          }
        };
      });
    } catch (error) {
      console.error('Error fetching user activities:', error);
      return [];
    }
  }

  static async getRecentActivities(userId: string, limit: number = 5): Promise<Activity[]> {
    return this.getUserActivities(userId, limit);
  }

  static async addActivity(userId: string, activity: Omit<Activity, 'id' | 'timestamp'>): Promise<Activity | null> {
    // Activities are now derived from results, so we don't need to add them separately
    // This method is kept for compatibility but doesn't do anything
    return null;
  }

  static formatActivityTime(timestamp: Date): string {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - timestamp.getTime()) / 1000);
    
    if (diffInSeconds < 60) {
      return 'Just now';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else if (diffInSeconds < 604800) {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days} day${days > 1 ? 's' : ''} ago`;
    } else {
      // Show full date and time for older activities
      return timestamp.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  }

  static getActivityIcon(type: Activity['type']): { icon: string; color: string; bgColor: string } {
    switch (type) {
      case 'test_completed':
        return {
          icon: 'Trophy',
          color: 'text-green-600',
          bgColor: 'bg-green-100'
        };
      case 'test_started':
        return {
          icon: 'BookOpen',
          color: 'text-orange-600',
          bgColor: 'bg-orange-100'
        };
      case 'account_created':
        return {
          icon: 'User',
          color: 'text-blue-600',
          bgColor: 'bg-blue-100'
        };
      case 'profile_updated':
        return {
          icon: 'Settings',
          color: 'text-purple-600',
          bgColor: 'bg-purple-100'
        };
      default:
        return {
          icon: 'Clock',
          color: 'text-gray-600',
          bgColor: 'bg-gray-100'
        };
    }
  }

  // Helper methods are no longer needed since activities are derived from results
}
