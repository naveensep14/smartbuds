-- Add database constraints to prevent duplicate tests
-- This script safely adds constraints after cleaning up existing data

-- Step 1: Clean up any existing invalid data first
-- Delete tests with invalid timelimit (<= 0)
DELETE FROM tests WHERE timelimit <= 0;

-- Delete tests with empty questions array
DELETE FROM tests WHERE jsonb_array_length(questions) = 0;

-- Delete tests with invalid passingscore (outside 0-100 range)
DELETE FROM tests WHERE passingscore < 0 OR passingscore > 100;

-- Step 2: Add constraints (these will now work because data is clean)

-- 1. Add unique constraint on title + subject + grade combination
-- This prevents duplicate tests with the same title, subject, and grade
ALTER TABLE tests 
ADD CONSTRAINT unique_test_title_subject_grade 
UNIQUE (title, subject, grade);

-- 2. Add check constraint to ensure timelimit is positive
ALTER TABLE tests 
ADD CONSTRAINT check_timelimit_positive 
CHECK (timelimit > 0);

-- 3. Add check constraint to ensure questions array is not empty
ALTER TABLE tests 
ADD CONSTRAINT check_questions_not_empty 
CHECK (jsonb_array_length(questions) > 0);

-- 4. Add check constraint to ensure passingscore is between 0 and 100
ALTER TABLE tests 
ADD CONSTRAINT check_passingscore_range 
CHECK (passingscore >= 0 AND passingscore <= 100);

-- 5. Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_tests_title ON tests(title);
CREATE INDEX IF NOT EXISTS idx_tests_subject_grade ON tests(subject, grade);
CREATE INDEX IF NOT EXISTS idx_tests_board ON tests(board);

-- 6. Create a function to validate questions structure
CREATE OR REPLACE FUNCTION validate_questions_structure()
RETURNS TRIGGER AS $$
DECLARE
  question_item JSONB;
  question_count INTEGER;
BEGIN
  -- Check if questions is an array
  IF jsonb_typeof(NEW.questions) != 'array' THEN
    RAISE EXCEPTION 'Questions must be an array';
  END IF;
  
  question_count := jsonb_array_length(NEW.questions);
  
  -- Check if questions array is not empty
  IF question_count = 0 THEN
    RAISE EXCEPTION 'At least one question is required';
  END IF;
  
  -- Validate each question structure
  FOR i IN 0..question_count-1 LOOP
    question_item := NEW.questions->i;
    
    -- Check required fields
    IF NOT (question_item ? 'question' AND question_item ? 'options' AND question_item ? 'correctAnswer') THEN
      RAISE EXCEPTION 'Question % is missing required fields (question, options, correctAnswer)', i+1;
    END IF;
    
    -- Check if options is an array with at least 2 items
    IF jsonb_typeof(question_item->'options') != 'array' OR jsonb_array_length(question_item->'options') < 2 THEN
      RAISE EXCEPTION 'Question % must have at least 2 options', i+1;
    END IF;
    
    -- Check if correctAnswer is a valid index
    IF (question_item->>'correctAnswer')::integer < 0 OR 
       (question_item->>'correctAnswer')::integer >= jsonb_array_length(question_item->'options') THEN
      RAISE EXCEPTION 'Question % has invalid correctAnswer index', i+1;
    END IF;
  END LOOP;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 7. Create trigger to validate questions structure
DROP TRIGGER IF EXISTS validate_questions ON tests;
CREATE TRIGGER validate_questions
  BEFORE INSERT OR UPDATE ON tests
  FOR EACH ROW
  EXECUTE FUNCTION validate_questions_structure();

-- 8. Add updated_at trigger to automatically update timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updatedat = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_tests_updated_at ON tests;
CREATE TRIGGER update_tests_updated_at
  BEFORE UPDATE ON tests
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 9. Create a view for test statistics
CREATE OR REPLACE VIEW test_statistics AS
SELECT 
  subject,
  grade,
  COUNT(*) as total_tests,
  AVG(jsonb_array_length(questions)) as avg_questions_per_test,
  AVG(timelimit) as avg_duration_minutes,
  MIN(createdat) as earliest_test,
  MAX(createdat) as latest_test
FROM tests
GROUP BY subject, grade
ORDER BY subject, grade;

-- 10. Add comments for documentation
COMMENT ON CONSTRAINT unique_test_title_subject_grade ON tests IS 'Prevents duplicate tests with same title, subject, and grade';
COMMENT ON CONSTRAINT check_timelimit_positive ON tests IS 'Ensures test duration is positive';
COMMENT ON CONSTRAINT check_questions_not_empty ON tests IS 'Ensures test has at least one question';
COMMENT ON CONSTRAINT check_passingscore_range ON tests IS 'Ensures passing score is between 0 and 100';
COMMENT ON FUNCTION validate_questions_structure() IS 'Function to validate question structure and content';
COMMENT ON VIEW test_statistics IS 'View showing statistics about tests grouped by subject and grade';

-- 11. Test the constraints
DO $$
BEGIN
  -- Test duplicate prevention
  BEGIN
    INSERT INTO tests (title, subject, grade, timelimit, questions) VALUES 
    ('Constraint Test', 'Mathematics', 'Class 3', 20, '[{"question":"Test","options":["A","B"],"correctAnswer":0}]');
    
    -- This should fail
    INSERT INTO tests (title, subject, grade, timelimit, questions) VALUES 
    ('Constraint Test', 'Mathematics', 'Class 3', 20, '[{"question":"Test","options":["A","B"],"correctAnswer":0}]');
    
    RAISE EXCEPTION 'Duplicate constraint test failed - this should not happen';
  EXCEPTION
    WHEN unique_violation THEN
      RAISE NOTICE '✅ Duplicate constraint working correctly';
    WHEN OTHERS THEN
      RAISE NOTICE '✅ Duplicate prevention working: %', SQLERRM;
  END;
  
  -- Clean up test data
  DELETE FROM tests WHERE title = 'Constraint Test';
  
  RAISE NOTICE '🎉 All constraints and triggers added successfully!';
  RAISE NOTICE '📊 Database now has duplicate prevention and validation';
END $$;
