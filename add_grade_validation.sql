-- Grade Validation Constraints and Triggers
-- This script adds validation to ensure consistent grade naming

-- First, let's add a check constraint for grade format
ALTER TABLE tests 
ADD CONSTRAINT check_grade_format 
CHECK (grade ~ '^\d+(st|nd|rd|th) Grade$');

-- Add a function to validate grade format
CREATE OR REPLACE FUNCTION validate_grade_format()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if grade follows the pattern: number + (st|nd|rd|th) + " Grade"
  IF NEW.grade !~ '^\d+(st|nd|rd|th) Grade$' THEN
    RAISE EXCEPTION 'Invalid grade format: %. Grade must follow format like "1st Grade", "2nd Grade", "3rd Grade", "4th Grade", etc.', NEW.grade;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to validate grade format on insert/update
DROP TRIGGER IF EXISTS trigger_validate_grade_format ON tests;
CREATE TRIGGER trigger_validate_grade_format
  BEFORE INSERT OR UPDATE ON tests
  FOR EACH ROW
  EXECUTE FUNCTION validate_grade_format();

-- Add a function to auto-correct common grade format issues
CREATE OR REPLACE FUNCTION auto_correct_grade_format()
RETURNS TRIGGER AS $$
BEGIN
  -- Auto-correct common grade format issues
  CASE NEW.grade
    WHEN 'Class 1' THEN NEW.grade := '1st Grade';
    WHEN 'Class 2' THEN NEW.grade := '2nd Grade';
    WHEN 'Class 3' THEN NEW.grade := '3rd Grade';
    WHEN 'Class 4' THEN NEW.grade := '4th Grade';
    WHEN 'Class 5' THEN NEW.grade := '5th Grade';
    WHEN 'Grade 1' THEN NEW.grade := '1st Grade';
    WHEN 'Grade 2' THEN NEW.grade := '2nd Grade';
    WHEN 'Grade 3' THEN NEW.grade := '3rd Grade';
    WHEN 'Grade 4' THEN NEW.grade := '4th Grade';
    WHEN 'Grade 5' THEN NEW.grade := '5th Grade';
    WHEN '1st' THEN NEW.grade := '1st Grade';
    WHEN '2nd' THEN NEW.grade := '2nd Grade';
    WHEN '3rd' THEN NEW.grade := '3rd Grade';
    WHEN '4th' THEN NEW.grade := '4th Grade';
    WHEN '5th' THEN NEW.grade := '5th Grade';
    ELSE
      -- If it doesn't match any known pattern, let the validation trigger handle it
      NULL;
  END CASE;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-correct grade format
DROP TRIGGER IF EXISTS trigger_auto_correct_grade_format ON tests;
CREATE TRIGGER trigger_auto_correct_grade_format
  BEFORE INSERT OR UPDATE ON tests
  FOR EACH ROW
  EXECUTE FUNCTION auto_correct_grade_format();

-- Add an index on grade for better performance
CREATE INDEX IF NOT EXISTS idx_tests_grade ON tests(grade);

-- Add a function to get valid grade options (for UI reference)
CREATE OR REPLACE FUNCTION get_valid_grades()
RETURNS TABLE(grade_option TEXT) AS $$
BEGIN
  RETURN QUERY
  SELECT unnest(ARRAY[
    '1st Grade',
    '2nd Grade', 
    '3rd Grade',
    '4th Grade',
    '5th Grade',
    '6th Grade',
    '7th Grade',
    '8th Grade',
    '9th Grade',
    '10th Grade',
    '11th Grade',
    '12th Grade'
  ]) AS grade_option;
END;
$$ LANGUAGE plpgsql;

-- Add a comment explaining the grade format
COMMENT ON COLUMN tests.grade IS 'Grade level in format "Xth Grade" (e.g., "1st Grade", "2nd Grade", "3rd Grade", "4th Grade", etc.)';

-- Test the validation with some sample data
DO $$
BEGIN
  -- Test valid grades (should work)
  BEGIN
    INSERT INTO tests (title, description, subject, grade, board, timelimit, questions) 
    VALUES ('Test Valid Grade', 'Test', 'Math', '3rd Grade', 'CBSE', 30, '[]'::jsonb);
    RAISE NOTICE 'Valid grade test passed';
    DELETE FROM tests WHERE title = 'Test Valid Grade';
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Valid grade test failed: %', SQLERRM;
  END;
  
  -- Test invalid grades (should fail)
  BEGIN
    INSERT INTO tests (title, description, subject, grade, board, timelimit, questions) 
    VALUES ('Test Invalid Grade', 'Test', 'Math', 'Class 3', 'CBSE', 30, '[]'::jsonb);
    RAISE NOTICE 'Invalid grade test failed - should have been caught';
    DELETE FROM tests WHERE title = 'Test Invalid Grade';
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Invalid grade test passed - correctly rejected: %', SQLERRM;
  END;
  
  -- Test auto-correction
  BEGIN
    INSERT INTO tests (title, description, subject, grade, board, timelimit, questions) 
    VALUES ('Test Auto Correct', 'Test', 'Math', 'Class 3', 'CBSE', 30, '[]'::jsonb);
    RAISE NOTICE 'Auto-correction test - should have converted Class 3 to 3rd Grade';
    DELETE FROM tests WHERE title = 'Test Auto Correct';
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Auto-correction test failed: %', SQLERRM;
  END;
END $$;

-- Display current grade distribution
SELECT 
  grade,
  COUNT(*) as test_count,
  STRING_AGG(title, ', ' ORDER BY title LIMIT 3) as sample_titles
FROM tests 
GROUP BY grade 
ORDER BY grade;
