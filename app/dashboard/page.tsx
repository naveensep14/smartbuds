'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Clock, Trophy, User, Menu, X, Settings, Edit3, Save, X as CloseIcon } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ActivityService, Activity } from '@/lib/activity';
import NavigationHeader from '@/components/NavigationHeader';
import GradeBoardRequest from '@/components/GradeBoardRequest';
import { supabase } from '@/lib/supabase';
import { normalizeGrade, VALID_GRADES, type ValidGrade } from '@/lib/grade-utils';

export default function DashboardPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [activitiesLoading, setActivitiesLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<{student_name: string, grade: string, board: string} | null>(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileFormData, setProfileFormData] = useState({
    studentName: '',
    grade: '' as ValidGrade | '',
    board: 'CBSE'
  });
  const [profileUpdateLoading, setProfileUpdateLoading] = useState(false);
  const [profileUpdateError, setProfileUpdateError] = useState('');
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
          
          // Initialize form data
          const formGrade = normalizedData.grade ? normalizeGrade(normalizedData.grade) || '' : '';
          setProfileFormData({
            studentName: normalizedData.student_name || '',
            grade: formGrade as ValidGrade | '',
            board: normalizedData.board || 'CBSE'
          });
        } catch (error) {
          console.error('Error loading user profile:', error);
        }
      }
    };

    loadUserProfile();
  }, [user, isAdmin]);

  useEffect(() => {
    const loadActivities = async () => {
      if (user && user.id) {
        try {
          console.log('Dashboard - Loading activities for user:', user.id);
          const userActivities = await ActivityService.getRecentActivities(user.id, 5);
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

  const handleProfileInputChange = (field: keyof typeof profileFormData, value: string) => {
    setProfileFormData(prev => ({ ...prev, [field]: value }));
    setProfileUpdateError('');
  };

  const handleSaveProfile = async () => {
    if (!profileFormData.studentName.trim() || !profileFormData.grade || !profileFormData.board) {
      setProfileUpdateError('Please fill in all required fields.');
      return;
    }

    setProfileUpdateLoading(true);
    setProfileUpdateError('');

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          student_name: profileFormData.studentName.trim(),
          grade: profileFormData.grade,
          board: profileFormData.board,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user?.id);

      if (error) {
        throw error;
      }

      // Update local state
      setUserProfile({
        student_name: profileFormData.studentName.trim(),
        grade: profileFormData.grade,
        board: profileFormData.board
      });

      setIsEditingProfile(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setProfileUpdateError(`Failed to update profile: ${errorMessage}`);
    } finally {
      setProfileUpdateLoading(false);
    }
  };

  const handleCancelEdit = () => {
    // Reset form data to current profile
    if (userProfile) {
      const normalizedGrade = userProfile.grade ? normalizeGrade(userProfile.grade) || '' : '';
      setProfileFormData({
        studentName: userProfile.student_name || '',
        grade: normalizedGrade as ValidGrade | '',
        board: userProfile.board || 'CBSE'
      });
    }
    setIsEditingProfile(false);
    setProfileUpdateError('');
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
              src={user.user_metadata?.avatar_url || `https://ui-avatars.com/api/?name=${isAdmin ? (user.user_metadata?.full_name || user.email?.split('@')[0]) : (userProfile?.student_name || user.user_metadata?.full_name || user.email?.split('@')[0])}&background=orange&color=white`}
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

        {/* Student Profile Info */}
        {!isAdmin && userProfile && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl shadow-lg p-6 mb-8"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="bg-blue p-3 rounded-xl">
                  <User className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">Student Profile</h3>
                  {!isEditingProfile ? (
                    <div className="flex items-center space-x-4 mt-2">
                      <span className="text-sm bg-blue text-white px-3 py-1 rounded-full font-medium">
                        {userProfile.grade}
                      </span>
                      <span className="text-sm bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full font-medium">
                        {userProfile.board}
                      </span>
                    </div>
                  ) : (
                    <div className="mt-4 space-y-4">
                      {/* Student Name */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Student Name *
                        </label>
                        <input
                          type="text"
                          value={profileFormData.studentName}
                          onChange={(e) => handleProfileInputChange('studentName', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Enter your full name"
                        />
                      </div>

                      {/* Grade and Board */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Grade *
                          </label>
                          <select
                            value={profileFormData.grade}
                            onChange={(e) => handleProfileInputChange('grade', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          >
                            <option value="">Select your grade</option>
                            {VALID_GRADES.map(grade => (
                              <option key={grade} value={grade}>{grade}</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Board *
                          </label>
                          <select
                            value={profileFormData.board}
                            onChange={(e) => handleProfileInputChange('board', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          >
                            <option value="CBSE">CBSE</option>
                            <option value="ICSE">ICSE</option>
                            <option value="State Board">State Board</option>
                            <option value="IB">IB</option>
                            <option value="IGCSE">IGCSE</option>
                          </select>
                        </div>
                      </div>

                      {/* Grade/Board Request */}
                      <div className="border-t pt-4">
                        <GradeBoardRequest compact={true} />
                      </div>

                      {/* Error Message */}
                      {profileUpdateError && (
                        <div className="bg-pink border border-pink rounded-lg p-3">
                          <p className="text-white text-sm">{profileUpdateError}</p>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={handleSaveProfile}
                          disabled={profileUpdateLoading}
                          className="flex items-center space-x-2 bg-navy text-white px-4 py-2 rounded-lg hover:bg-primary-700 focus:ring-2 focus:ring-blue focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          <Save className="w-4 h-4" />
                          <span>{profileUpdateLoading ? 'Saving...' : 'Save Changes'}</span>
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          disabled={profileUpdateLoading}
                          className="flex items-center space-x-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          <CloseIcon className="w-4 h-4" />
                          <span>Cancel</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              {!isEditingProfile && (
                <button
                  onClick={() => setIsEditingProfile(true)}
                  className="flex items-center space-x-3 bg-navy text-white px-6 py-3 rounded-xl font-semibold hover:bg-[#1a2633] focus:ring-4 focus:ring-blue-300 focus:ring-offset-2 transition-all shadow-lg hover:shadow-xl border-2 border-navy"
                >
                  <Edit3 className="w-5 h-5" />
                  <span className="text-lg">Edit Profile</span>
                </button>
              )}
            </div>
          </motion.div>
        )}

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
                  <div className="bg-yellow p-3 rounded-xl">
                    <BookOpen className="w-8 h-8 text-white" />
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
                  <div className="bg-green p-3 rounded-xl">
                    <Trophy className="w-8 h-8 text-white" />
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
                    <div className="bg-blue p-3 rounded-xl">
                      <User className="w-8 h-8 text-white" />
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
                className="inline-flex items-center space-x-2 bg-navy text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
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
