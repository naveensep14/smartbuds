'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, Mail, MessageSquare, Bug, HelpCircle, CheckCircle, AlertCircle } from 'lucide-react';
import NavigationHeader from '@/components/NavigationHeader';

export default function HelpPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    category: 'general'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setSubmitStatus('success');
        setFormData({
          name: '',
          email: '',
          subject: '',
          message: '',
          category: 'general'
        });
      } else {
        setSubmitStatus('error');
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const categories = [
    { value: 'general', label: 'General Question', icon: HelpCircle },
    { value: 'bug', label: 'Report a Bug', icon: Bug },
    { value: 'feature', label: 'Feature Request', icon: MessageSquare },
    { value: 'technical', label: 'Technical Support', icon: Mail },
    { value: 'feedback', label: 'Feedback', icon: MessageSquare }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
      <NavigationHeader />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            Help & Support
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            We&apos;re here to help! Send us your questions, feedback, or report any issues you&apos;re experiencing.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2"
          >
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-6">
                Send us a Message
              </h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Category Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    What can we help you with?
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {categories.map((category) => {
                      const IconComponent = category.icon;
                      return (
                        <label
                          key={category.value}
                          className={`flex items-center space-x-2 p-3 rounded-lg border cursor-pointer transition-all ${
                            formData.category === category.value
                              ? 'border-orange-500 bg-orange-50 text-orange-700'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <input
                            type="radio"
                            name="category"
                            value={category.value}
                            checked={formData.category === category.value}
                            onChange={handleInputChange}
                            className="sr-only"
                          />
                          <IconComponent className="w-4 h-4" />
                          <span className="text-sm font-medium">{category.label}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* Name and Email */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                      Your Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                      placeholder="Enter your name"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                      placeholder="your.email@example.com"
                    />
                  </div>
                </div>

                {/* Subject */}
                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                    Subject *
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                    placeholder="Brief description of your message"
                  />
                </div>

                {/* Message */}
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                    Message *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    required
                    rows={6}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all resize-none"
                    placeholder="Please provide as much detail as possible..."
                  />
                </div>

                {/* Submit Button */}
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-500">
                    * Required fields
                  </p>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-semibold transition-all ${
                      isSubmitting
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-orange-600 hover:bg-orange-700 text-white'
                    }`}
                  >
                    <Send className="w-5 h-5" />
                    <span>{isSubmitting ? 'Sending...' : 'Send Message'}</span>
                  </button>
                </div>

                {/* Status Messages */}
                {submitStatus === 'success' && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center space-x-2 p-4 bg-green-50 border border-green-200 rounded-lg"
                  >
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="text-green-700">
                      Thank you! Your message has been sent successfully. We&apos;ll get back to you soon.
                    </span>
                  </motion.div>
                )}

                {submitStatus === 'error' && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center space-x-2 p-4 bg-red-50 border border-red-200 rounded-lg"
                  >
                    <AlertCircle className="w-5 h-5 text-red-600" />
                    <span className="text-red-700">
                      Sorry, there was an error sending your message. Please try again.
                    </span>
                  </motion.div>
                )}
              </form>
            </div>
          </motion.div>

          {/* Help Information */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="space-y-6"
          >

             {/* FAQ */}
             <div className="bg-white rounded-2xl shadow-xl p-6">
               <h3 className="text-xl font-semibold text-gray-800 mb-4">
                 Quick Help
               </h3>
               <div className="space-y-4">
                 <div>
                   <h4 className="font-medium text-gray-800 mb-2">How do I take a test?</h4>
                   <p className="text-sm text-gray-600">
                     Go to the Tests page, select a test, and click &quot;Start Test&quot;. You can pause and resume anytime.
                   </p>
                 </div>
                 <div>
                   <h4 className="font-medium text-gray-800 mb-2">Can I retake a test?</h4>
                   <p className="text-sm text-gray-600">
                     Yes! You can retake any test as many times as you want to improve your score.
                   </p>
                 </div>
                 <div>
                   <h4 className="font-medium text-gray-800 mb-2">How do I view my results?</h4>
                   <p className="text-sm text-gray-600">
                     Check the &quot;My Results&quot; page to see all your test scores and progress.
                   </p>
                 </div>
                 <div>
                   <h4 className="font-medium text-gray-800 mb-2">Can I print tests?</h4>
                   <p className="text-sm text-gray-600">
                     Test printing and answer keys are available to administrators only. Contact your teacher or administrator if you need printed materials.
                   </p>
                 </div>
                 <div>
                   <h4 className="font-medium text-gray-800 mb-2">What if I lose internet connection?</h4>
                   <p className="text-sm text-gray-600">
                     Your progress is saved automatically. You can resume where you left off when you reconnect.
                   </p>
                 </div>
                 <div>
                   <h4 className="font-medium text-gray-800 mb-2">How are tests scored?</h4>
                   <p className="text-sm text-gray-600">
                     Tests are scored based on correct answers. You&apos;ll see your percentage score and detailed results.
                   </p>
                 </div>
                 <div>
                   <h4 className="font-medium text-gray-800 mb-2">Can I see the correct answers?</h4>
                   <p className="text-sm text-gray-600">
                     Yes! After completing a test, you can review all questions with correct answers and explanations.
                   </p>
                 </div>
                 <div>
                   <h4 className="font-medium text-gray-800 mb-2">Is there a time limit?</h4>
                   <p className="text-sm text-gray-600">
                     Each test has a suggested time limit, but you can take as long as you need to complete it.
                   </p>
                 </div>
                 <div>
                   <h4 className="font-medium text-gray-800 mb-2">How do I track my progress?</h4>
                   <p className="text-sm text-gray-600">
                     Visit your dashboard to see recent activity and overall progress across all tests.
                   </p>
                 </div>
                 <div>
                   <h4 className="font-medium text-gray-800 mb-2">Can I share my results?</h4>
                   <p className="text-sm text-gray-600">
                     Your results are private to your account. You can view them anytime in the &quot;My Results&quot; section.
                   </p>
                 </div>
               </div>
             </div>

          </motion.div>
        </div>
      </div>
    </div>
  );
}