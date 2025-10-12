import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getServerUser } from '@/lib/server-auth';
import { ADMIN_EMAILS } from '@/lib/admin-config';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function GET(request: NextRequest) {
  try {
    // Get the current user using server-side auth
    const user = await getServerUser();
    
    console.log('🔍 [ADMIN REPORTS] Auth check:', { 
      hasUser: !!user, 
      userId: user?.id,
      email: user?.email
    });
    
    if (!user || !user.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const isAdmin = ADMIN_EMAILS.includes(user.email.toLowerCase());

    console.log('🔍 [ADMIN REPORTS] Admin check:', { 
      email: user.email,
      isAdmin
    });

    if (!isAdmin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    // Use service role client to bypass RLS
    const adminClient = createClient(supabaseUrl, supabaseServiceKey);

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const issueType = searchParams.get('issueType');
    const limit = parseInt(searchParams.get('limit') || '50');

    console.log('🔍 [ADMIN REPORTS] Fetching reports with filters:', { status, issueType, limit });

    // Build query using service role client to bypass RLS
    let query = adminClient
      .from('question_reports')
      .select(`
        *,
        profiles:user_id (
          student_name,
          email,
          grade,
          board
        )
      `)
      .order('reported_at', { ascending: false })
      .limit(limit);

    // Apply filters
    if (status) {
      query = query.eq('status', status);
    }
    if (issueType) {
      query = query.eq('issue_type', issueType);
    }

    const { data: reports, error } = await query;

    if (error) {
      console.error('❌ [ADMIN REPORTS] Error fetching reports:', error);
      return NextResponse.json({ 
        error: 'Failed to fetch reports',
        details: error.message,
        code: error.code
      }, { status: 500 });
    }

    console.log('✅ [ADMIN REPORTS] Fetched reports:', reports?.length || 0);

    return NextResponse.json({ reports: reports || [] });

  } catch (error) {
    console.error('Error in admin reports API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    // Get the current user using server-side auth
    const user = await getServerUser();
    
    if (!user || !user.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const isAdmin = ADMIN_EMAILS.includes(user.email.toLowerCase());
    
    if (!isAdmin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    // Use service role client to bypass RLS
    const adminClient = createClient(supabaseUrl, supabaseServiceKey);

    const { reportId, status, adminNotes } = await request.json();

    if (!reportId || !status) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Update report status
    const updateData: any = {
      status,
      admin_notes: adminNotes || null
    };

    if (status === 'resolved') {
      updateData.resolved_at = new Date().toISOString();
      updateData.resolved_by = user.id;
    }

    const { data: report, error: updateError } = await adminClient
      .from('question_reports')
      .update(updateData)
      .eq('id', reportId)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating report:', updateError);
      return NextResponse.json({ error: 'Failed to update report' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      report,
      message: 'Report updated successfully' 
    });

  } catch (error) {
    console.error('Error in admin reports update API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Get the current user using server-side auth
    const user = await getServerUser();
    
    if (!user || !user.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const isAdmin = ADMIN_EMAILS.includes(user.email.toLowerCase());
    
    if (!isAdmin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    // Use service role client to bypass RLS
    const adminClient = createClient(supabaseUrl, supabaseServiceKey);

    const { reportId } = await request.json();

    if (!reportId) {
      return NextResponse.json({ error: 'Report ID is required' }, { status: 400 });
    }

    // Delete the report using service role client
    const { error: deleteError } = await adminClient
      .from('question_reports')
      .delete()
      .eq('id', reportId);

    if (deleteError) {
      console.error('Error deleting report:', deleteError);
      return NextResponse.json({ error: 'Failed to delete report' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Report deleted successfully' 
    });

  } catch (error) {
    console.error('Error in admin reports delete API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
