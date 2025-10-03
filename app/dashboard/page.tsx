'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Clock, Trophy, User, LogOut, Menu, X, Settings } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ActivityService, Activity } from '@/lib/activity';

export default function DashboardPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [activitiesLoading, setActivitiesLoading] = useState(true);
  const { user, signOut, loading, isAdmin } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    const loadActivities = async () => {
      if (user && user.email) {
        try {
          console.log('Dashboard - Loading activities for user:', user.email);
          const userActivities = await ActivityService.getRecentActivities(user.email, 5);
          console.log('Dashboard - Loaded activities:', userActivities);
          setActivities(userActivities);
        } catch (error) {
          console.error('Error loading activities:', error);
        } finally {
          setActivitiesLoading(false);
        }
      }
    };

    loadActivities();
  }, [user]);

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

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
            
            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              {/* User Menu */}
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
                <button
                  onClick={handleSignOut}
                  className="flex items-center space-x-1 text-gray-600 hover:text-red-600 transition-colors"
                >
                  <LogOut className="w-3 h-3" />
                  <span className="text-xs">Sign Out</span>
                </button>
              </div>
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
                <div className="border-t border-gray-200 pt-3 mt-3">
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
                    onClick={handleSignOut}
                    className="flex items-center space-x-2 text-gray-600 hover:text-red-600 transition-colors px-4 py-2 rounded-lg hover:bg-gray-50 w-full text-left"
                  >
                    <LogOut className="w-3 h-3" />
                    <span className="text-xs">Sign Out</span>
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </header>

      {/* Dashboard Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white rounded-2xl shadow-lg p-8 mb-8"
        >
          <div className="flex items-center space-x-4">
            <img
              src={user.user_metadata?.avatar_url || `https://ui-avatars.com/api/?name=${user.email}&background=orange&color=white`}
              alt="Profile"
              className="w-16 h-16 rounded-full"
            />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Welcome back, {user.user_metadata?.full_name || user.email?.split('@')[0]}!
              </h1>
              <p className="text-gray-600 mt-1">
                Ready to continue your learning journey?
              </p>
            </div>
          </div>
        </motion.div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <Link href="/tests" className="block">
              <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow">
                <div className="flex items-center space-x-4">
                  <div className="bg-orange-100 p-3 rounded-xl">
                    <BookOpen className="w-8 h-8 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">Take Tests</h3>
                    <p className="text-gray-600">Practice with our interactive quizzes</p>
                  </div>
                </div>
              </div>
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Link href="/my-results" className="block">
              <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow">
                <div className="flex items-center space-x-4">
                  <div className="bg-green-100 p-3 rounded-xl">
                    <Trophy className="w-8 h-8 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">View Results</h3>
                    <p className="text-gray-600">Check your test scores and progress</p>
                  </div>
                </div>
              </div>
            </Link>
          </motion.div>

          {isAdmin && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <Link href="/admin" className="block">
                <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow">
                  <div className="flex items-center space-x-4">
                    <div className="bg-blue-100 p-3 rounded-xl">
                      <User className="w-8 h-8 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">Admin Panel</h3>
                      <p className="text-gray-600">Manage tests and content</p>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          )}
        </div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="bg-white rounded-2xl shadow-lg p-8"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Recent Activity</h2>
          
          {activitiesLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
              <span className="ml-3 text-gray-600">Loading activities...</span>
            </div>
          ) : activities.length > 0 ? (
            <div className="space-y-4">
              {activities.map((activity) => {
                const iconConfig = ActivityService.getActivityIcon(activity.type);
                const IconComponent = iconConfig.icon === 'Trophy' ? Trophy : 
                                    iconConfig.icon === 'BookOpen' ? BookOpen : 
                                    iconConfig.icon === 'User' ? User : 
                                    iconConfig.icon === 'Settings' ? Settings : Clock;
                
                return (
                  <div key={activity.id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                    <div className={`w-10 h-10 ${iconConfig.bgColor} rounded-full flex items-center justify-center`}>
                      <IconComponent className={`w-5 h-5 ${iconConfig.color}`} />
                    </div>
                    <div>
                      <p className="text-gray-900 font-medium">{activity.title}</p>
                      <p className="text-sm text-gray-600">{activity.description}</p>
                      <p className="text-xs text-gray-500">{ActivityService.formatActivityTime(activity.timestamp)}</p>
                    </div>
                  </div>
                );
              })}

              {/* Show more activities button */}
              <div className="text-center pt-4">
                <Link 
                  href="/my-results" 
                  className="inline-flex items-center space-x-2 text-orange-600 hover:text-orange-700 font-medium"
                >
                  <span>View All Activity</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Clock className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-lg font-medium mb-2">No recent activity</p>
              <p className="text-sm mb-4">Complete your first test to see your activity here!</p>
              <Link 
                href="/tests" 
                className="inline-flex items-center space-x-2 bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors"
              >
                <BookOpen className="w-4 h-4" />
                <span>Take Your First Test</span>
              </Link>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
