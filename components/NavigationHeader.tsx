'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';

interface NavigationHeaderProps {
  showBackButton?: boolean;
  backButtonText?: string;
  backButtonHref?: string;
}

export default function NavigationHeader({ 
  showBackButton = false, 
  backButtonText = "Back to Home",
  backButtonHref = "/"
}: NavigationHeaderProps) {
  const { user, signOut } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center space-x-3">
            <img
              src="https://i.ibb.co/6RcwZjJr/logo-square.jpg"
              alt="SuccessBuds Logo"
              className="w-12 h-12 rounded-lg object-cover"
            />
            <h1 className="text-2xl font-bold text-gradient">SuccessBuds</h1>
          </div>
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/help" className="text-gray-600 hover:text-orange-600 transition-colors">
              Help
            </Link>
            {user ? (
              <div className="flex items-center space-x-4">
                <Link href="/dashboard" className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors">
                  Dashboard
                </Link>
                <div className="flex items-center space-x-2">
                  <img
                    src={user.user_metadata?.avatar_url || `https://ui-avatars.com/api/?name=${user.email}&background=orange&color=white`}
                    alt="Profile"
                    className="w-8 h-8 rounded-full"
                  />
                  <div className="text-right">
                    <span className="text-sm font-medium text-gray-700 block">
                      {user.user_metadata?.full_name || user.email?.split('@')[0]}
                    </span>
                    <button
                      onClick={handleSignOut}
                      className="text-xs text-gray-500 hover:text-red-600 transition-colors"
                    >
                      Sign Out
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <Link href="/login" className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors">
                Get Started
              </Link>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
