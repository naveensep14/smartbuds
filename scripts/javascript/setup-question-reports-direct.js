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
    // Check if table already exists
    const { data: existingTables, error: checkError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .eq('table_name', 'question_reports');

    if (checkError) {
      console.error('❌ Error checking existing tables:', checkError);
      return;
    }

    if (existingTables && existingTables.length > 0) {
      console.log('✅ Table question_reports already exists');
      return;
    }

    console.log('📋 Please run the following SQL in your Supabase SQL Editor:');
    console.log('\n' + '='.repeat(80));
    console.log('-- Create question_reports table');
    console.log('CREATE TABLE IF NOT EXISTS question_reports (');
    console.log('  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,');
    console.log('  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,');
    console.log('  test_id UUID REFERENCES tests(id) ON DELETE CASCADE NOT NULL,');
    console.log('  question_id TEXT NOT NULL,');
    console.log('  question_text TEXT NOT NULL,');
    console.log('  question_options JSONB NOT NULL,');
    console.log('  correct_answer INTEGER NOT NULL,');
    console.log('  user_answer INTEGER,');
    console.log('  issue_type TEXT NOT NULL CHECK (issue_type IN (');
    console.log("    'incorrect_answer',");
    console.log("    'unclear_question',");
    console.log("    'typo_error',");
    console.log("    'wrong_explanation',");
    console.log("    'inappropriate_content',");
    console.log("    'technical_error',");
    console.log("    'other'");
    console.log('  )),');
    console.log('  description TEXT,');
    console.log('  test_title TEXT NOT NULL,');
    console.log('  test_subject TEXT NOT NULL,');
    console.log('  test_grade TEXT NOT NULL,');
    console.log('  test_board TEXT NOT NULL,');
    console.log('  test_chapter INTEGER,');
    console.log('  test_duration INTEGER,');
    console.log('  reported_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),');
    console.log("  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved', 'dismissed')),");
    console.log('  admin_notes TEXT,');
    console.log('  resolved_at TIMESTAMP WITH TIME ZONE,');
    console.log('  resolved_by UUID REFERENCES auth.users(id)');
    console.log(');');
    console.log('\n-- Create indexes for better performance');
    console.log('CREATE INDEX IF NOT EXISTS idx_question_reports_user_id ON question_reports(user_id);');
    console.log('CREATE INDEX IF NOT EXISTS idx_question_reports_test_id ON question_reports(test_id);');
    console.log('CREATE INDEX IF NOT EXISTS idx_question_reports_status ON question_reports(status);');
    console.log('CREATE INDEX IF NOT EXISTS idx_question_reports_issue_type ON question_reports(issue_type);');
    console.log('CREATE INDEX IF NOT EXISTS idx_question_reports_reported_at ON question_reports(reported_at);');
    console.log('\n-- Enable RLS');
    console.log('ALTER TABLE question_reports ENABLE ROW LEVEL SECURITY;');
    console.log('\n-- RLS Policies');
    console.log('-- Users can view their own reports');
    console.log('CREATE POLICY "Users can view their own reports" ON question_reports');
    console.log('  FOR SELECT USING (auth.uid() = user_id);');
    console.log('\n-- Users can insert their own reports');
    console.log('CREATE POLICY "Users can insert their own reports" ON question_reports');
    console.log('  FOR INSERT WITH CHECK (auth.uid() = user_id);');
    console.log('\n-- Admins can view all reports');
    console.log('CREATE POLICY "Admins can view all reports" ON question_reports');
    console.log('  FOR ALL USING (');
    console.log('    EXISTS (');
    console.log('      SELECT 1 FROM profiles ');
    console.log('      WHERE id = auth.uid() ');
    console.log("      AND email IN ('naveensep14@gmail.com', 'admin@successbuds.com')");
    console.log('    )');
    console.log('  );');
    console.log('\n-- Admins can update report status');
    console.log('CREATE POLICY "Admins can update reports" ON question_reports');
    console.log('  FOR UPDATE USING (');
    console.log('    EXISTS (');
    console.log('      SELECT 1 FROM profiles ');
    console.log('      WHERE id = auth.uid() ');
    console.log("      AND email IN ('naveensep14@gmail.com', 'admin@successbuds.com')");
    console.log('    )');
    console.log('  );');
    console.log('\n-- Grant necessary permissions');
    console.log('GRANT ALL ON question_reports TO authenticated;');
    console.log('GRANT USAGE ON SCHEMA public TO authenticated;');
    console.log('='.repeat(80));
    
    console.log('\n📋 Instructions:');
    console.log('1. Copy the SQL above');
    console.log('2. Go to your Supabase dashboard');
    console.log('3. Navigate to SQL Editor');
    console.log('4. Paste and run the SQL');
    console.log('5. Verify the table was created successfully');
    
    console.log('\n🎯 After running the SQL, the question reporting system will be ready!');

  } catch (error) {
    console.error('❌ Setup failed:', error);
  }
}

setupQuestionReports();
