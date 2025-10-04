-- Create test_progress table to track user progress on tests
-- Run this in your Supabase SQL Editor

-- Create test_progress table
CREATE TABLE IF NOT EXISTS test_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_email TEXT NOT NULL,
  test_id TEXT NOT NULL,
  current_question_index INTEGER DEFAULT 0,
  selected_answers JSONB DEFAULT '{}',
  start_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_completed BOOLEAN DEFAULT FALSE,
  time_spent INTEGER DEFAULT 0, -- in seconds
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure one progress record per user per test
  UNIQUE(user_email, test_id)
);

-- Enable RLS
ALTER TABLE test_progress ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow users to read their own progress" ON test_progress
  FOR SELECT USING (auth.jwt() ->> 'email' = user_email);

CREATE POLICY "Allow users to insert their own progress" ON test_progress
  FOR INSERT WITH CHECK (auth.jwt() ->> 'email' = user_email);

CREATE POLICY "Allow users to update their own progress" ON test_progress
  FOR UPDATE USING (auth.jwt() ->> 'email' = user_email);

CREATE POLICY "Allow users to delete their own progress" ON test_progress
  FOR DELETE USING (auth.jwt() ->> 'email' = user_email);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_test_progress_user_email ON test_progress(user_email);
CREATE INDEX IF NOT EXISTS idx_test_progress_test_id ON test_progress(test_id);
CREATE INDEX IF NOT EXISTS idx_test_progress_updated_at ON test_progress(updated_at);

-- Function to clean up old incomplete progress (older than 7 days)
CREATE OR REPLACE FUNCTION cleanup_old_progress()
RETURNS void AS $$
BEGIN
  DELETE FROM test_progress 
  WHERE is_completed = FALSE 
  AND last_updated < NOW() - INTERVAL '7 days';
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_test_progress_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_test_progress_timestamp_trigger
  BEFORE UPDATE ON test_progress
  FOR EACH ROW
  EXECUTE FUNCTION update_test_progress_timestamp();
