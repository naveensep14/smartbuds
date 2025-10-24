'use client';

import { useEffect } from 'react';

export default function DebugAuth() {
  useEffect(() => {
    console.log('🔍 [DEBUG] Testing Supabase connection...');
    
    // Test Supabase connection
    import('@/lib/supabase').then(({ supabase }) => {
      console.log('🔍 [DEBUG] Supabase client loaded');
      
      // Test auth state
      supabase.auth.getSession().then(({ data, error }) => {
        console.log('🔍 [DEBUG] Current session:', data.session);
        console.log('🔍 [DEBUG] Session error:', error);
      });
      
      // Test OAuth URL generation
      supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`
        }
      }).then(({ data, error }) => {
        console.log('🔍 [DEBUG] OAuth URL:', data.url);
        console.log('🔍 [DEBUG] OAuth error:', error);
      });
    });
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Auth Debug</h1>
      <p>Check the browser console for debug information.</p>
    </div>
  );
}

