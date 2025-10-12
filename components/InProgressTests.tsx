'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock, PlayCircle, Trash2, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { TestProgressService, TestProgress } from '@/lib/test-progress';
import { testService } from '@/lib/database';
import { Test } from '@/types';
import { useAuth } from '@/lib/auth';

interface InProgressTestWithDetails extends TestProgress {
  test?: Test;
}

export default function InProgressTests() {
  const { user } = useAuth();
  const [inProgressTests, setInProgressTests] = useState<InProgressTestWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadInProgressTests();
  }, [user]);

  const loadInProgressTests = async () => {
    if (!user?.email) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const progressList = await TestProgressService.getIncompleteTests(user.email);
      
      // Load test details for each progress record
      const testsWithDetails = await Promise.all(
        progressList.map(async (progress) => {
          try {
            const test = await testService.getById(progress.testId);
            return { ...progress, test };
          } catch (err) {
            console.error('Error loading test details:', err);
            return progress;
          }
        })
      );

      setInProgressTests(testsWithDetails);
    } catch (err) {
      console.error('Error loading in-progress tests:', err);
      setError('Failed to load in-progress tests');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (userEmail: string, testId: string) => {
    if (!confirm('Are you sure you want to delete this progress? You will start from the beginning next time.')) {
      return;
    }

    try {
      await TestProgressService.deleteProgress(userEmail, testId);
      await loadInProgressTests();
    } catch (err) {
      console.error('Error deleting progress:', err);
      alert('Failed to delete progress');
    }
  };

  const formatTimeAgo = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    
    if (seconds < 60) return 'Just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  const formatTimeSpent = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Continue Learning</h2>
        <div className="animate-pulse space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-gray-200 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center space-x-3 text-red-600">
          <AlertCircle className="w-5 h-5" />
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (inProgressTests.length === 0) {
    return null; // Don't show anything if no in-progress tests
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center space-x-2">
        <Clock className="w-6 h-6 text-orange-600" />
        <span>Continue Learning</span>
      </h2>
      <div className="space-y-3">
        {inProgressTests.map((progress, index) => {
          const test = progress.test;
          const percentComplete = test
            ? Math.round((Object.keys(progress.selectedAnswers).length / test.questions.length) * 100)
            : 0;

          return (
            <motion.div
              key={progress.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="border border-gray-200 rounded-lg p-4 hover:border-orange-300 hover:shadow-md transition-all"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 mb-1 truncate">
                    {test?.title || 'Loading...'}
                  </h3>
                  <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                    {test && (
                      <>
                        <span className="px-2 py-0.5 bg-orange-100 text-orange-700 rounded text-xs font-medium">
                          {test.subject}
                        </span>
                        <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                          {test.grade}
                        </span>
                      </>
                    )}
                    <span className="flex items-center space-x-1">
                      <Clock className="w-3 h-3" />
                      <span>{formatTimeAgo(progress.lastUpdated)}</span>
                    </span>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs text-gray-600">
                      <span>Progress: {Object.keys(progress.selectedAnswers).length}/{test?.questions.length || 0} questions</span>
                      <span className="font-medium text-orange-600">{percentComplete}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-orange-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${percentComplete}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-2 ml-4">
                  <Link
                    href={`/tests/${progress.testId}`}
                    className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors flex items-center space-x-2 text-sm font-medium"
                  >
                    <PlayCircle className="w-4 h-4" />
                    <span>Resume</span>
                  </Link>
                  <button
                    onClick={() => handleDelete(progress.userEmail, progress.testId)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete progress"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

