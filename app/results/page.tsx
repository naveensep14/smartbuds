'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, BarChart3, TrendingUp, Users, Calendar, Filter, Download, Eye } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { TestResult, Test } from '@/types';

// Sample test results data
const sampleResults: TestResult[] = [
  {
    id: '1',
    testId: '1',
    user_id: 'sample-user-1',
    studentName: 'Alice Johnson',
    score: 85,
    totalQuestions: 5,
    correctAnswers: 4,
    timeTaken: 1200, // 20 minutes in seconds
    answers: [
      { questionId: '1', selectedAnswer: 1, isCorrect: true },
      { questionId: '2', selectedAnswer: 1, isCorrect: true },
      { questionId: '3', selectedAnswer: 2, isCorrect: true },
      { questionId: '4', selectedAnswer: 0, isCorrect: true },
      { questionId: '5', selectedAnswer: 1, isCorrect: false },
    ],
    completedAt: new Date('2025-01-20T10:30:00'),
  },
  {
    id: '2',
    testId: '1',
    user_id: 'sample-user-2',
    studentName: 'Bob Smith',
    score: 60,
    totalQuestions: 5,
    correctAnswers: 3,
    timeTaken: 1800, // 30 minutes in seconds
    answers: [
      { questionId: '1', selectedAnswer: 1, isCorrect: true },
      { questionId: '2', selectedAnswer: 0, isCorrect: false },
      { questionId: '3', selectedAnswer: 2, isCorrect: true },
      { questionId: '4', selectedAnswer: 1, isCorrect: false },
      { questionId: '5', selectedAnswer: 2, isCorrect: true },
    ],
    completedAt: new Date('2025-01-20T11:15:00'),
  },
  {
    id: '3',
    testId: '2',
    user_id: 'sample-user-3',
    studentName: 'Charlie Brown',
    score: 100,
    totalQuestions: 1,
    correctAnswers: 1,
    timeTaken: 300, // 5 minutes in seconds
    answers: [
      { questionId: '1', selectedAnswer: 2, isCorrect: true },
    ],
    completedAt: new Date('2025-01-21T09:45:00'),
  },
];

const sampleTests: Test[] = [
  {
    id: '1',
    title: 'ICSE 3rd Grade Science - August 2025',
    subject: 'Science',
    grade: '3rd Grade',
    board: 'ICSE',
    type: 'coursework',
    duration: 30,
    questions: [],
    description: '',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '2',
    title: 'ICSE 3rd Grade Mathematics - August 2025',
    subject: 'Mathematics',
    grade: '3rd Grade',
    board: 'ICSE',
    type: 'coursework',
    duration: 45,
    questions: [],
    description: '',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

export default function ResultsPage() {
  const [results, setResults] = useState<TestResult[]>(sampleResults);
  const [selectedTest, setSelectedTest] = useState('');
  const [selectedGrade, setSelectedGrade] = useState('');
  const [dateRange, setDateRange] = useState('all');

  const filteredResults = results.filter(result => {
    const test = sampleTests.find(t => t.id === result.testId);
    const matchesTest = !selectedTest || result.testId === selectedTest;
    const matchesGrade = !selectedGrade || test?.grade === selectedGrade;
    const matchesDate = dateRange === 'all' || 
      (dateRange === 'today' && result.completedAt.toDateString() === new Date().toDateString()) ||
      (dateRange === 'week' && result.completedAt > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000));
    
    return matchesTest && matchesGrade && matchesDate;
  });

  const stats = {
    totalResults: filteredResults.length,
    averageScore: filteredResults.length > 0 
      ? Math.round(filteredResults.reduce((sum, r) => sum + r.score, 0) / filteredResults.length)
      : 0,
    totalStudents: new Set(filteredResults.map(r => r.studentName)).size,
    totalTestsTaken: filteredResults.length,
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-success-600 bg-success-100';
    if (score >= 60) return 'text-warning-600 bg-warning-100';
    return 'text-red-600 bg-red-100';
  };

  const getScoreEmoji = (score: number) => {
    if (score >= 80) return '🎉';
    if (score >= 60) return '👍';
    return '📚';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
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
                />
                <h1 className="text-2xl font-bold text-gradient">SuccessBuds</h1>
              </Link>
            </div>
            <nav className="hidden md:flex space-x-8">
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gradient mb-4">Test Results & Analytics</h1>
          <p className="text-xl text-gray-600">Track student performance and learning progress</p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <motion.div
            className="card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <div className="flex items-center">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Total Results</p>
                <p className="text-2xl font-bold text-gray-800">{stats.totalResults}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            className="card"
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
            className="card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <div className="flex items-center">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Active Students</p>
                <p className="text-2xl font-bold text-gray-800">{stats.totalStudents}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            className="card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <div className="flex items-center">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Tests Taken</p>
                <p className="text-2xl font-bold text-gray-800">{stats.totalTestsTaken}</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <Filter className="w-5 h-5 text-gray-600" />
            <h3 className="text-lg font-semibold text-gray-800">Filter Results</h3>
          </div>
          <div className="grid md:grid-cols-4 gap-4">
            <select
              value={selectedTest}
              onChange={(e) => setSelectedTest(e.target.value)}
              className="px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="">All Tests</option>
              {sampleTests.map(test => (
                <option key={test.id} value={test.id}>{test.title}</option>
              ))}
            </select>
            <select
              value={selectedGrade}
              onChange={(e) => setSelectedGrade(e.target.value)}
              className="px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="">All Grades</option>
              <option value="3rd Grade">3rd Grade</option>
              <option value="4th Grade">4th Grade</option>
              <option value="5th Grade">5th Grade</option>
            </select>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
            </select>
            <button
              onClick={() => {
                setSelectedTest('');
                setSelectedGrade('');
                setDateRange('all');
              }}
              className="px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        </div>

        {/* Results Table */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-800">Test Results</h2>
              <button className="btn-secondary flex items-center space-x-2">
                <Download className="w-5 h-5" />
                <span>Export Results</span>
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Student
                  </th>
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
                  const test = sampleTests.find(t => t.id === result.testId);
                  return (
                    <motion.tr
                      key={result.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: index * 0.1 }}
                      className="hover:bg-gray-50"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                            <span className="text-sm font-medium text-primary-600">
                              {(result.studentName || 'Anonymous').charAt(0)}
                            </span>
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-medium text-gray-900">{result.studentName || 'Anonymous'}</div>
                          </div>
                        </div>
                      </td>
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
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button className="text-primary-600 hover:text-primary-900">
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Performance Insights */}
        <div className="mt-8 grid md:grid-cols-2 gap-6">
          <motion.div
            className="card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Performance Insights</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Average Score</span>
                <span className="font-semibold text-gray-800">{stats.averageScore}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Highest Score</span>
                <span className="font-semibold text-success-600">
                  {Math.max(...filteredResults.map(r => r.score))}%
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Lowest Score</span>
                <span className="font-semibold text-red-600">
                  {Math.min(...filteredResults.map(r => r.score))}%
                </span>
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
            className="card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <Link href="/admin" className="btn-primary w-full flex items-center justify-center space-x-2">
                <BarChart3 className="w-5 h-5" />
                <span>View Analytics</span>
              </Link>
              <Link href="/tests" className="btn-secondary w-full flex items-center justify-center space-x-2">
                <BookOpen className="w-5 h-5" />
                <span>Browse Tests</span>
              </Link>
              <button className="btn-success w-full flex items-center justify-center space-x-2">
                <Download className="w-5 h-5" />
                <span>Export Data</span>
              </button>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
} 