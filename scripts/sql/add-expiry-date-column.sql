-- Add expiry date column to tests table for weekly tests
ALTER TABLE tests ADD COLUMN IF NOT EXISTS expiry_date TIMESTAMP WITH TIME ZONE;

-- Add comment to explain the column
COMMENT ON COLUMN tests.expiry_date IS 'Expiry date for weekly tests. Weekly tests expire exactly 1 week after they become available (on Sundays)';
