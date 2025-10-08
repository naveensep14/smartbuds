import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ error: 'Supabase configuration missing' }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    const { tests } = await request.json();

    if (!tests || !Array.isArray(tests)) {
      return NextResponse.json({ error: 'No tests provided' }, { status: 400 });
    }

    let successCount = 0;
    let errorCount = 0;
    const errors: string[] = [];

    for (const test of tests) {
      try {
        // Transform the test data to match database schema
        const testData = {
          title: test.title,
          description: test.description,
          subject: test.subject,
          grade: test.grade,
          board: test.board,
          timelimit: test.duration || test.timelimit,
          questions: test.questions.map((q: any) => ({
            id: q.id || Date.now().toString() + Math.random().toString(36).substr(2, 9),
            question: q.question,
            options: q.options,
            correctAnswer: q.correctAnswer,
            explanation: q.explanation,
            image: q.image || null
          }))
        };

        // Insert into database
        const { data, error } = await supabase
          .from('tests')
          .insert(testData)
          .select();

        if (error) {
          errors.push(`Error importing ${test.title}: ${error.message}`);
          errorCount++;
        } else {
          successCount++;
        }

      } catch (err) {
        errors.push(`Error processing ${test.title}: ${err instanceof Error ? err.message : 'Unknown error'}`);
        errorCount++;
      }
    }

    return NextResponse.json({
      success: true,
      message: `Successfully saved ${successCount} tests. ${errorCount} tests failed.`,
      successCount,
      errorCount,
      errors: errors.length > 0 ? errors : undefined
    });

  } catch (error) {
    console.error('Save tests error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to save tests' },
      { status: 500 }
    );
  }
}
