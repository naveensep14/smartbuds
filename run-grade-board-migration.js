#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function runMigration() {
  console.log('🚀 Running Grade/Board Requests Table Migration');
  console.log('===============================================');
  
  // Check if environment variables are set
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing required environment variables:');
    console.error('   NEXT_PUBLIC_SUPABASE_URL:', !!supabaseUrl);
    console.error('   SUPABASE_SERVICE_ROLE_KEY:', !!supabaseServiceKey);
    console.error('');
    console.error('Please ensure these are set in your .env.local file');
    process.exit(1);
  }
  
  console.log('✅ Environment variables found');
  console.log('📡 Supabase URL:', supabaseUrl);
  console.log('');
  
  // Create Supabase client with service role key
  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  
  // Read the SQL migration file
  const fs = require('fs');
  const path = require('path');
  
  const migrationFile = path.join(__dirname, 'scripts', 'sql', 'create-grade-board-requests-table.sql');
  
  try {
    const sqlContent = fs.readFileSync(migrationFile, 'utf8');
    console.log('📄 Migration file loaded:', migrationFile);
    console.log('');
    
    // Split SQL into individual statements
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    console.log(`🔧 Executing ${statements.length} SQL statements...`);
    console.log('');
    
    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.trim()) {
        console.log(`📝 Statement ${i + 1}: ${statement.substring(0, 50)}...`);
        
        try {
          const { data, error } = await supabase.rpc('exec_sql', { sql: statement });
          
          if (error) {
            console.error(`❌ Error in statement ${i + 1}:`, error.message);
            // Continue with other statements
          } else {
            console.log(`✅ Statement ${i + 1} executed successfully`);
          }
        } catch (err) {
          console.error(`❌ Exception in statement ${i + 1}:`, err.message);
        }
      }
    }
    
    console.log('');
    console.log('🎉 Migration completed!');
    console.log('');
    console.log('📋 Next steps:');
    console.log('1. Check your Supabase dashboard to verify the table was created');
    console.log('2. Test the grade/board request feature in your app');
    console.log('3. The table "grade_board_requests" should now be available');
    
  } catch (error) {
    console.error('❌ Error reading migration file:', error.message);
    process.exit(1);
  }
}

// Alternative approach using direct SQL execution
async function runMigrationDirect() {
  console.log('🚀 Running Grade/Board Requests Table Migration (Direct)');
  console.log('=======================================================');
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing required environment variables');
    process.exit(1);
  }
  
  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  
  // Execute the migration SQL directly
  const migrationSQL = `
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
  `;
  
  try {
    console.log('📝 Executing migration SQL...');
    
    // Use the REST API to execute SQL
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'apikey': supabaseServiceKey,
      },
      body: JSON.stringify({
        sql: migrationSQL
      })
    });
    
    if (response.ok) {
      console.log('✅ Migration executed successfully!');
      console.log('');
      console.log('📋 Verification:');
      console.log('1. Check your Supabase dashboard → Table Editor');
      console.log('2. Look for the "grade_board_requests" table');
      console.log('3. Test the request feature in your app');
    } else {
      const errorText = await response.text();
      console.error('❌ Migration failed:', errorText);
    }
    
  } catch (error) {
    console.error('❌ Error executing migration:', error.message);
  }
}

// Try the direct approach first
runMigrationDirect().catch(() => {
  console.log('');
  console.log('🔄 Trying alternative approach...');
  runMigration();
});
