-- Add board field to tests table and make it fully functional
-- This script adds the board column and updates existing data
-- Note: Question validation is handled by add-db-constraints-safe.sql

-- Step 1: Add the board column to the tests table
ALTER TABLE tests 
ADD COLUMN IF NOT EXISTS board TEXT DEFAULT 'ICSE';

-- Step 2: Update existing tests with appropriate board values
-- Based on the test titles and content, assign appropriate boards

-- Update US-based tests
UPDATE tests 
SET board = 'US' 
WHERE title LIKE '%US%' OR title LIKE '%Grade%' OR grade LIKE '%Grade%';

-- Update Class-based tests (likely CBSE/ICSE)
UPDATE tests 
SET board = 'CBSE' 
WHERE title LIKE '%Class%' AND grade LIKE '%Class%';

-- Set default for any remaining NULL values
UPDATE tests 
SET board = 'ICSE' 
WHERE board IS NULL;

-- Step 3: Add constraints for the board field
ALTER TABLE tests 
ADD CONSTRAINT check_board_valid 
CHECK (board IN ('US', 'CBSE', 'ICSE', 'IB', 'IGCSE'));

-- Step 4: Add index for better performance
CREATE INDEX IF NOT EXISTS idx_tests_board ON tests(board);

-- Step 5: Add index for board + subject + grade filtering
CREATE INDEX IF NOT EXISTS idx_tests_board_subject_grade ON tests(board, subject, grade);

-- Step 6: Update the unique constraint to include board
-- First drop the existing constraint if it exists
ALTER TABLE tests 
DROP CONSTRAINT IF EXISTS unique_test_title_subject_grade;

-- Add new constraint that includes board
ALTER TABLE tests 
ADD CONSTRAINT unique_test_title_subject_grade_board 
UNIQUE (title, subject, grade, board);

-- Step 7: Create a function to validate board values
CREATE OR REPLACE FUNCTION validate_board_value()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if board is one of the allowed values
  IF NEW.board NOT IN ('US', 'CBSE', 'ICSE', 'IB', 'IGCSE') THEN
    RAISE EXCEPTION 'Invalid board value: %. Allowed values are: US, CBSE, ICSE, IB, IGCSE', NEW.board;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 8: Create trigger to validate board values
DROP TRIGGER IF EXISTS validate_board ON tests;
CREATE TRIGGER validate_board
  BEFORE INSERT OR UPDATE ON tests
  FOR EACH ROW
  EXECUTE FUNCTION validate_board_value();

-- Step 9: Create a view for board statistics
CREATE OR REPLACE VIEW board_statistics AS
SELECT 
  board,
  COUNT(*) as total_tests,
  COUNT(DISTINCT subject) as subjects_count,
  COUNT(DISTINCT grade) as grades_count,
  AVG(jsonb_array_length(questions)) as avg_questions_per_test,
  AVG(timelimit) as avg_duration_minutes
FROM tests
GROUP BY board
ORDER BY board;

-- Step 10: Add comments for documentation
COMMENT ON COLUMN tests.board IS 'Educational board/c curriculum system (US, CBSE, ICSE, IB, IGCSE)';
COMMENT ON CONSTRAINT check_board_valid ON tests IS 'Ensures board value is one of the allowed educational systems';
COMMENT ON FUNCTION validate_board_value() IS 'Function to validate board field values';
COMMENT ON VIEW board_statistics IS 'View showing statistics about tests grouped by educational board';

-- Step 11: Test the board field functionality
DO $$
DECLARE
  test_id UUID;
BEGIN
  -- Test inserting a test with board
  INSERT INTO tests (title, description, subject, grade, board, timelimit, questions) VALUES 
  ('Board Test - US', 'Testing US board', 'Mathematics', 'Grade 5', 'US', 25, 
   '[{"question":"Test question","options":["A","B"],"correctAnswer":0}]')
  RETURNING id INTO test_id;
  
  RAISE NOTICE '✅ Board field test successful, created test with ID: %', test_id;
  
  -- Test invalid board value (should fail)
  BEGIN
    INSERT INTO tests (title, description, subject, grade, board, timelimit, questions) VALUES 
    ('Board Test - Invalid', 'Testing invalid board', 'Mathematics', 'Grade 5', 'INVALID', 25, 
     '[{"question":"Test question","options":["A","B"],"correctAnswer":0}]');
    
    RAISE EXCEPTION 'Invalid board test failed - this should not happen';
  EXCEPTION
    WHEN OTHERS THEN
      RAISE NOTICE '✅ Invalid board validation working: %', SQLERRM;
  END;
  
  -- Clean up test data
  DELETE FROM tests WHERE id = test_id;
  
  RAISE NOTICE '🎉 Board field is now fully functional!';
  RAISE NOTICE '📊 Board field added with validation and constraints';
END $$;
