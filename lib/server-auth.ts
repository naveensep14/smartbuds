import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { ADMIN_EMAILS } from './admin-config';

export async function createClient() {
  const cookieStore = cookies();

  // Use proxy URL for authentication, fallback to direct Supabase URL
  const proxyUrl = process.env.NEXT_PUBLIC_SUPABASE_PROXY_URL || process.env.NEXT_PUBLIC_SUPABASE_URL!;
  
  return createServerClient(
    proxyUrl,
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
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  );
}

export async function getServerUser() {
  const supabase = await createClient();
  
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error || !user) {
      return null;
    }
    
    return user;
  } catch (error) {
    console.error('Error getting server user:', error);
    return null;
  }
}

export async function isServerAdmin(): Promise<boolean> {
  const user = await getServerUser();
  
  console.log('Server admin check - user:', user?.email);
  
  if (!user || !user.email) {
    console.log('Server admin check - no user or email');
    return false;
  }
  
  // Double-check admin status on server side
  const isAdmin = ADMIN_EMAILS.includes(user.email.toLowerCase() as any);
  console.log('Server admin check - isAdmin:', isAdmin, 'admin emails:', ADMIN_EMAILS);
  
  return isAdmin;
}

export async function requireAdmin() {
  const isAdmin = await isServerAdmin();
  
  if (!isAdmin) {
    throw new Error('Admin access required');
  }
  
  return true;
}
