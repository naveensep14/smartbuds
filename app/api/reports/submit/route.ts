import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { CreateQuestionReportData } from '@/types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 [REPORT API] Starting report submission...');
    
    // First, verify the user with the anon client
    const anonClient = createClient(supabaseUrl, supabaseAnonKey);
    
    // Get the current user from the Authorization header
    const authHeader = request.headers.get('authorization');
    console.log('🔍 [REPORT API] Auth header present:', !!authHeader);
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('❌ [REPORT API] No valid auth header');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const token = authHeader.replace('Bearer ', '');
    console.log('🔍 [REPORT API] Token length:', token.length);
    
    const { data: { user }, error: authError } = await anonClient.auth.getUser(token);
    if (authError || !user) {
      console.log('❌ [REPORT API] Auth error:', authError?.message);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    console.log('✅ [REPORT API] User authenticated:', user.id);
    
    // Now use service role key to insert data (bypasses RLS)
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const reportData: CreateQuestionReportData = await request.json();
    console.log('🔍 [REPORT API] Report data received:', {
      testId: reportData.testId,
      questionId: reportData.questionId,
      issueType: reportData.issueType
    });
    
    // Validate required fields
    if (!reportData.testId || !reportData.questionId || !reportData.issueType) {
      console.log('❌ [REPORT API] Missing required fields');
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Get test details for context
    console.log('🔍 [REPORT API] Fetching test details...');
    const { data: test, error: testError } = await supabase
      .from('tests')
      .select('*')
      .eq('id', reportData.testId)
      .single();

    if (testError || !test) {
      console.log('❌ [REPORT API] Test not found:', testError?.message);
      return NextResponse.json({ error: 'Test not found' }, { status: 404 });
    }
    
    console.log('✅ [REPORT API] Test found:', test.title);

    // Create the report
    console.log('🔍 [REPORT API] Creating report...');
    const { data: report, error: reportError } = await supabase
      .from('question_reports')
      .insert({
        user_id: user.id,
        test_id: reportData.testId,
        question_id: reportData.questionId,
        question_text: reportData.questionText,
        question_options: reportData.questionOptions,
        correct_answer: reportData.correctAnswer,
        user_answer: reportData.userAnswer,
        issue_type: reportData.issueType,
        description: reportData.description,
        test_title: test.title,
        test_subject: test.subject,
        test_grade: test.grade,
        test_board: test.board,
        test_chapter: test.chapter || null,
        test_duration: test.duration,
        status: 'pending'
      })
      .select()
      .single();

    if (reportError) {
      console.error('❌ [REPORT API] Error creating question report:', reportError);
      console.error('❌ [REPORT API] Error details:', reportError.details);
      console.error('❌ [REPORT API] Error code:', reportError.code);
      console.error('❌ [REPORT API] Error hint:', reportError.hint);
      console.error('❌ [REPORT API] Error message:', reportError.message);
      
      return NextResponse.json({ 
        error: 'Failed to submit report',
        details: reportError.message,
        code: reportError.code
      }, { status: 500 });
    }
    
    if (!report) {
      console.error('❌ [REPORT API] Report created but no data returned');
      return NextResponse.json({ 
        error: 'Failed to create report',
        details: 'No data returned after insert'
      }, { status: 500 });
    }
    
    console.log('✅ [REPORT API] Report created successfully:', report.id);

    return NextResponse.json({ 
      success: true, 
      reportId: report.id,
      message: 'Report submitted successfully' 
    });

  } catch (error: any) {
    console.error('❌ [REPORT API] Unexpected error in submit report API:', error);
    console.error('❌ [REPORT API] Error stack:', error?.stack);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error?.message || 'Unknown error'
    }, { status: 500 });
  }
}
