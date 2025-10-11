const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials');
  console.error('NEXT_PUBLIC_SUPABASE_URL:', !!supabaseUrl);
  console.error('SUPABASE_SERVICE_ROLE_KEY:', !!supabaseServiceKey);
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupStudentProfiles() {
  try {
    console.log('🚀 Starting student profiles setup...');
    
    // Step 1: Add columns to profiles table
    console.log('📝 Step 1: Adding columns to profiles table...');
    
    try {
      // Check if columns already exist by trying to select them
      const { data: existingProfile, error: selectError } = await supabase
        .from('profiles')
        .select('student_name, grade, board, profile_completed')
        .limit(1);
      
      if (selectError && selectError.code === 'PGRST116') {
        console.log('⚠️ Columns do not exist, need to add them manually');
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
        return;
      } else if (selectError) {
        console.error('❌ Error checking existing columns:', selectError);
        return;
      } else {
        console.log('✅ Columns already exist in profiles table');
      }
    } catch (error) {
      console.error('❌ Error checking columns:', error);
      return;
    }
    
    // Step 2: Test the database functions
    console.log('📝 Step 2: Testing database functions...');
    
    try {
      // Test if functions exist by calling them
      const { data: testResult, error: functionError } = await supabase
        .rpc('is_profile_completed', { user_id: '00000000-0000-0000-0000-000000000000' });
      
      if (functionError && functionError.code === 'PGRST202') {
        console.log('⚠️ Database functions do not exist, need to create them manually');
        console.log('📋 Please run the following SQL in your Supabase SQL Editor:');
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
        return;
      } else if (functionError) {
        console.log('⚠️ Functions exist but may have issues:', functionError.message);
      } else {
        console.log('✅ Database functions are working');
      }
    } catch (error) {
      console.error('❌ Error testing functions:', error);
    }
    
    // Step 3: Test profile completion
    console.log('📝 Step 3: Testing profile completion...');
    
    try {
      // Test updating a profile
      const { data: updateResult, error: updateError } = await supabase
        .from('profiles')
        .update({ 
          student_name: 'Test Student',
          grade: 'Class 5',
          board: 'CBSE',
          profile_completed: true 
        })
        .eq('id', '00000000-0000-0000-0000-000000000000')
        .select();
      
      if (updateError && updateError.code === 'PGRST116') {
        console.log('⚠️ Cannot test update - user does not exist');
      } else if (updateError) {
        console.log('⚠️ Update test failed:', updateError.message);
      } else {
        console.log('✅ Profile update test successful');
      }
    } catch (error) {
      console.error('❌ Error testing profile update:', error);
    }
    
    console.log('🎉 Student profiles setup verification completed!');
    console.log('📋 If you see any warnings above, please run the provided SQL in your Supabase SQL Editor');
    
  } catch (error) {
    console.error('🚨 Setup verification failed:', error);
    process.exit(1);
  }
}

setupStudentProfiles();
