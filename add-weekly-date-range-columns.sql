-- Add start_date and end_date columns to tests table for weekly tests
ALTER TABLE tests ADD COLUMN IF NOT EXISTS start_date VARCHAR(10);
ALTER TABLE tests ADD COLUMN IF NOT EXISTS end_date VARCHAR(10);

-- Add comments to explain the columns
COMMENT ON COLUMN tests.start_date IS 'Start date for weekly tests in dd/mm format (e.g., 15/03)';
COMMENT ON COLUMN tests.end_date IS 'End date for weekly tests in dd/mm format (e.g., 21/03)';

-- Add check constraint to ensure dates are in dd/mm format
ALTER TABLE tests ADD CONSTRAINT check_date_format CHECK (
  start_date IS NULL OR start_date ~ '^[0-9]{2}/[0-9]{2}$'
);
ALTER TABLE tests ADD CONSTRAINT check_end_date_format CHECK (
  end_date IS NULL OR end_date ~ '^[0-9]{2}/[0-9]{2}$'
);
