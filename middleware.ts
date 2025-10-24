import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { ADMIN_EMAILS } from './lib/admin-config';

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Check if user is authenticated
  const { data: { user }, error } = await supabase.auth.getUser();

  // Check if user is admin
  const isAdmin = user?.email && ADMIN_EMAILS.includes(user.email.toLowerCase() as any);

  // Protect admin routes
  if (request.nextUrl.pathname.startsWith('/admin')) {
    if (!user) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', request.nextUrl.pathname);
      return NextResponse.redirect(loginUrl);
    }

    if (!isAdmin) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  // For protected routes that need profile completion check
  const requiresProfileCheck = 
    request.nextUrl.pathname.startsWith('/dashboard') ||
    request.nextUrl.pathname.startsWith('/tests') ||
    request.nextUrl.pathname.startsWith('/my-results');

  if (requiresProfileCheck) {
    if (!user) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', request.nextUrl.pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Only check profile completion for non-admin users, and only once
    if (!isAdmin) {
      try {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('student_name, grade, board, profile_completed')
          .eq('id', user.id)
          .single();

        if (error || !profile || !profile.profile_completed || !profile.student_name || !profile.grade || !profile.board) {
          return NextResponse.redirect(new URL('/complete-profile', request.url));
        }
      } catch (error) {
        console.error('Error checking profile completion:', error);
        return NextResponse.redirect(new URL('/complete-profile', request.url));
      }
    }
  }

  return response;
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/dashboard/:path*',
    '/tests/:path*',
    '/my-results/:path*',
    '/complete-profile/:path*',
    '/api/admin/:path*'
  ],
};
