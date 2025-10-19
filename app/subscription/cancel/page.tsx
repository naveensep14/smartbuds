'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { XCircle, ArrowRight, Home, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import NavigationHeader from '@/components/NavigationHeader';

function CancelContent() {
  const searchParams = useSearchParams();
  const planId = searchParams.get('plan_id');
  const [loading, setLoading] = useState(false);

  const handleRetryPayment = async () => {
    if (!planId) return;
    
    setLoading(true);
    try {
      // Redirect back to subscription page
      window.location.href = `/subscription?plan=${planId}`;
    } catch (error) {
      console.error('Error retrying payment:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
      <NavigationHeader />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="bg-red-100 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
            <XCircle className="w-12 h-12 text-red-600" />
          </div>
          
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Payment Cancelled
          </h1>
          
          <p className="text-xl text-gray-600 mb-8">
            Your payment was cancelled. No charges have been made to your account.
          </p>
        </motion.div>

        {/* Why This Happened */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-white rounded-2xl shadow-lg p-8 mb-8"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Why did this happen?</h2>
          
          <div className="space-y-4">
            <div className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
              <div className="bg-blue-100 rounded-full w-8 h-8 flex items-center justify-center mt-1">
                <span className="text-blue-600 font-bold text-sm">1</span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Payment Method Issues</h3>
                <p className="text-gray-600">Your card might have been declined or insufficient funds</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
              <div className="bg-blue-100 rounded-full w-8 h-8 flex items-center justify-center mt-1">
                <span className="text-blue-600 font-bold text-sm">2</span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Network Issues</h3>
                <p className="text-gray-600">Temporary connection problems during payment processing</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
              <div className="bg-blue-100 rounded-full w-8 h-8 flex items-center justify-center mt-1">
                <span className="text-blue-600 font-bold text-sm">3</span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Manual Cancellation</h3>
                <p className="text-gray-600">You may have closed the payment window or cancelled the transaction</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* What You Can Do */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="bg-white rounded-2xl shadow-lg p-8 mb-8"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-6">What you can do now</h2>
          
          <div className="space-y-4">
            <div className="flex items-center space-x-4 p-4 bg-green-50 rounded-lg">
              <div className="bg-green-100 rounded-full w-10 h-10 flex items-center justify-center">
                <RefreshCw className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Try Again</h3>
                <p className="text-gray-600">Retry the payment with a different method or card</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4 p-4 bg-blue-50 rounded-lg">
              <div className="bg-blue-100 rounded-full w-10 h-10 flex items-center justify-center">
                <span className="text-blue-600 font-bold">?</span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Contact Support</h3>
                <p className="text-gray-600">Get help from our support team if you&apos;re having issues</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4 p-4 bg-purple-50 rounded-lg">
              <div className="bg-purple-100 rounded-full w-10 h-10 flex items-center justify-center">
                <span className="text-purple-600 font-bold">!</span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Check Your Bank</h3>
                <p className="text-gray-600">Verify with your bank if there are any restrictions</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <button
            onClick={handleRetryPayment}
            disabled={loading}
            className="inline-flex items-center px-8 py-4 bg-orange-600 text-white font-semibold rounded-xl hover:bg-orange-700 transition-colors duration-300 disabled:opacity-50"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
            ) : (
              <RefreshCw className="w-5 h-5 mr-2" />
            )}
            Try Payment Again
          </button>
          
          <Link
            href="/subscription"
            className="inline-flex items-center px-8 py-4 border-2 border-orange-600 text-orange-600 font-semibold rounded-xl hover:bg-orange-600 hover:text-white transition-all duration-300"
          >
            <ArrowRight className="w-5 h-5 mr-2" />
            Choose Different Plan
          </Link>
          
          <Link
            href="/dashboard"
            className="inline-flex items-center px-8 py-4 border-2 border-gray-300 text-gray-600 font-semibold rounded-xl hover:bg-gray-100 transition-all duration-300"
          >
            <Home className="w-5 h-5 mr-2" />
            Go to Dashboard
          </Link>
        </motion.div>

        {/* Support Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="text-center mt-12"
        >
          <p className="text-gray-600 mb-4">
            Need help? Contact our support team
          </p>
          <Link
            href="mailto:support@successbuds.com"
            className="text-orange-600 hover:text-orange-700 font-semibold"
          >
            support@successbuds.com
          </Link>
        </motion.div>
      </div>
    </div>
  );
}

export default function SubscriptionCancelPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
        <NavigationHeader />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      </div>
    }>
      <CancelContent />
    </Suspense>
  );
}