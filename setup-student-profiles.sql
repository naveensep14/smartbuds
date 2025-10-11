-- Setup student profiles with grade and board information
-- Run this in your Supabase SQL Editor

-- Add student profile fields to existing profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS student_name TEXT,
ADD COLUMN IF NOT EXISTS grade TEXT,
ADD COLUMN IF NOT EXISTS board TEXT DEFAULT 'CBSE',
ADD COLUMN IF NOT EXISTS profile_completed BOOLEAN DEFAULT FALSE;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_profile_completed ON profiles(profile_completed);
CREATE INDEX IF NOT EXISTS idx_profiles_grade ON profiles(grade);
CREATE INDEX IF NOT EXISTS idx_profiles_board ON profiles(board);

-- Update existing profiles to mark as incomplete
UPDATE profiles 
SET profile_completed = FALSE 
WHERE profile_completed IS NULL;

-- Create function to check if user profile is completed
CREATE OR REPLACE FUNCTION is_profile_completed(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = user_id 
    AND profile_completed = TRUE 
    AND student_name IS NOT NULL 
    AND grade IS NOT NULL 
    AND board IS NOT NULL
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get user's grade and board
CREATE OR REPLACE FUNCTION get_user_grade_board(user_id UUID)
RETURNS TABLE(grade TEXT, board TEXT) AS $$
BEGIN
  RETURN QUERY
  SELECT p.grade, p.board
  FROM profiles p
  WHERE p.id = user_id 
  AND p.profile_completed = TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update RLS policies to allow users to read their own profile completion status
CREATE POLICY "Allow users to read their own profile completion" ON profiles
  FOR SELECT USING (auth.uid() = id);

-- Create policy for admins to read all profiles (for future admin features)
CREATE POLICY "Allow admins to read all profiles" ON profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.email IN (
        'naveensep14@gmail.com',
        'admin@successbuds.com'
      )
    )
  );

-- Create function to complete user profile
CREATE OR REPLACE FUNCTION complete_user_profile(
  user_id UUID,
  student_name_param TEXT,
  grade_param TEXT,
  board_param TEXT
)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE profiles 
  SET 
    student_name = student_name_param,
    grade = grade_param,
    board = board_param,
    profile_completed = TRUE,
    updated_at = NOW()
  WHERE id = user_id;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION is_profile_completed(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_grade_board(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION complete_user_profile(UUID, TEXT, TEXT, TEXT) TO authenticated;
