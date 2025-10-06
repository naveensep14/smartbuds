import { supabase } from './supabase';
import { ADMIN_EMAILS } from './admin-config';

export interface LeaderboardEntry {
  rank: number;
  studentName: string;
  displayName: string;
  averageScore: number;
  totalTests: number;
  bestScore: number;
  lastTestDate: string;
}

export class LeaderboardService {
  /**
   * Get top performers from the last 30 days
   */
  static async getTopPerformers(limit: number = 10): Promise<LeaderboardEntry[]> {
    try {
      console.log('LeaderboardService - Fetching top performers for last 30 days');
      
      // Calculate date 30 days ago
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const thirtyDaysAgoISO = thirtyDaysAgo.toISOString();
      
      console.log('LeaderboardService - Date filter:', thirtyDaysAgoISO);
      
      // Get all results from the last 30 days
      const { data: results, error } = await supabase
        .from('results')
        .select('*')
        .gte('completedAt', thirtyDaysAgoISO)
        .order('completedAt', { ascending: false });

      if (error) {
        console.error('Error fetching leaderboard data:', error);
        return [];
      }

      console.log('LeaderboardService - Raw results:', results);

      if (!results || results.length === 0) {
        console.log('LeaderboardService - No results found for last 30 days');
        return [];
      }

      // Filter out admin results
      const nonAdminResults = results.filter(result => {
        const isAdmin = ADMIN_EMAILS.includes(result.studentName.toLowerCase() as any);
        if (isAdmin) {
          console.log('LeaderboardService - Filtering out admin result:', result.studentName);
        }
        return !isAdmin;
      });

      console.log('LeaderboardService - Non-admin results:', nonAdminResults.length, 'out of', results.length);

      if (nonAdminResults.length === 0) {
        console.log('LeaderboardService - No non-admin results found for last 30 days');
        return [];
      }

      // Group results by student and calculate statistics
      const studentStats = new Map<string, {
        scores: number[];
        totalTests: number;
        lastTestDate: string;
        profile: any;
      }>();

      // Get unique student emails for profile lookup
      const studentEmails = Array.from(new Set(nonAdminResults.map(result => result.studentName)));
      
      // Fetch profiles for all students
      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .in('email', studentEmails);
      
      if (profileError) {
        console.log('Profile fetch error (will use email formatting):', profileError.message);
      }
      
      // Create a map of email to profile
      const profileMap = new Map();
      if (profiles) {
        profiles.forEach(profile => {
          profileMap.set(profile.email, profile);
        });
      }

      nonAdminResults.forEach(result => {
        const studentName = result.studentName;
        
        if (!studentStats.has(studentName)) {
          studentStats.set(studentName, {
            scores: [],
            totalTests: 0,
            lastTestDate: result.completedAt,
            profile: profileMap.get(studentName) || null
          });
        }
        
        const stats = studentStats.get(studentName)!;
        stats.scores.push(result.score);
        stats.totalTests++;
        
        // Keep track of the most recent test date
        if (new Date(result.completedAt) > new Date(stats.lastTestDate)) {
          stats.lastTestDate = result.completedAt;
        }
      });

      // Calculate averages and create leaderboard entries
      const leaderboardEntries: LeaderboardEntry[] = Array.from(studentStats.entries())
        .map(([studentName, stats]) => {
          const averageScore = Math.round(
            stats.scores.reduce((sum, score) => sum + score, 0) / stats.scores.length
          );
          const bestScore = Math.max(...stats.scores);
          
          return {
            rank: 0, // Will be set after sorting
            studentName,
            displayName: this.getDisplayName(stats.profile, studentName),
            averageScore,
            totalTests: stats.totalTests,
            bestScore,
            lastTestDate: stats.lastTestDate
          };
        })
        .sort((a, b) => {
          // Sort by average score (descending), then by total tests (descending), then by best score (descending)
          if (a.averageScore !== b.averageScore) {
            return b.averageScore - a.averageScore;
          }
          if (a.totalTests !== b.totalTests) {
            return b.totalTests - a.totalTests;
          }
          return b.bestScore - a.bestScore;
        })
        .slice(0, limit)
        .map((entry, index) => ({
          ...entry,
          rank: index + 1
        }));

      console.log('LeaderboardService - Processed leaderboard:', leaderboardEntries);
      return leaderboardEntries;

    } catch (error) {
      console.error('Error in LeaderboardService.getTopPerformers:', error);
      return [];
    }
  }

  /**
   * Get a user's rank in the leaderboard
   */
  static async getUserRank(userEmail: string): Promise<number | null> {
    try {
      const leaderboard = await this.getTopPerformers(100); // Get more entries to find user's rank
      const userEntry = leaderboard.find(entry => entry.studentName === userEmail);
      return userEntry ? userEntry.rank : null;
    } catch (error) {
      console.error('Error getting user rank:', error);
      return null;
    }
  }

  /**
   * Format date for display
   */
  static formatDate(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays}d ago`;
    }
  }

  /**
   * Get display name from profile or fallback to email formatting
   */
  static getDisplayName(profile: any, email: string): string {
    // Try to get real name from profile
    if (profile) {
      if (profile.full_name) {
        return profile.full_name;
      }
      if (profile.first_name && profile.last_name) {
        return `${profile.first_name} ${profile.last_name}`;
      }
      if (profile.first_name) {
        return profile.first_name;
      }
    }
    
    // Fallback to email formatting
    return this.formatDisplayName(email);
  }

  /**
   * Format display name from email
   */
  static formatDisplayName(email: string): string {
    // Extract username part before @
    const username = email.split('@')[0];
    
    // Handle common patterns
    if (username.includes('.')) {
      // Split by dots and capitalize each part
      return username.split('.').map(part => 
        part.charAt(0).toUpperCase() + part.slice(1).toLowerCase()
      ).join(' ');
    }
    
    // Handle underscores
    if (username.includes('_')) {
      return username.split('_').map(part => 
        part.charAt(0).toUpperCase() + part.slice(1).toLowerCase()
      ).join(' ');
    }
    
    // Handle camelCase
    if (username.match(/[a-z][A-Z]/)) {
      return username.replace(/([a-z])([A-Z])/g, '$1 $2')
        .split(' ')
        .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
        .join(' ');
    }
    
    // Default: capitalize first letter
    return username.charAt(0).toUpperCase() + username.slice(1).toLowerCase();
  }

  /**
   * Get rank icon/emoji based on position
   */
  static getRankIcon(rank: number): string {
    switch (rank) {
      case 1:
        return '🥇';
      case 2:
        return '🥈';
      case 3:
        return '🥉';
      default:
        return `#${rank}`;
    }
  }
}
