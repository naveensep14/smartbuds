'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, BarChart3, TrendingUp, Calendar, Filter, Eye, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { TestResult, Test } from '@/types';
import { supabase } from '@/lib/supabase';
import TestReview from '@/components/TestReview';
import { normalizeGrade } from '@/lib/grade-utils';


export default function MyResultsPage() {
  const [results, setResults] = useState<TestResult[]>([]);
  const [tests, setTests] = useState<Test[]>([]);
  const [selectedTest, setSelectedTest] = useState('');
  const [dateRange, setDateRange] = useState('all');
  const [loading, setLoading] = useState(true);
  const [reviewingResult, setReviewingResult] = useState<{ test: Test; result: TestResult } | null>(null);
  const [userProfile, setUserProfile] = useState<{student_name: string, grade: string, board: string} | null>(null);
  const { user, loading: authLoading, isAdmin } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  // Load user profile for non-admin users
  useEffect(() => {
    const loadUserProfile = async () => {
      if (user && !isAdmin) {
        try {
          const { data, error } = await supabase
            .from('profiles')
            .select('student_name, grade, board')
            .eq('id', user.id)
            .single();

          if (error) {
            console.error('Error loading user profile:', error);
            return;
          }

          // Normalize grade value
          const normalizedData = {
            ...data,
            grade: data.grade ? normalizeGrade(data.grade) || data.grade : data.grade
          };
          setUserProfile(normalizedData);
        } catch (error) {
          console.error('Error loading user profile:', error);
        }
      }
    };

    loadUserProfile();
  }, [user, isAdmin]);

  // Load user's test results and available tests
  useEffect(() => {
    const loadData = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        
        // Load user's test results
        console.log('MyResults - Loading results for user:', user.email);
        const { data: resultsData, error: resultsError } = await supabase
          .from('results')
          .select(`
            id,
            testId,
            user_id,
            studentName,
            score,
            totalQuestions,
            correctAnswers,
            timeTaken,
            answers,
            completedAt
          `)
          .eq('user_id', user.id)
          .order('completedAt', { ascending: false });

        if (resultsError) {
          console.error('Error loading results:', resultsError);
        } else {
          console.log('MyResults - Raw results data:', resultsData);
          const formattedResults: TestResult[] = resultsData.map(result => ({
            id: result.id,
            testId: result.testId,
            user_id: result.user_id,
            studentName: result.studentName,
            score: result.score,
            totalQuestions: result.totalQuestions,
            correctAnswers: result.correctAnswers,
            timeTaken: result.timeTaken || 0,
            answers: result.answers || [],
            completedAt: new Date(result.completedAt)
          }));
          console.log('MyResults - Formatted results:', formattedResults);
          setResults(formattedResults);
        }

        // Load available tests (filtered by user's grade for non-admin users)
        let testsQuery = supabase
          .from('tests')
          .select('*')
          .order('title');

        // For non-admin users, only show tests matching their grade and board
        if (!isAdmin && userProfile) {
          testsQuery = testsQuery
            .eq('grade', userProfile.grade)
            .eq('board', userProfile.board);
        }

        const { data: testsData, error: testsError } = await testsQuery;

        if (testsError) {
          console.error('Error loading tests:', testsError);
        } else {
          const formattedTests: Test[] = testsData.map(test => ({
            id: test.id,
            title: test.title,
            description: test.description || '',
            subject: test.subject,
            grade: test.grade,
            board: (test as any).board || 'ICSE', // Default value if board field doesn't exist
            type: (test as any).type || 'coursework', // Default to coursework
            duration: test.duration,
            questions: test.questions || [],
            createdAt: new Date(test.created_at),
            updatedAt: new Date(test.updated_at)
          }));
          setTests(formattedTests);
        }
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user, isAdmin, userProfile]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-cream flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-navy mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const filteredResults = results.filter(result => {
    const matchesTest = !selectedTest || result.testId === selectedTest;
    const matchesDate = dateRange === 'all' || 
      (dateRange === 'today' && result.completedAt.toDateString() === new Date().toDateString()) ||
      (dateRange === 'week' && result.completedAt > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000));
    
    return matchesTest && matchesDate;
  });

  const stats = {
    totalResults: filteredResults.length,
    averageScore: filteredResults.length > 0 
      ? Math.round(filteredResults.reduce((sum, r) => sum + r.score, 0) / filteredResults.length)
      : 0,
    totalTestsTaken: filteredResults.length,
    bestScore: filteredResults.length > 0 ? Math.max(...filteredResults.map(r => r.score)) : 0,
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getScoreEmoji = (score: number) => {
    if (score >= 80) return '🎉';
    if (score >= 60) return '👍';
    return '📚';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-cream">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <Link href="/" className="flex items-center space-x-3">
                <Image
                  src="https://i.ibb.co/6RcwZjJr/logo-square.jpg"
                  alt="SuccessBuds Logo"
                  width={48}
                  height={48}
                  className="rounded-lg object-cover"
                  unoptimized
                />
                <h1 className="text-2xl font-bold text-gradient">SuccessBuds</h1>
              </Link>
            </div>
            <nav className="hidden md:flex space-x-8">
              <Link href="/tests" className="text-gray-600 hover:text-yellow transition-colors">
                Take Tests
              </Link>
              <Link href="/dashboard" className="text-gray-600 hover:text-yellow transition-colors">
                Dashboard
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <div className="mb-6">
          <Link 
            href="/dashboard" 
            className="inline-flex items-center space-x-2 text-gray-600 hover:text-yellow transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Dashboard</span>
          </Link>
        </div>

        {/* Page Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gradient mb-4">My Test Results</h1>
          <p className="text-xl text-gray-600">Track your progress and performance</p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <motion.div
            className="bg-white rounded-xl shadow-lg p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <div className="flex items-center">
              <div className="w-12 h-12 bg-yellow rounded-lg flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Tests Taken</p>
                <p className="text-2xl font-bold text-gray-800">{stats.totalTestsTaken}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            className="bg-white rounded-xl shadow-lg p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Average Score</p>
                <p className="text-2xl font-bold text-gray-800">{stats.averageScore}%</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            className="bg-white rounded-xl shadow-lg p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <div className="flex items-center">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Best Score</p>
                <p className="text-2xl font-bold text-gray-800">{stats.bestScore}%</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            className="bg-white rounded-xl shadow-lg p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Total Results</p>
                <p className="text-2xl font-bold text-gray-800">{stats.totalResults}</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <Filter className="w-5 h-5 text-gray-600" />
            <h3 className="text-lg font-semibold text-gray-800">Filter My Results</h3>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            <select
              value={selectedTest}
              onChange={(e) => setSelectedTest(e.target.value)}
              className="px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-navy focus:border-transparent"
            >
              <option value="">All Tests</option>
              {tests.map(test => (
                <option key={test.id} value={test.id}>{test.title}</option>
              ))}
            </select>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-navy focus:border-transparent"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
            </select>
            <button
              onClick={() => {
                setSelectedTest('');
                setDateRange('all');
              }}
              className="px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        </div>

        {/* Results Table */}
        {filteredResults.length > 0 ? (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="text-xl font-semibold text-gray-800">My Test Results</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Test
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Score
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Time Taken
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Completed
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredResults.map((result, index) => {
                    const test = tests.find(t => t.id === result.testId);
                    return (
                      <motion.tr
                        key={result.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: index * 0.1 }}
                        className="hover:bg-gray-50"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{test?.title}</div>
                            <div className="text-sm text-gray-500">{test?.subject} • {test?.grade}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <span className="text-2xl mr-2">{getScoreEmoji(result.score)}</span>
                            <span className={`px-2 py-1 rounded-full text-sm font-medium ${getScoreColor(result.score)}`}>
                              {result.score}%
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatTime(result.timeTaken)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {result.completedAt.toLocaleDateString()} {result.completedAt.toLocaleTimeString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <button
                            onClick={() => setReviewingResult({ test: test!, result })}
                            className="flex items-center space-x-2 px-3 py-2 bg-navy text-white rounded-lg hover:bg-primary-700 transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                            <span>Review</span>
                          </button>
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <motion.div
            className="bg-white rounded-xl shadow-lg p-12 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <BookOpen className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No Results Yet</h3>
            <p className="text-gray-600 mb-6">You haven&apos;t taken any tests yet. Start your learning journey!</p>
            <Link 
              href="/tests" 
              className="inline-flex items-center space-x-2 bg-navy text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors"
            >
              <BookOpen className="w-5 h-5" />
              <span>Take Your First Test</span>
            </Link>
          </motion.div>
        )}

        {/* Performance Insights */}
        {filteredResults.length > 0 && (
          <div className="mt-8 grid md:grid-cols-2 gap-6">
            <motion.div
              className="bg-white rounded-xl shadow-lg p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Your Performance</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Average Score</span>
                  <span className="font-semibold text-gray-800">{stats.averageScore}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Best Score</span>
                  <span className="font-semibold text-green-600">{stats.bestScore}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Tests Taken</span>
                  <span className="font-semibold text-gray-800">{stats.totalTestsTaken}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Average Time</span>
                  <span className="font-semibold text-gray-800">
                    {formatTime(Math.round(filteredResults.reduce((sum, r) => sum + r.timeTaken, 0) / filteredResults.length))}
                  </span>
                </div>
              </div>
            </motion.div>

            <motion.div
              className="bg-white rounded-xl shadow-lg p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Link href="/tests" className="w-full flex items-center justify-center space-x-2 bg-navy text-white px-4 py-3 rounded-lg hover:bg-primary-700 transition-colors">
                  <BookOpen className="w-5 h-5" />
                  <span>Take More Tests</span>
                </Link>
                <Link href="/dashboard" className="w-full flex items-center justify-center space-x-2 bg-gray-100 text-gray-700 px-4 py-3 rounded-lg hover:bg-gray-200 transition-colors">
                  <ArrowLeft className="w-5 h-5" />
                  <span>Back to Dashboard</span>
                </Link>
              </div>
            </motion.div>
          </div>
        )}
      </main>

      {/* Test Review Modal */}
      {reviewingResult && (
        <TestReview
          test={reviewingResult.test}
          testResult={reviewingResult.result}
          onClose={() => setReviewingResult(null)}
        />
      )}
    </div>
  );
}
