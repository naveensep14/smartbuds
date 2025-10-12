import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { CreateQuestionReportData } from '@/types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    
    // Get the current user from the Authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const reportData: CreateQuestionReportData = await request.json();
    
    // Validate required fields
    if (!reportData.testId || !reportData.questionId || !reportData.issueType) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Get test details for context
    const { data: test, error: testError } = await supabase
      .from('tests')
      .select('*')
      .eq('id', reportData.testId)
      .single();

    if (testError || !test) {
      return NextResponse.json({ error: 'Test not found' }, { status: 404 });
    }

    // Create the report
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
      console.error('Error creating question report:', reportError);
      return NextResponse.json({ error: 'Failed to submit report' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      reportId: report.id,
      message: 'Report submitted successfully' 
    });

  } catch (error) {
    console.error('Error in submit report API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
