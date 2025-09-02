'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Users, Trophy, Plus, Play, Settings, Menu, X } from 'lucide-react';
import Link from 'next/link';

export default function HomePage() {
  const [isHovered, setIsHovered] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 flex items-center justify-center">
                <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center text-white font-bold text-lg">
                  SB
                </div>
              </div>
              <h1 className="text-2xl font-bold text-gradient">SmartBuds</h1>
            </div>
            <nav className="hidden md:flex space-x-8">
              <Link href="/tests" className="text-gray-600 hover:text-orange-600 transition-colors">
                Take Tests
              </Link>
              <Link href="/login" className="text-gray-600 hover:text-orange-600 transition-colors">
                Admin Login
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
                  className="text-gray-600 hover:text-orange-600 transition-colors px-4 py-2 rounded-lg hover:bg-gray-50"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Take Tests
                </Link>
                <Link 
                  href="/login" 
                  className="text-gray-600 hover:text-orange-600 transition-colors px-4 py-2 rounded-lg hover:bg-gray-50"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Admin Login
                </Link>
              </div>
            </motion.div>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-16">
          <motion.div
            className="mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="mx-auto max-w-md md:max-w-lg lg:max-w-xl rounded-lg shadow-lg bg-gradient-to-r from-orange-400 to-red-500 p-8 text-center">
              <h2 className="text-3xl font-bold text-white mb-4">SmartBuds</h2>
              <p className="text-white text-lg">Educational Platform</p>
            </div>
          </motion.div>
          <motion.h1 
            className="text-5xl md:text-7xl font-bold text-gradient mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Learn & Grow Together! 🌟
          </motion.h1>
          <motion.p 
            className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Welcome to SmartBuds, where learning is fun and exciting! Take interactive tests, 
            challenge yourself, and watch your knowledge grow.
          </motion.p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          <motion.div 
            className="card group"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            whileHover={{ y: -5 }}
          >
                      <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-orange-200 transition-colors">
            <Play className="w-8 h-8 text-orange-600" />
          </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Take Tests</h3>
            <p className="text-gray-600">
              Choose from a variety of subjects and grade levels. Each test is designed to be fun and educational!
            </p>
          </motion.div>

          <motion.div 
            className="card group"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            whileHover={{ y: -5 }}
          >
                      <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-red-200 transition-colors">
            <Trophy className="w-8 h-8 text-red-600" />
          </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Track Progress</h3>
            <p className="text-gray-600">
              See your scores, track your improvement, and celebrate your achievements with detailed results.
            </p>
          </motion.div>

          <motion.div 
            className="card group"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            whileHover={{ y: -5 }}
          >
                      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-green-200 transition-colors">
            <Users className="w-8 h-8 text-green-600" />
          </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Learn Together</h3>
            <p className="text-gray-600">
              Share your progress with teachers and parents. Learning is better when we do it together!
            </p>
          </motion.div>
        </div>

        {/* Action Buttons */}
        <motion.div 
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <Link href="/tests" className="btn-primary flex items-center space-x-2">
            <Play className="w-5 h-5" />
            <span>Start Learning</span>
          </Link>
          <Link href="/admin" className="btn-secondary flex items-center space-x-2">
            <Settings className="w-5 h-5" />
            <span>Admin Panel</span>
          </Link>
        </motion.div>

        {/* Fun Elements */}
        <div className="mt-20 text-center">
          <motion.div 
            className="inline-block"
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <span className="text-4xl">🎓</span>
          </motion.div>
          <motion.div 
            className="inline-block ml-8"
            animate={{ rotate: [0, -10, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
          >
            <span className="text-4xl">📚</span>
          </motion.div>
          <motion.div 
            className="inline-block ml-8"
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity, delay: 1 }}
          >
            <span className="text-4xl">🚀</span>
          </motion.div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-600">
            <p>&copy; 2024 SmartBuds Educational Platform. Made with ❤️ for learning.</p>
          </div>
        </div>
      </footer>
    </div>
  );
} 