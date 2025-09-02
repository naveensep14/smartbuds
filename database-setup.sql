-- Create tests table
CREATE TABLE IF NOT EXISTS tests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  subject TEXT NOT NULL,
  grade TEXT NOT NULL,
  duration INTEGER NOT NULL,
  questions JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create results table
CREATE TABLE IF NOT EXISTS results (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  testId UUID REFERENCES tests(id) ON DELETE CASCADE,
  studentName TEXT NOT NULL,
  score INTEGER NOT NULL,
  totalQuestions INTEGER NOT NULL,
  correctAnswers INTEGER NOT NULL,
  answers JSONB NOT NULL,
  timeTaken INTEGER,
  completedAt TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_tests_subject ON tests(subject);
CREATE INDEX IF NOT EXISTS idx_tests_grade ON tests(grade);
CREATE INDEX IF NOT EXISTS idx_results_testId ON results("testId");
CREATE INDEX IF NOT EXISTS idx_results_studentName ON results("studentName");

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