'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { Menu, X, LogOut, User } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import Leaderboard from '@/components/Leaderboard';

export default function HomePage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, signOut, isAdmin } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <img
                src="https://i.ibb.co/6RcwZjJr/logo-square.jpg"
                alt="SuccessBuds Logo"
                className="w-12 h-12 rounded-lg object-cover"
              />
              <h1 className="text-2xl font-bold text-gradient">SuccessBuds</h1>
            </div>
            <nav className="hidden md:flex items-center space-x-8">
              {user ? (
                <div className="flex items-center space-x-4">
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
                  <Link href="/dashboard" className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors">
                    Dashboard
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="flex items-center space-x-1 text-gray-600 hover:text-red-600 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="text-sm">Sign Out</span>
                  </button>
                </div>
              ) : (
                <Link href="/login" className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors">
                  Get Started
                </Link>
              )}
            </nav>
            {/* Mobile menu button */}
            <div className="md:hidden">
              <button 
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="text-gray-600 hover:text-orange-600 transition-colors p-2 rounded-lg hover:bg-gray-100"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
          
          {/* Mobile menu */}
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="md:hidden border-t border-gray-200 py-4"
            >
              <div className="flex flex-col space-y-4">
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
                  <Link 
                    href="/login" 
                    className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors text-center"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Get Started
                  </Link>
                )}
              </div>
            </motion.div>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-4xl md:text-6xl font-bold text-gray-900 mt-8 mb-4"
          >
            Welcome to{' '}
            <span className="text-gradient bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
              SuccessBuds
            </span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto"
          >
            Your comprehensive educational testing platform. Take assessments, track progress, and achieve your learning goals.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex justify-center"
          >
            {user ? (
              <Link
                href="/tests"
                className="btn-primary"
              >
                Take Tests
              </Link>
            ) : (
              <Link
                href="/login"
                className="btn-primary"
              >
                Get Started
              </Link>
            )}
          </motion.div>
        </div>

        {/* Features Section */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="mt-20 grid md:grid-cols-3 gap-8"
        >
          <div className="card">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Comprehensive Testing</h3>
            <p className="text-gray-600">Access a wide range of educational assessments designed to evaluate your knowledge and skills.</p>
          </div>
          <div className="card">
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Progress Tracking</h3>
            <p className="text-gray-600">Monitor your performance over time with detailed analytics and progress reports.</p>
          </div>
          <div className="card">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Personalized Learning</h3>
            <p className="text-gray-600">Get tailored feedback and recommendations based on your test results and learning patterns.</p>
          </div>
        </motion.div>

        {/* Leaderboard Section */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.0 }}
          className="mt-20"
        >
          <div className="max-w-4xl mx-auto">
            <Leaderboard limit={5} />
          </div>
        </motion.div>
      </main>
    </div>
  );
} 