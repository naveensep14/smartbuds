-- Corrected database setup for SmartBuds
-- This matches the column names expected by the application code

-- Create tests table
CREATE TABLE IF NOT EXISTS tests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  subject TEXT NOT NULL,
  grade TEXT NOT NULL,
  board TEXT NOT NULL DEFAULT 'ICSE',
  timelimit INTEGER NOT NULL,  -- Changed from 'duration' to 'timelimit'
  questions JSONB NOT NULL,
  createdat TIMESTAMP WITH TIME ZONE DEFAULT NOW(),  -- Changed from 'created_at' to 'createdat'
  updatedat TIMESTAMP WITH TIME ZONE DEFAULT NOW()  -- Changed from 'updated_at' to 'updatedat'
);

-- Create results table
CREATE TABLE IF NOT EXISTS results (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  testId UUID REFERENCES tests(id) ON DELETE CASCADE,  -- Changed from 'test_id' to 'testId'
  studentName TEXT NOT NULL,  -- Changed from 'student_name' to 'studentName'
  score INTEGER NOT NULL,
  totalQuestions INTEGER NOT NULL,  -- Changed from 'total_questions' to 'totalQuestions'
  correctAnswers INTEGER NOT NULL,  -- Changed from 'correct_answers' to 'correctAnswers'
  answers JSONB NOT NULL,
  timeTaken INTEGER,  -- Changed from 'time_taken' to 'timeTaken'
  completedAt TIMESTAMP WITH TIME ZONE DEFAULT NOW()  -- Changed from 'completed_at' to 'completedAt'
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_tests_subject ON tests(subject);
CREATE INDEX IF NOT EXISTS idx_tests_grade ON tests(grade);
CREATE INDEX IF NOT EXISTS idx_tests_board ON tests(board);
CREATE INDEX IF NOT EXISTS idx_results_test_id ON results(testId);
CREATE INDEX IF NOT EXISTS idx_results_student_name ON results(studentName);

-- Enable Row Level Security (RLS)
ALTER TABLE tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE results ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access to tests
CREATE POLICY "Allow public read access to tests" ON tests
  FOR SELECT USING (true);

-- Create policies for public insert access to tests (for admin)
CREATE POLICY "Allow public insert access to tests" ON tests
  FOR INSERT WITH CHECK (true);

-- Create policies for public update access to tests (for admin)
CREATE POLICY "Allow public update access to tests" ON tests
  FOR UPDATE USING (true);

-- Create policies for public delete access to tests (for admin)
CREATE POLICY "Allow public delete access to tests" ON tests
  FOR DELETE USING (true);

-- Create policies for public insert access to results
CREATE POLICY "Allow public insert access to results" ON results
  FOR INSERT WITH CHECK (true);

-- Create policies for public read access to results
CREATE POLICY "Allow public read access to results" ON results
  FOR SELECT USING (true);

-- Verify tables were created
SELECT 'Tests table created successfully' as status;
SELECT 'Results table created successfully' as status;
