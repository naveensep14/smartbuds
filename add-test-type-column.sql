-- Add test type column to tests table
ALTER TABLE tests ADD COLUMN IF NOT EXISTS type VARCHAR(20) DEFAULT 'coursework';

-- Add check constraint to ensure only valid test types
ALTER TABLE tests ADD CONSTRAINT check_test_type CHECK (type IN ('coursework', 'weekly'));

-- Update existing tests to have a default type (optional)
-- UPDATE tests SET type = 'coursework' WHERE type IS NULL;
