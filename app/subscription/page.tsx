'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Check, Star, CreditCard, Shield, Clock } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import { subscriptionService } from '@/lib/subscription';
import { SubscriptionPlan } from '@/types';
import NavigationHeader from '@/components/NavigationHeader';

export default function SubscriptionPage() {
  const { user, loading: authLoading } = useAuth();
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedGrade, setSelectedGrade] = useState('');
  const [selectedBoard, setSelectedBoard] = useState('');
  const [filteredPlans, setFilteredPlans] = useState<SubscriptionPlan[]>([]);

  useEffect(() => {
    const loadPlans = async () => {
      try {
        setLoading(true);
        const allPlans = await subscriptionService.getAllPlans();
        setPlans(allPlans);
        
        // Extract unique grades and boards
        const grades = Array.from(new Set(allPlans.map(plan => plan.grade))).sort();
        const boards = Array.from(new Set(allPlans.map(plan => plan.board))).sort();
        
        if (grades.length > 0 && !selectedGrade) {
          setSelectedGrade(grades[0]);
        }
        if (boards.length > 0 && !selectedBoard) {
          setSelectedBoard(boards[0]);
        }
      } catch (error) {
        console.error('Error loading subscription plans:', error);
      } finally {
        setLoading(false);
      }
    };

    loadPlans();
  }, []);

  useEffect(() => {
    if (selectedGrade && selectedBoard) {
      const filtered = plans.filter(
        plan => plan.grade === selectedGrade && plan.board === selectedBoard
      );
      setFilteredPlans(filtered);
    }
  }, [selectedGrade, selectedBoard, plans]);

  const handleSubscribe = async (plan: SubscriptionPlan) => {
    if (!user) {
      // Redirect to login
      window.location.href = '/login';
      return;
    }

    try {
      // Create Razorpay order
      const response = await fetch('/api/subscription/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planId: plan.id,
          amount: plan.priceInr,
        }),
      });

      const orderData = await response.json();
      
      if (orderData.error) {
        alert(orderData.error);
        return;
      }

      // Load Razorpay script
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => {
        const options = {
          key: orderData.key,
          amount: orderData.amount,
          currency: orderData.currency,
          name: orderData.name,
          description: orderData.description,
          order_id: orderData.orderId,
          prefill: orderData.prefill,
          theme: orderData.theme,
          handler: function (response: any) {
            // Payment successful
            window.location.href = `/subscription/success?payment_id=${response.razorpay_payment_id}&order_id=${response.razorpay_order_id}`;
          },
          modal: {
            ondismiss: function() {
              // Payment cancelled
              window.location.href = `/subscription/cancel?plan_id=${plan.id}`;
            }
          }
        };

        const rzp = new (window as any).Razorpay(options);
        rzp.open();
      };
      document.head.appendChild(script);
    } catch (error) {
      console.error('Error creating Razorpay order:', error);
      alert('Failed to initiate payment. Please try again.');
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
        <NavigationHeader />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-navy mx-auto mb-4"></div>
              <p className="text-gray-600">Loading subscription plans...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const grades = Array.from(new Set(plans.map(plan => plan.grade))).sort();
  const boards = Array.from(new Set(plans.map(plan => plan.board))).sort();

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
      <NavigationHeader />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Choose Your Annual Subscription
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Get unlimited access to all tests for your grade and board for a full year
            </p>
          </motion.div>

          {/* Benefits */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
          >
            <div className="flex items-center space-x-3 bg-white rounded-lg p-4 shadow-sm">
              <div className="bg-green-100 p-2 rounded-lg">
                <Check className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Unlimited Tests</h3>
                <p className="text-sm text-gray-600">Access all tests for your grade</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 bg-white rounded-lg p-4 shadow-sm">
              <div className="bg-blue-100 p-2 rounded-lg">
                <Clock className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Full Year Access</h3>
                <p className="text-sm text-gray-600">Valid until April 30th</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 bg-white rounded-lg p-4 shadow-sm">
              <div className="bg-purple-100 p-2 rounded-lg">
                <Shield className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Secure Payment</h3>
                <p className="text-sm text-gray-600">Powered by Stripe</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Grade and Board Selection */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="bg-white rounded-xl shadow-lg p-6 mb-8"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Select Your Grade & Board</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Grade
              </label>
              <select
                value={selectedGrade}
                onChange={(e) => setSelectedGrade(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy focus:border-navy"
              >
                {grades.map(grade => (
                  <option key={grade} value={grade}>Class {grade}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Board
              </label>
              <select
                value={selectedBoard}
                onChange={(e) => setSelectedBoard(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy focus:border-navy"
              >
                {boards.map(board => (
                  <option key={board} value={board}>{board}</option>
                ))}
              </select>
            </div>
          </div>
        </motion.div>

        {/* Subscription Plans */}
        {filteredPlans.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filteredPlans.map((plan, index) => (
              <div
                key={plan.id}
                className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow"
              >
                <div className="text-center mb-6">
                  <div className="bg-navy text-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <Star className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                  <div className="text-3xl font-bold text-navy mb-2">
                    ₹{plan.priceInr}
                  </div>
                  <p className="text-gray-600">per year</p>
                </div>

                <div className="space-y-4 mb-6">
                  <div className="flex items-center space-x-3">
                    <Check className="w-5 h-5 text-green-600" />
                    <span className="text-gray-700">Unlimited test access</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Check className="w-5 h-5 text-green-600" />
                    <span className="text-gray-700">All subjects included</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Check className="w-5 h-5 text-green-600" />
                    <span className="text-gray-700">Progress tracking</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Check className="w-5 h-5 text-green-600" />
                    <span className="text-gray-700">Valid until April 30th</span>
                  </div>
                </div>

                <button
                  onClick={() => handleSubscribe(plan)}
                  className="w-full bg-navy text-white py-3 px-6 rounded-lg font-semibold hover:bg-[#1a2633] transition-colors flex items-center justify-center space-x-2"
                >
                  <CreditCard className="w-5 h-5" />
                  <span>Subscribe Now</span>
                </button>
              </div>
            ))}
          </motion.div>
        )}

        {filteredPlans.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-center py-12"
          >
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No plans available
              </h3>
              <p className="text-gray-600">
                Please select a different grade or board combination.
              </p>
            </div>
          </motion.div>
        )}

        {/* FAQ Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-16 bg-white rounded-xl shadow-lg p-8"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">When does my subscription expire?</h3>
              <p className="text-gray-600">
                All subscriptions expire on April 30th, regardless of when you subscribe. This ensures all students have access until the end of the academic year.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Can I cancel my subscription?</h3>
              <p className="text-gray-600">
                Yes, you can cancel your subscription at any time. You&apos;ll continue to have access until your current period ends.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">What payment methods do you accept?</h3>
              <p className="text-gray-600">
                We accept all major credit and debit cards through our secure Stripe payment system.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Is my payment information secure?</h3>
              <p className="text-gray-600">
                Yes, we use Stripe for all payments, which is PCI DSS compliant and trusted by millions of businesses worldwide.
              </p>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
