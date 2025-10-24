import { NextRequest, NextResponse } from 'next/server';
import { EmailService } from '@/lib/email-service';
import { ADMIN_EMAILS } from '@/lib/admin-config';

export async function POST(request: NextRequest) {
  try {
    // Get the authorization header
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify the user is authenticated
    const token = authHeader.replace('Bearer ', '');
    const { createClient } = await import('@supabase/supabase-js');
    
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    if (!user.email || !ADMIN_EMAILS.includes(user.email.toLowerCase() as any)) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    // Parse request body
    const { 
      userEmail, 
      userName, 
      subject, 
      message, 
      adminName 
    } = await request.json();

    // Validate required fields
    if (!userEmail || !userName || !subject || !message) {
      return NextResponse.json({ 
        error: 'Missing required fields: userEmail, userName, subject, message' 
      }, { status: 400 });
    }

    // Send reply email
    const result = await EmailService.sendReplyToUser(
      userEmail,
      userName,
      subject,
      message,
      adminName || 'SuccessBuds Support'
    );

    if (result.success) {
      return NextResponse.json({ 
        success: true, 
        messageId: result.messageId,
        message: 'Email sent successfully' 
      });
    } else {
      return NextResponse.json({ 
        error: 'Failed to send email',
        details: result.error 
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Error in admin email API:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

