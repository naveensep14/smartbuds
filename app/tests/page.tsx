'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Clock, Users, Play, Search, Filter, Menu, X, LogOut, User, Printer, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Test } from '@/types';
import { testService } from '@/lib/database';
import { useAuth } from '@/lib/auth';
import PrintableTest from '@/components/PrintableTest';
import { supabase } from '@/lib/supabase';
import { TestProgressService } from '@/lib/test-progress';

export default function TestsPage() {
  const [tests, setTests] = useState<Test[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedGrade, setSelectedGrade] = useState('');
  const [selectedBoard, setSelectedBoard] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [selectedTestForPrint, setSelectedTestForPrint] = useState<Test | null>(null);
  const [printMode, setPrintMode] = useState<'test' | 'answer-key'>('test');
  const [completedTestIds, setCompletedTestIds] = useState<Set<string>>(new Set());
  const [incompleteTestIds, setIncompleteTestIds] = useState<Set<string>>(new Set());
  const { user, signOut, loading } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

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

  const filteredTests = tests.filter(test => {
    const matchesSearch = test.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         test.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSubject = !selectedSubject || test.subject === selectedSubject;
    const matchesGrade = !selectedGrade || test.grade === selectedGrade;
    const matchesBoard = !selectedBoard || test.board === selectedBoard;
    
    return matchesSearch && matchesSubject && matchesGrade && matchesBoard;
  });

  const subjects = Array.from(new Set(tests.map(test => test.subject)));
  const grades = Array.from(new Set(tests.map(test => test.grade)));
  const boards = Array.from(new Set(tests.map(test => test.board)));

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <Link href="/" className="flex items-center space-x-3">
                <img
                  src="https://i.ibb.co/6RcwZjJr/logo-square.jpg"
                  alt="SuccessBuds Logo"
                  className="w-12 h-12 rounded-lg object-cover"
                />
                <h1 className="text-2xl font-bold text-gradient">SuccessBuds</h1>
              </Link>
            </div>
            <nav className="hidden md:flex items-center space-x-8">
              <Link href="/help" className="text-gray-600 hover:text-orange-600 transition-colors">
                Help
              </Link>
              {user ? (
                <div className="flex items-center space-x-4">
                  <Link href="/dashboard" className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors">
                    Dashboard
                  </Link>
                  <div className="flex items-center space-x-2">
                    <img
                      src={user.user_metadata?.avatar_url || `https://ui-avatars.com/api/?name=${user.email}&background=orange&color=white`}
                      alt="Profile"
                      className="w-8 h-8 rounded-full"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      {user.user_metadata?.full_name || user.email?.split('@')[0]}
                    </span>
                  </div>
                  <button
                    onClick={handleSignOut}
                    className="flex items-center space-x-1 text-gray-600 hover:text-red-600 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="text-sm">Sign Out</span>
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-4">
                  <Link href="/login" className="text-gray-600 hover:text-orange-600 transition-colors">
                    Login
                  </Link>
                  <Link href="/signup" className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors">
                    Sign Up
                  </Link>
                </div>
              )}
            </nav>
            
            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
          
          {/* Mobile menu */}
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="md:hidden border-t border-gray-100 pt-4 pb-2"
            >
              <div className="flex flex-col space-y-3">
                <Link 
                  href="/help" 
                  className="text-gray-600 hover:text-orange-600 transition-colors px-4 py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Help
                </Link>
                {user ? (
                  <>
                    <Link 
                      href="/dashboard" 
                      className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors text-center"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Dashboard
                    </Link>
                    <div className="border-t border-gray-200 pt-4 mt-4">
                      <div className="flex items-center space-x-2 px-4 py-2">
                        <img
                          src={user.user_metadata?.avatar_url || `https://ui-avatars.com/api/?name=${user.email}&background=orange&color=white`}
                          alt="Profile"
                          className="w-8 h-8 rounded-full"
                        />
                        <span className="text-sm font-medium text-gray-700">
                          {user.user_metadata?.full_name || user.email?.split('@')[0]}
                        </span>
                      </div>
                      <button
                        onClick={() => {
                          handleSignOut();
                          setMobileMenuOpen(false);
                        }}
                        className="flex items-center space-x-2 text-gray-600 hover:text-red-600 transition-colors px-4 py-2 rounded-lg hover:bg-gray-50 w-full text-left"
                      >
                        <LogOut className="w-4 h-4" />
                        <span className="text-sm">Sign Out</span>
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <Link 
                      href="/login" 
                      className="text-gray-600 hover:text-orange-600 transition-colors px-4 py-2 rounded-lg hover:bg-gray-50"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Login
                    </Link>
                    <Link 
                      href="/signup" 
                      className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors text-center"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Sign Up
                    </Link>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gradient mb-4">Available Tests</h1>
          <p className="text-xl text-gray-600">Choose a test to start your learning journey!</p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search tests..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="">All Subjects</option>
              {subjects.map(subject => (
                <option key={subject} value={subject}>{subject}</option>
              ))}
            </select>
            <select
              value={selectedGrade}
              onChange={(e) => setSelectedGrade(e.target.value)}
              className="px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="">All Grades</option>
              {grades.map(grade => (
                <option key={grade} value={grade}>{grade}</option>
              ))}
            </select>
            <select
              value={selectedBoard}
              onChange={(e) => setSelectedBoard(e.target.value)}
              className="px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="">All Boards</option>
              {boards.map(board => (
                <option key={board} value={board}>{board}</option>
              ))}
            </select>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedSubject('');
                setSelectedGrade('');
                setSelectedBoard('');
              }}
              className="px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        </div>

        {/* Tests Grid */}
        {filteredTests.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No tests found</h3>
            <p className="text-gray-600">Try adjusting your search criteria or filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTests.map((test, index) => (
              <motion.div
                key={test.id}
                className={`card group ${
                  completedTestIds.has(test.id) 
                    ? 'border-green-200 bg-green-50' 
                    : incompleteTestIds.has(test.id)
                    ? 'border-blue-200 bg-blue-50'
                    : ''
                }`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ y: -5 }}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-medium">
                      {test.subject}
                    </span>
                    {completedTestIds.has(test.id) && (
                      <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium flex items-center space-x-1">
                        <CheckCircle className="w-3 h-3" />
                        <span>Completed</span>
                      </span>
                    )}
                    {incompleteTestIds.has(test.id) && !completedTestIds.has(test.id) && (
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium flex items-center space-x-1">
                        <Clock className="w-3 h-3" />
                        <span>In Progress</span>
                      </span>
                    )}
                  </div>
                  <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium">
                    {test.grade}
                  </span>
                </div>
                
                <h3 className="text-xl font-semibold text-gray-800 mb-2 group-hover:text-primary-600 transition-colors">
                  {test.title}
                </h3>
                
                <p className="text-gray-600 mb-4 line-clamp-3">
                  {test.description}
                </p>
                
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center text-gray-500">
                    <Clock className="w-4 h-4 mr-1" />
                    <span className="text-sm">{test.duration} min</span>
                  </div>
                  <div className="text-sm text-gray-500">
                    Created: {test.createdAt.toLocaleDateString()}
                  </div>
                </div>
                
                <div className="space-y-3">
                  <Link 
                    href={`/tests/${test.id}`}
                    className={`w-full flex items-center justify-center space-x-2 px-4 py-3 rounded-lg font-semibold transition-all duration-200 ${
                      completedTestIds.has(test.id) 
                        ? 'bg-green-500 hover:bg-green-600 text-white' 
                        : incompleteTestIds.has(test.id)
                        ? 'bg-blue-500 hover:bg-blue-600 text-white'
                        : 'btn-primary'
                    }`}
                  >
                    <Play className="w-5 h-5" />
                    <span>{
                      completedTestIds.has(test.id) 
                        ? 'Retake Test' 
                        : incompleteTestIds.has(test.id)
                        ? 'Resume Test'
                        : 'Start Test'
                    }</span>
                  </Link>
                  
                  <button
                    onClick={() => {
                      setSelectedTestForPrint(test);
                      setPrintMode('test');
                      setShowPrintModal(true);
                    }}
                    className="w-full flex items-center justify-center space-x-2 bg-gray-100 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                  >
                    <Printer className="w-4 h-4" />
                    <span>Print Test & Answer Key</span>
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>

      {/* Print Modal */}
      {showPrintModal && selectedTestForPrint && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">
                  Print {printMode === 'test' ? 'Test' : 'Answer Key'}
                </h2>
                <button
                  onClick={() => setShowPrintModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Print Options */}
              <div className="flex space-x-4 mb-6">
                <button
                  onClick={() => setPrintMode('test')}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    printMode === 'test'
                      ? 'bg-orange-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Print Test
                </button>
                <button
                  onClick={() => setPrintMode('answer-key')}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    printMode === 'answer-key'
                      ? 'bg-orange-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Print Answer Key
                </button>
              </div>

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