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
  
  console.log('🔒 [MIDDLEWARE LOG] User:', user?.email, 'Error:', error, 'Path:', request.nextUrl.pathname);
  console.log('🔒 [MIDDLEWARE LOG] Method:', request.method);
  console.log('🔒 [MIDDLEWARE LOG] Headers:', Object.fromEntries(request.headers.entries()));

  // Protect admin routes
  if (request.nextUrl.pathname.startsWith('/admin')) {
    if (!user) {
      // Not authenticated, redirect to login
      return NextResponse.redirect(new URL('/login', request.url));
    }

    // Check if user is admin
    if (!user.email || !ADMIN_EMAILS.includes(user.email.toLowerCase() as any)) {
      // Not admin, redirect to dashboard
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  // Protect dashboard routes (require authentication)
  if (request.nextUrl.pathname.startsWith('/dashboard')) {
    if (!user) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // Protect tests routes (require authentication)
  if (request.nextUrl.pathname.startsWith('/tests')) {
    if (!user) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // Protect my-results route (require authentication)
  if (request.nextUrl.pathname.startsWith('/my-results')) {
    if (!user) {
      return NextResponse.redirect(new URL('/login', request.url));
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
    '/api/admin/:path*'
  ],
};
