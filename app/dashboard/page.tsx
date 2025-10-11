'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Clock, Trophy, User, Menu, X, Settings } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ActivityService, Activity } from '@/lib/activity';
import NavigationHeader from '@/components/NavigationHeader';
import { supabase } from '@/lib/supabase';
import { normalizeGrade } from '@/lib/grade-utils';

export default function DashboardPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [activitiesLoading, setActivitiesLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<{student_name: string, grade: string, board: string} | null>(null);
  const { user, loading, isAdmin } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

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
      <NavigationHeader />

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
                Welcome back, {isAdmin ? (user.user_metadata?.full_name || user.email?.split('@')[0]) : (userProfile?.student_name || user.user_metadata?.full_name || user.email?.split('@')[0])}!
              </h1>
              <p className="text-gray-600 mt-1">
                {isAdmin 
                  ? "Ready to continue your learning journey?"
                  : userProfile 
                    ? `Ready to continue your ${userProfile.grade} ${userProfile.board} learning journey?`
                    : "Ready to continue your learning journey?"
                }
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
