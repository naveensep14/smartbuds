-- Create test_progress table
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
GRANT USAGE ON SCHEMA public TO authenticated;
