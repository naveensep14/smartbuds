const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function addProfileColumns() {
  try {
    console.log('🚀 Adding student profile columns...');
    
    // Method 1: Try to add columns using a simple INSERT with default values
    console.log('📝 Method 1: Testing column addition...');
    
    try {
      // First, let's see what columns currently exist
      const { data: existingProfile, error: selectError } = await supabase
        .from('profiles')
        .select('*')
        .limit(1);
      
      if (selectError) {
        console.error('❌ Error selecting from profiles:', selectError);
        return;
      }
      
      console.log('✅ Current profiles table structure:', Object.keys(existingProfile[0] || {}));
      
      // Try to insert a test record with the new columns
      const { data: insertResult, error: insertError } = await supabase
        .from('profiles')
        .insert({
          id: '00000000-0000-0000-0000-000000000000',
          email: 'test@example.com',
          student_name: 'Test Student',
          grade: 'Class 5',
          board: 'CBSE',
          profile_completed: false
        })
        .select();
      
      if (insertError && insertError.code === '42703') {
        console.log('⚠️ Columns do not exist yet');
        console.log('📋 Please run the following SQL in your Supabase SQL Editor:');
        console.log(`
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
        `);
        
        console.log('📋 After running the SQL, also run these functions:');
        console.log(`
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
        `);
        
      } else if (insertError) {
        console.log('⚠️ Insert test failed:', insertError.message);
      } else {
        console.log('✅ Columns already exist and working');
        // Clean up test record
        await supabase
          .from('profiles')
          .delete()
          .eq('id', '00000000-0000-0000-0000-000000000000');
      }
      
    } catch (error) {
      console.error('❌ Error testing columns:', error);
    }
    
    console.log('🎉 Column addition verification completed!');
    
  } catch (error) {
    console.error('🚨 Setup failed:', error);
    process.exit(1);
  }
}

addProfileColumns();
