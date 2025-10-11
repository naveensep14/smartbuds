'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Medal, Award, Clock } from 'lucide-react';
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
        return <Trophy className="w-5 h-5 text-yellow-500" />;
      case 2:
        return <Medal className="w-5 h-5 text-gray-400" />;
      case 3:
        return <Award className="w-5 h-5 text-amber-600" />;
      default:
        return <span className="text-lg font-bold text-gray-600">#{rank}</span>;
    }
  };

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-200';
      case 2:
        return 'bg-gradient-to-r from-gray-50 to-gray-100 border-gray-200';
      case 3:
        return 'bg-gradient-to-r from-amber-50 to-amber-100 border-amber-200';
      default:
        return 'bg-white border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="flex items-center space-x-3 mb-6">
          <Trophy className="w-6 h-6 text-orange-600" />
          <h2 className="text-2xl font-bold text-gray-900">Top Performers</h2>
          <span className="text-sm text-gray-500 bg-orange-100 px-2 py-1 rounded-full">
            Last 30 days
          </span>
        </div>
        <div className="space-y-3">
          {[...Array(5)].map((_, index) => (
            <div key={index} className="animate-pulse">
              <div className="flex items-center space-x-4 p-4 rounded-lg bg-gray-50">
                <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                </div>
                <div className="w-16 h-6 bg-gray-300 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="flex items-center space-x-3 mb-6">
          <Trophy className="w-6 h-6 text-orange-600" />
          <h2 className="text-2xl font-bold text-gray-900">Top Performers</h2>
        </div>
        <div className="text-center py-8">
          <div className="text-red-500 mb-2">⚠️</div>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  if (leaderboard.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="flex items-center space-x-3 mb-6">
          <Trophy className="w-6 h-6 text-orange-600" />
          <h2 className="text-2xl font-bold text-gray-900">Top Performers</h2>
          <span className="text-sm text-gray-500 bg-orange-100 px-2 py-1 rounded-full">
            Last 30 days
          </span>
        </div>
        <div className="text-center py-8">
          <Trophy className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Activity Yet</h3>
          <p className="text-gray-600 mb-4">
            Be the first to take a test and appear on the leaderboard!
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="inline-flex items-center space-x-2 bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors"
          >
            <Trophy className="w-4 h-4" />
            <span>Start Learning</span>
          </motion.button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <div className="flex items-center space-x-3 mb-6">
        <Trophy className="w-6 h-6 text-orange-600" />
        <h2 className="text-2xl font-bold text-gray-900">Top Performers</h2>
        <span className="text-sm text-gray-500 bg-orange-100 px-2 py-1 rounded-full">
          Last 30 days
        </span>
      </div>

      <div className="space-y-3">
        {leaderboard.map((entry, index) => (
          <motion.div
            key={entry.studentName}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className={`flex items-center space-x-4 p-4 rounded-lg border ${getRankColor(entry.rank)} hover:shadow-md transition-shadow`}
          >
            {/* Rank */}
            <div className="flex items-center justify-center w-8 h-8">
              {getRankIcon(entry.rank)}
            </div>

            {/* Student Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2">
                <h3 className="text-lg font-semibold text-gray-900 truncate">
                  {entry.displayName}
                </h3>
                {entry.rank <= 3 && (
                  <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded-full">
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
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                    {entry.grade} {entry.board}
                  </span>
                )}
                <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
                  Best: {entry.bestScore}%
                </span>
              </div>
            </div>

            {/* Scores */}
            <div className="text-right">
              <div className="text-3xl font-bold text-gray-900">
                {entry.averageScore}%
              </div>
              <div className="text-sm text-gray-500 font-medium">
                Average
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Footer */}
      {leaderboard.length >= limit && (
        <div className="mt-6 pt-4 border-t border-gray-200 text-center">
          <p className="text-sm text-gray-500">
            Showing top {leaderboard.length} performers from the last 30 days
          </p>
        </div>
      )}
    </div>
  );
}
