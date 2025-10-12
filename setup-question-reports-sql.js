console.log('🔄 Question Reports Database Setup');
console.log('\n📋 Please run the following SQL in your Supabase SQL Editor:');
console.log('\n' + '='.repeat(80));

const sql = `-- Create question_reports table
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

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_question_reports_user_id ON question_reports(user_id);
CREATE INDEX IF NOT EXISTS idx_question_reports_test_id ON question_reports(test_id);
CREATE INDEX IF NOT EXISTS idx_question_reports_status ON question_reports(status);
CREATE INDEX IF NOT EXISTS idx_question_reports_issue_type ON question_reports(issue_type);
CREATE INDEX IF NOT EXISTS idx_question_reports_reported_at ON question_reports(reported_at);

-- Enable RLS
ALTER TABLE question_reports ENABLE ROW LEVEL SECURITY;

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

-- Grant necessary permissions
GRANT ALL ON question_reports TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;`;

console.log(sql);
console.log('='.repeat(80));

console.log('\n📋 Instructions:');
console.log('1. Copy the SQL above');
console.log('2. Go to your Supabase dashboard (https://supabase.com/dashboard)');
console.log('3. Navigate to SQL Editor');
console.log('4. Paste and run the SQL');
console.log('5. Verify the table was created successfully');

console.log('\n🎯 After running the SQL, the question reporting system will be ready!');
console.log('\n✨ Features that will be available:');
console.log('• Students can report question issues during tests');
console.log('• Students can report issues in test review');
console.log('• Admins can view and manage reports at /admin/reports');
console.log('• Full test context captured for easy review');
console.log('• 7 different issue types to categorize problems');
