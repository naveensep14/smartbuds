#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function testTableCreation() {
  console.log('🧪 Testing Grade/Board Requests Table Creation');
  console.log('==============================================');
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing required environment variables');
    process.exit(1);
  }
  
  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  
  try {
    // Test if we can access the table (it might already exist)
    console.log('🔍 Testing if grade_board_requests table exists...');
    
    const { data, error } = await supabase
      .from('grade_board_requests')
      .select('*')
      .limit(1);
    
    if (error && error.code === 'PGRST116') {
      console.log('❌ Table does not exist (PGRST116 error)');
      console.log('');
      console.log('📋 Manual Migration Required:');
      console.log('================================');
      console.log('');
      console.log('1. Go to your Supabase dashboard:');
      console.log('   https://supabase.com/dashboard');
      console.log('');
      console.log('2. Select your project');
      console.log('');
      console.log('3. Navigate to SQL Editor (left sidebar)');
      console.log('');
      console.log('4. Copy and paste this SQL:');
      console.log('');
      console.log('```sql');
      
      const fs = require('fs');
      const path = require('path');
      const migrationFile = path.join(__dirname, 'scripts', 'sql', 'create-grade-board-requests-table.sql');
      const sqlContent = fs.readFileSync(migrationFile, 'utf8');
      console.log(sqlContent);
      
      console.log('```');
      console.log('');
      console.log('5. Click "Run" to execute the SQL');
      console.log('');
      console.log('6. Verify the table was created by checking Table Editor');
      console.log('');
      console.log('7. Test the grade/board request feature in your app');
      
    } else if (error) {
      console.log('⚠️  Unexpected error:', error.message);
      console.log('The table might exist but have different permissions');
    } else {
      console.log('✅ Table already exists!');
      console.log('📊 Found', data?.length || 0, 'records');
      console.log('');
      console.log('🎉 Migration already completed!');
      console.log('');
      console.log('📋 Next steps:');
      console.log('1. Test the grade/board request feature in your app');
      console.log('2. The table is ready to receive requests');
    }
    
  } catch (err) {
    console.error('❌ Error testing table:', err.message);
    console.log('');
    console.log('📋 Manual Migration Required:');
    console.log('================================');
    console.log('');
    console.log('1. Go to your Supabase dashboard:');
    console.log('   https://supabase.com/dashboard');
    console.log('');
    console.log('2. Select your project');
    console.log('');
    console.log('3. Navigate to SQL Editor (left sidebar)');
    console.log('');
    console.log('4. Copy and paste this SQL:');
    console.log('');
    
    const fs = require('fs');
    const path = require('path');
    const migrationFile = path.join(__dirname, 'scripts', 'sql', 'create-grade-board-requests-table.sql');
    const sqlContent = fs.readFileSync(migrationFile, 'utf8');
    console.log(sqlContent);
    
    console.log('');
    console.log('5. Click "Run" to execute the SQL');
  }
}

testTableCreation();
