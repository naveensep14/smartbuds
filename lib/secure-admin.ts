import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { ADMIN_EMAILS } from './admin-config';

// Server-side admin verification
export async function verifyAdminAccess(): Promise<{ isAdmin: boolean; user: any }> {
  try {
    const cookieStore = cookies();

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              );
            } catch {
              // Ignore cookie setting errors in server components
            }
          },
        },
      }
    );

    // Get user from server-side session
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user || !user.email) {
      return { isAdmin: false, user: null };
    }

    // Verify admin status on server
    const isAdmin = ADMIN_EMAILS.includes(user.email.toLowerCase() as any);

    return { isAdmin, user };
  } catch (error) {
    console.error('Error verifying admin access:', error);
    return { isAdmin: false, user: null };
  }
}

// Additional security: Validate email format and domain
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Rate limiting for admin actions (can be enhanced with Redis)
const adminActionAttempts = new Map<string, { count: number; lastAttempt: number }>();

export function checkAdminRateLimit(userEmail: string): boolean {
  const now = Date.now();
  const windowMs = 5 * 60 * 1000; // 5 minutes
  const maxAttempts = 10; // Max 10 admin actions per 5 minutes

  const attempts = adminActionAttempts.get(userEmail);

  if (!attempts) {
    adminActionAttempts.set(userEmail, { count: 1, lastAttempt: now });
    return true;
  }

  // Reset if window has passed
  if (now - attempts.lastAttempt > windowMs) {
    adminActionAttempts.set(userEmail, { count: 1, lastAttempt: now });
    return true;
  }

  // Check if under limit
  if (attempts.count < maxAttempts) {
    attempts.count++;
    attempts.lastAttempt = now;
    return true;
  }

  return false;
}

// Secure admin action wrapper
export async function secureAdminAction<T>(
  action: () => Promise<T>,
  userEmail: string
): Promise<T> {
  // Validate email format
  if (!isValidEmail(userEmail)) {
    throw new Error('Invalid email format');
  }

  // Check rate limit
  if (!checkAdminRateLimit(userEmail)) {
    throw new Error('Rate limit exceeded. Please try again later.');
  }

  // Verify admin access
  const { isAdmin } = await verifyAdminAccess();
  if (!isAdmin) {
    throw new Error('Admin access required');
  }

  // Execute action
  return await action();
}
