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

async function debugProfileCompletion() {
  try {
    console.log('🔍 Debugging profile completion...');
    
    // Check if the columns exist
    console.log('📝 Step 1: Checking if profile columns exist...');
    
    try {
      const { data: testProfile, error: selectError } = await supabase
        .from('profiles')
        .select('student_name, grade, board, profile_completed')
        .limit(1);
      
      if (selectError && selectError.code === '42703') {
        console.log('❌ Columns do not exist! Need to run SQL setup.');
        console.log('📋 Run this SQL in Supabase SQL Editor:');
        console.log(`
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS student_name TEXT,
ADD COLUMN IF NOT EXISTS grade TEXT,
ADD COLUMN IF NOT EXISTS board TEXT DEFAULT 'CBSE',
ADD COLUMN IF NOT EXISTS profile_completed BOOLEAN DEFAULT FALSE;
        `);
        return;
      } else if (selectError) {
        console.log('❌ Error selecting profiles:', selectError);
        return;
      } else {
        console.log('✅ Columns exist');
        console.log('📊 Sample profile data:', testProfile);
      }
    } catch (error) {
      console.error('❌ Error checking columns:', error);
      return;
    }
    
    // Check if functions exist
    console.log('📝 Step 2: Checking if database functions exist...');
    
    try {
      const { data: functionTest, error: functionError } = await supabase
        .rpc('is_profile_completed', { user_id: '00000000-0000-0000-0000-000000000000' });
      
      if (functionError && functionError.code === 'PGRST202') {
        console.log('❌ Functions do not exist! Need to create them.');
        console.log('📋 Run this SQL in Supabase SQL Editor:');
        console.log(`
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
        `);
      } else if (functionError) {
        console.log('⚠️ Function exists but has issues:', functionError.message);
      } else {
        console.log('✅ Functions exist and working');
      }
    } catch (error) {
      console.error('❌ Error testing functions:', error);
    }
    
    // Test profile update
    console.log('📝 Step 3: Testing profile update...');
    
    try {
      // Get a real user ID for testing
      const { data: users, error: usersError } = await supabase
        .from('profiles')
        .select('id, email')
        .limit(1);
      
      if (usersError) {
        console.log('❌ Error getting users:', usersError);
        return;
      }
      
      if (users && users.length > 0) {
        const testUserId = users[0].id;
        console.log('🧪 Testing with user:', testUserId);
        
        const { data: updateResult, error: updateError } = await supabase
          .from('profiles')
          .update({
            student_name: 'Test Student',
            grade: 'Class 5',
            board: 'CBSE',
            profile_completed: true
          })
          .eq('id', testUserId)
          .select();
        
        if (updateError) {
          console.log('❌ Update test failed:', updateError);
        } else {
          console.log('✅ Update test successful:', updateResult);
          
          // Revert the test
          await supabase
            .from('profiles')
            .update({
              student_name: null,
              grade: null,
              board: null,
              profile_completed: false
            })
            .eq('id', testUserId);
          
          console.log('🔄 Test data reverted');
        }
      } else {
        console.log('⚠️ No users found in profiles table');
      }
    } catch (error) {
      console.error('❌ Error testing update:', error);
    }
    
    console.log('🎉 Debug completed!');
    
  } catch (error) {
    console.error('🚨 Debug failed:', error);
    process.exit(1);
  }
}

debugProfileCompletion();
