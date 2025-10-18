'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, BookOpen } from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { Test, TestResult } from '@/types';
import { testService, resultService } from '@/lib/database';
import { useAuth } from '@/lib/auth';
import TestReview from '@/components/TestReview';
import NavigationHeader from '@/components/NavigationHeader';

export default function TestReviewPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isAdmin } = useAuth();
  const [test, setTest] = useState<Test | null>(null);
  const [testResult, setTestResult] = useState<TestResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadTestReview = async () => {
      if (!params.id) {
        setError('Test result ID not provided');
        setLoading(false);
        return;
      }

      try {
        // Load test result
        const result = await resultService.getById(params.id as string);
        if (!result) {
          setError('Test result not found');
          setLoading(false);
          return;
        }

        // Load test
        const testData = await testService.getById(result.testId);
        if (!testData) {
          setError('Test not found');
          setLoading(false);
          return;
        }

        setTestResult(result);
        setTest(testData);
      } catch (err) {
        console.error('Error loading test review:', err);
        setError('Failed to load test review');
      } finally {
        setLoading(false);
      }
    };

    loadTestReview();
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
        <NavigationHeader />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-navy mx-auto mb-4"></div>
              <p className="text-gray-600">Loading test review...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error || !test || !testResult) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
        <NavigationHeader />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-8 h-8 text-red-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Test Review Not Found</h2>
              <p className="text-gray-600 mb-6">{error || 'The test review you are looking for does not exist.'}</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/my-results" className="btn-primary">
                  View My Results
                </Link>
                <Link href="/tests" className="btn-secondary">
                  Take Another Test
                </Link>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
      <NavigationHeader />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <Link 
              href="/my-results"
              className="flex items-center space-x-2 text-gray-600 hover:text-navy transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Results</span>
            </Link>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
              <div>
                <h1 className="text-2xl font-bold text-gray-800">{test.title}</h1>
                <p className="text-gray-600 mt-1">{test.description}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 bg-yellow text-white rounded-full text-sm font-medium">
                  {test.subject}
                </span>
                <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium">
                  {test.grade}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Test Review Component */}
        <TestReview
          test={test}
          testResult={testResult}
          onClose={() => router.push('/my-results')}
        />
      </main>
    </div>
  );
}
