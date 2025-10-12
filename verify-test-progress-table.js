require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function verifyTestProgressTable() {
  console.log('🔍 Verifying test_progress table...\n');

  try {
    // Try to query the table
    const { data, error } = await supabase
      .from('test_progress')
      .select('count')
      .limit(1);

    if (error) {
      if (error.code === '42P01') {
        console.log('❌ Table test_progress does not exist!\n');
        console.log('📋 To create the table, run this SQL in Supabase SQL Editor:\n');
        console.log('='.repeat(80));
        console.log(getCreateTableSQL());
        console.log('='.repeat(80));
        return false;
      }
      throw error;
    }

    console.log('✅ Table test_progress exists!');
    
    // Check if there are any progress records
    const { count, error: countError } = await supabase
      .from('test_progress')
      .select('*', { count: 'exact', head: true });
    
    if (!countError) {
      console.log(`✅ Current progress records in database: ${count || 0}`);
      
      // Get some stats
      const { data: incompleteData } = await supabase
        .from('test_progress')
        .select('*')
        .eq('is_completed', false);
      
      console.log(`📊 In-progress tests: ${incompleteData?.length || 0}`);
    }
    
    console.log('\n✨ Test progress table is properly configured!');
    return true;

  } catch (error) {
    console.error('❌ Error verifying table:', error.message);
    return false;
  }
}

function getCreateTableSQL() {
  return `-- Create test_progress table
CREATE TABLE IF NOT EXISTS test_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_email TEXT NOT NULL,
  test_id UUID REFERENCES tests(id) ON DELETE CASCADE NOT NULL,
  current_question_index INTEGER DEFAULT 0,
  selected_answers JSONB DEFAULT '{}'::jsonb,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_completed BOOLEAN DEFAULT FALSE,
  time_spent INTEGER DEFAULT 0,
  UNIQUE(user_email, test_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_test_progress_user_email ON test_progress(user_email);
CREATE INDEX IF NOT EXISTS idx_test_progress_test_id ON test_progress(test_id);
CREATE INDEX IF NOT EXISTS idx_test_progress_is_completed ON test_progress(is_completed);
CREATE INDEX IF NOT EXISTS idx_test_progress_last_updated ON test_progress(last_updated);

-- Enable RLS
ALTER TABLE test_progress ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own progress" ON test_progress;
DROP POLICY IF EXISTS "Users can insert their own progress" ON test_progress;
DROP POLICY IF EXISTS "Users can update their own progress" ON test_progress;
DROP POLICY IF EXISTS "Users can delete their own progress" ON test_progress;

-- RLS Policies
-- Users can view their own progress
CREATE POLICY "Users can view their own progress" ON test_progress
  FOR SELECT USING (auth.jwt() ->> 'email' = user_email);

-- Users can insert their own progress
CREATE POLICY "Users can insert their own progress" ON test_progress
  FOR INSERT WITH CHECK (auth.jwt() ->> 'email' = user_email);

-- Users can update their own progress
CREATE POLICY "Users can update their own progress" ON test_progress
  FOR UPDATE USING (auth.jwt() ->> 'email' = user_email);

-- Users can delete their own progress
CREATE POLICY "Users can delete their own progress" ON test_progress
  FOR DELETE USING (auth.jwt() ->> 'email' = user_email);

-- Grant permissions
GRANT ALL ON test_progress TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;`;
}

// Run the verification
verifyTestProgressTable().then((success) => {
  process.exit(success ? 0 : 1);
});

