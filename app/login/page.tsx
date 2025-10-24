'use client';

import { useState, useEffect, Suspense } from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Lock, Mail, Menu, X } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import Head from 'next/head';

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginPageSkeleton />}>
      <LoginPageContent />
    </Suspense>
  );
}

function LoginPageSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-cream flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-navy"></div>
    </div>
  );
}

function LoginPageContent() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { signInWithGoogle } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect') || '/dashboard';

  const handleGoogleSignin = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      const { error } = await signInWithGoogle(redirectTo);
      if (error) {
        setError(error.message || 'Failed to sign in with Google');
      }
    } catch (err) {
      setError('Failed to sign in with Google');
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <>
      <Head>
        <link rel="canonical" href="https://successbuds.com/login" />
        <meta name="robots" content="index, follow" />
      </Head>
      <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-cream">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <Link href="/" className="flex items-center space-x-3">
                <Image
                  src="/images/logo-square.jpg"
                  alt="SuccessBuds Logo"
                  width={48}
                  height={48}
                  className="w-12 h-12 rounded-lg object-cover"
                />
                <h1 className="text-2xl font-bold text-gradient">SuccessBuds</h1>
              </Link>
            </div>
            <nav className="hidden md:flex space-x-8">
            </nav>
            
            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
          
          {/* Mobile menu */}
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="md:hidden border-t border-gray-100 pt-4 pb-2"
            >
              <div className="flex flex-col space-y-3">
              </div>
            </motion.div>
          )}
        </div>
      </header>

      {/* Login Form */}
      <div className="flex items-center justify-center px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md"
        >
          {/* Logo */}
          <div className="text-center mb-8">
            <Image
              src="/images/logo-square.jpg"
              alt="SuccessBuds Logo"
              width={80}
              height={80}
              className="mx-auto w-20 h-20 rounded-xl object-cover shadow-lg"
            />
          <h1 className="text-2xl font-bold text-gray-900 mt-4">Get Started</h1>
          <p className="text-gray-600">Sign in with Google to access tests and track your progress</p>
          </div>

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-pink border border-pink text-white px-4 py-3 rounded-lg text-sm mb-6"
            >
              {error}
            </motion.div>
          )}

          {/* Google Signin Button */}
          <button
            onClick={handleGoogleSignin}
            disabled={isLoading}
            className="w-full bg-navy border border-navy text-white py-3 px-4 rounded-lg font-semibold hover:bg-primary-700 focus:ring-2 focus:ring-blue focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            <span>{isLoading ? 'Getting started...' : 'Continue with Google'}</span>
          </button>


          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-600">
              One click to get started. We&apos;ll create your account automatically.
            </p>
          </div>
        </motion.div>
      </div>
      </div>
    </>
  );
} 