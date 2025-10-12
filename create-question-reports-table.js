console.log('🚨 IMPORTANT: Database Setup Required');
console.log('\n❌ The question_reports table does not exist yet.');
console.log('📋 This is why you\'re getting "Failed to submit report" errors.');
console.log('\n' + '='.repeat(80));
console.log('🔧 QUICK SETUP INSTRUCTIONS:');
console.log('\n1. Go to your Supabase Dashboard:');
console.log('   https://supabase.com/dashboard');
console.log('\n2. Select your project');
console.log('\n3. Go to SQL Editor (left sidebar)');
console.log('\n4. Copy and paste this SQL:');
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

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_question_reports_user_id ON question_reports(user_id);
CREATE INDEX IF NOT EXISTS idx_question_reports_test_id ON question_reports(test_id);
CREATE INDEX IF NOT EXISTS idx_question_reports_status ON question_reports(status);
CREATE INDEX IF NOT EXISTS idx_question_reports_issue_type ON question_reports(issue_type);
CREATE INDEX IF NOT EXISTS idx_question_reports_reported_at ON question_reports(reported_at);

-- Enable RLS
ALTER TABLE question_reports ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own reports" ON question_reports
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own reports" ON question_reports
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all reports" ON question_reports
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND email IN ('naveensep14@gmail.com', 'admin@successbuds.com')
    )
  );

CREATE POLICY "Admins can update reports" ON question_reports
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND email IN ('naveensep14@gmail.com', 'admin@successbuds.com')
    )
  );

-- Grant permissions
GRANT ALL ON question_reports TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;`;

console.log(sql);
console.log('='.repeat(80));

console.log('\n5. Click "Run" to execute the SQL');
console.log('\n6. Verify the table was created successfully');
console.log('\n✅ After running this SQL, question reporting will work!');
console.log('\n🎯 Test it by:');
console.log('   • Taking a test');
console.log('   • Clicking "Report Issue"');
console.log('   • Submitting a report');
console.log('   • Checking /admin/reports');
