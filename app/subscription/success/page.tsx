'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { CheckCircle, ArrowRight, Home } from 'lucide-react';
import Link from 'next/link';
import NavigationHeader from '@/components/NavigationHeader';

function SuccessContent() {
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [subscriptionDetails, setSubscriptionDetails] = useState<any>(null);

  useEffect(() => {
    const verifyPayment = async () => {
      const paymentId = searchParams.get('payment_id');
      const orderId = searchParams.get('order_id');
      
      if (!paymentId || !orderId) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch('/api/subscription/verify-payment', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ paymentId, orderId }),
        });

        const data = await response.json();
        if (data.success) {
          setSubscriptionDetails(data.subscription);
        }
      } catch (error) {
        console.error('Error verifying payment:', error);
      } finally {
        setLoading(false);
      }
    };

    verifyPayment();
  }, [searchParams]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
        <NavigationHeader />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Verifying your payment...</p>
          </div>
        </div>
      </div>
    );
  }

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
          <div className="bg-green-100 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Payment Successful!
          </h1>
          
          <p className="text-xl text-gray-600 mb-8">
            Your subscription has been activated successfully. You now have access to all premium features.
          </p>
        </motion.div>

        {subscriptionDetails && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-white rounded-2xl shadow-lg p-8 mb-8"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Subscription Details</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Plan</h3>
                <p className="text-gray-600">{subscriptionDetails.plan?.name}</p>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Valid Until</h3>
                <p className="text-gray-600">
                  {new Date(subscriptionDetails.subscriptionEndDate).toLocaleDateString()}
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
                  ₹{subscriptionDetails.plan?.priceInr}
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
          className="bg-white rounded-2xl shadow-lg p-8 mb-8"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-6">What&apos;s Next?</h2>
          
          <div className="space-y-4">
            <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
              <div className="bg-orange-100 rounded-full w-10 h-10 flex items-center justify-center">
                <span className="text-orange-600 font-bold">1</span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Access Your Tests</h3>
                <p className="text-gray-600">Start taking CBSE and ICSE tests immediately</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
              <div className="bg-orange-100 rounded-full w-10 h-10 flex items-center justify-center">
                <span className="text-orange-600 font-bold">2</span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Track Progress</h3>
                <p className="text-gray-600">Monitor your performance and improvement</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
              <div className="bg-orange-100 rounded-full w-10 h-10 flex items-center justify-center">
                <span className="text-orange-600 font-bold">3</span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Earn Achievements</h3>
                <p className="text-gray-600">Unlock badges and climb the leaderboard</p>
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
            className="inline-flex items-center px-8 py-4 bg-orange-600 text-white font-semibold rounded-xl hover:bg-orange-700 transition-colors duration-300"
          >
            <ArrowRight className="w-5 h-5 mr-2" />
            Start Taking Tests
          </Link>
          
          <Link
            href="/dashboard"
            className="inline-flex items-center px-8 py-4 border-2 border-orange-600 text-orange-600 font-semibold rounded-xl hover:bg-orange-600 hover:text-white transition-all duration-300"
          >
            <Home className="w-5 h-5 mr-2" />
            Go to Dashboard
          </Link>
        </motion.div>
      </div>
    </div>
  );
}

export default function SubscriptionSuccessPage() {
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
      <SuccessContent />
    </Suspense>
  );
}