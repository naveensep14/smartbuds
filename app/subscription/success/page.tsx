'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { CheckCircle, ArrowRight, Home } from 'lucide-react';
import Link from 'next/link';
import NavigationHeader from '@/components/NavigationHeader';

export default function SubscriptionSuccessPage() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [loading, setLoading] = useState(true);
  const [subscriptionDetails, setSubscriptionDetails] = useState<any>(null);

  useEffect(() => {
    const verifySubscription = async () => {
      if (!sessionId) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch('/api/subscription/verify-payment', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ sessionId }),
        });

        const data = await response.json();
        if (data.success) {
          setSubscriptionDetails(data.subscription);
        }
      } catch (error) {
        console.error('Error verifying subscription:', error);
      } finally {
        setLoading(false);
      }
    };

    verifySubscription();
  }, [sessionId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
        <NavigationHeader />
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-navy mx-auto mb-4"></div>
              <p className="text-gray-600">Verifying your subscription...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

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
          {/* Success Icon */}
          <div className="mb-8">
            <div className="bg-green-100 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Subscription Successful!
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Welcome to SmartBuds! Your annual subscription is now active.
            </p>
          </div>

          {/* Subscription Details */}
          {subscriptionDetails && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-white rounded-xl shadow-lg p-8 mb-8"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Subscription Details</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Plan</h3>
                  <p className="text-gray-600">{subscriptionDetails.plan?.name}</p>
                </div>
                
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Valid Until</h3>
                  <p className="text-gray-600">
                    {new Date(subscriptionDetails.currentPeriodEnd).toLocaleDateString()}
                  </p>
                </div>
                
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Status</h3>
                  <p className="text-green-600 font-semibold capitalize">
                    {subscriptionDetails.status}
                  </p>
                </div>
                
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Amount Paid</h3>
                  <p className="text-gray-600">
                    ${subscriptionDetails.plan?.priceUsd}
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* What's Next */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="bg-white rounded-xl shadow-lg p-8 mb-8"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6">What&apos;s Next?</h2>
            
            <div className="space-y-4 text-left">
              <div className="flex items-start space-x-3">
                <div className="bg-navy text-white rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-sm font-bold">1</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Access Your Tests</h3>
                  <p className="text-gray-600">
                    Go to the Tests page to start taking tests for your subscribed grade and board.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="bg-navy text-white rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-sm font-bold">2</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Track Your Progress</h3>
                  <p className="text-gray-600">
                    Monitor your performance and improvement over time in your dashboard.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="bg-navy text-white rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-sm font-bold">3</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Manage Subscription</h3>
                  <p className="text-gray-600">
                    View and manage your subscription details anytime from your account.
                  </p>
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
            <Link
              href="/tests"
              className="bg-navy text-white px-8 py-3 rounded-lg font-semibold hover:bg-[#1a2633] transition-colors flex items-center justify-center space-x-2"
            >
              <span>Start Taking Tests</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
            
            <Link
              href="/dashboard"
              className="bg-gray-100 text-gray-700 px-8 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors flex items-center justify-center space-x-2"
            >
              <Home className="w-5 h-5" />
              <span>Go to Dashboard</span>
            </Link>
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
}
