'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Clock, Users, Play, Search, Filter, Printer, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { Test } from '@/types';
import { testService } from '@/lib/database';
import { useAuth } from '@/lib/auth';
import PrintableTest from '@/components/PrintableTest';
import { supabase } from '@/lib/supabase';
import { TestProgressService } from '@/lib/test-progress';
import NavigationHeader from '@/components/NavigationHeader';
import { normalizeGrade } from '@/lib/grade-utils';
import InProgressTests from '@/components/InProgressTests';

export default function TestsPage() {
  const [tests, setTests] = useState<Test[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedGrade, setSelectedGrade] = useState('');
  const [selectedBoard, setSelectedBoard] = useState('');
  const [selectedChapter, setSelectedChapter] = useState('');
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [selectedTestForPrint, setSelectedTestForPrint] = useState<Test | null>(null);
  const [printMode, setPrintMode] = useState<'test' | 'answer-key'>('test');
  const [completedTestIds, setCompletedTestIds] = useState<Set<string>>(new Set());
  const [incompleteTestIds, setIncompleteTestIds] = useState<Set<string>>(new Set());
  const [userProfile, setUserProfile] = useState<{student_name: string, grade: string, board: string} | null>(null);
  const { user, loading, isAdmin } = useAuth();

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
          // Set default filters based on user profile
          if (normalizedData) {
            setSelectedGrade(normalizedData.grade);
            setSelectedBoard(normalizedData.board);
          }
        } catch (error) {
          console.error('Error loading user profile:', error);
        }
      }
    };

    loadUserProfile();
  }, [user, isAdmin]);

  // Load tests from database on component mount
  useEffect(() => {
    const loadTests = async () => {
      const fetchedTests = await testService.getAll();
      setTests(fetchedTests);
    };
    loadTests();
  }, []);

  // Load completed tests for the current user
  useEffect(() => {
    const loadCompletedTests = async () => {
      if (!user?.email) return;
      
      try {
        // Load completed tests
        const { data: results, error } = await supabase
          .from('results')
          .select('testId')
          .eq('studentName', user.email);
        
        if (error) {
          console.error('Error loading completed tests:', error);
          return;
        }
        
        const completedIds = new Set(results.map(result => result.testId));
        setCompletedTestIds(completedIds);
        
        // Load incomplete tests
        const incompleteTests = await TestProgressService.getIncompleteTests(user.email);
        const incompleteIds = new Set(incompleteTests.map(progress => progress.testId));
        setIncompleteTestIds(incompleteIds);
        
      } catch (error) {
        console.error('Error loading test status:', error);
      }
    };
    
    loadCompletedTests();
  }, [user]);

  // Function to extract chapter from test title
  const extractChapter = (title: string): string | null => {
    const chapterMatch = title.match(/Chapter (\d+)/);
    return chapterMatch ? `Chapter ${chapterMatch[1]}` : null;
  };

  const filteredTests = tests.filter(test => {
    const matchesSearch = test.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         test.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSubject = !selectedSubject || test.subject === selectedSubject;
    const matchesGrade = !selectedGrade || test.grade === selectedGrade;
    const matchesBoard = !selectedBoard || test.board === selectedBoard;
    const matchesChapter = !selectedChapter || extractChapter(test.title) === selectedChapter;
    
    // For non-admin users, only show tests matching their grade and board
    if (!isAdmin && userProfile) {
      const matchesUserGrade = test.grade === userProfile.grade;
      const matchesUserBoard = test.board === userProfile.board;
      return matchesSearch && matchesSubject && matchesGrade && matchesBoard && matchesChapter && matchesUserGrade && matchesUserBoard;
    }
    
    return matchesSearch && matchesSubject && matchesGrade && matchesBoard && matchesChapter;
  });

  // Filter options based on user role
  const subjects = Array.from(new Set(tests.map(test => test.subject)));
  const grades = isAdmin 
    ? Array.from(new Set(tests.map(test => test.grade)))
    : userProfile 
      ? [userProfile.grade]
      : [];
  const boards = isAdmin 
    ? Array.from(new Set(tests.map(test => test.board)))
    : userProfile 
      ? [userProfile.board]
      : [];
  const chapters = Array.from(new Set(tests.map(test => extractChapter(test.title)).filter(Boolean))).sort((a, b) => {
    const aNum = parseInt(a?.match(/\d+/)?.[0] || '0');
    const bNum = parseInt(b?.match(/\d+/)?.[0] || '0');
    return aNum - bNum;
  });

  const handlePrintTest = (test: Test) => {
    setSelectedTestForPrint(test);
    setShowPrintModal(true);
  };

  const getTestStatus = (testId: string) => {
    if (completedTestIds.has(testId)) {
      return { status: 'completed', color: 'text-green-600', icon: CheckCircle };
    } else if (incompleteTestIds.has(testId)) {
      return { status: 'incomplete', color: 'text-yellow-600', icon: Clock };
    }
    return { status: 'not-started', color: 'text-gray-600', icon: Play };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-600 mx-auto"></div>
          <p className="mt-4 text-lg text-gray-600">Loading tests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50">
      <NavigationHeader />
      
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gradient mb-4">Available Tests</h1>
          <p className="text-xl text-gray-600">Choose a test to start your learning journey!</p>
        </div>

        {/* Search and Filter Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search Bar */}
            <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search tests..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
              </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
                className="px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="">All Subjects</option>
              {subjects.map(subject => (
                <option key={subject} value={subject}>{subject}</option>
              ))}
            </select>

            <select
              value={selectedGrade}
              onChange={(e) => setSelectedGrade(e.target.value)}
              disabled={!isAdmin}
              className={`px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                !isAdmin ? 'bg-gray-100 cursor-not-allowed' : ''
              }`}
            >
              <option value="">All Grades</option>
              {grades.map(grade => (
                <option key={grade} value={grade}>{grade}</option>
              ))}
            </select>

            <select
              value={selectedBoard}
              onChange={(e) => setSelectedBoard(e.target.value)}
              disabled={!isAdmin}
              className={`px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                !isAdmin ? 'bg-gray-100 cursor-not-allowed' : ''
              }`}
            >
              <option value="">All Boards</option>
              {boards.map(board => (
                <option key={board} value={board}>{board}</option>
              ))}
            </select>

            <select
              value={selectedChapter}
              onChange={(e) => setSelectedChapter(e.target.value)}
                className="px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="">All Chapters</option>
              {chapters.map(chapter => (
                <option key={chapter} value={chapter!}>{chapter}</option>
              ))}
            </select>
            </div>
          </div>
        </div>

        {/* In-Progress Tests */}
        {user && <InProgressTests />}

        {/* Tests Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
          {filteredTests.map((test) => {
            const testStatus = getTestStatus(test.id);
            const StatusIcon = testStatus.icon;
            
            return (
              <motion.div
                key={test.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-2">
                      <BookOpen className="w-5 h-5 text-orange-600" />
                      <span className="text-sm font-medium text-gray-600">{test.subject}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <StatusIcon className={`w-4 h-4 ${testStatus.color}`} />
                      <span className={`text-xs font-medium ${testStatus.color}`}>
                        {testStatus.status === 'completed' ? 'Completed' : 
                         testStatus.status === 'incomplete' ? 'In Progress' : 'Not Started'}
                      </span>
                    </div>
                </div>
                
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{test.title}</h3>
                  <p className="text-gray-600 mb-4 line-clamp-2">{test.description}</p>

                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <div className="flex items-center space-x-1">
                      <Clock className="w-4 h-4" />
                      <span>{test.duration} min</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Users className="w-4 h-4" />
                      <span>{test.grade}</span>
                    </div>
                  </div>
                  
                  {extractChapter(test.title) && (
                    <div className="mb-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {extractChapter(test.title)}
                      </span>
                    </div>
                  )}
                
                  <div className="flex items-center justify-between">
                    <div className="flex space-x-2">
                  <Link 
                    href={`/tests/${test.id}`}
                        className="flex items-center space-x-2 bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors"
                      >
                        <Play className="w-4 h-4" />
                        <span>
                          {testStatus.status === 'completed' ? 'Retake Test' : 
                           testStatus.status === 'incomplete' ? 'Resume Test' : 'Start Test'}
                        </span>
                  </Link>
                  <button
                        onClick={() => handlePrintTest(test)}
                        className="flex items-center space-x-2 text-gray-600 hover:text-orange-600 transition-colors px-4 py-2 rounded-lg hover:bg-gray-50"
                  >
                    <Printer className="w-4 h-4" />
                        <span>Print</span>
                  </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* No Tests Found */}
        {filteredTests.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No tests found</h3>
            <p className="text-gray-500">Try adjusting your search or filter criteria.</p>
          </div>
        )}
      </main>

      {/* Print Modal */}
      {showPrintModal && selectedTestForPrint && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">Print Test</h2>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                <button
                  onClick={() => setPrintMode('test')}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    printMode === 'test'
                      ? 'bg-orange-600 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                    Test Paper
                </button>
                <button
                  onClick={() => setPrintMode('answer-key')}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    printMode === 'answer-key'
                      ? 'bg-orange-600 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    Answer Key
                  </button>
                </div>
                <button
                  onClick={() => setShowPrintModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              {/* Printable Content */}
              <PrintableTest 
                test={selectedTestForPrint} 
                showAnswers={printMode === 'answer-key'} 
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 