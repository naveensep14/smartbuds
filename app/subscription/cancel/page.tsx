'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { XCircle, ArrowLeft, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import NavigationHeader from '@/components/NavigationHeader';

export default function SubscriptionCancelPage() {
  const searchParams = useSearchParams();
  const planId = searchParams.get('plan_id');

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
      <NavigationHeader />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          {/* Cancel Icon */}
          <div className="mb-8">
            <div className="bg-red-100 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
              <XCircle className="w-12 h-12 text-red-600" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Subscription Cancelled
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              No worries! You can try again anytime.
            </p>
          </div>

          {/* Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-white rounded-xl shadow-lg p-8 mb-8"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6">What Happened?</h2>
            
            <div className="space-y-4 text-left max-w-2xl mx-auto">
              <p className="text-gray-600">
                Your subscription was cancelled during the checkout process. This could happen for several reasons:
              </p>
              
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-start space-x-2">
                  <span className="text-red-500 mt-1">•</span>
                  <span>You closed the payment window</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-red-500 mt-1">•</span>
                  <span>Payment was declined by your bank</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-red-500 mt-1">•</span>
                  <span>You chose to cancel before completing payment</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-red-500 mt-1">•</span>
                  <span>Technical issues during checkout</span>
                </li>
              </ul>
            </div>
          </motion.div>

          {/* Help Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="bg-white rounded-xl shadow-lg p-8 mb-8"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Need Help?</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Payment Issues</h3>
                <p className="text-gray-600 mb-3">
                  If you&apos;re having trouble with payment, try using a different card or contact your bank.
                </p>
                <p className="text-sm text-gray-500">
                  We accept all major credit and debit cards through our secure Stripe payment system.
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Technical Support</h3>
                <p className="text-gray-600 mb-3">
                  If you&apos;re experiencing technical issues, please contact our support team.
                </p>
                <Link
                  href="/help"
                  className="text-navy hover:underline font-medium"
                >
                  Contact Support →
                </Link>
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
            <Link
              href="/subscription"
              className="bg-navy text-white px-8 py-3 rounded-lg font-semibold hover:bg-[#1a2633] transition-colors flex items-center justify-center space-x-2"
            >
              <RefreshCw className="w-5 h-5" />
              <span>Try Again</span>
            </Link>
            
            <Link
              href="/dashboard"
              className="bg-gray-100 text-gray-700 px-8 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors flex items-center justify-center space-x-2"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Dashboard</span>
            </Link>
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
}
