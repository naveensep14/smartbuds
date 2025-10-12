'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { VALID_GRADES, normalizeGrade, type ValidGrade } from '@/lib/grade-utils';

interface ProfileFormData {
  studentName: string;
  grade: ValidGrade | '';
  board: string;
}

export default function CompleteProfilePage() {
  const router = useRouter();
  const { user, isAdmin } = useAuth();
  const [formData, setFormData] = useState<ProfileFormData>({
    studentName: '',
    grade: '',
    board: 'CBSE',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isChecking, setIsChecking] = useState(true);

  const checkProfileCompletion = useCallback(async () => {
    try {
      console.log('🔍 [PROFILE LOG] Checking profile completion for user:', user?.id);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('profile_completed, student_name, grade, board')
        .eq('id', user?.id)
        .single();

      console.log('🔍 [PROFILE LOG] Profile check result:', { data, error });

      if (error) {
        console.error('❌ [PROFILE LOG] Error checking profile:', error);
        setIsChecking(false);
        return;
      }

      if (data?.profile_completed) {
        console.log('✅ [PROFILE LOG] Profile already completed, redirecting to dashboard');
        // Profile already completed, redirect to dashboard
        router.push('/dashboard');
        return;
      }

      console.log('📝 [PROFILE LOG] Profile not completed, showing form');
      
      // Pre-fill form with existing data if any
      if (data) {
        const normalizedGrade = data.grade ? normalizeGrade(data.grade) : '';
        setFormData({
          studentName: data.student_name || '',
          grade: normalizedGrade || '',
          board: data.board || 'CBSE',
        });
      }

      setIsChecking(false);
    } catch (error) {
      console.error('🚨 [PROFILE LOG] Error checking profile completion:', error);
      setIsChecking(false);
    }
  }, [user?.id, router]);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    if (isAdmin) {
      router.push('/admin');
      return;
    }

    // Check if profile is already completed
    checkProfileCompletion();
  }, [user, isAdmin, router, checkProfileCompletion]);

  const handleInputChange = (field: keyof ProfileFormData, value: string) => {
    if (field === 'grade') {
      const normalizedGrade = normalizeGrade(value) || value as ValidGrade;
      setFormData(prev => ({ ...prev, [field]: normalizedGrade }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('🚀 [PROFILE LOG] Form submitted');
    console.log('🚀 [PROFILE LOG] Form data:', formData);
    console.log('🚀 [PROFILE LOG] User:', user?.id, user?.email);
    
    if (!formData.studentName.trim() || !formData.grade || !formData.board) {
      console.log('❌ [PROFILE LOG] Validation failed');
      setError('Please fill in all required fields.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      console.log('📝 [PROFILE LOG] Updating profile...');
      const { data, error } = await supabase
        .from('profiles')
        .update({
          student_name: formData.studentName.trim(),
          grade: formData.grade,
          board: formData.board,
          profile_completed: true,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user?.id)
        .select();

      console.log('📝 [PROFILE LOG] Update result:', { data, error });

      if (error) {
        console.error('❌ [PROFILE LOG] Update error:', error);
        throw error;
      }

      console.log('✅ [PROFILE LOG] Profile updated successfully');
      console.log('🔄 [PROFILE LOG] Redirecting to dashboard...');
      
      // Profile completed successfully, redirect to dashboard
      router.push('/dashboard');
    } catch (error) {
      console.error('🚨 [PROFILE LOG] Error completing profile:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setError(`Failed to save profile: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  if (isChecking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Checking your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-md mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Complete Your Profile
            </h1>
            <p className="text-gray-600">
              Please provide your details to access personalized content
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Student Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Student Name *
              </label>
              <input
                type="text"
                value={formData.studentName}
                onChange={(e) => handleInputChange('studentName', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="Enter your full name"
                required
              />
            </div>

            {/* Grade */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Grade *
              </label>
              <select
                value={formData.grade}
                onChange={(e) => handleInputChange('grade', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                required
              >
                <option value="">Select your grade</option>
                {VALID_GRADES.map(grade => (
                  <option key={grade} value={grade}>{grade}</option>
                ))}
              </select>
            </div>

            {/* Board */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Board *
              </label>
              <select
                value={formData.board}
                onChange={(e) => handleInputChange('board', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                required
              >
                <option value="CBSE">CBSE</option>
                <option value="ICSE">ICSE</option>
                <option value="State Board">State Board</option>
                <option value="IB">IB</option>
                <option value="IGCSE">IGCSE</option>
              </select>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-800 text-sm">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-orange-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-orange-600 focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? 'Saving...' : 'Complete Profile'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              Your profile information helps us show you relevant content for your grade level.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
