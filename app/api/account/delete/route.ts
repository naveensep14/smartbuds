import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/server-auth';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Get the authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = user.id;

    console.log(`[DELETE ACCOUNT] Starting deletion for user: ${userId}`);

    // Delete user data from all related tables using admin client
    // Order matters: delete child records first to avoid foreign key constraints
    
    const userEmail = user.email;
    
    // 1. Delete test progress (uses user_email, not user_id)
    const { error: progressError } = await supabaseAdmin
      .from('test_progress')
      .delete()
      .eq('user_email', userEmail);
    
    if (progressError) {
      console.error('[DELETE ACCOUNT] Error deleting test progress:', progressError);
    } else {
      console.log('[DELETE ACCOUNT] Deleted test progress');
    }

    // 2. Delete test results (uses user_id foreign key)
    const { error: resultsError } = await supabaseAdmin
      .from('results')
      .delete()
      .eq('user_id', userId);
    
    if (resultsError) {
      console.error('[DELETE ACCOUNT] Error deleting results:', resultsError);
    } else {
      console.log('[DELETE ACCOUNT] Deleted results (and activity history)');
    }

    // 3. Delete question reports
    const { error: reportsError } = await supabaseAdmin
      .from('question_reports')
      .delete()
      .eq('user_id', userId);
    
    if (reportsError) {
      console.error('[DELETE ACCOUNT] Error deleting question reports:', reportsError);
    } else {
      console.log('[DELETE ACCOUNT] Deleted question reports');
    }

    // 4. Delete profile (this should cascade due to ON DELETE CASCADE)
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .delete()
      .eq('id', userId);
    
    if (profileError) {
      console.error('[DELETE ACCOUNT] Error deleting profile:', profileError);
    } else {
      console.log('[DELETE ACCOUNT] Deleted profile');
    }

    // 5. Delete the auth user - must use admin API
    // Note: Supabase will automatically handle cascade deletion of related auth data
    const { error: deleteUserError } = await supabaseAdmin.auth.admin.deleteUser(userId);
    
    if (deleteUserError) {
      console.error('[DELETE ACCOUNT] Error deleting auth user:', deleteUserError);
      return NextResponse.json(
        { error: 'Failed to delete account. Please contact support.' },
        { status: 500 }
      );
    }

    console.log(`[DELETE ACCOUNT] Successfully deleted user: ${userId}`);

    return NextResponse.json(
      { message: 'Account deleted successfully' },
      { status: 200 }
    );

  } catch (error: any) {
    console.error('[DELETE ACCOUNT] Unexpected error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

