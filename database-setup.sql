-- Create tests table
CREATE TABLE IF NOT EXISTS tests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  subject TEXT NOT NULL,
  grade TEXT NOT NULL,
  board TEXT NOT NULL DEFAULT 'ICSE',
  duration INTEGER NOT NULL,
  questions JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create results table
CREATE TABLE IF NOT EXISTS results (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  test_id UUID REFERENCES tests(id) ON DELETE CASCADE,
  student_name TEXT NOT NULL,
  score INTEGER NOT NULL,
  total_questions INTEGER NOT NULL,
  correct_answers INTEGER NOT NULL,
  answers JSONB NOT NULL,
  time_taken INTEGER,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_tests_subject ON tests(subject);
CREATE INDEX IF NOT EXISTS idx_tests_grade ON tests(grade);
CREATE INDEX IF NOT EXISTS idx_results_test_id ON results(test_id);
CREATE INDEX IF NOT EXISTS idx_results_student_name ON results(student_name);

-- Enable Row Level Security (RLS)
ALTER TABLE tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE results ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access to tests
CREATE POLICY "Allow public read access to tests" ON tests
  FOR SELECT USING (true);

-- Create policies for public insert access to results
CREATE POLICY "Allow public insert access to results" ON results
  FOR INSERT WITH CHECK (true);

-- Create policies for public read access to results
CREATE POLICY "Allow public read access to results" ON results
  FOR SELECT USING (true); 