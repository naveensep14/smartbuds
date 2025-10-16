'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Medal, Award, Clock, Star, TrendingUp } from 'lucide-react';
import { LeaderboardService, LeaderboardEntry } from '@/lib/leaderboard';

interface LeaderboardProps {
  limit?: number;
}

export default function Leaderboard({ limit = 10 }: LeaderboardProps) {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadLeaderboard = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log('Leaderboard component - Loading data');
        const data = await LeaderboardService.getTopPerformers(limit);
        console.log('Leaderboard component - Loaded data:', data);
        setLeaderboard(data);
      } catch (err) {
        console.error('Error loading leaderboard:', err);
        setError('Failed to load leaderboard');
      } finally {
        setLoading(false);
      }
    };

    loadLeaderboard();
  }, [limit]);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-6 h-6 text-yellow" />;
      case 2:
        return <Medal className="w-6 h-6 text-gray-400" />;
      case 3:
        return <Award className="w-6 h-6 text-warning-500" />;
      default:
        return <span className="text-lg font-bold text-gray-600">#{rank}</span>;
    }
  };

  const getRankBadgeColor = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-yellow text-white';
      case 2:
        return 'bg-gray-400 text-white';
      case 3:
        return 'bg-warning-500 text-white';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-navy to-primary-600 px-6 py-4">
          <div className="flex items-center space-x-3">
            <Trophy className="w-6 h-6 text-white" />
            <h2 className="text-xl font-bold text-white">Top Performers</h2>
            <div className="bg-white bg-opacity-20 px-3 py-1 rounded-full">
              <span className="text-sm text-white font-medium">Last 30 days</span>
            </div>
          </div>
        </div>
        
        <div className="p-6">
          <div className="space-y-4">
            {[...Array(5)].map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-center space-x-4">
                    <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-300 rounded w-32"></div>
                      <div className="h-3 bg-gray-300 rounded w-24"></div>
                    </div>
                  </div>
                  <div className="text-right space-y-2">
                    <div className="h-6 bg-gray-300 rounded w-16"></div>
                    <div className="h-3 bg-gray-300 rounded w-12"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-navy to-primary-600 px-6 py-4">
          <div className="flex items-center space-x-3">
            <Trophy className="w-6 h-6 text-white" />
            <h2 className="text-xl font-bold text-white">Top Performers</h2>
          </div>
        </div>
        <div className="p-6 text-center">
          <div className="text-red-500 mb-4">
            <TrendingUp className="w-12 h-12 mx-auto" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Unable to Load Leaderboard</h3>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  if (leaderboard.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-navy to-primary-600 px-6 py-4">
          <div className="flex items-center space-x-3">
            <Trophy className="w-6 h-6 text-white" />
            <h2 className="text-xl font-bold text-white">Top Performers</h2>
            <div className="bg-white bg-opacity-20 px-3 py-1 rounded-full">
              <span className="text-sm text-white font-medium">Last 30 days</span>
            </div>
          </div>
        </div>
        
        <div className="p-8 text-center">
          <Trophy className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Activity Yet</h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            Be the first to take a test and appear on the leaderboard!
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="inline-flex items-center space-x-2 bg-navy text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors font-semibold shadow-lg"
          >
            <Trophy className="w-5 h-5" />
            <span>Start Learning</span>
          </motion.button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-navy to-primary-600 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Trophy className="w-6 h-6 text-white" />
            <h2 className="text-xl font-bold text-white">Top Performers</h2>
          </div>
          <div className="flex items-center space-x-2">
            <div className="bg-white bg-opacity-20 px-3 py-1 rounded-full">
              <span className="text-sm text-white font-medium">Last 30 days</span>
            </div>
            <div className="bg-success-500 bg-opacity-20 px-3 py-1 rounded-full">
              <span className="text-sm text-white font-medium">50%+ average</span>
            </div>
          </div>
        </div>
      </div>

      {/* Leaderboard Content */}
      <div className="p-6">
        <div className="space-y-3">
          {leaderboard.map((entry, index) => (
            <motion.div
              key={entry.studentName}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className={`flex items-center justify-between p-4 rounded-lg border transition-all hover:shadow-md ${
                entry.rank <= 3 
                  ? 'bg-gradient-to-r from-gray-50 to-gray-100 border-gray-300' 
                  : 'bg-white border-gray-200 hover:border-gray-300'
              }`}
            >
              {/* Left Section - Rank & Student Info */}
              <div className="flex items-center space-x-4 flex-1 min-w-0">
                {/* Rank */}
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-100">
                  {getRankIcon(entry.rank)}
                </div>

                {/* Student Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <h3 className="text-lg font-semibold text-gray-900 truncate">
                      {entry.displayName}
                    </h3>
                    {entry.rank <= 3 && (
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${getRankBadgeColor(entry.rank)}`}>
                        Top {entry.rank}
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <span className="flex items-center space-x-1">
                      <Clock className="w-3 h-3" />
                      <span>{LeaderboardService.formatDate(entry.lastTestDate)}</span>
                    </span>
                    {entry.grade && entry.board && (
                      <span className="text-xs bg-accent-100 text-accent-700 px-2 py-1 rounded-full font-medium">
                        {entry.grade} {entry.board}
                      </span>
                    )}
                    <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full font-medium">
                      Best: {entry.bestScore}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Right Section - Score */}
              <div className="text-right">
                <div className="text-3xl font-bold text-gray-900 mb-1">
                  {entry.averageScore}%
                </div>
                <div className="text-sm text-gray-500 font-medium">
                  Average Score
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Footer */}
        {leaderboard.length >= limit && (
          <div className="mt-6 pt-4 border-t border-gray-200 text-center">
            <p className="text-sm text-gray-500">
              Showing top {leaderboard.length} performers (50%+ average) from the last 30 days
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
