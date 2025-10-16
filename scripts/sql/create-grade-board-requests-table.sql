-- Create grade_board_requests table
CREATE TABLE IF NOT EXISTS grade_board_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_email TEXT NOT NULL,
  user_name TEXT,
  requested_grade TEXT NOT NULL,
  requested_board TEXT NOT NULL,
  message TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'completed')),
  admin_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_grade_board_requests_status ON grade_board_requests(status);
CREATE INDEX IF NOT EXISTS idx_grade_board_requests_user_email ON grade_board_requests(user_email);
CREATE INDEX IF NOT EXISTS idx_grade_board_requests_created_at ON grade_board_requests(created_at);

-- Add RLS policies
ALTER TABLE grade_board_requests ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own requests
CREATE POLICY "Users can view their own requests" ON grade_board_requests
  FOR SELECT USING (auth.email() = user_email);

-- Policy: Users can insert their own requests
CREATE POLICY "Users can insert their own requests" ON grade_board_requests
  FOR INSERT WITH CHECK (auth.email() = user_email);

-- Policy: Admins can see all requests (this will be handled by service role)
-- No additional policy needed as service role bypasses RLS

-- Add comments
COMMENT ON TABLE grade_board_requests IS 'Stores user requests for new grade and board options';
COMMENT ON COLUMN grade_board_requests.user_email IS 'Email of the user making the request';
COMMENT ON COLUMN grade_board_requests.user_name IS 'Display name of the user';
COMMENT ON COLUMN grade_board_requests.requested_grade IS 'The grade level requested by the user';
COMMENT ON COLUMN grade_board_requests.requested_board IS 'The education board requested by the user';
COMMENT ON COLUMN grade_board_requests.message IS 'Additional message from the user';
COMMENT ON COLUMN grade_board_requests.status IS 'Status of the request: pending, approved, rejected, completed';
COMMENT ON COLUMN grade_board_requests.admin_notes IS 'Notes from admin about the request';
