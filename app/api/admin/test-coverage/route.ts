import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { ADMIN_EMAILS } from '@/lib/admin-config';

export async function GET(request: NextRequest) {
  try {
    // Create Supabase client
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              request.cookies.set(name, value)
            );
          },
        },
      }
    );

    // Verify admin authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!user.email || !ADMIN_EMAILS.includes(user.email.toLowerCase() as any)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Fetch all tests
    const { data: tests, error: testsError } = await supabase
      .from('tests')
      .select('subject, grade, board')
      .order('subject', { ascending: true });

    if (testsError) {
      console.error('Error fetching tests:', testsError);
      return NextResponse.json(
        { error: 'Failed to fetch tests' },
        { status: 500 }
      );
    }

    // Group tests by subject, grade, and board
    const coverage: Record<string, Record<string, Record<string, number>>> = {};
    
    tests?.forEach(test => {
      const subject = test.subject || 'Unknown';
      const grade = test.grade || 'Unknown';
      const board = test.board || 'Unknown';

      if (!coverage[subject]) {
        coverage[subject] = {};
      }
      if (!coverage[subject][board]) {
        coverage[subject][board] = {};
      }
      if (!coverage[subject][board][grade]) {
        coverage[subject][board][grade] = 0;
      }
      coverage[subject][board][grade]++;
    });

    // Get unique values for filters
    const subjects = [...new Set(tests?.map(t => t.subject).filter(Boolean))].sort();
    const grades = [...new Set(tests?.map(t => t.grade).filter(Boolean))].sort();
    const boards = [...new Set(tests?.map(t => t.board).filter(Boolean))].sort();

    return NextResponse.json({
      coverage,
      subjects,
      grades,
      boards,
      totalTests: tests?.length || 0
    });

  } catch (error) {
    console.error('Error in test coverage API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

