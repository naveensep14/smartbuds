'use client';

import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface AdminRouteProps {
  children: React.ReactNode;
}

export default function AdminRoute({ children }: AdminRouteProps) {
  const { user, isAdmin, loading } = useAuth();
  const [serverVerified, setServerVerified] = useState<boolean | null>(null);
  const router = useRouter();

  // Server-side verification
  useEffect(() => {
    const verifyAdmin = async () => {
      try {
        const response = await fetch('/api/admin/verify');
        const data = await response.json();
        setServerVerified(data.isAdmin === true);
      } catch (error) {
        console.error('Admin verification failed:', error);
        setServerVerified(false);
      }
    };

    if (user && isAdmin) {
      verifyAdmin();
    } else {
      setServerVerified(false);
    }
  }, [user, isAdmin]);

  useEffect(() => {
    if (!loading && serverVerified !== null) {
      if (!user) {
        // User not logged in, redirect to login
        router.push('/login');
      } else if (!serverVerified) {
        // Server verification failed, redirect to dashboard
        router.push('/dashboard');
      }
    }
  }, [user, serverVerified, loading, router]);

  // Show loading while checking authentication
  if (loading || serverVerified === null) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Verifying admin access...</p>
        </div>
      </div>
    );
  }

  // Show nothing while redirecting
  if (!user || !serverVerified) {
    return null;
  }

  // User is verified admin, show the admin content
  return <>{children}</>;
}
