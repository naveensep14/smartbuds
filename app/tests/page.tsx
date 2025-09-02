'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Clock, Users, Play, Search, Filter, Menu, X } from 'lucide-react';
import Link from 'next/link';
import { Test } from '@/types';
import { testService } from '@/lib/database';

export default function TestsPage() {
  const [tests, setTests] = useState<Test[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedGrade, setSelectedGrade] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Load tests from database on component mount
  useEffect(() => {
    const loadTests = async () => {
      const fetchedTests = await testService.getAll();
      setTests(fetchedTests);
    };
    loadTests();
  }, []);

  const filteredTests = tests.filter(test => {
    const matchesSearch = test.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         test.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSubject = !selectedSubject || test.subject === selectedSubject;
    const matchesGrade = !selectedGrade || test.grade === selectedGrade;
    
    return matchesSearch && matchesSubject && matchesGrade;
  });

  const subjects = Array.from(new Set(tests.map(test => test.subject)));
  const grades = Array.from(new Set(tests.map(test => test.grade)));

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <Link href="/" className="flex items-center space-x-3">
                <img
                  src="https://i.ibb.co/VqKJ8M9/logo-square.jpg"
                  alt="SmartBuds Logo"
                  className="w-12 h-12 rounded-lg object-cover"
                />
                <h1 className="text-2xl font-bold text-gradient">SmartBuds</h1>
              </Link>
            </div>
            <nav className="hidden md:flex space-x-8">
              <Link href="/tests" className="text-orange-600 font-semibold">
                Take Tests
              </Link>
              <Link href="/admin" className="text-gray-600 hover:text-orange-600 transition-colors">
                Admin Panel
              </Link>
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
                  href="/tests" 
                  className="text-orange-600 font-semibold px-4 py-2 rounded-lg hover:bg-gray-50"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Take Tests
                </Link>
                <Link 
                  href="/admin" 
                  className="text-gray-600 hover:text-orange-600 transition-colors px-4 py-2 rounded-lg hover:bg-gray-50"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Admin Panel
                </Link>
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
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedSubject('');
                setSelectedGrade('');
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
                className="card group"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ y: -5 }}
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-medium">
                    {test.subject}
                  </span>
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
                
                <Link 
                  href={`/tests/${test.id}`}
                  className="btn-primary w-full flex items-center justify-center space-x-2"
                >
                  <Play className="w-5 h-5" />
                  <span>Start Test</span>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
} 