#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function runMigration() {
  console.log('🚀 Running Grade/Board Requests Table Migration');
  console.log('===============================================');
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing required environment variables');
    process.exit(1);
  }
  
  console.log('✅ Environment variables found');
  console.log('📡 Supabase URL:', supabaseUrl);
  console.log('');
  
  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  
  // Test connection first
  try {
    console.log('🔍 Testing database connection...');
    const { data, error } = await supabase.from('profiles').select('count').limit(1);
    if (error) {
      console.error('❌ Database connection failed:', error.message);
      process.exit(1);
    }
    console.log('✅ Database connection successful');
    console.log('');
  } catch (err) {
    console.error('❌ Connection test failed:', err.message);
    process.exit(1);
  }
  
  // Create the table using individual operations
  console.log('📝 Creating grade_board_requests table...');
  
  try {
    // First, let's check if the table already exists
    const { data: existingTables, error: tableCheckError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .eq('table_name', 'grade_board_requests');
    
    if (tableCheckError) {
      console.log('⚠️  Could not check existing tables, proceeding with creation...');
    } else if (existingTables && existingTables.length > 0) {
      console.log('✅ Table grade_board_requests already exists!');
      console.log('');
      console.log('🎉 Migration already completed!');
      console.log('');
      console.log('📋 Next steps:');
      console.log('1. Test the grade/board request feature in your app');
      console.log('2. Check the table in your Supabase dashboard');
      return;
    }
    
    // Since we can't execute raw SQL directly, let's try to create a simple test record
    // This will fail if the table doesn't exist, which is what we want
    console.log('🔧 Attempting to create table structure...');
    
    // We'll use the REST API directly to execute SQL
    const createTableSQL = `
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
    `;
    
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'apikey': supabaseServiceKey,
      },
      body: JSON.stringify({
        sql: createTableSQL
      })
    });
    
    if (response.ok) {
      console.log('✅ Table created successfully!');
      
      // Now create indexes
      console.log('📝 Creating indexes...');
      const indexSQL = `
        CREATE INDEX IF NOT EXISTS idx_grade_board_requests_status ON grade_board_requests(status);
        CREATE INDEX IF NOT EXISTS idx_grade_board_requests_user_email ON grade_board_requests(user_email);
        CREATE INDEX IF NOT EXISTS idx_grade_board_requests_created_at ON grade_board_requests(created_at);
      `;
      
      const indexResponse = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseServiceKey}`,
          'apikey': supabaseServiceKey,
        },
        body: JSON.stringify({
          sql: indexSQL
        })
      });
      
      if (indexResponse.ok) {
        console.log('✅ Indexes created successfully!');
      } else {
        console.log('⚠️  Indexes may already exist or failed to create');
      }
      
      // Enable RLS
      console.log('📝 Enabling Row Level Security...');
      const rlsSQL = `ALTER TABLE grade_board_requests ENABLE ROW LEVEL SECURITY;`;
      
      const rlsResponse = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseServiceKey}`,
          'apikey': supabaseServiceKey,
        },
        body: JSON.stringify({
          sql: rlsSQL
        })
      });
      
      if (rlsResponse.ok) {
        console.log('✅ RLS enabled successfully!');
      } else {
        console.log('⚠️  RLS may already be enabled');
      }
      
      console.log('');
      console.log('🎉 Migration completed successfully!');
      console.log('');
      console.log('📋 Next steps:');
      console.log('1. Check your Supabase dashboard → Table Editor');
      console.log('2. Look for the "grade_board_requests" table');
      console.log('3. Test the request feature in your app');
      console.log('4. The table should have the following columns:');
      console.log('   - id (UUID, Primary Key)');
      console.log('   - user_email (TEXT)');
      console.log('   - user_name (TEXT)');
      console.log('   - requested_grade (TEXT)');
      console.log('   - requested_board (TEXT)');
      console.log('   - message (TEXT)');
      console.log('   - status (TEXT, default: pending)');
      console.log('   - admin_notes (TEXT)');
      console.log('   - created_at (TIMESTAMP)');
      console.log('   - updated_at (TIMESTAMP)');
      
    } else {
      const errorText = await response.text();
      console.error('❌ Migration failed:', errorText);
      console.log('');
      console.log('💡 Manual Migration Required:');
      console.log('1. Go to your Supabase dashboard');
      console.log('2. Navigate to SQL Editor');
      console.log('3. Copy and paste the contents of: scripts/sql/create-grade-board-requests-table.sql');
      console.log('4. Execute the SQL');
    }
    
  } catch (error) {
    console.error('❌ Error during migration:', error.message);
    console.log('');
    console.log('💡 Manual Migration Required:');
    console.log('1. Go to your Supabase dashboard');
    console.log('2. Navigate to SQL Editor');
    console.log('3. Copy and paste the contents of: scripts/sql/create-grade-board-requests-table.sql');
    console.log('4. Execute the SQL');
  }
}

runMigration();
