'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Plus, Edit, Trash2, Eye, BarChart3, Users, Settings, Menu, X, LogOut, Upload, Filter, Search } from 'lucide-react';
import Link from 'next/link';
import AdminRoute from '@/components/AdminRoute';
import CreateTestForm from '@/components/CreateTestForm';
import EditTestForm from '@/components/EditTestForm';
import TestPreviewModal from '@/components/TestPreviewModal';
import ConfirmDeleteModal from '@/components/ConfirmDeleteModal';
import Toast from '@/components/Toast';
import { testService } from '@/lib/database';
import { Test } from '@/types';
import { useAuth } from '@/lib/auth';

function AdminPageContent() {
  const [tests, setTests] = useState<Test[]>([]);
  const [filteredTests, setFilteredTests] = useState<Test[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingTest, setEditingTest] = useState<Test | null>(null);
  const [previewingTest, setPreviewingTest] = useState<Test | null>(null);
  const [deletingTest, setDeletingTest] = useState<Test | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [isSupabaseConfigured, setIsSupabaseConfigured] = useState(false);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedGrade, setSelectedGrade] = useState('');
  const [selectedBoard, setSelectedBoard] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  
  const { signOut } = useAuth();

  useEffect(() => {
    loadTests();
    checkSupabaseConfig();
  }, []);

  // Filter tests based on search and filter criteria
  useEffect(() => {
    let filtered = tests;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(test => 
        test.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        test.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        test.subject.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Subject filter
    if (selectedSubject) {
      filtered = filtered.filter(test => test.subject === selectedSubject);
    }

    // Grade filter
    if (selectedGrade) {
      filtered = filtered.filter(test => test.grade === selectedGrade);
    }

    // Board filter
    if (selectedBoard) {
      filtered = filtered.filter(test => test.board === selectedBoard);
    }

    setFilteredTests(filtered);
  }, [tests, searchTerm, selectedSubject, selectedGrade, selectedBoard]);

  const checkSupabaseConfig = () => {
    const hasUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const hasKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    setIsSupabaseConfigured(!!(hasUrl && hasKey));
  };

  const loadTests = async () => {
    try {
      const fetchedTests = await testService.getAll();
      setTests(fetchedTests);
    } catch (error) {
      console.error('Error loading tests:', error);
      setToast({ type: 'error', message: 'Failed to load tests' });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTest = async (testData: Omit<Test, 'id' | 'created_at'>) => {
    try {
      const newTest = await testService.create(testData);
      if (newTest) {
        setTests(prev => [...prev, newTest]);
        setShowCreateForm(false);
        setToast({ type: 'success', message: 'Test created successfully!' });
      } else {
        setToast({ type: 'error', message: 'Failed to create test' });
      }
    } catch (error) {
      console.error('Error creating test:', error);
      setToast({ type: 'error', message: 'Failed to create test' });
    }
  };

  const handleUpdateTest = async (testData: Test) => {
    try {
      const updatedTest = await testService.update(testData.id, testData);
      if (updatedTest) {
        setTests(prev => prev.map(test => test.id === updatedTest.id ? updatedTest : test));
        setEditingTest(null);
        setToast({ type: 'success', message: 'Test updated successfully!' });
      } else {
        setToast({ type: 'error', message: 'Failed to update test' });
      }
    } catch (error) {
      console.error('Error updating test:', error);
      setToast({ type: 'error', message: 'Failed to update test' });
    }
  };

  const handleDeleteTest = async (test: Test) => {
    try {
      await testService.delete(test.id);
      setTests(prev => prev.filter(t => t.id !== test.id));
      setDeletingTest(null);
      setToast({ type: 'success', message: 'Test deleted successfully!' });
    } catch (error) {
      console.error('Error deleting test:', error);
      setToast({ type: 'error', message: 'Failed to delete test' });
    }
  };

  // Get unique values for filter options
  const getUniqueSubjects = () => Array.from(new Set(tests.map(test => test.subject)));
  const getUniqueGrades = () => Array.from(new Set(tests.map(test => test.grade)));
  const getUniqueBoards = () => Array.from(new Set(tests.map(test => test.board)));

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm('');
    setSelectedSubject('');
    setSelectedGrade('');
    setSelectedBoard('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
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
              <nav className="hidden md:flex space-x-8">
                <Link href="/help" className="text-gray-600 hover:text-orange-600 transition-colors">
                  Help
                </Link>
                <Link href="/tests" className="text-gray-600 hover:text-orange-600 transition-colors">
                  Take Tests
                </Link>
                <Link href="/admin" className="text-orange-600 font-semibold">
                  Admin Panel
                </Link>
                <button
                  onClick={signOut}
                  className="text-gray-600 hover:text-red-600 transition-colors flex items-center space-x-2"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
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
                    className="text-gray-600 hover:text-orange-600 transition-colors px-4 py-2 rounded-lg hover:bg-gray-50"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Help
                  </Link>
                  <Link 
                    href="/tests" 
                    className="text-gray-600 hover:text-orange-600 transition-colors px-4 py-2 rounded-lg hover:bg-gray-50"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Take Tests
                  </Link>
                  <Link 
                    href="/admin" 
                    className="text-orange-600 font-semibold px-4 py-2 rounded-lg hover:bg-gray-50"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Admin Panel
                  </Link>
                  <button
                    onClick={() => {
                      signOut();
                      setMobileMenuOpen(false);
                    }}
                    className="text-gray-600 hover:text-red-600 transition-colors flex items-center space-x-2 px-4 py-2 rounded-lg hover:bg-gray-50 text-left"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Configuration Notice */}
          {!isSupabaseConfigured && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 text-yellow-600 mt-0.5">⚠️</div>
                <div>
                  <h4 className="font-semibold text-yellow-800">Database Not Configured</h4>
                  <p className="text-sm text-yellow-700 mt-1">
                    Please set up your Supabase credentials in the .env.local file to enable test creation and storage.
                  </p>
                  <div className="mt-2 text-xs text-yellow-600">
                    <p>Required environment variables:</p>
                    <code className="bg-yellow-100 px-2 py-1 rounded">
                      NEXT_PUBLIC_SUPABASE_URL=your_project_url
                    </code>
                    <br />
                    <code className="bg-yellow-100 px-2 py-1 rounded">
                      NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
                    </code>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Page Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-4xl font-bold text-gradient mb-2">Admin Dashboard</h1>
              <p className="text-xl text-gray-600">Manage tests and monitor student progress</p>
            </div>
            <div className="flex gap-3">
              <Link
                href="/admin/pdf-upload"
                className="btn-secondary flex items-center space-x-2"
              >
                <Upload className="w-5 h-5" />
                <span>Upload PDF</span>
              </Link>
              <button
                onClick={() => setShowCreateForm(true)}
                disabled={!isSupabaseConfigured}
                className="btn-primary flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus className="w-5 h-5" />
                <span>Create New Test</span>
              </button>
            </div>
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
                  <BookOpen className="w-6 h-6 text-orange-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600">Total Tests</p>
                  <p className="text-2xl font-bold text-gray-800">{filteredTests.length}</p>
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
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 text-red-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600">Total Questions</p>
                  <p className="text-2xl font-bold text-gray-800">{filteredTests.reduce((sum, test) => sum + test.questions.length, 0)}</p>
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
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600">Active Students</p>
                  <p className="text-lg font-semibold text-gray-500">Coming Soon</p>
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
                  <BarChart3 className="w-6 h-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600">Avg Score</p>
                  <p className="text-lg font-semibold text-gray-500">Coming Soon</p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Filters Section */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              {/* Search Bar */}
              <div className="flex-1 max-w-md">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search tests..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Filter Toggle Button */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Filter className="w-5 h-5" />
                <span>Filters</span>
                {showFilters && (
                  <span className="bg-orange-500 text-white text-xs px-2 py-1 rounded-full">
                    {[selectedSubject, selectedGrade, selectedBoard].filter(Boolean).length}
                  </span>
                )}
              </button>
            </div>

            {/* Filter Options */}
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 pt-4 border-t border-gray-200"
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Subject Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Subject
                    </label>
                    <select
                      value={selectedSubject}
                      onChange={(e) => setSelectedSubject(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    >
                      <option value="">All Subjects</option>
                      {getUniqueSubjects().map(subject => (
                        <option key={subject} value={subject}>{subject}</option>
                      ))}
                    </select>
                  </div>

                  {/* Grade Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Grade
                    </label>
                    <select
                      value={selectedGrade}
                      onChange={(e) => setSelectedGrade(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    >
                      <option value="">All Grades</option>
                      {getUniqueGrades().map(grade => (
                        <option key={grade} value={grade}>{grade}</option>
                      ))}
                    </select>
                  </div>

                  {/* Board Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Board
                    </label>
                    <select
                      value={selectedBoard}
                      onChange={(e) => setSelectedBoard(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    >
                      <option value="">All Boards</option>
                      {getUniqueBoards().map(board => (
                        <option key={board} value={board}>{board}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Clear Filters Button */}
                <div className="mt-4 flex justify-end">
                  <button
                    onClick={clearFilters}
                    className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 underline"
                  >
                    Clear all filters
                  </button>
                </div>
              </motion.div>
            )}
          </div>

          {/* Tests Table */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="text-xl font-semibold text-gray-800">Manage Tests</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Test Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Subject
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Grade
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Board
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Questions
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Duration
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredTests.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center">
                        <div className="flex flex-col items-center">
                          <BookOpen className="w-12 h-12 text-gray-400 mb-4" />
                          <h3 className="text-lg font-medium text-gray-900 mb-2">
                            {tests.length === 0 ? 'No tests found' : 'No tests match your filters'}
                          </h3>
                          <p className="text-gray-500 mb-4">
                            {tests.length === 0 
                              ? 'Create your first test to get started' 
                              : 'Try adjusting your search or filter criteria'
                            }
                          </p>
                          {tests.length > 0 && (
                            <button
                              onClick={clearFilters}
                              className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                            >
                              Clear Filters
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredTests.map((test, index) => (
                      <motion.tr
                        key={test.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: index * 0.1 }}
                        className="hover:bg-gray-50"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{test.title}</div>
                            <div className="text-sm text-gray-500">{test.description}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-orange-100 text-orange-800">
                            {test.subject}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {test.grade}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                            {test.board}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {test.questions.length}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {test.duration} min
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => setEditingTest(test)}
                              className="text-primary-600 hover:text-primary-900"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => setPreviewingTest(test)}
                              className="text-primary-600 hover:text-primary-900"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => setDeletingTest(test)}
                              className="text-red-600 hover:text-red-900"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mt-8 grid md:grid-cols-3 gap-6">
            <motion.div
              className="card text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Plus className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Create Test</h3>
              <p className="text-gray-600 mb-4">Add a new test with multiple choice questions</p>
              <button
                onClick={() => setShowCreateForm(true)}
                className="btn-primary"
              >
                Get Started
              </button>
            </motion.div>

            <motion.div
              className="card text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Analytics</h3>
              <p className="text-gray-600 mb-4">Monitor student performance and progress</p>
              <button className="btn-secondary">
                Coming Soon
              </button>
            </motion.div>

            <motion.div
              className="card text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.7 }}
            >
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Settings className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Settings</h3>
              <p className="text-gray-600 mb-4">Configure platform settings and preferences</p>
              <button className="btn-secondary">
                Coming Soon
              </button>
            </motion.div>
          </div>
        </main>

        {/* Create Test Form Modal */}
        {showCreateForm && (
          <CreateTestForm
            onClose={() => setShowCreateForm(false)}
            onSave={handleCreateTest}
          />
        )}

        {/* Edit Test Form Modal */}
        {editingTest && (
          <EditTestForm
            test={editingTest}
            onClose={() => setEditingTest(null)}
            onSave={handleUpdateTest}
          />
        )}

        {/* Test Preview Modal */}
        {previewingTest && (
          <TestPreviewModal
            test={previewingTest}
            onClose={() => setPreviewingTest(null)}
          />
        )}

        {/* Confirm Delete Modal */}
        {deletingTest && (
          <ConfirmDeleteModal
            test={deletingTest}
            onCancel={() => setDeletingTest(null)}
            onConfirm={() => {
              handleDeleteTest(deletingTest);
              setDeletingTest(null);
            }}
          />
        )}

        {/* Toast Notification */}
        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            isVisible={true}
            onClose={() => setToast(null)}
          />
        )}
      </div>
  );
}

export default function AdminPage() {
  return (
    <AdminRoute>
      <AdminPageContent />
    </AdminRoute>
  );
} 