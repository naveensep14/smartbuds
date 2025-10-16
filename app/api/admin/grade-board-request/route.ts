import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userEmail, userName, requestedGrade, requestedBoard, message } = body;

    // Validate required fields
    if (!userEmail || !requestedGrade || !requestedBoard) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Store the request in the database
    const { data, error } = await supabaseAdmin
      .from('grade_board_requests')
      .insert({
        user_email: userEmail,
        user_name: userName,
        requested_grade: requestedGrade,
        requested_board: requestedBoard,
        message: message || '',
        status: 'pending',
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('Error storing grade/board request:', error);
      return NextResponse.json(
        { error: 'Failed to store request' },
        { status: 500 }
      );
    }

    // TODO: Send email notification to admin
    // You can integrate with email services like SendGrid, Resend, etc.
    console.log('Grade/Board Request:', {
      userEmail,
      userName,
      requestedGrade,
      requestedBoard,
      message,
    });

    return NextResponse.json({
      success: true,
      message: 'Request submitted successfully',
      requestId: data.id,
    });

  } catch (error) {
    console.error('Error processing grade/board request:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Get all pending requests for admin review
    const { data, error } = await supabaseAdmin
      .from('grade_board_requests')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching grade/board requests:', error);
      return NextResponse.json(
        { error: 'Failed to fetch requests' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      requests: data || [],
    });

  } catch (error) {
    console.error('Error fetching grade/board requests:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
