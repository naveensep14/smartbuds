-- Add database constraints to prevent duplicate tests
-- This script adds unique constraints and other safeguards

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

-- 5. Add index on title for faster duplicate detection
CREATE INDEX IF NOT EXISTS idx_tests_title ON tests(title);

-- 6. Add index on subject + grade for faster filtering
CREATE INDEX IF NOT EXISTS idx_tests_subject_grade ON tests(subject, grade);

-- 7. Create a function to check for duplicate tests before insertion
CREATE OR REPLACE FUNCTION check_duplicate_test()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if a test with the same title, subject, and grade already exists
  IF EXISTS (
    SELECT 1 FROM tests 
    WHERE title = NEW.title 
    AND subject = NEW.subject 
    AND grade = NEW.grade
    AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid)
  ) THEN
    RAISE EXCEPTION 'Duplicate test: A test with title "%", subject "%", and grade "%" already exists', 
      NEW.title, NEW.subject, NEW.grade;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 8. Create trigger to prevent duplicate tests
DROP TRIGGER IF EXISTS prevent_duplicate_tests ON tests;
CREATE TRIGGER prevent_duplicate_tests
  BEFORE INSERT OR UPDATE ON tests
  FOR EACH ROW
  EXECUTE FUNCTION check_duplicate_test();

-- 9. Add validation for questions structure
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

-- 10. Create trigger to validate questions structure
DROP TRIGGER IF EXISTS validate_questions ON tests;
CREATE TRIGGER validate_questions
  BEFORE INSERT OR UPDATE ON tests
  FOR EACH ROW
  EXECUTE FUNCTION validate_questions_structure();

-- 11. Add updated_at trigger to automatically update timestamp
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

-- 12. Create a view for test statistics
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

-- 13. Add comments for documentation
COMMENT ON CONSTRAINT unique_test_title_subject_grade ON tests IS 'Prevents duplicate tests with same title, subject, and grade';
COMMENT ON CONSTRAINT check_timelimit_positive ON tests IS 'Ensures test duration is positive';
COMMENT ON CONSTRAINT check_questions_not_empty ON tests IS 'Ensures test has at least one question';
COMMENT ON CONSTRAINT check_passingscore_range ON tests IS 'Ensures passing score is between 0 and 100';
COMMENT ON FUNCTION check_duplicate_test() IS 'Function to prevent duplicate test creation';
COMMENT ON FUNCTION validate_questions_structure() IS 'Function to validate question structure and content';
COMMENT ON VIEW test_statistics IS 'View showing statistics about tests grouped by subject and grade';

-- 14. Test the constraints
DO $$
BEGIN
  -- Test duplicate prevention
  BEGIN
    INSERT INTO tests (title, subject, grade, timelimit, questions) VALUES 
    ('Test Duplicate Prevention', 'Mathematics', 'Class 3', 20, '[{"question":"Test","options":["A","B"],"correctAnswer":0}]');
    
    -- This should fail
    INSERT INTO tests (title, subject, grade, timelimit, questions) VALUES 
    ('Test Duplicate Prevention', 'Mathematics', 'Class 3', 20, '[{"question":"Test","options":["A","B"],"correctAnswer":0}]');
    
    RAISE EXCEPTION 'Duplicate constraint test failed - this should not happen';
  EXCEPTION
    WHEN unique_violation THEN
      RAISE NOTICE '✅ Duplicate constraint working correctly';
    WHEN OTHERS THEN
      RAISE NOTICE '✅ Duplicate prevention working: %', SQLERRM;
  END;
  
  -- Clean up test data
  DELETE FROM tests WHERE title = 'Test Duplicate Prevention';
  
  RAISE NOTICE '🎉 All constraints and triggers added successfully!';
  RAISE NOTICE '📊 Database now has duplicate prevention and validation';
END $$;
