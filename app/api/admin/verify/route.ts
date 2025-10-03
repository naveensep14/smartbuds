import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { ADMIN_EMAILS } from '@/lib/admin-config';

export async function GET(request: NextRequest) {
  try {
    console.log('Admin verify API called');
    
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              // Don't actually set cookies in API routes
            });
          },
        },
      }
    );

    const { data: { user }, error } = await supabase.auth.getUser();
    
    console.log('API - User:', user?.email, 'Error:', error);
    
    if (error || !user || !user.email) {
      return NextResponse.json({
        isAdmin: false,
        error: 'Not authenticated',
        timestamp: new Date().toISOString()
      });
    }

    const isAdmin = ADMIN_EMAILS.includes(user.email.toLowerCase() as any);
    console.log('API - IsAdmin:', isAdmin, 'Email:', user.email);
    
    return NextResponse.json({
      isAdmin,
      user: { email: user.email },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Admin verification error:', error);
    return NextResponse.json(
      { isAdmin: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
