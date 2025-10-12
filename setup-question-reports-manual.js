require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseAnonKey || !serviceRoleKey) {
  console.error('❌ Supabase environment variables are not set.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function setupQuestionReports() {
  console.log('🔄 Setting up question_reports table...');

  try {
    // Create the table
    const { error: createError } = await supabase.rpc('exec_sql', {
      sql: `
        -- Create question_reports table
        CREATE TABLE IF NOT EXISTS question_reports (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
          test_id UUID REFERENCES tests(id) ON DELETE CASCADE NOT NULL,
          question_id TEXT NOT NULL,
          question_text TEXT NOT NULL,
          question_options JSONB NOT NULL,
          correct_answer INTEGER NOT NULL,
          user_answer INTEGER,
          issue_type TEXT NOT NULL CHECK (issue_type IN (
            'incorrect_answer',
            'unclear_question',
            'typo_error',
            'wrong_explanation',
            'inappropriate_content',
            'technical_error',
            'other'
          )),
          description TEXT,
          test_title TEXT NOT NULL,
          test_subject TEXT NOT NULL,
          test_grade TEXT NOT NULL,
          test_board TEXT NOT NULL,
          test_chapter INTEGER,
          test_duration INTEGER,
          reported_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved', 'dismissed')),
          admin_notes TEXT,
          resolved_at TIMESTAMP WITH TIME ZONE,
          resolved_by UUID REFERENCES auth.users(id)
        );
      `
    });

    if (createError) {
      console.error('❌ Error creating table:', createError);
      return;
    }

    console.log('✅ Table created successfully');

    // Create indexes
    const { error: indexError } = await supabase.rpc('exec_sql', {
      sql: `
        -- Create indexes for better performance
        CREATE INDEX IF NOT EXISTS idx_question_reports_user_id ON question_reports(user_id);
        CREATE INDEX IF NOT EXISTS idx_question_reports_test_id ON question_reports(test_id);
        CREATE INDEX IF NOT EXISTS idx_question_reports_status ON question_reports(status);
        CREATE INDEX IF NOT EXISTS idx_question_reports_issue_type ON question_reports(issue_type);
        CREATE INDEX IF NOT EXISTS idx_question_reports_reported_at ON question_reports(reported_at);
      `
    });

    if (indexError) {
      console.error('❌ Error creating indexes:', indexError);
      return;
    }

    console.log('✅ Indexes created successfully');

    // Enable RLS
    const { error: rlsError } = await supabase.rpc('exec_sql', {
      sql: `
        -- Enable RLS
        ALTER TABLE question_reports ENABLE ROW LEVEL SECURITY;
      `
    });

    if (rlsError) {
      console.error('❌ Error enabling RLS:', rlsError);
      return;
    }

    console.log('✅ RLS enabled successfully');

    // Create RLS policies
    const { error: policyError } = await supabase.rpc('exec_sql', {
      sql: `
        -- RLS Policies
        -- Users can view their own reports
        CREATE POLICY "Users can view their own reports" ON question_reports
          FOR SELECT USING (auth.uid() = user_id);

        -- Users can insert their own reports
        CREATE POLICY "Users can insert their own reports" ON question_reports
          FOR INSERT WITH CHECK (auth.uid() = user_id);

        -- Admins can view all reports
        CREATE POLICY "Admins can view all reports" ON question_reports
          FOR ALL USING (
            EXISTS (
              SELECT 1 FROM profiles 
              WHERE id = auth.uid() 
              AND email IN ('naveensep14@gmail.com', 'admin@successbuds.com')
            )
          );

        -- Admins can update report status
        CREATE POLICY "Admins can update reports" ON question_reports
          FOR UPDATE USING (
            EXISTS (
              SELECT 1 FROM profiles 
              WHERE id = auth.uid() 
              AND email IN ('naveensep14@gmail.com', 'admin@successbuds.com')
            )
          );
      `
    });

    if (policyError) {
      console.error('❌ Error creating policies:', policyError);
      return;
    }

    console.log('✅ RLS policies created successfully');

    // Grant permissions
    const { error: grantError } = await supabase.rpc('exec_sql', {
      sql: `
        -- Grant necessary permissions
        GRANT ALL ON question_reports TO authenticated;
        GRANT USAGE ON SCHEMA public TO authenticated;
      `
    });

    if (grantError) {
      console.error('❌ Error granting permissions:', grantError);
      return;
    }

    console.log('✅ Permissions granted successfully');

    console.log('\n🎉 Question reports table setup completed successfully!');
    console.log('\n📋 Next steps:');
    console.log('1. Test the question reporting functionality');
    console.log('2. Check the admin reports page at /admin/reports');
    console.log('3. Monitor student feedback and improve questions');

  } catch (error) {
    console.error('❌ Setup failed:', error);
  }
}

setupQuestionReports();
